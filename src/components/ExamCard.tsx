import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Copy, BookOpen, ArrowRight, EyeOff, Camera, Medal, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';

interface Question {
  id: string;
  text: string;
  type?: 'mcq' | 'shortanswer' | 'longanswer' | 'numerical';
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

interface ExamCardProps {
  exam: Exam;
  copyExamCode: (code: string) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, copyExamCode }) => {
  const formattedDate = exam.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="h-full backdrop-blur-md bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-scale-in">
      <CardHeader>
        <CardTitle className="text-xl">{exam.title}</CardTitle>
        <CardDescription className="text-gray-300">{exam.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-300">
            <FileText className="h-4 w-4 mr-2" />
            {exam.questions.length} questions
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <ArrowRight className="h-4 w-4 mr-2" />
            Created on {formattedDate}
          </div>
          
          {/* Exam security features */}
          <div className="flex flex-wrap gap-2 mt-3">
            {exam.settings.faceDetection && (
              <div className="flex items-center bg-blue-900/30 px-2 py-1 rounded-md text-xs text-blue-300 border border-blue-700/30">
                <Camera className="h-3 w-3 mr-1" />
                Face Detection
              </div>
            )}
            {exam.settings.eyeTracking && (
              <div className="flex items-center bg-purple-900/30 px-2 py-1 rounded-md text-xs text-purple-300 border border-purple-700/30">
                <EyeOff className="h-3 w-3 mr-1" />
                Eye Tracking
              </div>
            )}
            {exam.settings.negativeMarking && (
              <div className="flex items-center bg-red-900/30 px-2 py-1 rounded-md text-xs text-red-300 border border-red-700/30">
                <Ban className="h-3 w-3 mr-1" />
                -{exam.settings.negativeMarkingValue}
              </div>
            )}
            {exam.settings.generateCertificate && (
              <div className="flex items-center bg-amber-900/30 px-2 py-1 rounded-md text-xs text-amber-300 border border-amber-700/30">
                <Medal className="h-3 w-3 mr-1" />
                Certificate
              </div>
            )}
          </div>
          
          {exam.scheduling && (
            <div className="mt-2 p-2 bg-blue-900/30 border border-blue-700/30 rounded-lg">
              <p className="text-sm text-blue-300 font-medium">
                Scheduled for {new Date(exam.scheduling.date).toLocaleDateString()}
                {' at '}{exam.scheduling.startTime}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-white/10 pt-4 justify-between">
        <div className="flex items-center">
          <div className="bg-black/20 px-2 py-1 rounded border border-white/10 font-mono text-sm mr-2">
            {exam.code}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => copyExamCode(exam.code)}
            className="h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          asChild
          className="text-blue-400 hover:text-blue-300"
        >
          <Link to={`/exam/${exam.code}`}>
            <BookOpen className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExamCard;