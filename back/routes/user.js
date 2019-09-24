const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../models');
const { isNotLoggedIn, isLoggedIn } = require('./middlewares');


router.get('/', isLoggedIn, async (req, res, next) => {
    const user = req.user;
    return res.json(user);
});

router.get('/:id', async (req, res, next) => {
    try{
        const user = await db.User.findOne({
            where: { id: parseInt(req.params.id, 10) },
            include: [{
                model: db.Post,
                as: 'Posts',
                attributes: ['id'],
            }, {
                model: db.User,
                as: 'Followings',
                attributes: ['id'],
            }, {
                model: db.User,
                as: 'Followers',
                attributes: ['id'],
            }],
            attributes: ['id', 'nickname'],
        });
        return res.json(user);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/',isNotLoggedIn, async (req, res, next) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 12);
        const exUser = await db.User.findOne({
            where: {
                email: req.body.email,
            },
        });
        if(exUser) {
            return res.status(403).json({
                errorCode: 1,
                message: '이미 회원가입되어있습니다.'
            });
        }
        const newUser = await db.User.create({
            email: req.body.email,
            password: hash,
            nickname: req.body.nickname,
        }); //HTTP STATUS CODE

        passport.authenticate('local', (err, user, info) => {
            if(err) {
                console.error(err);
                return next(err);
            }
            if(info) {
                return res.status(401).send(info.reason);
            }
            return req.login(user, async (err) => { // 세션에다 사용자 정보 저장 (어떻게? serializeUser => passport/index.js)
                if(err) {
                    console.error(err);
                    return next(err);
                }
                const fullUser = await db.User.findOne({
                    where: { id: user.id },
                    attributes: ['id', 'email', 'nickname'],
                    include: [{
                        model: db.Post,
                        attributes: ['id']
                    },{
                        model: db.User,
                        as: 'Followings',
                        attributes: ['id'],
                    }, {
                        model: db.User,
                        as: 'Followers',
                        attributes: ['id'],
                    }],
                });
                return res.json(fullUser);
            });
        })(req, res, next);
        return res.status(201).json(newUser);
    }catch(err) {
        console.log(err);
        return next(err);
    }
    

});


router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) {
            console.error(err);
            return next(err);
        }
        if(info) {
            return res.status(401).send(info.reason);
        }
        return req.login(user, async (err) => { // 세션에다 사용자 정보 저장 (어떻게? serializeUser => passport/index.js)
            if(err) {
                console.error(err);
                return next(err);
            }
            const fullUser = await db.User.findOne({
                where: { id: user.id },
                attributes: ['id', 'email', 'nickname'],
                include: [{
                    model: db.Post,
                    attributes: ['id']
                },{
                    model: db.User,
                    as: 'Followings',
                    attributes: ['id'],
                }, {
                    model: db.User,
                    as: 'Followers',
                    attributes: ['id'],
                }],
            });
            return res.json(fullUser);
        });
    })(req, res, next);
});

router.post('/logout', isLoggedIn ,(req, res, next) => {
    if(req.isAuthenticated()) {
        req.logout();
        req.session.destroy();
        return res.status(200).send('로그아웃 되었습니다.');
    }
});

router.post('/:id/posts', async (req, res, next) => {
    try {
        let where = {
            UserId: parseInt(req.params.id, 10),
            RetweetId: null,
        };
        if(parseInt(req.query.lastId, 10)) {
            where[db.Sequelize.Op.lt] = parseInt(req.query.lastId, 10);
        }
        const posts = await db.Post.findAll({
            where,
            include: [{
                model: db.User,
                attributes: ['id', 'nickname'],
            }, {
                model: db.Image,
            }, {
                model: db.User,
                through: 'Like',
                as: 'Likers',
                attributes: ['id'],
            }]
        });
        return res.json(posts);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
    try{
        const me = await db.User.findOne({
            where: { id: req.user.id },
        });
        await me.addFollowing(req.params.id);
        res.send(req.params.id);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

router.delete('/:id/unfollow', isLoggedIn, async (req, res, next) => {
    try{
        const me = await db.User.findOne({
            where: { id: req.user.id },
        });
        await me.removeFollowing(req.params.id);
        res.send(req.params.id);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/:id/followers',isLoggedIn, async (req, res, next) => {
    try{
        const user = await db.User.findOne({
            where: { id: req.user.id },
        });
        const followers = await user.getFollowers({
            attributes: ['id', 'nickname'],
            limit: parseInt(req.query.limit || 3, 10),
            offset: parseInt(req.query.offset || 0, 10),
        });
        return res.json(followers);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/:id/followings', isLoggedIn, async (req, res, next) => {
    try{
        const user = await db.User.findOne({
            where: { id: req.user.id },
        });
        const followings = await user.getFollowings({
            attributes: ['id', 'nickname'],
            limit: parseInt(req.query.limit || 3, 10),
            offset: parseInt(req.query.offset || 0, 10),
        });
        res.json(followings);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

router.delete('/:id/follower', isLoggedIn, async (req, res, next) => {
    try{
        const me = await db.User.findOne({
            where: { id: req.user.id },
        });
        await me.removeFollower(req.params.id);
        res.send(req.params.id);
    }catch(error) {
        console.error(error);
        next(error);
    }
})

router.patch('/nickname', isLoggedIn, async (req, res, next) => {
    try{
        await db.User.update({
            nickname: req.body.nickname,
        }, {
            where: { id: req.user.id }
        });
        res.send(req.body.nickname);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;