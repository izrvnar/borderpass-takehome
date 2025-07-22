import type { Question, QuestionAnswer } from "@/types/questionnaire";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionRendererProps {
  question: Question;
  answer: QuestionAnswer;
  onAnswerChange: (answer: QuestionAnswer) => void;
  error?: string;
}

export function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  error,
}: QuestionRendererProps) {
  const renderQuestionInput = () => {
    switch (question.type) {
      case "text":
        return (
          <Input
            type="text"
            placeholder={question.placeholder}
            value={(answer as string) || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            maxLength={question.maxLength}
            className={error ? "border-destructive" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={question.placeholder}
            value={(answer as string) || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            maxLength={question.maxLength}
            rows={question.rows}
            className={error ? "border-destructive" : ""}
          />
        );

      case "select":
        return (
          <Select
            value={(answer as string) || ""}
            onValueChange={(value) => onAnswerChange(value)}
          >
            <SelectTrigger className={error ? "border-destructive" : ""}>
              <SelectValue placeholder={question.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={(answer as string) || ""}
            onValueChange={(value) => onAnswerChange(value)}
            className={error ? "border border-destructive rounded-md p-3" : ""}
          >
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox": {
        const selectedValues = (answer as string[]) || [];
        return (
          <div
            className={`space-y-3 ${error ? "border border-destructive rounded-md p-3" : ""}`}
          >
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const newValues = [...selectedValues, option.value];
                      if (
                        !question.maxSelections ||
                        newValues.length <= question.maxSelections
                      ) {
                        onAnswerChange(newValues);
                      }
                    } else {
                      onAnswerChange(
                        selectedValues.filter((v) => v !== option.value),
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={option.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
            {question.maxSelections && selectedValues.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedValues.length} of {question.maxSelections} selected
              </p>
            )}
          </div>
        );
      }

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {renderQuestionInput()}
        {error && (
          <p className="text-destructive text-sm font-medium">{error}</p>
        )}
        {question.type === "text" && question.maxLength && (
          <p className="text-xs text-muted-foreground text-right">
            {((answer as string) || "").length} / {question.maxLength}
          </p>
        )}
        {question.type === "textarea" && question.maxLength && (
          <p className="text-xs text-muted-foreground text-right">
            {((answer as string) || "").length} / {question.maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
