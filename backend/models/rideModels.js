import mongoose from "mongoose";
import userModel from "./userModels.js";

const rideSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: userModel,
        required: true,
    },
    pickup: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const rideModel = mongoose.models.ride || mongoose.model('ride', rideSchema);

export default rideModel;
