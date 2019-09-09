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
        
    };
    return User;
}