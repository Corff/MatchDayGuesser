import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { MatchImage } from './components/MatchImage';
import { GuessForm } from './components/GuessForm';
import { GuessGrid } from './components/GuessGrid';
import { GameOverModal } from './components/GameOverModal';
import { Archive } from './components/Archive';
import { SettingsModal } from './components/SettingsModal';
import { DevPage } from './components/DevPage';
import { Calendar, Trash2, Settings } from 'lucide-react';

function App() {
    const [showArchive, setShowArchive] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [targetDate, setTargetDate] = useState<string | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        if (window.location.pathname === '/dev') {
            setIsDev(true);
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const dateParam = params.get('date');
        if (dateParam) {
            setTargetDate(dateParam);
        }
    }, []);

    const { currentMatch, gameState, submitGuess, calculateFeedback, MAX_GUESSES, units, toggleUnits } = useGameState(targetDate);

    useEffect(() => {
        if (gameState.gameStatus !== 'playing') {
            setIsModalOpen(true);
        }
    }, [gameState.gameStatus]);

    const handleDateSelect = (date: string) => {
        // Update URL without reload if possible, or just reload
        const url = new URL(window.location.href);
        url.searchParams.set('date', date);
        window.history.pushState({}, '', url);
        setTargetDate(date);
        setShowArchive(false);
        setIsModalOpen(false); // Reset modal state when changing date
    };

    const resetAllProgress = () => {
        if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    if (isDev) {
        return <DevPage />;
    }

    if (!currentMatch) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <p>Loading match data...</p>
                <button
                    onClick={() => setShowArchive(true)}
                    className="ml-4 text-blue-400 hover:underline"
                >
                    Go to Archive
                </button>
                {showArchive && (
                    <Archive
                        onSelectDate={handleDateSelect}
                        onClose={() => setShowArchive(false)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-8 px-4 relative">
            <header className="mb-8 text-center relative w-full max-w-2xl">
                <h1 className="text-4xl font-bold text-green-500 mb-2">MatchDay Guesser</h1>
                <p className="text-gray-400">Guess the match from the image</p>
                <div className="text-sm text-gray-500 mt-1">{currentMatch.date}</div>

                <div className="absolute right-0 top-0 flex gap-2">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Settings"
                    >
                        <Settings size={24} />
                    </button>
                    <button
                        onClick={() => setShowArchive(true)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Archive"
                    >
                        <Calendar size={24} />
                    </button>
                </div>
            </header>

            {showArchive && (
                <Archive
                    onSelectDate={handleDateSelect}
                    onClose={() => setShowArchive(false)}
                />
            )}

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                units={units}
                toggleUnits={toggleUnits}
            />

            <MatchImage imageId={currentMatch.imageId} />

            <GuessGrid
                guesses={gameState.guesses}
                calculateFeedback={(g) => calculateFeedback(g, currentMatch)}
                units={units}
            />

            {gameState.gameStatus === 'playing' && gameState.guesses.length < MAX_GUESSES && (
                <GuessForm onSubmit={submitGuess} disabled={gameState.gameStatus !== 'playing'} />
            )}

            {isModalOpen && (gameState.gameStatus !== 'playing') && (
                <GameOverModal
                    status={gameState.gameStatus}
                    match={currentMatch}
                    guesses={gameState.guesses}
                    onClose={() => setIsModalOpen(false)}
                    calculateFeedback={calculateFeedback}
                />
            )}

            <button
                onClick={resetAllProgress}
                className="fixed bottom-4 right-4 bg-red-900/50 hover:bg-red-900 text-red-200 p-3 rounded-full transition-colors shadow-lg border border-red-800"
                title="Reset All Progress"
            >
                <Trash2 size={20} />
            </button>
        </div>
    );
}

export default App;
