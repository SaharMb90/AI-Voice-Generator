import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface GenerateVoiceRequest {
  text: string;
  voiceName?: string; // Puck, Charon, Kore, Fenrir, Zephyr
  persona?: string;
  languageMode?: 'english-italian-accent' | 'italian-native';
  intensity?: 'subtle' | 'authentic' | 'passionate';
  customStyle?: string;
  model?: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';
}

function buildStyleDescription(
  persona: string | undefined,
  intensity: 'subtle' | 'authentic' | 'passionate' | undefined,
  languageMode: 'english-italian-accent' | 'italian-native' | undefined,
  customStyle?: string
): string {
  if (customStyle && customStyle.trim().length > 0) {
    return customStyle.trim();
  }

  const isNative = languageMode === 'italian-native';

  if (isNative) {
    switch (persona) {
      case 'chef':
        return 'Native Italian speaker with enthusiastic culinary passion, animated kitchen energy, warm and expressive Italian pronunciation.';
      case 'nonna':
        return 'Native elderly Italian grandmother with a sweet, comforting, maternal cadence, gentle warmth, and nostalgic melody.';
      case 'sofia':
        return 'Native Milanese Italian speaker, chic, elegant, poised, melodic and articulate modern Italian diction.';
      case 'marco':
      case 'cinematic':
        return 'Deep, resonant native Italian speaker with cinematic gravitas, poetic pauses, and rich dramatic cadence.';
      case 'isabella':
        return 'Lyrical Tuscan native speaker, graceful cadence, soothing vocal warmth, storytelling charm.';
      case 'matteo':
      default:
        return 'Fluent native Italian speaker, warm natural intonation, authentic rhythmic melody, and vibrant conversational phrasing.';
    }
  }

  // English with Italian accent
  let intensityPhrase = 'Authentic, charming Italian accent speaking English with melodic cadence, musical rhythm, and Mediterranean warmth';
  if (intensity === 'subtle') {
    intensityPhrase = 'Subtle, charming Italian accent speaking English with light melodic cadence, crisp consonants, and relaxed European warmth';
  } else if (intensity === 'passionate') {
    intensityPhrase = 'Vibrant, animated Italian accent speaking English with expressive Mediterranean hand-gestured passion, musical pitch variations, and heartfelt enthusiasm';
  }

  switch (persona) {
    case 'chef':
      return `${intensityPhrase}. Enthusiastic Italian chef persona, bursting with culinary joy, animated pauses, and mouth-watering delight.`;
    case 'nonna':
      return `${intensityPhrase}. Heartwarming Italian grandmother persona, deeply gentle, affectionate, rhythmic, cozy and maternal.`;
    case 'sofia':
      return `${intensityPhrase}. Sophisticated Milanese professional, stylish European lilt, articulate and refined cadence.`;
    case 'marco':
    case 'cinematic':
      return `${intensityPhrase}. Deep cinematic voice with dramatic Mediterranean pauses, suave authority, and storytelling gravitas.`;
    case 'isabella':
      return `${intensityPhrase}. Tuscan storyteller and wine expert, lyrical and romantic cadence, soothing warmth and poetic melody.`;
    case 'matteo':
    default:
      return `${intensityPhrase}. Friendly Roman local guide, charismatic, welcoming, expressive cadence with natural Italian charm.`;
  }
}

// POST /api/voice/generate
app.post('/api/voice/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      voiceName = 'Puck',
      persona = 'matteo',
      languageMode = 'english-italian-accent',
      intensity = 'authentic',
      customStyle,
      model = 'gemini-3.8-flash-lite-tts',
    } = req.body as GenerateVoiceRequest;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text prompt is required.' });
      return;
    }

    if (text.length > 2500) {
      res.status(400).json({ error: 'Text exceeds maximum length of 2500 characters.' });
      return;
    }

    const styleDescription = buildStyleDescription(persona, intensity, languageMode, customStyle);

    // Valid voice names for Gemini TTS
    const allowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const selectedVoice = allowedVoices.includes(voiceName) ? voiceName : 'Puck';

    // Model selection
    const selectedModel = model === 'gemini-3.8-flash-tts'
      ? 'gemini-3.8-flash-tts'
      : 'gemini-3.8-flash-lite-tts';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: styleDescription,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'audio/wav';

    if (!base64Audio) {
      res.status(502).json({
        error: 'The AI model completed the request but did not return audio data. Please try again.',
      });
      return;
    }

    res.json({
      audioBase64: base64Audio,
      mimeType,
      text: text.trim(),
      voiceName: selectedVoice,
      persona,
      languageMode,
      intensity,
      styleDescription,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error generating Italian voice:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate audio. Please check your prompt and try again.',
    });
  }
});

// POST /api/voice/italianize
// Rewrites or enriches text into charming Italian-flavored phrasing or authentic Italian
app.post('/api/voice/italianize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, mode = 'accented-english' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required.' });
      return;
    }

    const systemPrompt = mode === 'native-italian'
      ? `You are an expert native Italian copywriter and linguist. 
Translate the provided text into beautiful, natural, idiomatic Italian that flows melodiously when read aloud.
Return JSON with:
{
  "transformedText": "The natural Italian translation with poetic/expressive cadence",
  "explanation": "Brief explanation of vocabulary and nuance choices",
  "italianExpressions": ["list of key Italian phrases used"]
}`
      : `You are an Italian dialogue and accent coach.
The user wants to speak this text with a delightful, authentic Italian cadence and Mediterranean charm.
Adapt the text so that it retains the original message, but naturally incorporates characteristic Italian conversational rhythms, charming interjections (e.g. 'Allora...', 'Guarda!', 'Per favore', 'Mamma mia', 'Come si dice...'), expressive punctuation, and cadence cues that make Text-To-Speech deliver a rich Italian accent.
Return JSON with:
{
  "transformedText": "The adapted English script optimized for Italian accent delivery",
  "explanation": "Why these phrasing adjustments enhance the Italian rhythm",
  "italianExpressions": ["key expressions or conversational cues included"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in italianize endpoint:', error);
    res.status(500).json({ error: error?.message || 'Failed to adapt text.' });
  }
});

// Vite middleware or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');

  if (isProd && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
