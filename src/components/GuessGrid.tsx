import React from 'react';
import { Guess, Feedback } from '../hooks/useGameState';
import teams from '../data/teams.json';
import { Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import clsx from 'clsx';

interface GuessGridProps {
    guesses: Guess[];
    calculateFeedback: (guess: Guess) => Feedback;
}

const FeedbackCell: React.FC<{
    label: string;
    status: 'correct' | 'incorrect' | 'higher' | 'lower' | 'close-higher' | 'close-lower';
    value: string | number;
}> = ({ label, status, value }) => {
    let bgColor = 'bg-gray-700';
    let icon = null;

    switch (status) {
        case 'correct':
            bgColor = 'bg-green-600';
            icon = <Check size={16} />;
            break;
        case 'incorrect':
            bgColor = 'bg-red-600';
            icon = <X size={16} />;
            break;
        case 'higher':
            bgColor = 'bg-red-600'; // Or maybe a different color?
            icon = <ArrowUp size={16} />;
            break;
        case 'lower':
            bgColor = 'bg-red-600';
            icon = <ArrowDown size={16} />;
            break;
        case 'close-higher':
            bgColor = 'bg-yellow-600';
            icon = <ArrowUp size={16} />;
            break;
        case 'close-lower':
            bgColor = 'bg-yellow-600';
            icon = <ArrowDown size={16} />;
            break;
    }

    return (
        <div className={clsx("flex flex-col items-center justify-center p-2 rounded text-center h-full", bgColor)}>
            <span className="text-xs text-gray-300 mb-1">{label}</span>
            <div className="font-bold flex items-center gap-1">
                {value}
                {icon}
            </div>
        </div>
    );
};

export const GuessGrid: React.FC<GuessGridProps> = ({ guesses, calculateFeedback }) => {
    const getTeamName = (id: number) => teams.find(t => t.id === id)?.name || 'Unknown';
    const getResultLabel = (res: number) => {
        if (res === 1) return 'Home Win';
        if (res === 2) return 'Away Win';
        return 'Draw';
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-2 mb-6">
            {guesses.map((guess, idx) => {
                const feedback = calculateFeedback(guess);
                return (
                    <div key={idx} className="grid grid-cols-4 gap-2">
                        <FeedbackCell
                            label="Home"
                            status={feedback.homeTeam}
                            value={getTeamName(guess.homeTeamId)}
                        />
                        <FeedbackCell
                            label="Away"
                            status={feedback.awayTeam}
                            value={getTeamName(guess.awayTeamId)}
                        />
                        <FeedbackCell
                            label="Result"
                            status={feedback.result}
                            value={getResultLabel(guess.result)}
                        />
                        <FeedbackCell
                            label="Year"
                            status={feedback.year}
                            value={guess.year}
                        />
                    </div>
                );
            })}
        </div>
    );
};
