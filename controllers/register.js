const userSchema = require("../models/user");
const studentSchema = require("../models/studentMarks");
const fs = require("fs");
const paypal = require("paypal-rest-sdk");
const paymentSchema = require("../models/paymentData");
const bcrypt = require("bcrypt");
const validator = require("validator");

const register = async (req, res) => {
  try {
    const newuser = new userSchema(req.body);
    newuser
      .save()
      .then(() => res.json({ message: "Success" }))
      .catch((error) => res.send(error));
  } catch (error) {
    res.json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    const userMail = await userSchema.findOne({ email });
    const isMatch = await bcrypt.compare(password, userMail.password);
    const token = await userMail.generateAuthToken();
    if (isMatch) {
      res.status(201).send({
        message: "Login Success",
        data: token,
        id: userMail.id,
        isSuccess: true,
      });
    } else {
      res.json({ message: "Invalid Username or Password", isSuccess: false });
    }
  } catch (error) {
    res.json({ message: "Invalid Username or Password", isSuccess: false });
  }
};

const studentRegister = async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const getstudentId = await userSchema.findById(studentId);
    if (getstudentId == null) {
      res.send({ message: "Invalid Student Id", isSuccess: false });
    } else {
      const getAM = await studentSchema.findOne({ studentId });
      if (getAM == null) {
        const newstudentMarks = new studentSchema(req.body);
        newstudentMarks
          .save()
          .then(() =>
            res.json({ message: "Student Marks Created SuccessFully" })
          )
          .catch((error) => res.send(error));
      } else {
        const updateStudentMarks = await studentSchema
          .findByIdAndUpdate(getAM._id, req.body, {
            new: true,
            runValidators: true,
          })
          .then(() =>
            res.json({ message: "Student Marks Updated SuccessFully" })
          )
          .catch((error) => res.send("error"));
      }
    }
  } catch (error) {
    res.json({ message: error.message });
  }
};

const getAllStudentAboveFourNinety = async (req, res) => {
  try {
    const getStudent = await studentSchema.aggregate([
      {
        $addFields: {
          total: {
            $sum: {
              $add: ["$maths", "$english", "$hindi", "$gujarati", "$ss"],
            },
          },
        },
      },
      { $match: { total: { $gte: 490 } } },
    ]);
    const getStudentAll = await studentSchema.find();
    let above490 = getStudent.length;
    let less490 = getStudentAll.length - above490;
    res
      .status(201)
      .send({ Data: getStudent, Above490: above490, Less490: less490 });
  } catch (error) {
    res.status(401).send(error);
  }
};

const getAllNintyMarksStudent = async (req, res) => {
  try {
    studentSchema.aggregate(
      [
        {
          $lookup: {
            from: "userschemas",
            localField: "studentId",
            foreignField: "_id",
            as: "result",
          },
        },
        {
          $match: {
            $or: [
              { maths: { $eq: 90 } },
              { gujarati: { $eq: 90 } },
              { hindi: { $eq: 90 } },
              { ss: { $eq: 90 } },
              { english: { $eq: 90 } },
            ],
          },
        },
      ],
      async (err, data) => {
        if (err) {
          return res.json({
            message: "Something went wrong.",
          });
        }
        var response = [];
        data.forEach((e) => {
          var store = [];
          Object.keys(e).find((k) => {
            if (e[k] == 90) {
              store.push(k);
            }
          });
          if (store.length) {
            response.push({
              marks: 90,
              subject: store,
              name: e.result[0].name,
            });
          }
        });
        const getStudentAll = await studentSchema.find();
        let studentWith90 = response.length;
        let studentWithOut90 = getStudentAll.length - studentWith90;
        return res.json({
          response,
          studentWithOut90: studentWithOut90,
          studentWith90: studentWith90,
        });
      }
    );
  } catch (err) {
    return res.json({
      message: "Unable to add student.",
    });
  }
};

const getStudentGrade = async (req, res) => {
  try {
    const studentId = req.body.id;
    const getStudent = await studentSchema.findOne({ studentId: studentId });
    if (getStudent != null) {
      if (
        getStudent.english <= 35 ||
        getStudent.hindi <= 35 ||
        getStudent.gujarati <= 35 ||
        getStudent.maths <= 35 ||
        getStudent.ss <= 35
      ) {
        res.send({ Data: getStudent, message: "Student is Fail" });
      } else {
        var total =
          getStudent.english +
          getStudent.hindi +
          getStudent.gujarati +
          getStudent.maths +
          getStudent.ss;
        if (total > 375) {
          res.send({
            Data: getStudent,
            message: "Student is Pass with Distinction",
          });
        } else {
          res.send({ Data: getStudent, message: "Student is Pass" });
        }
      }
    } else {
      res.send({ message: "Student Id is Not Correct" });
    }
  } catch (error) {
    res.status(401).send(error);
  }
};

const seventyFiveAndNinty = async (req, res) => {
  try {
    const getStudent = await studentSchema.find();
    var arr = [];
    for (i = 0; i < getStudent.length; i++) {
      if (
        (getStudent[i].english <= 90 ||
          getStudent[i].hindi <= 90 ||
          getStudent[i].gujarati <= 90 ||
          getStudent[i].maths <= 90 ||
          getStudent[i].ss <= 90) &&
        (getStudent[i].english >= 75 ||
          getStudent[i].hindi >= 75 ||
          getStudent[i].gujarati >= 75 ||
          getStudent[i].maths >= 75 ||
          getStudent[i].ss >= 75)
      ) {
        const getStudentName = await userSchema.findById(
          getStudent[i].studentId
        );
        arr.push(getStudentName.name);
      }
    }
    let seventyFiveAndNinty = arr.length;
    let other = getStudent.length - seventyFiveAndNinty;
    res.status(201).send({
      Name: arr,
      seventyFiveAndNinty: seventyFiveAndNinty,
      Others: other,
    });
  } catch (error) {
    res.status(401).send(error);
  }
};

const getStudentById = async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const getStudent = await studentSchema.findOne({ studentId: studentId });
    if (getStudent != null) {
      res.send(getStudent);
    } else {
      res.send({ message: "Student Id is Not Correct" });
    }
  } catch (error) {
    res.status(401).send(error);
  }
};

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PAY_PAL_CLIENT_ID,
  client_secret: process.env.PAY_PAL_CLIENT_SECRET,
});

const bookingTicketPay = async (req, res) => {
  try {
    // const ticket = await ticketSchema.findById(req.body.ticketId);
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:1000/success",
        cancel_url: "http://localhost:1000/cancel",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: req.body.name,
                sku: "001",
                price: req.body.price,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: req.body.price,
          },
          description: "Hat for the best team ever",
        },
      ],
    };
    paypal.payment.create(create_payment_json, async (error, payment) => {
      if (error) {
        res.send(error);
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.json({ message: payment.links[i].href });
          }
        }
      }
    });
  } catch (error) {
    res.send(error);
  }
};

const success = async (req, res) => {
  // const ticket = await ticketSchema.findOne(req.body.ticketId);
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    payer_id: payerId,
  };
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async function (error, payment) {
      if (error) {
        throw error;
      } else {
        const createPaymentData = new paymentSchema({
          // name: ticket.name,
          email: payment.payer.payer_info.email,
          paymentId: payment.id,
          totalAmount: payment.transactions[0].amount.total,
          paymentMethod: payment.payer.payment_method,
          paymentThrough: "PayPal"
        });
        const save = await createPaymentData.save();
        res.status(201).render("getStudent");
      }
    }
  );
};

var Stripe_Secret_Key = "sk_test_Czcmd6nNU3pu0sUjKGT3TYAf";

const stripe = require("stripe")(Stripe_Secret_Key);

const stripePayment = async (req, res) => {
  const name = req.body.name;
  const price = Number(req.body.price) * 100;
  stripe.customers
    .create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken,
      name: "Gautam Sharma",
      address: {
        line1: "TC 9/4 Old MES colony",
        postal_code: "110092",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
      },
    })
    .then((customer) => {
      return stripe.charges.create({
        amount: 7000, // Charing Rs 25
        description: "Web Development Product",
        currency: "INR",
        customer: customer.id,
      });
    })
    .then(async (charge) => {
      const createPaymentData = new paymentSchema({
        email: charge.billing_details.name,
        paymentId: charge.id,
        totalAmount: charge.amount_captured,
        paymentMethod: charge.payment_method,
        paymentThrough: "Stripe"
      });
      const save = await createPaymentData.save();
      res.send("Success");
    })
    .catch((err) => {
      res.send(err); // If some error occurs
    });
};

var transactionKey = "6YUcz3Zb9U8r7u45";
var loginId = "62kKY52FNVtr";
const ApiContracts = require("authorizenet").APIContracts;
const ApiControllers = require("authorizenet").APIControllers;
const SDKConstants = require("authorizenet").Constants;

const checkout = async (req, res) => {
  const { cc, cvv, expire, amount } = req.body;

  const errors = [];

  if (!validator.isCreditCard(cc)) {
    errors.push({
      param: "cc",
      msg: "Invalid credit card number.",
    });
  }
  if (!/^\d{3}$/.test(cvv)) {
    errors.push({
      param: "cvv",
      msg: "Invalid CVV code.",
    });
  }
  if (!validator.isDecimal(amount)) {
    errors.push({
      param: "amount",
      msg: "Invalid amount.",
    });
  }
  if (errors.length > 0) {
    res.json({ errors: errors });
    return;
  }

  const merchantAuthenticationType =
    new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(loginId);
  merchantAuthenticationType.setTransactionKey(transactionKey);

  const creditCard = new ApiContracts.CreditCardType();
  creditCard.setCardNumber(cc);
  creditCard.setExpirationDate(expire);
  creditCard.setCardCode(cvv);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setCreditCard(creditCard);

  const transactionSetting = new ApiContracts.SettingType();
  transactionSetting.setSettingName("recurringBilling");
  transactionSetting.setSettingValue("false");

  const transactionSettingList = [];
  transactionSettingList.push(transactionSetting);

  const transactionSettings = new ApiContracts.ArrayOfSetting();
  transactionSettings.setSetting(transactionSettingList);

  const transactionRequestType = new ApiContracts.TransactionRequestType();
  transactionRequestType.setTransactionType(
    ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
  );
  transactionRequestType.setPayment(paymentType);
  transactionRequestType.setAmount(amount);
  transactionRequestType.setTransactionSettings(transactionSettings);

  const createRequest = new ApiContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuthenticationType);
  createRequest.setTransactionRequest(transactionRequestType);
  const ctrl = new ApiControllers.CreateTransactionController(
    createRequest.getJSON()
  );

  ctrl.execute(async() => {
    const apiResponse = ctrl.getResponse();
    const response = new ApiContracts.CreateTransactionResponse(apiResponse);

    if (response !== null) {
      if (
        response.getMessages().getResultCode() ===
        ApiContracts.MessageTypeEnum.OK
      ) {
        if (response.getTransactionResponse().getMessages() !== null) {
          const createPaymentData = new paymentSchema({
            // name: ticket.name,
            // email: payment.payer.payer_info.email,
            paymentId: response.transactionResponse.transId,
            totalAmount: amount,
            paymentMethod: response.transactionResponse.accountType,
            paymentThrough: "Authorization.net"
          });
          const save = await createPaymentData.save();
          res.json({ message: "Transaction was successful." });
        } else {
          if (response.getTransactionResponse().getErrors() !== null) {
            let code = response
              .getTransactionResponse()
              .getErrors()
              .getError()[0]
              .getErrorCode();
            let text = response
              .getTransactionResponse()
              .getErrors()
              .getError()[0]
              .getErrorText();
            res.json({
              error: `${code}: ${text}`,
            });
          } else {
            res.json({ error: "Transaction failed." });
          }
        }
      } else {
        if (
          response.getTransactionResponse() !== null &&
          response.getTransactionResponse().getErrors() !== null
        ) {
          let code = response
            .getTransactionResponse()
            .getErrors()
            .getError()[0]
            .getErrorCode();
          let text = response
            .getTransactionResponse()
            .getErrors()
            .getError()[0]
            .getErrorText();
          res.json({
            error: `${code}: ${text}`,
          });
        } else {
          let code = response.getMessages().getMessage()[0].getCode();
          let text = response.getMessages().getMessage()[0].getText();
          res.json({
            error: `${code}: ${text}`,
          });
        }
      }
    } else {
      res.json({ error: "No response." });
    }
  });
};

module.exports = {
  register,
  getAllStudentAboveFourNinety,
  login,
  studentRegister,
  getAllNintyMarksStudent,
  seventyFiveAndNinty,
  getStudentGrade,
  getStudentById,
  success,
  bookingTicketPay,
  stripePayment,
  checkout,
};
