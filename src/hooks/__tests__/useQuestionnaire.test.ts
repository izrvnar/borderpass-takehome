import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useQuestionnaire } from "../useQuestionnaire";
import { mockQuestionnaire } from "../../test/test-utils";

vi.useFakeTimers();

describe("useQuestionnaire", () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() =>
      useQuestionnaire({ questionnaire: mockQuestionnaire }),
    );

    expect(result.current.currentPage).toBe("question");
    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.answers).toEqual({});
    expect(result.current.errors).toEqual({});
  });

  it("updates answers when handleAnswerChange is called", () => {
    const { result } = renderHook(() =>
      useQuestionnaire({ questionnaire: mockQuestionnaire }),
    );

    act(() => {
      result.current.handleAnswerChange("test answer");
    });

    expect(result.current.answers["test-question"]).toBe("test answer");
  });

  it("validates required fields", () => {
    const { result } = renderHook(() =>
      useQuestionnaire({ questionnaire: mockQuestionnaire }),
    );

    const error = result.current.validateQuestion("test-question");
    expect(error).toBe("This field is required");
  });

  it("navigates to next question when valid", () => {
    const { result } = renderHook(() =>
      useQuestionnaire({ questionnaire: mockQuestionnaire }),
    );

    act(() => {
      result.current.handleAnswerChange("answer");
    });

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentQuestionIndex).toBe(1);
  });

  it("blocks navigation when validation fails", () => {
    const { result } = renderHook(() =>
      useQuestionnaire({ questionnaire: mockQuestionnaire }),
    );

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.errors["test-question"]).toBe(
      "This field is required",
    );
  });

  it("navigates to review after last question", () => {
    const { result } = renderHook(() =>
      useQuestionnaire({ questionnaire: mockQuestionnaire }),
    );

    // Answer all questions
    act(() => {
      result.current.handleAnswerChange("answer1");
    });
    act(() => {
      result.current.handleNext();
    });
    act(() => {
      result.current.handleAnswerChange("yes");
    });
    act(() => {
      result.current.handleNext();
    });
    act(() => {
      result.current.handleAnswerChange(["option1"]);
    });
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentPage).toBe("review");
  });

  it("submits survey successfully", async () => {
    const { result } = renderHook(() =>
      useQuestionnaire({
        questionnaire: mockQuestionnaire,
        onComplete: mockOnComplete,
      }),
    );

    // Fill out survey
    act(() => {
      result.current.handleAnswerChange("answer1");
    });
    act(() => {
      result.current.handleNext();
    });
    act(() => {
      result.current.handleAnswerChange("yes");
    });
    act(() => {
      result.current.handleNext();
    });
    act(() => {
      result.current.handleAnswerChange(["option1"]);
    });
    act(() => {
      result.current.handleNext();
    });

    // Submit
    act(() => {
      result.current.submitSurvey();
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      vi.runAllTimers();
    });

    expect(result.current.currentPage).toBe("success");
    expect(mockOnComplete).toHaveBeenCalledWith({
      "test-question": "answer1",
      "radio-question": "yes",
      "checkbox-question": ["option1"],
    });
  });
});
