const httpStatus = require('http-status');
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
  if (
    !group.members.find((u) => u._id.toString() === req.user._id.toString()) &&
    !group.coOwner.find((u) => u._id.toString() === req.user._id.toString()) &&
    group.owner._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not a member of this group');
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

const removeUserFromGroup = catchAsync(async (req, res) => {
  const group = await groupService.getGroupById(req.body.groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }
  if (group.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this group');
  }
  const user = await groupService.removeUserFromGroup(req.body.userId, req.body.groupId);
  res.send(user);
});

const joinGroupByCode = catchAsync(async (req, res) => {
  const group = await groupService.joinGroupByCode(req.body.code, req.user);
  res.send(group);
});

const setCoOwner = catchAsync(async(req, res) =>{
  const user = req.user;
  const { userId, groupId } = req.body;
  const group = await groupService.setCoOwner(userId, groupId, user);
  res.send(group);
} );

const setMember = catchAsync(async(req, res) =>{
  const user = req.user;
  const { userId, groupId } = req.body;
  const group = await groupService.setMember(userId, groupId, user);
  res.send(group);
});


module.exports = {
  createGroup,
  getAllMyGroups,
  getGroupById,
  toggleOpenForJoin,
  removeUserFromGroup,
  joinGroupByCode,
  setCoOwner,
  setMember,
};
