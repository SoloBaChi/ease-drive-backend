import jwt from "jsonwebtoken";

const generateToken = (userId, res, expires="15d") => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: expires,
  });

  res.cookie("jwt", token, {
    httpOnly: true, // more secure
    secure: true ,      // Only over HTTPS
    path:"/",
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: 'none',   // Allow cross-origin
    partitioned:true
  });

  return token;
};

export default generateToken;
