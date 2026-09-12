import { GitHubAPI } from './github-api.js';
import { UI } from './ui.js';

const demoData = {
    user: {
        login: "octocat",
        name: "The Octocat",
        location: "GitHub",
        avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        public_repos: 8,
        followers: 620
    },
    repositories: [
        {
            name: "Hello-World",
            description: "My first repository on GitHub.",
            language: "JavaScript",
            stargazers_count: 18,
            forks_count: 7
        },
        {
            name: "Spoon-Knife",
            description: "A classic GitHub demonstration repository.",
            language: "HTML",
            stargazers_count: 12,
            forks_count: 4
        },
        {
            name: "developer-notes",
            description: "Notes, experiments and small utilities.",
            language: "Python",
            stargazers_count: 8,
            forks_count: 2
        },
        {
            name: "api-playground",
            description: "Small REST API experiments.",
            language: "JavaScript",
            stargazers_count: 6,
            forks_count: 1
        },
        {
            name: "algorithms",
            description: "Data structures and algorithm practice.",
            language: "Java",
            stargazers_count: 4,
            forks_count: 1
        }
    ]
};

async function analyzeUsername(username) {
    UI.setLoading(true);
    UI.showNotice("Fetching live GitHub data..."); 
    
    
    const dashboard = document.getElementById("dashboard");
    if (dashboard) {
        dashboard.innerHTML = UI.renderSkeleton();
    }

    try {
        const data = await GitHubAPI.getProfile(username);
        UI.renderDashboard(data.user, data.repositories, data.rateLimit, data.aiInsight);
        UI.showNotice(`Live data loaded for @${data.user.login}.`);
    } catch (error) {
        UI.renderDashboard(demoData.user, demoData.repositories, { remaining: '--', limit: '--' }, null);
        UI.showNotice(
            "Live API unavailable — showing built-in demo data.",
            "error"
        );
    } finally {
        UI.setLoading(false);
    }
}

document.getElementById("searchForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("usernameInput").value.trim();
    const compareUsername = document.getElementById("compareUsernameInput")?.value.trim();

    if (!username) {
        UI.showNotice("Please enter a GitHub username.", "error");
        return;
    }

    UI.setLoading(true);
    UI.showNotice("Fetching live GitHub data...");

    try {
        if (compareUsername) {
            const [data1, data2] = await Promise.all([
                GitHubAPI.getProfile(username),
                GitHubAPI.getProfile(compareUsername)
            ]);
            UI.renderDashboard(data1.user, data1.repositories, data1.rateLimit, data1.aiInsight);
            
            const dashboard = document.getElementById("dashboard");
            if (dashboard) {
                dashboard.innerHTML += UI.renderComparison(data1.user, data1.repositories, data2.user, data2.repositories);
            }
            UI.showNotice(`Comparison loaded for @${data1.user.login} vs @${data2.user.login}.`);
        } else {
            const data = await GitHubAPI.getProfile(username);
            UI.renderDashboard(data.user, data.repositories, data.rateLimit, data.aiInsight);
            UI.showNotice(`Live data loaded for @${data.user.login}.`);
        }
    } catch (error) {
        UI.renderDashboard(demoData.user, demoData.repositories, { remaining: '--', limit: '--' }, null);
        UI.showNotice("Live API unavailable — showing built-in demo data.", "error");
    } finally {
        UI.setLoading(false);
    }
});

UI.renderDashboard(demoData.user, demoData.repositories, { remaining: '60', limit: '60' });