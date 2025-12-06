import { getPlayerInitial, getPlayerColor } from "@/lib/utils";

export function PlayerScoreInput({ player, score, scoreRelative, onScoreChange }) {
  const decrementScore = () => {
    if (score > 1) {
      onScoreChange(score - 1);
    }
  };
  
  const incrementScore = () => {
    onScoreChange(score + 1);
  };
  
  const scoreClass = scoreRelative === 0 
    ? "text-gray-900" 
    : scoreRelative > 0 
      ? "text-red-600" 
      : "text-blue-600";
  
  return (
    <tr className="text-sm">
      <td className="px-3 py-3">
        <div className="flex items-center">
          <div 
            className={`flex-shrink-0 h-8 w-8 text-white rounded-full flex items-center justify-center ${getPlayerColor(player.id)}`}
          >
            {getPlayerInitial(player.name)}
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900" data-testid={`text-player-name-${player.id}`}>{player.name}</p>
          </div>
        </div>
      </td>
      <td className={`px-3 py-3 text-center font-medium ${scoreClass}`} data-testid={`text-score-${player.id}`}>{score}</td>
      <td className="px-3 py-3">
        <div className="flex justify-center items-center">
          <button 
            className="decrement-score p-1 rounded-l border border-gray-300 bg-gray-50 hover:bg-gray-100"
            onClick={decrementScore}
            data-testid={`button-decrement-${player.id}`}
          >
            -
          </button>
          <input 
            type="number" 
            className="player-score w-12 py-1 px-2 text-center border-t border-b border-gray-300 focus:outline-none" 
            value={score} 
            min="1" 
            readOnly 
            data-testid={`input-score-${player.id}`}
          />
          <button 
            className="increment-score p-1 rounded-r border border-gray-300 bg-gray-50 hover:bg-gray-100"
            onClick={incrementScore}
            data-testid={`button-increment-${player.id}`}
          >
            +
          </button>
        </div>
      </td>
    </tr>
  );
}
