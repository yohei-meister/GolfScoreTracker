import { createContext, useContext, useState, ReactNode } from "react";
import { type Game, type Score } from "@shared/schema";

// Custom type for hole data
export interface HoleInfo {
  number: number;
  par: number;
  yards: number;
}

interface StoreContextType {
  game: Game | null;
  holeData: HoleInfo[];
  initializeGame: (gameData: Game) => void;
  updateCurrentHole: (holeNumber: number) => void;
  updateScores: (scores: Score[]) => void;
  updateHoleInfo: (holeNumber: number, par: number, yards: number) => void;
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
  
  // Initialize hole data with default values
  const [holeData, setHoleData] = useState<HoleInfo[]>(() => {
    const savedData = localStorage.getItem("golfHoleData");
    if (savedData) {
      return JSON.parse(savedData);
    }
    
    // Default data for 18 holes
    return Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4,
      yards: 400
    }));
  });
  
  // Initialize a new game
  const initializeGame = (gameData: Game) => {
    setGame(gameData);
    localStorage.setItem("golfGame", JSON.stringify(gameData));
    
    // Reset hole data if needed
    if (gameData.courseId === "custom") {
      const newHoleData = Array.from({ length: gameData.holeCount }, (_, i) => ({
        number: i + 1,
        par: 4,
        yards: 400
      }));
      setHoleData(newHoleData);
      localStorage.setItem("golfHoleData", JSON.stringify(newHoleData));
    }
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
  
  // Update hole information (par and yards)
  const updateHoleInfo = (holeNumber: number, par: number, yards: number) => {
    const updatedData = holeData.map(hole => 
      hole.number === holeNumber ? { ...hole, par, yards } : hole
    );
    
    setHoleData(updatedData);
    localStorage.setItem("golfHoleData", JSON.stringify(updatedData));
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
    <StoreContext.Provider 
      value={{ 
        game, 
        holeData,
        initializeGame, 
        updateCurrentHole,
        updateScores,
        updateHoleInfo,
        completeGame,
        resetGame
      }}
    >
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