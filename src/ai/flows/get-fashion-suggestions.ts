'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized fashion recommendations.
 *
 * - getFashionSuggestions - An exported function that triggers the fashion suggestion flow.
 * - FashionSuggestionsInput - The input type for the getFashionSuggestions function.
 * - FashionSuggestionsOutput - The output type for the getFashionSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FashionSuggestionsInputSchema = z.object({
  userPreferences: z
    .string()
    .describe('A description of the user\u2019s fashion preferences.'),
  recentInteractions: z
    .string()
    .optional()
    .describe('A summary of the user\u2019s recent interactions with the fashion recommender.'),
  currentTrends: z
    .string()
    .describe('An optional description of current fashion trends.'),
});
export type FashionSuggestionsInput = z.infer<typeof FashionSuggestionsInputSchema>;

const FashionSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('A list of personalized fashion suggestions for the user.'),
});
export type FashionSuggestionsOutput = z.infer<typeof FashionSuggestionsOutputSchema>;

export async function getFashionSuggestions(input: FashionSuggestionsInput): Promise<FashionSuggestionsOutput> {
  return fashionSuggestionsFlow(input);
}

const fashionSuggestionsPrompt = ai.definePrompt({
  name: 'fashionSuggestionsPrompt',
  input: {schema: FashionSuggestionsInputSchema},
  output: {schema: FashionSuggestionsOutputSchema},
  prompt: `You are a personal fashion consultant.

  Based on the user's stated preferences, recent interactions, and current trends, provide personalized fashion suggestions.

  User Preferences: {{{userPreferences}}}
  Recent Interactions: {{{recentInteractions}}}
  Current Trends: {{{currentTrends}}}

  Provide a detailed list of clothing items and outfits that align with the user's style.
  Do not be afraid to be creative.
  Consider the current season, weather, and occassion when making recommendations.
  Be extremely detailed in your response. Do not omit clothing suggestions.
  Be conversational and friendly. Your output will be formatted as a shopping list.
  Provide 5 to 10 suggestions.
  Always explain your suggestion and why you are recommending this.

  Do not include any promotional content.
  Focus solely on providing fashion advice.
  Assume that any images and text are appropriate and safe.
`,
});

const fashionSuggestionsFlow = ai.defineFlow(
  {
    name: 'fashionSuggestionsFlow',
    inputSchema: FashionSuggestionsInputSchema,
    outputSchema: FashionSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await fashionSuggestionsPrompt(input);
    return output!;
  }
);
