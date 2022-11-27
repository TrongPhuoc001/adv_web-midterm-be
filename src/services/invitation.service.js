const { Invitation } = require('../models');

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

module.exports = {
  createInvitation,
  queryInvitations,
  getInvitationById,
};
