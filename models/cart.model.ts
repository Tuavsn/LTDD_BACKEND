import { model, Schema } from "mongoose";

const cartSchema = new Schema({
    items: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        default: []
    },
    items_count: {
        type: [{ type: Number }],
        default: []
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"],
        unique: true
    },
    state: {
        type: String,
        required: [true, "Cart state is required"],
        enum: ["active", "completed", "cancelled", "pending"],
        default: "active"
    }
}, { timestamps: true });

const Cart = model("Cart", cartSchema);

export default Cart;