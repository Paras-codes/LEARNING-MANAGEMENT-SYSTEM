import Course from "../userschema/courseSchema.js"
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises"

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

const createCourse=async(req,res,next)=>{
    const {title ,description , category , createdBy}=req.body;
    
    if(!title||!description||!category
        ||!createdBy){
            return next(new AppError('All field are mandatory',400)) 
        }
try {
    const course=  await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail:{
            public_id:"Dummy",
            secure_url:"Dummy"
        }
     })    
    console.log(JSON.stringify(course));
     if(!course){
        return next(new AppError('Unable to create acourse Try again ',400)) 
     }

     if(req.file){
        try {
            const result=await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'lms',
            })
    
            if(result){
                course.thumbnail.public_id=result.public_id;
                course.thumbnail.secure_url=result.secure_url;
            }
            fs.rm(`${req.file.path}`);
     
        } catch (err) {
            return next(new AppError(err.message,400)) 
 
        }
      
    }

    await course.save();

    res.status(200).json({
        success:true,
        messege:'Course created sucessfully',
        course
    })

     
} catch (err) {
    return next(new AppError(err.message,400)) 
}
  

}

const updateCourse=async(req,res,next)=>{
    try {
        const {id}=req.params

        const course= await Course.findByIdAndUpdate(
            id,
            {
                $set:req.body
            },
            { 
                //ye as a database structure cheezo ko passthrough hone deta h
                runValidators:true
            }
        )
        if(!course)
        {
            return next(new AppError( "course doesn't exist",400)) 
        }

        res.status(200).json({
            success:true,
            messege:'Course updated sucessfully',
            course
        })
    
          
    } catch (err) {
        return next(new AppError(err.message,400)) 

    }

}

const removeCourse = async(req,res,next)=>{
    try {
            const _id=req.params.id;
    const course=await Course.findById({_id});

    if(!course){
        return next(new AppError( "course doesn't exist",400)) 
    }

    await Course.deleteOne({_id});

    res.status(200).json({
        success:true,
        messege:'Course deleted sucessfully',
        course
    })

    } catch (error) {


        return next(new AppError(err.message,400)) 

    }

}

export {
    getAllCourses,
    getCoursesById,
    createCourse,
    updateCourse,
    removeCourse
}