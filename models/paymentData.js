const mongoose = require("mongoose");

const new_mongoose = new mongoose.Schema({
  name: {
    type: String,
    // required: true
  },
  paymentId: {
    type: String,
    // required: true
  },
  paymentMethod: {
    type: String,
    // required: true
  },
  totalAmount: {
    type: String,
    // required: true
  },
  paymentThrough: {
    type: String,
    // required: true
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const paymentSchema = new mongoose.model("paymentSchema", new_mongoose);
module.exports = paymentSchema;
