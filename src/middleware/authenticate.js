import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { ResponseMessage } from "../utils/responseMessage.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) return res.status(401).json({ message: "Unauthorized user" });


    let decoded;
        try {
          decoded =  jwt.verify(token, process.env.JWT_SECRET);;
        } catch (err) {
          return res
            .status(401)
            .json(new ResponseMessage("error", 401, "Token has Expired"));
        }
       
        //If token is wrong
      if (!decoded) return res.status(400).json(new ResponseMessage("error", 400, "Invalid Token"));


    const user = await User.findById(decoded.userId).select("-password -confirmPassword -activationToken -authCode")
    // .populate([
    //   { path: "followers", select: "name userName profileImage" },
    //   { path: "following", select: "name userName profileImage" }
    // ])
    ;

    req.user = user;

    next();
  } catch (err) {
    return res.status(500).json(new ResponseMessage("error",500,`Authentication Error ${err}`));
  }
};

export default authenticate;
