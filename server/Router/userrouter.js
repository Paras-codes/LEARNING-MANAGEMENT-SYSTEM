import {Router} from "express";
import { getProfile, login, logout, register } from "../controller/usercontroler.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const userRouter=Router();

userRouter.post("/register",register);
userRouter.post("/login",login);
userRouter.get("/logout",logout);
userRouter.get("/me",isLoggedIn,getProfile);

export default userRouter;