import type { Questionnaire } from "@/types/questionnaire";

export const mockQuestionnaire: Questionnaire = {
  id: "test-questionnaire",
  title: "Test Questionnaire",
  questions: [
    {
      id: "test-question",
      type: "text",
      title: "Test Question",
      required: true,
      placeholder: "Enter your answer",
    },
    {
      id: "radio-question",
      type: "radio",
      title: "Choose One",
      required: true,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      id: "checkbox-question",
      type: "checkbox",
      title: "Select Options",
      required: true,
      options: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
      ],
    },
  ],
};
