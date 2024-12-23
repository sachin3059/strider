import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import userModel from '../models/userModels.js';
import {v2 as cloudinary} from 'cloudinary';



// API to register user:

const registerUser = async (req, res) => {
    try{
        const {firstname, lastname, email, password} = req.body

        if(!firstname || !email || !password){
            return res.json({
                success: false,
                message: 'All fields are compulsary'
            })
        }

        // validating email format
        if(!validator.isEmail(email)){
            return res.json({
                success: false,
                message: 'please give correct email'
            })
        }

        // validating strong password
        if(password.length < 8){
            return res.json({
                success: false,
                message: 'Enter a strong password and atleast of length 8'
            })
        }

        // hasing user password:
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();


        // now create a token so that user can able to login
        // this can be using _id of newUser

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);

        res.json({
            success: true,
            token
        })

    } catch(error){
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}


// API for login user

const loginUser = async (req, res) => {  
    try{
        const {email, password} = req.body;
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({
                success: false,
                message: 'user does not exists'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        console.log(isMatch);

        if(!isMatch){
            return res.json({
                success: false,
                message: 'invalid credentials'
            })
        }
        else{
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
            res.json({
                success: true,
                token
            })
        }
    }
    catch(error){
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')
        res.json({
            success: true,
            userData
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        });
        
    }
}



// API to update user profile:
const updateProfile = async (req, res) => {
    try {
        const {userId, firstname, lastname, address, gender, phone} = req.body;
        const imageFile = req.file;

        if(!firstname || !phone || !gender || !address){
            return res.json({
                success: false,
                message: 'All fields are mandetary'
            })
        }

        await userModel.findByIdAndUpdate(userId, {firstname, lastname, address:JSON.parse(address), gender, phone});

        if(imageFile){
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {image:imageURL})
        }
        
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
        
    }
}


// API for logout user:

const logout = async(req, res) => {
    try {
        const { userId } = req.body;
        
        
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        })
        
    }
}


export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile
}