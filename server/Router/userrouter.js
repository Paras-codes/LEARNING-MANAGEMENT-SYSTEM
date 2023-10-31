import {Router} from "express";
import { getProfile, login, logout, register } from "../controller/usercontroler.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer,middleware.js";

const userRouter=Router();

userRouter.post("/register",upload.single("avatar"),register);
userRouter.post("/login",login);
userRouter.get("/logout",isLoggedIn,logout);
userRouter.get("/me",isLoggedIn,getProfile);

export default userRouter;