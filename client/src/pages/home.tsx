import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlayerNameInput } from "@/components/PlayerNameInput";
import { useStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import { courses } from "@/lib/courseData";

const formSchema = z.object({
  courseId: z.string({ required_error: "Please select a course" }),
  holeCount: z.enum(["9", "18"], { required_error: "Please select 9 or 18 holes" }),
  playerCount: z.number().min(1).max(4),
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Player name is required")
    })
  ).min(1, "At least one player is required")
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { initializeGame } = useStore();
  const [playerCount, setPlayerCount] = useState(1);
  
  // Setup form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      holeCount: "9",
      playerCount: 1,
      players: [{ id: uuidv4(), name: "" }]
    }
  });
  
  // Update players array when playerCount changes
  useEffect(() => {
    const currentPlayers = form.getValues().players || [];
    const newCount = playerCount;
    
    if (currentPlayers.length < newCount) {
      // Add more player fields
      const playersToAdd = newCount - currentPlayers.length;
      const newPlayers = [...currentPlayers];
      
      for (let i = 0; i < playersToAdd; i++) {
        newPlayers.push({ id: uuidv4(), name: "" });
      }
      
      form.setValue("players", newPlayers);
    } else if (currentPlayers.length > newCount) {
      // Remove player fields
      const newPlayers = currentPlayers.slice(0, newCount);
      form.setValue("players", newPlayers);
    }
    
    form.setValue("playerCount", newCount);
  }, [playerCount, form]);
  
  // Handle player count changes
  const decreasePlayerCount = () => {
    if (playerCount > 1) {
      setPlayerCount(playerCount - 1);
    }
  };
  
  const increasePlayerCount = () => {
    if (playerCount < 4) {
      setPlayerCount(playerCount + 1);
    }
  };
  
  // Handle form submission
  const onSubmit = (data: FormValues) => {
    try {
      const selectedCourse = courses.find(course => course.id === data.courseId);
      
      if (!selectedCourse) {
        toast({
          title: "Error",
          description: "Selected course not found",
          variant: "destructive"
        });
        return;
      }
      
      const courseHoles = data.holeCount === "9" ? selectedCourse.holes.slice(0, 9) : selectedCourse.holes;
      
      // Initialize new game
      initializeGame({
        id: uuidv4(),
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        holeCount: parseInt(data.holeCount),
        players: data.players,
        scores: [],
        currentHole: 1,
        completed: false
      });
      
      // Navigate to the game page
      navigate("/game");
    } catch (error) {
      console.error("Failed to start game:", error);
      toast({
        title: "Error",
        description: "Failed to start the game. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="p-4">
      <Card className="bg-white rounded-lg shadow-md">
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold mb-4 text-neutral-dark">Game Setup</h2>
          
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Course Selection */}
            <div className="mb-4">
              <Label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                Golf Course
              </Label>
              <div className="relative">
                <Select 
                  onValueChange={(value) => form.setValue("courseId", value)}
                  defaultValue={form.getValues("courseId")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Course...</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.courseId && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.courseId.message}</p>
                )}
              </div>
            </div>
            
            {/* Course Type Selection */}
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Course Type
              </Label>
              <RadioGroup 
                defaultValue={form.getValues("holeCount")}
                onValueChange={(value) => form.setValue("holeCount", value as "9" | "18")}
                className="flex gap-4"
              >
                <div className="flex items-center">
                  <RadioGroupItem value="9" id="nineHoles" />
                  <Label htmlFor="nineHoles" className="ml-2 text-sm text-gray-700">9 Holes</Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="18" id="eighteenHoles" />
                  <Label htmlFor="eighteenHoles" className="ml-2 text-sm text-gray-700">18 Holes</Label>
                </div>
              </RadioGroup>
              {form.formState.errors.holeCount && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.holeCount.message}</p>
              )}
            </div>
            
            {/* Number of Players */}
            <div className="mb-4">
              <Label htmlFor="playerCount" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Players
              </Label>
              <div className="flex items-center">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={decreasePlayerCount}
                  className="px-3 py-1 rounded-l-md"
                >
                  -
                </Button>
                <Input 
                  type="number"
                  id="playerCount"
                  value={playerCount}
                  readOnly
                  className="w-12 py-1 px-2 text-center rounded-none border-x-0"
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={increasePlayerCount}
                  className="px-3 py-1 rounded-r-md"
                >
                  +
                </Button>
              </div>
              {form.formState.errors.playerCount && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.playerCount.message}</p>
              )}
            </div>
            
            {/* Player Names */}
            <div className="space-y-3 mb-5">
              {form.getValues("players").map((player, index) => (
                <PlayerNameInput
                  key={player.id}
                  index={index}
                  form={form}
                />
              ))}
              {form.formState.errors.players && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.players.message}</p>
              )}
            </div>
            
            <Button 
              type="submit"
              className="w-full py-2 px-4 bg-secondary text-white font-medium rounded-md hover:bg-green-600 transition"
            >
              Start Game
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
