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

router.route('/:id/collaborators').get(auth(), presentationController.getPresentationCollaborators);

router.route('/:id/collaborators/add').post(auth(), presentationController.addCollaborator);

router.route('/:id/collaborators/add-multi').post(auth(), presentationController.addMultipleCollaborators);

router.route('/:id/collaborators/remove/:collaboratorId').delete(auth(), presentationController.removeCollaborator);

router.route('/:id/show').get(auth(), presentationController.showPresentation);
router.route('/:id/show-in-group').post(auth(), presentationController.showPresentationInGroup);
router.route('/:id').get(auth(), presentationController.getPresentation);

router.route('/:id').put(auth(), presentationController.updatePresentation);

router.route('/:id').delete(auth(), presentationController.deletePresentation);
module.exports = router;
