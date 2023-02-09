const express = require('express');
const app = express();
require('./config/db');
const ejs = require('ejs');
const path = require('path');
const port = process.env.PORT;

app.use(express.json({ limit: 100000000000 }));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//Import Route
const regRouter = require('./Routes/registerRoute');
const viewRouter = require('./Routes/viewRoute');

//Route MiddleWare
app.use(regRouter);
app.use(viewRouter);

app.use(express.static("./public/css"));
app.use(express.static("./public"));
app.use(express.static("./public/userProfileImage"));

app.listen(port, () => {
    console.log(`The Port is Running at ${port}`);
})