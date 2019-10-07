const  express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');

//bring all routes
const auth = require('./routes/api/auth');
const profile = require('./routes/api/profile');
const questions = require('./routes/api/questions');

const app = express();

//Middleware for bodyparser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

//mongoDB config
const db = require('./setup/dburl').mongoURL;

//Attempt to connect to database

mongoose.connect(db , {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(()=> console.log(`MongoDB connected successfully`))
    .catch(err =>console.log(err));

//Passport Middleware
app.use(passport.initialize());

//config for JWT stratergy
require('./stratergies/jsonwtStratergy')(passport);

const port = process.env.PORT || 3000;

//just for testing -> route

app.get('/',(req,res)=>{
    res.send('Hey there BigStack');
});

// routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/questions', questions);

app.listen(port,()=>console.log(`App is running at ${port}`));