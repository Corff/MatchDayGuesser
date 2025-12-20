import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

// Custom plugin to handle saving matches in dev mode
const matchDayDevServer = () => ({
    name: 'matchday-dev-server',
    configureServer(server) {
        server.middlewares.use('/api/save-match', async (req, res, next) => {
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        const { date, homeTeamId, awayTeamId, result, year, score, image, imageName } = data;

                        // 1. Save Image
                        if (image && imageName) {
                            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
                            const buffer = Buffer.from(base64Data, 'base64');
                            const imagePath = path.resolve(__dirname, 'public/images', imageName);
                            fs.writeFileSync(imagePath, buffer);
                        }

                        // 2. Update matches.json
                        const matchesPath = path.resolve(__dirname, 'src/data/matches.json');
                        const matches = JSON.parse(fs.readFileSync(matchesPath, 'utf-8'));

                        // Check if match for date already exists
                        const existingIndex = matches.findIndex((m: any) => m.date === date);
                        const newMatch = {
                            date,
                            homeTeamId: parseInt(homeTeamId),
                            awayTeamId: parseInt(awayTeamId),
                            result: parseInt(result),
                            year: parseInt(year),
                            imageId: imageName.replace(/\.[^/.]+$/, ""), // Remove extension
                            score
                        };

                        if (existingIndex >= 0) {
                            matches[existingIndex] = newMatch;
                        } else {
                            matches.push(newMatch);
                            // Sort by date
                            matches.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        }

                        fs.writeFileSync(matchesPath, JSON.stringify(matches, null, 4));

                        res.statusCode = 200;
                        res.end(JSON.stringify({ success: true }));
                    } catch (error) {
                        console.error('Error saving match:', error);
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: 'Failed to save match' }));
                    }
                });
            } else {
                next();
            }
        });
    },
});

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), matchDayDevServer()],
})
