import { useLocation } from "wouter";
import { HomeIcon, Volleyball, BarChartIcon } from "lucide-react";

export function Navigation() {
  const [location, navigate] = useLocation();
  
  const isActive = (path) => location === path;
  
  return (
    <footer className="bg-white border-t border-gray-200 shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between">
          <button 
            onClick={() => navigate("/")}
            data-testid="nav-home"
            className={`p-2 text-center flex-1 flex flex-col items-center ${isActive("/") ? "text-primary" : "text-gray-500"}`}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            onClick={() => navigate("/game")}
            data-testid="nav-game"
            className={`p-2 text-center flex-1 flex flex-col items-center ${isActive("/game") ? "text-primary" : "text-gray-500"}`}
          >
            <Volleyball className="h-5 w-5" />
            <span className="text-xs mt-1">Game</span>
          </button>
          
          <button 
            onClick={() => navigate("/summary")}
            data-testid="nav-summary"
            className={`p-2 text-center flex-1 flex flex-col items-center ${isActive("/summary") ? "text-primary" : "text-gray-500"}`}
          >
            <BarChartIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Summary</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
