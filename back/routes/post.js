const express = require('express');
const { isLoggedIn } = require('./middlewares');
const multer = require('multer');
const path = require('path');
const db = require('../models');

const router = express.Router();


const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads');
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext); // 제로초.png, basename = 제로초, ext = .png
            done(null, basename + Date.now() + ext);

        }
    }),
    limit: { fileSize: 20 * 1024 * 1024 },
})

router.post('/images', isLoggedIn, upload.array('image'), isLoggedIn, (req, res) => {
    res.json(req.files.map(v => v.filename));
});

router.post('/', isLoggedIn, async (req, res, next) => {
    try{
        // req.body.content,
        // req.body.imagePaths
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        const newPost = await db.Post.create({
            content: req.body.content,
            UserId: req.user.id,
        });
        if(hashtags) {
            const result = await Promise.all(hashtags.map(tag => db.Hashtag.findOrCreate({
                where: { name: tag.slice(1).toLowerCase() },
            })));
            // addHashtags 는 어디서 만들었는가
            // 시퀄라이즈가 만드는것
            // post 에서 model정의할때 belongsToMany설정할때 add, get,set, get removeHashtag등등 다생김 
            await newPost.addHashtags(result.map(r => r[0]));
        }
        const fullPost = await db.Post.findOne({
            where: { id: newPost.id },
            include: [{
                model: db.User,
                attributes: ['id', 'nickname']
            }],
        })
        return res.json(fullPost);
    }catch(err){
        console.error(err);
        next(err);
    }
});



module.exports = router;