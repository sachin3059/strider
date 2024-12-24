import express from "express";
import { registerDriver, loginDriver, getProfile, updateProfile, logoutDriver } from "../controllers/driverController.js";
import upload from "../middlewares/multer.js";
import authDriver from "../middlewares/authDriver.js";



const driverRouter = express.Router();

driverRouter.post('/register', registerDriver);
driverRouter.post('/login', loginDriver );
driverRouter.get('/get-profile', authDriver, getProfile);
driverRouter.post('/update-profile',upload.single('image'), authDriver, updateProfile );
driverRouter.get('/logout', authDriver, logoutDriver );



export default driverRouter;