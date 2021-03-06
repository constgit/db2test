const express = require('express');
const app = express();
const https = require('https');
const path = require('path');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
app.listen(process.env.PORT||5000, function() {
        console.log('Server is listening on port ' + process.env.PORT + '...');
    });

//mongoose.connect('mongodb://localhost:27017/db2');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/db2');
let db = mongoose.connection;
let Messages = require('./models/messages');


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

app.use(favicon(path.join(__dirname, 'src/img', 'favicon.ico')));
app.use('/src', express.static('src'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Messages.remove({}, function(err, items) {});

app.get('/', function(req, res) {
    res.sendFile(__dirname+'/src/html/chat.html');
});
app.get('/api/messages/list/:id', function(req, res) {
    let id = +req.params.id;
    if (id !== NaN)
        Messages.find({}).limit(10).skip(id * 10).sort({ created: -1 }).exec(function(err, mess) {
            res.send(mess);
        });
    else
        res.sendFile(__dirname+'/src/html/404.html');
});
app.get('/api/messages/single/:id', function(req, res) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/))
        Messages.find({ _id: req.params.id }).exec(function(err, mess) {
            res.send(mess);
        });
    else
        res.sendFile(__dirname+'/src/html/404.html');
});
app.post('/api/messages/add', function(req, res) {
    if (!req.body.message) return res.send( 'Message is empty');
    if (!req.body.email) return res.send('Email is empty');
    if (validateEmail(req.body.email) && validateMessage(req.body.message)) {
        var message = new Messages({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            message: req.body.message,
            created: timeString()
        });
        message.save(function(err) {
            if (err) throw err;
        });
        res.redirect('/');
    } else if (!validateEmail(req.body.email) && validateMessage(req.body.message))
        res.send('Uncorrect email');
    else if (validateEmail(req.body.email) && !validateMessage(req.body.message))
        res.send('Message is empty or longer than 100 characters');
    else
        res.send('Uncorrect email and message is empty or longer than 100 characters');
});



app.get('*', function(req, res) {
    res.sendFile(__dirname+'/src/html/404.html');
});

function timeString() {
    let now = new Date();
    let time = '';
    if (now.getDate() < 10)
        time += ('0' + now.getDate());
    else
        time += now.getDate();
    let month = now.getMonth() + 1;
    if (month < 10)
        time += ('.0' + month);
    else
        time += ('.' + month);
    if (now.getHours() < 10)
        time += (' / 0' + now.getHours());
    else
        time += (' / ' + now.getHours());
    if (now.getMinutes() < 10)
        time += (':0' + now.getMinutes());
    else
        time += (':' + now.getMinutes());
    if (now.getSeconds() < 10)
        time += (':0' + now.getSeconds());
    else
        time += (':' + now.getSeconds());
    return time;
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function validateMessage(message) {
    var re = /^(.{0}|.{1,100})$/;
    return re.test(message);
}