export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
  placeholder?: string;
  maxLength?: number;
}

export interface TextareaQuestion extends BaseQuestion {
  type: "textarea";
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

export interface SelectQuestion extends BaseQuestion {
  type: "select";
  options: QuestionOption[];
  placeholder?: string;
}

export interface RadioQuestion extends BaseQuestion {
  type: "radio";
  options: QuestionOption[];
}

export interface CheckboxQuestion extends BaseQuestion {
  type: "checkbox";
  options: QuestionOption[];
  minSelections?: number;
  maxSelections?: number;
}

export type Question =
  | TextQuestion
  | TextareaQuestion
  | SelectQuestion
  | RadioQuestion
  | CheckboxQuestion;

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export type QuestionAnswer = string | string[] | null;

export interface QuestionnaireAnswers {
  [questionId: string]: QuestionAnswer;
}

export interface ValidationError {
  questionId: string;
  message: string;
}
