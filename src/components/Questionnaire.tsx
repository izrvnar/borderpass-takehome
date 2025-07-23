import type {
  Questionnaire as QuestionnaireType,
  QuestionnaireAnswers,
} from "@/types/questionnaire";
import { QuestionRenderer } from "./QuestionRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionnaireSuccess } from "./QuestionnaireSuccess";
import { QuestionnaireReview } from "./QuestionnaireReview";
import { Progress } from "./ui/progress";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";

interface QuestionnaireProps {
  questionnaire: QuestionnaireType;
  onComplete?: (answers: QuestionnaireAnswers) => void;
}

export function Questionnaire({
  questionnaire,
  onComplete,
}: QuestionnaireProps) {
  const {
    currentPage,
    currentQuestion,
    isFirstQuestion,
    isLastQuestion,
    answers,
    errors,
    isSubmitting,
    cameFromReview,
    handleNext,
    handleBack,
    handleAnswerChange,
    submitSurvey,
    restartSurvey,
    editQuestion,
    getProgress,
  } = useQuestionnaire({ questionnaire, onComplete });

  if (currentPage === "success") {
    return <QuestionnaireSuccess onStartOver={restartSurvey} />;
  }

  if (currentPage === "review") {
    return (
      <QuestionnaireReview
        questionnaire={questionnaire}
        answers={answers}
        errors={errors}
        isSubmitting={isSubmitting}
        onEditQuestion={editQuestion}
        onBack={handleBack}
        onSubmit={submitSurvey}
      />
    );
  }

  const progress = getProgress();

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-card">
        {/* Header */}
        <div className="questionnaire-header">
          <h1 className="questionnaire-title">{questionnaire.title}</h1>
          {questionnaire.description && (
            <p className="questionnaire-description">
              {questionnaire.description}
            </p>
          )}
        </div>

        {!cameFromReview && (
          <div className="questionnaire-progress-container">
            <div className="flex justify-between text-sm font-medium">
              <span>
                Question {progress.current} of {progress.total}
              </span>
              <span>{progress.percentage}% complete</span>
            </div>
            <Progress value={progress.percentage} className="h-3" />
          </div>
        )}
        {/* Question */}
        <div className="questionnaire-question-container">
          <div className="questionnaire-question-header">
            <div className="flex items-center gap-3">
              <h2 className="questionnaire-question-title">
                {currentQuestion.title}
              </h2>
              {currentQuestion.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
            {currentQuestion.description && (
              <p className="questionnaire-question-description">
                {currentQuestion.description}
              </p>
            )}
          </div>

          <QuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id] || null}
            onAnswerChange={handleAnswerChange}
            error={errors[currentQuestion.id]}
          />
        </div>

        {/* Navigation */}
        <div className="questionnaire-navigation">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={
              isFirstQuestion && currentPage === "question" && !cameFromReview
            }
            size="lg"
          >
            {cameFromReview ? "Back to Review" : "Back"}
          </Button>
          <Button onClick={handleNext} disabled={cameFromReview} size="lg">
            {isLastQuestion ? "Review Answers" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
