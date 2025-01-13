import { Request, Response } from "express";
import { Logger } from "../utils/logger";
import { BaseResponse } from "../configs/constant";

class crudController {
    protected model;

    constructor(model: any) {
        this.model = model;
    }

    /**
     * Get All Items
     * @route {GET} /api/v1/{model}
     * @param req 
     * @param res 
     * @returns all items
     */
    getAll = async (req: Request, res: Response) => {
        try {
            const existedItem = await this.model.find().lean();
            res.json(new BaseResponse(
                200,
                existedItem,
                'Get all items success'
            ));
        } catch (error: any) {
            res.json(new BaseResponse(
                500,
                null,
                error
            ));
            Logger.error(`Error execute getAll with Request: {GET} ${req.url}`);
            Logger.error(error);
        }
    }

    /**
     * Get Item by ID
     * @route {GET} /api/v1/{model}/{id}
     * @param req 
     * @param res 
     * @returns item by id
     */
    getById = async (req: Request, res: Response) => {
        try {
            const existedItem = await this.model.findById(req.params.id).lean();
            if (!existedItem) {
                return res.json(new BaseResponse(
                    404,
                    null,
                    'Item not found'
                ));
            }
            res.json(new BaseResponse(
                200,
                existedItem,
                'Get by id success'
            ));
        } catch (error: any) {
            res.json(new BaseResponse(
                500,
                null,
                error
            ));
            Logger.error(`Error execute getAll with Request: {GET} ${req.url}`);
            Logger.error(error);
        }
    }

    /**
     * Create new Item
     * @route {POST} /api/v1/{model}
     * @param req 
     * @param res 
     * @returns new item
     */
    create = async (req: Request, res: Response) => {
        try {
            const newItem = await this.model.create(req.body);
            res.json(new BaseResponse(
                201,
                newItem,
                'Create item success'
            ));
        } catch (error: any) {
            res.json(new BaseResponse(
                500,
                null,
                error
            ));
            Logger.error(`Error execute getAll with Request: {POST} ${req.url}`);
            Logger.error(`Error Request body: ${req.body}`);
            Logger.error(error);
        }
    }

    /**
     * Update existed Item
     * @route {PUT} /api/v1/{model}/{id}
     * @param req 
     * @param res 
     * @returns new item
     */
    update = async (req: Request, res: Response) => {
        try {
            const existedItem = await this.model.findById(req.params.id);
            if (!existedItem) {
                return res.json(new BaseResponse(
                    404,
                    null,
                    'Item not found'
                ));
            }
            await existedItem.updateOne(req.body);
            res.json(new BaseResponse(
                200,
                existedItem,
                'Update item success'
            ));
        } catch (error: any) {
            res.json(new BaseResponse(
                500,
                null,
                error
            ));
            Logger.error(`Error execute getAll with Request: {PUT} ${req.url}`);
            Logger.error(`Error Request body: ${req.body}`);
            Logger.error(error);
        }
    }

    /**
     * Delete existed Item
     * @route {DELETE} /api/v1/{model}/{id}
     * @param req 
     * @param res 
     * @returns success message
     */
    delete = async (req: Request, res: Response) => {
        try {
            const existedItem = await this.model.findById(req.params.id);
            if (!existedItem) {
                return res.json(new BaseResponse(
                    404,
                    null,
                    'Item not found'
                ));
            }
            await existedItem.deleteOne();
            res.json(new BaseResponse(
                200,
                null,
                'Item deleted'
            ));
        } catch (error: any) {
            res.json(new BaseResponse(
                500,
                null,
                error
            ));
            Logger.error(`Error execute getAll with Request: {DELETE} ${req.url}`);
            Logger.error(error);
        }
    }
}

export default crudController;