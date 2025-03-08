import React from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { MinusCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import McqOptions from './McqOptions';
import ExpectedAnswerField from './ExpectedAnswerField';
import QuestionTypeSelect from './QuestionTypeSelect';
import NumericalAnswerField from './NumericalAnswerField';

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

interface ManualQuestionEntryProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

const ManualQuestionEntry: React.FC<ManualQuestionEntryProps> = ({ questions, setQuestions }) => {
  const addQuestion = () => {
    setQuestions([...questions, { 
      id: Date.now().toString(), 
      text: '', 
      type: 'mcq',
      options: [{ id: '1', text: '' }]
    }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      toast.error('You must have at least one question');
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: string | number) => {
    setQuestions(
      questions.map(q => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateQuestionType = (id: string, type: 'mcq' | 'shortanswer' | 'longanswer' | 'numerical') => {
    setQuestions(
      questions.map(q => {
        if (q.id === id) {
          let newQuestion: Question = { ...q, type };
          
          if (type === 'shortanswer' || type === 'longanswer') {
            newQuestion = { 
              ...newQuestion, 
              options: undefined,
              correctOption: undefined,
              numericalAnswer: undefined,
              tolerance: undefined,
              answer: ''
            };
          } else if (type === 'mcq') {
            newQuestion = { 
              ...newQuestion, 
              options: [{ id: '1', text: '' }],
              correctOption: undefined,
              numericalAnswer: undefined,
              tolerance: undefined,
              answer: undefined
            };
          } else if (type === 'numerical') {
            newQuestion = {
              ...newQuestion,
              options: undefined,
              correctOption: undefined,
              answer: undefined,
              numericalAnswer: 0,
              tolerance: 0
            };
          }
          
          return newQuestion;
        }
        return q;
      })
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          const options = [...(q.options || []), { id: Date.now().toString(), text: '' }];
          return { ...q, options };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          if ((q.options || []).length <= 1) {
            toast.error('A multiple choice question must have at least one option');
            return q;
          }
          
          const options = (q.options || []).filter(opt => opt.id !== optionId);
          const correctOption = q.correctOption === optionId ? undefined : q.correctOption;
          return { ...q, options, correctOption };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          const options = (q.options || []).map(opt => 
            opt.id === optionId ? { ...opt, text } : opt
          );
          return { ...q, options };
        }
        return q;
      })
    );
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          return { ...q, correctOption: optionId };
        }
        return q;
      })
    );
  };

  return (
    <div className="space-y-4 mb-4 animate-fade-in">
      <h3 className="text-sm font-medium">Manual Question Entry</h3>
      <p className="text-xs text-gray-400">Add questions manually for your exam</p>
      
      {questions.map((question, index) => (
        <div 
          key={question.id} 
          className="p-4 border rounded-xl bg-black/30 animate-scale-in"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Question {index + 1}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeQuestion(question.id)}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50/10"
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <QuestionTypeSelect 
              questionId={question.id} 
              type={question.type || 'mcq'} 
              onChange={updateQuestionType} 
            />
            
            <Textarea
              value={question.text}
              onChange={e => updateQuestion(question.id, 'text', e.target.value)}
              placeholder="Enter your question here..."
              className="min-h-[100px] resize-none bg-white/5 border-white/10 text-white"
            />
            
            {question.type === 'mcq' && (
              <McqOptions 
                questionId={question.id}
                options={question.options || []}
                correctOption={question.correctOption}
                addOption={addOption}
                removeOption={removeOption}
                updateOption={updateOption}
                setCorrectOption={setCorrectOption}
              />
            )}
            
            {question.type === 'shortanswer' && (
              <ExpectedAnswerField 
                questionId={question.id}
                answer={question.answer}
                type="shortanswer"
                onChange={updateQuestion}
              />
            )}
            
            {question.type === 'longanswer' && (
              <ExpectedAnswerField 
                questionId={question.id}
                answer={question.answer}
                type="longanswer"
                onChange={updateQuestion}
              />
            )}

            {question.type === 'numerical' && (
              <NumericalAnswerField
                questionId={question.id}
                numericalAnswer={question.numericalAnswer}
                tolerance={question.tolerance}
                onChange={updateQuestion}
              />
            )}
          </div>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addQuestion}
        className="border-dashed bg-white/5 border-white/10 text-white hover:bg-white/10"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
};

export default ManualQuestionEntry;
