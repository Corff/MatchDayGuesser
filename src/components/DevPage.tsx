import React, { useState } from 'react';
import teams from '../data/teams.json';

export const DevPage: React.FC = () => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        homeTeamId: teams[0].id,
        awayTeamId: teams[1].id,
        result: 1, // 1: Home, 2: Away, 0: Draw
        year: 2024,
        score: '',
    });
    const [image, setImage] = useState<File | null>(null);
    const [status, setStatus] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Saving...');

        if (!image) {
            setStatus('Error: Please select an image.');
            return;
        }

        // Convert image to JPG base64
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = async () => {
            const img = new Image();
            img.src = reader.result as string;

            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    setStatus('Error: Could not get canvas context.');
                    return;
                }

                // Draw image on white background (handle transparent PNGs)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                // Convert to JPG
                const base64Image = canvas.toDataURL('image/jpeg', 0.9);

                // Ensure filename ends in .jpg
                const imageName = image.name.replace(/\.[^/.]+$/, "") + ".jpg";

                const payload = {
                    ...formData,
                    image: base64Image,
                    imageName: imageName
                };

                try {
                    const response = await fetch('/api/save-match', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                        setStatus('Match saved successfully!');
                        // Reset form or at least the image
                        setImage(null);
                    } else {
                        setStatus('Failed to save match.');
                    }
                } catch (error) {
                    console.error(error);
                    setStatus('Error saving match.');
                }
            };
        };
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-green-500">Dev Admin: Add Match</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-1">Home Team</label>
                            <select
                                name="homeTeamId"
                                value={formData.homeTeamId}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-2 rounded"
                            >
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1">Away Team</label>
                            <select
                                name="awayTeamId"
                                value={formData.awayTeamId}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-2 rounded"
                            >
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-1">Result</label>
                            <select
                                name="result"
                                value={formData.result}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-2 rounded"
                            >
                                <option value="1">Home Win</option>
                                <option value="2">Away Win</option>
                                <option value="0">Draw</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1">Score (e.g. 2-1)</label>
                            <input
                                type="text"
                                name="score"
                                value={formData.score}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-2 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1">Year</label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-2 rounded"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Match Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full bg-gray-700 text-white p-2 rounded"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-colors"
                    >
                        Save Match
                    </button>

                    {status && (
                        <p className={`text-center font-bold ${status.includes('Error') || status.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                            {status}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};
