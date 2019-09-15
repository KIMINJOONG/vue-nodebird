const express = require('express');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();

router.post('/images', isLoggedIn, (req, res) => {

});

router.get('/', isLoggedIn, (req, res) => {
    
});



module.exports = router;