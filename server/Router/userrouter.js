import {Router} from "express";
import { changePassword, forgotpassword, getProfile, login, logout, register, resetpassword, updateUser } from "../controller/usercontroler.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer,middleware.js";

const userRouter=Router();

userRouter.post("/register",upload.single("avatar"),register);
userRouter.post("/login",login);
userRouter.get("/logout",isLoggedIn,logout);
userRouter.get("/me",isLoggedIn,getProfile);
userRouter.post('/forgot-password',forgotpassword);
userRouter.post('/reset-password/:resetToken',resetpassword)
userRouter.post('/change-Password',isLoggedIn,changePassword)
userRouter.put('/update-user',isLoggedIn,upload.single("avatar"),updateUser)
export default userRouter;