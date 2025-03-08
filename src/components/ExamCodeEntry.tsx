import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { isExamActive, getExamStatus } from "../services/scheduler";
import StudentRegistration from "./StudentRegistration";
import { getStorageItem, STORAGE_KEYS } from "../services/storage";

interface Exam {
  id: string;
  title: string;
  description: string;
  code: string;
  createdAt: Date;
  questions: any[];
  settings: {
    negativeMarking: boolean;
    negativeMarkingValue: number;
    eyeTracking: boolean;
    faceDetection: boolean;
    displayResults: boolean;
    generateCertificate: boolean;
  };
  scheduling?: {
    date: Date;
    startTime: string;
    duration: number;
    timeZone: string;
  };
}

const ExamCodeEntry: React.FC = () => {
  const [examCode, setExamCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validExam, setValidExam] = useState<Exam | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examCode.trim()) {
      toast.error("Please enter an exam code");
      return;
    }

    setIsLoading(true);

    // Get exams from local storage using the utility function
    const exams = getStorageItem<Exam[]>(STORAGE_KEYS.USER_EXAMS, []);

    setTimeout(() => {
      setIsLoading(false);

      // Convert string dates back to Date objects
      const parsedExams = exams.map((exam: any) => ({
        ...exam,
        createdAt: new Date(exam.createdAt),
        scheduling: exam.scheduling
          ? {
              ...exam.scheduling,
              date: new Date(exam.scheduling.date),
            }
          : undefined,
      }));

      // Find the exam with the matching code
      const exam = parsedExams.find((exam) => exam.code === examCode);

      if (exam) {
        // Check if exam is scheduled and not yet available
        if (exam.scheduling) {
          const schedulingDate = new Date(exam.scheduling.date);
          if (
            !isExamActive({
              date: schedulingDate,
              startTime: exam.scheduling.startTime,
              duration: exam.scheduling.duration,
              timeZone: exam.scheduling.timeZone,
            })
          ) {
            const formattedDate = format(schedulingDate, "PPP");
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
        }

        toast.success(`Exam code ${examCode} is valid`);
        setValidExam(exam);
        setShowRegistration(true);
      } else {
        toast.error(`Exam code ${examCode} is not valid`);
      }
    }, 1000);
  };

  const handleBackToCodeEntry = () => {
    setShowRegistration(false);
    setValidExam(null);
  };

  if (showRegistration && validExam) {
    return (
      <StudentRegistration examCode={examCode} onBack={handleBackToCodeEntry} />
    );
  }

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
