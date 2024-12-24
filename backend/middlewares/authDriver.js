import jwt from 'jsonwebtoken';
import driverModel from '../models/driverModel.js';
import blacklistModel from '../models/blacklistModels.js';

// user authentication middleware

const authDriver = async(req, res, next) => {
    try {
        const token = req.headers['driverToken'] || req.headers['drivertoken'];
        console.log(token);

        if(!token){
            return res.json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        const isBlacklisted = await blacklistModel.findOne({token: token});

        if(isBlacklisted){
            return res.json({
                success: false,
                message: 'unauthorized'
            });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.driverId = token_decode.id;
        console.log(token_decode);

        next();
        
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
        
    }
}

export default authDriver;