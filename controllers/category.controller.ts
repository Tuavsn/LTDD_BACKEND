import crudController from "./common.controller";
import Category from "../models/category.model";

class CategoryController extends crudController {
    constructor() {
        super(Category);
    }
}

export default new CategoryController();