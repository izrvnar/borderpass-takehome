import { useState, useCallback } from "react";
import type {
  Questionnaire as QuestionnaireType,
  QuestionnaireAnswers,
  ValidationError,
} from "@/types/questionnaire";

type PageType = "question" | "success" | "review";

interface UseQuestionnaireProps {
  questionnaire: QuestionnaireType;
  onComplete?: (answers: QuestionnaireAnswers) => void;
}

export function useQuestionnaire({ questionnaire, onComplete }: UseQuestionnaireProps) {
  const [currentPage, setCurrentPage] = useState<PageType>("question");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameFromReview, setCameFromReview] = useState(false);

  // Computed values
  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questionnaire.questions.length - 1;

  const validateQuestion = useCallback((questionId: string): string | null => {
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
  }, [questionnaire.questions, answers]);

  const validateCurrentQuestion = useCallback((): boolean => {
    const error = validateQuestion(currentQuestion.id);
    if (error) {
      setErrors({ [currentQuestion.id]: error });
      return false;
    }
    setErrors({});
    return true;
  }, [validateQuestion, currentQuestion.id]);

  const validateAllQuestions = useCallback((): ValidationError[] => {
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
  }, [questionnaire.questions, validateQuestion]);

  const handleNext = useCallback(() => {
    if (!validateCurrentQuestion()) return;
    if (cameFromReview) {
      setCameFromReview(false);
    }

    if (isLastQuestion) {
      setCurrentPage("review");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [validateCurrentQuestion, cameFromReview, isLastQuestion]);

  const handleBack = useCallback(() => {
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
  }, [currentPage, cameFromReview, isFirstQuestion, questionnaire.questions.length]);

  const handleAnswerChange = useCallback((answer: any) => {
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
  }, [currentQuestion.id, errors]);

  const submitSurvey = useCallback(async () => {
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
  }, [validateAllQuestions, questionnaire.questions, onComplete, answers]);

  const restartSurvey = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setErrors({});
    setCurrentPage("question");
    setCameFromReview(false);
  }, []);

  const editQuestion = useCallback((questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
    setCurrentPage("question");
    setCameFromReview(true);
  }, []);

  const getProgress = useCallback(() => {
    const current =
      currentPage === "question"
        ? currentQuestionIndex + 1
        : questionnaire.questions.length;
    const total = questionnaire.questions.length;
    // Progress starts at 0% and only increases when user clicks "Next"
    const percentage =
      currentPage === "question"
        ? Math.round((currentQuestionIndex / total) * 100)
        : 100;

    return {
      current,
      total,
      percentage,
    };
  }, [currentPage, currentQuestionIndex, questionnaire.questions.length]);

  return {
    // State
    currentPage,
    currentQuestionIndex,
    answers,
    errors,
    isSubmitting,
    cameFromReview,

    // Computed values
    currentQuestion,
    isFirstQuestion,
    isLastQuestion,

    // Actions
    handleNext,
    handleBack,
    handleAnswerChange,
    submitSurvey,
    restartSurvey,
    editQuestion,

    // Utilities
    getProgress,
    validateQuestion,
    validateCurrentQuestion,
    validateAllQuestions,
  };
}
