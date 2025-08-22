import React, { useState, useEffect } from 'react';
import { MemoryGame } from '../components/games/MemoryGame';
import { QuizGame } from '../components/games/QuizGame';
import { WordScrambleGame } from '../components/games/WordScrambleGame';
import { PatternMatchGame } from '../components/games/PatternMatchGame';
import { ColorMatchGame } from '../components/games/ColorMatchGame';
import { ReactionGame } from '../components/games/ReactionGame';
import { Trophy, Brain, Puzzle, Palette, Zap, Text } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type GameType = 'memory' | 'quiz' | 'wordScramble' | 'pattern' | 'color' | 'reaction' | null;

export function Games() {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const { user, updateDailyTask } = useAuth();
  const [hasStartedGame, setHasStartedGame] = useState(false);

  useEffect(() => {
    // Update task when user starts playing any game
    if (hasStartedGame && user && !user.dailyTasks?.tasks.gameAttempted) {
      updateDailyTask('gameAttempted');
    }
  }, [hasStartedGame, user]);

  const handleGameStart = (gameType: GameType) => {
    setActiveGame(gameType);
    setHasStartedGame(true);
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'memory':
        return <MemoryGame />;
      case 'quiz':
        return <QuizGame />;
      case 'wordScramble':
        return <WordScrambleGame />;
      case 'pattern':
        return <PatternMatchGame />;
      case 'color':
        return <ColorMatchGame />;
      case 'reaction':
        return <ReactionGame />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Mini Games</h1>
        <p className="text-gray-600">
          Play games to earn points and unlock exclusive rewards!
          {user && <span className="ml-2">Your current points: {user.points}</span>}
        </p>
      </div>

      {!activeGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GameCard
            title="Memory Flip"
            description="Match pairs of cards to earn points. The faster you complete, the more points you earn!"
            icon={<Brain className="h-8 w-8" />}
            onClick={() => handleGameStart('memory')}
          />
          <GameCard
            title="Quiz Master"
            description="Test your knowledge with our trivia questions. Each correct answer earns you points!"
            icon={<Trophy className="h-8 w-8" />}
            onClick={() => handleGameStart('quiz')}
          />
          <GameCard
            title="Word Scramble"
            description="Unscramble fashion-related words before time runs out!"
            icon={<Text className="h-8 w-8" />}
            onClick={() => handleGameStart('wordScramble')}
          />
          <GameCard
            title="Pattern Match"
            description="Remember and repeat the pattern sequence to earn points!"
            icon={<Puzzle className="h-8 w-8" />}
            onClick={() => handleGameStart('pattern')}
          />
          <GameCard
            title="Color Match"
            description="Match the color name with its correct color as fast as you can!"
            icon={<Palette className="h-8 w-8" />}
            onClick={() => handleGameStart('color')}
          />
          <GameCard
            title="Quick React"
            description="Test your reaction speed by clicking shapes as they appear!"
            icon={<Zap className="h-8 w-8" />}
            onClick={() => handleGameStart('reaction')}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={() => setActiveGame(null)}
            className="mb-4 text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Games
          </button>
          {renderGame()}
        </div>
      )}
    </div>
  );
}

function GameCard({ title, description, icon, onClick }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}