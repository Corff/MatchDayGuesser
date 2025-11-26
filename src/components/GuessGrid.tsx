import React from 'react';
import { Guess, Feedback, Unit } from '../hooks/useGameState';
import teams from '../data/teams.json';
import { ArrowUp, ArrowDown } from 'lucide-react';
import clsx from 'clsx';

interface GuessGridProps {
    guesses: Guess[];
    calculateFeedback: (guess: Guess) => Feedback;
    units: Unit;
}

export const GuessGrid: React.FC<GuessGridProps> = ({ guesses, calculateFeedback, units }) => {
    const getTeamName = (id: number) => teams.find(t => t.id === id)?.name || 'Unknown';
    const getResultText = (result: number) => result === 1 ? 'Home Win' : result === 2 ? 'Away Win' : 'Draw';

    const formatDistance = (km: number | undefined) => {
        if (km === undefined) return '';
        const distance = units === 'km' ? km : km * 0.621371;
        return `${Math.round(distance)} ${units}`;
    };

    const getDistanceColor = (km: number | undefined) => {
        if (km === undefined) return 'bg-gray-700 border-gray-600';
        if (km === 0) return 'bg-green-600 border-green-500';
        if (km < 50) return 'bg-yellow-600 border-yellow-500'; // Close
        return 'bg-red-600 border-red-500';
    };

    return (
        <div className="w-full max-w-4xl mb-8 overflow-x-auto">
            <div className="min-w-[600px]">
                <div className="grid grid-cols-4 gap-4 mb-2 text-gray-400 font-bold text-center text-sm uppercase tracking-wider">
                    <div>Home Team</div>
                    <div>Away Team</div>
                    <div>Result</div>
                    <div>Year</div>
                </div>

                <div className="space-y-2">
                    {guesses.map((guess, index) => {
                        const feedback = calculateFeedback(guess);

                        return (
                            <div key={index} className="grid grid-cols-4 gap-4">
                                {/* Home Team */}
                                <div className={clsx(
                                    "p-3 rounded flex flex-col items-center justify-center text-center border-2 transition-all",
                                    feedback.homeTeam === 'correct' ? "bg-green-600 border-green-500" : getDistanceColor(feedback.homeDistance)
                                )}>
                                    <span className="font-bold text-white">{getTeamName(guess.homeTeamId)}</span>
                                    {feedback.homeTeam !== 'correct' && feedback.homeDistance !== undefined && (
                                        <span className="text-xs text-white/90 mt-1">{formatDistance(feedback.homeDistance)}</span>
                                    )}
                                </div>

                                {/* Away Team */}
                                <div className={clsx(
                                    "p-3 rounded flex flex-col items-center justify-center text-center border-2 transition-all",
                                    feedback.awayTeam === 'correct' ? "bg-green-600 border-green-500" : getDistanceColor(feedback.awayDistance)
                                )}>
                                    <span className="font-bold text-white">{getTeamName(guess.awayTeamId)}</span>
                                    {feedback.awayTeam !== 'correct' && feedback.awayDistance !== undefined && (
                                        <span className="text-xs text-white/90 mt-1">{formatDistance(feedback.awayDistance)}</span>
                                    )}
                                </div>

                                {/* Result */}
                                <div className={clsx(
                                    "p-3 rounded flex items-center justify-center text-center border-2 transition-all",
                                    feedback.result === 'correct' ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500"
                                )}>
                                    <span className="font-bold text-white">{getResultText(guess.result)}</span>
                                </div>

                                {/* Year */}
                                <div className={clsx(
                                    "p-3 rounded flex items-center justify-center text-center gap-2 border-2 transition-all",
                                    feedback.year === 'correct' ? "bg-green-600 border-green-500" :
                                        (feedback.year === 'close-higher' || feedback.year === 'close-lower') ? "bg-yellow-600 border-yellow-500" : "bg-red-600 border-red-500"
                                )}>
                                    <span className="font-bold text-white">{guess.year}</span>
                                    {feedback.year === 'lower' && <ArrowDown size={16} />}
                                    {feedback.year === 'higher' && <ArrowUp size={16} />}
                                    {feedback.year === 'close-lower' && <ArrowDown size={16} />}
                                    {feedback.year === 'close-higher' && <ArrowUp size={16} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
