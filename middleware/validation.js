const joi = require("joi");

const registerSchema = async (req, res, next) => {
  const schema = joi.object({
    name: joi.string().min(3).required().label("name"),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().min(3).required().label("password")
  });
  const { error } = schema.validate(req.body);
  if (error) {
    res.json({ message: error.message, isSuccess: false });
  } else {
    next();
  }
};

const loginSchema = async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().min(3).required().label("password")
  });
  const { error } = schema.validate(req.body);
  if (error) {
    res.json({ message: error.message, isSuccess: false });
  } else {
    next();
  }
};

const studentRegisterSchema = async (req, res, next) => {
  const schema = joi.object({
    studentId: joi.string().required().trim().min(24).max(24).label("studentId"),
    english: joi.number().min(0).max(100).required().label("english"),
    maths: joi.number().min(0).max(100).required().label("maths"),
    hindi: joi.number().min(0).max(100).required().label("hindi"),
    gujarati: joi.number().min(0).max(100).required().label("gujarati"),
    ss: joi.number().min(0).max(100).required().label("ss")
  });
  const { error } = schema.validate(req.body);
  if (error) {
    res.json({ message: error.message, isSuccess: false });
  } else {
    next();
  }
};

const updateSchema = async (req, res, next) => {
  const schema = joi.object({
    name: joi.string().min(3).optional().label("name"),
    address: joi.string().min(3).max(100).optional().label("address"),
    class: joi
      .number()
      .valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
      .optional()
      .label("class"),
    age: joi.number().optional().label("age"),
    hobbies: joi.string().optional().label("hobbies"),
    gender: joi
      .string()
      .valid("male", "female", "other")
      .optional()
      .label("gender"),
    stateId: joi.string().optional().label("stateId"),
    cityId: joi.string().optional().label("cityId"),
    pincode: joi.string().optional().label("pincode"),
    image: joi.string().optional().label("image"),
    id: joi.string().required().label('id')
  });
  const { error } = schema.validate(req.body);
  if (error) {
    res.json({ message: error.message, isSuccess: false });
  } else {
    next();
  }
};

module.exports = { 
  registerSchema, 
  updateSchema,
  loginSchema,
  studentRegisterSchema 
};
