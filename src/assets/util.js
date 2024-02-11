import api from './ncma-api';

const isLoggedIn = async () => {
    const loginStatus = await api('/login/status');
    try {
        if (loginStatus.data.profile) return true;
    } catch (error) {
        console.error('Error fetching login status:', error);
    }
    return false;
};

const getCurrUser = async () => {
    const currUser = await api('/login/status');
    if (!currUser.data.profile) return {};
    return currUser.data.profile;
};

const getMyPlaylists = async () => {
    const currUser = await getCurrUser();
    const playlists = await api('/user/playlist', {
        uid: currUser.userId,
        limit: 1000
    });
    return playlists.playlist;
};

const getMyFavoritePlaylistId = async () => {
    const allPlaylists = await getMyPlaylists();
    const favoritePlaylist = allPlaylists.find((playlist) => playlist.specialType === 5);
    return favoritePlaylist.id;
};

const getPlaylistDetail = async (pid) => {
    const playlistDetail = await api('/playlist/detail', { id: pid });
    return playlistDetail.playlist;
};

const getTrackDetail = async (id) => {
    const trackDetail = await api('/song/detail', { ids: id });
    return trackDetail.songs[0];
};

const getTrackUrl = async (id) => {
    const trackUrl = await api('/song/url', { id });
    return trackUrl.data[0].url;
};

const getTrackLyric = async (id) => {
    try {
        var trackLyric = (await api('/lyric/new', { id })).lrc.lyric;
        if (trackLyric.includes('纯音乐') && trackLyric.length < 100) {
            console.log('Empty lyric');
            return '';
        }

        // remove all lines that is not [...]....

        trackLyric = trackLyric
            .split('\n')
            .filter((line) => line.startsWith('[') && line.includes(']'))
            .join('\n');

        if (trackLyric.length === 0) {
            console.log('Empty lyric');
            return '';
        }

        console.log('Track lyric:\n' + trackLyric);

        return trackLyric;
    } catch (error) {
        console.error('Error fetching track lyric:', error);
        return '';
    }
};

const parseLyricTime = (timeString) => {
    var [minutes, seconds] = timeString.split(':');
    var [secondsPart, millisecondsPart] = seconds.split('.');

    if (millisecondsPart.length === 1) {
        millisecondsPart += '00';
    } else if (millisecondsPart.length === 2) {
        millisecondsPart += '0';
    }

    const totalMilliseconds = parseInt(minutes) * 60 * 1000 + parseInt(secondsPart) * 1000 + parseInt(millisecondsPart);

    return totalMilliseconds;
};

const lyricParser = (lyric) => {
    if (lyric == '') return [];

    var result = [];

    lyric = lyric.split('\n');

    for (var i = 0; i < lyric.length; i++) {
        const line = lyric[i];
        if (!line.startsWith('[') || !line.includes(']')) continue;

        try {
            // const timeString = line.split(']')[0].slice(1).trim(); -> wont work if lyricText includes ']'
            // const lyricText = line.split(']')[1].trim();

            // get the first ]'s position
            const index = line.indexOf(']');
            const timeString = line.slice(1, index).trim();
            const lyricText = line.slice(index + 1).trim();

            if (lyricText.startsWith('作词') || lyricText.startsWith('作曲') || lyricText.startsWith('编曲')) continue;

            result.push({ time: parseLyricTime(timeString), lyric: lyricText });
        } catch (e) {
            console.error('Error parsing lyric:', line, e);
        }
    }

    // check: if one line's lyric is empty,
    // and the next line's lyric is still empty,
    // only keep one of them
    for (var i = 0; i < result.length - 1; i++) {
        if (result[i].lyric === '' && result[i + 1].lyric === '') {
            result.splice(i, 1);
        }
    }

    // check-2: if one line's lyric is empty
    // and the next line's lyric is not empty,
    // and the next line's time - this line's time < 3000,
    // remove the empty line
    for (var i = 0; i < result.length - 1; i++) {
        if (result[i].lyric === '' && result[i + 1].lyric !== '' && result[i + 1].time - result[i].time < 3000) {
            result.splice(i, 1);
        }
    }

    return result;
};

export {
    isLoggedIn,
    getCurrUser,
    getMyPlaylists,
    getMyFavoritePlaylistId,
    getPlaylistDetail,
    getTrackDetail,
    getTrackUrl,
    getTrackLyric,
    lyricParser
};
