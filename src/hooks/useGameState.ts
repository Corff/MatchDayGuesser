import { useState, useEffect } from 'react';
import matches from '../data/matches.json';
import teams from '../data/teams.json';

export interface Guess {
    homeTeamId: number;
    awayTeamId: number;
    result: number;
    year: number;
}

export interface Feedback {
    homeTeam: 'correct' | 'incorrect';
    awayTeam: 'correct' | 'incorrect';
    result: 'correct' | 'incorrect';
    year: 'correct' | 'higher' | 'lower' | 'close-higher' | 'close-lower';
}

export interface GameState {
    guesses: Guess[];
    gameStatus: 'playing' | 'won' | 'lost';
    lastPlayedDate: string;
}

const MAX_GUESSES = 6;

export const useGameState = (targetDate?: string) => {
    const [currentMatch, setCurrentMatch] = useState<typeof matches[0] | null>(null);
    const [gameState, setGameState] = useState<GameState>({
        guesses: [],
        gameStatus: 'playing',
        lastPlayedDate: '',
    });

    // Determine the date to use. If targetDate is provided, use it. Otherwise, use today.
    const dateToUse = targetDate || new Date().toISOString().split('T')[0];

    useEffect(() => {
        // Find match for the specific date
        const match = matches.find(m => m.date === dateToUse);
        setCurrentMatch(match || null);

        // Load state from local storage for this specific date
        const storageKey = `matchday_guesser_state_${dateToUse}`;
        const savedState = localStorage.getItem(storageKey);

        if (savedState) {
            setGameState(JSON.parse(savedState));
        } else {
            setGameState({
                guesses: [],
                gameStatus: 'playing',
                lastPlayedDate: dateToUse,
            });
        }
    }, [dateToUse]);

    useEffect(() => {
        if (gameState.lastPlayedDate === dateToUse) {
            const storageKey = `matchday_guesser_state_${dateToUse}`;
            localStorage.setItem(storageKey, JSON.stringify(gameState));
        }
    }, [gameState, dateToUse]);

    const calculateFeedback = (guess: Guess, match: typeof matches[0]): Feedback => {
        const yearDiff = guess.year - match.year;
        let yearFeedback: Feedback['year'];

        if (yearDiff === 0) yearFeedback = 'correct';
        else if (yearDiff > 0 && yearDiff <= 2) yearFeedback = 'close-lower'; // Guess is higher, but close. Correct is lower.
        else if (yearDiff < 0 && yearDiff >= -2) yearFeedback = 'close-higher'; // Guess is lower, but close. Correct is higher.
        else if (yearDiff > 0) yearFeedback = 'lower';
        else yearFeedback = 'higher';

        return {
            homeTeam: guess.homeTeamId === match.homeTeamId ? 'correct' : 'incorrect',
            awayTeam: guess.awayTeamId === match.awayTeamId ? 'correct' : 'incorrect',
            result: guess.result === match.result ? 'correct' : 'incorrect',
            year: yearFeedback,
        };
    };

    const submitGuess = (guess: Guess) => {
        if (!currentMatch || gameState.gameStatus !== 'playing') return;

        const newGuesses = [...gameState.guesses, guess];
        const feedback = calculateFeedback(guess, currentMatch);

        const isWin =
            feedback.homeTeam === 'correct' &&
            feedback.awayTeam === 'correct' &&
            feedback.result === 'correct' &&
            feedback.year === 'correct';

        let newStatus: GameState['gameStatus'] = 'playing';
        if (isWin) {
            newStatus = 'won';
        } else if (newGuesses.length >= MAX_GUESSES) {
            newStatus = 'lost';
        }

        setGameState(prev => ({
            ...prev,
            guesses: newGuesses,
            gameStatus: newStatus,
        }));
    };

    const resetDailyProgress = () => {
        const storageKey = `matchday_guesser_state_${dateToUse}`;
        localStorage.removeItem(storageKey);
        window.location.reload();
    };

    return {
        currentMatch,
        gameState,
        submitGuess,
        calculateFeedback,
        resetDailyProgress,
        teams,
        MAX_GUESSES,
        dateToUse
    };
};
