import {Router} from "express";
import { getProfile, login, logout, register } from "../controller/usercontroler.js";

const userRouter=Router();

userRouter.post("/register",register);
userRouter.post("/login",login);
userRouter.get("/logout",logout);
userRouter.get("/me",getProfile);

export default userRouter;