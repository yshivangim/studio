'use server';

/**
 * @fileOverview An AI agent to help students with their homework.
 *
 * - generateHomeworkHelp - A function that generates explanations, examples, and solutions for a given homework question.
 * - GenerateHomeworkHelpInput - The input type for the generateHomeworkHelp function.
 * - GenerateHomeworkHelpOutput - The return type for the generateHomeworkHelp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHomeworkHelpInputSchema = z.object({
  question: z.string().describe('The homework question.'),
  photoDataUri: z.string().optional().describe(
    "A photo of the homework problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type GenerateHomeworkHelpInput = z.infer<typeof GenerateHomeworkHelpInputSchema>;

const GenerateHomeworkHelpOutputSchema = z.object({
  explanation: z.string().describe('An explanation of the concept.'),
  example: z.string().describe('An example related to the concept.'),
  solution: z.string().describe('A step-by-step solution to the question.'),
});
export type GenerateHomeworkHelpOutput = z.infer<typeof GenerateHomeworkHelpOutputSchema>;

export async function generateHomeworkHelp(input: GenerateHomeworkHelpInput): Promise<GenerateHomeworkHelpOutput> {
  return generateHomeworkHelpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHomeworkHelpPrompt',
  input: {schema: GenerateHomeworkHelpInputSchema},
  output: {schema: GenerateHomeworkHelpOutputSchema},
  prompt: `You are an expert tutor. A student needs help with a homework problem.

Use the information they've provided below, which may include a written question and/or an image of the problem.

Provide a detailed explanation of the core concepts, a relevant example, and a step-by-step solution to their specific question.

Question: {{{question}}}
{{#if photoDataUri}}
Image of the problem: {{media url=photoDataUri}}
{{/if}}

Explanation:
Example:
Solution:`,
});

const generateHomeworkHelpFlow = ai.defineFlow(
  {
    name: 'generateHomeworkHelpFlow',
    inputSchema: GenerateHomeworkHelpInputSchema,
    outputSchema: GenerateHomeworkHelpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
