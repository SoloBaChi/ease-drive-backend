import express from "express";
import {
  getUserProfile,
  logoutUser,
  updateUser,
  deleteAllUsers,
  getAllUsers,
  toggleFollowUser,
  updateUserProfile,
  deleteSingleUser,
} from "../controllers/userController.js";
import { body } from "express-validator";

const router = express.Router();
// router.get("/:query", authenticate, getUserProfile); // Fetch user profile
/*
GET USER PROFILE
*/
router.post("/follow/:userId",toggleFollowUser); // Follow or unfollow a user
router.get("/dashboard/:query",getUserProfile); // Fetch user profile
router.get("/all",getAllUsers); // Fetch  all user profile

  


// router.put("/:id/follow", authenticate, followUnFollowUser); // Follow/Unfollow
router.put("/update/:userId", updateUser); // Update profile
router.patch("/profile/:userId", updateUserProfile); // Update profile
router.delete("/delete/:userId",deleteSingleUser);


router.delete("/delete",deleteAllUsers)

router.post("/logout", logoutUser); // Logout user

export default router;
