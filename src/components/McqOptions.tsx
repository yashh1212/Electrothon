import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface McqOptionsProps {
  questionId: string;
  options: { id: string; text: string }[];
  correctOption?: string;
  addOption: (questionId: string) => void;
  removeOption: (questionId: string, optionId: string) => void;
  updateOption: (questionId: string, optionId: string, text: string) => void;
  setCorrectOption: (questionId: string, optionId: string) => void;
}

const McqOptions: React.FC<McqOptionsProps> = ({
  questionId,
  options,
  correctOption,
  addOption,
  removeOption,
  updateOption,
  setCorrectOption,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Answer Options:</Label>
        {options.map((option, optIndex) => (
          <div key={option.id} className="flex items-center space-x-2">
            <div className="flex-grow flex items-center space-x-2">
              <Input
                value={option.text}
                onChange={(e) =>
                  updateOption(questionId, option.id, e.target.value)
                }
                placeholder={`Option ${optIndex + 1}`}
                className="flex-grow bg-white/5 border-white/10 text-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(questionId, option.id)}
                className="h-8 w-8 text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="radio"
                id={`correct-${questionId}-${option.id}`}
                name={`correct-${questionId}`}
                checked={correctOption === option.id}
                onChange={() => setCorrectOption(questionId, option.id)}
                className="mr-1"
              />
              <Label
                htmlFor={`correct-${questionId}-${option.id}`}
                className="text-xs"
              >
                Correct
              </Label>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addOption(questionId)}
        className="text-xs bg-white/5 border-white/10 text-white hover:bg-white/10"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Option
      </Button>
      <p className="text-xs text-gray-400 mt-1">
        Note: Negative marking will only apply to this question type
      </p>
    </div>
  );
};

export default McqOptions;
