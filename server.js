const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

const path = require('path');
const { expressjwt: exjwt } = require('express-jwt');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;

const secretKey = 'My super scret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256'],
});

let users = [
    {
        id: 1,
        username: 'Santosh',
        password: '123'
    },
    {
        id: 2,
        username: 'Mohan',
        password: '456'
    }
]


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let token;
    for (let user of users) {
        if (username == user.username && password == user.password) {
            token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '180s' });
            break;
        }
    }
    if (token) {
        res.json({
            success: true,
            err: null,
            token
        });
    }
    else {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});



app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });

});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Settings page works!!'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    // console.log(err.name === 'UnauthorizedError');
    // console.log(err);
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialErr: err,
            err: 'Username or password is incorrect2'
        });
    }
    else {
        next(err);
    }
});

app.listen(port, () => {
    console.log(`Serving app on ${port}`);
});