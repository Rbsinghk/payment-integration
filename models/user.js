const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const new_mongoose = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

//Generating tokens
new_mongoose.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.TOKEN_CODE);
        return token;
    } catch (error) {
        res.send("the error part" + error);
    }
}

//Converting password into Hash
new_mongoose.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);
    }
    next();
})

const userSchema = new mongoose.model("userSchema", new_mongoose);
module.exports = userSchema

