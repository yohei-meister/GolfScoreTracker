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
  const { game, updateCurrentHole, completeGame } = useStore();
  const [holes, setHoles] = useState<number[]>([]);
  
  useEffect(() => {
    // If no game is found, redirect to home
    if (!game) {
      toast({
        title: "No active game",
        description: "Please set up a new game",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    // Generate holes array based on hole count
    const holeNumbers = Array.from({ length: game.holeCount }, (_, i) => i + 1);
    setHoles(holeNumbers);
  }, [game, navigate, toast]);
  
  if (!game) {
    return null;
  }
  
  // Create default hole structure for custom courses
  const getDefaultHole = (holeNumber: number) => ({
    number: holeNumber,
    par: 4,
    yards: 400
  });
  
  // Get current hole information
  const currentHole = game.courseId === "custom" 
    ? getDefaultHole(game.currentHole) 
    : courses.find(course => course.id === game.courseId)?.holes[game.currentHole - 1];
  
  const handlePrevHole = () => {
    if (game.currentHole > 1) {
      updateCurrentHole(game.currentHole - 1);
    }
  };
  
  const handleNextHole = () => {
    if (game.currentHole < game.holeCount) {
      updateCurrentHole(game.currentHole + 1);
    } else {
      // Last hole completed
      completeGame();
      navigate("/summary");
    }
  };
  
  const handleEditGame = () => {
    navigate("/");
  };
  
  return (
    <div className="p-4">
      {/* Course Info */}
      <Card className="mb-4">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-dark">{game.courseName}</h2>
            <p className="text-sm text-gray-500">{game.holeCount} Holes</p>
          </div>
          <Button variant="ghost" onClick={handleEditGame} className="p-2 text-primary hover:text-blue-700 transition">
            <Edit2 className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
      
      {/* Hole Navigation */}
      <HoleNavigation 
        holes={holes}
        currentHole={game.currentHole}
        onHoleSelect={(holeNumber) => updateCurrentHole(holeNumber)}
      />
      
      {/* Current Hole Card */}
      {currentHole && (
        <ScoreCard
          game={game}
          currentHole={currentHole}
          onPrevHole={handlePrevHole}
          onNextHole={handleNextHole}
        />
      )}
      
      {/* Scores Summary Card */}
      <ScoreSummary game={game} />
    </div>
  );
}
