<template>
    <!-- create a full screen div that contains background and have a z-index -->
    <div
        class="w-full h-full fixed top-0 left-0 -z-10 transition-opacity duration-700"
        :class="{ 'opacity-0': !backgroundImage, 'opacity-100': backgroundImage }"
    >
        <!-- create a full screen image, the src is trackDetail.al.picUrl -->
        <img class="w-full h-full object-cover" :src="backgroundImage" />
    </div>
    <!-- create a control bar that sticks at the bottom -->
    <div
        class="w-full h-12 fixed left-0 bottom-0 flex justify-around items-center z-10 backdrop-blur-2xl rounded-t-2xl"
        id="control-bar"
    >
        <button
            class="touch-button bg-opacity-20 w-1/4 h-5/6 rounded-2xl flex justify-center items-center"
            @click="back"
        >
            <back class="w-6 h-6"></back>
        </button>
        <button
            class="touch-button bg-opacity-20 w-1/4 h-5/6 rounded-2xl flex justify-center items-center disabled:bg-gray-50"
            @click="togglePlaying"
            :disabled="!audio"
        >
            <play class="w-6 h-6" v-show="!playing"></play>
            <pause class="w-6 h-6" v-show="playing"></pause>
        </button>
        <!-- <button
            class="touch-button bg-opacity-50 w-1/4 h-5/6 rounded-2xl flex justify-center items-center"
        >
            <repeat class="w-6 h-6"></repeat>
        </button> -->
    </div>

    <div
        class="w-full h-full backdrop-blur-3xl bg-white bg-opacity-60 overflow-x-hidden overflow-y-auto pt-5 pb-16 transition-opacity duration-700"
        :class="{ 'opacity-0': !trackLyrics.length, 'opacity-100': trackLyrics.length }"
        id="lyric-container"
    >
        <div
            class="w-5/6 min-h-16 ml-auto mr-auto mt-3 mb-3 pt-6 pb-6 text-4xl font-serif font-semibold flex items-center transition-all duration-200"
            :id="`lyric--1`"
        ></div>
        <div
            v-for="({ lyric }, index) in trackLyrics"
            class="w-5/6 min-h-16 ml-auto mr-auto mt-3 mb-3 pt-6 pb-6 text-4xl font-serif font-semibold flex items-center transition-all duration-200"
            :class="computeLyricClass(index)"
            :id="`lyric-${index}`"
            @click="jumpTo(index)"
        >
            {{ lyric }}
        </div>
    </div>
</template>

<script>
import { isLoggedIn, getTrackDetail, getTrackUrl, getTrackLyric, lyricParser } from '../assets/util';

export default {
    name: 'track-player',
    data() {
        return {
            id: this.$route.params.id,
            trackDetail: null,
            trackUrl: '',
            trackLyrics: [],
            backgroundImage: null,
            audio: null,
            playing: false,
            nowLyricIndex: -1
        };
    },
    methods: {
        back() {
            this.$router.go(-1);
        },
        togglePlaying() {
            if (this.playing) {
                this.audio.pause();
                this.playing = false;
            } else {
                this.audio.play();
                this.playing = true;
                this.getLyricCenter();
            }
        },
        async loadTrackDetails() {
            this.trackDetail = await getTrackDetail(this.id);
            await this.LoadBackgroundImage();

            this.trackUrl = await getTrackUrl(this.id);
            this.trackLyrics = lyricParser(await getTrackLyric(this.id));
        },
        async LoadBackgroundImage() {
            // load image from trackDetail.al.picUrl, and save to backgroundImage

            const response = await fetch(this.trackDetail.al.picUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = () => {
                this.backgroundImage = reader.result;
            };
            reader.readAsDataURL(blob);
        },
        jumpTo(index) {
            const time = this.trackLyrics[index].time;
            console.log('Jump to', time);
            this.audio.currentTime = time / 1000;
            if (!this.playing) this.togglePlaying();
            this.getLyricCenter();
        },
        calcWhichToBeCentered() {
            const now = this.audio.currentTime * 1000 + 200;
            for (let i = 0; i < this.trackLyrics.length; i++) {
                if (this.trackLyrics[i].time > now) {
                    return i - 1;
                }
            }
            return this.trackLyrics.length - 1;
        },
        getLyricCenter() {
            if (!this.playing) return;
            // calculate: if nowLyricIndex should still be the same
            const oldLyricIndex = this.nowLyricIndex;
            this.nowLyricIndex = this.calcWhichToBeCentered();
            // console.log('nowLyricIndex', this.nowLyricIndex);
            if (oldLyricIndex !== this.nowLyricIndex) this.autoScroll();
            requestAnimationFrame(this.getLyricCenter);
        },
        autoScroll() {
            const screenCenter = window.innerHeight / 2;
            const nowCenteredLyricRect = document.getElementById(`lyric-${this.nowLyricIndex}`).getBoundingClientRect();
            const nowCenteredLyricTop = nowCenteredLyricRect.top;
            const nowCenteredLyricHeight = nowCenteredLyricRect.height;
            const nowCenteredLyricCenter = nowCenteredLyricTop + nowCenteredLyricHeight / 2;

            const scrollDistance = nowCenteredLyricCenter - screenCenter;

            console.log('Scroll lyric by', scrollDistance);
            document.getElementById('lyric-container').scrollBy({
                top: scrollDistance,
                behavior: 'smooth'
            });
        },
        setPlaying() {
            this.playing = true;
            this.getLyricCenter();
        },
        setPaused() {
            this.playing = false;
        },
        resetAudio() {
            console.log('Reset audio');

            this.audio.pause();
            this.audio.currentTime = 0;
            this.playing = false;

            this.nowLyricIndex = -1;
        },
        computeLyricClass(index) {
            const opacity = index < this.nowLyricIndex ? 30 : Math.max(10 - (index - this.nowLyricIndex) * 2, 3) * 10;
            const blur = index < this.nowLyricIndex ? 4 : Math.min(index - this.nowLyricIndex, 4);

            return `opacity-${opacity} myblur-${blur}`;
        },
        interrupt() {
            console.log('Interrupt');
            if (this.playing) this.togglePlaying();
        }
    },
    async mounted() {
        if (!(await isLoggedIn())) {
            this.$router.push({ name: 'login' });
            return;
        }
        await this.loadTrackDetails();

        console.log(this.trackDetail, this.trackUrl, this.trackLyrics);

        this.audio = new Audio(this.trackUrl);
        this.getLyricCenter();

        // add a listener to the audio. If it is played/paused by system, update the UI
        this.audio.addEventListener('play', this.setPlaying);
        this.audio.addEventListener('pause', this.setPaused);

        // when the audio finished playing, pause it.
        this.audio.addEventListener('ended', this.resetAudio);

        // when the lyric-container is manually scrolled, pause the audio
        addEventListener('touchmove', this.interrupt);
    },
    beforeUnmount() {
        if (this.playing) this.togglePlaying();

        if (this.audio) {
            try {
                // remove listeners
                this.audio.removeEventListener('play', this.setPlaying);
                this.audio.removeEventListener('pause', this.setPaused);
                this.audio.removeEventListener('ended', this.resetAudio);
                removeEventListener('touchmove', this.interrupt);
            } catch (error) {
                console.error('Error removing listeners:', error);
            }

            this.audio = null;
        }
    }
};
</script>
