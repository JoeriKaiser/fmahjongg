import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Score = {
  id: number;
  name: string;
  time: number;
  timestamp: number;
};

export const TopScores = () => {
  const [scores, setScores] = useState<Score[]>([]);

  const fetchScores = async () => {
    try {
      const topScores = await invoke<Score[]>('get_top_scores', { limit: 5 });
      setScores(topScores);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="absolute right-4 top-4 w-64 bg-slate-800/90 text-white shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Top Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {scores.map((score, index) => (
            <div key={score.id} className="flex justify-between text-sm">
              <span>
                {index + 1}. {score.name}
              </span>
              <span>{formatTime(score.time)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
