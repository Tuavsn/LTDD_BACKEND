import { model, Schema } from "mongoose";

const notificationSchema = new Schema ({
    type: {
        type: String,
        required: [true, "Items is required"],
        enum: ["order", "message", "notification"],
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"]
    },
    received: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"]
    },
    content: {
        type: String,
        required: [true, "Notification content is required"],
    },
    option: {
        type: Object,
        required: [true, "Notification option is required"],
    }
}, { timestamps: true });

const Notification = model("Notification", notificationSchema);

export default Notification;