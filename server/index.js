const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const config = require('./config/key') 
const { User } = require('./models/User')
const { auth } = require('./middleware/auth')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { comparePassword } = require('./models/User');

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors());

const mongoose = require('mongoose');
const { compare } = require('bcrypt');
mongoose.connect(config.mongoURI,
{}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/api/hello', (req, res) => {
    res.send("안녕하세요~")
})

app.post('/api/users/register', (req, res) => {

    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body)
    user.save()
    .then(() => {
        return res.status(200).json({
            success: true,
        })
    })
    .catch((error) => {
        return res.send(400).json({
            success: false,
            msg: error
        })
    })
})



app.post("/api/users/login", async (req, res) => {
    try {
      // 같은 이메일의 유저가 있는지 확인
      const user = await User.findOne({ email: req.body.email });
      console.log('로그인 유저 확인');
  
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: "제공된 이메일에 해당하는 유저가 없습니다.",
        });
      }
  
      // 비밀번호 확인
      const isMatch = await user.comparePassword(req.body.password);
      console.log('비밀번호 확인');
      if (!isMatch) {
        console.log('비밀번호가 틀렸습니다.') 
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }
  
      // 토큰 쿠키에 저장
      const userdata = await user.generateToken();
      // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
      res
        .cookie("x_auth", userdata.token)
        .status(200)
        .json({ loginSuccess: true, userId: userdata._id });
    } catch (err) {
      return res.status(400).send(err);
    }
  });

app.get('/api/users/auth', auth, (req, res) => {
    // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 true라는 말
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id}, {token: ""})
    .then(() => {
        return res.status(200).json({
            logoutSuccess: true
        });
    })
    .catch((err) => {
        return res.status(400).json({logoutSuccess: false,message: err.message});
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))