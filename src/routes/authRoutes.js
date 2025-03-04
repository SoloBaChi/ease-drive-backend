
import express from "express";
import {
  loginUser,
  activateUser,
  sendResetPassowrdToken,
  verifyResetPasswordToken,
  confirmResetPassword,
  registerPassenger,
} from "../controllers/userController.js";

import { body } from "express-validator";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

/**
 * SIGNUP A USER
 */
router.post("/signup", 
    body("name")
    .trim() 
    .isString()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("Name must be at least 3 characters"),
  
    body("userName")
    .trim() 
    .isString()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("Username must be at least 3 characters"),
  
    body("email")
    .trim() 
    .isEmail()
    .withMessage("Please enter a valid email address"),
    
    body("password")
    .trim()
    .isStrongPassword({
      minLength: 6,
      minUppercase: 0,
      minSymbols: 0,
      minLowercase:0,
    })
    .withMessage(
      `Password must be at leaset 6 characters length`,
    ),
    
    body("confirmPassword")
    .trim()
    .isStrongPassword({
      minLength: 6,
      minUppercase: 0,
      minSymbols: 0,
      minLowercase:0,
    })
    .withMessage(
      `Confirm Password must be at least 6 characters length`,
    ),
    registerPassenger); // Signup new user



    /**
     * LOGIN A USER
     */
    router.post("/login", 
    body("password")
    .trim()
    .isStrongPassword({
    minLength: 6,
    minUppercase: 0,
    minSymbols: 0,
    minLowercase: 0,
    })
  .withMessage(
  `Invalid Password`,
    ),
  loginUser); // Login user


//  Activate user
router.get("/activate",activateUser); //Acivate user account

/**
   * PASSWORD RESET ROUTES
   */
router.post(
    "/send-otp",
    sendResetPassowrdToken,
  );

router.put(
    "/verify-otp",
    body("otp")
    .isString()
    .isLength({
      min: 5,
      max: 5,
    })
    .withMessage(
        `Please enter the correct five digit code sent to your email`,
      ),
    authenticate,
    verifyResetPasswordToken,
  );


  router.put(
    "/reset-password",
    body("newPassword")
    .isStrongPassword({
      minLength: 6,
      minUppercase: 0,
      minSymbols: 0,
      minLowercase: 0,
    })
    .withMessage(
      `Password must be at least 6 characters length`,
    ),
    body("confirmNewPassword")
    .isStrongPassword({
      minLength: 6,
      minUppercase: 0,
      minSymbols: 0,
      minLowercase: 0,
    })
    .withMessage(
      `Confirm Password must be at least 6 characters length`,
    ),
    authenticate,
    confirmResetPassword,
  );


export default router;