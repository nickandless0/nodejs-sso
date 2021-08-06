new Vue({
    el: '#app',

    data() {
        return {
            signin: {
                username: '',
                password: '',
            },
            qr: '',
            secret: '',
            totpCode: '',
            isBusy: false,
            me: {},
        }
    },

    mounted() {
        this.getUser();
    },

    methods: {
        onLogout() {
            Cookies.remove('token');
            location.href = '/'
        },
        reset() {
            this.qr = ''
            this.signin = {
                username: '',
                password: '',
            }
        },
        onSubmit() {
            this.isBusy = true;
            axios.post(`/signin`, {...this.signin}).then(({ data }) => {
                if (['success'].includes(data.type)) {
                    this.qr = data.qr
                    this.secret = data.secret
                    return;
                }
                alert(data.message)
                this.isBusy = false
            })
        },
        onConfirm() {
            axios.post(`/confirm`, { code: this.totpCode, secret: this.secret }).then(({ data }) => {
                if (data.verified) {
                    Cookies.set('token', this.secret);
                    alert('Successfully logged in.')
                    location.href = '/dashboard.html'
                    this.isBusy = false
                    return ;
                }
                alert('Incorrect code.')
            })
        },
        getUser() {
            const token = Cookies.get('token')
            if (token) {
                axios.post(`/me`, {token}).then(({ data }) => {
                    if (data) {
                        this.me = data.user;
                    }
                })
            }
        },
    },
})