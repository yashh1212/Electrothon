import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar, AnimatedBackground, HexagonGrid } from '../components';
import { useAuth } from '../services/auth';
import ExamCard from '../components/ExamCard';
import CreateExamForm from '../components/CreateExamForm';
import ExamCodeDisplay from '../components/ExamCodeDisplay';

const EXAMS_STORAGE_KEY = 'user_exams';

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

const ExamsPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [showExamCode, setShowExamCode] = useState<string | null>(null);

  useEffect(() => {
    const loadExams = () => {
      const storedExams = localStorage.getItem(EXAMS_STORAGE_KEY);
      if (storedExams) {
        try {
          const parsedExams = JSON.parse(storedExams).map((exam: any) => ({
            ...exam,
            createdAt: new Date(exam.createdAt),
            settings: {
              ...exam.settings,
              displayResults: exam.settings?.displayResults !== undefined ? exam.settings.displayResults : true,
              negativeMarking: exam.settings?.negativeMarking || false,
              negativeMarkingValue: exam.settings?.negativeMarkingValue || 0.25,
              eyeTracking: exam.settings?.eyeTracking || false,
              faceDetection: exam.settings?.faceDetection || false,
              generateCertificate: exam.settings?.generateCertificate || false
            },
            questions: exam.questions || [],
          }));
          setExams(parsedExams);
        } catch (error) {
          console.error('Error parsing stored exams:', error);
          initializeWithSampleData();
        }
      } else {
        initializeWithSampleData();
      }
    };

    const initializeWithSampleData = () => {
      const sampleExams: Exam[] = [
        {
          id: '1',
          title: 'Mathematics Final Exam',
          description: 'Calculus, Algebra, and Geometry',
          code: 'MATH-2023-X7',
          createdAt: new Date('2023-06-15'),
          questions: [
            { id: '1', text: 'Solve for x: 2x + 5 = 15' },
            { id: '2', text: 'Differentiate f(x) = x² + 3x + 2' }
          ],
          settings: {
            negativeMarking: true,
            negativeMarkingValue: 0.25,
            eyeTracking: false,
            faceDetection: true,
            displayResults: true,
            generateCertificate: true
          }
        },
        {
          id: '2',
          title: 'Physics Midterm',
          description: 'Mechanics and Thermodynamics',
          code: 'PHYS-2023-K4',
          createdAt: new Date('2023-05-20'),
          questions: [
            { id: '1', text: 'Define Newton\'s laws of motion' },
            { id: '2', text: 'Calculate the kinetic energy of a 2kg object moving at 5m/s' }
          ],
          settings: {
            negativeMarking: false,
            negativeMarkingValue: 0,
            eyeTracking: true,
            faceDetection: true,
            displayResults: false,
            generateCertificate: false
          }
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

  const copyExamCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Exam code copied to clipboard');
  };

  const handleCreateExam = (createdExam: Exam) => {
    setExams([createdExam, ...exams]);
    setShowExamCode(createdExam.code);
    toast.success('Exam created successfully');
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
              <CreateExamForm onExamCreate={handleCreateExam} />
              
              {exams.map(exam => (
                <ExamCard 
                  key={exam.id} 
                  exam={exam} 
                  copyExamCode={copyExamCode} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamsPage;