import { Button } from "@/components/ui/button";

interface QuestionnaireSuccessProps {
  onStartOver: () => void;
}

export function QuestionnaireSuccess({
  onStartOver,
}: QuestionnaireSuccessProps) {
  return (
    <div className="questionnaire-container">
      <div className="questionnaire-card">
        <div className="questionnaire-success-container">
          <div className="questionnaire-success-icon">
            <svg
              className="w-10 h-10 text-[var(--questionnaire-success)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h1 className="questionnaire-success-title">Thank You!</h1>
            <p className="questionnaire-success-message">
              Your responses have been submitted successfully. We appreciate you
              taking the time to share your feedback with us.
            </p>
          </div>
          <Button onClick={onStartOver} variant="outline" size="lg">
            Take Survey Again
          </Button>
        </div>
      </div>
    </div>
  );
}
