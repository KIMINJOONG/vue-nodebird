module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        content: {
            type: DataTypes.TEXT, //매우 긴글
            allowNull: false,
        }
    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    });
    Post.associate = (db) => {
        db.Post.belongsTo(db.User); // 게시글은 사용자에 속해있다. belongsTo를 붙이면 UserId가 같이 생성됨
        db.Post.hasMany(db.Comment); // hasMany는 딱히 생성해주지않음
        db.Post.hasMany(db.Image);
        db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' });
        db.Post.belongsTo(db.Post, { as: 'Retweet' }); // PostId가 생김 그러나 원하는것은 RetweetId
        db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
    };
    return Post;
}