const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { groupService, invitationService, emailService } = require('../services');

const invite = catchAsync(async (req, res, next) => {
  try {
    const { users, groupId } = req.body;
    const group = await groupService.getGroupById(groupId);
    if (!group) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
    }
    if (group.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this group');
    }
    users.forEach(async (user) => {
      if (group.coOwner.includes(user)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'This user is already a co-owner of this group');
      }
      if (group.members.includes(user)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'This user is already a member of this group');
      }
      const invitation = await invitationService.createInvitation({ group, sender: req.user, receiver: user });
      const url = `http://localhost:3000/invitations/${invitation._id}`;
      await emailService.sendInvitationEmail(user.email, url);
      res.status(httpStatus.CREATED).send(invitation);
    });
  } catch (error) {
    next(error);
  }
});

const exceptInvite = catchAsync(async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const invitation = await invitationService.getInvitationById(invitationId);
    if (!invitation) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Invitation not found');
    }
    if (invitation.receiver._id.toString() !== req.user._id.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not the receiver of this invitation');
    }
    await invitationService.exceptInvite(invitation);
    await groupService.addMember(invitation.group, req.user);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
});

module.exports = {
  invite,
  exceptInvite,
};
