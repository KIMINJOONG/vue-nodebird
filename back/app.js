const express = require('express');
const db = require('./models');
const app = express();

db.sequelize.sync();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
   res.send('안녕 백엔드');
});

app.post('/user', async (req, res, next) => {
    try {
        const newUser = await db.User.create({
            email: req.body.email,
            password: req.body.password,
            nickname: req.body.nickname,
        }); //HTTP STATUS CODE
        res.status(201).json(newUser);
    }catch(err) {
        console.log(err);
        next(err);
    }
    

})
app.listen(3085, () => {
    console.log(`http://localhost:${3085}`)
});