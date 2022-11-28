const httpStatus = require('http-status');
const { Group } = require('../models');
const ApiError = require('../utils/ApiError');
const userService = require('./user.service');

const createGroup = async (groupBody) => {
  const group = await Group.create(groupBody);
  return group;
};

const queryGroups = async (filter, options) => {
  const groups = await Group.paginate(filter, options);
  return groups;
};

const getGroupById = async (id) => {
  return Group.findById(id).populate('owner').populate('members').populate('coOwner');
};

const getGroupByOwner = async (owner) => {
  return Group.findOne({ owner });
};

const getAllGroupsByUser = async (user) => {
  return Group.find({ $or: [{ owner: user }, { members: user }, { coOwner: user }] });
};

const getMyGroup = async (user) => {
  return Group.find({ owner: user });
};

const getJoinGroup = async (user) => {
  return Group.find({ $or: [{ members: user }, { coOwner: user }] });
};

const addMember = async (group, member) => {
  group.members.push(member);
  await group.save();
  return group;
};

const removeUserFromGroup = async (userId, groupId) => {
  const group = await getGroupById(groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  group.members = group.members.filter((member) => member._id.toString() !== userId.toString());
  group.coOwner = group.coOwner.filter((coOwner) => coOwner._id.toString() !== userId.toString());
  await group.save();
  return user;
};

const joinGroupByCode = async (code, user) => {
  const group = await Group.findOne({ $and: [{ inviteCode: code }, { openForJoin: true }] })
    .populate('owner')
    .populate('members')
    .populate('coOwner');
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }
  if (
    group.members.find((u) => u._id.toString() === user._id.toString()) ||
    group.owner._id.toString() === user._id.toString() ||
    group.coOwner.find((u) => u._id.toString() === user._id.toString())
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already a member of this group');
  }
  group.members.push(user);
  await group.save();
  return group;
};

module.exports = {
  createGroup,
  queryGroups,
  getGroupById,
  getGroupByOwner,
  getAllGroupsByUser,
  getMyGroup,
  getJoinGroup,
  addMember,
  removeUserFromGroup,
  joinGroupByCode,
};
