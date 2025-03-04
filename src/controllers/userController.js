import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
// import { v2 as cloudinary } from "cloudinary";
import { ResponseMessage } from "../utils/responseMessage.js";
import { validationResult } from "express-validator";
import { generateActivationToken } from "../utils/generateActivationToken.js";
import nodemailer from "nodemailer"
import { generateRandomAvatar } from "../utils/generateRandomAvatar.js";
import generateRandomDigit from "../utils/generateRandomDigit.js";
import cloudinary from "../config/cloudinary.js";


// Define current year for account registration
const currentYear = new Date().getFullYear();
// Fetch User Profile
export const getUserProfile = async (req, res) => {
  const  { query } = req.params;
  const  { userName, _id:userId } = req.user;
  try {
    // const user = mongoose.Types.ObjectId.isValid(query)
    //   ? await User.findById(query).select("-password")
    //   : await User.findOne({ userName: query }).select("-password");

    const user = query === userName || query === userId.toString() ? req.user : null;

    // const user = User.findOne({ $or: [{ _id:query }, { userName:query }]})

    // const user = await User.findOne({ 
    //   $or: [{ _id: userId }, { userName: query }]
    // }).populate([
    //   { path: "followers", select: "name userName profileImage" },
    //   { path: "following", select: "name userName profileImage" }
    // ]);
    
    

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(new ResponseMessage("success",200,"fetched user successfully",user));

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -confirmPassword -activationToken -isActive -authCode");

    if (!users) return res.status(404).json(new ResponseMessage("error",404,"Not Data Retrieved"));

    return res.json(new ResponseMessage("success",200,"Retreived users successfully",{
      totalUsers:users.length,
      users
    }));

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Signup
export const signupUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()[0].msg));
  }
  const { name, userName, email, password,confirmPassword } = req.body;

  try {
    // Check if a user with the given email or userName already exists
    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists. Please use a different email or userName.",
      });
    }


     // Check if the password matches
     if (password !== confirmPassword) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "Password does not match!"));
    }

    // Generate Activation Token
    const activationToken = await generateActivationToken();

    // Create the user
    const user = await User.create({
      name,
      userName,
      email,
      password: await bcrypt.hash(password, 10) ,
      confirmPassword:await bcrypt.hash(confirmPassword, 10),
      profileImage: await generateRandomAvatar(email),
      activationToken,
    });

    // Create an activation link
    const activationLink = `https://bclicscom.vercel.app/activate?email=${email}&token=${activationToken}`;

    // Generate a token and set it in a cookie
    // generateToken(user._id, res);

    // Send a successful response
       // Send the Activation link to the email
       const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Welcome to Bclics!",
        // attachments: [
        //   {
        //     filename: "logo.png",
        //     path: `${__dirname}/logo.png`,
        //     cid: "save-logo.png",
        //   },
        // ],
        html: `
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activate Your Bclics Account</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #444444;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f2f2f2;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1c1c1c;
              color: #cccccc;
            }
            .email-container {
              background-color: #2b2b2b;
              border-color: #444444;
            }
          }
          .header {
            text-align: center;
            color: #0056b3;
            font-size: 24px;
            margin-bottom: 20px;
          }
          @media (prefers-color-scheme: dark) {
            .header {
              color: #72b4ff;
            }
          }
          .button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 25px;
            font-size: 16px;
            color: #ffffff;
            background-color: #0056b3;
            text-decoration: none;
            border-radius: 5px;
          }
          .button:hover {
            background-color: #004a99;
          }
          @media (prefers-color-scheme: dark) {
            .button {
              background-color: #72b4ff;
              color: #1c1c1c;
            }
            .button:visited{
             color:#ffffff;
            }
            .button:hover {
              background-color: #5fa4e6;
              color:#ffffff;
            }
          }
          @media (prefers-color-scheme: light) {
            .button {
            color: #ffffff;
            background-color: #0056b3;
            }
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888;
          }
          @media (prefers-color-scheme: dark) {
            .footer {
              color: #666666;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">Welcome to Bclics!</div>
          <p>Dear ${userName},</p>
          <p>Thank you for signing up with <strong>Bclics</strong>, your ultimate platform for connecting products and services. We're thrilled to have you join us.</p>
          <p>To get started, please activate your account by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${activationLink}" class="button">Activate My Account</a>
          </p>
          <p>If the button above doesn’t work, copy and paste the link below into your browser:</p>
          <p style="word-break: break-word;">
            <a href="${activationLink}" style="color: #0056b3;">${activationLink}</a>
          </p>
          <p>If you didn’t sign up for Bclics, please disregard this email.</p>
          <div class="footer">
            &copy; ${currentYear} Bclics. All rights reserved.  
            <br>Need help? <a href="mailto:bclics01@gmail.com" style="color: #0056b3;">Contact Us</a>
          </div>
        </div>
      </body>
      </html>
          `,
      };
      transporter.sendMail(mailOptions, (error, success) => {
        if (error) {
          console.log(`Error sending Activation Email`, error);
          return res
            .status(400)
            .json(
              new ResponseMessage("error", 400, `Error sending Activation Email`),
            );
        }
  
        return res.status(200).json(
          new ResponseMessage(
             "success",
            200,
            "Activation link sent to your email. Check your inbox or spam to activate"
          ),
        );
      });
  } 
  catch (error) {
    // Handle server errors
    return res .status(500).json(new ResponseMessage("error",500,`Internal Server  ${error}`))
  }
};



//**  Activate user account
//GET http://localhost:8500/activate?email=""&token=""
export const activateUser = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({
      activationToken: token,
    });
    if (!user) {
      // console.log("user does not exist");
      return res
        .status(404)
        .json(new ResponseMessage("error", 404, "Invalid Activation Token"));
    }
    // Activate the user and save to the DB
    user.isActive = true;
    user.activationToken = null; //reset the activation token to null
    await user.save();

    // Generate Access token
    generateToken(user._id, res);
    // send email for account comfirmation
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Account Activated Successfully'",
      // attachments: [
      //   {
      //     filename: "logo.png",
      //     path: `${__dirname}/logo.png`,
      //     cid: "save-logo.png",
      //   },
      // ],
      html: `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Activated</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #444444;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f2f2f2;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1c1c1c;
              color: #cccccc;
            }
            .email-container {
              background-color: #2b2b2b;
              border-color: #444444;
            }
          }
          .header {
            text-align: center;
            color: #0056b3;
            font-size: 24px;
            margin-bottom: 20px;
          }
          @media (prefers-color-scheme: dark) {
            .header {
              color: #72b4ff;
            }
          }
          .button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 25px;
            font-size: 16px;
            color: #ffffff;
            background-color: #0056b3;
            text-decoration: none;
            border-radius: 5px;
          }
          .button:visited{
          color:#ffffff;
          }
          .button:hover {
            background-color: #004a99;
          }
          
          @media (prefers-color-scheme: dark) {
            .button {
              background-color: #72b4ff;
              color: #1c1c1c;
            }
            .button:hover {
              background-color: #5fa4e6;
               color:#ffffff;
            }
          }
           @media (prefers-color-scheme: light) {
           .button {
            color: #ffffff;
            background-color: #0056b3;
            }
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888;
          }
          @media (prefers-color-scheme: dark) {
            .footer {
              color: #666666;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">Your Account is Ready!</div>
          <p>Dear ${user.userName},</p>
          <p>We’re excited to inform you that your <strong>Bclics</strong> account has been successfully activated!</p>
          <p>You can now enjoy seamless access to our platform, connecting products and services to suit your needs anytime, anywhere.</p>
          <p style="text-align: center;">
            <a href="https://bclicscom.vercel.app/" class="button">Log In to My Account</a>
          </p>
          <p>If you have any questions or need support, feel free to contact us at <a href="mailto:bclics01@gmail.com" style="color: #0056b3;">support@bclics.com</a>.</p>
          <div class="footer">
            &copy; 2024 Bclics. All rights reserved.  
            <br>Need help? <a href="mailto:bclics01@gmail.com" style="color: #0056b3;">Contact Us</a>
          </div>
        </div>
      </body>
      </html>
      `,
    };
    transporter.sendMail(mailOptions, (error, success) => {
      if (error) {
        console.log(`Error sending comfirmation Email`, error);
        return res
          .status(400)
          .json(
            new ResponseMessage(
              "error",
              400,
              `Error sending comfirmation Email`,
            ),
          );
      }

      return res.status(200).json(
        new ResponseMessage(
          "success",
          200,
          "You Account has been Activated Successfully.!",
        ),
      );
    });
  } catch (err) {
    return res
      .status(500)
      .json(new ResponseMessage("error", 500, "Internal Server Error"));
  }
};

// Login
export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  // validateResultData(errors,res);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()[0].msg));
  }

  const { userName, password } = req.body;

  try {
    // Check if user exists by userName or email
    const user = await User.findOne({
      $or: [{ userName }, { email: userName }],
    });
 
    if (!user) {
      return res
        .status(400)
        .json({ message: "userName or email does not exist." });
    }

     // check if the user has been activated
     if (!user.isActive) {
      return res
        .status(400)
        .json(
          new ResponseMessage(
            "error",
            400,
            "Verification failed. Activate your account via the email link sent."
          ),
        );
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    // Generate a token and set it in a cookie
    generateToken(user._id,res);

    // Return the user details (without sensitive information)
    res.status(200).json({
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};



// Logout A User Out
// export const logoutUser = (req, res) => {
//   res.clearCookie("jwt").status(200).json(new ResponseMessage("success",200,`Logged out Succesfully"`));
// };
export const logoutUser = (req, res) => {
  try {
    res.cookie("jwt","", {
      httpOnly: true,   
      secure: true,  
      sameSite: "none", 
      expires: new Date(0),
      path: "/",  
      maxAge: 1    
    });

  return res.status(200).json(new ResponseMessage("success",200,`User logged out Succesfully`))
   
  } catch (error) {

  return res.status(500).json(new ResponseMessage("error",500, `Could not logout a User`))
  }
};





/**
 * UPDATE USER INFO
 */
// POST : localhost:8000/api/v1/upadteuser
export const updateUser = async (req, res) => {
  const isEmpty = (obj) => JSON.stringify(obj) === "{}";

  if (isEmpty(req.body)) {
    return res
      .status(400)
      .json(
        new ResponseMessage(
          "error",
          400,
          `Please Enter a Valid data and Continue`,
        ),
      );
  }

  const { email, userName } = req.user;

  try {
    const user = await User.findOneAndUpdate({ $or:[{ email }, {userName}] }, req.body, {
      new: true,
    });
    if (!user)
      return res
        .status(404)
        .json(new ResponseMessage("error", 404, "user not found..!"));

    // return updated user
    return res.status(200).json(
      new ResponseMessage("success", 200, "Account updated Successfully...!", {
        user,
      }),
    );
  } catch (err) {
    return res
      .status(404)
      .json(new ResponseMessage("error", 404, "Internal Sever Error!"));
  }
};


export const updateUserProfile = async(req,res) => {
  const { userId } = req.params;
  const { name , userName, bio  } = req.body;
  let { profileImage } = req.body;
  
  try{
    const {_id: currentUserId } = req.user;

    const user = await User.findOne({ _id: currentUserId });

    if(!user){
      return res.status(404).json(new ResponseMessage("error",404,`User not found.!`));
    }

    if(userId !== currentUserId.toString()){
      return res.status(400).json(new ResponseMessage("error",400,`You cannot update this profile`));
    }

    if(profileImage){
      if(user.profileImage){
        // const publicId = user.profileImage.split("/").pop().split(".")[0];
        // await cloudinary.uploader.destroy(publicId);
        const publicId = user.profileImage.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);        
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImage,{
       folder: "bclics-profiles",
       resource_type: "auto",
      });
      profileImage = uploadedResponse.secure_url;

    }

    const updatedUser = await User.findOneAndUpdate({ _id: currentUserId}, {
      name,
      userName,
      bio,
      profileImage
    },
    {
    new:true
    }
  )
    return res.status(200).json(
      new ResponseMessage("success", 200, "Profile updated Successfully!", {
        updatedUser,
      }),
    );


  }
  catch(error){
    return res.status(500).json(new ResponseMessage("error",500,`Internal Sever Error. ${error.message}`))
  }
}

/**
 * PUT Update User password
 * Update locaclhost:8001/api/v1/update-password
 *
 */
export const updateUserPassword = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()[0].msg));
  }
  try {
    const { newPassword, oldPassword, confirmPassword } = req.body;
    const { email,userName } = req.user;

    // Check if the user is existing
    const user = await User.findOne({ $or:[{email}, {userName}]});

    if (!user) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "User not found"));
    }

    //compare the current password with existing password
    const isCorrectPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isCorrectPassword) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "incorrect old password..!"));
    }

    //check if the new password is same as old password
    if (newPassword === oldPassword) {
      return res
        .status(400)
        .json(
          new ResponseMessage(
            "error",
            400,
            "New Password is same as old password..!",
          ),
        );
    }

    //  check if the new password matches
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "Password does not match..!"));
    }

    // Update the  user password
    await User.findOneAndUpdate(
      { $or:[{email},{userName}] },
      {
        password: await bcrypt.hash(newPassword, 10),
        confirmPassword: await bcrypt.hash(confirmPassword, 10),
      },
      {
        new: true,
      },
    );

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_PASSWORD,
      to: email,
      subject: "Password Change",
      // attachments: [
      //   {
      //     filename: "logo.png",
      //     path: `${__dirname}/logo.png`,
      //     cid: "save-logo.png",
      //   },
      // ],
      html: `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Change Detected</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #444444;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f2f2f2;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1c1c1c;
              color: #cccccc;
            }
            .email-container {
              background-color: #2b2b2b;
              border-color: #444444;
            }
          }
          .header {
            text-align: center;
            color: #0056b3;
            font-size: 24px;
            margin-bottom: 20px;
          }
          @media (prefers-color-scheme: dark) {
            .header {
              color: #72b4ff;
            }
          }
          .button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 25px;
            font-size: 16px;
            color: #ffffff;
            background-color: #0056b3;
            text-decoration: none;
            border-radius: 5px;
          }
          .button:hover {
            background-color: #004a99;
          }
          .button:visited{
          color:#ffffff;
          }
          @media (prefers-color-scheme: dark) {
            .button {
              background-color: #72b4ff;
              color: #1c1c1c;
            }
            .button:hover {
              background-color: #5fa4e6;
            }
          }
          @media (prefers-color-scheme: light) {
            .button {
            color: #ffffff;
            background-color: #0056b3;
            }
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888;
          }
          @media (prefers-color-scheme: dark) {
            .footer {
              color: #666666;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">Password Updated Successfully!<</div>
          <p>Hi ${user.userName},</p>

          <p>
           Your password has successfully been updated at <a href="https://bclicscom.vercel.app/">Bclics</a>
           </p>
           <p style="text-align: center;">
            <a href="https://bclicscom.vercel.app/" class="button">Log In to My Account</a>
          </p>
          
          <p>If you have any questions or need support, feel free to contact us at <a href="mailto:bclics01@gmail.com" style="color: #0056b3;">support@bclics.com</a>.</p>
          <div class="footer">
            &copy; 2024 Bclics. All rights reserved.  
            <br>Need help? <a href="mailto:bclics01@gmail.com" style="color: #0056b3;">Contact Us</a>
          </div>

          <p>If you did not initiate this request , please kindly contact us or ignore this message !</p>
        </div>
      </body>
      </html>
`,
    };

    // transporters
    transporter.sendMail(mailOptions, (error, success) => {
      if (error) {
        console.log("Error Sending Email", error);
        return res
          .status(500)
          .json(
            new ResponseMessage(
              "error",
              500,
              "Error sending password update email",
            ),
          );
      }
      return res
        .status(200)
        .json(
          new ResponseMessage(
            "success",
            200,
            "Password Updated Succesfully!",
          ),
        );
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new ResponseMessage("error", 500, "Internal Sever Error!"));
  }
};

// POST : localhost:8000/api/v1/upadte
///FORGOT PASSWORD
export const sendResetPassowrdToken = async (req, res) => {
  try {
    // Get the user email
    const { userName } = req.body;

    // Check if the user exist
    const user = await User.findOne({ $or:[{ email:userName } ,{ userName }] });
    if (!user) {
      return res
        .status(400)
        .json(
          new ResponseMessage(
            "error",
            400,
            "No account associated with this email",
          ),
        );
    }

    // Generate random Digit and update the user authCode
    const authCode = generateRandomDigit();
    const updatedUser = await User.findByIdAndUpdate(
      {
        _id: user._id,
      },
      { authCode: await bcrypt.hash(authCode, 10) },
      { new: true },
    );

 
    // const authToken = generateToken(updatedUser._id,res);
     generateToken(updatedUser._id,res,"5m");
   


    //Send the Generated token to the user email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Bclics Password Reset Code",
      html: `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #444444;
              background-color: #f2f2f2;
              padding: 0;
              margin: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              border: 1px solid #dddddd;
            }
            .header {
              text-align: center;
              color: #0056b3;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .reset-code {
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              color: #0056b3;
              margin: 20px 0;
              letter-spacing:0.5rem;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #888888;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">Your Password Reset Code</div>
            <p>Dear ${user?.name || "User"},</p>
            <p>You requested to reset your password. Use the code below to reset it:</p>
            <p class="reset-code">${authCode}</p>
            <p>The code is valid for 5 minutes. If you didn’t request a password reset, please ignore this email.</p>
            <div class="footer">
              &copy; 2024 Bclics. All rights reserved.
            </div> 
          </div>
        </body>
        </html>
      `,
    };
    transporter.sendMail(mailOptions, (error, success) => {
      if (error) {
        console.log(`Error sending comfirmation Email`, error);
        return res
          .status(400)
          .json(
            new ResponseMessage(
              "error",
              400,
              `Error sending comfirmation Email`,
            ),
          );
      }

      return res.status(200).json(
        new ResponseMessage("success", 200, "OTP sent to your email", {
          email:user?.email
        })
      );
    });
  } catch (err) {
    return res
      .status(500)
      .json(new ResponseMessage("error", 500, `Internal server error ${err}`));
  }
};


// export const verifyResetPasswordToken = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res
//       .status(400)
//       .json(new ResponseMessage("error", 400, errors.array()[0].msg));
//   }
//   try {
//     const { authToken } = req.query;
//     const { otp } = req.body;

//     // Decode the auth token using jwt and check for validity
//     let decodedToken;
//     try {
//       decodedToken = await verifyToken(authToken);
//     } catch (err) {
//       return res
//         .status(401)
//         .json(new ResponseMessage("error", 401, "Token has Expired..!"));
//     }
//     if (!decodedToken) {
//       return res
//         .status(400)
//         .json(new ResponseMessage("error", 400, "invalid token"));
//     }

//     // Get the user id using the decoded token
//     const userId = decodedToken.id;
//     if (!userId) {
//       return res
//         .status(400)
//         .json(
//           new ResponseMessage(
//             "error",
//             400,
//             `user with ${userId} does not exist`,
//           ),
//         );
//     }

//     // Find the user using the user id
//     const user = await User.findOne({ _id: userId });
//     // console.log(user);

//     // Check if the OTP is null i.e (has been used)
//     if (!user.authCode) {
//       return res
//         .status(400)
//         .json(new ResponseMessage("error", 400, "OTP has been used"));
//     }

//     // Compare the hashed token
//     isCorrectOtp = await bcrypt.compare(otp, user.authCode);
//     if (!isCorrectOtp) {
//       return res
//         .status(400)
//         .json(new ResponseMessage("error", 400, "invalid OTP !"));
//     }

//     // Reset the authCode to null and Save it
//     user.authCode = null;
//     await user.save();

//     return res
//       .status(200)
//       .json(new ResponseMessage("success", 200, "OTP verified successfully"));
//   } catch (err) {
//     return res
//       .status(400)
//       .json(new ResponseMessage("error", 400, "Internal Server Error"));
//   }
// };
// verify Reset password Token
export const verifyResetPasswordToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()[0].msg));
  }
  try {
    const user = req.user;
    const { otp } = req.body;

    // Get the user id using the decoded token
    const userId = user._id;

    if (!userId) {
      return res
        .status(400)
        .json(
          new ResponseMessage(
            "error",
            400,
            `user with ${userId} does not exist`,
          ),
        );
    }

    if (!user.authCode) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "OTP has been used"));
    }

    // Compare the hashed token
    const isCorrectOtp = await bcrypt.compare(otp, user.authCode);
    if (!isCorrectOtp) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "Invalid OTP!"));
    }

    // Reset the authCode to null and Save it
    user.authCode = null;
    await user.save();

    return res
      .status(200)
      .json(new ResponseMessage("success", 200, "OTP verified successfully"));
  } catch (err) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, `Internal Server Error ${err}`));
  }
};



// PUT : localhost:8000/api/v1/user/reset-password
export const confirmResetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()[0].msg));
  }
  try {
    const { email, userName } = req.user;
    const { newPassword, confirmNewPassword } = req.body;

    const user = await User.findOne({ $or:[{ email}, {userName}]});
    if (!user) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, `User not found!`));
    }

    // check if the two passoword matches
    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, `Passwords does not Match`));
    }

    //check if the authcode has not been used
    if (user.authCode) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "Please verify code the sent to your Email"));
    }

    // update the user password
    await User.findOneAndUpdate(
      { $or:[{ email:user.email },{userName:user.userName}]},
      { password: await bcrypt.hash(newPassword, 10) },
      { confirmPassword: await bcrypt.hash(confirmNewPassword, 10) },
      { new: true },
    );

    return res
      .status(200)
      .json(
        new ResponseMessage("success", 200, "Password updated successfully"),
      );
  } catch (err) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, `Internal Server Errro : ${err}`));
  }
};




//TOGGLE FOLLOWERS
export const toggleFollowUser = async (req, res) => {
  const { userId: targetUserId } = req.params; // ID of the user to be followed/unfollowed
  const loggedInUserId = req.user._id; // Authenticated user's ID

  if (loggedInUserId.toString() === targetUserId) {
    return res.status(400).json(new ResponseMessage("error",400,"You cannot follow yourself."));
  }

  try {
    // Fetch both users from the database
    const targetUser = await User.findById(targetUserId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!targetUser) {
      return res.status(404).json(new ResponseMessage("error",404,"User not found."));
    }

    // Check if the logged-in user is already following the target user
    const isAlreadyFollowing = loggedInUser.following.includes(targetUserId);

    if (isAlreadyFollowing) {
      // Unfollow user
      loggedInUser.following.pull(targetUserId);
      targetUser.followers.pull(loggedInUserId);
    } else {
      // Follow user
      loggedInUser.following.push(targetUserId);
      targetUser.followers.push(loggedInUserId);
    }

    // Save updates to the database
    await loggedInUser.save();
    await targetUser.save();

    return res.json(new ResponseMessage(
      "success",
      200,
     isAlreadyFollowing ? `Successfully unfollowed ${targetUser?.name}` : `Successfully followed ${targetUser?.name}`
    ));
  } catch (error) {
    console.error("Error toggling follow status:", error);
    return res.status(500).json(new ResponseMessage("error",500,"An error occurred while processing your request." ));
  }
};






// Follow/Unfollow
// export const followUnFollowUser = async (req, res) => {
//   const { id } = req.params;
//   const currentUserId = req.user._id;

//   if (currentUserId.toString() === id)
//     return res.status(400).json({ message: "Cannot follow yourself" });

//   try {
//     const userToModify = await User.findById(id);
//     const currentUser = await User.findById(currentUserId);

//     if (!userToModify)
//       return res.status(404).json({ message: "User not found" });

//     const isFollowing = currentUser.following.includes(id);
//     if (isFollowing) {
//       currentUser.following.pull(id);
//       userToModify.followers.pull(currentUserId);
//     } else {
//       currentUser.following.push(id);
//       userToModify.followers.push(currentUserId);
//     }

//     await currentUser.save();
//     await userToModify.save();
//     res.json({ message: isFollowing ? "Unfollowed" : "Followed" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Update User
// export const updateUser = async (req, res) => {
//   const { name, email, userName, password, bio } = req.body;
//   let { profilePic } = req.body;

//   const userId = req.user._id;
//   try {
//     let user = await User.findById(userId);
//     if (!user) return res.status(400).json({ error: "User not found" });

//     if (req.params.id !== userId.toString())
//       return res
//         .status(400)
//         .json({ error: "You cannot update other user's profile" });

//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);
//       user.password = hashedPassword;
//     }

//     try {
//       if (profilePic) {
//         // If there's an existing profilePic, delete it from Cloudinary
//         if (user.profilePic) {
//           const publicId = user.profilePic.split("/").pop().split(".")[0];
//           await cloudinary.uploader.destroy(publicId);
//         }

//         // Upload the new profilePic
//         const uploadedResponse = await cloudinary.uploader.upload(profilePic);
//         profilePic = uploadedResponse.secure_url;
//       }
//     } catch (error) {
//       console.error("Error handling profile picture : ", error);
//       // Handle the error appropriately, e.g., send a response to the client or notify the user
//     }

//     user.name = name || user.name;
//     user.email = email || user.email;
//     user.userName = userName || user.userName;
//     user.profilePic = profilePic || user.profilePic;
//     user.bio = bio || user.bio;

//     user = await user.save();

//     // Find all Posts that this User replied and update userName and userProfilePic fields
//     await Post.updateMany(
//       { "replies.userId": userId },
//       {
//         $set: {
//           "replies.$[reply].userName": user.userName,
//           "replies.$[reply].userProfilePic": user.profilePic,
//         },
//       },
//       { arrayFilters: [{ "reply.userId": userId }] }
//     );

//     // password should be null in respose
//     user.password = null;

//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//     console.log("Error in updateUser: ", err.message);
//   }
// };



/**
 * @desc Delete users account
 * @route localhost:5000/api/v1/users/delete/userId
 */

export const deleteSingleUser = async(req,res) => {
  const { userId } = req.params;
try{
  const user = await User.findOne({_id: userId});
  if(!user){
    return res.status(404).json(new ResponseMessage("error",404, `User Not Found.`))
  }

  await User.findOneAndDelete({_id: user._id});

  return res.status(204).json(
    new ResponseMessage("success", 204, "Book Successfully deleted!", {
      data: null,
  }))
}
catch(err){
  return res.status(500).json(new ResponseMessage("error",500,`Something Went Wrong.${err.message}`))
}
}


// **DELETE ALL THE USERS During testing
export const deleteAllUsers = async(req,res) => {
    try{
    const deletedUsers = await User.deleteMany({});
    return res.status(204).json(new ResponseMessage("success",204,"Done deleting all users"))
    }
    catch(err){
    return res.status(400).json(new ResponseMessage("error",400,"Error deleting Users..!"))
    }
}