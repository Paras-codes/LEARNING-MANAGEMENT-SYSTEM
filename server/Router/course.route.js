import { Router } from "express";
import { getAllCourses, getCoursesById } from "../controller/coursecontroler.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const courseRouter=Router();

courseRouter.get('/',getAllCourses);

courseRouter.get('/:id',isLoggedIn,getCoursesById)

export default courseRouter;