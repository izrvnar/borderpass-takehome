import { useState } from "react";
import type {
  Questionnaire as QuestionnaireType,
  QuestionnaireAnswers,
} from "@/types/questionnaire";
import { QuestionRenderer } from "./QuestionRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuestionnaireProps {
  questionnaire: QuestionnaireType;
  onComplete?: (answers: QuestionnaireAnswers) => void;
}

type PageType = "question";

export function Questionnaire({ questionnaire }: QuestionnaireProps) {
  const [currentPage] = useState<PageType>("question");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;

  const validateQuestion = (questionId: string): string | null => {
    const question = questionnaire.questions.find((q) => q.id === questionId);
    if (!question) return null;

    const answer = answers[questionId];

    if (question.required) {
      if (
        !answer ||
        (Array.isArray(answer) && answer.length === 0) ||
        answer === ""
      ) {
        return "This field is required";
      }
    }

    if (question.type === "checkbox" && Array.isArray(answer)) {
      if (question.minSelections && answer.length < question.minSelections) {
        return `Please select at least ${question.minSelections} option(s)`;
      }
      if (question.maxSelections && answer.length > question.maxSelections) {
        return `Please select no more than ${question.maxSelections} option(s)`;
      }
    }

    return null;
  };

  const validateCurrentQuestion = (): boolean => {
    const error = validateQuestion(currentQuestion.id);
    if (error) {
      setErrors({ [currentQuestion.id]: error });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;
    else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
    if (errors[currentQuestion.id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentQuestion.id];
        return newErrors;
      });
    }
  };

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
            disabled={isFirstQuestion && currentPage === "question"}
            size="lg"
          >
            {"Back"}
          </Button>
          <Button onClick={handleNext} size="lg">
            {"Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
