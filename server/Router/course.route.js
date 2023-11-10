import { Router } from "express";
import { createCourse, getAllCourses, getCoursesById, removeCourse, updateCourse } from "../controller/coursecontroler.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer,middleware.js";

const courseRouter=Router();

courseRouter.route('/')
.get(getAllCourses)
.post(upload.single('thumbnail'),createCourse)


courseRouter.route('/:id')
.get(isLoggedIn,getCoursesById)
//dono m kuch reference to lagega na update ya deletion k liye
.put(updateCourse)
.delete(removeCourse)


export default courseRouter;