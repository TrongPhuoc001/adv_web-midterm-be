const express = require('express');
const { auth } = require('../../middlewares/auth');
const groupController = require('../../controllers/group.controller');

const router = express.Router();

router.route('/create-group').post(auth(), groupController.createGroup);

router.route('/get-my-group').get(auth(), groupController.getAllMyGroups);
router.route('/:id').get(auth(), groupController.getGroupById);

router.route('/toggle-open-for-join').post(auth(), groupController.toggleOpenForJoin);

module.exports = router;
