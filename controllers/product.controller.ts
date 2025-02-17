import { Request, Response } from 'express';
import crudController from "./common.controller";
import Product from "../models/product.model";
import { BaseResponse } from '../configs/constant';
import { Logger } from '../utils/logger';

class ProductController extends crudController {
    constructor() {
        super(Product);
    }

    /**
     * Lấy tất cả sản phẩm với thông tin category được populate
     * @route {GET} /api/v1/product
     * @param req Express Request object
     * @param res Express Response object
     * @returns Danh sách sản phẩm có thông tin category đầy đủ
     */
    getAll = async (req: Request, res: Response) => {
        try {
            const existedItem = await this.model.find()
                .populate('category') // Populate thông tin danh mục thay vì chỉ lấy id
                .lean();
            res.status(200).json(existedItem);
        } catch (error: any) {
            Logger.error(`Error executing getAll with Request: {GET} ${req.url}`);
            Logger.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    /**
     * Lấy top 10 sản phẩm bán chạy nhất (sắp xếp theo trường "sales" giảm dần)
     * @route {GET} /api/v1/product/best-seller
     * @param req Express Request object
     * @param res Express Response object
     * @returns Top 10 sản phẩm bán chạy nhất
     */
    getBestSeller = async (req: Request, res: Response) => {
        try {
            // Sắp xếp theo sales giảm dần và giới hạn kết quả 10 sản phẩm
            const bestSellerProducts = await this.model.find()
                .populate('category')
                .sort({ soldCount: -1 })
                .limit(10)
                .lean();
            res.status(200).json(bestSellerProducts);
        } catch (error: any) {
            Logger.error(`Error executing getBestSeller with Request: {GET} ${req.url}`);
            Logger.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export default new ProductController();
