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
  prompt: `You are an expert tutor. Provide a detailed explanation, an example, and a step-by-step solution to the following homework question:

Question: {{{question}}}

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
