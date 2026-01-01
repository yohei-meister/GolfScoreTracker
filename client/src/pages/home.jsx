import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlayerNameInput } from "@/components/PlayerNameInput";
import { useStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

const formSchema = z.object({
  courseId: z.string({ required_error: "Please select a course" }),
  holeCount: z.enum(["9", "18"], {
    required_error: "Please select 9 or 18 holes"
  }),
  playerCount: z.number().min(1).max(4),
  players: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Player name is required")
      })
    )
    .min(1, "At least one player is required")
});

export default function Home() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { initializeGame } = useStore();
  const [playerCount, setPlayerCount] = useState(1);
  const [customCourseName, setCustomCourseName] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "custom",
      holeCount: "9",
      playerCount: 1,
      players: [{ id: uuidv4(), name: "" }]
    }
  });

  useEffect(() => {
    const currentPlayers = form.getValues().players || [];
    const newCount = playerCount;

    if (currentPlayers.length < newCount) {
      const playersToAdd = newCount - currentPlayers.length;
      const newPlayers = [...currentPlayers];

      for (let i = 0; i < playersToAdd; i++) {
        newPlayers.push({ id: uuidv4(), name: "" });
      }

      form.setValue("players", newPlayers);
    } else if (currentPlayers.length > newCount) {
      const newPlayers = currentPlayers.slice(0, newCount);
      form.setValue("players", newPlayers);
    }

    form.setValue("playerCount", newCount);
  }, [playerCount, form]);

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

  const onSubmit = async (data) => {
    try {
      if (!customCourseName) {
        toast({
          title: "Error",
          description: "Please enter a course name",
          variant: "destructive"
        });
        return;
      }

      const holeCount = parseInt(data.holeCount);

      await initializeGame({
        id: uuidv4(),
        courseId: "custom",
        courseName: customCourseName,
        holeCount: holeCount,
        players: data.players,
        scores: [],
        currentHole: 1,
        completed: false
      });

      navigate("/game");
    } catch (error) {
      console.error("Failed to start game:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start the game. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4">
      <Card className="bg-white rounded-lg shadow-md">
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold mb-4 text-neutral-dark">
            Game Setup
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <Label
                htmlFor="courseName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Golf Course Name
              </Label>
              <div className="relative">
                <Input
                  id="courseName"
                  data-testid="input-course-name"
                  placeholder="Enter course name"
                  value={customCourseName}
                  onChange={(e) => setCustomCourseName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Course Type
              </Label>
              <RadioGroup
                defaultValue={form.getValues("holeCount")}
                onValueChange={(value) => form.setValue("holeCount", value)}
                className="flex gap-4"
              >
                <div className="flex items-center">
                  <RadioGroupItem
                    value="9"
                    id="nineHoles"
                    data-testid="radio-9-holes"
                  />
                  <Label
                    htmlFor="nineHoles"
                    className="ml-2 text-sm text-gray-700"
                  >
                    9 Holes
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem
                    value="18"
                    id="eighteenHoles"
                    data-testid="radio-18-holes"
                  />
                  <Label
                    htmlFor="eighteenHoles"
                    className="ml-2 text-sm text-gray-700"
                  >
                    18 Holes
                  </Label>
                </div>
              </RadioGroup>
              {form.formState.errors.holeCount && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.holeCount.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <Label
                htmlFor="playerCount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Number of Players
              </Label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={decreasePlayerCount}
                  data-testid="button-decrease-players"
                  className="px-3 py-1 rounded-l-md"
                >
                  -
                </Button>
                <Input
                  type="number"
                  id="playerCount"
                  data-testid="input-player-count"
                  value={playerCount}
                  readOnly
                  className="w-12 py-1 px-2 text-center rounded-none border-x-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={increasePlayerCount}
                  data-testid="button-increase-players"
                  className="px-3 py-1 rounded-r-md"
                >
                  +
                </Button>
              </div>
              {form.formState.errors.playerCount && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.playerCount.message}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-5">
              {form.watch("players").map((player, index) => (
                <PlayerNameInput key={player.id} index={index} form={form} />
              ))}
              {form.formState.errors.players && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.players.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="button-start-game"
              className="w-full py-2 px-4 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition"
            >
              Start Game
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
