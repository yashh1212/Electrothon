import React from "react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface ExpectedAnswerFieldProps {
  questionId: string;
  answer: string | undefined;
  type: "shortanswer" | "longanswer";
  onChange: (id: string, field: string, value: string) => void;
}

const ExpectedAnswerField: React.FC<ExpectedAnswerFieldProps> = ({
  questionId,
  answer,
  type,
  onChange,
}) => {
  const maxWords = type === "shortanswer" ? 200 : 500;
  const minHeight = type === "shortanswer" ? "min-h-[80px]" : "min-h-[150px]";

  return (
    <div>
      <Label
        htmlFor={`expected-answer-${questionId}`}
        className="mb-2 block text-sm font-medium"
      >
        Expected Answer (Required):
      </Label>
      <Textarea
        id={`expected-answer-${questionId}`}
        value={answer || ""}
        onChange={(e) => onChange(questionId, "answer", e.target.value)}
        placeholder="Enter an expected answer for grading reference"
        className={`${minHeight} resize-none bg-white/5 border-white/10 text-white`}
        required
      />
      <p className="text-xs text-gray-400 mt-1">
        {type === "shortanswer"
          ? `Max words: ${maxWords} (Required for grading)`
          : `Expected length: 400-500 words (Required for grading)`}
      </p>
    </div>
  );
};

export default ExpectedAnswerField;
