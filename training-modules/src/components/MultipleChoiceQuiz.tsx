import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface MultipleChoiceQuizProps {
  moduleId: number;
  onComplete: (passed: boolean, score: number, totalQuestions: number) => void;
  className?: string;
}

// Quiz data by module
const quizData: Record<number, QuizQuestion[]> = {
  1: [
    {
      id: 'scenario1_q1',
      question: 'What condition is indicated by this ECG?',
      options: [
        'Third Degree Block',
        'Failure to capture', 
        'Bradycardia',
        'Atrial fibrillation'
      ],
      correctAnswer: 2,
      explanation: 'The ECG shows bradycardia with a heart rate of 40 BPM, which is below the normal range.'
    },
    {
      id: 'scenario1_q2',
      question: 'You want to evaluate their intrinsic rhythm and adjust pacemaker settings appropriately. What is the correct sequence of steps?',
      options: [
        'Lower the base rate, lower aOutput, then decrease sensitivity until sensing occurs',
        'Increase the rate, increase aOutput, and maximize sensitivity',
        'Switch to asynchronous mode, increase output, and monitor for capture',
        'Disable the pacemaker to assess rhythm, then re-enable it with default settings'
      ],
      correctAnswer: 0,
      explanation: 'To evaluate intrinsic rhythm, you need to temporarily lower the pacing rate and adjust sensitivity to detect the patient\'s own cardiac activity.'
    },
    {
      id: 'scenario1_q3', 
      question: 'What mode would you put your pacemaker in to start this? You have Atrial leads connected.',
      options: ['VOO', 'AAI', 'VVI', 'DDD'],
      correctAnswer: 1,
      explanation: 'AAI mode is appropriate when you have atrial leads and want atrial pacing with inhibition based on sensed atrial activity.'
    }
  ],
  2: [
    {
      id: 'scenario2_q1',
      question: 'What is the primary issue shown in this ECG pattern?',
      options: [
        'Oversensing',
        'Undersensing', 
        'Battery failure',
        'Lead fracture'
      ],
      correctAnswer: 0,
      explanation: 'Oversensing occurs when the pacemaker detects signals that shouldn\'t inhibit pacing, leading to inappropriate inhibition.'
    }
  ],
  3: [
    {
      id: 'scenario3_q1',
      question: 'What adjustment is needed to correct undersensing?',
      options: [
        'Increase sensitivity',
        'Decrease sensitivity',
        'Change pacing mode',
        'Replace battery'
      ],
      correctAnswer: 0,
      explanation: 'Increasing sensitivity makes the pacemaker more sensitive to detect smaller intrinsic cardiac signals.'
    }
  ],
  4: [
    {
      id: 'capture_q1',
      question: 'What indicates successful cardiac capture?',
      options: [
        'Pacing spike followed by QRS complex',
        'Pacing spike only',
        'No pacing spike visible',
        'Irregular heart rhythm'
      ],
      correctAnswer: 0,
      explanation: 'Successful capture is indicated by a pacing spike followed by an appropriate cardiac response (QRS for ventricular pacing, P-wave for atrial pacing).'
    }
  ],
  5: [
    {
      id: 'failure_capture_q1',
      question: 'How do you correct failure to capture?',
      options: [
        'Increase pacing output',
        'Decrease pacing output',
        'Increase sensitivity',
        'Check battery only'
      ],
      correctAnswer: 0,
      explanation: 'Failure to capture is corrected by increasing the pacing output (mA) to provide sufficient energy to stimulate the heart muscle.'
    }
  ]
};

const MultipleChoiceQuiz = ({ moduleId, onComplete, className = '' }: MultipleChoiceQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [questionsRevealed, setQuestionsRevealed] = useState<Record<string, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  const questions = quizData[moduleId] || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Reset quiz when moduleId changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuestionsRevealed({});
    setQuizCompleted(false);
  }, [moduleId]);

  if (!currentQuestion) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <p className="text-gray-500 text-center">No quiz available for this module.</p>
      </div>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    // Only allow selection if this question hasn't been revealed yet
    if (questionsRevealed[currentQuestion.id]) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswers[currentQuestion.id] === undefined) {
      alert('Please select an answer before continuing.');
      return;
    }
    
    // Mark this question as revealed
    setQuestionsRevealed(prev => ({
      ...prev,
      [currentQuestion.id]: true
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completed
      completeQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const completeQuiz = () => {
    // Calculate score
    let correctAnswers = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const passed = correctAnswers === questions.length; // Must get all correct to pass
    setQuizCompleted(true);
    onComplete(passed, correctAnswers, questions.length);
  };

  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const isRevealed = questionsRevealed[currentQuestion.id];
  const isAnswered = selectedAnswer !== undefined;

  // Check if all questions have been attempted
  const allQuestionsAttempted = questions.every(q => selectedAnswers[q.id] !== undefined);

  if (quizCompleted) {
    const score = Object.keys(selectedAnswers).reduce((correct, questionId) => {
      const question = questions.find(q => q.id === questionId);
      return correct + (question && selectedAnswers[questionId] === question.correctAnswer ? 1 : 0);
    }, 0);

    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Quiz Complete!</h3>
          <div className={`text-6xl mb-4 ${score === questions.length ? 'text-green-500' : 'text-orange-500'}`}>
            {score === questions.length ? '🎉' : '📚'}
          </div>
          <p className="text-lg mb-2">
            Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
          </p>
          <p className="text-gray-600 mb-6">
            {score === questions.length 
              ? 'Perfect! You can now proceed with the hands-on training.'
              : 'Review the concepts and try again when ready.'
            }
          </p>
          {score === questions.length && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✅ Quiz passed! You can now adjust the pacemaker settings.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header with breadcrumb navigation */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Knowledge Check</h3>
        <div className="flex items-center space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white'
                  : selectedAnswers[questions[index].id] !== undefined
                  ? selectedAnswers[questions[index].id] === questions[index].correctAnswer
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h4 className="text-lg font-medium mb-6">{currentQuestion.question}</h4>

      {/* Answer options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = index === currentQuestion.correctAnswer;
          
          let buttonClass = 'w-full text-left p-4 rounded-lg border transition-all duration-200 ';
          
          if (!isRevealed) {
            // Before revealing answer
            buttonClass += isSelected
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
          } else {
            // After revealing answer - show results, no interaction
            if (isSelected && isCorrect) {
              buttonClass += 'border-green-500 bg-green-50 text-green-900';
            } else if (isSelected && !isCorrect) {
              buttonClass += 'border-red-500 bg-red-50 text-red-900';
            } else if (isCorrectAnswer) {
              buttonClass += 'border-green-500 bg-green-50 text-green-900';
            } else {
              buttonClass += 'border-gray-200 bg-gray-50 text-gray-600';
            }
            buttonClass += ' cursor-default';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isRevealed}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isRevealed && (
                  <span className="text-lg">
                    {isSelected && isCorrect && '✅'}
                    {isSelected && !isCorrect && '❌'}
                    {!isSelected && isCorrectAnswer && '✅'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isRevealed && currentQuestion.explanation && (
        <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
          <h5 className={`font-medium mb-2 ${isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
            {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
          </h5>
          <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        
        <div className="flex space-x-3">
          {!isRevealed && isAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Answer
            </button>
          ) : isRevealed ? (
            currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next Question
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : allQuestionsAttempted ? (
              <button
                onClick={completeQuiz}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete Quiz
              </button>
            ) : (
              <div className="text-sm text-gray-600">
                Please answer all questions to complete the quiz
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MultipleChoiceQuiz;