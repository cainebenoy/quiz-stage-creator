import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trophy, Plus, Crown, Medal, Award, ArrowLeft } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
}

interface LeaderboardEntry {
  id: string;
  quiz_id: string;
  participant_name: string;
  score: number;
  position: number;
  notes: string;
  created_at: string;
  quizzes?: { title: string };
}

interface LeaderboardManagerProps {
  onBack: () => void;
}

const LeaderboardManager = ({ onBack }: LeaderboardManagerProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    quiz_id: '',
    participant_name: '',
    score: 0,
    position: 1,
    notes: '',
  });

  useEffect(() => {
    fetchQuizzes();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      fetchLeaderboard(selectedQuizId);
    } else {
      fetchLeaderboard();
    }
  }, [selectedQuizId]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, description')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      toast.error('Failed to fetch quizzes');
    }
  };

  const fetchLeaderboard = async (quizId?: string) => {
    try {
      let query = supabase
        .from('leaderboard_entries')
        .select(`
          *,
          quizzes:quiz_id(title)
        `);

      if (quizId) {
        query = query.eq('quiz_id', quizId);
      }

      const { data, error } = await query.order('position', { ascending: true });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!newEntry.quiz_id || !newEntry.participant_name.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .insert([newEntry])
        .select(`
          *,
          quizzes:quiz_id(title)
        `)
        .single();

      if (error) throw error;

      setLeaderboard([...leaderboard, data]);
      setNewEntry({
        quiz_id: '',
        participant_name: '',
        score: 0,
        position: 1,
        notes: '',
      });
      setShowAddDialog(false);
      toast.success('Entry added to leaderboard!');
    } catch (error) {
      toast.error('Failed to add entry');
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p>Loading leaderboard...</p>
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
            <h1 className="text-xl font-bold">Leaderboard Manager</h1>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Winner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Leaderboard Entry</DialogTitle>
                <DialogDescription>
                  Add a participant's score to the leaderboard.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz">Quiz</Label>
                  <Select
                    value={newEntry.quiz_id}
                    onValueChange={(value) => setNewEntry({ ...newEntry, quiz_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quiz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes.map((quiz) => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Participant Name</Label>
                  <Input
                    id="name"
                    value={newEntry.participant_name}
                    onChange={(e) => setNewEntry({ ...newEntry, participant_name: e.target.value })}
                    placeholder="Enter participant name..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Score</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      value={newEntry.score}
                      onChange={(e) => setNewEntry({ ...newEntry, score: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      type="number"
                      min="1"
                      value={newEntry.position}
                      onChange={(e) => setNewEntry({ ...newEntry, position: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    placeholder="Any additional notes..."
                  />
                </div>

                <Button onClick={addEntry} className="w-full">
                  Add to Leaderboard
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filter */}
        <div className="mb-6">
          <Label htmlFor="filter-quiz">Filter by Quiz</Label>
          <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="All quizzes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All quizzes</SelectItem>
              {quizzes.map((quiz) => (
                <SelectItem key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leaderboard */}
        {leaderboard.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leaderboard entries yet.</p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="mt-4"
              >
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Leaderboard
            </h2>
            
            <div className="grid gap-4">
              {leaderboard.map((entry) => (
                <Card key={entry.id} className={`${entry.position <= 3 ? 'ring-2 ring-primary/20' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${getPositionColor(entry.position)}`}>
                          {getPositionIcon(entry.position)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{entry.participant_name}</h3>
                          <p className="text-muted-foreground">
                            {entry.quizzes?.title || 'Unknown Quiz'}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={`${entry.position <= 3 ? 'bg-primary/10' : ''}`}
                          >
                            #{entry.position}
                          </Badge>
                          <div className="text-2xl font-bold">{entry.score}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LeaderboardManager;