import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { PlayerScoreInput } from "@/components/PlayerScoreInput";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Game, type Hole, type Score } from "@shared/schema";

interface ScoreCardProps {
  game: Game;
  currentHole: Hole;
  onPrevHole: () => void;
  onNextHole: () => void;
}

export function ScoreCard({ game, currentHole, onPrevHole, onNextHole }: ScoreCardProps) {
  const { toast } = useToast();
  const { updateScores } = useStore();
  const [playerScores, setPlayerScores] = useState<Map<string, number>>(new Map());
  
  // Initialize player scores for the current hole
  useEffect(() => {
    const scoresMap = new Map<string, number>();
    
    game.players.forEach(player => {
      // Check if there's an existing score for this player and hole
      const existingScore = game.scores.find(
        score => score.playerId === player.id && score.holeNumber === currentHole.number
      );
      
      // If there's an existing score, use it; otherwise, set a default score (par)
      scoresMap.set(player.id, existingScore ? existingScore.strokes : currentHole.par);
    });
    
    setPlayerScores(scoresMap);
  }, [game.players, game.scores, currentHole]);
  
  const handleScoreChange = (playerId: string, score: number) => {
    setPlayerScores(prev => new Map(prev).set(playerId, score));
  };
  
  const handleNextHole = () => {
    // Save scores for the current hole
    const scores: Score[] = Array.from(playerScores.entries()).map(([playerId, strokes]) => ({
      playerId,
      holeNumber: currentHole.number,
      strokes
    }));
    
    // Update scores in the store
    updateScores(scores);
    
    // Call parent's onNextHole
    onNextHole();
  };
  
  const handlePrevHole = () => {
    // Save scores for the current hole before going back
    const scores: Score[] = Array.from(playerScores.entries()).map(([playerId, strokes]) => ({
      playerId,
      holeNumber: currentHole.number,
      strokes
    }));
    
    // Update scores in the store
    updateScores(scores);
    
    // Call parent's onPrevHole
    onPrevHole();
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-md mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Hole <span>{currentHole.number}</span></h3>
          <div className="flex space-x-1 text-sm">
            <div className="flex items-center">
              <span className="text-sm mr-1">Par:</span>
              <input 
                type="number" 
                min="1"
                max="10"
                value={currentHole.par}
                onChange={(e) => {
                  // Note: In a full implementation, we'd update the par for this hole
                  // For now, we'll just show the editable field
                }}
                className="w-12 px-2 py-1 text-center border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center ml-2">
              <span className="text-sm mr-1">Yards:</span>
              <input 
                type="number"
                min="1"
                value={currentHole.yards}
                onChange={(e) => {
                  // Note: In a full implementation, we'd update the yards for this hole
                  // For now, we'll just show the editable field
                }}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        {/* Score Input Table */}
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
              {game.players.map(player => {
                const score = playerScores.get(player.id) || currentHole.par;
                const scoreRelative = score - currentHole.par;
                
                return (
                  <PlayerScoreInput 
                    key={player.id}
                    player={player}
                    score={score}
                    scoreRelative={scoreRelative}
                    onScoreChange={(newScore) => handleScoreChange(player.id, newScore)}
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
          className="px-3 py-1 text-sm rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button 
          onClick={handleNextHole}
          className="px-3 py-1 text-sm rounded bg-primary text-white hover:bg-blue-600 flex items-center"
        >
          {currentHole.number === game.holeCount ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
