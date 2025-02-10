import path from "path";
import fs from "fs";
import { Logger } from "../utils/logger";
import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

class UploadController {
  static async uploadImage(req: Request, res: Response) {
    // const buffer = req.body as Buffer;
    // if (!buffer || !Buffer.isBuffer(buffer)) {
    //   res.status(400).json({ error: 'Không có dữ liệu ảnh hợp lệ' });
    //   return;
    // }

    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: 'Không có ảnh được gửi lên' });
      return;
    }

    // Nếu chuỗi có prefix dạng "data:image/xxx;base64,", loại bỏ nó:
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = path.join(__dirname, 'uploads', `${Date.now()}.jpg`);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Lưu ảnh thất bại' });
      }

      cloudinary.uploader.upload(filePath, (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Upload ảnh lên Cloudinary thất bại' });
        }

        res.json({ url: result?.secure_url, message: "Upload ảnh thành công" });

        fs.rmSync(filePath);
      });

    });
  };

}

export default UploadController;