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
        if(req.body.image) {
            // array로 감싸는 이유?
            // express에서 req.body.image를 파싱할때 이미지가 여러개냐 하나냐, 이미지가 하나라도 배열로 해야하는데
            // 한개일때 그냥 문자열로 처리하는 이슈가 있기때문에 구분을 함
            if(Array.isArray(req.body.image)) {
                await Promise.all(req.body.image.map((image) => {
                    return db.Image.create({ src: image, PostId: newPost.id });
                    // await이 안붙은 경우
                    // 안붙으면 Promise,
                    // Promise와 map이 있으면 Promise.all로 처리를 해줘야한다.
                }));
            } else {
                await db.Image.create({ src: req.body.image, PostId: newPost.id });
            }
        }
        const fullPost = await db.Post.findOne({
            where: { id: newPost.id },
            include: [{
                model: db.User,
                attributes: ['id', 'nickname']
            }, {
                model: db.Image,
            }],
        })
        return res.json(fullPost);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try{
        await db.Post.destroy({
            where: {
                id: req.params.id,
            }
        });
        return res.send('삭제했습니다.');
    }catch(err) {
        console.error(err);
        next(err);
    }
});

router.get('/:id/comments', async (req, res, next) => {
    try{
        const post = await db.Post.findOne({ where: { id: req.params.id } });
        if(!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        const comments = await db.Comment.findAll({
            where: {
                PostId: req.params.id
            },
            include: [{
                model: db.User,
                attributes: ['id', 'nickname']
            }],
            order: [['createdAt', 'ASC']] // 여러개의 정렬조건이 있을수있기때문에 1차원배열이 아닌 2차원배열로 만듦
        });
        return res.status(200).json(comments);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/comment', isLoggedIn, async (req, res, next) => {
    try{
        const post = await db.Post.findOne({ where: { id: req.params.id } });
        if(!post){
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        const newComment = await db.Comment.create({
            PostId: post.id,
            UserId: req.user.id,
            content: req.body.content,
        });
        const comment = await db.Comment.findOne({
            where: {
                id: newComment.id,
            },
            include: [{
                model: db.User,
                attributes: ['id', 'nickname']
            }],
        });
        return res.json(comment);
    }catch(err) {
        console.error(err);
        next(err);
    }
});



module.exports = router;