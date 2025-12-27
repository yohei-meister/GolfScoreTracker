import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { PlayerScoreInput } from "@/components/PlayerScoreInput";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ScoreCard({ game, currentHole, onPrevHole, onNextHole }) {
  const { updateScores, courseHoles, updateHoleData } = useStore();
  const [playerScores, setPlayerScores] = useState(new Map());
  const isInitialMount = useRef(true);

  const holeData = courseHoles[currentHole.number] || {
    par: currentHole.par
  };

  useEffect(() => {
    const scoresMap = new Map();

    game.players.forEach((player) => {
      const existingScore = game.scores.find(
        (score) =>
          score.playerId === player.id &&
          score.holeNumber === currentHole.number
      );

      if (existingScore) {
        scoresMap.set(player.id, existingScore.strokes);
      } else {
        scoresMap.set(player.id, holeData.par);
      }
    });

    setPlayerScores(scoresMap);
    isInitialMount.current = false;
  }, [currentHole.number, game.players, game.scores, holeData.par]);

  const saveCurrentScores = () => {
    const scores = Array.from(playerScores.entries()).map(
      ([playerId, strokes]) => ({
        playerId,
        holeNumber: currentHole.number,
        strokes
      })
    );

    updateScores(scores);
  };

  const handleScoreChange = (playerId, score) => {
    setPlayerScores((prev) => {
      const newScores = new Map(prev);
      newScores.set(playerId, score);
      return newScores;
    });

    const scores = [];
    playerScores.forEach((strokes, pId) => {
      if (pId === playerId) {
        scores.push({
          playerId,
          holeNumber: currentHole.number,
          strokes: score
        });
      } else {
        scores.push({ playerId: pId, holeNumber: currentHole.number, strokes });
      }
    });

    updateScores(scores);
  };

  const handleNextHole = () => {
    saveCurrentScores();
    onNextHole();
  };

  const handlePrevHole = () => {
    saveCurrentScores();
    onPrevHole();
  };

  // 現在のホールで全プレーヤーのスコアが保存されているかチェック
  const areAllScoresSaved = () => {
    return game.players.every((player) => {
      return game.scores.some(
        (score) =>
          score.playerId === player.id &&
          score.holeNumber === currentHole.number
      );
    });
  };

  const isNextButtonDisabled = !areAllScoresSaved();

  return (
    <Card className="bg-white rounded-lg shadow-md mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold" data-testid="text-hole-number">
            Hole <span>{currentHole.number}</span>
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-sm mr-1">Par:</span>
            <input
              type="number"
              min="1"
              max="10"
              value={holeData.par}
              data-testid="input-par"
              onChange={(e) => {
                const newPar = parseInt(e.target.value);
                if (!isNaN(newPar) && newPar > 0 && newPar <= 10) {
                  updateHoleData(currentHole.number, newPar);
                }
              }}
              className="w-12 px-2 py-1 text-center border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2 text-center">Score</th>
                <th className="px-3 py-2 text-center">+/-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {game.players.map((player) => {
                const score = playerScores.get(player.id) || holeData.par;
                const scoreRelative = score - holeData.par;

                return (
                  <PlayerScoreInput
                    key={player.id}
                    player={player}
                    score={score}
                    scoreRelative={scoreRelative}
                    par={holeData.par}
                    onScoreChange={(newScore) =>
                      handleScoreChange(player.id, newScore)
                    }
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      <CardFooter className="border-t border-gray-200 px-4 py-3 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevHole}
          disabled={currentHole.number <= 1}
          data-testid="button-prev-hole"
          className="px-3 py-1 text-sm rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button
          onClick={handleNextHole}
          disabled={isNextButtonDisabled}
          data-testid="button-next-hole"
          className={`px-3 py-1 text-sm rounded flex items-center ${
            isNextButtonDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-blue-600"
          }`}
        >
          {currentHole.number === game.holeCount ? "Finish" : "Next"}{" "}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
