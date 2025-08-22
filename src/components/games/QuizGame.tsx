import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const QUESTIONS = [
  {
    question: "Which fabric is most commonly used for t-shirts?",
    options: ["Cotton", "Silk", "Polyester", "Wool"],
    correct: 0
  },
  {
    question: "What year was the first printed t-shirt made?",
    options: ["1942", "1950", "1939", "1960"],
    correct: 2
  },
  {
    question: "Which color t-shirt is traditionally considered most versatile?",
    options: ["Red", "White", "Black", "Blue"],
    correct: 2
  },
  {
    question: "What is the average lifespan of a well-maintained t-shirt?",
    options: ["6 months", "1 year", "2-3 years", "4-5 years"],
    correct: 2
  }
];

export function QuizGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { updateUserPoints } = useAuth();

  const handleAnswer = async (selectedIndex: number) => {
    const correct = selectedIndex === QUESTIONS[currentQuestion].correct;
    
    if (correct) {
      const streakBonus = streak >= 2 ? 5 : 0;
      const pointsEarned = 10 + streakBonus;
      setScore(score + pointsEarned);
      setStreak(streak + 1);
      await updateUserPoints(pointsEarned, 'quiz');
    } else {
      setStreak(0);
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setGameComplete(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setGameComplete(false);
  };

  if (gameComplete) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Complete!</h2>
        <p className="text-lg text-gray-700 mb-4">
          Your final score: {score} points
        </p>
        <button
          onClick={restartGame}
          className="btn-primary"
        >
          Play Again
        </button>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Quiz Master</h2>
          <div className="text-right">
            <p className="text-gray-600">Score: {score}</p>
            {streak >= 2 && (
              <p className="text-indigo-600">
                🔥 {streak} Question Streak!
              </p>
            )}
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl text-gray-800 mb-4">
          {question.question}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors duration-200"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}