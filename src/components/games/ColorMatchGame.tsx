import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' }
];

export function ColorMatchGame() {
  const [targetColor, setTargetColor] = useState({ name: '', hex: '' });
  const [options, setOptions] = useState<typeof COLORS>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const { updateUserPoints } = useAuth();

  const shuffleColors = () => {
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    const remainingColors = shuffled.slice(1);
    const gameOptions = [target, ...remainingColors.slice(0, 3)]
      .sort(() => Math.random() - 0.5);
    
    setTargetColor(target);
    setOptions(gameOptions);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    shuffleColors();
  };

  useEffect(() => {
    let timer: number;
    if (gameActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  const handleColorClick = (color: typeof COLORS[0]) => {
    if (color.hex === targetColor.hex) {
      setScore(prev => prev + 1);
      shuffleColors();
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setGameActive(false);
    const points = score * 10;
    if (points > 0) {
      await updateUserPoints(points, 'memory');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {!gameActive ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Color Match</h2>
          <p className="mb-4 text-gray-600">
            Match the displayed color name with its correct color!
          </p>
          <button
            onClick={startGame}
            className="btn-primary"
          >
            Start Game
          </button>
          {score > 0 && (
            <p className="mt-4 text-lg">
              Final Score: {score} matches ({score * 10} points)
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-lg font-semibold">Score: {score}</span>
            </div>
            <div>
              <span className="text-lg font-semibold">Time: {timeLeft}s</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 
              className="text-3xl font-bold mb-4"
              style={{ color: targetColor.hex }}
            >
              {targetColor.name}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorClick(color)}
                className="h-24 rounded-lg transition-transform hover:scale-105"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}