import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const CARDS = [
  '👕', '👕', '👖', '👖', '👗', '👗', '🧢', '🧢',
  '👟', '👟', '👔', '👔', '🧦', '🧦', '👜', '👜'
];

interface Card {
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { updateUserPoints } = useAuth();

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...CARDS]
      .sort(() => Math.random() - 0.5)
      .map(value => ({
        value,
        isFlipped: false,
        isMatched: false
      }));
    setCards(shuffledCards);
    setFlippedIndexes([]);
    setMoves(0);
    setGameComplete(false);
  };

  const handleCardClick = (index: number) => {
    if (
      flippedIndexes.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndexes = [...flippedIndexes, index];
    setFlippedIndexes(newFlippedIndexes);

    if (newFlippedIndexes.length === 2) {
      setMoves(moves + 1);
      const [firstIndex, secondIndex] = newFlippedIndexes;

      if (cards[firstIndex].value === cards[secondIndex].value) {
        // Match found
        setTimeout(async () => {
          const newCards = [...cards];
          newCards[firstIndex].isMatched = true;
          newCards[secondIndex].isMatched = true;
          setCards(newCards);
          setFlippedIndexes([]);

          // Check if game is complete
          if (newCards.every(card => card.isMatched)) {
            setGameComplete(true);
            // Calculate points based on moves
            const points = Math.max(100 - (moves * 5), 10);
            await updateUserPoints(points, 'memory');
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const newCards = [...cards];
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards(newCards);
          setFlippedIndexes([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Memory Flip</h2>
          <p className="text-gray-600">Moves: {moves}</p>
        </div>
        <button
          onClick={initializeGame}
          className="btn-primary"
        >
          New Game
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(index)}
            className={`
              aspect-square flex items-center justify-center text-3xl
              rounded-lg cursor-pointer transition-all duration-300
              ${card.isFlipped || card.isMatched
                ? 'bg-white shadow-md'
                : 'bg-indigo-600'
              }
            `}
          >
            {(card.isFlipped || card.isMatched) && card.value}
          </div>
        ))}
      </div>

      {gameComplete && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">
            Congratulations! You completed the game in {moves} moves!
          </p>
        </div>
      )}
    </div>
  );
}