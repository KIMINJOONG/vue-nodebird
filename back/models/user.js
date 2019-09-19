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
        db.User.hasMany(db.Comment);
        db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' }); // 위의 post와 헷갈리지않게 as를 붙여줘야 시퀄라이즈가 알아들음
        db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followers', foreignKey: 'followingId'}); // as -> 나를 팔로워하는사람 가져오기
        db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followings', foreignKey: 'followerId'});// as -> 나를 팔로잉하는 사람 가져오기

        // foreignKey -> followingId가 내 아이디면 팔로워 아이디는 남들의 아이디이기때문에
        // followerId가 내 아이디면 팔로잉 아이디는 남들의 아이디 이기때문에 as와 대응되는 개념으로 해줘야함
    };
    return User;
}