import Course from "../userschema/courseSchema.js"
import AppError from "../utils/error.util.js";

const getAllCourses=async(req,res,next)=>{
try{
    const courses=await Course.find({}).select('-lectures');
    res.status(200).json({
        success:true,
        messege:'All courses',
        courses
    })
}
catch(err){
    return next(new AppError(err.message,400))
}
}

const getCoursesById=async(req,res,next)=>{
try {
    const {id}=req.params;
    const course= await Course.findById(id);

    if(!course){
        return next(new AppError("Course Not Found",400))
    }
   
    res.status(200).json({
        success:true,
        messege:'Course Details',
        lectures:course.lectures
    })

} catch (err) {
    return next(new AppError(err.message,400))

}

}

export {
    getAllCourses,
    getCoursesById
}