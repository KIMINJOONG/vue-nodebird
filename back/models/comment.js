module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    });
    Comment.associate = (db) => {
        db.Comment.belongsTo(db.User);  // 댓글은 유저에게 속해있다.
        db.Comment.belongsTo(db.Post); // 댓글은 게시글에도 속해있음.
    }
    return Comment;
};