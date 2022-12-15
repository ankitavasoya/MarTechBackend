import * as multer from 'multer';
import * as path from 'path';
import AppError from './appError';

// for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/uploads')
  },
  filename: function (req: any, file: any, cb: any) {
    const filetypes = /csv/;
    const extname = path.extname(file.originalname).split('.')[1];
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, `${new Date().getTime()}.${extname}`);
    }
    cb(new AppError('Error: Allowed csv files only!', 400));
  }
});

export const uploadFiles = multer({ storage: storage });

