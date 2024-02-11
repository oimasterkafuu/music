const ncmaUrl = 'https://ncma.oimaster.top';

(async () => {
    localStorage.setItem('cookie', localStorage.getItem('cookie') || '');

    if (!localStorage.getItem('real-ip')) {
        try {
            const response = await fetch('https://ip.oimaster.top');
            const data = await response.json();
            localStorage.setItem('real-ip', data.ip);
        } catch (error) {
            console.error('Error fetching IP:', error);
        }
    }
})();

const api = async (url, params = {}, cache = true) => {
    if (!cache) params.timestamp = Date.now();
    params.realIP = localStorage.getItem('real-ip');
    if (localStorage.getItem('cookie')) params.cookie = localStorage.getItem('cookie');

    const queryInUrlFormat = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    try {
        var data = {};
        if (cache && sessionStorage.getItem(`${url}?${queryInUrlFormat}`)) {
            console.log(`Cache hit for ${url}?${queryInUrlFormat.substring(0, 20)}`);
            data = JSON.parse(sessionStorage.getItem(`${url}?${queryInUrlFormat}`));
        } else {
            console.log(`Fetching for ${url}?${queryInUrlFormat.substring(0, 20)}`);
            const response = await fetch(`${ncmaUrl}${url}?${queryInUrlFormat}`);
            data = await response.json();
        }
        if (data.cookie) localStorage.setItem('cookie', data.cookie);
        if (cache) sessionStorage.setItem(`${url}?${queryInUrlFormat}`, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error(`Error fetching ${ncmaUrl}${url}?${queryInUrlFormat}:`, error);
        return {};
    }
};

export default api;
