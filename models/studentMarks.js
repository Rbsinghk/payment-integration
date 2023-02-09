const mongoose = require("mongoose");

const new_mongoose = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userSchema'
    },
    english: {
        type: Number
    },
    maths: {
        type: Number
    },
    hindi: {
        type: Number
    },
    gujarati: {
        type: Number
    },
    ss: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const studentSchema = new mongoose.model("studentSchema", new_mongoose);
module.exports = studentSchema

