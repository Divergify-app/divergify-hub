import { useCallback, useMemo, useState } from 'react';
import usePersistentState from './usepersistentstate';
import { streamVoiceResponse } from '../services/voiceClient';
import { personaProfiles } from '../config/ai';

const buildConversationId = () => `takota-${Date.now()}`;

const initialState = {
  persona: personaProfiles.takota.persona,
  convoId: buildConversationId(),
  messages: [],
};

export default function useVoiceChat() {
  const [state, setState] = usePersistentState('takotaVoiceChat', initialState);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastError, setLastError] = useState(null);

  const persona = useMemo(() => state.persona ?? personaProfiles.takota.persona, [state.persona]);

  const updateMessage = useCallback(
    (id, patch) => {
      setState((prev) => ({
        ...prev,
        messages: (prev.messages ?? []).map((msg) =>
          msg.id === id ? { ...msg, ...patch } : msg
        ),
      }));
    },
    [setState]
  );

  const sendTranscript = useCallback(
    async (transcript, clientSettings) => {
      const trimmed = transcript.trim();
      if (!trimmed) return;

      const convoId = state.convoId || buildConversationId();
      const userId = `user-${Date.now()}`;
      const aiId = `ai-${Date.now()}`;

      setLastError(null);
      setState((prev) => ({
        ...prev,
        convoId,
        messages: [
          ...(prev.messages ?? []),
          { id: userId, role: 'user', content: trimmed, createdAt: Date.now() },
          {
            id: aiId,
            role: 'ai',
            content: '',
            status: 'streaming',
            createdAt: Date.now(),
          },
        ],
      }));

      setIsStreaming(true);
      try {
        const stateFromStream = await streamVoiceResponse({
          transcript: trimmed,
          persona,
          convoId,
          clientSettings,
          onToken: ({ text, speak, ssml, traceId }) => {
            updateMessage(aiId, {
              content: text,
              status: 'streaming',
              speak,
              ssml,
              traceId,
              updatedAt: Date.now(),
            });
          },
          onDone: ({ text, speak, ssml, traceId }) => {
            updateMessage(aiId, {
              content: text,
              status: 'done',
              speak,
              ssml,
              traceId,
              updatedAt: Date.now(),
            });
          },
          onError: (errorFrame) => {
            const message = errorFrame?.message || errorFrame?.error || 'Voice request failed.';
            setLastError(message);
            updateMessage(aiId, {
              status: 'error',
              content: message,
              traceId: errorFrame?.traceId,
            });
          },
        });

        if (stateFromStream?.text) {
          updateMessage(aiId, {
            content: stateFromStream.text,
            status: 'done',
            speak: stateFromStream.speak,
            ssml: stateFromStream.ssml,
            traceId: stateFromStream.traceId,
            updatedAt: Date.now(),
          });
        }
      } catch (err) {
        const message = err?.message || 'Unable to reach Takota right now.';
        setLastError(message);
        updateMessage(aiId, { status: 'error', content: message, updatedAt: Date.now() });
      } finally {
        setIsStreaming(false);
      }
    },
    [persona, setState, state.convoId, updateMessage]
  );

  const resetConversation = useCallback(() => {
    setState({
      persona: personaProfiles.takota.persona,
      convoId: buildConversationId(),
      messages: [],
    });
    setLastError(null);
  }, [setState]);

  return {
    persona,
    convoId: state.convoId,
    messages: state.messages ?? [],
    isStreaming,
    lastError,
    sendTranscript,
    resetConversation,
  };
}
