import React, { useState } from 'react';
import { Guess, Feedback } from '../hooks/useGameState';
import teams from '../data/teams.json';
import { Share2 } from 'lucide-react';

interface GameOverModalProps {
    status: 'won' | 'lost';
    match: any;
    guesses: Guess[];
    onClose: () => void;
    calculateFeedback: (guess: Guess, match: any) => Feedback;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ status, match, guesses, onClose, calculateFeedback }) => {
    const [copied, setCopied] = useState(false);

    if (!match) return null;

    const getTeamName = (id: number) => teams.find(t => t.id === id)?.name || 'Unknown';
    const resultText = match.result === 1 ? 'Home Win' : match.result === 2 ? 'Away Win' : 'Draw';

    const generateEmojiGrid = () => {
        const header = `MatchDay Guesser ${match.date}\n${guesses.length}/6\n\n`;
        const grid = guesses.map(guess => {
            const fb = calculateFeedback(guess, match);
            const getIcon = (status: string) => {
                if (status === 'correct') return '🟩';
                if (status === 'incorrect') return '🟥';
                return '🟨'; // Close/Higher/Lower
            };
            return `${getIcon(fb.homeTeam)}${getIcon(fb.awayTeam)}${getIcon(fb.result)}${getIcon(fb.year)}`;
        }).join('\n');
        return header + grid;
    };

    const handleShare = async () => {
        const text = generateEmojiGrid();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for non-secure contexts if needed, but usually fine in modern browsers
            alert('Could not copy to clipboard. Here is your result:\n\n' + text);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center border border-gray-700 shadow-2xl">
                <h2 className={`text-3xl font-bold mb-4 ${status === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                    {status === 'won' ? 'You Won!' : 'Game Over'}
                </h2>

                <div className="mb-6 space-y-2 text-gray-300">
                    <p>The match was:</p>
                    <div className="text-xl font-bold text-white">
                        {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
                    </div>
                    <p>Result: <span className="text-white font-bold">{resultText}</span></p>
                    <p>Year: <span className="text-white font-bold">{match.year}</span></p>
                </div>

                <div className="mb-6">
                    <p className="text-gray-400 mb-2">Guesses: {guesses.length} / 6</p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleShare}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors flex items-center justify-center gap-2"
                    >
                        <Share2 size={20} />
                        {copied ? 'Copied!' : 'Share Result'}
                    </button>

                    <button
                        onClick={onClose}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-6 rounded transition-colors flex items-center justify-center gap-2"
                    >
                        Close
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <span className="text-2xl">&times;</span>
                </button>
            </div>
        </div>
    );
};
