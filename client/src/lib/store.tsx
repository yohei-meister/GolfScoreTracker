import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { type Game, type Score, type Hole } from "@shared/schema";

// Custom type for storing hole info
export type CourseHoles = {
  [holeNumber: number]: {
    par: number;
    yards: number;
  };
};

interface StoreContextType {
  game: Game | null;
  courseHoles: CourseHoles;
  initializeGame: (gameData: Game) => void;
  updateCurrentHole: (holeNumber: number) => void;
  updateScores: (scores: Score[]) => void;
  updateHoleData: (holeNumber: number, par: number, yards: number) => void;
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
  
  // Store hole information separately to allow editing
  const [courseHoles, setCourseHoles] = useState<CourseHoles>(() => {
    const savedHoles = localStorage.getItem("courseHoles");
    if (savedHoles) {
      return JSON.parse(savedHoles);
    }
    return {};
  });
  
  // Initialize default holes when a game is created
  useEffect(() => {
    if (game && Object.keys(courseHoles).length === 0) {
      // Create default hole data if none exists
      const defaultHoles: CourseHoles = {};
      for (let i = 1; i <= game.holeCount; i++) {
        defaultHoles[i] = { par: 4, yards: 400 };
      }
      setCourseHoles(defaultHoles);
      localStorage.setItem("courseHoles", JSON.stringify(defaultHoles));
    }
  }, [game, courseHoles]);
  
  // Initialize a new game
  const initializeGame = (gameData: Game) => {
    setGame(gameData);
    localStorage.setItem("golfGame", JSON.stringify(gameData));
    
    // Reset hole data when starting a new game
    const defaultHoles: CourseHoles = {};
    for (let i = 1; i <= gameData.holeCount; i++) {
      defaultHoles[i] = { par: 4, yards: 400 };
    }
    setCourseHoles(defaultHoles);
    localStorage.setItem("courseHoles", JSON.stringify(defaultHoles));
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
  
  // Update hole data (par and yards)
  const updateHoleData = (holeNumber: number, par: number, yards: number) => {
    const updatedHoles = {
      ...courseHoles,
      [holeNumber]: { par, yards }
    };
    
    setCourseHoles(updatedHoles);
    localStorage.setItem("courseHoles", JSON.stringify(updatedHoles));
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
    setCourseHoles({});
    localStorage.removeItem("golfGame");
    localStorage.removeItem("courseHoles");
  };
  
  return (
    <StoreContext.Provider value={{
      game, 
      courseHoles,
      initializeGame, 
      updateCurrentHole,
      updateScores,
      updateHoleData,
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