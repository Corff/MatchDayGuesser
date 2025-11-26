import React from 'react';
import { Unit } from '../hooks/useGameState';
import { X } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    units: Unit;
    toggleUnits: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, units, toggleUnits }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

                <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Distance Units</span>
                    <button
                        onClick={toggleUnits}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors min-w-[80px]"
                    >
                        {units === 'km' ? 'KM' : 'Miles'}
                    </button>
                </div>
            </div>
        </div>
    );
};
