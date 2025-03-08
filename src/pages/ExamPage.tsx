import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import HexagonGrid from "@/components/HexagonGrid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer?: number;
}

const ExamPage: React.FC = () => {
  const { examCode } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Mock exam data - in a real app this would come from an API
  const [examData, setExamData] = useState<{
    title: string;
    description: string;
    questions: Question[];
  }>({
    title: "Sample Examination",
    description: `Exam Code: ${examCode}`,
    questions: [
      {
        id: 1,
        text: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
      },
      {
        id: 2,
        text: "Which of the following is a JavaScript framework?",
        options: ["Python", "React", "Java", "C++"],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Hyper Transfer Markup Language",
          "Home Tool Markup Language",
        ],
        correctAnswer: 0,
      },
      {
        id: 4,
        text: "Which symbol is used for single line comments in JavaScript?",
        options: ["//", "/*", "#", "<!--"],
        correctAnswer: 0,
      },
      {
        id: 5,
        text: "What is the correct way to create a function in JavaScript?",
        options: [
          "function = myFunction()",
          "function:myFunction()",
          "function myFunction()",
          "create myFunction()",
        ],
        correctAnswer: 2,
      },
    ],
  });

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !examCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examCompleted) {
      handleSubmitExam();
    }
  }, [timeLeft, examCompleted]);

  // Initialize answers array
  useEffect(() => {
    setAnswers(new Array(examData.questions.length).fill(-1));
  }, [examData.questions.length]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < examData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    examData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      score: correct,
      total: examData.questions.length,
      percentage: Math.round((correct / examData.questions.length) * 100),
    };
  };

  const handleSubmitExam = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const result = calculateScore();
      setScore(result.percentage);
      setExamCompleted(true);
      setIsSubmitting(false);

      toast.success("Exam submitted successfully!");
    }, 1500);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    handleSubmitExam();
  };

  const handleExitExam = () => {
    navigate("/");
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <AnimatedBackground />
      <HexagonGrid />

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-4xl mx-auto">
            {!examCompleted ? (
              <Card className="backdrop-blur-xl bg-black/30 border border-white/10 shadow-lg animate-fade-in">
                <CardHeader className="border-b border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">
                        {examData.title}
                      </CardTitle>
                      <p className="text-sm text-gray-300 mt-1">
                        {examData.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-900/30 border border-violet-500/20">
                      <Clock className="w-4 h-4 text-violet-400" />
                      <span className="text-violet-300 font-mono">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-300">
                      Question {currentQuestion + 1} of{" "}
                      {examData.questions.length}
                    </div>
                    <div className="flex gap-1">
                      {examData.questions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestion(index)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                            index === currentQuestion
                              ? "bg-violet-600 text-white"
                              : answers[index] >= 0
                              ? "bg-violet-900/40 text-violet-300 border border-violet-500/50"
                              : "bg-gray-800/40 text-gray-400 border border-gray-700/50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="mb-8">
                    <h3 className="text-xl text-white font-medium mb-4">
                      {examData.questions[currentQuestion].text}
                    </h3>

                    <div className="space-y-3 mt-6">
                      {examData.questions[currentQuestion].options.map(
                        (option, index) => (
                          <div
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`p-4 rounded-lg backdrop-blur-sm border transition-all cursor-pointer ${
                              answers[currentQuestion] === index
                                ? "bg-violet-600/20 border-violet-500 text-white"
                                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                                  answers[currentQuestion] === index
                                    ? "bg-violet-600 text-white"
                                    : "bg-white/10 text-gray-400"
                                }`}
                              >
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span>{option}</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    className="border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    Previous
                  </Button>

                  <div className="flex space-x-3">
                    {currentQuestion === examData.questions.length - 1 ? (
                      <Button
                        onClick={() => setShowConfirmDialog(true)}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                      >
                        Submit Exam
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white border-0"
                      >
                        Next Question
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card className="backdrop-blur-xl bg-black/30 border border-white/10 shadow-lg animate-fade-in">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-white mb-2">
                    Exam Completed
                  </CardTitle>
                  <p className="text-gray-300">Your score has been recorded</p>
                </CardHeader>

                <CardContent className="flex flex-col items-center pt-6">
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
                      score >= 70
                        ? "bg-green-600/20 border-2 border-green-500"
                        : "bg-orange-600/20 border-2 border-orange-500"
                    }`}
                  >
                    <span className="text-4xl font-bold text-white">
                      {score}%
                    </span>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-medium text-white mb-2">
                      {score >= 70 ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="text-green-500" />
                          <span>Passed</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="text-orange-500" />
                          <span>Needs Improvement</span>
                        </div>
                      )}
                    </h3>
                    <p className="text-gray-300">
                      You answered {calculateScore().score} out of{" "}
                      {calculateScore().total} questions correctly
                    </p>
                  </div>

                  <div className="w-full max-w-md p-4 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="text-white font-medium mb-3">
                      Performance Summary
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-300">Total Questions</span>
                        <span className="text-white font-medium">
                          {calculateScore().total}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-300">Correct Answers</span>
                        <span className="text-green-400 font-medium">
                          {calculateScore().score}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-300">Wrong Answers</span>
                        <span className="text-red-400 font-medium">
                          {calculateScore().total - calculateScore().score}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-300">Score Percentage</span>
                        <span className="text-white font-medium">{score}%</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="justify-center border-t border-white/10 pt-4">
                  <Button
                    onClick={handleExitExam}
                    className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white border-0"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Home
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Submit Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam? You won't be able to
              change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
            >
              Yes, Submit Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamPage;
