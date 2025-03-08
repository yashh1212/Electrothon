import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "sonner";
import { Plus, Brain, Upload } from "lucide-react";
import { Card } from "../components/ui/card";
import ManualQuestionEntry from "./ManualQuestionEntry";
import ExamSettingsComponent from "./ExamSettings";
import { FileUpload } from "../components";
import ExamSchedulingComponent from "./ExamScheduling";

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
  displayResults: boolean;
  generateCertificate: boolean;
}

interface ExamScheduling {
  date: Date;
  startTime: string;
  duration: number;
  timeZone: string;
}

interface CreateExamFormProps {
  onExamCreate: (exam: any) => void;
}

const CreateExamForm: React.FC<CreateExamFormProps> = ({ onExamCreate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creationTab, setCreationTab] = useState("manual");
  const [schedulingTab, setSchedulingTab] = useState("schedule");
  const [manualQuestions, setManualQuestions] = useState<Question[]>([
    { id: "1", text: "", type: "mcq", options: [{ id: "1", text: "" }] },
  ]);

  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    settings: {
      negativeMarking: false,
      negativeMarkingValue: 0.25,
      eyeTracking: false,
      faceDetection: false,
      displayResults: true,
      generateCertificate: false,
    },
    modelAnswerSheet: undefined as string | undefined,
    syllabus: undefined as string | undefined,
    scheduling: {
      date: new Date(),
      startTime: "10:00",
      duration: 60,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const handleCreateExam = () => {
    if (!newExam.title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }

    if (creationTab === "manual") {
      const emptyQuestions = manualQuestions.filter((q) => !q.text.trim());
      if (emptyQuestions.length > 0) {
        toast.error("Please fill in all questions");
        return;
      }

      const invalidMcqs = manualQuestions.filter((q) => {
        if (q.type === "mcq") {
          const emptyOptions = (q.options || []).some(
            (opt) => !opt.text.trim()
          );
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

      const unansweredQuestions = manualQuestions.filter((q) => {
        if (q.type === "shortanswer" || q.type === "longanswer") {
          return !q.answer || !q.answer.trim();
        }
        if (q.type === "numerical") {
          return q.numericalAnswer === undefined || q.tolerance === undefined;
        }
        return false;
      });

      if (unansweredQuestions.length > 0) {
        toast.error("Please provide expected answers for all questions");
        return;
      }
    }

    // Generate a unique exam code
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const examCode = `EX-${new Date().getFullYear()}-${code}`;

    let finalQuestions: Question[] = [];
    if (creationTab === "manual") {
      finalQuestions = manualQuestions;
    }

    const createdExam = {
      id: Date.now().toString(),
      title: newExam.title,
      description: newExam.description,
      code: examCode,
      createdAt: new Date(),
      questions: finalQuestions,
      settings: {
        negativeMarking: newExam.settings.negativeMarking,
        negativeMarkingValue: newExam.settings.negativeMarkingValue,
        eyeTracking: newExam.settings.eyeTracking,
        faceDetection: newExam.settings.faceDetection,
        displayResults: newExam.settings.displayResults,
        generateCertificate: newExam.settings.generateCertificate,
      },
      modelAnswerSheet: newExam.modelAnswerSheet,
      syllabus: newExam.syllabus,
      scheduling:
        schedulingTab === "schedule"
          ? {
              ...newExam.scheduling,
            }
          : undefined,
    };

    onExamCreate(createdExam);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setNewExam({
      title: "",
      description: "",
      settings: {
        negativeMarking: false,
        negativeMarkingValue: 0.25,
        eyeTracking: false,
        faceDetection: false,
        displayResults: true,
        generateCertificate: false,
      },
      modelAnswerSheet: undefined,
      syllabus: undefined,
      scheduling: {
        date: new Date(),
        startTime: "10:00",
        duration: 60,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
    setManualQuestions([
      { id: "1", text: "", type: "mcq", options: [{ id: "1", text: "" }] },
    ]);
  };

  const handleModelAnswerUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setNewExam({
        ...newExam,
        modelAnswerSheet: reader.result as string,
      });
      toast.success("Model answer sheet uploaded");
    };
  };

  const handleSyllabusUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setNewExam({
        ...newExam,
        syllabus: reader.result as string,
      });
      toast.success("Syllabus uploaded for AI question generation");
    };
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer h-full backdrop-blur-md bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-scale-in flex flex-col justify-center items-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">Create New Exam</h3>
          <p className="text-gray-300 text-center max-w-xs">
            Start creating a new exam for your students
          </p>
        </Card>
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl max-w-3xl max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={newExam.description}
              onChange={(e) =>
                setNewExam({ ...newExam, description: e.target.value })
              }
              placeholder="Brief description of the exam content"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <ExamSchedulingComponent
            scheduling={newExam.scheduling}
            schedulingTab={schedulingTab}
            onSchedulingChange={(scheduling) =>
              setNewExam({ ...newExam, scheduling })
            }
            onTabChange={setSchedulingTab}
          />

          <ExamSettingsComponent
            settings={newExam.settings}
            onChange={(settings) => setNewExam({ ...newExam, settings })}
          />

          <div className="border border-white/10 rounded-lg p-4 bg-white/5 mt-6">
            <Tabs value={creationTab} onValueChange={setCreationTab}>
              <TabsList className="grid grid-cols-3 mb-4 bg-black/30">
                <TabsTrigger
                  value="manual"
                  className="data-[state=active]:bg-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Manual Questions
                </TabsTrigger>
                <TabsTrigger
                  value="syllabus"
                  className="data-[state=active]:bg-white/10"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Questions
                </TabsTrigger>
                <TabsTrigger
                  value="answers"
                  className="data-[state=active]:bg-white/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Model Answers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <ManualQuestionEntry
                  questions={manualQuestions}
                  setQuestions={setManualQuestions}
                />
              </TabsContent>

              <TabsContent value="syllabus">
                <div className="p-4 border rounded-xl bg-black/30 animate-scale-in">
                  <h3 className="text-md font-medium mb-2">
                    AI Question Generation
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Upload your syllabus or course materials for AI to generate
                    relevant questions
                  </p>

                  <FileUpload
                    title="Upload Syllabus"
                    description="PDF, Word, or Text files up to 5MB"
                    accept=".pdf,.doc,.docx,.txt"
                    maxSize={5}
                    onFileSelect={handleSyllabusUpload}
                  />

                  {newExam.syllabus && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                      <p className="text-green-300 text-sm">
                        Syllabus uploaded successfully
                      </p>
                      <p className="text-xs text-green-300/80 mt-1">
                        AI is analyzing your content to generate questions
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="answers">
                <div className="p-4 border rounded-xl bg-black/30 animate-scale-in">
                  <h3 className="text-md font-medium mb-2">
                    Upload Model Answer Sheet
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Provide an answer key for automatic grading
                  </p>

                  <FileUpload
                    title="Upload Answer Sheet"
                    description="PDF, Word, or Text files up to 5MB"
                    accept=".pdf,.doc,.docx,.txt"
                    maxSize={5}
                    onFileSelect={handleModelAnswerUpload}
                  />

                  {newExam.modelAnswerSheet && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                      <p className="text-green-300 text-sm">
                        Answer sheet uploaded successfully
                      </p>
                      <p className="text-xs text-green-300/80 mt-1">
                        This will be used for grading and feedback
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-white/20 bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateExam}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
            >
              Create Exam
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamForm;
