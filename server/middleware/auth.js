const { User } = require('../models/User');

function auth(req, res, next) {
    // 인증 처리를 하는 곳
    // 클라이언트 쿠키에서 토큰을 가져온다.
    const token = req.cookies.x_auth;

    // 토큰을 복호화한 후 유저를 찾는다.
    User.findByToken(token)
    .then((user) => {
        if (!user) {
            throw new Error("유효하지 않은 토큰입니다.");
        }

        // 토큰과 유저정보를 다음 단계로 전달함.
        req.token = token;
        req.user = user;
        return next();
    })
    .catch((err) => {
        return res.status(401).json({
            isAuth: false,
            message: err.message
        });
    })
}

module.exports = { auth };