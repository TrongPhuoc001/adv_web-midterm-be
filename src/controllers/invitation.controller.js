const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const { groupService, invitationService, emailService, userService } = require('../services');

const invite = catchAsync(async (req, res, next) => {
  try {
    const { users, groupId } = req.body;
    const group = await groupService.getGroupById(groupId);
    if (!group) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
    }
    if (group.owner._id.toString() !== req.user._id.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this group');
    }
    users.forEach(async (userId) => {
      const user = await userService.getUserById(userId);
      if (group.coOwner.includes(user)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'This user is already a co-owner of this group');
      }
      if (group.members.includes(user)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'This user is already a member of this group');
      }
      const invitation = await invitationService.createInvitation({ group, sender: req.user, receiver: user });
      const url = `${config.frontend.host}/invitations/${invitation._id}`;
      await emailService.sendInvitationEmail(user.email, url);
    });
    res.status(httpStatus.CREATED).send();
  } catch (error) {
    next(error);
  }
});

const exceptInvite = catchAsync(async (req, res) => {
  const { invitationId } = req.params;
  const invitation = await invitationService.exceptInvite(invitationId, req.user);
  const group = await groupService.addMember(invitation.group, req.user);
  res.send(group);
});

module.exports = {
  invite,
  exceptInvite,
};
