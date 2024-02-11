<template>
    <div @touchend="touchEnd" @scroll="scroll">
        <div v-for="(track, index) in tracks">
            <div
                class="w-11/12 h-14 ml-auto mr-auto mt-3 mb-3 rounded bg-gray-50 flex items-center transition-all"
                @click="select(track)"
                @touchstart="touchStart(index)"
                :style="fingerPuller(index)"
            >
                <v-lazy-image
                    :src="track.al.picUrl"
                    class="w-14 h-14 rounded mr-4 border border-solid border-gray-50"
                    :alt="track.al.name"
                />
                <div class="flex flex-col flex-grow">
                    <div class="w-full table">
                        <div
                            class="table-cell max-w-0 overflow-x-hidden whitespace-nowrap text-ellipsis text-xl font-serif"
                        >
                            {{ track.name }}
                        </div>
                    </div>
                    <div class="text-sm text-gray-400">{{ track.ar.map((artist) => artist.name).join(' / ') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import vLazyImage from 'v-lazy-image';

export default {
    name: 'track-view',
    data() {
        return {
            fingerPullId: -1,
            scrolling: 0,
            scrollDeltaY: 0,
            lastScrollPosition: 0
        };
    },
    components: {
        vLazyImage
    },
    props: {
        tracks: Array
    },
    methods: {
        fingerPuller(index) {
            if (this.fingerPullId === -1) {
                return {
                    transform: 'translateY(0px)',
                    'transition-duration': '300ms'
                };
            }

            const distance = this.fingerPullId - index;
            if (distance > 5) return;

            const miniDistance = distance / 5;
            const scrollSmooth = this.scrollDeltaY > 0 ? 1 : this.scrollDeltaY < 0 ? -1 : 0;

            return {
                'z-index': 10 - Math.abs(distance),
                transform:
                    miniDistance !== 0 ? 'translateY(' + (1 / miniDistance + scrollSmooth) + 'px)' : 'scale(1.05)',
                'transition-duration': Math.max(Math.min(Math.abs(miniDistance), 0.5), 0.2) + 's',
                'box-shadow': '0px 0px ' + Math.max(4 / (Math.abs(distance) + 1), 0) + 'px 0px rgba(0,0,0,0.2)'
            };
        },
        touchStart(index) {
            this.fingerPullId = index;
            this.scrollDeltaY = 0;
        },
        touchEnd() {
            this.fingerPullId = -1;
        },
        select(track) {
            console.log('Choosed', track.name, track.id);
            this.$router.push({ name: 'track', params: { id: track.id } });
        },
        scroll() {
            if (this.scrolling) return;
            this.scrolling = 1;
            requestAnimationFrame(() => {
                this.scrollDeltaY = this.$el.scrollTop - this.lastScrollPosition;
                this.lastScrollPosition = this.$el.scrollTop;
                this.scrolling = 0;
            });
        }
    }
};
</script>
