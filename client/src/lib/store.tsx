import { createContext, useContext, useState, ReactNode } from "react";
import { type Game, type Score } from "@shared/schema";

interface StoreContextType {
  game: Game | null;
  initializeGame: (gameData: Game) => void;
  updateCurrentHole: (holeNumber: number) => void;
  updateScores: (scores: Score[]) => void;
  completeGame: () => void;
  resetGame: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Game | null>(() => {
    // Try to load from localStorage on init
    const savedGame = localStorage.getItem("golfGame");
    return savedGame ? JSON.parse(savedGame) : null;
  });
  
  // Initialize a new game
  const initializeGame = (gameData: Game) => {
    setGame(gameData);
    localStorage.setItem("golfGame", JSON.stringify(gameData));
  };
  
  // Update current hole
  const updateCurrentHole = (holeNumber: number) => {
    if (!game) return;
    
    const updatedGame = {
      ...game,
      currentHole: holeNumber
    };
    
    setGame(updatedGame);
    localStorage.setItem("golfGame", JSON.stringify(updatedGame));
  };
  
  // Update scores for a hole
  const updateScores = (newScores: Score[]) => {
    if (!game) return;
    
    // Filter out scores for the current hole
    const filteredScores = game.scores.filter(
      score => !newScores.some(newScore => 
        newScore.playerId === score.playerId && newScore.holeNumber === score.holeNumber
      )
    );
    
    // Add the new scores
    const updatedGame = {
      ...game,
      scores: [...filteredScores, ...newScores]
    };
    
    setGame(updatedGame);
    localStorage.setItem("golfGame", JSON.stringify(updatedGame));
  };
  
  // Mark game as completed
  const completeGame = () => {
    if (!game) return;
    
    const completedGame = {
      ...game,
      completed: true
    };
    
    setGame(completedGame);
    localStorage.setItem("golfGame", JSON.stringify(completedGame));
  };
  
  // Reset the game state
  const resetGame = () => {
    setGame(null);
    localStorage.removeItem("golfGame");
  };
  
  return (
    <StoreContext.Provider value={{
      game, 
      initializeGame, 
      updateCurrentHole,
      updateScores,
      completeGame,
      resetGame
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}