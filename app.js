//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser")
const ejs = require("ejs")
const port = 3000;

const mongoose = require("mongoose") //library to connect to mongodb
var encrypt = require('mongoose-encryption'); //library to encrypt password

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

//SQL Create DB
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aaicxax.mongodb.net/UserDB?retryWrites=true&w=majority`);
// Check for successful MongoDB connection
const db = mongoose.connection;
db.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});
db.once("open", () => {
    console.log("Connected to MongoDB");
});

//SQL: Create Table 
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
//Encryption
const secret = process.env.SECRET;
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']}); 

const User = new mongoose.model("User", userSchema); // สร้าง

app.use(express.static("public")) //static files like css, images, etc
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/register", (req, res) => {
    res.render("register");
})
app.post("/register", (req, res) => {

    // Body Parser
    const email = req.body.username
    const password = req.body.password
    const newUser = new User({ email, password })

    // Save to MongoDB (Mongoose)
    newUser.save()
    res.render("secrets")
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.post("/login", async (req, res) => {

    const username = req.body.username
    const password = req.body.password

    try {
        const foundUser = await User.findOne({ email: username })

        if (foundUser) { //มี user นี้อยู่ในระบบ 
            if (foundUser.password === password) { // ถ้า password ตรงกัน
                res.render("secrets")
            }
            else res.send("Incorrect Password") // ถ้า password ผิด
        }
        else res.send("User not found") // ไม่มี user นี้อยู่ในระบบ

    } catch (error) {
        console.error('Error during user search!', error)
        res.status(500).send('Error during user search!')
    }
})

app.get("/logout", (req, res) => {

    res.redirect("/")
})

app.get("/secrets", (req, res) => {
    res.render("secrets");
})

app.get("/", (req, res) => {
    res.render("home");
});

app.listen(3000, () => {
    console.log(`Server opened on port ${port}`);
})