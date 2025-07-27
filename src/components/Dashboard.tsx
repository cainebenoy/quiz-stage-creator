import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, Users, Trophy, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardProps {
  onCreateQuiz: () => void;
  onViewQuizzes: () => void;
  onViewLeaderboard: () => void;
}

const Dashboard = ({ onCreateQuiz, onViewQuizzes, onViewLeaderboard }: DashboardProps) => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Failed to sign out');
      } else {
        toast.success('Signed out successfully');
        navigate('/auth');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Quiz Stage</h1>
              <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              {isAdmin && (
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isAdmin ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                You need admin privileges to access the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Please contact an administrator to get admin access.
              </p>
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Welcome to Quiz Stage</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Create engaging quizzes, manage questions, and track leaderboards for your in-person quiz events.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onCreateQuiz}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Create Quiz</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Create a new quiz and add questions for your next event.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewQuizzes}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <Brain className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-lg">Manage Quizzes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    View, edit, and present your existing quizzes.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewLeaderboard}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-destructive/20">
                      <Trophy className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-lg">Leaderboard</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Manage quiz results and track winners.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Quizzes</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Brain className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Settings className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Participants</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Events</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;