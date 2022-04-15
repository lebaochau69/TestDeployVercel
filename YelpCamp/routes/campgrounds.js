const express     = require('express');
const multer      = require('multer');
const router      = express.Router();
const catchAsync  = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');
const { storage } = require('../cloudinary');
const upload      = multer({ storage });

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.route('/')
      .get(catchAsync(campgrounds.index))
      .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
      

router.route('/new')
      .get(isLoggedIn, campgrounds.renderNewForm)
      
router.route('/:id')
      .get(catchAsync(campgrounds.showCampground))
      .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
      .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.route('/:id/edit')
      .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;