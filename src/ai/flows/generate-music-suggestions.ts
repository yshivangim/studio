'use server';

/**
 * @fileOverview A music suggestion AI agent.
 *
 * - generateMusicSuggestions - A function that handles the music suggestion process.
 * - GenerateMusicSuggestionsInput - The input type for the generateMusicSuggestions function.
 * - GenerateMusicSuggestionsOutput - The return type for the generateMusicSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMusicSuggestionsInputSchema = z.object({
  listeningHabits: z
    .string()
    .describe('The user listening habits, including genres, artists, and songs.'),
  mood: z.string().describe('The current mood of the user.'),
  activity: z.string().describe('The current activity of the user.'),
});
export type GenerateMusicSuggestionsInput = z.infer<typeof GenerateMusicSuggestionsInputSchema>;

const GenerateMusicSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of music suggestions based on the user input.'),
});
export type GenerateMusicSuggestionsOutput = z.infer<typeof GenerateMusicSuggestionsOutputSchema>;

export async function generateMusicSuggestions(
  input: GenerateMusicSuggestionsInput
): Promise<GenerateMusicSuggestionsOutput> {
  return generateMusicSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMusicSuggestionsPrompt',
  input: {schema: GenerateMusicSuggestionsInputSchema},
  output: {schema: GenerateMusicSuggestionsOutputSchema},
  prompt: `You are a music expert and you recommend music to the user based on their listening habits, mood, and activity.

Listening habits: {{{listeningHabits}}}
Mood: {{{mood}}}
Activity: {{{activity}}}

Suggest some songs or artists that the user might like.`,
});

const generateMusicSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateMusicSuggestionsFlow',
    inputSchema: GenerateMusicSuggestionsInputSchema,
    outputSchema: GenerateMusicSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
