const UI = {
    showNotice(message, type = "") {
        const notice = document.getElementById("notice");
        if (notice) {
            notice.className = `notice ${type}`.trim();
            notice.textContent = message;
        }
    },

    setLoading(isLoading) {
        const button = document.getElementById("analyzeBtn");
        if (button) {
            button.disabled = isLoading;
            button.textContent = isLoading ? "Loading..." : "Analyze";
        }
    },

    renderProfile(user) {
        return `
            <div class="profile">
                <img class="avatar" src="${user.avatar_url}" alt="${user.login} avatar">
                <div>
                    <h2>${this.escape(user.name || user.login)}</h2>
                    <div class="muted">
                        | &commat;${this.escape(user.login)} &bull; ${this.escape(user.location || "Location not set")}
                    </div>
                </div>
            </div>
        `;
    },

    renderStats(user, repositories, rateLimit = { remaining: '--', limit: '--' }) {
        const stars = repositories.reduce(
            (total, repo) => total + repo.stargazers_count,
            0
        );
        const forks = repositories.reduce(
            (total, repo) => total + repo.forks_count,
            0
        );
        const totalSizeKB = repositories.reduce((total, repo) => total + (repo.size || 0), 0);
        const totalSizeMB = (totalSizeKB / 1024).toFixed(2);

        return `
            <div class="stats-header-bar">
                <span>🟢 API Rate Limit Remaining: <strong>${rateLimit.remaining}/${rateLimit.limit}</strong></span>
                <button id="exportReportBtn">📥 Export Analytics Report</button>
            </div>
            <div class="stats-grid">
                <div class="card stat">
                    <div class="label">Public repositories</div>
                    <div class="number">${user.public_repos}</div>
                    <div class="delta">&bull; Public</div>
                </div>

                <div class="card stat">
                    <div class="label">Followers</div>
                    <div class="number">${user.followers}</div>
                    <div class="delta">&bull; Community reach</div>
                </div>

                <div class="card stat">
                    <div class="label">Stars shown</div>
                    <div class="number">${stars}</div>
                    <div class="delta">&bull; Repository signal</div>
                </div>

                <div class="card stat">
                    <div class="label">Codebase Footprint</div>
                    <div class="number">${totalSizeMB} MB</div>
                    <div class="delta">&bull; Data Analyst Metric</div>
                </div>
            </div>
        `;
    },

    renderAIInsight(repositories, user, aiInsight) {
        const topLang = this.getTopLanguage(repositories);
        const displayInsight = aiInsight || `"${user.login} demonstrates clean architectural practices with active repositories across multiple tech stacks."`;

        return `
            <div class="ai-insight-card">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="background: #6366f1; font-size: 10px; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; font-weight: bold;">AI Insight Engine</span>
                    <span style="font-size: 12px; opacity: 0.8;">Powered by Google Gemini</span>
                </div>
                <h3 style="margin: 0 0 6px 0; font-size: 1.1rem;">🤖 Developer Persona: Senior ${topLang} Specialist & Analyst</h3>
                <p style="margin: 0; font-size: 0.9rem; opacity: 0.9; font-style: italic;">
                    ${displayInsight}
                </p>
            </div>
        `;
    },

    getTopLanguage(repositories) {
        const languages = {};
        repositories.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
        const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : 'General';
    },

    renderLanguages(repositories) {
        const langCounts = {};
        let totalReposWithLang = 0;
        
        repositories.forEach(repo => {
            if (repo.language) {
                langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
                totalReposWithLang++;
            }
        });

        const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);

        let html = '<div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px; padding: 0 10px;">';
        sortedLangs.slice(0, 6).forEach(([lang, count]) => {
            const percentage = totalReposWithLang > 0 ? ((count / totalReposWithLang) * 100).toFixed(1) : 0;
            html += `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; opacity: 0.9;">
                    <span>🔹 ${lang}</span>
                    <span style="font-weight: bold; color: #818cf8;">${percentage}%</span>
                </div>
            `;
        });
        html += '</div>';

        html += `
            <div style="width: 100%; max-width: 240px; margin: 0 auto;">
                <canvas id="languageChart"></canvas>
            </div>
        `;
        return html;
    },

    renderLanguageChart(repositories) {
        const langCounts = {};
        repositories.forEach(repo => {
            if (repo.language) {
                langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
            }
        });

        const labels = Object.keys(langCounts);
        const data = Object.values(langCounts);

        setTimeout(() => {
            const ctx = document.getElementById('languageChart');
            if (!ctx) return;

            if (window.myChart instanceof Chart) {
                window.myChart.destroy();
            }

            window.myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: ['#6366f1', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#fff' }
                        }
                    }
                }
            });
        }, 100);
    },

    renderRepositories(repositories) {
        if (!repositories.length) {
            return `<div class="empty">No public repositories found.</div>`;
        }

        return repositories.slice(0, 6).map(repo => `
            <div class="repo">
                <div>
                    <div class="repo-name">${this.escape(repo.name)}</div>
                    <p class="repo-description">
                        ${this.escape(repo.description || "No description provided.")}
                    </p>
                </div>
                <div class="repo-meta">
                    &star; ${repo.stargazers_count} &nbsp;&bull;&nbsp; &fork; ${repo.forks_count}
                </div>
            </div>
        `).join("");
    },

    renderComparison(user1, repos1, user2, repos2) {
        const stars1 = repos1.reduce((acc, r) => acc + r.stargazers_count, 0);
        const stars2 = repos2.reduce((acc, r) => acc + r.stargazers_count, 0);

        const renderUserColumn = (user, repos, stars) => `
           <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 24px; border-radius: 12px; display: flex; flex-direction: column; gap: 20px; min-width: 0; box-sizing: border-box;">
                <!-- Profile Header -->
                <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                    <div style="display: flex; gap: 15px;">
                        <img src="${user.avatar_url}" width="64" style="border-radius: 50%; border: 2px solid #6366f1;" crossorigin="anonymous">
                        <div>
                            <h3 style="margin: 0; font-size: 1.15rem; color: #fff;">${user.name || user.login}</h3>
                            <p style="margin: 2px 0; opacity: 0.7; font-size: 0.85rem;">&commat;${user.login}</p>
                            <p style="margin: 4px 0 0 0; opacity: 0.6; font-size: 0.8rem;">📍 ${user.location || 'Global'} &nbsp;•&nbsp; 📅 Joined ${user.created_at ? new Date(user.created_at).getFullYear() : '2023'}</p>
                        </div>
                    </div>
                    <a href="${user.html_url}" target="_blank" style="font-size: 0.8rem; background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 6px 12px; border-radius: 6px; text-decoration: none; border: 1px solid rgba(99, 102, 241, 0.3);">View Profile ↗</a>
                </div>

                <p style="margin: 0; font-size: 0.85rem; opacity: 0.85; line-height: 1.4;">${user.bio || 'Passionate developer building awesome open-source tools.'}</p>

                <!-- Key Metrics Grid -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center; background: rgba(0,0,0,0.2); padding: 12px 8px; border-radius: 8px;">
                    <div>
                        <div style="font-size: 1rem; font-weight: bold; color: #6366f1;">${user.public_repos}</div>
                        <div style="font-size: 0.7rem; opacity: 0.6; text-transform: uppercase;">Repos</div>
                    </div>
                    <div>
                        <div style="font-size: 1rem; font-weight: bold; color: #3b82f6;">${user.followers}</div>
                        <div style="font-size: 0.7rem; opacity: 0.6; text-transform: uppercase;">Followers</div>
                    </div>
                    <div>
                        <div style="font-size: 1rem; font-weight: bold; color: #10b981;">${user.following}</div>
                        <div style="font-size: 0.7rem; opacity: 0.6; text-transform: uppercase;">Following</div>
                    </div>
                    <div>
                        <div style="font-size: 1rem; font-weight: bold; color: #f59e0b;">${stars}</div>
                        <div style="font-size: 0.7rem; opacity: 0.6; text-transform: uppercase;">Stars</div>
                    </div>
                </div>

                 <!-- Real Contribution Activity Graph -->
                <div>
                    <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 6px;">📊 Contribution Activity</div>
                    <div style="background: rgba(0,0,0,0.25); padding: 8px; border-radius: 8px; text-align: center; min-height: 100px; display: flex; align-items: center; justify-content: center;">
                      <img src="https://streak-stats.demolab.com/?user=${user.login}&theme=dark&hide_border=true&background=transparent" alt="${user.login} activity" style="max-width: 100%; height: auto;">
                    </div>
                </div>  
            

                <!-- Top Repositories -->
                <div>
                    <h4 style="margin: 0 0 10px 0; font-size: 0.9rem; opacity: 0.9;">⭐ Top Repositories</h4>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${repos.slice(0, 4).map(r => `
                            <div style="background: rgba(0,0,0,0.2); padding: 10px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                                <div>
                                    <div style="font-weight: 500; color: #818cf8;">${r.name}</div>
                                    <div style="font-size: 0.75rem; opacity: 0.6;">${r.language || 'Code'}</div>
                                </div>
                                <div style="text-align: right; font-size: 0.75rem; opacity: 0.8;">
                                    ⭐ ${r.stargazers_count} &nbsp;|&nbsp; 🍴 ${r.forks_count}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        return `
            <div class="card" style="margin-top: 30px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 style="margin: 0; font-size: 1.6rem; color: #fff;">⚖️ Profile Comparison</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.7; font-size: 0.9rem;">Side-by-side analysis of two GitHub profiles to evaluate developer metrics.</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    ${renderUserColumn(user1, repos1, stars1)}
                    ${renderUserColumn(user2, repos2, stars2)}
                </div>
            </div>
        `;
    },

    renderContributionHeatmap(username) {
        const activeUser = (typeof username === 'object' ? username.login : username) || 'zyaanhub17';
        return `
            <div class="card" style="margin-top: 25px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 1.1rem; color: #fff;">Contributions in the past year</h3>
                    <span style="font-size: 0.8rem; opacity: 0.7;">Live GitHub Activity</span>
                </div>
                <div style="overflow-x: auto; padding: 10px; background: rgba(0,0,0,0.25); border-radius: 8px; text-align: center; min-height: 120px; display: flex; align-items: center; justify-content: center;">
                   <img src="https://streak-stats.demolab.com/?user=${activeUser}&theme=dark&hide_border=true&background=transparent" alt="${activeUser}'s GitHub activity" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 0.8rem; opacity: 0.7;">
                    <span>Real-time GitHub activity tracker</span>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span>Less</span>
                        <div style="width: 10px; height: 10px; background: #161b22; border-radius: 2px;"></div>
                        <div style="width: 10px; height: 10px; background: #0e4429; border-radius: 2px;"></div>
                        <div style="width: 10px; height: 10px; background: #006d32; border-radius: 2px;"></div>
                        <div style="width: 10px; height: 10px; background: #26a641; border-radius: 2px;"></div>
                        <div style="width: 10px; height: 10px; background: #39d353; border-radius: 2px;"></div>
                        <span>More</span>
                    </div>
                </div>
            </div>
        `;
    },
   
    renderSkeleton() {
        return `
            <div class="card fade-in" style="padding: 24px; display: flex; flex-direction: column; gap: 20px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div class="skeleton" style="width: 64px; height: 64px; border-radius: 50%;"></div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                        <div class="skeleton" style="width: 35%; height: 22px;"></div>
                        <div class="skeleton" style="width: 55%; height: 14px;"></div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <div class="skeleton" style="height: 45px;"></div>
                    <div class="skeleton" style="height: 45px;"></div>
                    <div class="skeleton" style="height: 45px;"></div>
                    <div class="skeleton" style="height: 45px;"></div>
                </div>
                <div class="skeleton" style="width: 100%; height: 130px;"></div>
            </div>
        `;
    },

    renderDashboard(user, repositories, rateLimit, aiInsight) {
        const dashboard = document.getElementById("dashboard");
        if (dashboard) {
           dashboard.innerHTML = `
            <div id="capture-card" class="card" style="background: var(--card-bg, rgba(15, 23, 42, 0.85)); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 16px; padding: 24px;">
                <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
                    <button onclick="UI.downloadStatsAsImage()" style="background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); color: #818cf8; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; font-weight: 500;">
                        📥 Download Stats Card
                    </button>
                </div>
                ${this.renderAIInsight(repositories, user, aiInsight)}
                ${this.renderProfile(user)}
                ${this.renderStats(user, repositories, rateLimit)}

                <div class="content-grid">
                    <div class="card">
                        <h3>Language mix</h3>
                        ${this.renderLanguages(repositories)}
                    </div>

                    <div class="card">
                        <h3>Recent repositories</h3>
                        ${this.renderRepositories(repositories)}
                    </div>
                </div>
                ${this.renderContributionHeatmap(user.login)}
            </div>
        `;

            this.renderLanguageChart(repositories);

            const exportBtn = document.getElementById("exportReportBtn");
            if (exportBtn) {
                exportBtn.addEventListener("click", () => {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(20);
                    doc.setTextColor(99, 102, 241);
                    doc.text("GitScope Analytics Report", 20, 20);

                    doc.setFontSize(12);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`Target Profile: @${user.login}`, 20, 30);
                    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 38);

                    doc.setLineWidth(0.5);
                    doc.line(20, 45, 190, 45);

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(14);
                    doc.setTextColor(0, 0, 0);
                    doc.text("Executive Summary & AI Persona", 20, 55);

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    const topLang = this.getTopLanguage(repositories);
                    const summaryText = aiInsight || `${user.login} demonstrates clean architectural practices with active repositories across multiple tech stacks.`;
                    
                    const splitText = doc.splitTextToSize(`Developer Persona: Senior ${topLang} Specialist & Analyst\n\nInsight: "${summaryText}"`, 170);
                    doc.text(splitText, 20, 65);

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(14);
                    doc.text("Core Metrics", 20, 95);

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.text(`- Public Repositories: ${user.public_repos}`, 20, 105);
                    doc.text(`- Followers: ${user.followers}`, 20, 113);
                    doc.text(`- Total Stars: ${repositories.reduce((acc, r) => acc + r.stargazers_count, 0)}`, 20, 121);

                    doc.save(`${user.login}-analytics-report.pdf`);
                });
            }
        }
    },
    async downloadStatsAsImage() {
        const cardElement = document.getElementById("capture-card");
        if (!cardElement) return; 
        
        if (typeof this.showNotice === 'function') {
            this.showNotice("Preparing image with heatmap...");
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        try {
            const canvas = await html2canvas(cardElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#0f172a'
            });

            const imageURL = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = imageURL;
            downloadLink.download = "github-developer-stats.png";
            downloadLink.click();

            if (typeof this.showNotice === 'function') {
                this.showNotice("Stats card downloaded successfully!");
            }
        } catch (error) {
            console.error("Image generation failed:", error);
            if (typeof this.showNotice === 'function') {
                this.showNotice("Failed to download image.", "error");
            }
        }
    },
   
    escape(value) {
        const div = document.createElement("div");
        div.textContent = String(value);
        return div.innerHTML;
    }
};
window.UI = UI;

export { UI };