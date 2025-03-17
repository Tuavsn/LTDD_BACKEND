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
            res.status(200).json(existedItem);
        } catch (error: any) {
            res.status(500).json({ message: "Internal Server Error" });
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
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(200).json(existedItem);
        } catch (error: any) {
            res.status(500).json({ message: "Internal Server Error" });
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
            const isArray = Array.isArray(req.body);
            const newItems = isArray 
                ? await this.model.insertMany(req.body) 
                : await this.model.create(req.body);
            res.json(new BaseResponse(
                201,
                newItems,
                isArray ? 'Create multiple items success' : 'Create item success'
            ));
        } catch (error: any) {
            res.json(new BaseResponse(
                500,
                null,
                error.message || 'Internal Server Error'
            ));
            Logger.error(`Error execute create with Request: {POST} ${req.url}`);
            Logger.error(`Error Request body: ${JSON.stringify(req.body)}`);
            Logger.error(error);
        }
    };
    

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
                return res.status(404).json({ message: 'Item not found' });
            }
            await existedItem.updateOne(req.body);
            res.json(new BaseResponse(
                200,
                existedItem,
                'Update item success'
            ));
        } catch (error: any) {
            res.status(500).json({ message: "Internal Server Error" });
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
                return res.status(404).json({ message: 'Item not found' });
            }
            await existedItem.deleteOne();
            res.status(200).json({ message: 'Item deleted' });
        } catch (error: any) {
            res.status(500).json({ message: "Internal Server Error" });
            Logger.error(`Error execute getAll with Request: {DELETE} ${req.url}`);
            Logger.error(error);
        }
    }
}

export default crudController;