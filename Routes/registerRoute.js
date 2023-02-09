const express = require("express");
const router = new express.Router();
const registerController = require("../controllers/register");
const valid = require("../middleware/validation");

router.post("/register", valid.registerSchema, registerController.register);
router.post("/login", valid.loginSchema, registerController.login);
router.post("/studentRegister", valid.studentRegisterSchema, registerController.studentRegister);
router.get("/getAllStudentAboveFourNinety", registerController.getAllStudentAboveFourNinety);
router.get("/getAllNintyMarksStudent", registerController.getAllNintyMarksStudent);
router.post("/getStudentGrade", registerController.getStudentGrade);
router.get("/getStudentBetweenSeventyFiveAndNinty", registerController.seventyFiveAndNinty);
router.post("/getStudentById", registerController.getStudentById);
router.post('/bookinTicket/pay', registerController.bookingTicketPay);
router.get('/success', registerController.success);
router.post("/payment", registerController.stripePayment)
router.post("/checkout", registerController.checkout)

module.exports = router;
