import React from 'react';
import matches from '../data/matches.json';
import { Calendar, Check, X, Circle } from 'lucide-react';
import clsx from 'clsx';

interface ArchiveProps {
    onSelectDate: (date: string) => void;
    onClose: () => void;
}

export const Archive: React.FC<ArchiveProps> = ({ onSelectDate, onClose }) => {
    const getMatchStatus = (date: string) => {
        const storageKey = `matchday_guesser_state_${date}`;
        const savedState = localStorage.getItem(storageKey);
        if (!savedState) return 'unplayed';
        const state = JSON.parse(savedState);
        return state.gameStatus; // 'playing', 'won', 'lost'
    };

    return (
        <div className="fixed inset-0 bg-slate-900 z-40 flex flex-col p-4 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Calendar /> Archive
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Close
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matches.filter(m => new Date(m.date) <= new Date()).map((match) => {
                        const status = getMatchStatus(match.date);
                        let statusIcon = <Circle size={20} className="text-gray-500" />;
                        let statusColor = 'border-gray-700 hover:border-gray-500';

                        if (status === 'won') {
                            statusIcon = <Check size={20} className="text-green-500" />;
                            statusColor = 'border-green-900 hover:border-green-700 bg-green-900/20';
                        } else if (status === 'lost') {
                            statusIcon = <X size={20} className="text-red-500" />;
                            statusColor = 'border-red-900 hover:border-red-700 bg-red-900/20';
                        } else if (status === 'playing') {
                            statusIcon = <Circle size={20} className="text-yellow-500" />;
                            statusColor = 'border-yellow-900 hover:border-yellow-700 bg-yellow-900/20';
                        }

                        return (
                            <button
                                key={match.date}
                                onClick={() => onSelectDate(match.date)}
                                className={clsx(
                                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left",
                                    statusColor,
                                    "bg-gray-800"
                                )}
                            >
                                <div>
                                    <div className="font-bold text-lg text-white">{match.date}</div>
                                </div>
                                <div>
                                    {statusIcon}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
