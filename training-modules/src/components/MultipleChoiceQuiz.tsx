import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "../hooks/useSession";
import { useAuth } from "../hooks/useAuth";

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
      id: "scenario1_q1",
      question: "What condition is indicated by this ECG?",
      options: [
        "Third Degree Block",
        "Failure to capture",
        "Bradycardia",
        "Atrial fibrillation",
      ],
      correctAnswer: 2,
      explanation:
        "The ECG shows bradycardia with a heart rate of 40 BPM, which is below the normal range.",
    },
    {
      id: "scenario1_q2",
      question:
        "You want to evaluate their intrinsic rhythm and adjust pacemaker settings appropriately. What is the correct sequence of steps?",
      options: [
        "Lower the base rate, lower aOutput, then decrease sensitivity until sensing occurs",
        "Increase the rate, increase aOutput, and maximize sensitivity",
        "Switch to asynchronous mode, increase output, and monitor for capture",
        "Disable the pacemaker to assess rhythm, then re-enable it with default settings",
      ],
      correctAnswer: 0,
      explanation:
        "To evaluate intrinsic rhythm, you need to temporarily lower the pacing rate and adjust sensitivity to detect the patient's own cardiac activity.",
    },
    {
      id: "scenario1_q3",
      question:
        "What mode would you put your pacemaker in to start this? You have Atrial leads connected.",
      options: ["VOO", "AAI", "VVI", "DDD"],
      correctAnswer: 1,
      explanation:
        "AAI mode is appropriate when you have atrial leads and want atrial pacing with inhibition based on sensed atrial activity.",
    },
  ],
  2: [
    {
      id: "scenario2_q1",
      question: "What is the primary issue shown in this ECG pattern?",
      options: [
        "Oversensing",
        "Undersensing",
        "Battery failure",
        "Lead fracture",
      ],
      correctAnswer: 0,
      explanation:
        "Oversensing occurs when the pacemaker detects signals that shouldn't inhibit pacing, leading to inappropriate inhibition.",
    },
    {
      id: "scenario2_q2",
      question: "How would you correct oversensing?",
      options: [
        "Increase sensitivity",
        "Decrease sensitivity",
        "Increase pacing rate",
        "Replace the battery",
      ],
      correctAnswer: 1,
      explanation:
        "Decreasing sensitivity makes the pacemaker less sensitive to small signals that may cause inappropriate inhibition.",
    },
  ],
  3: [
    {
      id: "scenario3_q1",
      question: "What adjustment is needed to correct undersensing?",
      options: [
        "Increase sensitivity",
        "Decrease sensitivity",
        "Change pacing mode",
        "Replace battery",
      ],
      correctAnswer: 0,
      explanation:
        "Increasing sensitivity makes the pacemaker more sensitive to detect smaller intrinsic cardiac signals.",
    },
    {
      id: "scenario3_q2",
      question: "What could be a cause of undersensing?",
      options: [
        "Lead displacement",
        "Electromagnetic interference",
        "Low battery",
        "All of the above",
      ],
      correctAnswer: 3,
      explanation:
        "All of these factors can contribute to undersensing by affecting the pacemaker's ability to detect intrinsic cardiac activity.",
    },
  ],
  4: [
    {
      id: "capture_q1",
      question: "What indicates successful cardiac capture?",
      options: [
        "Pacing spike followed by QRS complex",
        "Pacing spike only",
        "No pacing spike visible",
        "Irregular heart rhythm",
      ],
      correctAnswer: 0,
      explanation:
        "Successful capture is indicated by a pacing spike followed by an appropriate cardiac response (QRS for ventricular pacing, P-wave for atrial pacing).",
    },
    {
      id: "capture_q2",
      question:
        "What is the typical starting point for capture threshold testing?",
      options: ["1.0 mA", "5.0 mA", "10.0 mA", "20.0 mA"],
      correctAnswer: 1,
      explanation:
        "Capture threshold testing typically starts at 5.0 mA and is gradually decreased until loss of capture occurs.",
    },
  ],
  5: [
    {
      id: "failure_capture_q1",
      question: "How do you correct failure to capture?",
      options: [
        "Increase pacing output",
        "Decrease pacing output",
        "Increase sensitivity",
        "Check battery only",
      ],
      correctAnswer: 0,
      explanation:
        "Failure to capture is corrected by increasing the pacing output (mA) to provide sufficient energy to stimulate the heart muscle.",
    },
    {
      id: "failure_capture_q2",
      question: "What could cause failure to capture?",
      options: [
        "Lead displacement",
        "Inadequate output energy",
        "Scar tissue at electrode site",
        "All of the above",
      ],
      correctAnswer: 3,
      explanation:
        "All of these factors can prevent the pacemaker from successfully capturing and stimulating the heart muscle.",
    },
  ],
};

const MultipleChoiceQuiz = ({
  moduleId,
  onComplete,
  className = "",
}: MultipleChoiceQuizProps) => {
  const { currentUser } = useAuth();
  const { currentSession, updateSession, startSession } = useSession(
    currentUser?.id,
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [questionsRevealed, setQuestionsRevealed] = useState<
    Record<string, boolean>
  >({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const questions = quizData[moduleId] || [];
  const currentQuestion = questions[currentQuestionIndex];

  // ✅ SIMPLE FIX: Restore quiz state from session
  useEffect(() => {
    if (!currentSession?.quizState || questions.length === 0) return;

    const { quizState } = currentSession;

    if (quizState.isCompleted) {
      setQuizCompleted(true);
      setShowReviewMode(true);

      const restoredAnswers: Record<string, number> = {};
      const restoredRevealed: Record<string, boolean> = {};

      quizState.answers.forEach((answer) => {
        const question = questions[answer.questionIndex];
        if (question) {
          restoredAnswers[question.id] = answer.selectedAnswer;
          restoredRevealed[question.id] = true;
        }
      });

      setSelectedAnswers(restoredAnswers);
      setQuestionsRevealed(restoredRevealed);
    } else {
      setCurrentQuestionIndex(quizState.currentQuestionIndex || 0);

      const restoredAnswers: Record<string, number> = {};
      const restoredRevealed: Record<string, boolean> = {};

      quizState.answers.forEach((answer) => {
        const question = questions[answer.questionIndex];
        if (question) {
          restoredAnswers[question.id] = answer.selectedAnswer;
          if (answer.isCorrect !== undefined) {
            restoredRevealed[question.id] = true;
          }
        }
      });

      setSelectedAnswers(restoredAnswers);
      setQuestionsRevealed(restoredRevealed);
    }
  }, [currentSession?.id, questions.length]);

  // Reset when moduleId changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuestionsRevealed({});
    setQuizCompleted(false);
    setShowReviewMode(false);
    setSessionReady(false);
  }, [moduleId]);

  if (!currentQuestion) {
    return (
      <div
        className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
      >
        <p className="text-gray-500 text-center">
          No quiz available for this module.
        </p>
      </div>
    );
  }

  // ✅ SIMPLE FIX: Create session only when needed
  const ensureSession = () => {
    if (!currentSession && currentUser && !sessionReady) {
      console.log("Creating session for quiz");
      const sessionId = startSession(moduleId.toString(), `Module ${moduleId}`);
      setSessionReady(true);
      return sessionId;
    }
    return currentSession?.id;
  };

  const handleAnswerSelect = useCallback(
    (answerIndex: number) => {
      if (questionsRevealed[currentQuestion.id] || showReviewMode) return;

      // ✅ SIMPLE FIX: Update immediately, save later
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answerIndex,
      }));

      // Create session if needed
      const sessionId = ensureSession();
      if (!sessionId) return;

      // Save to session (simple approach)
      if (currentSession) {
        const existingAnswers = currentSession.quizState.answers || [];
        const existingIndex = existingAnswers.findIndex(
          (a) => a.questionIndex === currentQuestionIndex,
        );

        let updatedAnswers;
        if (existingIndex >= 0) {
          updatedAnswers = [...existingAnswers];
          updatedAnswers[existingIndex] = {
            ...updatedAnswers[existingIndex],
            selectedAnswer: answerIndex,
            timestamp: new Date().toISOString(),
          };
        } else {
          updatedAnswers = [
            ...existingAnswers,
            {
              questionIndex: currentQuestionIndex,
              selectedAnswer: answerIndex,
              isCorrect: false,
              timestamp: new Date().toISOString(),
            },
          ];
        }

        updateSession(sessionId, {
          quizState: {
            ...currentSession.quizState,
            currentQuestionIndex,
            answers: updatedAnswers,
          },
        });
      }
    },
    [
      currentQuestion.id,
      questionsRevealed,
      showReviewMode,
      currentSession,
      currentQuestionIndex,
      updateSession,
    ],
  );

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswers[currentQuestion.id] === undefined) {
      alert("Please select an answer before continuing.");
      return;
    }

    const selectedAnswer = selectedAnswers[currentQuestion.id];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setQuestionsRevealed((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));

    if (currentSession) {
      const existingAnswers = currentSession.quizState.answers || [];
      const existingIndex = existingAnswers.findIndex(
        (a) => a.questionIndex === currentQuestionIndex,
      );

      let updatedAnswers;
      if (existingIndex >= 0) {
        updatedAnswers = [...existingAnswers];
        updatedAnswers[existingIndex] = {
          ...updatedAnswers[existingIndex],
          selectedAnswer,
          isCorrect,
          timestamp: new Date().toISOString(),
        };
      } else {
        updatedAnswers = [
          ...existingAnswers,
          {
            questionIndex: currentQuestionIndex,
            selectedAnswer,
            isCorrect,
            timestamp: new Date().toISOString(),
          },
        ];
      }

      updateSession(currentSession.id, {
        quizState: {
          ...currentSession.quizState,
          answers: updatedAnswers,
        },
      });
    }
  }, [
    currentQuestion,
    selectedAnswers,
    currentSession,
    currentQuestionIndex,
    updateSession,
  ]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      if (currentSession) {
        updateSession(currentSession.id, {
          quizState: {
            ...currentSession.quizState,
            currentQuestionIndex: nextIndex,
          },
        });
      }
    } else if (!quizCompleted) {
      completeQuiz();
    }
  }, [
    currentQuestionIndex,
    questions.length,
    quizCompleted,
    currentSession,
    updateSession,
  ]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      if (currentSession) {
        updateSession(currentSession.id, {
          quizState: {
            ...currentSession.quizState,
            currentQuestionIndex: prevIndex,
          },
        });
      }
    }
  }, [currentQuestionIndex, currentSession, updateSession]);

  const completeQuiz = useCallback(() => {
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const passed = correctAnswers >= Math.ceil(questions.length * 0.7);

    setQuizCompleted(true);
    setShowReviewMode(true);

    if (currentSession) {
      updateSession(currentSession.id, {
        currentStep: "practice",
        quizState: {
          ...currentSession.quizState,
          isCompleted: true,
          score: correctAnswers,
          totalQuestions: questions.length,
        },
      });
    }

    onComplete(passed, correctAnswers, questions.length);
  }, [questions, selectedAnswers, currentSession, updateSession, onComplete]);

  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const isRevealed = questionsRevealed[currentQuestion.id] || showReviewMode;
  const isAnswered = selectedAnswer !== undefined;
  const allQuestionsAttempted = questions.every(
    (q) => selectedAnswers[q.id] !== undefined,
  );

  const currentScore = Object.keys(selectedAnswers).reduce(
    (correct, questionId) => {
      const question = questions.find((q) => q.id === questionId);
      return (
        correct +
        (question && selectedAnswers[questionId] === question.correctAnswer
          ? 1
          : 0)
      );
    },
    0,
  );

  const scorePercentage =
    questions.length > 0
      ? Math.round((currentScore / questions.length) * 100)
      : 0;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold">Knowledge Assessment</h3>
          {quizCompleted && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                scorePercentage >= 70
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              Score: {currentScore}/{questions.length} ({scorePercentage}%)
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : selectedAnswers[questions[index].id] !== undefined
                    ? selectedAnswers[questions[index].id] ===
                      questions[index].correctAnswer
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                    : "bg-gray-100 text-gray-600 border border-gray-300"
              }`}
              disabled={
                !showReviewMode &&
                !questionsRevealed[questions[index].id] &&
                index !== currentQuestionIndex
              }
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
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Review mode indicator */}
      {showReviewMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-blue-800 text-sm font-medium">
            📚 Review Mode: You can now navigate through all questions to review
            your answers. Use this information to help guide your pacemaker
            adjustments!
          </p>
        </div>
      )}

      {/* Question */}
      <h4 className="text-lg font-medium mb-6">{currentQuestion.question}</h4>

      {/* Answer options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = index === currentQuestion.correctAnswer;

          let buttonClass =
            "w-full text-left p-4 rounded-lg border transition-all duration-200 ";

          if (!isRevealed) {
            buttonClass += isSelected
              ? "border-blue-500 bg-blue-50 text-blue-900"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
          } else {
            if (isSelected && isCorrect) {
              buttonClass += "border-green-500 bg-green-50 text-green-900";
            } else if (isSelected && !isCorrect) {
              buttonClass += "border-red-500 bg-red-50 text-red-900";
            } else if (isCorrectAnswer) {
              buttonClass += "border-green-500 bg-green-50 text-green-900";
            } else {
              buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
            }

            if (showReviewMode) {
              buttonClass += " cursor-pointer hover:opacity-80";
            } else {
              buttonClass += " cursor-default";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isRevealed || showReviewMode}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isRevealed && (
                  <span className="text-lg">
                    {isSelected && isCorrect && "✅"}
                    {isSelected && !isCorrect && "❌"}
                    {!isSelected && isCorrectAnswer && "✅"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isRevealed && currentQuestion.explanation && (
        <div
          className={`p-4 rounded-lg mb-6 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}
        >
          <h5
            className={`font-medium mb-2 ${isCorrect ? "text-green-800" : "text-orange-800"}`}
          >
            {isCorrect
              ? "✅ Correct!"
              : showReviewMode
                ? "ℹ️ Explanation:"
                : "❌ Not quite right"}
          </h5>
          <p
            className={`text-sm ${isCorrect ? "text-green-700" : "text-orange-700"}`}
          >
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
          {!showReviewMode ? (
            !isRevealed && isAnswered ? (
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
                  Complete Assessment
                </button>
              ) : (
                <div className="text-sm text-gray-600">
                  Please answer all questions to complete
                </div>
              )
            ) : null
          ) : (
            currentQuestionIndex < questions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className="inline-flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Next Question
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Final completion message */}
      {quizCompleted && !showReviewMode && (
        <div className="mt-6 text-center">
          <div
            className={`text-6xl mb-4 ${scorePercentage >= 70 ? "text-green-500" : "text-orange-500"}`}
          >
            {scorePercentage >= 70 ? "🎉" : "📚"}
          </div>
          <p className="text-lg mb-2">
            Assessment Complete: {currentScore}/{questions.length} (
            {scorePercentage}%)
          </p>
          <p className="text-gray-600 mb-6">
            {scorePercentage >= 70
              ? "Great job! You can now proceed with the hands-on training."
              : "Review the concepts and use the hands-on training to reinforce your learning."}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              ✅ You can now access the pacemaker controls and use your
              knowledge to complete the training scenario.
            </p>
            {currentSession && (
              <p className="text-blue-700 text-sm mt-2">
                Session saved - you can resume this module anytime from where
                you left off.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceQuiz;