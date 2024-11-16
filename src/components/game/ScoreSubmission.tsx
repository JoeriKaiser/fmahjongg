import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreSubmissionProps {
  time: number;
  onScoreSubmitted: () => void;
}

export const ScoreSubmission = ({ time, onScoreSubmitted }: ScoreSubmissionProps) => {
  const [name, setName] = useState<string>('');

  const saveScore = async () => {
    if (!name.trim()) return;

    try {
      onScoreSubmitted();
      await invoke('add_score', { name: name.trim(), time });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <Card className="w-96 bg-slate-800 text-white">
        <CardHeader>
          <CardTitle>Submit Your Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm">
              Enter your name:
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-slate-700 border-slate-600"
              maxLength={20}
            />
          </div>
          <div className="text-sm">
            Your time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
          </div>
          <Button
            onClick={saveScore}
            disabled={!name.trim()}
            className="w-full bg-slate-700 hover:bg-slate-600">
            Submit Score
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
