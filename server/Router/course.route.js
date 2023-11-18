import { Router } from "express";
import { addLectureToCourseById, createCourse, getAllCourses, getCoursesById, removeCourse, updateCourse } from "../controller/coursecontroler.js";
import { authorizeSubscriber, authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer,middleware.js";

const courseRouter=Router();

courseRouter.route('/')
.get(getAllCourses)
.post(isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse)


courseRouter.route('/:id')
.get(isLoggedIn,authorizeSubscriber,getCoursesById)
//dono m kuch reference to lagega na update ya deletion k liye
.put(isLoggedIn,
    authorizedRoles("ADMIN"),
    updateCourse)
.delete(isLoggedIn,
    authorizedRoles("ADMIN"),
    removeCourse)
.post(isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single('lecture'),
    addLectureToCourseById)

export default courseRouter;