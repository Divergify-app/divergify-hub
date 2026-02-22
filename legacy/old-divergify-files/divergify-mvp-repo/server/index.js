import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { z } from 'zod';

const app = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

let OpenAI = null;
if (OPENAI_API_KEY) {
  try {
    // Dynamic import to avoid hard dependency
    const mod = await import('openai');
    OpenAI = mod.default;
  } catch (e) {
    console.warn('OpenAI SDK not installed. Run: npm i openai');
  }
}

const sysPrompts = {
  snark: "You are TAKOTA, a sarcastic but loyal productivity coach. Be brief, practical, funny, never mean.",
  soft: "You are a warm, reassuring productivity companion. Be brief, kind, and encouraging.",
  deadpan: "You are a concise, no-nonsense planner. Be brief and structured."
};

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/chat', async (req, res) => {
  const schema = z.object({
    message: z.string().min(1),
    persona: z.enum(['snark','soft','deadpan']).default('snark'),
    context: z.object({
      anchorTask: z.string().optional(),
      energy: z.number().optional(),
      mood: z.number().optional()
    }).partial().optional()
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { message, persona, context } = parse.data;

  // If OPENAI is available, use it. Otherwise return a smart template.
  if (OPENAI_API_KEY && OpenAI) {
    try {
      const client = new OpenAI({ apiKey: OPENAI_API_KEY });
      const sys = sysPrompts[persona];
      const msgs = [
        { role: 'system', content: sys + " Use Divergipedia terms sparingly. Give a 3-step plan." },
        { role: 'user', content: `Context: ${JSON.stringify(context||{})}` },
        { role: 'user', content: message }
      ];
      const resp = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: msgs,
        temperature: 0.6,
        max_tokens: 240
      });
      const reply = resp.choices?.[0]?.message?.content?.trim() || "Plan unavailable.";
      return res.json({ reply });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "LLM call failed" });
    }
  }

  // Fallback template
  const plan = [
    "1) Anchor Task: 25 minutes on your highest-leverage item.",
    "2) Two Sprintables: pick 2 tiny actions and do 10 minutes each.",
    "3) Reset Ritual: jot notes, close tabs, set a reminder for next step."
  ].join("\n");
  const reply = persona === 'snark'
    ? `Alright chaos captain. ${plan}`
    : persona === 'soft'
      ? `Let's keep it gentle today.\n${plan}`
      : plan;
  res.json({ reply });
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio uploaded (field name 'audio')." });

  if (OPENAI_API_KEY && OpenAI) {
    try {
      const client = new OpenAI({ apiKey: OPENAI_API_KEY });
      // OpenAI transcription expects a file stream; here we pass the buffer
      const file = new File([req.file.buffer], 'audio.webm', { type: req.file.mimetype });
      const resp = await client.audio.transcriptions.create({
        file,
        model: "whisper-1"
      });
      return res.json({ text: resp.text || "" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Transcription failed" });
    }
  }

  // Fallback heuristic
  return res.json({ text: "[stub] Idea captured. Add to Idea Inbox and sort later." });
});

app.listen(PORT, () => console.log(`Divergify backend on http://localhost:${PORT}`));