import crudController from "./common.controller";
import Notification from "../models/notification.model";

class NotificationController extends crudController {
    constructor() {
        super(Notification);
    }
}

export default new NotificationController();