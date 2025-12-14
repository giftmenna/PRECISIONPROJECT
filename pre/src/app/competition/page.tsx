'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy, Zap, Gem, AlertTriangle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Competition {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isLive: boolean;
  isUpcoming: boolean;
  isCompleted: boolean;
  prizePool: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  entryFee: number;
  entryPriceNgn?: number;
  entryType?: 'FREE' | 'PAID';
  dropIntervalHours?: number;
  dropOpenMinutes?: number;
  questionsPerDrop?: number;
  type: 'regular' | 'grade' | 'test' | 'testset';
  grade?: string;
  requiredGrade?: string;
  questionData?: {
    id: string;
    prompt: string;
    choices: string[];
    correct: string;
    topic: string;
    timeLimit: number;
    imageUrl?: string;
    requiredGrade?: string;
    requiredGems?: number;
  };
  testSetData?: {
    id: string;
    name: string;
    description: string;
    questions: {
      id: string;
      prompt: string;
      choices: string[];
      correct: string;
      topic: string;
      timeLimit: number;
      imageUrl?: string;
    }[];
    totalQuestions: number;
  };
}

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  competition: Competition | null;
}

function TermsModal({ isOpen, onClose, onAccept, competition }: TermsModalProps) {
  if (!isOpen || !competition) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Terms & Conditions
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gem className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800 dark:text-blue-200">
                  Entry Fee: {competition.entryFee} Gems
                </span>
              </div>
              <p className="text-sm">
                You will be charged {competition.entryFee} gems to participate in this competition.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Competition Rules:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>You must have at least {competition.entryFee} gems in your wallet to participate</li>
                <li>Once you start the competition, you cannot pause or restart</li>
                <li>Your grade level must match the competition requirements</li>
                <li>All answers are final and cannot be changed after submission</li>
                <li>Prizes will be awarded based on accuracy and speed</li>
                <li>Any form of cheating will result in immediate disqualification</li>
                <li>The competition organizers reserve the right to modify rules if necessary</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Privacy & Data:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Your performance data will be used for leaderboard rankings</li>
                <li>Personal information will be kept confidential</li>
                <li>Results may be used for educational research purposes</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Important Notice
                </span>
              </div>
              <p className="text-sm">
                By clicking "Accept & Continue", you agree to all terms and conditions above and confirm that your grade level is correct.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onAccept}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface GradeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (grade: string) => void;
  userGrade: string | null;
}

function GradeConfirmationModal({ isOpen, onClose, onConfirm, userGrade }: GradeConfirmationModalProps) {
  const [selectedGrade, setSelectedGrade] = useState(userGrade || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Confirm Your Grade Level
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Please confirm your current grade level to ensure you get the appropriate questions for your level.
          </p>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select your grade:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select your grade</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(selectedGrade)}
              disabled={!selectedGrade}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Confirm Grade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompetitionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showGradeConfirmation, setShowGradeConfirmation] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [userGems, setUserGems] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchCompetitions();
    fetchUserGems();
  }, [session, status, router]);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/competitions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch competitions');
      }

      const data = await response.json();
      setCompetitions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGems = async () => {
    try {
      const response = await fetch('/api/user/wallet');
      if (response.ok) {
        const data = await response.json();
        setUserGems(Number(data.gemsBalance) || 0);
      }
    } catch (error) {
      console.error('Failed to fetch user gems:', error);
    }
  };

  const handleTakeCompetition = (competition: Competition) => {
    // Check if competition is live
    if (!competition.isLive) {
      if (competition.isUpcoming) {
        toast({
          title: "Competition Not Started",
          description: `This competition starts on ${formatDateTime(competition.startTime)}. Please wait until then to participate.`,
          variant: "destructive",
        });
      } else if (competition.isCompleted) {
        toast({
          title: "Competition Ended",
          description: "This competition has already ended. You can no longer participate.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Competition Not Available",
          description: "This competition is not currently available for participation.",
          variant: "destructive",
        });
      }
      return;
    }

    // Handle test questions differently
    if (competition.type === 'test') {
      // Check gem requirements for test questions
      if (competition.entryFee > 0 && userGems < competition.entryFee) {
        toast({
          title: "Insufficient Gems",
          description: `You need at least ${competition.entryFee} gems to participate. You currently have ${userGems} gems.`,
          variant: "destructive",
        });
        return;
      }

      // For test questions, always show terms first
      setSelectedCompetition(competition);
      setShowTerms(true);
      return;
    }

    // Handle test sets differently
    if (competition.type === 'testset') {
      // Check gem requirements for test sets
      if (competition.entryFee > 0 && userGems < competition.entryFee) {
        toast({
          title: "Insufficient Gems",
          description: `You need at least ${competition.entryFee} gems to participate. You currently have ${userGems} gems.`,
          variant: "destructive",
        });
        return;
      }

      // For test sets, always show terms first
      setSelectedCompetition(competition);
      setShowTerms(true);
      return;
    }

    // Check if user has enough gems (for paid competitions)
    if (competition.entryType === 'PAID' && userGems < competition.entryFee) {
      toast({
        title: "Insufficient Gems",
        description: `You need at least ${competition.entryFee} gems to participate. You currently have ${userGems} gems.`,
        variant: "destructive",
      });
      return;
    }

    // Check if user has selected a grade (for grade competitions)
    if (competition.type === 'grade' && !(session?.user as any)?.grade) {
      toast({
        title: "Grade Required",
        description: "Please select your grade in your profile before participating in grade competitions.",
        variant: "destructive",
      });
      router.push('/profile');
      return;
    }

    // Check if user's grade matches (for grade competitions)
    if (competition.type === 'grade' && competition.grade && (session?.user as any)?.grade !== competition.grade) {
      toast({
        title: "Grade Mismatch",
        description: `This competition is for ${competition.grade} students. Your current grade is ${(session?.user as any)?.grade}.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedCompetition(competition);
    setShowTerms(true);
  };

  const handleAcceptTerms = () => {
    setShowTerms(false);
    
    // For test questions, check if grade selection is needed
    if (selectedCompetition?.type === 'test' && selectedCompetition.questionData?.requiredGrade) {
      setShowGradeConfirmation(true);
    } else if (selectedCompetition?.type === 'testset' && selectedCompetition.requiredGrade) {
      setShowGradeConfirmation(true);
    } else if (selectedCompetition?.type === 'grade') {
      setShowGradeConfirmation(true);
    } else {
      // For regular competitions and test questions/sets without grade requirements, proceed directly
      handleStartCompetition();
    }
  };

  const handleConfirmGrade = async (grade: string) => {
    if (!selectedCompetition) return;

    try {
      // Update user grade if different from current
      if (grade !== (session?.user as any)?.grade) {
        const response = await fetch('/api/user/grade', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ grade })
        });

        if (!response.ok) {
          throw new Error('Failed to update grade');
        }
      }

      // Check if grade matches for test questions
      if (selectedCompetition.type === 'test' && selectedCompetition.questionData?.requiredGrade) {
        if (grade !== selectedCompetition.questionData.requiredGrade) {
          toast({
            title: "Grade Mismatch",
            description: `This test question is for ${selectedCompetition.questionData.requiredGrade} students. Your selected grade is ${grade}.`,
            variant: "destructive",
          });
          return;
        }
      }

      // Check if grade matches for test sets
      if (selectedCompetition.type === 'testset' && selectedCompetition.requiredGrade) {
        if (grade !== selectedCompetition.requiredGrade) {
          toast({
            title: "Grade Mismatch",
            description: `This test set is for ${selectedCompetition.requiredGrade} students. Your selected grade is ${grade}.`,
            variant: "destructive",
          });
          return;
        }
      }

      setShowGradeConfirmation(false);
      handleStartCompetition();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update grade',
        variant: "destructive",
      });
      setShowGradeConfirmation(false);
      setSelectedCompetition(null);
    }
  };

  const handleStartCompetition = async () => {
    if (!selectedCompetition) return;

    try {
      // Handle different competition types
      if (selectedCompetition.type === 'test') {
        // For test questions, deduct gems if required and start immediately
        if (selectedCompetition.entryFee > 0) {
          const deductResponse = await fetch('/api/user/wallet', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              action: 'deduct',
              amount: selectedCompetition.entryFee,
              reason: `Test question: ${selectedCompetition.title}`
            })
          });

          if (!deductResponse.ok) {
            throw new Error('Failed to deduct gems');
          }

          // Update local gem count
          setUserGems(prev => prev - selectedCompetition.entryFee);
        }

        // Start test question immediately
        setSelectedCompetition(null);
        
        toast({
          title: "Test Started!",
          description: "Your test question is ready. Good luck!",
        });

        // Route to test question page with question data
        router.push(`/test-question/${selectedCompetition.questionData?.id}`);
        return;
      }

      if (selectedCompetition.type === 'testset') {
        // For test sets, deduct gems if required and start immediately
        if (selectedCompetition.entryFee > 0) {
          const deductResponse = await fetch('/api/user/wallet', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              action: 'deduct',
              amount: selectedCompetition.entryFee,
              reason: `Test set: ${selectedCompetition.title}`
            })
          });

          if (!deductResponse.ok) {
            throw new Error('Failed to deduct gems');
          }

          // Update local gem count
          setUserGems(prev => prev - selectedCompetition.entryFee);
        }

        // Start test set immediately
        setSelectedCompetition(null);
        
        toast({
          title: "Test Set Started!",
          description: `Your test set with ${selectedCompetition.testSetData?.totalQuestions} questions is ready. Good luck!`,
        });

        // Route to test set page with test set data
        router.push(`/test-set/${selectedCompetition.testSetData?.id}`);
        return;
      }

      // Handle regular and grade competitions
      let enterResponse;
      if (selectedCompetition.type === 'grade') {
        enterResponse = await fetch(`/api/grade-competitions/${selectedCompetition.id}/enter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        enterResponse = await fetch(`/api/competitions/${selectedCompetition.id}/enter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!enterResponse.ok) {
        throw new Error('Failed to enter competition');
      }

      setSelectedCompetition(null);
      
      toast({
        title: "Success!",
        description: "You have successfully entered the competition!",
      });

      // Route to appropriate competition page based on type
      if (selectedCompetition.type === 'grade') {
        router.push(`/grade-competition/live/${selectedCompetition.id}`);
      } else {
        router.push(`/competition/live/${selectedCompetition.id}`);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to start competition',
        variant: "destructive",
      });
      setSelectedCompetition(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'HARD':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchCompetitions}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Math Competitions
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Test your mathematical skills against other students in real-time competitions. 
          Compete for prizes and climb the leaderboard!
        </p>
        
        {/* User Gems Display */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full">
            <Gem className="h-5 w-5" />
            <span className="font-semibold">{userGems} Gems Available</span>
          </div>
        </div>
      </div>

      {competitions.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Competitions Available</h3>
          <p className="text-gray-500 dark:text-gray-500">Check back later for new competitions!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {competitions.filter(c => c.title).map((competition) => (
            <Card key={competition.id} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 text-gray-900 dark:text-white">{competition.title}</CardTitle>
                      <CardDescription className="mb-3 text-gray-600 dark:text-gray-400">
                        {competition.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getDifficultyColor(competition.difficulty)}>
                        {competition.difficulty}
                      </Badge>
                      {competition.type === 'grade' && competition.grade && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {competition.grade}
                        </Badge>
                      )}
                      {competition.type === 'test' && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                          Test
                        </Badge>
                      )}
                      {competition.type === 'testset' && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                          Set
                        </Badge>
                      )}
                      {competition.isLive && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Live Now
                        </Badge>
                      )}
                      {competition.isUpcoming && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Upcoming
                        </Badge>
                      )}
                      {competition.isCompleted && (
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                          Ended
                        </Badge>
                      )}
                    </div>
                  </div>
              </CardHeader>
              
              <CardContent>
                                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Starts: {formatDateTime(competition.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Ends: {formatDateTime(competition.endTime)}</span>
                    </div>
                    
                    {competition.type === 'regular' && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span>Gem Reward: {competition.prizePool} gems</span>
                      </div>
                    )}
                    {competition.type === 'grade' && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span>Grade: {competition.grade}</span>
                      </div>
                    )}
                    {competition.type === 'test' && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>Single Question</span>
                      </div>
                    )}
                    {competition.type === 'testset' && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span>Grade: {competition.grade}</span>
                      </div>
                    )}
                    {competition.type === 'testset' && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>Multiple Questions</span>
                      </div>
                    )}
                    {competition.type === 'grade' && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span>Grade: {competition.grade}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Gem className="h-4 w-4 mr-2" />
                      <span>
                        {competition.entryType === 'FREE' ? 'Free Entry' : `Entry Fee: ${competition.entryFee} gems`}
                      </span>
                    </div>
                  </div>

                <div className="flex gap-2">
                  {competition.isLive ? (
                    competition.entryType === 'PAID' && userGems < competition.entryFee ? (
                      // Show "Get More Gems" button when user doesn't have enough gems
                      <Button 
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700" 
                        onClick={() => router.push('/pricing')}
                      >
                        <Gem className="h-4 w-4 mr-2" />
                        Get More Gems
                      </Button>
                    ) : (
                      // Show "Take Competition" button when user has enough gems
                      <Button 
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                        onClick={() => handleTakeCompetition(competition)}
                        disabled={
                          (competition.type === 'grade' && (!(session?.user as any)?.grade || (competition.grade && (session?.user as any)?.grade !== competition.grade))) ||
                          false
                        }
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Take Competition
                      </Button>
                    )
                  ) : competition.isUpcoming ? (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                      disabled
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Starts {formatDateTime(competition.startTime)}
                    </Button>
                  ) : competition.isCompleted ? (
                    <Button 
                      className="flex-1" 
                      disabled
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Competition Ended
                    </Button>
                  ) : (
                    <Button className="flex-1" disabled>
                      Coming Soon
                    </Button>
                  )}
                </div>

                {competition.entryType === 'PAID' && userGems < competition.entryFee && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                      Need {competition.entryFee - userGems} more gems to participate
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      You have {userGems} gems • Required: {competition.entryFee} gems
                    </p>
                  </div>
                )}
                {competition.type === 'grade' && !(session?.user as any)?.grade && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                    Select your grade in profile
                  </p>
                )}
                {competition.type === 'grade' && competition.grade && (session?.user as any)?.grade && (session?.user as any)?.grade !== competition.grade && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                    Grade mismatch: {competition.grade} required
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleAcceptTerms}
        competition={selectedCompetition}
      />

      {/* Grade Confirmation Modal */}
      <GradeConfirmationModal
        isOpen={showGradeConfirmation}
        onClose={() => setShowGradeConfirmation(false)}
        onConfirm={handleConfirmGrade}
        userGrade={(session?.user as any)?.grade}
      />
    </div>
  );
} 