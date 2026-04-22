 'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { PieChart, CheckCircle } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  hasVoted?: boolean;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  totalVotes: number;
  endsAt: Date;
  isActive: boolean;
  status: string;
  startDate: string;
  endDate: string;
  targetAudience: string[];
}

interface PollWidgetProps {
  maxPolls?: number;
}

function toDateOnly(value: string): string | null {
  if (!value) {
    return null;
  }

  const direct = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(direct)) {
    return direct;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mapPolls(data: any): Poll[] {
  return (data.polls || []).map((poll: any) => ({
    id: poll.id,
    title: poll.title,
    description: poll.description || undefined,
    options: Array.isArray(poll.options)
      ? poll.options.map((option: any) => ({
          id: option.id,
          text: option.text,
          votes: Number(option.votes || 0),
        }))
      : [],
    totalVotes: Number(poll.totalVotes || 0),
    endsAt: new Date(poll.endDate),
    isActive: poll.status === 'active',
    status: String(poll.status || ''),
    startDate: String(poll.startDate || ''),
    endDate: String(poll.endDate || ''),
    targetAudience: Array.isArray(poll.targetAudience) ? poll.targetAudience.map(String) : [],
  }));
}

export function PollWidget({ maxPolls = 2 }: PollWidgetProps) {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadPolls = async () => {
      try {
        const response = await fetch('/api/polls', { credentials: 'include' });
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setPolls(mapPolls(data));
      } catch {
        setPolls([]);
      }
    };

    void loadPolls();
  }, []);

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      const voteResponse = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });

      if (!voteResponse.ok) {
        return;
      }

      setVotedPolls((prev) => new Set([...prev, pollId]));

      const response = await fetch('/api/polls', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPolls(mapPolls(data));
      }
    } catch {
      return;
    }
  };

  const visiblePolls = polls.filter((poll) => {
    if (user?.role === 'admin') {
      return true;
    }

    if (!user?.role) {
      return false;
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const start = toDateOnly(poll.startDate);
    const end = toDateOnly(poll.endDate);
    const isAudienceMatch = poll.targetAudience.includes(user.role) || poll.targetAudience.includes('all');
    const isWithinDateWindow = (!start || start <= today) && (!end || end >= today);
    return poll.status === 'active' && isAudienceMatch && isWithinDateWindow;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-600" />
          <CardTitle>Active Polls</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {visiblePolls.slice(0, maxPolls).length === 0 ? (
          <p className="text-center text-slate-500 py-8">No active polls</p>
        ) : (
          <div className="space-y-6">
            {visiblePolls.slice(0, maxPolls).map((poll) => (
              <div key={poll.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="font-semibold text-slate-900">{poll.title}</h3>
                {poll.description && (
                  <p className="text-sm text-slate-600 mt-1">{poll.description}</p>
                )}

                <div className="mt-4 space-y-2">
                  {poll.options.map((option) => {
                    const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                    const hasVoted = votedPolls.has(poll.id);

                    return (
                      <button
                        key={option.id}
                        onClick={() => !hasVoted && handleVote(poll.id, option.id)}
                        disabled={hasVoted}
                        className={`w-full text-left transition-colors ${
                          hasVoted ? 'opacity-70' : 'hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {hasVoted && (
                              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                            )}
                            <span className="text-sm">{option.text}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {percentage}%
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {option.votes} votes
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Total votes: {poll.totalVotes}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
