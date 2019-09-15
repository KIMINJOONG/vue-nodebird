const express = require('express');
const { isLoggedIn } = require('./middlewares');
const multer = require('multer');
const path = require('path');

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

router.get('/', isLoggedIn, (req, res) => {
    
});



module.exports = router;