import mongoose from "mongoose";


const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400// 24 hours in second
    },
});


const blacklistModel = mongoose.models.blacklist || mongoose.model('blacklist', blacklistSchema);

export default blacklistModel;