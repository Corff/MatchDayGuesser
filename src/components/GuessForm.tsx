import React, { useState } from 'react';
import { Guess } from '../hooks/useGameState';
import teams from '../data/teams.json';

interface GuessFormProps {
    onSubmit: (guess: Guess) => void;
    disabled: boolean;
}

export const GuessForm: React.FC<GuessFormProps> = ({ onSubmit, disabled }) => {
    const [homeTeamId, setHomeTeamId] = useState<string>('');
    const [awayTeamId, setAwayTeamId] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [year, setYear] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!homeTeamId || !awayTeamId || !result || !year) return;

        onSubmit({
            homeTeamId: parseInt(homeTeamId),
            awayTeamId: parseInt(awayTeamId),
            result: parseInt(result),
            year: parseInt(year),
        });

        // Reset form? Maybe keep values for easier adjustment? 
        // Wordle keeps them, but here we have dropdowns. Let's keep them.
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-gray-800 p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Home Team</label>
                    <select
                        value={homeTeamId}
                        onChange={(e) => setHomeTeamId(e.target.value)}
                        disabled={disabled}
                        className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                        <option value="">Select Team</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Away Team</label>
                    <select
                        value={awayTeamId}
                        onChange={(e) => setAwayTeamId(e.target.value)}
                        disabled={disabled}
                        className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                        <option value="">Select Team</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Result</label>
                    <select
                        value={result}
                        onChange={(e) => setResult(e.target.value)}
                        disabled={disabled}
                        className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                        <option value="">Select Result</option>
                        <option value="1">Home Win</option>
                        <option value="0">Draw</option>
                        <option value="2">Away Win</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        disabled={disabled}
                        placeholder="YYYY"
                        min="1900"
                        max="2099"
                        className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={disabled || !homeTeamId || !awayTeamId || !result || !year}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Guess
            </button>
        </form>
    );
};
