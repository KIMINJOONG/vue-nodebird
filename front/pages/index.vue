<template>
    <v-container>
        <post-form v-if="me" />
        <div>
            <post-card v-for="p in mainPosts" :key="p.id" :post="p" />
        </div>
    </v-container>
</template>
<script>
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
export default {
    components: {
        PostCard,
        PostForm,
        
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
        return store.dispatch('posts/loadPosts');
    },
    asyncData() {
        // 비동기 작업을 위한 data
        // 리턴값이 data에서 사용가능
        // 컴포넌트 데이터를 비동기로 채워야할경우 사용
        return{};
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