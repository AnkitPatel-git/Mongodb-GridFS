const express = require("express");
const app = express();
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
var logger = require('morgan');
require('dotenv').config()
// Middlewares
app.use(express.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 

// DB
mongoose.set('strictQuery', true);
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {useNewUrlParser:true,useUnifiedTopology: true});
const con= mongoose.connection;
con.on('open', ()=> {
  console.log('Database Connected');
});
app.use('/', require('./controllers/profile'));


app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send('error');
});


const port = 5001;

app.listen(port, () => {
  console.log("server started on " + port);
});
