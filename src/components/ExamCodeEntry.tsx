import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { isExamActive, getExamStatus } from "../services/scheduler";

// Create an exam storage service
const getStoredExams = () => {
  const examsJson = localStorage.getItem("user_exams");
  return examsJson ? JSON.parse(examsJson) : [];
};

const ExamCodeEntry: React.FC = () => {
  const [examCode, setExamCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examCode.trim()) {
      toast.error("Please enter an exam code");
      return;
    }

    setIsLoading(true);

    // Check if the exam code exists in localStorage
    const exams = getStoredExams();
    const exam = exams.find((exam: any) => exam.code === examCode);

    setTimeout(() => {
      setIsLoading(false);
      if (exam) {
        // Check if exam is scheduled and not yet available
        if (exam.scheduling && !isExamActive(exam.scheduling)) {
          const formattedDate = format(new Date(exam.scheduling.date), "PPP");
          const formattedTime = exam.scheduling.startTime;

          toast.error(
            `This exam is scheduled for ${formattedDate} at ${formattedTime}`,
            {
              description: "You can't access it until the scheduled time.",
              duration: 5000,
            }
          );
          return;
        }

        toast.success(`Exam code ${examCode} is valid`);
        navigate(`/exam/${examCode}`);
      } else {
        toast.error(`Exam code ${examCode} is not valid`);
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-scale-in">
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium tracking-wider uppercase mb-3 backdrop-blur-sm">
          Student Access
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
          Enter Exam Code
        </h2>
        <p className="text-gray-300">
          Access your secure examination environment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <Input
            type="text"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            placeholder="Enter exam code (e.g., EX-2023-001)"
            className="h-14 px-4 border-none bg-transparent text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />

          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-medium transition-all duration-300 border-0"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center">
              Enter Exam <ArrowRight className="ml-2 w-5 h-5" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ExamCodeEntry;
