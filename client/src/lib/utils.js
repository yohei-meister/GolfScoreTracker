import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getPlayerInitial(name) {
  return name.charAt(0).toUpperCase();
}

export function getPlayerColor(playerId) {
  const colors = [
    "bg-primary",
    "bg-accent",
    "bg-secondary",
    "bg-purple-500"
  ];
  
  const sum = playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = sum % colors.length;
  
  return colors[index];
}

export function calculateTotalScore(scores, playerId) {
  return scores
    .filter(score => score.playerId === playerId)
    .reduce((total, score) => total + score.strokes, 0);
}

export function calculateToPar(scores, playerId, holes) {
  const totalPar = holes.reduce((sum, hole) => sum + hole.par, 0);
  const playerScores = scores.filter(score => score.playerId === playerId);
  
  if (playerScores.length < holes.length) {
    const scoredHoles = holes.filter(hole => 
      playerScores.some(score => score.holeNumber === hole.number)
    );
    
    const parForScoredHoles = scoredHoles.reduce((sum, hole) => sum + hole.par, 0);
    const playerTotal = calculateTotalScore(scores, playerId);
    
    return playerTotal - parForScoredHoles;
  }
  
  return calculateTotalScore(scores, playerId) - totalPar;
}
