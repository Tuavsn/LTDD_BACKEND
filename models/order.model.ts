import { model, Schema } from "mongoose";

const cartSchema = new Schema ({
    items: {
        type: Array,
        required: [true, "Items is required"],
        default: []
    },
    items_count: {
        type: Number,
        default: 0
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"]
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