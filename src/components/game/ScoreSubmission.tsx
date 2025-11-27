import { useState, useCallback, memo, useId } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ScoreSubmissionProps {
  time: number;
  onScoreSubmitted: () => void;
}

export const ScoreSubmission = memo(function ScoreSubmission({
  time,
  onScoreSubmitted
}: ScoreSubmissionProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveScore = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await invoke('add_score', { name: trimmedName, time });
      onScoreSubmitted();
    } catch (error) {
      console.error('Failed to save score:', error);
      setIsSubmitting(false);
    }
  }, [name, time, onScoreSubmitted, isSubmitting]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        saveScore();
      }
    },
    [saveScore]
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200">
      <Card className="w-96 bg-slate-800 text-white border-slate-700 animate-in zoom-in-95 duration-200">
        <CardHeader>
          <CardTitle className="text-xl">🏆 Submit Your Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="text-4xl font-mono font-bold text-emerald-400">
              {formatTime(time)}
            </div>
            <div className="text-sm text-slate-400 mt-1">Completion Time</div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-slate-300">
              Enter your name:
            </label>
            <Input
              id={useId()}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your name"
              className="bg-slate-700 border-slate-600 focus:border-emerald-500 transition-colors"
              maxLength={20}
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <Button
            onClick={saveScore}
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Score'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});
