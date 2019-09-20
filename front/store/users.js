export const state = () => ({
    me: null,
    followerList: [],
    followingList: [],
    hasMoreFollower: true,
    hasMoreFollowing: true,
});

const totalFollowers = 8;
const totalFollowings = 6;
const limit = 3;

export const mutations = {
    setMe(state, payload) {
        state.me = payload;
    },
    changeNickname(state, payload) {
        state.me.nickname = payload.nickname;
    },
    addFollower(state, payload) {
        state.followerList.push(payload);
    },
    addFollowing(state, payload) {
        state.followingList.push(payload);
    },
    removeFollowing(state, payload) {
        const index = state.me.Followings.findIndex(v => v.id === payload.userId);
        state.me.Followings.splice(index, 1);
    },
    removeFollower(state, payload) {
        const index = state.followerList.findIndex(v => v.id === payload.id);
        state.followerList.splice(index, 1);
    },
    loadFollowings(state) {
        const diff = totalFollowings - state.followingList.length;
        const fakeUsers = Array(diff > limit ? limit : diff).fill().map(v => ({
            id: Math.random().toString(),
            nickname: Math.floor(Math.random() * 1000)
        }));
        state.followingList = state.followingList.concat(fakeUsers);
        state.hasMoreFollowing = fakeUsers.length === limit;
    },
    loadFollowers(state) {
        const diff = totalFollowers - state.followerList.length;
        const fakeUsers = Array(diff > limit ? limit : diff).fill().map(v => ({
            id: Math.random().toString(),
            nickname: Math.floor(Math.random() * 1000)
        }));
        state.followerList = state.followerList.concat(fakeUsers);
        state.hasMoreFollower = fakeUsers.length === limit;
    },
    following(state, payload) {
        state.me.Followings.push({ id: payload.userId });
    }
}

export const actions = {
    loadUser({ commit }, payload) {
        this.$axios.get('/user', {
            withCredentials: true,
        }).then((res) => {
            commit('setMe', res.data);
        }).catch((err) => {
            console.log(err);
        });
    },
    signUp({ commit, state }, payload) {
        this.$axios.post('/user', {
            email: payload.email,
            nickname: payload.nickname,
            password: payload.password
        }).then((res) => {
            commit('setMe', res.data);
        }).catch(err => {
            console.error(err);
        });
        
    },
    logIn({ commit }, payload) {
        this.$axios.post('/user/login', {
            email: payload.email,
            password: payload.password
        }, {
            withCredentials: true,
        }).then((res) => {
            commit('setMe', res.data);
        }).catch((err) => {
            console.log(err);
        });
    },
    logOut({ commit }) {
        this.$axios.post('/user/logout', {}, {
            withCredentials: true,
        }).then((data) => {
            console.log(data);
            commit('setMe', null);
        }).catch((err) => {
           console.error(err); 
        });
        
    },
    changeNickname({ commit }, payload) {
        commit('changeNickname', payload);
    },
    addFollowing({ commit }, payload) {
        commit('addFollowing', payload);
    },
    addFollower({ commit }, payload) {
        commit('addFollower', payload);
    },
    removeFollowing({ commit }, payload){
        commit('removeFollowing', payload);
    },
    removeFollower({ commit }, payload) {
        commit('removeFollower', payload);
    },
    loadFollowers({ commit, state }, payload) {
        if(state.hasMoreFollower) {
            commit('loadFollowers');
        }
    },
    loadFollowings({ commit , state }, payload) {
        if(state.hasMoreFollowing) {
            commit('loadFollowings');
        }
    },
    follow({ commit }, payload) {
        this.$axios.post(`/user/${payload.userId}/follow`, {}, {
            withCredentials: true,
        }).then((res) => {
            commit('following', {
                userId: payload.userId,
            })
        }).catch((error) => {
            console.error(error);
        })
    },
    unfollow({ commit }, payload) {
        this.$axios.delete(`/user/${payload.userId}/unfollow`, {
            withCredentials: true,
        }).then((res) => {
            commit('removeFollowing', {
                userId: payload.userId,
            })
        }).catch((error) => {
            console.error(error);
        })
    },
}