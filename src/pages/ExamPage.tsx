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
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  EyeOff,
  Camera,
  XCircle,
  RotateCw,
  Download,
  Award,
  Layers,
  Video,
  VideoOff,
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
import { format } from "date-fns";

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOption?: string;
  type?: "mcq" | "shortanswer" | "longanswer" | "numerical";
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
  completedAt: string; // Changed from Date to string to fix the type error
  passed: boolean;
}

const ExamPage: React.FC = () => {
  const { examCode } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
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
  const [showCameraFeed, setShowCameraFeed] = useState(true);

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
              questions:
                foundExam.questions.filter((q) => q.type === "mcq") || [],
            });
          } else {
            console.error("Exam not found");
            toast.error("Exam not found");
          }
        } catch (error) {
          console.error("Error parsing stored exams:", error);
          toast.error("Error loading exam data");
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
  }, [examCode]);

  useEffect(() => {
    if (!examData.settings.preventTabSwitching || examCompleted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const newTabSwitchCount = tabSwitchCount + 1;
        setTabSwitchCount(newTabSwitchCount);
        setSecurityWarnings((prev) => ({ ...prev, tabSwitch: true }));

        toast.warning(
          `Tab switch detected (${newTabSwitchCount}/${MAX_TAB_SWITCHES})`,
          {
            description: "Switching tabs during an exam is not allowed",
            id: "tab-switch-warning",
          }
        );

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

        toast.warning(`Focus lost (${newTabSwitchCount}/${MAX_TAB_SWITCHES})`, {
          description: "Leaving the exam window is not allowed",
          id: "focus-warning",
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
  }, [examData.settings.preventTabSwitching, examCompleted, tabSwitchCount]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (examData.settings.faceDetection || examData.settings.eyeTracking) {
        try {
          setRequestingPermissions(true);
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 320 },
              height: { ideal: 240 },
              facingMode: "user",
            },
          });
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          setPermissionsGranted(true);
          toast.success("Camera access granted");

          const securityCheck = setInterval(() => {
            if (examData.settings.eyeTracking && Math.random() > 0.9) {
              setSecurityWarnings((prev) => ({ ...prev, eye: true }));
              toast.warning("Eye movement detected outside exam area", {
                description: "Please focus on the exam",
                id: "eye-warning",
              });

              setTimeout(() => {
                setSecurityWarnings((prev) => ({ ...prev, eye: false }));
              }, 5000);
            }

            if (examData.settings.faceDetection && Math.random() > 0.95) {
              setSecurityWarnings((prev) => ({ ...prev, face: true }));
              toast.warning("Face not clearly visible", {
                description: "Please ensure your face is visible",
                id: "face-warning",
              });

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
          toast.error("Camera access denied", {
            description: "Unable to enable security features",
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
  }, [examData.settings.eyeTracking, examData.settings.faceDetection]);

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
      setAnswers(new Array(examData.questions.length).fill(-1));
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

    examData.questions.forEach((question, index) => {
      const correctOptionIndex = question.options.findIndex(
        (option) => option.id === question.correctOption
      );

      if (answers[index] === correctOptionIndex) {
        correct++;
      } else if (answers[index] >= 0) {
        incorrect++;
      }
    });

    let finalScore = correct;
    if (examData.settings.negativeMarking) {
      finalScore = Math.max(
        0,
        correct - incorrect * examData.settings.negativeMarkingValue
      );
    }

    const percentage = Math.round(
      (finalScore / examData.questions.length) * 100
    );

    return {
      score: correct,
      incorrect,
      negativeMarks: examData.settings.negativeMarking
        ? incorrect * examData.settings.negativeMarkingValue
        : 0,
      total: examData.questions.length,
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
        toast.error("Exam ended due to security violations");
      } else {
        toast.success("Exam submitted successfully!");
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
          completedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
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
      toast.success("Camera access granted");
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Camera access denied");
      setPermissionsGranted(false);
    } finally {
      setRequestingPermissions(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      if (!certificateRef.current) return;

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: null,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to generate certificate");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${examData.title.replace(
          /\s+/g,
          "_"
        )}_Certificate.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Certificate downloaded successfully");
      }, "image/png");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
    }
  };

  const handleSecurityViolation = () => {
    setShowSecurityViolationDialog(false);
    handleSubmitExam(true);
  };

  const toggleCameraFeed = () => {
    setShowCameraFeed(!showCameraFeed);
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

                {(examData.settings.eyeTracking ||
                  examData.settings.faceDetection) &&
                  permissionsGranted && (
                    <div className="fixed bottom-4 right-4 z-50">
                      <div className="relative group">
                        <div
                          className={`transition-all duration-300 ${
                            showCameraFeed
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-0"
                          }`}
                        >
                          <div className="relative bg-black/50 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 shadow-lg p-1">
                            <div className="absolute top-2 right-2 z-10 flex space-x-1">
                              {examData.settings.eyeTracking && (
                                <div
                                  className={`h-3 w-3 rounded-full ${
                                    securityWarnings.eye
                                      ? "bg-red-500"
                                      : "bg-green-500"
                                  }`}
                                ></div>
                              )}
                              {examData.settings.faceDetection && (
                                <div
                                  className={`h-3 w-3 rounded-full ${
                                    securityWarnings.face
                                      ? "bg-red-500"
                                      : "bg-green-500"
                                  }`}
                                ></div>
                              )}
                              {examData.settings.preventTabSwitching && (
                                <div
                                  className={`h-3 w-3 rounded-full ${
                                    securityWarnings.tabSwitch
                                      ? "bg-red-500"
                                      : "bg-green-500"
                                  }`}
                                ></div>
                              )}
                            </div>
                            <video
                              ref={videoRef}
                              autoPlay
                              muted
                              playsInline
                              className="w-48 h-36 object-cover rounded-md"
                            />
                            <div className="bg-black/60 text-white text-xs py-1 text-center">
                              Live Camera Feed
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={toggleCameraFeed}
                          className={`absolute bottom-2 -left-12 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/10 ${
                            !showCameraFeed &&
                            "bg-purple-600/20 border-purple-500/50"
                          }`}
                        >
                          {showCameraFeed ? (
                            <VideoOff className="h-5 w-5 text-white" />
                          ) : (
                            <Video className="h-5 w-5 text-white" />
                          )}
                        </button>
                      </div>
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
                              <span>{option.text}</span>
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
                    onClick={() => {
                      if (currentQuestion > 0) {
                        setCurrentQuestion(currentQuestion - 1);
                      }
                    }}
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
                        onClick={() => {
                          if (currentQuestion < examData.questions.length - 1) {
                            setCurrentQuestion(currentQuestion + 1);
                          }
                        }}
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

                  <div className="w-full max-w-md space-y-6 text-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">
                          {calculateScore().score}
                        </div>
                        <div className="text-xs text-gray-400">
                          Correct Answers
                        </div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">
                          {calculateScore().incorrect}
                        </div>
                        <div className="text-xs text-gray-400">
                          Incorrect Answers
                        </div>
                      </div>
                      {examData.settings.negativeMarking && (
                        <div className="bg-white/10 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-white">
                            {calculateScore().negativeMarks}
                          </div>
                          <div className="text-xs text-gray-400">
                            Negative Marks
                          </div>
                        </div>
                      )}
                      <div className="bg-white/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">
                          {calculateScore().tabSwitches}
                        </div>
                        <div className="text-xs text-gray-400">
                          Tab Switches
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl text-center">
                      <div className="text-lg font-medium mb-2">
                        Final Result
                      </div>
                      {score >= 60 ? (
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <CheckCircle />
                          <span>Passed</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-red-400">
                          <AlertCircle />
                          <span>Failed</span>
                        </div>
                      )}
                    </div>

                    {showCertificate && (
                      <div className="mt-8">
                        <div ref={certificateRef} className="relative p-4">
                          <ExamCertificate
                            studentName={studentName}
                            examTitle={examData.title}
                            score={score}
                            date={new Date()}
                          />
                        </div>
                        <Button
                          onClick={handleDownloadCertificate}
                          className="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white mt-4"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Certificate
                        </Button>
                      </div>
                    )}

                    <Button
                      onClick={handleExitExam}
                      variant="outline"
                      className="w-full mt-6 border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Return to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Dialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <DialogContent className="bg-black/95 border border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Submit Exam</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Are you sure you want to submit your exam? You won't be able
                    to change your answers after submission.
                  </DialogDescription>
                </DialogHeader>
                <div className="text-sm text-gray-300 my-2">
                  <p>
                    You've answered{" "}
                    <span className="font-medium text-white">
                      {answers.filter((a) => a >= 0).length}
                    </span>{" "}
                    out of{" "}
                    <span className="font-medium text-white">
                      {examData.questions.length}
                    </span>{" "}
                    questions.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    className="border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSubmit}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                  >
                    Submit Exam
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={showSecurityViolationDialog}
              onOpenChange={setShowSecurityViolationDialog}
            >
              <DialogContent className="bg-black/95 border border-red-500/30">
                <DialogHeader>
                  <DialogTitle className="text-red-400">
                    Security Violation Detected
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Multiple tab switching attempts have been detected. This is
                    against the exam rules.
                  </DialogDescription>
                </DialogHeader>
                <div className="text-sm text-gray-300 my-2">
                  <p>
                    Your exam will be submitted automatically with your current
                    answers. This incident will be recorded.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSecurityViolation}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0"
                  >
                    End Exam
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
