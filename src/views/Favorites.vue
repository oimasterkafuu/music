<template>
    <h1
        class="text-4xl text-gray-900 fixed top-0 left-0 p-4 pt-5 w-full flex items-center z-10 backdrop-blur-2xl bg-gradient-to-b from-white from-10% to-transparent shadow"
    >
        <span>
            现在就听你
            <span class="text-red-500 font-semibold">喜欢</span>
            的
        </span>
    </h1>
    <div class="w-full h-full fixed flex flex-col">
        <div class="w-5/6 ml-auto mr-auto h-full flex justify-center items-center" v-if="!tracks.length">
            <div class="text-xl text-gray-400 text-center">
                在网易云音乐中添加的
                <span class="font-bold">红心歌曲</span>
                将会在这里显示。
            </div>
        </div>
        <track-view class="pt-20 pb-5 overflow-y-auto" :tracks="tracks" v-if="tracks.length"></track-view>
    </div>
</template>

<script>
import { isLoggedIn, getMyFavoritePlaylistId, getPlaylistDetail } from '../assets/util';

export default {
    name: 'favorites',
    data() {
        return {
            tracks: []
        };
    },
    methods: {},
    async mounted() {
        if (!(await isLoggedIn())) {
            this.$router.push({ name: 'login' });
        }
        this.tracks = (await getPlaylistDetail(await getMyFavoritePlaylistId())).tracks;
        console.log(this.tracks);
    }
};
</script>
