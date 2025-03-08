
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
}

const QuestionEntry: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: '' },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), text: '' }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      toast.error('You must have at least one question');
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, text: string) => {
    setQuestions(
      questions.map(q => (q.id === id ? { ...q, text } : q))
    );
  };

  const saveQuestions = () => {
    const emptyQuestions = questions.filter(q => !q.text.trim());
    if (emptyQuestions.length > 0) {
      toast.error('Please fill in all questions');
      return;
    }

    // Simulate API call
    toast.success(`${questions.length} questions saved successfully`);
    console.log('Questions:', questions);
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Enter Questions Manually</h3>
        <p className="text-muted-foreground text-sm">Add questions one by one for your exam</p>
      </div>
      
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="p-4 border rounded-xl bg-card animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Question {index + 1}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(question.id)}
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea
              value={question.text}
              onChange={e => updateQuestion(question.id, e.target.value)}
              placeholder="Enter your question here..."
              className="min-h-[100px] resize-none"
            />
          </div>
        ))}
        
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
          
          <Button 
            type="button" 
            onClick={saveQuestions}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Save Questions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEntry;
