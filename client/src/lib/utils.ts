import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Hole, type Score } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get player initial from name
export function getPlayerInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// Map player IDs to consistent colors
export function getPlayerColor(playerId: string): string {
  // Use the player ID to get a consistent color
  const colors = [
    "bg-primary", // blue
    "bg-accent", // yellow
    "bg-secondary", // green
    "bg-purple-500" // purple
  ];
  
  // Use the string's characters to generate a consistent index
  const sum = playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = sum % colors.length;
  
  return colors[index];
}

// Calculate total score for a player
export function calculateTotalScore(scores: Score[], playerId: string): number {
  return scores
    .filter(score => score.playerId === playerId)
    .reduce((total, score) => total + score.strokes, 0);
}

// Calculate score relative to par for a player
export function calculateToPar(scores: Score[], playerId: string, holes: Hole[]): number {
  const totalPar = holes.reduce((sum, hole) => sum + hole.par, 0);
  const playerScores = scores.filter(score => score.playerId === playerId);
  
  // If player hasn't scored all holes yet, only count completed holes
  if (playerScores.length < holes.length) {
    const scoredHoles = holes.filter(hole => 
      playerScores.some(score => score.holeNumber === hole.number)
    );
    
    const parForScoredHoles = scoredHoles.reduce((sum, hole) => sum + hole.par, 0);
    const playerTotal = calculateTotalScore(scores, playerId);
    
    return playerTotal - parForScoredHoles;
  }
  
  // If all holes are scored
  return calculateTotalScore(scores, playerId) - totalPar;
}
