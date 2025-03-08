import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Plus,
  FileText,
  Copy,
  BookOpen,
  ArrowRight,
  EyeOff,
  Camera,
  MinusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Navbar, AnimatedBackground, HexagonGrid } from "../components";
import { useAuth } from "../services/auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../components/ui/form";
import { Checkbox } from "../components/ui/checkbox";

const EXAMS_STORAGE_KEY = "user_exams";

interface Exam {
  id: string;
  title: string;
  description: string;
  code: string;
  createdAt: Date;
  settings: {
    negativeMarking: boolean;
    negativeMarkingValue: number;
    eyeTracking: boolean;
    faceDetection: boolean;
  };
}

const ExamsPage: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    settings: {
      negativeMarking: false,
      negativeMarkingValue: 0.25,
      eyeTracking: false,
      faceDetection: false,
    },
  });
  const [showExamCode, setShowExamCode] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadExams = () => {
      const storedExams = localStorage.getItem(EXAMS_STORAGE_KEY);
      if (storedExams) {
        try {
          const parsedExams = JSON.parse(storedExams).map((exam: any) => ({
            ...exam,
            createdAt: new Date(exam.createdAt),
            // Add default settings if they don't exist in stored exams
            settings: exam.settings || {
              negativeMarking: false,
              negativeMarkingValue: 0.25,
              eyeTracking: false,
              faceDetection: false,
            },
          }));
          setExams(parsedExams);
        } catch (error) {
          console.error("Error parsing stored exams:", error);
          initializeWithSampleData();
        }
      } else {
        initializeWithSampleData();
      }
    };

    const initializeWithSampleData = () => {
      const sampleExams: Exam[] = [
        {
          id: "1",
          title: "Mathematics Final Exam",
          description: "Calculus, Algebra, and Geometry",
          code: "MATH-2023-X7",
          createdAt: new Date("2023-06-15"),
          settings: {
            negativeMarking: true,
            negativeMarkingValue: 0.25,
            eyeTracking: false,
            faceDetection: true,
          },
        },
        {
          id: "2",
          title: "Physics Midterm",
          description: "Mechanics and Thermodynamics",
          code: "PHYS-2023-K4",
          createdAt: new Date("2023-05-20"),
          settings: {
            negativeMarking: false,
            negativeMarkingValue: 0,
            eyeTracking: true,
            faceDetection: true,
          },
        },
      ];
      setExams(sampleExams);
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(sampleExams));
    };

    loadExams();
  }, []);

  useEffect(() => {
    if (exams.length > 0) {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
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

  const handleCreateExam = () => {
    if (!newExam.title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }

    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const examCode = `EX-${new Date().getFullYear()}-${code}`;

    const createdExam: Exam = {
      id: Date.now().toString(),
      title: newExam.title,
      description: newExam.description,
      code: examCode,
      createdAt: new Date(),
      settings: {
        negativeMarking: newExam.settings.negativeMarking,
        negativeMarkingValue: newExam.settings.negativeMarkingValue,
        eyeTracking: newExam.settings.eyeTracking,
        faceDetection: newExam.settings.faceDetection,
      },
    };

    setExams([createdExam, ...exams]);
    setNewExam({
      title: "",
      description: "",
      settings: {
        negativeMarking: false,
        negativeMarkingValue: 0.25,
        eyeTracking: false,
        faceDetection: false,
      },
    });
    setShowExamCode(examCode);
    setIsDialogOpen(false);
    toast.success("Exam created successfully");
  };

  const copyExamCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Exam code copied to clipboard");
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
              <Card className="mb-8 animate-scale-in bg-gradient-to-r from-blue-500/20 to-violet-500/20 backdrop-blur-md border-white/10 text-white">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div>
                      <h3 className="text-xl font-medium mb-1">
                        Exam Created Successfully
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Share this code with your students to access the exam
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl font-mono bg-black/20 px-4 py-2 rounded-lg border border-white/10">
                        {showExamCode}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyExamCode(showExamCode)}
                        className="border-white/20 bg-white/5 hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowExamCode(null)}
                      className="border-white/20 bg-white/5 hover:bg-white/10"
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer h-full backdrop-blur-md bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-scale-in flex flex-col justify-center items-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      Create New Exam
                    </h3>
                    <p className="text-gray-300 text-center max-w-xs">
                      Start creating a new exam for your students
                    </p>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle>Create New Exam</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Fill in the details to create a new exam
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Exam Title</Label>
                      <Input
                        id="title"
                        value={newExam.title}
                        onChange={(e) =>
                          setNewExam({ ...newExam, title: e.target.value })
                        }
                        placeholder="e.g., Mathematics Final Exam"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={newExam.description}
                        onChange={(e) =>
                          setNewExam({
                            ...newExam,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description of the exam content"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-4 mt-6">
                      <h3 className="text-sm font-medium text-gray-200">
                        Exam Security Settings
                      </h3>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                        {/* Negative Marking */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label
                              htmlFor="negativeMarking"
                              className="text-sm"
                            >
                              <div className="flex items-center">
                                <MinusCircle className="w-4 h-4 mr-2 text-red-400" />
                                Negative Marking
                              </div>
                            </Label>
                            <p className="text-xs text-gray-400">
                              Deduct points for incorrect answers
                            </p>
                          </div>
                          <Switch
                            id="negativeMarking"
                            checked={newExam.settings.negativeMarking}
                            onCheckedChange={(checked) =>
                              setNewExam({
                                ...newExam,
                                settings: {
                                  ...newExam.settings,
                                  negativeMarking: checked,
                                },
                              })
                            }
                          />
                        </div>

                        {newExam.settings.negativeMarking && (
                          <div className="pl-6 border-l border-white/10">
                            <Label
                              htmlFor="negativeMarkingValue"
                              className="text-xs text-gray-300 mb-1 block"
                            >
                              Deduction Value per Wrong Answer
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="negativeMarkingValue"
                                type="number"
                                min="0"
                                max="1"
                                step="0.25"
                                value={newExam.settings.negativeMarkingValue}
                                onChange={(e) =>
                                  setNewExam({
                                    ...newExam,
                                    settings: {
                                      ...newExam.settings,
                                      negativeMarkingValue:
                                        parseFloat(e.target.value) || 0,
                                    },
                                  })
                                }
                                className="bg-white/5 border-white/10 text-white w-20"
                              />
                              <span className="text-xs text-gray-400">
                                points (0.25 to 1.0 recommended)
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Eye Tracking */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="eyeTracking" className="text-sm">
                              <div className="flex items-center">
                                <EyeOff className="w-4 h-4 mr-2 text-yellow-400" />
                                Eye Tracking
                              </div>
                            </Label>
                            <p className="text-xs text-gray-400">
                              Monitor eye movements to prevent cheating
                            </p>
                          </div>
                          <Switch
                            id="eyeTracking"
                            checked={newExam.settings.eyeTracking}
                            onCheckedChange={(checked) =>
                              setNewExam({
                                ...newExam,
                                settings: {
                                  ...newExam.settings,
                                  eyeTracking: checked,
                                },
                              })
                            }
                          />
                        </div>

                        {/* Face Detection */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="faceDetection" className="text-sm">
                              <div className="flex items-center">
                                <Camera className="w-4 h-4 mr-2 text-blue-400" />
                                Face Detection
                              </div>
                            </Label>
                            <p className="text-xs text-gray-400">
                              Verify student identity and prevent impersonation
                            </p>
                          </div>
                          <Switch
                            id="faceDetection"
                            checked={newExam.settings.faceDetection}
                            onCheckedChange={(checked) =>
                              setNewExam({
                                ...newExam,
                                settings: {
                                  ...newExam.settings,
                                  faceDetection: checked,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-white/20 bg-white/5 hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateExam}
                        className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700"
                      >
                        Create Exam
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card
                    className="cursor-pointer h-full backdrop-blur-md bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-scale-in flex flex-col justify-center items-center py-12"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Attempt Exam</h3>
                    <p className="text-gray-300 text-center max-w-xs">
                      Enter an exam code to access the examination
                    </p>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle>Access Exam</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Enter the exam code provided by your instructor
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="examCode">Exam Code</Label>
                      <Input
                        id="examCode"
                        placeholder="e.g., EX-2023-ABCD"
                        className="bg-white/5 border-white/10 text-white font-mono text-center text-lg py-6"
                      />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <Button className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 w-full">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Start Exam
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-white">
              Your Exam List
            </h2>

            <div className="space-y-4 animate-fade-in">
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <Card
                    key={exam.id}
                    className="backdrop-blur-md bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {exam.title}
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            {exam.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-mono bg-black/20 px-2 py-1 rounded border border-white/10">
                            {exam.code}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyExamCode(exam.code)}
                            className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="flex flex-wrap gap-2 mt-2">
                        {exam.settings.negativeMarking && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-red-900/30 text-red-300 border border-red-700/30">
                            <MinusCircle className="w-3 h-3 mr-1" />
                            Negative Marking:{" "}
                            {exam.settings.negativeMarkingValue}
                          </span>
                        )}
                        {exam.settings.eyeTracking && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-yellow-900/30 text-yellow-300 border border-yellow-700/30">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Eye Tracking
                          </span>
                        )}
                        {exam.settings.faceDetection && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-900/30 text-blue-300 border border-blue-700/30">
                            <Camera className="w-3 h-3 mr-1" />
                            Face Detection
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-gray-400">
                          Created: {exam.createdAt.toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/20 bg-white/5 hover:bg-white/10"
                            onClick={() =>
                              (window.location.href = `/dashboard?examId=${exam.id}`)
                            }
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Edit Questions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>You haven't created any exams yet.</p>
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
