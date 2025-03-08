
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FileUpload, QuestionEntry, Navbar, AnimatedBackground, HexagonGrid } from '../components';
import { useAuth } from '../services/auth';
import { toast } from 'sonner';
import { File, FileText, Upload, Brain, Code, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const Dashboard: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  
  // Redirect to home if not authenticated
  if (!isAuthenticated && !loading) {
    return <Navigate to="/" />;
  }
  
  // Show loading state
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
  
  const handleModelAnswerUpload = (file: File) => {
    console.log('Model answer sheet uploaded:', file);
  };
  
  const handleSyllabusUpload = (file: File) => {
    console.log('Syllabus PDF uploaded:', file);
    toast.success('Processing syllabus for AI question generation');
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">
                    Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">{user?.name || 'Educator'}</span>
                  </h1>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-violet-500 rounded-full mb-3"></div>
                  <p className="text-gray-300">
                    Manage your exams and create new question sets
                  </p>
                </div>
                <Link to="/exams">
                  <Button 
                    variant="outline" 
                    className="mt-4 md:mt-0 backdrop-blur-md bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Exams
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-slide-up">
              {[
                {
                  title: 'Upload Model Answers',
                  description: 'Add answer sheets for automated grading',
                  icon: <Upload className="w-5 h-5 text-blue-400" />,
                  onClick: () => setActiveTab('upload'),
                },
                {
                  title: 'Create Questions',
                  description: 'Manually enter custom exam questions',
                  icon: <FileText className="w-5 h-5 text-violet-400" />,
                  onClick: () => setActiveTab('questions'),
                },
                {
                  title: 'AI Generated Questions',
                  description: 'Use AI to create questions from syllabus',
                  icon: <Brain className="w-5 h-5 text-emerald-400" />,
                  onClick: () => setActiveTab('syllabus'),
                },
              ].map((card, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer backdrop-blur-md bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={card.onClick}
                >
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-3">
                      {card.icon}
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription className="text-gray-300">{card.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            
            <Card className="animate-fade-in backdrop-blur-md bg-black/20 border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2 text-blue-400" />
                  Exam Creator
                </CardTitle>
                <CardDescription className="text-gray-300">Create and manage your exam content</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6 bg-white/10 border border-white/5">
                    <TabsTrigger value="upload" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-white data-[state=active]:border-0 text-gray-300">Model Answers</TabsTrigger>
                    <TabsTrigger value="questions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-white data-[state=active]:border-0 text-gray-300">Manual Questions</TabsTrigger>
                    <TabsTrigger value="syllabus" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-white data-[state=active]:border-0 text-gray-300">AI Questions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="animate-slide-up">
                    <FileUpload
                      title="Upload Model Answer Sheet"
                      description="Upload the model answer sheet for your exam questions"
                      onFileSelect={handleModelAnswerUpload}
                      accept=".pdf,.doc,.docx"
                      maxSize={20}
                    />
                  </TabsContent>
                  
                  <TabsContent value="questions" className="animate-slide-up">
                    <QuestionEntry />
                  </TabsContent>
                  
                  <TabsContent value="syllabus" className="animate-slide-up">
                    <FileUpload
                      title="Upload Syllabus PDF"
                      description="Upload a syllabus PDF to generate exam questions using AI"
                      onFileSelect={handleSyllabusUpload}
                      accept=".pdf"
                      maxSize={15}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
