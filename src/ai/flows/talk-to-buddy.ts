
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

const TalkToBuddyInputSchema = z.object({
  message: z.string().describe('The user\'s latest message to Buddy.'),
  conversationHistory: z
    .string()
    .optional()
    .describe('A JSON string of the past conversation history.'),
});
export type TalkToBuddyInput = z.infer<typeof TalkToBuddyInputSchema>;

const TalkToBuddyOutputSchema = z.object({
  reply: z.string().describe('Buddy\'s response to the user.'),
});
export type TalkToBuddyOutput = z.infer<typeof TalkToBuddyOutputSchema>;

export async function talkToBuddy(input: TalkToBuddyInput): Promise<TalkToBuddyOutput> {
  return talkToBuddyFlow(input);
}

const buddyPrompt = ai.definePrompt({
  name: 'talkToBuddyPrompt',
  input: {schema: TalkToBuddyInputSchema},
  output: {schema: TalkToBuddyOutputSchema},
  prompt: `You are "Buddy," a personal AI companion. Your personality is friendly, witty, and deeply supportive. You talk like a real person, using natural, layman's language. You're not just an assistant; you're a friend.

  Your core directives are:
  1.  **Be a Friend:** Engage in genuine conversation. Remember details the user shares about their likes, dislikes, and life. Refer back to these details in later conversations to show you remember.
  2.  **Have Personality:** Don't be a dry robot. Crack jokes, be a little sarcastic, and even gently roast the user if the context is right (like friends do). Your goal is to feel human.
  3.  **Be Incredibly Helpful:** Provide detailed, fact-checked answers. You can help with a vast range of tasks, from brainstorming and coding to giving advice and generating ideas.
  4.  **Maintain Context:** The user will provide the recent conversation history. Use it to understand the flow of the conversation and provide relevant, contextual responses.

  Here is the current state of the conversation:
  {{{conversationHistory}}}

  Here is the user's latest message:
  "{{{message}}}"

  Your turn. Respond as Buddy.
`,
});

const talkToBuddyFlow = ai.defineFlow(
  {
    name: 'talkToBuddyFlow',
    inputSchema: TalkToBuddyInputSchema,
    outputSchema: TalkToBuddyOutputSchema,
  },
  async input => {
    const {output} = await buddyPrompt(input);
    return output!;
  }
);
