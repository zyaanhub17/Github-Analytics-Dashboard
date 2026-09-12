const GitHubAPI = {
    baseURL: 'http://localhost:5000/api/github',
    cacheDuration: 1000 * 60 * 15, // 15 minutes cache

    async getProfile(username) {
        const cacheKey = `gh_user_${username}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${this.baseURL}/${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            throw new Error("Unable to fetch profile from backend proxy.");
        }

        const data = await response.json();
        this.setCachedData(cacheKey, data);
        return data;
    },

    getCachedData(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        const item = JSON.parse(itemStr);
        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    },

    setCachedData(key, value) {
        const item = {
            value: value,
            expiry: Date.now() + this.cacheDuration
        };
        localStorage.setItem(key, JSON.stringify(item));
    }
};

export { GitHubAPI };