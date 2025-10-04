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
  prompt: `Eres un analista de datos experto especializado en datos de fuerzas del orden.
  Tu tarea es analizar los datos de aprehensiones proporcionados y extraer ideas y tendencias clave.
  Identifica patrones, anomalías y correlaciones significativas en los datos.
  Presenta las ideas de una manera concisa y fácil de entender.
  La respuesta debe estar en español.

  Datos de Aprehensión: {{{apprehensionData}}}
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
