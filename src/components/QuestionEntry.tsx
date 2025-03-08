import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Plus, Trash2, X, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: "mcq" | "shortanswer" | "longanswer";
  options?: Option[];
  correctOption?: string;
  answer?: string;
  maxWords?: number;
}

interface QuestionEntryProps {
  onSave?: (questions: Question[]) => void;
}

const QuestionEntry: React.FC<QuestionEntryProps> = ({ onSave }) => {
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "", type: "mcq", options: [{ id: "1", text: "" }] },
  ]);
  const [showResults, setShowResults] = useState(true);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        type: "mcq",
        options: [{ id: "1", text: "" }],
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      toast.error("You must have at least one question");
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (
    id: string,
    field: keyof Question,
    value: string | number
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateQuestionType = (
    id: string,
    type: "mcq" | "shortanswer" | "longanswer"
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          // Reset answer and set appropriate maxWords based on the type
          let maxWords;
          let newQuestion: Question = { ...q, type };

          if (type === "shortanswer") {
            maxWords = 200;
            newQuestion = {
              ...newQuestion,
              maxWords,
              options: undefined,
              correctOption: undefined,
              answer: "",
            };
          } else if (type === "longanswer") {
            maxWords = 500;
            newQuestion = {
              ...newQuestion,
              maxWords,
              options: undefined,
              correctOption: undefined,
              answer: "",
            };
          } else if (type === "mcq") {
            newQuestion = {
              ...newQuestion,
              maxWords: undefined,
              options: [{ id: "1", text: "" }],
              correctOption: undefined,
              answer: "",
            };
          }

          return newQuestion;
        }
        return q;
      })
    );
  };

  // Functions for handling multiple choice options
  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const options = [
            ...(q.options || []),
            { id: Date.now().toString(), text: "" },
          ];
          return { ...q, options };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          if ((q.options || []).length <= 1) {
            toast.error(
              "A multiple choice question must have at least one option"
            );
            return q;
          }

          const options = (q.options || []).filter(
            (opt) => opt.id !== optionId
          );
          // If the removed option was the correct answer, reset correctOption
          const correctOption =
            q.correctOption === optionId ? undefined : q.correctOption;
          return { ...q, options, correctOption };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const options = (q.options || []).map((opt) =>
            opt.id === optionId ? { ...opt, text } : opt
          );
          return { ...q, options };
        }
        return q;
      })
    );
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, correctOption: optionId };
        }
        return q;
      })
    );
  };

  const saveQuestions = () => {
    const emptyQuestions = questions.filter((q) => !q.text.trim());
    if (emptyQuestions.length > 0) {
      toast.error("Please fill in all questions");
      return;
    }

    // Validate that MCQ questions have options and a correct answer
    const invalidMcqs = questions.filter((q) => {
      if (q.type === "mcq") {
        const emptyOptions = (q.options || []).some((opt) => !opt.text.trim());
        return emptyOptions || !q.correctOption;
      }
      return false;
    });

    if (invalidMcqs.length > 0) {
      toast.error(
        "Please fill in all options and select a correct answer for MCQ questions"
      );
      return;
    }

    // Validate answers for short and long answer questions
    const unansweredQuestions = questions.filter((q) => {
      return (
        (q.type === "shortanswer" || q.type === "longanswer") &&
        (!q.answer || !q.answer.trim())
      );
    });

    if (unansweredQuestions.length > 0) {
      toast.error(
        "Please provide expected answers for all short and long answer questions"
      );
      return;
    }

    // Simulate API call
    toast.success(`${questions.length} questions saved successfully`);
    console.log("Questions:", questions);
    console.log("Show Results:", showResults);

    if (onSave) {
      onSave(questions);
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Enter Questions Manually</h3>
        <p className="text-muted-foreground text-sm">
          Add questions one by one for your exam
        </p>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="show-results"
          checked={showResults}
          onCheckedChange={setShowResults}
        />
        <Label htmlFor="show-results">
          Display results to students immediately after exam
        </Label>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="p-4 border rounded-xl bg-card animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Question {index + 1}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(question.id)}
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <Select
                value={question.type}
                onValueChange={(value: "mcq" | "shortanswer" | "longanswer") =>
                  updateQuestionType(question.id, value)
                }
              >
                <SelectTrigger className="w-full mb-2">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="shortanswer">
                    Short Answer (max 200 words)
                  </SelectItem>
                  <SelectItem value="longanswer">
                    Long Answer (400-500 words)
                  </SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                value={question.text}
                onChange={(e) =>
                  updateQuestion(question.id, "text", e.target.value)
                }
                placeholder="Enter your question here..."
                className="min-h-[100px] resize-none"
              />

              {question.type === "mcq" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Answer Options:
                    </Label>
                    {question.options?.map((option, optIndex) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <div className="flex-grow flex items-center space-x-2">
                          <Input
                            value={option.text}
                            onChange={(e) =>
                              updateOption(
                                question.id,
                                option.id,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-grow"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(question.id, option.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                            type="radio"
                            id={`correct-${question.id}-${option.id}`}
                            name={`correct-${question.id}`}
                            checked={question.correctOption === option.id}
                            onChange={() =>
                              setCorrectOption(question.id, option.id)
                            }
                            className="mr-1"
                          />
                          <Label
                            htmlFor={`correct-${question.id}-${option.id}`}
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
                    onClick={() => addOption(question.id)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Negative marking will only apply to this question type
                  </p>
                </div>
              )}

              {question.type === "shortanswer" && (
                <div>
                  <Label
                    htmlFor={`expected-answer-${question.id}`}
                    className="mb-2 block text-sm font-medium"
                  >
                    Expected Answer (Required):
                  </Label>
                  <Textarea
                    id={`expected-answer-${question.id}`}
                    value={question.answer || ""}
                    onChange={(e) =>
                      updateQuestion(question.id, "answer", e.target.value)
                    }
                    placeholder="Enter an expected answer for grading reference"
                    className="min-h-[80px] resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max words: 200 (Required for grading)
                  </p>
                </div>
              )}

              {question.type === "longanswer" && (
                <div>
                  <Label
                    htmlFor={`expected-answer-${question.id}`}
                    className="mb-2 block text-sm font-medium"
                  >
                    Expected Answer (Required):
                  </Label>
                  <Textarea
                    id={`expected-answer-${question.id}`}
                    value={question.answer || ""}
                    onChange={(e) =>
                      updateQuestion(question.id, "answer", e.target.value)
                    }
                    placeholder="Enter an expected answer for grading reference"
                    className="min-h-[150px] resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected length: 400-500 words (Required for grading)
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>

          <Button
            type="button"
            onClick={saveQuestions}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Save Questions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEntry;
