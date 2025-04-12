import { model, Schema } from "mongoose";

const discountSchema = new Schema({
  appliedTo: {
    type: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    default: [],
  },
  code: {
    type: String,
    required: [true, "Discount code is required"],
    unique: true
  },
  percentage: {
    type: Number,
    required: [true, "Discount percentage is required"],
    min: 0,
    max: 100
  },
  expiration_date: {
    type: Date,
    required: [true, "Expiration date is required"]
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Discount = model("Discount", discountSchema);

export default Discount;