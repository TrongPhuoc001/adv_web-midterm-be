const httpStatus = require('http-status');
const { Invitation } = require('../models');
const ApiError = require('../utils/ApiError');

const createInvitation = async (invitationBody) => {
  const invitation = await Invitation.create(invitationBody);
  return invitation;
};

const queryInvitations = async (filter, options) => {
  const invitations = await Invitation.paginate(filter, options);
  return invitations;
};

const getInvitationById = async (id) => {
  return Invitation.findOne({ _id: id }).populate('group').populate('sender').populate('receiver');
};
const exceptInvite = async (invitationId, user) => {
  const invitation = await Invitation.findOne({ $and: [{ _id: invitationId }, { status: 'pending' }] })
    .populate('group')
    .populate('sender')
    .populate('receiver');
  if (!invitation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invitation not found');
  }
  if (invitation.receiver._id.toString() !== user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the receiver of this invitation');
  }
  invitation.status = 'accepted';
  await invitation.save();
  return invitation;
};
module.exports = {
  createInvitation,
  queryInvitations,
  getInvitationById,
  exceptInvite,
};
