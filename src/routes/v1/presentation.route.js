const express = require('express');
const { auth } = require('../../middlewares/auth');
const presentationController = require('../../controllers/presentation.controller');

const router = express.Router();

router.route('/join/:code').get(presentationController.joinPresentation);

router.route('/').get(auth(), presentationController.getPresentations);

router.route('/').post(auth(), presentationController.createPresentation);

router.route('/:id/add').post(auth(), presentationController.addSlide);

router.route('/:id/remove/:slideId').delete(auth(), presentationController.deleteSlide);

router.route('/:id/update/:slideId').put(auth(), presentationController.updateSlide);

router.route('/:id/show').get(auth(), presentationController.showPresentation);
router.route('/:id').get(auth(), presentationController.getPresentation);

router.route('/:id').put(auth(), presentationController.updatePresentation);

router.route('/:id').delete(auth(), presentationController.deletePresentation);
module.exports = router;
