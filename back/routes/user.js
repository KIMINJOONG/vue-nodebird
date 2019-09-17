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
                return res.json(user);
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
            return res.json(user);
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

module.exports = router;