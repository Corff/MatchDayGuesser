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
    homeDistance?: number;
    awayDistance?: number;
}

export type Unit = 'km' | 'miles';

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
    const [units, setUnits] = useState<Unit>('km');

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

        // Load units preference
        const savedUnits = localStorage.getItem('matchday_guesser_units');
        if (savedUnits) {
            setUnits(savedUnits as Unit);
        }
    }, [dateToUse]);

    useEffect(() => {
        if (gameState.lastPlayedDate === dateToUse) {
            const storageKey = `matchday_guesser_state_${dateToUse}`;
            localStorage.setItem(storageKey, JSON.stringify(gameState));
        }
    }, [gameState, dateToUse]);

    useEffect(() => {
        localStorage.setItem('matchday_guesser_units', units);
    }, [units]);

    const toggleUnits = () => {
        setUnits(prev => prev === 'km' ? 'miles' : 'km');
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const calculateFeedback = (guess: Guess, match: typeof matches[0]): Feedback => {
        const yearDiff = guess.year - match.year;
        let yearFeedback: Feedback['year'];

        if (yearDiff === 0) yearFeedback = 'correct';
        else if (yearDiff > 0 && yearDiff <= 2) yearFeedback = 'close-lower'; // Guess is higher, but close. Correct is lower.
        else if (yearDiff < 0 && yearDiff >= -2) yearFeedback = 'close-higher'; // Guess is lower, but close. Correct is higher.
        else if (yearDiff > 0) yearFeedback = 'lower';
        else yearFeedback = 'higher';

        const homeTeam = teams.find(t => t.id === match.homeTeamId);
        const guessedHomeTeam = teams.find(t => t.id === guess.homeTeamId);
        let homeDistance = 0;
        if (homeTeam && guessedHomeTeam && homeTeam.id !== guessedHomeTeam.id) {
            homeDistance = calculateDistance(homeTeam.lat, homeTeam.lon, guessedHomeTeam.lat, guessedHomeTeam.lon);
        }

        const awayTeam = teams.find(t => t.id === match.awayTeamId);
        const guessedAwayTeam = teams.find(t => t.id === guess.awayTeamId);
        let awayDistance = 0;
        if (awayTeam && guessedAwayTeam && awayTeam.id !== guessedAwayTeam.id) {
            awayDistance = calculateDistance(awayTeam.lat, awayTeam.lon, guessedAwayTeam.lat, guessedAwayTeam.lon);
        }

        return {
            homeTeam: guess.homeTeamId === match.homeTeamId ? 'correct' : 'incorrect',
            awayTeam: guess.awayTeamId === match.awayTeamId ? 'correct' : 'incorrect',
            result: guess.result === match.result ? 'correct' : 'incorrect',
            year: yearFeedback,
            homeDistance,
            awayDistance
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
        dateToUse,
        units,
        toggleUnits
    };
};
