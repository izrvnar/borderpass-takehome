import { useState } from "react";
import type {
  Questionnaire as QuestionnaireType,
  QuestionnaireAnswers,
  ValidationError,
} from "@/types/questionnaire";
import { QuestionRenderer } from "./QuestionRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionnaireSuccess } from "./QuestionnaireSuccess";
import { QuestionnaireReview } from "./QuestionnaireReview";

interface QuestionnaireProps {
  questionnaire: QuestionnaireType;
  onComplete?: (answers: QuestionnaireAnswers) => void;
}

type PageType = "question" | "success" | "review";

export function Questionnaire({
  questionnaire,
  onComplete,
}: QuestionnaireProps) {
  const [currentPage, setCurrentPage] = useState<PageType>("question");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameFromReview, setCameFromReview] = useState(false);

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion =
    currentQuestionIndex === questionnaire.questions.length - 1;

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

  const validateAllQuestions = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];
    const newErrors: Record<string, string> = {};

    questionnaire.questions.forEach((question) => {
      const error = validateQuestion(question.id);
      if (error) {
        validationErrors.push({ questionId: question.id, message: error });
        newErrors[question.id] = error;
      }
    });

    setErrors(newErrors);
    return validationErrors;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;
    if (cameFromReview) {
      setCameFromReview(false);
    }

    if (isLastQuestion) {
      setCurrentPage("review");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentPage === "review") {
      setCurrentQuestionIndex(questionnaire.questions.length - 1);
      setCurrentPage("question");
    } else if (cameFromReview) {
      // If user came from review, go back to review
      setCameFromReview(false);
      setCurrentPage("review");
    } else if (!isFirstQuestion) {
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

  const submitSurvey = async () => {
    const validationErrors = validateAllQuestions();
    if (validationErrors.length > 0) {
      // back to first question with error
      const firstErrorQuestion = questionnaire.questions.findIndex((q) =>
        validationErrors.some((e) => e.questionId === q.id),
      );
      setCurrentQuestionIndex(firstErrorQuestion);
      setCurrentPage("question");
      return;
    }

    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setCurrentPage("success");
      onComplete?.(answers);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const restartSurvey = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setErrors({});
    setCurrentPage("question");
  };

  const editQuestion = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
    setCurrentPage("question");
    setCameFromReview(true);
  };

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
