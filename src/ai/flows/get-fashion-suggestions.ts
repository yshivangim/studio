
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
    .describe('A description of the user’s fashion preferences.'),
  recentInteractions: z
    .string()
    .optional()
    .describe('A summary of the user’s recent interactions with the fashion recommender.'),
  currentTrends: z
    .string()
    .describe('An optional description of current fashion trends.'),
  photoDataUri: z.string().optional().describe(
    "A photo of a clothing item or accessory, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type FashionSuggestionsInput = z.infer<typeof FashionSuggestionsInputSchema>;

const SuggestionSchema = z.object({
    description: z.string().describe("A detailed description of a full outfit, including clothing, accessories, and footwear. Explain why this look works and how it connects to the user's preferences."),
    pose: z.string().describe('A creative and interesting photo pose idea for someone wearing this outfit. For example, "Leaning against a brick wall, one hand in pocket, looking off to the side."'),
});

const FashionSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(SuggestionSchema.extend({
        imageDataUri: z.string().describe("An AI-generated image of the described outfit as a data URI.")
    }))
    .describe('A list of personalized fashion suggestions for the user, including generated images.'),
});
export type FashionSuggestionsOutput = z.infer<typeof FashionSuggestionsOutputSchema>;

export async function getFashionSuggestions(input: FashionSuggestionsInput): Promise<FashionSuggestionsOutput> {
  return fashionSuggestionsFlow(input);
}

const fashionSuggestionsPrompt = ai.definePrompt({
  name: 'fashionSuggestionsPrompt',
  input: {schema: FashionSuggestionsInputSchema},
  output: {schema: z.object({ suggestions: z.array(SuggestionSchema) })},
  prompt: `You are a personal fashion consultant and stylist. Your goal is to provide creative, detailed, and visually-inspiring fashion advice.

Based on the user's stated preferences, current trends, and the uploaded image of their clothing item, provide personalized fashion suggestions.

User Preferences: {{{userPreferences}}}
Current Trends: {{{currentTrends}}}
{{#if photoDataUri}}
Image of user's clothing item: {{media url=photoDataUri}}
Analyze the item in the image (color, style, type) and suggest items that would match or complement it.
{{/if}}

For each suggestion, provide the following:
1.  **Outfit Description:** A detailed description of a full outfit, including clothing, accessories, and footwear. Explain why this look works and how it connects to the user's preferences.
2.  **Photo Pose Idea:** Suggest a creative and interesting pose for someone wearing this outfit. For example, "Leaning against a brick wall, one hand in pocket, looking off to the side," or "A candid shot walking across a crosswalk, with a slight smile."

Provide 3 to 5 detailed suggestions.
Be conversational and friendly in your tone.

Do not include any promotional content. Focus solely on providing fashion advice.
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
    // 1. Get text-based suggestions from the LLM first.
    const {output: textSuggestions} = await fashionSuggestionsPrompt(input);
    
    if (!textSuggestions || !textSuggestions.suggestions) {
        throw new Error("Failed to generate fashion suggestions.");
    }

    // 2. Generate an image for each suggestion in parallel.
    const imagePromises = textSuggestions.suggestions.map(async (suggestion) => {
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: `A high-fashion, Pinterest-style photograph of the following outfit: ${suggestion.description}`,
        });
        return {
            ...suggestion,
            imageDataUri: media.url,
        };
    });

    // 3. Wait for all images to be generated.
    const finalSuggestions = await Promise.all(imagePromises);

    return { suggestions: finalSuggestions };
  }
);
