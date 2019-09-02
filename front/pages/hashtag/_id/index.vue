<template>
    <v-container>
        <div>
            <post-card v-for="p in mainPosts" :key="p.id" :post="p" />
        </div>
    </v-container>
</template>
<script>
import PostCard from '../../../components/PostCard';
export default {
    components: {
        PostCard,
    },
    computed: {
        me() {
            return this.$store.state.users.me;
        },
        mainPosts() {
            return this.$store.state.posts.mainPosts;
        },
        hasMorePost() {
            return this.$store.state.posts.hasMorePost;
        }
    },
    fetch({ store }) {
        store.dispatch('posts/loadPosts');
    },
    mounted() {
        // created에서 했으면 beforeDestroy에서 없애주지않으면 메모리 누수가 생긴다.
        // window는 created에서 사용 불가 mounted를 사용해야함
        window.addEventListener('scroll', this.onScroll);
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.onScroll);
    },
    methods: {
        onScroll() {
            if(window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
                if(this.hasMorePost) {
                    this.$store.dispatch('posts/loadPosts');
                }
            }
        },
    },
}
</script>
<style>

</style>