const express = require('express');
const db = require('./models');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const passport = require('passport');
const passportConfig = require('./passport');
const session = require('express-session');
const cookie = require('cookie-parser');
const morgan = require('morgan');

db.sequelize.sync();
passportConfig();

app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
})); // 3000포트만 허용하는것을 명시
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookie('cookiesecret'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'cookiesecret',
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(passport.initialize()); // -> req안에 req.login과 req.logout을 넣어줌
app.use(passport.session()); 

app.get('/', (req, res) => {
   res.send('안녕 백엔드');
});

app.post('/user', async (req, res, next) => {
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


app.post('/user/login', (req, res, next) => {
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

app.listen(3085, () => {
    console.log(`http://localhost:${3085}`)
});