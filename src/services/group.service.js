
const httpStatus = require('http-status');
const { Group } = require('../models');
const ApiError = require('../utils/ApiError');


const createGroup = async (groupBody) => {
  const group = await Group.create(groupBody);
  return group;
}

const queryGroups = async (filter, options) => {
  const groups = await Group.paginate(filter, options);
  return groups;
}

const getGroupById = async (id) => {
    return Group.findById(id ).populate('owner').populate('members').populate('coOwner');
}

const getGroupByOwner = async (owner) => {
    return Group.findOne({ owner });
}

const getAllGroupsByUser = async (user) => {
    return Group.find( { $or: [ { owner: user }, { members: user }, { coOwner: user } ] } );
}

const getMyGroup = async (user) => {
  return Group.find({owner: user});
}

const getJoinGroup = async (user) => {
  return Group.find( { $or: [{ members: user }, { coOwner: user } ] } );
}


module.exports = {
  createGroup,
  queryGroups,
  getGroupById,
  getGroupByOwner,
  getAllGroupsByUser,
  getMyGroup,
  getJoinGroup
}



