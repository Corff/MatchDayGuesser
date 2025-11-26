import React from 'react';

interface MatchImageProps {
    imageId: string;
}

export const MatchImage: React.FC<MatchImageProps> = ({ imageId }) => {
    // Placeholder logic. In a real app, this would map imageId to a URL.
    // For now, we'll just show a placeholder div or a generic football image.
    return (
        <div className="w-full max-w-2xl mx-auto mb-6">
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-700 overflow-hidden shadow-lg relative">
                <img
                    src={`/images/${imageId}.jpg`}
                    alt="Match"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback if image not found
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('bg-gray-800');
                        const span = document.createElement('span');
                        span.className = 'text-gray-500 p-4 text-center';
                        span.innerText = `Image not found: /images/${imageId}.jpg. Please add the image file.`;
                        e.currentTarget.parentElement?.appendChild(span);
                    }}
                />
            </div>
        </div>
    );
};
