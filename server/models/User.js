const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next) {
    const user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return next(err);
            }

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                return next();
            });
        });
    }
    else {
        return next();
    }
})

userSchema.methods.comparePassword = function (plainPassword) {
    // plainpassword와 db에 암호화된 비밀번호가 같은지 확인
    const result = bcrypt.compare(plainPassword, this.password);
    return result;
  };

  userSchema.methods.generateToken = async function (cb) {
    var user = this;
    // jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), "secretToken");
    // user._id(db의 _id) + secreToken = token
    // token으로 user를 판별할 수 있다.
    // user.token = token;
    user.token = token;
  
    try {
      const savedUser = await user.save();
      return user;
    } catch (err) {
      return err;
    }
  };

userSchema.statics.findByToken = function(token, cb) {
    const user = this;

    return new Promise((resolve, reject) => {
        jwt.verify(token, 'secretToken', function(err, decoded) {
            if (err) reject(err);

            user.findOne({"_id": decoded, "token": token})
                .then(user => {
                    resolve(user);
                })
                .catch(err => {
                    reject(err);
                });
        });
    });
}

const User = mongoose.model('User', userSchema)

module.exports = { User }