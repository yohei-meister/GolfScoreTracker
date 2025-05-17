import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { getPlayerInitial, getPlayerColor, calculateTotalScore, calculateToPar } from "@/lib/utils";
import { courses } from "@/lib/courseData";
import { type Game } from "@shared/schema";

interface ScoreSummaryProps {
  game: Game;
}

export function ScoreSummary({ game }: ScoreSummaryProps) {
  const currentCourse = courses.find(course => course.id === game.courseId);
  const courseHoles = currentCourse?.holes.slice(0, game.holeCount) || [];
  
  // Calculate player scores and order by lowest score
  const playerScores = game.players.map(player => {
    const totalScore = calculateTotalScore(game.scores, player.id);
    const toPar = calculateToPar(game.scores, player.id, courseHoles);
    
    return {
      player,
      totalScore,
      toPar
    };
  }).sort((a, b) => a.totalScore - b.totalScore);
  
  return (
    <Card className="bg-white rounded-lg shadow-md mb-4">
      <CardHeader className="px-4 py-3 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold">Score Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        <table className="w-full min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2 text-center">Total</th>
              <th className="px-3 py-2 text-center">To Par</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {playerScores.map(({ player, totalScore, toPar }) => (
              <tr key={player.id} className="text-sm">
                <td className="px-3 py-3">
                  <div className="flex items-center">
                    <div 
                      className={`flex-shrink-0 h-8 w-8 text-white rounded-full flex items-center justify-center ${getPlayerColor(player.id)}`}
                    >
                      {getPlayerInitial(player.name)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{player.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-center font-medium">{totalScore}</td>
                <td className="px-3 py-3 text-center">
                  {toPar === 0 ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Even
                    </span>
                  ) : toPar > 0 ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      +{toPar}
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {toPar}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
