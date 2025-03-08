import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Navbar, AnimatedBackground, HexagonGrid } from "../components";
import { useAuth } from "../services/auth";
import ExamCard from "../components/ExamCard";
import CreateExamForm from "../components/CreateExamForm";
import ExamCodeDisplay from "../components/ExamCodeDisplay";
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from "../services/storage";

interface Question {
  id: string;
  text: string;
  type?: "mcq" | "shortanswer" | "longanswer" | "numerical";
  options?: { id: string; text: string }[];
  correctOption?: string;
  answer?: string;
  numericalAnswer?: number;
  tolerance?: number;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  code: string;
  createdAt: Date;
  questions: Question[];
  settings: {
    negativeMarking: boolean;
    negativeMarkingValue: number;
    eyeTracking: boolean;
    faceDetection: boolean;
    displayResults: boolean;
    generateCertificate: boolean;
  };
  modelAnswerSheet?: string;
  syllabus?: string;
  scheduling?: {
    date: Date;
    startTime: string;
    duration: number;
    timeZone: string;
  };
}

const ExamsPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [showExamCode, setShowExamCode] = useState<string | null>(null);

  useEffect(() => {
    const loadExams = () => {
      const storedExams = getStorageItem(STORAGE_KEYS.USER_EXAMS, []);
      if (storedExams && storedExams.length > 0) {
        try {
          // Convert string dates back to Date objects
          const parsedExams = storedExams.map((exam: any) => ({
            ...exam,
            createdAt: new Date(exam.createdAt),
            scheduling: exam.scheduling
              ? {
                  ...exam.scheduling,
                  date: new Date(exam.scheduling.date),
                }
              : undefined,
            settings: {
              ...exam.settings,
              displayResults:
                exam.settings?.displayResults !== undefined
                  ? exam.settings.displayResults
                  : true,
              negativeMarking: exam.settings?.negativeMarking || false,
              negativeMarkingValue: exam.settings?.negativeMarkingValue || 0.25,
              eyeTracking: exam.settings?.eyeTracking || false,
              faceDetection: exam.settings?.faceDetection || false,
              generateCertificate: exam.settings?.generateCertificate || false,
            },
            questions: exam.questions || [],
          }));
          setExams(parsedExams);
        } catch (error) {
          console.error("Error parsing stored exams:", error);
          setExams([]);
        }
      } else {
        // No data yet, just start with an empty array
        setExams([]);
      }
    };

    loadExams();
  }, []);

  useEffect(() => {
    if (exams.length > 0) {
      setStorageItem(STORAGE_KEYS.USER_EXAMS, exams);
    }
  }, [exams]);

  if (!isAuthenticated && !loading) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const copyExamCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Exam code copied to clipboard");
  };

  const handleCreateExam = (createdExam: Exam) => {
    setExams([createdExam, ...exams]);
    setShowExamCode(createdExam.code);
    toast.success("Exam created successfully");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <HexagonGrid />

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 animate-slide-down">
              <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">
                Your Exams
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-violet-500 rounded-full mb-3"></div>
              <p className="text-gray-300">
                Create and manage your exams or view exam results
              </p>
            </div>

            {showExamCode && (
              <ExamCodeDisplay
                examCode={showExamCode}
                onCopy={copyExamCode}
                onDismiss={() => setShowExamCode(null)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div>
                <CreateExamForm onExamCreate={handleCreateExam} />
                <p className="text-gray-400 italic text-sm mt-2 text-center">
                  Your Rules, Your Exam: Unbreakable Security, Unmatched
                  Accuracy
                </p>
              </div>

              {exams.length > 0 ? (
                exams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    copyExamCode={copyExamCode}
                  />
                ))
              ) : (
                <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                  <div className="text-gray-400 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect
                        x="8"
                        y="2"
                        width="8"
                        height="4"
                        rx="1"
                        ry="1"
                      ></rect>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Exams Yet
                  </h3>
                  <p className="text-gray-400">
                    Create your first exam using the form to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamsPage;
