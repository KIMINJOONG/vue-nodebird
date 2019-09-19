<template>
    <div>
        <post-images :images="post.Images || []" />
        <v-card-title>
            <h3>
                <nuxt-link :to="'/user/' + post.id">{{post.User.nickname}}</nuxt-link>
            </h3>
        </v-card-title>
        <v-card-text>
            <div>
                <h3>{{ post.User.nickname }}</h3>
                <div>{{ post.content }}</div>
            </div>
        </v-card-text>
    </div>
</template>

<script>
import PostImages from './PostImages';

export default {
    components: {
        PostImages,
    },
    props: {
        post: {
            type: Object,
        },
    }
}
</script>

<style scoped>
    a {
        text-decoration: none;
        color: inherit;
    }
</style>