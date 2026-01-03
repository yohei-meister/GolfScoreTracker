import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlayerNameInput({ index, form }) {
  const players = form.watch("players") || [];
  const player = players[index];

  if (!player) return null;

  return (
    <div className="player-input-group">
      <Label
        htmlFor={`player-${index}`}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Player {index + 1}
      </Label>
      <Input
        id={`player-${index}`}
        data-testid={`input-player-${index}`}
        placeholder="Enter name"
        value={player.name || ""}
        onChange={(e) => {
          const newPlayers = [...players];
          newPlayers[index] = { ...player, name: e.target.value };
          form.setValue("players", newPlayers, { shouldValidate: true });
        }}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
      />
      {form.formState.errors.players?.[index]?.name && (
        <p className="text-sm text-red-500 mt-1">
          {form.formState.errors.players[index].name.message}
        </p>
      )}
    </div>
  );
}
