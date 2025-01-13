import User from "../models/user.model";
import crudController from "./common.controller";

class UserController extends crudController {
    constructor() {
        super(User);
    }
}

export default new UserController();