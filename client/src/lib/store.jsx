import { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api";

const StoreContext = createContext(undefined);

export function StoreProvider({ children }) {
  const [game, setGame] = useState(null);
  const [courseHoles, setCourseHoles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCurrentGame() {
      try {
        setIsLoading(true);
        const currentGame = await api.getCurrentGame();
        if (currentGame) {
          setGame(currentGame);

          const defaultHoles = {};
          for (let i = 1; i <= currentGame.holeCount; i++) {
            defaultHoles[i] = { par: 4 };
          }
          setCourseHoles(defaultHoles);
        }
      } catch (err) {
        console.error("Failed to load current game:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentGame();
  }, []);


  const initializeGame = async (gameData) => {
    try {
      const createdGame = await api.createGame(gameData);
      setGame(createdGame);

      const defaultHoles = {};
      for (let i = 1; i <= createdGame.holeCount; i++) {
        defaultHoles[i] = { par: 4 };
      }
      setCourseHoles(defaultHoles);
      setError(null);
      return createdGame;
    } catch (err) {
      console.error("Failed to create game:", err);
      setError(err.message);
      throw err;
    }
  };

  const updateCurrentHole = async (holeNumber) => {
    if (!game) return;

    try {
      const updatedGame = {
        ...game,
        currentHole: holeNumber
      };

      const result = await api.updateGame(game.id, updatedGame);
      setGame(result);
      setError(null);
      return result;
    } catch (err) {
      console.error("Failed to update current hole:", err);
      setError(err.message);
      throw err;
    }
  };

  const updateHoleData = (holeNumber, par) => {
    const updatedHoles = {
      ...courseHoles,
      [holeNumber]: { par }
    };

    setCourseHoles(updatedHoles);
  };

  const updateScores = async (newScores) => {
    if (!game) return;

    try {
      const holeNumber = newScores[0]?.holeNumber;
      if (!holeNumber) {
        throw new Error("Invalid scores data");
      }

      const result = await api.updateScores(game.id, holeNumber, newScores);
      setGame(result);
      setError(null);
      return result;
    } catch (err) {
      console.error("Failed to update scores:", err);
      setError(err.message);
      throw err;
    }
  };

  const completeGame = async () => {
    if (!game) return;

    try {
      const result = await api.completeGame(game.id);
      setGame(result);
      setError(null);
      return result;
    } catch (err) {
      console.error("Failed to complete game:", err);
      setError(err.message);
      throw err;
    }
  };

  const resetGame = () => {
    setGame(null);
    setCourseHoles({});
    setError(null);
  };

  return (
    <StoreContext.Provider
      value={{
        game,
        courseHoles,
        isLoading,
        error,
        initializeGame,
        updateCurrentHole,
        updateScores,
        updateHoleData,
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
