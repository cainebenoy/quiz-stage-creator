import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import QuizManager from '@/components/QuizManager';
import LeaderboardManager from '@/components/LeaderboardManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, Trophy, Sparkles } from 'lucide-react';

type ViewMode = 'dashboard' | 'quizzes' | 'leaderboard';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
           style={{ background: 'var(--gradient-primary)' }}>
        <Card className="w-full max-w-lg bg-card/95 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/20">
                <Brain className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Quiz Stage</CardTitle>
            <CardDescription className="text-lg">
              Create and manage amazing quizzes for your events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Create Quizzes</p>
                  <p className="text-sm text-muted-foreground">Build engaging quiz content</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-medium">Present Live</p>
                  <p className="text-sm text-muted-foreground">Perfect for IRL events</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-destructive/10">
                <Trophy className="h-6 w-6 text-destructive" />
                <div>
                  <p className="font-medium">Track Winners</p>
                  <p className="text-sm text-muted-foreground">Manage leaderboards</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  switch (viewMode) {
    case 'quizzes':
      return <QuizManager onBack={() => setViewMode('dashboard')} />;
    case 'leaderboard':
      return <LeaderboardManager onBack={() => setViewMode('dashboard')} />;
    default:
      return (
        <Dashboard
          onCreateQuiz={() => setViewMode('quizzes')}
          onViewQuizzes={() => setViewMode('quizzes')}
          onViewLeaderboard={() => setViewMode('leaderboard')}
        />
      );
  }
};

export default Index;
