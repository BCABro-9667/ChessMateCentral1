
// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview AI-powered tournament description generator.
 *
 * - generateTournamentDescription - A function that generates an engaging tournament description.
 * - GenerateTournamentDescriptionInput - The input type for the generateTournamentDescription function.
 * - GenerateTournamentDescriptionOutput - The return type for the generateTournamentDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTournamentDescriptionInputSchema = z.object({
  tournamentName: z.string().describe('The name of the chess tournament.'),
  tournamentType: z.string().describe('The type of chess tournament (e.g., Swiss, Round Robin).'),
  tournamentLocation: z.string().describe('The location of the chess tournament.'),
  tournamentStartDate: z.string().describe('The start date of the chess tournament.'),
  tournamentEndDate: z.string().describe('The end date of defametournament.'),
  entryFee: z.number().describe('The entry fee for the chess tournament.'),
  prizeFund: z.number().describe('The total prize fund for the chess tournament.'),
  timeControl: z.string().describe('The time control for the chess tournament (e.g., 60+5).'),
});
export type GenerateTournamentDescriptionInput = z.infer<typeof GenerateTournamentDescriptionInputSchema>;

const GenerateTournamentDescriptionOutputSchema = z.object({
  description: z.string().describe('An engaging and informative description of the chess tournament.'),
});
export type GenerateTournamentDescriptionOutput = z.infer<typeof GenerateTournamentDescriptionOutputSchema>;

export async function generateTournamentDescription(input: GenerateTournamentDescriptionInput): Promise<GenerateTournamentDescriptionOutput> {
  return generateTournamentDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTournamentDescriptionPrompt',
  input: {schema: GenerateTournamentDescriptionInputSchema},
  output: {schema: GenerateTournamentDescriptionOutputSchema},
  prompt: `You are an expert in writing engaging and informative descriptions for chess tournaments.

  Using the information provided below, generate a compelling description to attract more players.

  Tournament Name: {{{tournamentName}}}
  Tournament Type: {{{tournamentType}}}
  Location: {{{tournamentLocation}}}
  Start Date: {{{tournamentStartDate}}}
  End Date: {{{tournamentEndDate}}}
  Entry Fee: {{{entryFee}}}
  Prize Fund: {{{prizeFund}}}
  Time Control: {{{timeControl}}}
  `,
});

const generateTournamentDescriptionFlow = ai.defineFlow(
  {
    name: 'generateTournamentDescriptionFlow',
    inputSchema: GenerateTournamentDescriptionInputSchema,
    outputSchema: GenerateTournamentDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

