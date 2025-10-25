'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GENAI_API_KEY,
  })],
  model: 'googleai/gemini-2.5-flash',
});
