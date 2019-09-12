module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING(40),
            allowNull: false, // 필수
            unique: true, //중복금지
        },
        nickname: {
            type: DataTypes.STRING(20),
            allowNull: false

        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci', //한글 저장되요.
    });
    User.associate = db => {
        db.User.hasMany(db.Post); // 사용자는 게시글을 여러개 쓸 수 있다.는 의미
        db.User.hasMany(db.Comment)
    };
    return User;
}