const express = require('express');
const { auth } = require('../../middlewares/auth');
const invitationController = require('../../controllers/invitation.controller');

const router = express.Router();

router.route('/').post(auth(), invitationController.invite);
router.route('/accepted/:invitationId').get(auth(), invitationController.exceptInvite);

module.exports = router;
