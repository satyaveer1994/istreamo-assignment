const { body } = require('express-validator');
const userModel=require('../models/userModel')

exports.registerValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password should be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage(
      'Password should contain at least one lowercase letter, one uppercase letter, one digit, and one special character'
    ),
  body('email').isEmail().withMessage('Invalid email format'),
  body('user_name').custom(async (value) => {
    const user = await userModel.findOne({ user_name: value });
    if (user) {
      throw new Error('Username already exists');
    }
  }),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('mobile').isMobilePhone().withMessage('Invalid mobile number'),
];
