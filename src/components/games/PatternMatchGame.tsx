import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_PATTERN_LENGTH = 2;
const MAX_PATTERN_LENGTH = 8;

export function PatternMatchGame() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showingPattern, setShowingPattern] = useState(false);
  const [currentLength, setCurrentLength] = useState(INITIAL_PATTERN_LENGTH);
  const { updateUserPoints } = useAuth();

  const generatePattern = (length: number) => {
    return Array.from({ length }, () => 
      Math.random() < 0.5 ? '⬜' : '⬛'
    );
  };

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setCurrentLength(INITIAL_PATTERN_LENGTH);
    nextRound();
  };

  const nextRound = () => {
    const newPattern = generatePattern(currentLength);
    setSequence(newPattern);
    setPlayerSequence([]);
    setShowingPattern(true);
    
    // Show pattern for longer as it gets more complex
    const showTime = 1000 + (currentLength * 500);
    setTimeout(() => {
      setShowingPattern(false);
    }, showTime);
  };

  const handlePatternClick = (pattern: string) => {
    if (showingPattern || gameOver) return;

    const newPlayerSequence = [...playerSequence, pattern];
    setPlayerSequence(newPlayerSequence);

    // Check if the new input is correct so far
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      endGame();
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      // Completed the sequence successfully
      setScore(prev => prev + currentLength);
      
      if (currentLength < MAX_PATTERN_LENGTH) {
        setCurrentLength(prev => prev + 1);
      }
      
      setTimeout(() => {
        nextRound();
      }, 500);
    }
  };

  const endGame = async () => {
    setGameOver(true);
    const points = score * 15;
    if (points > 0) {
      await updateUserPoints(points, 'memory');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Pattern Match</h2>
        <p className="text-gray-600">
          Remember and repeat the pattern to earn points!
        </p>
        <div className="mt-4">
          <span className="text-lg font-semibold">Score: {score}</span>
          {!gameOver && sequence.length > 0 && (
            <span className="ml-4 text-lg font-semibold">
              Level: {currentLength - 1}
            </span>
          )}
        </div>
      </div>

      {!gameOver ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array(MAX_PATTERN_LENGTH).fill(null).map((_, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center text-4xl 
                  ${index < currentLength ? 'bg-gray-100' : 'bg-gray-50'} 
                  rounded-lg transition-colors duration-200
                `}
              >
                {showingPattern && index < currentLength ? sequence[index] : '⬜'}
              </div>
            ))}
          </div>

          {!showingPattern && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePatternClick('⬜')}
                className="p-6 text-4xl bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                ⬜
              </button>
              <button
                onClick={() => handlePatternClick('⬛')}
                className="p-6 text-4xl bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                ⬛
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <p className="text-xl mb-4">Game Over! Final Score: {score}</p>
          <p className="text-gray-600 mb-4">
            You reached level {currentLength - 1}!
          </p>
          <button
            onClick={startGame}
            className="btn-primary"
          >
            Play Again
          </button>
        </div>
      )}

      {!gameOver && !score && (
        <div className="text-center mt-6">
          <button
            onClick={startGame}
            className="btn-primary"
          >
            Start Game
          </button>
        </div>
      )}
    </div>
  );
}