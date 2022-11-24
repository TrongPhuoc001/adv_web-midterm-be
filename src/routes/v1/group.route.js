const express = require('express');
const auth = require('../../middlewares/auth');
const groupController = require('../../controllers/group.controller');


const router = express.Router();

router
    .route('/create-group')
    .post(auth(), groupController.createGroup);
    
router
    .route('/get-my-group')
    .get(auth(), groupController.getAllMyGroups);

module.exports = router;