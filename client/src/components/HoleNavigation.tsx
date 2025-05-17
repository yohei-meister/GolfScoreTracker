import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HoleNavigationProps {
  holes: number[];
  currentHole: number;
  onHoleSelect: (holeNumber: number) => void;
}

export function HoleNavigation({ holes, currentHole, onHoleSelect }: HoleNavigationProps) {
  return (
    <Card className="mb-4 bg-white rounded-lg shadow overflow-x-auto">
      <div className="flex p-2 min-w-max">
        {holes.map(holeNumber => (
          <button
            key={holeNumber}
            onClick={() => onHoleSelect(holeNumber)}
            className={cn(
              "hole-btn min-w-[40px] h-10 mx-1 rounded-full flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-primary transition",
              holeNumber === currentHole
                ? "bg-primary text-white hover:bg-blue-600"
                : "bg-gray-200 hover:bg-gray-300"
            )}
          >
            {holeNumber}
          </button>
        ))}
      </div>
    </Card>
  );
}
