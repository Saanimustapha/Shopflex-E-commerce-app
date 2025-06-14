const mongoose = require('mongoose');


const mongoURI = process.env.MONGO_URI_PRODUCT;


const conn = mongoose.createConnection(mongoURI);


let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
});

/**
 * Streams an image file by filename.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
 
const streamImageByFilename = async (req, res) => {
  try {
    const { filename } = req.params;


    const files = await gfs.find({ filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }


    const readStream = gfs.openDownloadStreamByName(filename);
    readStream.on('error', (error) => {
      res.status(500).json({ message: 'Error streaming file', error: error.message });
    });
    readStream.pipe(res);
  } catch (err) {
    console.error('Error streaming file:', err);
    res.status(500).json({ message: 'Failed to fetch file', error: err.message });
  }
};

module.exports = {
  streamImageByFilename,
};
