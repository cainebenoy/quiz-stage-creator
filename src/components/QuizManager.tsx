import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Brain, Plus, Edit, Eye, Trash2, ArrowLeft } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  questions?: Question[];
}

interface Question {
  id: string;
  question_text: string;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  points: number;
  question_order: number;
}

interface QuizManagerProps {
  onBack: () => void;
}

const QuizManager = ({ onBack }: QuizManagerProps) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
  });

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    correct_answer: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    points: 1,
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuestions(selectedQuiz.id);
    }
  }, [selectedQuiz]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('question_order', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      toast.error('Failed to fetch questions');
    }
  };

  const createQuiz = async () => {
    if (!newQuiz.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([
          {
            title: newQuiz.title,
            description: newQuiz.description,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setQuizzes([data, ...quizzes]);
      setNewQuiz({ title: '', description: '' });
      setShowCreateDialog(false);
      toast.success('Quiz created successfully!');
    } catch (error) {
      toast.error('Failed to create quiz');
    } finally {
      setIsCreating(false);
    }
  };

  const addQuestion = async () => {
    if (!selectedQuiz || !newQuestion.question_text.trim()) {
      toast.error('Please fill in the question text');
      return;
    }

    try {
      const nextOrder = questions.length + 1;
      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            quiz_id: selectedQuiz.id,
            question_text: newQuestion.question_text,
            correct_answer: newQuestion.correct_answer,
            option_a: newQuestion.option_a,
            option_b: newQuestion.option_b,
            option_c: newQuestion.option_c,
            option_d: newQuestion.option_d,
            points: newQuestion.points,
            question_order: nextOrder,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setQuestions([...questions, data]);
      setNewQuestion({
        question_text: '',
        correct_answer: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        points: 1,
      });
      toast.success('Question added successfully!');
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      setQuizzes(quizzes.filter(q => q.id !== quizId));
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz(null);
        setQuestions([]);
      }
      toast.success('Quiz deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold">Quiz Manager</h1>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogDescription>
                  Create a new quiz and start adding questions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    placeholder="Enter quiz title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                    placeholder="Enter quiz description..."
                  />
                </div>
                <Button onClick={createQuiz} disabled={isCreating} className="w-full">
                  {isCreating ? 'Creating...' : 'Create Quiz'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quiz List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Quizzes</h2>
            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No quizzes created yet.</p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-4"
                  >
                    Create Your First Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <Card 
                    key={quiz.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedQuiz?.id === quiz.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedQuiz(quiz)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={quiz.is_active ? 'default' : 'secondary'}>
                            {quiz.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuiz(quiz.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {quiz.description && (
                        <CardDescription>{quiz.description}</CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Questions Management */}
          <div className="space-y-4">
            {selectedQuiz ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Questions</h2>
                  <Badge variant="outline">
                    {questions.length} questions
                  </Badge>
                </div>

                {/* Add Question Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Question</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        value={newQuestion.question_text}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                        placeholder="Enter your question..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="option-a">Option A</Label>
                        <Input
                          id="option-a"
                          value={newQuestion.option_a}
                          onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="option-b">Option B</Label>
                        <Input
                          id="option-b"
                          value={newQuestion.option_b}
                          onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="option-c">Option C</Label>
                        <Input
                          id="option-c"
                          value={newQuestion.option_c}
                          onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="option-d">Option D</Label>
                        <Input
                          id="option-d"
                          value={newQuestion.option_d}
                          onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="correct">Correct Answer</Label>
                        <Input
                          id="correct"
                          value={newQuestion.correct_answer}
                          onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                          placeholder="A, B, C, D, or custom answer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="points">Points</Label>
                        <Input
                          id="points"
                          type="number"
                          min="1"
                          value={newQuestion.points}
                          onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>

                    <Button onClick={addQuestion} className="w-full">
                      Add Question
                    </Button>
                  </CardContent>
                </Card>

                {/* Questions List */}
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>Question {index + 1}</span>
                          <Badge variant="outline">{question.points} pts</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium mb-2">{question.question_text}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {question.option_a && <p><strong>A:</strong> {question.option_a}</p>}
                          {question.option_b && <p><strong>B:</strong> {question.option_b}</p>}
                          {question.option_c && <p><strong>C:</strong> {question.option_c}</p>}
                          {question.option_d && <p><strong>D:</strong> {question.option_d}</p>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Correct Answer:</strong> {question.correct_answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a quiz to manage its questions.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizManager;