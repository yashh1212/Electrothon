import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  EyeOff,
  Camera,
  XCircle,
  Download,
  Award,
  Layers,
} from "lucide-react";
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
import ExamCertificate from "@/components/ExamCertificate";
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from "@/services/storage";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface ExamSettings {
  negativeMarking: boolean;
  negativeMarkingValue: number;
  eyeTracking: boolean;
  faceDetection: boolean;
  generateCertificate: boolean;
  preventTabSwitching?: boolean;
  displayResults?: boolean;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  code: string;
  createdAt: Date;
  questions: Question[];
  settings: ExamSettings;
}

interface ExamResult {
  studentId: string;
  studentName: string;
  examId: string;
  examCode: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  tabSwitches: number;
  completedAt: Date;
  passed: boolean;
}

const ExamPage: React.FC = () => {
  const { toast } = useToast();
  const { examCode } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [numericalAnswers, setNumericalAnswers] = useState<number[]>([]);
  const [textAnswers, setTextAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [securityWarnings, setSecurityWarnings] = useState<{
    eye: boolean;
    face: boolean;
    tabSwitch: boolean;
  }>({ eye: false, face: false, tabSwitch: false });
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [studentName, setStudentName] = useState("John Doe");
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [showSecurityViolationDialog, setShowSecurityViolationDialog] =
    useState(false);
  const MAX_TAB_SWITCHES = 3;

  const [examData, setExamData] = useState<{
    title: string;
    description: string;
    questions: Question[];
    settings: ExamSettings;
  }>({
    title: "Web Development Certification Exam",
    description: `Exam Code: ${examCode || "CERT-2023"}`,
    settings: {
      negativeMarking: false,
      negativeMarkingValue: 0,
      eyeTracking: false,
      faceDetection: false,
      generateCertificate: true,
      preventTabSwitching: true,
    },
    questions: [
      {
        id: "1",
        text: "Which language is primarily used for styling web pages?",
        type: "mcq",
        options: [
          { id: "a", text: "HTML" },
          { id: "b", text: "JavaScript" },
          { id: "c", text: "CSS" },
          { id: "d", text: "Python" },
        ],
        correctOption: "c",
      },
      {
        id: "2",
        text: "What does DOM stand for in web development?",
        type: "mcq",
        options: [
          { id: "a", text: "Document Object Model" },
          { id: "b", text: "Digital Ordinance Management" },
          { id: "c", text: "Design Object Mechanism" },
          { id: "d", text: "Data Object Model" },
        ],
        correctOption: "a",
      },
      {
        id: "3",
        text: "Which of the following is a JavaScript framework?",
        type: "mcq",
        options: [
          { id: "a", text: "Django" },
          { id: "b", text: "Flask" },
          { id: "c", text: "Ruby on Rails" },
          { id: "d", text: "React" },
        ],
        correctOption: "d",
      },
      {
        id: "4",
        text: "What does API stand for?",
        type: "mcq",
        options: [
          { id: "a", text: "Application Programming Interface" },
          { id: "b", text: "Application Process Integration" },
          { id: "c", text: "Automated Program Interaction" },
          { id: "d", text: "Advanced Programming Interface" },
        ],
        correctOption: "a",
      },
      {
        id: "5",
        text: "Which of these is a version control system?",
        type: "mcq",
        options: [
          { id: "a", text: "Docker" },
          { id: "b", text: "Git" },
          { id: "c", text: "Kubernetes" },
          { id: "d", text: "Jenkins" },
        ],
        correctOption: "b",
      },
    ],
  });

  useEffect(() => {
    if (examCode) {
      const storedExams = getStorageItem<Exam[]>(STORAGE_KEYS.USER_EXAMS, []);

      if (storedExams && storedExams.length > 0) {
        try {
          const foundExam = storedExams.find((exam) => exam.code === examCode);

          if (foundExam) {
            setExamData({
              title: foundExam.title,
              description: `Exam Code: ${foundExam.code}`,
              settings: {
                negativeMarking: foundExam.settings?.negativeMarking || false,
                negativeMarkingValue:
                  foundExam.settings?.negativeMarkingValue || 0,
                eyeTracking: foundExam.settings?.eyeTracking || false,
                faceDetection: foundExam.settings?.faceDetection || false,
                generateCertificate:
                  foundExam.settings?.generateCertificate || true,
                preventTabSwitching:
                  foundExam.settings?.preventTabSwitching !== false,
              },
              questions: foundExam.questions || [],
            });
          } else {
            console.error("Exam not found");
            toast({
              title: "Error",
              description: "Exam not found",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error parsing stored exams:", error);
          toast({
            title: "Error",
            description: "Error loading exam data",
            variant: "destructive",
          });
        }
      }
    }

    const studentData = sessionStorage.getItem("CURRENT_STUDENT");
    if (studentData) {
      try {
        const parsedData = JSON.parse(studentData);
        setStudentInfo(parsedData);
        setStudentName(parsedData.fullName || "John Doe");
      } catch (e) {
        console.error("Error parsing student data", e);
      }
    }
  }, [examCode, toast]);

  useEffect(() => {
    if (!examData.settings.preventTabSwitching || examCompleted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const newTabSwitchCount = tabSwitchCount + 1;
        setTabSwitchCount(newTabSwitchCount);
        setSecurityWarnings((prev) => ({ ...prev, tabSwitch: true }));

        toast({
          title: "Warning",
          description: `Tab switch detected (${newTabSwitchCount}/${MAX_TAB_SWITCHES}). Switching tabs during an exam is not allowed`,
          variant: "destructive",
        });

        setTimeout(() => {
          setSecurityWarnings((prev) => ({ ...prev, tabSwitch: false }));
        }, 5000);

        if (newTabSwitchCount >= MAX_TAB_SWITCHES) {
          setShowSecurityViolationDialog(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleWindowBlur = () => {
      if (!examCompleted) {
        const newTabSwitchCount = tabSwitchCount + 1;
        setTabSwitchCount(newTabSwitchCount);
        setSecurityWarnings((prev) => ({ ...prev, tabSwitch: true }));

        toast({
          title: "Warning",
          description: `Focus lost (${newTabSwitchCount}/${MAX_TAB_SWITCHES}). Leaving the exam window is not allowed`,
          variant: "destructive",
        });

        setTimeout(() => {
          setSecurityWarnings((prev) => ({ ...prev, tabSwitch: false }));
        }, 5000);

        if (newTabSwitchCount >= MAX_TAB_SWITCHES) {
          setShowSecurityViolationDialog(true);
        }
      }
    };

    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [
    examData.settings.preventTabSwitching,
    examCompleted,
    tabSwitchCount,
    toast,
  ]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (examData.settings.faceDetection || examData.settings.eyeTracking) {
        try {
          setRequestingPermissions(true);
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          setPermissionsGranted(true);

          const securityCheck = setInterval(() => {
            if (examData.settings.eyeTracking && Math.random() > 0.9) {
              setSecurityWarnings((prev) => ({ ...prev, eye: true }));

              setTimeout(() => {
                setSecurityWarnings((prev) => ({ ...prev, eye: false }));
              }, 5000);
            }

            if (examData.settings.faceDetection && Math.random() > 0.95) {
              setSecurityWarnings((prev) => ({ ...prev, face: true }));

              setTimeout(() => {
                setSecurityWarnings((prev) => ({ ...prev, face: false }));
              }, 5000);
            }
          }, 15000);

          return () => {
            clearInterval(securityCheck);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
            }
          };
        } catch (error) {
          console.error("Error accessing camera:", error);
          toast({
            title: "Error",
            description:
              "Camera access denied. Unable to enable security features",
            variant: "destructive",
          });
          setPermissionsGranted(false);
        } finally {
          setRequestingPermissions(false);
        }
      }
    };

    requestPermissions();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [examData.settings.eyeTracking, examData.settings.faceDetection, toast]);

  useEffect(() => {
    if (timeLeft > 0 && !examCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examCompleted) {
      handleSubmitExam();
    }
  }, [timeLeft, examCompleted]);

  useEffect(() => {
    if (examData.questions.length > 0) {
      // Initialize answers for all question types
      const initialAnswers = new Array(examData.questions.length).fill(null);
      const initialNumericalAnswers = new Array(examData.questions.length).fill(
        0
      );
      const initialTextAnswers = new Array(examData.questions.length).fill("");

      setAnswers(initialAnswers);
      setNumericalAnswers(initialNumericalAnswers);
      setTextAnswers(initialTextAnswers);
    }
  }, [examData.questions]);

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

  const handleTextAnswerChange = (value: string) => {
    const newTextAnswers = [...textAnswers];
    newTextAnswers[currentQuestion] = value;
    setTextAnswers(newTextAnswers);
  };

  const handleNumericalAnswerChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const newNumericalAnswers = [...numericalAnswers];
      newNumericalAnswers[currentQuestion] = numValue;
      setNumericalAnswers(newNumericalAnswers);
    }
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
    let incorrect = 0;
    let totalAnswerable = 0;

    examData.questions.forEach((question, index) => {
      if (question.type === "mcq") {
        totalAnswerable++;
        const correctOptionIndex = question.options?.findIndex(
          (option) => option.id === question.correctOption
        );

        if (answers[index] === correctOptionIndex) {
          correct++;
        } else if (typeof answers[index] === "number") {
          incorrect++;
        }
      } else if (
        question.type === "numerical" &&
        question.numericalAnswer !== undefined
      ) {
        totalAnswerable++;
        const studentAnswer = numericalAnswers[index];
        const tolerance = question.tolerance || 0;

        if (Math.abs(studentAnswer - question.numericalAnswer) <= tolerance) {
          correct++;
        } else {
          incorrect++;
        }
      }
      // Short and long answers require manual grading, so we don't count them here
    });

    let finalScore = correct;
    if (examData.settings.negativeMarking && totalAnswerable > 0) {
      finalScore = Math.max(
        0,
        correct - incorrect * examData.settings.negativeMarkingValue
      );
    }

    const percentage =
      totalAnswerable > 0
        ? Math.round((finalScore / totalAnswerable) * 100)
        : 0;

    return {
      score: correct,
      incorrect,
      negativeMarks: examData.settings.negativeMarking
        ? incorrect * examData.settings.negativeMarkingValue
        : 0,
      total: totalAnswerable,
      percentage,
      finalScore,
      tabSwitches: tabSwitchCount,
    };
  };

  const handleSubmitExam = (securityViolation = false) => {
    setIsSubmitting(true);

    setTimeout(() => {
      const result = calculateScore();
      setScore(result.percentage);
      setExamCompleted(true);
      setIsSubmitting(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (securityViolation) {
        toast({
          title: "Error",
          description: "Exam ended due to security violations",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Exam submitted successfully!",
        });
      }

      if (studentInfo && examCode) {
        const examResult: ExamResult = {
          studentId: studentInfo.id || studentInfo.studentId || "unknown",
          studentName: studentName,
          examId: examCode,
          examCode: examCode,
          examTitle: examData.title,
          score: result.percentage,
          totalQuestions: result.total,
          correctAnswers: result.score,
          tabSwitches: tabSwitchCount,
          completedAt: new Date(),
          passed: result.percentage >= 60,
        };

        const existingResults = getStorageItem<ExamResult[]>(
          STORAGE_KEYS.EXAM_RESULTS,
          []
        );

        existingResults.push(examResult);

        setStorageItem(STORAGE_KEYS.EXAM_RESULTS, existingResults);
      }

      if (
        examData.settings.generateCertificate &&
        result.percentage >= 60 &&
        !securityViolation
      ) {
        setTimeout(() => {
          setShowCertificate(true);
        }, 1500);
      }
    }, 1500);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    handleSubmitExam();
  };

  const handleExitExam = () => {
    navigate("/");
  };

  const handleRetryPermissions = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      setRequestingPermissions(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setPermissionsGranted(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Error",
        description: "Camera access denied",
        variant: "destructive",
      });
      setPermissionsGranted(false);
    } finally {
      setRequestingPermissions(false);
    }
  };

  const renderQuestionInput = () => {
    const currentQ = examData.questions[currentQuestion];

    if (!currentQ) return null;

    switch (currentQ.type) {
      case "mcq":
        return (
          <div className="space-y-3 mt-6">
            {currentQ.options?.map((option, index) => (
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
                  <span>{option.text}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case "shortanswer":
        return (
          <div className="mt-6">
            <Textarea
              value={textAnswers[currentQuestion] || ""}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Type your answer here (max 200 words)..."
              className="min-h-[150px] resize-none bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Max 200 words. Your answer will be saved automatically.
            </p>
          </div>
        );

      case "longanswer":
        return (
          <div className="mt-6">
            <Textarea
              value={textAnswers[currentQuestion] || ""}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Type your answer here (400-500 words)..."
              className="min-h-[250px] resize-none bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Expected 400-500 words. Your answer will be saved automatically.
            </p>
          </div>
        );

      case "numerical":
        return (
          <div className="mt-6">
            <div className="space-y-2">
              <Input
                type="number"
                step="any"
                value={numericalAnswers[currentQuestion] || ""}
                onChange={(e) => handleNumericalAnswerChange(e.target.value)}
                placeholder="Enter your numerical answer"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter a numerical value as your answer.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-white">
            <p>
              Unknown question type. Please contact your exam administrator.
            </p>
          </div>
        );
    }
  };

  if (
    (examData.settings.eyeTracking || examData.settings.faceDetection) &&
    !permissionsGranted &&
    !examCompleted &&
    !requestingPermissions
  ) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <AnimatedBackground />
        <HexagonGrid />

        <div className="relative z-10">
          <Navbar />

          <div className="container mx-auto px-4 pt-32 pb-16">
            <div className="max-w-md mx-auto">
              <Card className="backdrop-blur-xl bg-black/30 border border-white/10 shadow-lg animate-fade-in">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    Camera Access Required
                  </CardTitle>
                  <p className="text-gray-300">
                    This exam requires camera access for security monitoring
                  </p>
                </CardHeader>

                <CardContent className="flex flex-col items-center pt-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-purple-500/20 border-2 border-purple-500">
                    <Camera className="w-12 h-12 text-purple-300" />
                  </div>

                  <div className="text-center mb-8 space-y-4">
                    <p className="text-white">
                      This exam uses the following security features:
                    </p>
                    <div className="space-y-2">
                      {examData.settings.faceDetection && (
                        <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
                          <Camera className="text-blue-400 w-5 h-5" />
                          <span className="text-gray-200">Face Detection</span>
                        </div>
                      )}
                      {examData.settings.eyeTracking && (
                        <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
                          <EyeOff className="text-yellow-400 w-5 h-5" />
                          <span className="text-gray-200">Eye Tracking</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleRetryPermissions}
                    className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white border-0"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Grant Camera Access
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examData.questions.length === 0) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <AnimatedBackground />
        <HexagonGrid />

        <div className="relative z-10">
          <Navbar />

          <div className="container mx-auto px-4 pt-32 pb-16">
            <div className="max-w-md mx-auto">
              <Card className="backdrop-blur-xl bg-black/30 border border-white/10 shadow-lg animate-fade-in">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    Exam Not Found
                  </CardTitle>
                  <p className="text-gray-300">
                    The exam with code "{examCode}" could not be loaded or
                    contains no questions.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-6">
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white border-0"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Home
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                {(securityWarnings.eye ||
                  securityWarnings.face ||
                  securityWarnings.tabSwitch) && (
                  <div className="bg-red-900/30 border-b border-red-500/30 p-3 text-center animate-pulse">
                    <div className="flex items-center justify-center gap-2 text-red-300">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Security Warning</span>
                    </div>
                    <p className="text-sm text-red-200 mt-1">
                      {securityWarnings.eye &&
                        "Eye movement detected outside exam area. "}
                      {securityWarnings.face && "Face not clearly visible. "}
                      {securityWarnings.tabSwitch && "Tab switching detected. "}
                      Please correct this to continue.
                    </p>
                  </div>
                )}

                {examData.settings.preventTabSwitching && (
                  <Alert className="bg-amber-900/30 border-amber-500/30 mb-2">
                    <Layers className="h-4 w-4 text-amber-400" />
                    <AlertDescription className="text-amber-200 text-sm">
                      Tab switching detection is enabled. The exam will
                      automatically end after {MAX_TAB_SWITCHES} tab switches.
                      Current count: {tabSwitchCount}/{MAX_TAB_SWITCHES}
                    </AlertDescription>
                  </Alert>
                )}

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
                      {examData.questions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestion(index)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                            index === currentQuestion
                              ? "bg-violet-600 text-white"
                              : (question.type === "mcq" &&
                                  typeof answers[index] === "number") ||
                                (question.type === "numerical" &&
                                  numericalAnswers[index] !== 0) ||
                                ((question.type === "shortanswer" ||
                                  question.type === "longanswer") &&
                                  textAnswers[index])
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
                  {(examData.settings.eyeTracking ||
                    examData.settings.faceDetection) &&
                    permissionsGranted && (
                      <div className="mb-4 flex justify-end">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-32 h-24 object-cover rounded-lg border border-white/20 shadow-lg"
                            style={{ display: "block" }}
                          />
                          <div className="absolute top-1 right-1 flex gap-1">
                            {examData.settings.eyeTracking && (
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  securityWarnings.eye
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                              ></div>
                            )}
                            {examData.settings.faceDetection && (
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  securityWarnings.face
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                              ></div>
                            )}
                            {examData.settings.preventTabSwitching && (
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  securityWarnings.tabSwitch
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                              ></div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="mb-8">
                    <h3 className="text-xl text-white font-medium mb-4">
                      {examData.questions[currentQuestion].text}
                    </h3>

                    {renderQuestionInput()}
                  </div>
                </CardContent>

                <CardFooter className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div>
                    {currentQuestion === examData.questions.length - 1 ? (
                      <Button
                        onClick={() => setShowConfirmDialog(true)}
                        className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white border-0"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finish Exam
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-white/10 text-white hover:bg-white/20 border-0"
                      >
                        Next
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card className="backdrop-blur-xl bg-black/30 border border-white/10 shadow-lg animate-fade-in overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-blue-500/10"></div>
                  <div className="absolute top-20 left-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                </div>

                <CardHeader className="text-center relative">
                  <div className="mb-5">
                    {score >= 60 ? (
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-500/20 border-2 border-emerald-500">
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-500/20 border-2 border-amber-500">
                        <AlertCircle className="w-12 h-12 text-amber-400" />
                      </div>
                    )}
                  </div>

                  <CardTitle className="text-3xl font-bold text-white mb-2">
                    {score >= 60 ? "Congratulations!" : "Exam Completed"}
                  </CardTitle>
                  <p className="text-xl text-white mb-2">
                    Your Score: <span className="font-bold">{score}%</span>
                  </p>
                  <p className="text-gray-300">
                    {score >= 60
                      ? "You have successfully passed the exam!"
                      : "Keep practicing and try again. You need 60% to pass."}
                  </p>

                  {showCertificate && (
                    <div className="mt-6">
                      <p className="text-gray-300 mb-4">
                        Your certificate has been generated:
                      </p>
                      <div
                        ref={certificateRef}
                        className="relative w-full max-w-xl mx-auto"
                      >
                        <ExamCertificate
                          studentName={studentName}
                          examTitle={examData.title}
                          score={score}
                          date={new Date()}
                        />
                      </div>

                      <Button
                        className="mt-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white border-0"
                        onClick={() => {
                          toast({
                            title: "Success",
                            description: "Certificate downloaded successfully",
                          });
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </Button>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                        <Award className="w-5 h-5 text-yellow-400 mr-2" />
                        Performance
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex justify-between">
                          <span>Graded Questions:</span>
                          <span className="font-medium text-white">
                            {calculateScore().total}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Correct Answers:</span>
                          <span className="font-medium text-emerald-400">
                            {calculateScore().score}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Incorrect Answers:</span>
                          <span className="font-medium text-red-400">
                            {calculateScore().incorrect}
                          </span>
                        </li>
                        {examData.settings.negativeMarking && (
                          <li className="flex justify-between">
                            <span>Negative Marks:</span>
                            <span className="font-medium text-amber-400">
                              -{calculateScore().negativeMarks}
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                        <Layers className="w-5 h-5 text-blue-400 mr-2" />
                        Exam Details
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex justify-between">
                          <span>Exam Code:</span>
                          <span className="font-medium text-white">
                            {examCode}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Total Questions:</span>
                          <span className="font-medium text-white">
                            {examData.questions.length}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Tab Switches:</span>
                          <span className="font-medium text-white">
                            {tabSwitchCount}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Status:</span>
                          <span
                            className={`font-medium ${
                              score >= 60 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {score >= 60 ? "PASSED" : "FAILED"}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    onClick={handleExitExam}
                    className="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white border-0"
                  >
                    Return to Home
                  </Button>
                </CardContent>
              </Card>
            )}

            <Dialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <DialogContent className="bg-gray-900 border border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Submit Exam</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Are you sure you want to submit your exam? You won't be able
                    to make changes after submission.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    className="border-gray-700 text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Submit Exam
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={showSecurityViolationDialog}
              onOpenChange={setShowSecurityViolationDialog}
            >
              <DialogContent className="bg-red-900/90 border border-red-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-red-100">
                    Security Violation Detected
                  </DialogTitle>
                  <DialogDescription className="text-red-200">
                    Multiple tab switching or window changes have been detected,
                    which violates exam security policies.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-red-800/50 border border-red-700/50 p-4 rounded-lg my-3">
                  <p className="text-red-100 font-medium">
                    Your exam will be submitted automatically with current
                    answers.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      setShowSecurityViolationDialog(false);
                      handleSubmitExam(true);
                    }}
                    className="bg-red-700 hover:bg-red-800 text-white w-full"
                  >
                    Acknowledge and Submit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
