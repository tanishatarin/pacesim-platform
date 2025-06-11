import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import ECGVisualizer from '../components/ECGVisualizer';

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock module data
  const moduleData = {
    1: {
      title: 'Scenario 1',
      objective: 'Diagnose and correct a failure to sense condition. Answer the multiple choice at the bottom and then adjust the pacemaker.\nScenario: You come back into a patient\'s room the next day and see this pattern on their ECG. Their heart rate has dropped to 40 and attached to the patient, you have A leads.',
      mode: 'sensitivity' as const,
      quiz: {
        question: 'What condition is indicated by this ECG?',
        options: ['Third Degree Block', 'Failure to capture', 'Bradycardia', 'Atrial fibrillation'],
        correctAnswer: 2
      }
    },
    2: {
      title: 'Scenario 2',
      objective: 'Diagnose and correct scenario\nfor notes: failure to capture, oversensing module',
      mode: 'oversensing' as const,
      quiz: {
        question: 'What is the primary issue shown?',
        options: ['Oversensing', 'Undersensing', 'Battery failure', 'Lead fracture'],
        correctAnswer: 0
      }
    },
    3: {
      title: 'Scenario 3',
      objective: 'Diagnose and correct scenario\nfor notes: failure to sense, undersensing module',
      mode: 'undersensing' as const,
      quiz: {
        question: 'What adjustment is needed?',
        options: ['Increase sensitivity', 'Decrease sensitivity', 'Change mode', 'Replace battery'],
        correctAnswer: 0
      }
    },
    4: {
      title: 'Capture Module',
      objective: 'Learn to correctly capture',
      mode: 'capture_module' as const,
      quiz: {
        question: 'What indicates successful capture?',
        options: ['Spike followed by QRS', 'Spike only', 'No spike', 'Irregular rhythm'],
        correctAnswer: 0
      }
    },
    5: {
      title: 'Failure to Capture',
      objective: 'Correct a failure to capture',
      mode: 'failure_to_capture' as const,
      quiz: {
        question: 'How do you correct failure to capture?',
        options: ['Increase output', 'Decrease output', 'Change sensitivity', 'Check battery'],
        correctAnswer: 0
      }
    }
  };

  const currentModule = moduleId ? moduleData[Number(moduleId) as keyof typeof moduleData] : undefined;

  if (!currentModule) {
    return <div>Module not found</div>;
  }

  const handleComplete = (success: boolean) => {
    setIsSuccess(success);
    setShowCompletion(true);
  };

  return (
    <>
      {showCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-lg text-center relative">
            <div className="flex flex-col items-center justify-center py-6">
              {isSuccess ? (
                <>
                  <CheckCircle className="w-24 h-24 mb-6 text-green-500" />
                  <h2 className="mb-4 text-3xl font-bold">Module Completed!</h2>
                  <p className="mb-8 text-lg">Great job! You've successfully completed this module.</p>
                </>
              ) : (
                <>
                  <XCircle className="w-24 h-24 mb-6 text-red-500" />
                  <h2 className="mb-4 text-3xl font-bold">Module Incomplete</h2>
                  <p className="mb-8 text-lg">Don't worry! You can try this module again.</p>
                </>
              )}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => navigate('/modules')}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Return to Menu
                </button>
                <button
                  onClick={() => {
                    setShowCompletion(false);
                    setSelectedAnswer(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-8 py-8 bg-white shadow-lg rounded-3xl">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold leading-tight mb-2">
            Module {moduleId}: {currentModule.title}
          </h2>
          <button className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center hover:bg-blue-200 ml-2">
            <Lightbulb className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-2 font-bold">Objective:</h3>
              <p className="whitespace-pre-line">{currentModule.objective}</p>
            </div>

            <div className="p-2 rounded-xl text-sm bg-yellow-100 text-yellow-800">
              Simulated Mode Active
            </div>

            <div className="mt-6">
              <ECGVisualizer
                rate={40}
                aOutput={5}
                vOutput={5}
                sensitivity={2}
                mode={currentModule.mode}
              />
              <div className="py-1 mt-2 text-xs text-center text-yellow-700 rounded-lg bg-yellow-50">
                Simulated ECG - Connect hardware for real data
              </div>
            </div>

            {/* Quiz Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="mb-4 text-lg font-bold">{currentModule.quiz.question}</h3>
              <div className="space-y-3">
                {currentModule.quiz.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#F0F6FE] rounded-xl p-4">
              <h3 className="mb-4 font-bold">Sensing Lights:</h3>
            <div className="flex justify-around">
                <div className="flex flex-col items-center" style={{ marginRight: '-16px' }}>
                    <div className="w-16 h-16 rounded-full bg-green-400" />
                    <span className="mt-2 text-sm text-gray-600">Left</span>
                </div>
                <div className="flex flex-col items-center" style={{ marginLeft: '-16px' }}>
                    <div className="w-16 h-16 rounded-full bg-blue-400" />
                    <span className="mt-2 text-sm text-gray-600">Right</span>
                </div>
            </div>
            </div>

            <div className="bg-[#F0F6FE] rounded-xl p-4 h-32">
              <h3 className="mb-2 font-bold">Patient HR</h3>
              <div className="flex justify-center">
                <span className="text-5xl text-gray-600 font">40</span>
              </div>
            </div>

            <div className="bg-[#F0F6FE] rounded-xl p-4 h-32">
              <h3 className="mb-2 font-bold">Patient Blood Pressure</h3>
              <div className="flex justify-center">
                <span className="text-5xl text-gray-600 font">120/80</span>
              </div>
            </div>

            <div className="bg-[#F0F6FE] rounded-xl p-4 h-32">
              <h3 className="mb-2 font-bold">Pacemaker HR</h3>
              <div className="flex justify-center">
                <span className="text-5xl text-gray-600 font">40</span>
              </div>
            </div>

            <div className="flex mt-6 space-x-3">
              <button 
                onClick={() => handleComplete(false)}
                className="w-1/2 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50"
              >
                Fail Module
              </button>
              <button 
                onClick={() => handleComplete(true)}
                className="w-1/2 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Complete
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => navigate('/modules')}
            className="px-0 text-gray-600 hover:text-gray-800 flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Exit Module
          </button>
        </div>
      </div>
    </>
  );
};

export default ModulePage;