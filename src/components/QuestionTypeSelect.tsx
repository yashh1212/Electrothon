import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface QuestionTypeSelectProps {
  questionId: string;
  type: string;
  onChange: (
    id: string,
    type: "mcq" | "shortanswer" | "longanswer" | "numerical"
  ) => void;
}

const QuestionTypeSelect: React.FC<QuestionTypeSelectProps> = ({
  questionId,
  type,
  onChange,
}) => {
  return (
    <Select
      value={type}
      onValueChange={(
        value: "mcq" | "shortanswer" | "longanswer" | "numerical"
      ) => onChange(questionId, value)}
    >
      <SelectTrigger className="w-full mb-2 bg-white/5 border-white/10 text-white">
        <SelectValue placeholder="Select question type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="mcq">Multiple Choice</SelectItem>
        <SelectItem value="shortanswer">
          Short Answer (max 200 words)
        </SelectItem>
        <SelectItem value="longanswer">Long Answer (400-500 words)</SelectItem>
        <SelectItem value="numerical">Numerical Answer</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default QuestionTypeSelect;
