const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { groupService } = require('../services');

const createGroup = catchAsync(async (req, res) => {
  const group = await groupService.createGroup({...req.body, owner: req.user });
  res.status(httpStatus.CREATED).send(group);
});

const getAllMyGroups = catchAsync(async (req, res) => {
    const groups = await groupService.getAllGroupsByUser(req.user);
    res.send(groups);
});

module.exports = {
    createGroup,
    getAllMyGroups
};



