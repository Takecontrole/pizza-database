require('dotenv').config();

const mongoose = require('mongoose');

const connectionStr = "mongodb+srv://Afro:5774@cluster0.fm3uoez.mongodb.net/pizza?retryWrites=true&w=majority";

mongoose.connect(connectionStr, {useNewUrlparser: true})
.then(() => console.log('connected to mongodb'))
.catch(err => console.log(err))

mongoose.connection.on('error', err => {
  console.log(err)
})
