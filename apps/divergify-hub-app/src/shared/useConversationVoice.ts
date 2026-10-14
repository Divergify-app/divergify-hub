import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition as NativeSpeech } from "@capgo/capacitor-speech-recognition";
import { finalTranscript, type SpeechResults } from "./conversation";

type Recognition = {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((event: { results: SpeechResults }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type RecognitionConstructor = new () => Recognition;
function browserRecognition() {
  const speechWindow = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

export function useConversationVoice(onTranscript: (text: string) => void, privacyOn: boolean) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const generation = useRef(0);
  const deliver = useRef(onTranscript);
  const blocked = useRef(privacyOn);
  const final = useRef("");
  deliver.current = onTranscript;
  blocked.current = privacyOn;

  const silence = useCallback(() => {
    generation.current += 1;
    if (recognition.current) {
      recognition.current.onend = null;
      recognition.current.onresult = null;
      recognition.current.onerror = null;
      recognition.current.abort();
      recognition.current = null;
    }
    if (Capacitor.isNativePlatform()) void NativeSpeech.stop().catch(() => undefined);
    window.speechSynthesis?.cancel();
    setListening(false);
    setSpeaking(false);
  }, []);

  useEffect(() => { if (privacyOn) silence(); }, [privacyOn, silence]);
  useEffect(() => {
    const onHidden = () => { if (document.hidden) silence(); };
    document.addEventListener("visibilitychange", onHidden);
    return () => { document.removeEventListener("visibilitychange", onHidden); silence(); };
  }, [silence]);

  const speak = useCallback((text: string) => {
    if (blocked.current || !window.speechSynthesis) {
      setNotice(blocked.current ? "Tinfoil Hat is on. Voice is off; typing still works." : "Spoken replies aren’t available here. You can read the reply below.");
      return;
    }
    silence();
    const token = generation.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    const voice = window.speechSynthesis.getVoices().find(v => v.localService && v.lang.startsWith("en"));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => { if (token === generation.current) setSpeaking(true); };
    utterance.onend = () => { if (token === generation.current) setSpeaking(false); };
    utterance.onerror = () => { if (token === generation.current) { setSpeaking(false); setNotice("Audio stopped. Tap Hear reply to try again."); } };
    window.speechSynthesis.speak(utterance);
  }, [silence]);

  const start = useCallback(async () => {
    silence();
    setNotice("");
    if (blocked.current) { setNotice("Tinfoil Hat is on. Voice is off; typing still works."); return; }
    setDraft("");
    final.current = "";
    const token = generation.current;
    if (Capacitor.isNativePlatform()) {
      try {
        const permission = await NativeSpeech.requestPermissions();
        if (token !== generation.current || blocked.current) return;
        if (permission.speechRecognition !== "granted") { setNotice("Microphone permission wasn’t granted. You can type instead."); return; }
        const availability = await NativeSpeech.available();
        if (token !== generation.current || blocked.current) return;
        if (!availability.available) { setNotice("Voice isn’t available on this device. You can type instead."); return; }
        setListening(true);
        const result = await NativeSpeech.start({ language: "en-US", maxResults: 1, popup: true, partialResults: false, prompt: "What’s on your mind?" });
        if (token !== generation.current || blocked.current) return;
        setListening(false);
        const text = result.matches?.[0]?.trim();
        if (text) { setDraft(text); deliver.current(text); } else setNotice("I didn’t catch anything. Try again or type.");
      } catch {
        if (token === generation.current) { setListening(false); setNotice("Voice stopped. You can try again or type."); }
      }
      return;
    }
    const Constructor = browserRecognition();
    if (!Constructor) { setNotice("This browser doesn’t support voice input. Use your keyboard microphone or type."); return; }
    const instance = new Constructor();
    recognition.current = instance;
    instance.lang = "en-US";
    instance.continuous = true;
    instance.interimResults = true;
    let failed = false;
    instance.onresult = event => {
      if (token !== generation.current || blocked.current) return;
      final.current = finalTranscript(event.results);
      setDraft(Array.from(event.results).map(r => r[0]?.transcript ?? "").join(" ").trim());
    };
    instance.onerror = event => {
      if (token !== generation.current) return;
      failed = true;
      setNotice(event.error === "not-allowed" ? "Microphone permission wasn’t granted. You can type instead." : "Voice stopped. Your captured words are still below.");
      setListening(false);
    };
    instance.onend = () => {
      if (token !== generation.current || blocked.current) return;
      recognition.current = null;
      setListening(false);
      if (!failed && final.current.trim()) deliver.current(final.current);
      else if (!failed) setNotice("I didn’t catch anything. Try again or type.");
    };
    try { instance.start(); setListening(true); }
    catch { recognition.current = null; setNotice("Voice couldn’t start. Try again or type."); }
  }, [silence]);

  const finish = useCallback(() => {
    if (recognition.current) recognition.current.stop();
    else if (Capacitor.isNativePlatform()) void NativeSpeech.stop().catch(() => undefined);
  }, []);

  return { listening, speaking, draft, notice, start, finish, silence, speak };
}
