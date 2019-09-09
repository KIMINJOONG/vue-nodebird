const express = require('express');
const db = require('./models');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

db.sequelize.sync();

app.use(cors('http://localhost:3000')); // 3000포트만 허용하는것을 명시
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
   res.send('안녕 백엔드');
});

app.post('/user', async (req, res, next) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 12);
        const exUser = await db.User.findOne({
            email: req.body.email,
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
        return res.status(201).json(newUser);
    }catch(err) {
        console.log(err);
        return next(err);
    }
    

})
app.listen(3085, () => {
    console.log(`http://localhost:${3085}`)
});