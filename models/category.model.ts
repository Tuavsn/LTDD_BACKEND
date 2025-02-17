import { model, Schema } from "mongoose";

const categorySchema = new Schema ({
    name: {
        type: String,
        required: [true, "Product name is required"],
    },
    slug: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
}, { timestamps: true });

const Category = model("Category", categorySchema);

export default Category;