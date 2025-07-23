import type {
  Questionnaire as QuestionnaireType,
  QuestionnaireAnswers,
} from "@/types/questionnaire";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface QuestionnaireReviewProps {
  questionnaire: QuestionnaireType;
  answers: QuestionnaireAnswers;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onEditQuestion: (questionIndex: number) => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
}

export function QuestionnaireReview({
  questionnaire,
  answers,
  errors,
  isSubmitting,
  onEditQuestion,
  onBack,
  onSubmit,
}: QuestionnaireReviewProps) {
  const getRequiredQuestionsStatus = () => {
    const requiredQuestions = questionnaire.questions.filter((q) => q.required);
    const answeredRequiredQuestions = requiredQuestions.filter((q) => {
      const answer = answers[q.id];
      return (
        answer !== undefined &&
        answer !== null &&
        answer !== "" &&
        (!Array.isArray(answer) || answer.length > 0)
      );
    });

    return {
      requiredQuestions,
      answeredRequiredQuestions,
      allRequiredAnswered:
        answeredRequiredQuestions.length === requiredQuestions.length,
    };
  };

  const requiredStatus = getRequiredQuestionsStatus();

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-card">
        <div className="questionnaire-review-container">
          <div className="questionnaire-header">
            <h1 className="questionnaire-title">Review Your Answers</h1>
            <p className="questionnaire-description">
              Please review your responses before submitting. You can edit any
              answer by clicking the "Edit" button.
            </p>
          </div>

          <div className="space-y-4">
            {questionnaire.questions.map((question, index) => {
              const answer = answers[question.id];
              const hasError = errors[question.id];

              return (
                <div
                  key={question.id}
                  className={`questionnaire-review-item ${hasError ? "has-error" : ""}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {question.title}
                      </h3>
                      <div className="questionnaire-answer-display">
                        {answer ? (
                          Array.isArray(answer) ? (
                            <div className="flex flex-wrap gap-2">
                              {answer.map((value) => {
                                const option =
                                  question.type === "checkbox"
                                    ? question.options.find(
                                        (opt) => opt.value === value,
                                      )
                                    : null;
                                return (
                                  <span
                                    key={value}
                                    className="questionnaire-answer-tag"
                                  >
                                    {option ? option.label : value}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="questionnaire-answer-tag">
                              {question.type === "select" ||
                              question.type === "radio"
                                ? question.options.find(
                                    (opt) => opt.value === answer,
                                  )?.label || answer
                                : answer}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground italic">
                            No answer provided
                          </span>
                        )}
                      </div>
                      {hasError && (
                        <p className="text-destructive text-sm mt-2 font-medium">
                          {hasError}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditQuestion(index)}
                      className="shrink-0"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            {!requiredStatus.allRequiredAnswered && (
              <div className="text-center p-4 bg-muted/50 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground">
                  Please answer all required questions (
                  {requiredStatus.answeredRequiredQuestions.length} of{" "}
                  {requiredStatus.requiredQuestions.length} completed)
                </p>
              </div>
            )}

            <div className="questionnaire-navigation">
              <Button variant="outline" onClick={onBack} size="lg">
                Back
              </Button>
              <Button
                onClick={onSubmit}
                disabled={isSubmitting || !requiredStatus.allRequiredAnswered}
                size="lg"
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Survey <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
