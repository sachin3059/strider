import jwt from 'jsonwebtoken';
import userModel from '../models/userModels.js';
import blacklistModel from '../models/blacklistModels.js';

// user authentication middleware

const authUser = async(req, res, next) => {
    try {
        const token = req.headers['userToken'] || req.headers['usertoken'];
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
        req.body.userId = token_decode.id;
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

export default authUser;