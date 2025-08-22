import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const;
const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];

type Shape = typeof SHAPES[number];

interface Target {
  shape: Shape;
  color: string;
  position: { x: number; y: number };
  timestamp: number;
}

export function ReactionGame() {
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [target, setTarget] = useState<Target | null>(null);
  const [avgReactionTime, setAvgReactionTime] = useState<number>(0);
  const [totalReactions, setTotalReactions] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateUserPoints } = useAuth();

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setAvgReactionTime(0);
    setTotalReactions(0);
    spawnTarget();
  };

  const spawnTarget = () => {
    if (!containerRef.current || !gameActive) return;

    const container = containerRef.current.getBoundingClientRect();
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Leave 60px margin from edges
    const x = Math.random() * (container.width - 120) + 60;
    const y = Math.random() * (container.height - 120) + 60;

    // Random delay between 0.5 and 2 seconds
    const delay = Math.random() * 1500 + 500;
    
    setTimeout(() => {
      if (gameActive) {
        setTarget({
          shape,
          color,
          position: { x, y },
          timestamp: Date.now()
        });
      }
    }, delay);
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

  const handleTargetClick = () => {
    if (!target) return;

    const reactionTime = Date.now() - target.timestamp;
    const newTotalReactions = totalReactions + 1;
    const newAvgTime = ((avgReactionTime * totalReactions) + reactionTime) / newTotalReactions;
    
    setAvgReactionTime(newAvgTime);
    setTotalReactions(newTotalReactions);
    setScore(prev => prev + Math.max(10, 100 - Math.floor(reactionTime / 10)));
    setTarget(null);
    spawnTarget();
  };

  const endGame = async () => {
    setGameActive(false);
    setTarget(null);
    const points = score;
    if (points > 0) {
      await updateUserPoints(points, 'memory');
    }
  };

  const getShapeStyle = (shape: Shape): string => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      case 'triangle':
        return 'triangle';
      case 'diamond':
        return 'diamond';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <style>
        {`
          .triangle {
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          }
          .diamond {
            clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          }
        `}
      </style>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Quick React</h2>
        <p className="text-gray-600">
          Click the shapes as quickly as you can!
        </p>
        <div className="mt-2 flex justify-center space-x-4">
          <span className="text-lg font-semibold">Score: {score}</span>
          <span className="text-lg font-semibold">Time: {timeLeft}s</span>
          {avgReactionTime > 0 && (
            <span className="text-lg font-semibold">
              Avg. Reaction: {Math.round(avgReactionTime)}ms
            </span>
          )}
        </div>
      </div>

      {!gameActive ? (
        <div className="text-center">
          <button
            onClick={startGame}
            className="btn-primary"
          >
            Start Game
          </button>
          {score > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-lg">Final Score: {score} points</p>
              <p className="text-gray-600">
                Average Reaction Time: {Math.round(avgReactionTime)}ms
              </p>
              <p className="text-gray-600">
                Total Targets Hit: {totalReactions}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="relative h-[400px] bg-gray-100 rounded-lg cursor-crosshair"
        >
          {target && (
            <button
              onClick={handleTargetClick}
              className={`absolute w-12 h-12 transition-all duration-200 ${getShapeStyle(target.shape)}`}
              style={{
                backgroundColor: target.color,
                left: target.position.x,
                top: target.position.y,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}