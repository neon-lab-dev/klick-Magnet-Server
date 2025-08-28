import imageKit from "../config/imagekit.js"

const uploadImage = (file, fileName, folder) => {
    return new Promise((resolve, reject) => {
        imageKit.upload(
            {
                file,
                fileName,
                folder: folder,
            },
            (err, result) => {
                if (err) {
                    return reject(err.message);
                } else {
                    return resolve(result);
                }
            }
        );
    });
};

const deleteImage = (fileId) => {
    return new Promise((resolve, reject) => {
        imageKit.deleteFile(fileId, (err, result) => {
            if (err) {
                return reject(err.message);
            } else {
                return resolve(result);
            }
        });
    });
};
export {
    uploadImage,
    deleteImage,
};