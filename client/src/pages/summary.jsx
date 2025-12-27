import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { TrophyIcon, ShareIcon, ListRestart } from "lucide-react";
import { courses } from "@/lib/courseData";
import {
  getPlayerInitial,
  getPlayerColor,
  calculateTotalScore,
  calculateToPar
} from "@/lib/utils";

export default function Summary() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { game, resetGame, courseHoles } = useStore();

  useEffect(() => {
    if (!game) {
      toast({
        title: "No active game",
        description: "Please set up a new game",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [game, navigate, toast]);

  if (!game) {
    return null;
  }

  const createDefaultHoles = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      par: courseHoles[i + 1]?.par || 4
    }));
  };

  const gameHoles =
    game.courseId === "custom"
      ? createDefaultHoles(game.holeCount)
      : courses
          .find((course) => course.id === game.courseId)
          ?.holes.slice(0, game.holeCount) || [];

  const handleNewGame = () => {
    resetGame();
    navigate("/");
  };

  const handleShareResults = () => {
    toast({
      title: "Coming Soon",
      description: "Sharing results will be available in a future update!"
    });
  };

  const playerScores = game.players
    .map((player) => {
      const totalScore = calculateTotalScore(game.scores, player.id);
      const toPar = calculateToPar(game.scores, player.id, gameHoles);

      return {
        player,
        totalScore,
        toPar
      };
    })
    .sort((a, b) => a.totalScore - b.totalScore);

  const totalPar = gameHoles.reduce((sum, hole) => sum + hole.par, 0);

  // Check if all holes have scores for all players
  const areAllHolesCompleted = () => {
    for (let holeNumber = 1; holeNumber <= game.holeCount; holeNumber++) {
      for (const player of game.players) {
        const hasScore = game.scores.some(
          (score) =>
            score.playerId === player.id && score.holeNumber === holeNumber
        );
        if (!hasScore) {
          return false;
        }
      }
    }
    return true;
  };

  // Show "Game Completed!" if:
  // 1. The game is marked as completed (Finish button was pressed)
  // 2. All holes have scores for all players
  const isGameCompleted = game.completed || areAllHolesCompleted();
  const gameStatusText = isGameCompleted ? "Game Completed!" : "Playing";

  return (
    <div className="p-4">
      <Card className="bg-white rounded-lg shadow-md mb-4">
        <CardContent className="p-5">
          <div className="text-center mb-6">
            {isGameCompleted && (
              <div className="inline-block p-4 rounded-full bg-secondary bg-opacity-20 mb-3">
                <TrophyIcon className="h-10 w-10 text-secondary" />
              </div>
            )}
            <h2
              className="text-xl font-semibold text-neutral-dark"
              data-testid="text-game-completed"
            >
              {gameStatusText}
            </h2>
            <p className="text-gray-600" data-testid="text-summary-course-name">
              {game.courseName}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Final Scores</h3>
            <div className="space-y-3">
              {playerScores.map(({ player, totalScore, toPar }) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  data-testid={`card-player-score-${player.id}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 h-10 w-10 text-white rounded-full flex items-center justify-center font-semibold ${getPlayerColor(
                        player.id
                      )}`}
                    >
                      {getPlayerInitial(player.name)}
                    </div>
                    <div className="ml-3">
                      <p
                        className="font-medium text-gray-900"
                        data-testid={`text-player-name-${player.id}`}
                      >
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {game.holeCount} holes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xl font-bold"
                      data-testid={`text-total-score-${player.id}`}
                    >
                      {totalScore}
                    </p>
                    <span
                      className={`text-sm ${
                        toPar === 0
                          ? "text-green-600"
                          : toPar > 0
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                      data-testid={`text-to-par-${player.id}`}
                    >
                      {toPar === 0
                        ? "Even par"
                        : toPar > 0
                        ? `+${toPar}`
                        : toPar}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleNewGame}
              data-testid="button-new-game"
              className="py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-blue-600 transition flex items-center justify-center"
            >
              <ListRestart className="h-4 w-4 mr-1" /> New Game
            </Button>
            <Button
              variant="outline"
              onClick={handleShareResults}
              data-testid="button-share"
              className="py-2 px-4 text-primary font-medium rounded-md border border-primary hover:bg-blue-50 transition flex items-center justify-center"
            >
              <ShareIcon className="h-4 w-4 mr-1" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-lg shadow-md">
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold mb-3">Score Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-collapse">
              <thead>
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  <th className="px-2 py-2 text-left">Hole</th>
                  <th className="px-2 py-2 text-center">Par</th>
                  {game.players.map((player) => (
                    <th key={player.id} className="px-2 py-2 text-center">
                      {player.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {gameHoles.map((hole) => (
                  <tr key={hole.number}>
                    <td className="px-2 py-2 font-medium">{hole.number}</td>
                    <td className="px-2 py-2 text-center">{hole.par}</td>
                    {game.players.map((player) => {
                      const score = game.scores.find(
                        (s) =>
                          s.playerId === player.id &&
                          s.holeNumber === hole.number
                      );
                      return (
                        <td
                          key={player.id}
                          className="px-2 py-2 text-center"
                          data-testid={`cell-score-${player.id}-${hole.number}`}
                        >
                          {score ? score.strokes : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-2 py-2">Total</td>
                  <td className="px-2 py-2 text-center">{totalPar}</td>
                  {game.players.map((player) => (
                    <td
                      key={player.id}
                      className="px-2 py-2 text-center"
                      data-testid={`cell-total-${player.id}`}
                    >
                      {calculateTotalScore(game.scores, player.id)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
