const { body, validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validateRequest
];

const loginValidator = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validateRequest
];

const profileUpdateValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("username").optional().trim().isAlphanumeric().withMessage("Username must be alphanumeric"),
  validateRequest
];

module.exports = {
  registerValidator,
  loginValidator,
  profileUpdateValidator
};
