import bcrypt from 'bcrypt';
import jwt, { decode } from 'jsonwebtoken';
import validator from 'validator';
import {v2 as cloudinary} from 'cloudinary';
import driverModel from '../models/driverModel.js';
import blacklistModel from '../models/blacklistModels.js';


// API to register driver:

const registerDriver = async (req, res) => {
    try{
        const {
            firstname,
            lastname, 
            email, 
            password, 
            phone, 
            licenseNumber,
            vehicleDetails
        } = req.body

       

        console.log(req.body);

        

        if(!firstname || !email || !password || !phone || !licenseNumber || !vehicleDetails.color || !vehicleDetails.plate || !vehicleDetails.capacity || !vehicleDetails.vehicleType || !vehicleDetails.model || !vehicleDetails.registrationNumber){
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

        const DriverData = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword,
            phone: phone, 
            licenseNumber: licenseNumber,
            vehicleDetails: vehicleDetails
        }

        const newDriver = new driverModel(DriverData);
        const driver = await newDriver.save();


        // now create a token so that user can able to login
        // this can be using _id of newUser

        const token = jwt.sign({id: driver._id}, process.env.JWT_SECRET, {expiresIn: '24h'});

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

const loginDriver = async (req, res) => {  
    try{
        const {email, password} = req.body;
        const driver = await driverModel.findOne({email});

        if(!driver){
            return res.json({
                success: false,
                message: 'driver does not exists'
            })
        }

        const isMatch = await bcrypt.compare(password, driver.password)
        console.log(isMatch);

        if(!isMatch){
            return res.json({
                success: false,
                message: 'invalid credentials'
            })
        }
        else{
            const token = jwt.sign({id: driver._id}, process.env.JWT_SECRET)
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


// API to get driver profile data
const getProfile = async (req, res) => {
    try {
        const { driverId } = req.body
        const driverData = await driverModel.findById(driverId).select('-password')
        res.json({
            success: true,
            driverData
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
        const {driverId, firstname, lastname,  gender, phone} = req.body;
        const imageFile = req.file;

        if(!firstname || !phone || !gender ){
            return res.json({
                success: false,
                message: 'All fields are mandetary'
            })
        }

        await driverModel.findByIdAndUpdate(driverId, {firstname, lastname , gender, phone});

        if(imageFile){
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'})
            const imageURL = imageUpload.secure_url

            await driverModel.findByIdAndUpdate(driverId, {image:imageURL})
        }
        
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message
        })
        
    }
}


// API for user logout:

const logoutDriver = async(req, res) => {
    try {
        const token = req.header('driverToken') || req.header('drivertoken');
        // ***token will be clear from local storage from frontend:
        
        if(!token){
            return res.json({
                success: false,
                message: 'No token provided'
            })
        }


        const blacklistedToken = new blacklistModel({token})
        await blacklistedToken.save();

        return res.json({
            success: true,
            message: 'user logout and token blacklisted'
        })
        
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message
        })
        
    }
}



export {
    registerDriver,
    loginDriver,
    getProfile,
    updateProfile,
    logoutDriver
}


