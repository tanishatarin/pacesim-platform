import React from "react";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeSessionBannerProps {
  session: {
    id: string;
    moduleId: string;
    moduleName: string;
    currentStep: string;
    lastActiveAt: string;
  };
  onResume: () => void;
  onTryAgain?: (success: boolean) => void;
}

const ResumeSessionBanner: React.FC<ResumeSessionBannerProps> = ({
  session,
  onResume,
  onTryAgain,
}) => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - then) / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const handleStartOver = () => {
    if (onTryAgain) {
      onTryAgain(false); // End current session and reset everything
    }
  };

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Play className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">
              Continue Previous Session
            </h3>
            <p className="text-sm text-blue-700">
              {session.moduleName} • {session.currentStep} • Last active{" "}
              {formatTimeAgo(session.lastActiveAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartOver}
            className="text-gray-600 border-gray-300"
          >
            <X className="w-4 h-4 mr-1" />
            Start Over
          </Button>
          <Button
            size="sm"
            onClick={onResume}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeSessionBanner;