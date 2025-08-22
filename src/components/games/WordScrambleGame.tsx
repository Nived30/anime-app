import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const WORDS = [
  { word: 'COTTON', hint: 'Most common t-shirt material' },
  { word: 'SLEEVE', hint: 'Arm covering part of a shirt' },
  { word: 'COLLAR', hint: 'Neckline of a shirt' },
  { word: 'FABRIC', hint: 'Material used to make clothes' },
  { word: 'DESIGN', hint: 'Artistic pattern or graphic' },
  { word: 'STITCH', hint: 'Single loop of thread in sewing' },
  { word: 'BUTTON', hint: 'Fastener for clothes' },
  { word: 'THREAD', hint: 'Used to sew clothes together' },
  { word: 'DENIM', hint: 'Sturdy cotton warp-faced textile' },
  { word: 'POCKET', hint: 'Small bag sewn into clothing' },
  { word: 'ZIPPER', hint: 'Sliding fastener with teeth' },
  { word: 'SEAM', hint: 'Line where pieces are sewn together' },
  { word: 'PLEAT', hint: 'Fold in fabric for style or fit' },
  { word: 'BLEND', hint: 'Mix of different fabric types' },
  { word: 'PRINT', hint: 'Pattern or design on fabric' },
  { word: 'KNIT', hint: 'Fabric made by interlocking yarn' },
  { word: 'STYLE', hint: 'Fashion or design aesthetic' },
  { word: 'BRAND', hint: 'Maker or company identifier' },
  { word: 'MODEL', hint: 'Person who displays clothing' },
  { word: 'TREND', hint: 'Current fashion movement' }
];

export function WordScrambleGame() {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [hint, setHint] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const { updateUserPoints } = useAuth();

  const scrambleWord = (word: string) => {
    let scrambled = word;
    while (scrambled === word) {
      scrambled = word.split('')
        .sort(() => Math.random() - 0.5)
        .join('');
    }
    return scrambled;
  };

  const selectNewWord = () => {
    const availableWords = WORDS.filter(w => !usedWords.has(w.word));
    if (availableWords.length === 0) {
      setUsedWords(new Set()); // Reset used words if all have been used
      const wordObj = WORDS[Math.floor(Math.random() * WORDS.length)];
      setCurrentWord(wordObj.word);
      setHint(wordObj.hint);
      setScrambledWord(scrambleWord(wordObj.word));
    } else {
      const wordObj = availableWords[Math.floor(Math.random() * availableWords.length)];
      setCurrentWord(wordObj.word);
      setHint(wordObj.hint);
      setScrambledWord(scrambleWord(wordObj.word));
      setUsedWords(new Set([...usedWords, wordObj.word]));
    }
    setUserInput('');
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setUsedWords(new Set());
    selectNewWord();
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

  const endGame = async () => {
    setGameActive(false);
    const points = score * 10;
    if (points > 0) {
      await updateUserPoints(points, 'quiz');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.toUpperCase() === currentWord) {
      setScore(prev => prev + 1);
      selectNewWord();
    } else {
      // Visual feedback for wrong answer
      const input = document.getElementById('word-input') as HTMLInputElement;
      input?.classList.add('border-red-500');
      setTimeout(() => {
        input?.classList.remove('border-red-500');
      }, 500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {!gameActive ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Word Scramble</h2>
          <p className="mb-4 text-gray-600">
            Unscramble fashion-related words before time runs out!
          </p>
          <button
            onClick={startGame}
            className="btn-primary"
          >
            Start Game
          </button>
          {score > 0 && (
            <p className="mt-4 text-lg">
              Final Score: {score} words ({score * 10} points)
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
            <h3 className="text-3xl font-bold mb-2 tracking-wider">{scrambledWord}</h3>
            <p className="text-gray-600">Hint: {hint}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              id="word-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.toUpperCase())}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
              placeholder="Type your answer..."
              autoFocus
            />
            <button
              type="submit"
              className="w-full btn-primary"
            >
              Submit
            </button>
          </form>
        </>
      )}
    </div>
  );
}