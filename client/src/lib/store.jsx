import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext(undefined);

export function StoreProvider({ children }) {
  const [game, setGame] = useState(() => {
    const savedGame = localStorage.getItem("golfGame");
    return savedGame ? JSON.parse(savedGame) : null;
  });
  
  const [courseHoles, setCourseHoles] = useState(() => {
    const savedHoles = localStorage.getItem("courseHoles");
    if (savedHoles) {
      return JSON.parse(savedHoles);
    }
    return {};
  });
  
  useEffect(() => {
    if (game && Object.keys(courseHoles).length === 0) {
      const defaultHoles = {};
      for (let i = 1; i <= game.holeCount; i++) {
        defaultHoles[i] = { par: 4, yards: 400 };
      }
      setCourseHoles(defaultHoles);
      localStorage.setItem("courseHoles", JSON.stringify(defaultHoles));
    }
  }, [game, courseHoles]);
  
  const initializeGame = (gameData) => {
    setGame(gameData);
    localStorage.setItem("golfGame", JSON.stringify(gameData));
    
    const defaultHoles = {};
    for (let i = 1; i <= gameData.holeCount; i++) {
      defaultHoles[i] = { par: 4, yards: 400 };
    }
    setCourseHoles(defaultHoles);
    localStorage.setItem("courseHoles", JSON.stringify(defaultHoles));
  };
  
  const updateCurrentHole = (holeNumber) => {
    if (!game) return;
    
    const updatedGame = {
      ...game,
      currentHole: holeNumber
    };
    
    setGame(updatedGame);
    localStorage.setItem("golfGame", JSON.stringify(updatedGame));
  };
  
  const updateHoleData = (holeNumber, par, yards) => {
    const updatedHoles = {
      ...courseHoles,
      [holeNumber]: { par, yards }
    };
    
    setCourseHoles(updatedHoles);
    localStorage.setItem("courseHoles", JSON.stringify(updatedHoles));
  };
  
  const updateScores = (newScores) => {
    if (!game) return;
    
    const filteredScores = game.scores.filter(
      score => !newScores.some(newScore => 
        newScore.playerId === score.playerId && newScore.holeNumber === score.holeNumber
      )
    );
    
    const updatedGame = {
      ...game,
      scores: [...filteredScores, ...newScores]
    };
    
    setGame(updatedGame);
    localStorage.setItem("golfGame", JSON.stringify(updatedGame));
  };
  
  const completeGame = () => {
    if (!game) return;
    
    const completedGame = {
      ...game,
      completed: true
    };
    
    setGame(completedGame);
    localStorage.setItem("golfGame", JSON.stringify(completedGame));
  };
  
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
