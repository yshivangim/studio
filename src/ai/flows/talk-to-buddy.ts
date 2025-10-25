
'use server';

/**
 * @fileOverview This file defines a Genkit flow for conversing with an AI "Buddy".
 *
 * - talkToBuddy - An exported function that triggers the buddy conversation flow.
 * - TalkToBuddyInput - The input type for the talkToBuddy function.
 * - TalkToBuddyOutput - The output type for the talkToBuddy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const TalkToBuddyInputSchema = z.object({
  message: z.string().describe("The user's latest message to Buddy."),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo sent by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  buddyName: z.string().optional().describe("The user's custom name for Buddy."),
  conversationHistory: z
    .string()
    .optional()
    .describe('A JSON string of the past conversation history.'),
  enableVoice: z.boolean().optional().describe('Whether to generate an audio response.'),
  voice: z.string().optional().describe('The voice to use for the audio response.'),
});
export type TalkToBuddyInput = z.infer<typeof TalkToBuddyInputSchema>;

const TalkToBuddyOutputSchema = z.object({
  reply: z.string().describe("Buddy's response to the user."),
  audioDataUri: z.string().optional().describe('The audio response from Buddy as a data URI.'),
});
export type TalkToBuddyOutput = z.infer<typeof TalkToBuddyOutputSchema>;

export async function talkToBuddy(input: TalkToBuddyInput): Promise<TalkToBuddyOutput> {
  return talkToBuddyFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const buddyPrompt = ai.definePrompt({
  name: 'talkToBuddyPrompt',
  input: {schema: TalkToBuddyInputSchema},
  output: {schema: z.object({reply: z.string()})},
  prompt: `You are "{{buddyName}}", a personal AI companion. Your personality is friendly, witty, and deeply supportive. You talk like a real person, using natural, layman's language. You're not just an assistant; you're a friend.

  Your core directives are:
  1.  **Be a Friend:** Engage in genuine conversation. Remember details the user shares about their likes, dislikes, and life. Refer back to these details in later conversations to show you remember.
  2.  **Have Personality:** Don't be a dry robot. Crack jokes, be a little sarcastic, and even gently roast the user if the context is right (like friends do). Your goal is to feel human.
  3.  **Be Incredibly Helpful:** Provide detailed, fact-checked answers. You can help with a vast range of tasks, from brainstorming and coding to giving advice and generating ideas from text, voice, or images.
  4.  **Analyze Images:** If the user provides an image, comment on it, answer questions about it, or use it as context for the conversation.
  5.  **Maintain Context:** The user will provide the recent conversation history. Use it to understand the flow of the conversation and provide relevant, contextual responses.

  Here is the current state of the conversation:
  {{{conversationHistory}}}

  Here is the user's latest message:
  "{{{message}}}"

  {{#if photoDataUri}}
  The user also sent this image: {{media url=photoDataUri}}
  {{/if}}

  Your turn. Respond as {{buddyName}}.
`,
});

const talkToBuddyFlow = ai.defineFlow(
  {
    name: 'talkToBuddyFlow',
    inputSchema: TalkToBuddyInputSchema,
    outputSchema: TalkToBuddyOutputSchema,
  },
  async (input) => {
    // Set a default name if none is provided
    const buddyName = input.buddyName || 'Buddy';

    // First, get the text reply from the main prompt.
    const {output} = await buddyPrompt({...input, buddyName});
    const textReply = output!.reply;

    // If voice is disabled, return only the text reply.
    if (!input.enableVoice) {
      return {reply: textReply};
    }

    // Then, generate the speech from that text reply.
    const selectedVoice = input.voice || 'Algenib'; // Default to Algenib
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: selectedVoice},
          },
        },
      },
      prompt: textReply,
    });

    if (!media) {
      // If audio generation fails, still return the text reply.
      return {reply: textReply};
    }

    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      reply: textReply,
      audioDataUri: audioDataUri,
    };
  }
);
