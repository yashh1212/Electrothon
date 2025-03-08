import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';

interface ExamCodeDisplayProps {
  examCode: string;
  onCopy: (code: string) => void;
  onDismiss: () => void;
}

const ExamCodeDisplay: React.FC<ExamCodeDisplayProps> = ({ examCode, onCopy, onDismiss }) => {
  return (
    <Card className="mb-8 animate-scale-in bg-gradient-to-r from-blue-500/20 to-violet-500/20 backdrop-blur-md border-white/10 text-white">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-xl font-medium mb-1">Exam Created Successfully</h3>
            <p className="text-gray-300 mb-4">Share this code with your students to access the exam</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-mono bg-black/20 px-4 py-2 rounded-lg border border-white/10">
              {examCode}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onCopy(examCode)}
              className="border-white/20 bg-white/5 hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={onDismiss}
            className="border-white/20 bg-white/5 hover:bg-white/10"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCodeDisplay;