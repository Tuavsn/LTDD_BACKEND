import { Request, Response } from 'express';
import crudController from "./common.controller";
import Product from "../models/product.model";
import { Logger } from '../utils/logger';

class ProductController extends crudController {
    constructor() {
        super(Product);
    }

    /**
     * Lấy tất cả sản phẩm với các bộ lọc
     * Các tham số query hỗ trợ:
     * - category: ID của danh mục sản phẩm
     * - minPrice: giá tối thiểu
     * - maxPrice: giá tối đa
     * @route {GET} /api/v1/product
     * @param req Express Request object
     * @param res Express Response object
     * @returns Danh sách sản phẩm thỏa mãn bộ lọc
     */
    getAll = async (req: Request, res: Response) => {
        try {
            const { category, minPrice, maxPrice } = req.query;
            const filter: any = {};

            if (category) {
                filter.category = category;
            }

            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) {
                    filter.price.$gte = Number(minPrice);
                }
                if (maxPrice) {
                    filter.price.$lte = Number(maxPrice);
                }
            }

            const products = await this.model.find(filter)
                .populate('category')
                .lean();

            res.status(200).json(products);
        } catch (error: any) {
            Logger.error(`Error executing getAll with Request: {GET} ${req.url}`);
            Logger.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    };

    /**
     * Tìm kiếm sản phẩm theo tên
     * Tham số query:
     * - q: từ khóa tìm kiếm theo tên sản phẩm
     * @route {GET} /api/v1/product/search
     * @param req Express Request object
     * @param res Express Response object
     * @returns Danh sách sản phẩm có tên trùng khớp với từ khóa
     */
    search = async (req: Request, res: Response) => {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ message: "Query parameter 'q' is required." });
            }

            const products = await this.model.find({ name: { $regex: new RegExp(q as string, "i") } })
                .populate('category')
                .lean();

            res.status(200).json(products);
        } catch (error: any) {
            Logger.error(`Error executing search with Request: {GET} ${req.url}`);
            Logger.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    };

    /**
     * Lấy top 10 sản phẩm bán chạy nhất (sắp xếp theo soldCount giảm dần)
     * @route {GET} /api/v1/product/best-seller
     * @param req Express Request object
     * @param res Express Response object
     * @returns Top 10 sản phẩm bán chạy nhất
     */
    getBestSeller = async (req: Request, res: Response) => {
        try {
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