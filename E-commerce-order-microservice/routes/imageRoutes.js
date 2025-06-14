const express = require('express');
const { streamImageByFilename } = require('../controllers/imageController');

const router = express.Router();


router.get('/uploads/:filename', streamImageByFilename);

module.exports = router;
