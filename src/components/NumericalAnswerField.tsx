import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calculator } from "lucide-react";

interface NumericalAnswerFieldProps {
  questionId: string;
  numericalAnswer?: number;
  tolerance?: number;
  onChange: (id: string, field: string, value: number) => void;
}

const NumericalAnswerField: React.FC<NumericalAnswerFieldProps> = ({
  questionId,
  numericalAnswer = 0,
  tolerance = 0,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2 text-sm font-medium">
        <Calculator className="h-4 w-4 mr-2 text-blue-400" />
        <span>Numerical Answer</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`numerical-answer-${questionId}`} className="text-sm">
          Exact Answer Value:
        </Label>
        <Input
          id={`numerical-answer-${questionId}`}
          type="number"
          value={numericalAnswer ?? 0}
          onChange={(e) =>
            onChange(
              questionId,
              "numericalAnswer",
              parseFloat(e.target.value) || 0
            )
          }
          placeholder="Enter the correct numerical answer"
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`tolerance-${questionId}`} className="text-sm">
          Acceptable Tolerance (±):
        </Label>
        <Input
          id={`tolerance-${questionId}`}
          type="number"
          min="0"
          step="0.01"
          value={tolerance ?? 0}
          onChange={(e) =>
            onChange(questionId, "tolerance", parseFloat(e.target.value) || 0)
          }
          placeholder="Enter the tolerance range (e.g., 0.1)"
          className="bg-white/5 border-white/10 text-white"
        />
        <p className="text-xs text-gray-400 mt-1">
          A tolerance of 0 means exact match only. Example: for answer 10 with
          tolerance 0.5, answers between 9.5 and 10.5 are accepted.
        </p>
      </div>
    </div>
  );
};

export default NumericalAnswerField;
