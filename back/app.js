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

const usersRouter = require('./routes/user');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const hashtagRouter = require('./routes/hashtag');

// db.sequelize.sync({ force: true });
db.sequelize.sync();
passportConfig();

app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:3080',
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
app.use('/', express.static('uploads'));
app.use(passport.initialize()); // -> req안에 req.login과 req.logout을 넣어줌
app.use(passport.session()); 

app.get('/', (req, res) => {
   res.send('안녕 백엔드');
});

app.use('/user', usersRouter);
app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/hashtag', hashtagRouter);


app.listen(3085, () => {
    console.log(`http://localhost:${3085}`)
});