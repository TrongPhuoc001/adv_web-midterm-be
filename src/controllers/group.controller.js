const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { groupService } = require('../services');

const createGroup = catchAsync(async (req, res) => {
  const group = await groupService.createGroup({ ...req.body, owner: req.user });
  res.status(httpStatus.CREATED).send(group);
});

const getAllMyGroups = catchAsync(async (req, res) => {
  const myGroups = await groupService.getMyGroup(req.user);
  const joinGroups = await groupService.getJoinGroup(req.user);
  res.send({ myGroups, joinGroups });
});

const getGroupById = catchAsync(async (req, res) => {
  const group = await groupService.getGroupById(req.params.id);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }
  res.send(group);
});

const toggleOpenForJoin = catchAsync(async (req, res) => {
  const group = await groupService.getGroupById(req.body.groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }
  if (group.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this group');
  }
  group.openForJoin = !group.openForJoin;
  await group.save();
  res.send(group);
});

module.exports = {
  createGroup,
  getAllMyGroups,
  getGroupById,
  toggleOpenForJoin,
};
