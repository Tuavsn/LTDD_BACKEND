import { model, Schema } from "mongoose";

export enum OrderState {
    NEW = "new",
    ACCEPTED = "accepted",
    PENDING = "pending",
    DELIVERING = "delivering",
    DELIVERED = "delivered",
    CANCELED = "canceled"
}

const orderSchema = new Schema({
    items: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        required: [true, "Items is required"],
        default: []
    },
    items_count: {
        type: [{ type: Number }],
        required: [true, "Items count is required"],
        default: []
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone is required"]
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
        enum: ["cash", "card", "paypal"],
        default: "cash"
    },
    totalPrice: {
        type: Number,
        required: [true, "Total price is required"]
    },
    state: {
        type: String,
        required: [true, "Order state is required"],
        enum: OrderState,
        default: OrderState.NEW
    },
    discount: {
        type: Schema.Types.ObjectId,
        ref: 'Discount'
    },
}, { timestamps: true });


const Order = model("Order", orderSchema);

export default Order;