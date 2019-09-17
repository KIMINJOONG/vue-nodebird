const passport = require('passport');
const local = require('./local');
const db = require('../models');

module.exports = () => {
    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try{
            const user = await db.User.findOne({ 
                where: { id }, 
                attributes: ['id', 'nickname'] 
            });
            return done(null, user); // req.user 와 req.isAuthenticated() === true 로 만들어줌
        } catch(err) {
            console.error(err);
            return done(err);
        }
        

    });
    local();
}