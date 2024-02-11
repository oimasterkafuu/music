<template>
    <!-- use tailwind -->
    <!-- create a form in the center of the screen -->
    <div class="w-full h-full flex flex-col justify-center items-center">
        <!-- create two large inputs, one for phone and one for password -->
        <h1 class="text-4xl text-center text-gray-900 mb-10">
            使用
            <span class="text-gray-800 font-bold">手机号</span>
            登录
        </h1>

        <div class="flex flex-col w-10/12">
            <input
                type="tel"
                class="text-2xl mt-2 p-5 rounded-3xl border-2 border-gray-400"
                :class="{
                    'border-b rounded-b-none': finishedPhoneInput,
                    'border-red-600': wrongPhone
                }"
                :disabled="finishedPhoneInput"
                placeholder="手机号"
                @blur="finishPhone()"
                v-model="phone"
            />
            <input
                type="number"
                class="text-2xl mb-2 p-5 rounded-b-3xl border-2 border-t border-gray-400 transition-opacity duration-500"
                :class="{
                    'opacity-0': !finishedPhoneInput,
                    'opacity-100': finishedPhoneInput,
                    'border-red-600': wrongCaptcha
                }"
                placeholder="短信验证码"
                v-model="captcha"
                @blur="login()"
            />
        </div>
    </div>
</template>

<script>
import api from '../assets/ncma-api';
import { isLoggedIn } from '../assets/util';
export default {
    name: 'login',
    data() {
        return {
            finishedPhoneInput: false,
            wrongPhone: false,
            wrongCaptcha: false,
            phone: '',
            captcha: ''
        };
    },
    async mounted() {
        if (await isLoggedIn()) {
            this.$router.push({ name: 'favorites' });
            return;
        }
    },
    methods: {
        async finishPhone() {
            if (this.phone.length !== 11) return;

            // the phone lost focus
            document.querySelector('input[type="tel"]').blur();
            const phoneChinaRegex =
                /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/;
            if (phoneChinaRegex.test(this.phone)) {
                this.wrongPhone = false;
                try {
                    if ((await api('/captcha/sent', { phone: this.phone }, false)).code === 200) {
                        this.finishedPhoneInput = true;
                        setTimeout(() => {
                            document.querySelector('input[type="number"]').focus();
                        }, 250);
                    } else throw 'Error sending captcha';
                } catch (error) {
                    console.error(error);
                    // vue show error
                    this.wrongPhone = true;
                }
            } else {
                this.wrongPhone = true;
            }
        },
        async login() {
            // turn the captcha input into a string
            this.captcha = this.captcha.toString();
            if (this.captcha.length !== 4) return;

            const res = await api('/login/cellphone', { phone: this.phone, captcha: this.captcha }, false);
            if (res.code === 200) {
                this.$router.push({ name: 'favorites' });
            } else {
                this.wrongCaptcha = true;
            }
        }
    }
};
</script>
