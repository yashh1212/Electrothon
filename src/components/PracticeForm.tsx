import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { BrainCircuit, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { evaluateAnswer } from "@/utils/evaluationUtils";
import { Alert, AlertDescription } from "./ui/alert";

const PracticeForm = () => {
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<{
    grade: number;
    analysis: string;
  } | null>(null);

  const handleEvaluate = async () => {
    if (!question.trim() || !expectedAnswer.trim() || !studentAnswer.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before evaluating.",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);
    setResult(null);

    try {
      const evaluation = await evaluateAnswer(
        question,
        expectedAnswer,
        studentAnswer
      );
      setResult(evaluation);

      const gradeText =
        evaluation.grade > 0
          ? `Grade: ${evaluation.grade}/5`
          : "Incorrect Answer";

      toast({
        title: gradeText,
        description:
          evaluation.grade >= 4
            ? "Great job! Your answer is excellent."
            : "Keep practicing to improve your answer.",
      });
    } catch (error) {
      console.error("Evaluation error:", error);
      toast({
        title: "Evaluation Failed",
        description:
          "There was an error evaluating your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setQuestion("");
    setExpectedAnswer("");
    setStudentAnswer("");
    setResult(null);
  };

  return (
    <Card className="backdrop-blur-xl bg-black/30 border border-white/10 shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-purple-400" />
          Practice with AI Evaluation
        </CardTitle>
        <p className="text-gray-300">
          Enter a question, the expected answer, and your answer to receive
          AI-powered feedback.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="question" className="text-white">
            Question
          </Label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question..."
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected-answer" className="text-white">
            Expected Answer
          </Label>
          <Textarea
            id="expected-answer"
            value={expectedAnswer}
            onChange={(e) => setExpectedAnswer(e.target.value)}
            placeholder="Enter the expected answer..."
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-answer" className="text-white">
            Your Answer
          </Label>
          <Textarea
            id="student-answer"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="bg-white/5 border-white/10 text-white min-h-[120px]"
          />
        </div>

        {result && (
          <Alert
            className={`border ${
              result.grade >= 4
                ? "bg-green-900/20 border-green-500/30"
                : "bg-amber-900/20 border-amber-500/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.grade >= 4 ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-400" />
              )}
              <span className="font-medium text-white">
                {result.grade > 0
                  ? `Grade: ${result.grade}/5`
                  : "Incorrect Answer"}
              </span>
            </div>
            <AlertDescription className="text-gray-200">
              {result.analysis}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-white/10 pt-4">
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-white/20 text-gray-300 hover:bg-white/10"
          disabled={isEvaluating}
        >
          Reset
        </Button>
        <Button
          onClick={handleEvaluate}
          className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white border-0"
          disabled={isEvaluating}
        >
          {isEvaluating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>Evaluate Answer</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PracticeForm;
