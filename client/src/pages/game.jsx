import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { HoleNavigation } from "@/components/HoleNavigation";
import { ScoreCard } from "@/components/ScoreCard";
import { ScoreSummary } from "@/components/ScoreSummary";
import { Edit2 } from "lucide-react";
import { courses } from "@/lib/courseData";

export default function Game() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { game, updateCurrentHole, completeGame, courseHoles } = useStore();
  const [holes, setHoles] = useState([]);
  
  useEffect(() => {
    if (!game) {
      toast({
        title: "No active game",
        description: "Please set up a new game",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    const holeNumbers = Array.from({ length: game.holeCount }, (_, i) => i + 1);
    setHoles(holeNumbers);
  }, [game, navigate, toast]);
  
  if (!game) {
    return null;
  }
  
  const getDefaultHole = (holeNumber) => ({
    number: holeNumber,
    par: 4,
    yards: 400
  });
  
  const defaultHole = game.courseId === "custom"
    ? getDefaultHole(game.currentHole)
    : courses.find(course => course.id === game.courseId)?.holes[game.currentHole - 1] || getDefaultHole(game.currentHole);
    
  const currentHole = {
    number: defaultHole.number,
    par: courseHoles[game.currentHole]?.par || defaultHole.par,
    yards: courseHoles[game.currentHole]?.yards || defaultHole.yards
  };
  
  const handlePrevHole = () => {
    if (game.currentHole > 1) {
      updateCurrentHole(game.currentHole - 1);
    }
  };
  
  const handleNextHole = () => {
    if (game.currentHole < game.holeCount) {
      updateCurrentHole(game.currentHole + 1);
    } else {
      completeGame();
      navigate("/summary");
    }
  };
  
  const handleEditGame = () => {
    navigate("/");
  };
  
  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-dark" data-testid="text-course-name">{game.courseName}</h2>
            <p className="text-sm text-gray-500" data-testid="text-hole-count">{game.holeCount} Holes</p>
          </div>
          <Button variant="ghost" onClick={handleEditGame} data-testid="button-edit-game" className="p-2 text-primary hover:text-blue-700 transition">
            <Edit2 className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
      
      <HoleNavigation 
        holes={holes}
        currentHole={game.currentHole}
        onHoleSelect={(holeNumber) => updateCurrentHole(holeNumber)}
      />
      
      {currentHole && (
        <ScoreCard
          game={game}
          currentHole={currentHole}
          onPrevHole={handlePrevHole}
          onNextHole={handleNextHole}
        />
      )}
      
      <ScoreSummary game={game} />
    </div>
  );
}
