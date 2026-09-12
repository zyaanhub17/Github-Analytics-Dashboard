require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// STEP 3.1: Google Gen AI SDK Initialize karein
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Optional: put your GitHub PAT in a .env file

// Secure Backend Proxy Route for User Profile & Repos
app.get('/api/github/:username', async (req, res) => {
    const { username } = req.params;
    const headers = {
        'Accept': 'application/vnd.github+json',
        ...(GITHUB_TOKEN ? { 'Authorization': `Bearer ${GITHUB_TOKEN}` } : {})
    };

    try {
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, { headers }),
            fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers })
        ]);

        if (!userRes.ok) {
            return res.status(userRes.status).json({ error: 'GitHub user not found or rate limit exceeded' });
        }

        const userData = await userRes.json();
        const reposData = await reposRes.json();

        // STEP 3.2: GitHub data milne ke baad Gemini AI se live insight generate karwayein
        let aiInsight = "";
        try {
            const prompt = `Analyze this GitHub profile for a tech and data analyst recruiter:
            Username: ${userData.login}
            Name: ${userData.name || 'N/A'}
            Public Repos: ${userData.public_repos}
            Top Languages: ${JSON.stringify(reposData.map(r => r.language).filter(Boolean))}
            
            Write a short, professional "Developer Persona" and recruiter spotlight description in 2 sentences.`;

            const aiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            aiInsight = aiResponse.text;
        } catch (aiError) {
            aiInsight = `"${userData.login} demonstrates clean architectural practices with active repositories across multiple tech stacks."`;
        }

        const rateLimitRemaining = userRes.headers.get('x-ratelimit-remaining');
        const rateLimitLimit = userRes.headers.get('x-ratelimit-limit');

        // STEP 3.3: AI insight ko response me sath bhej rahe hain
        return res.json({
            user: userData,
            repositories: reposData,
            rateLimit: { remaining: rateLimitRemaining, limit: rateLimitLimit },
            aiInsight: aiInsight
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ error: 'Server error fetching GitHub data' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});