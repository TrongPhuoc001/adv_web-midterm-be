const express = require('express');
const { auth } = require('../../middlewares/auth');
const groupController = require('../../controllers/group.controller');

const router = express.Router();

router.route('/create-group').post(auth(), groupController.createGroup);
router.route('/toggle-open-for-join').post(auth(), groupController.toggleOpenForJoin);
router.route('/get-my-group').get(auth(), groupController.getAllMyGroups);
router.route('/remove-user-from-group').post(auth(), groupController.removeUserFromGroup);
router.route('/join-group-by-code').post(auth(), groupController.joinGroupByCode);
router.route('/:id').get(auth(), groupController.getGroupById);

module.exports = router;
