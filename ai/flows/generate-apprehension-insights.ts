'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating insights from apprehension data.
 * It takes apprehension data as input and returns key trends and anomalies.
 *
 * - generateApprehensionInsights - A function that generates insights from apprehension data.
 * - GenerateApprehensionInsightsInput - The input type for the generateApprehensionInsights function.
 * - GenerateApprehensionInsightsOutput - The return type for the generateApprehensionInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateApprehensionInsightsInputSchema = z.object({
  apprehensionData: z.string().describe('The apprehension data in JSON format.'),
});
export type GenerateApprehensionInsightsInput = z.infer<typeof GenerateApprehensionInsightsInputSchema>;

const GenerateApprehensionInsightsOutputSchema = z.object({
  insights: z.string().describe('Key trends and anomalies from the apprehension data.'),
});
export type GenerateApprehensionInsightsOutput = z.infer<typeof GenerateApprehensionInsightsOutputSchema>;

export async function generateApprehensionInsights(input: GenerateApprehensionInsightsInput): Promise<GenerateApprehensionInsightsOutput> {
  return generateApprehensionInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateApprehensionInsightsPrompt',
  input: {schema: GenerateApprehensionInsightsInputSchema},
  output: {schema: GenerateApprehensionInsightsOutputSchema},
  prompt: `You are an expert data analyst specializing in law enforcement data.
  Your task is to analyze the provided apprehension data and extract key insights and trends.
  Identify significant patterns, anomalies, and correlations in the data.
  Present the insights in a concise and easy-to-understand manner.

  Apprehension Data: {{{apprehensionData}}}
  `,
});

const generateApprehensionInsightsFlow = ai.defineFlow(
  {
    name: 'generateApprehensionInsightsFlow',
    inputSchema: GenerateApprehensionInsightsInputSchema,
    outputSchema: GenerateApprehensionInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
