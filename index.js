const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const { User } = require('./models/User')

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());


const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://Indwoo:0504@cluster0.5zredre.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
{}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/register', (req, res) => {
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))