const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { presentationService } = require('../services');
const redisClient = require('../config/redis');

const requireRole = (presentation, userId) => {
  if (
    presentation.owner.toString() !== userId.toString() &&
    !presentation.collaborators.includes(mongoose.Types.ObjectId(userId))
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner or collaborators of this presentation');
  }
};

const createPresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.createPresentation({ ...req.body, owner: req.user });
  res.status(httpStatus.CREATED).send(presentation);
});

const getPresentations = catchAsync(async (req, res) => {
  const presentations = await presentationService.getPresentations(req.user._id);
  res.send(presentations);
});

const getPresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.getPresentation(req.params.id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  res.send(presentation);
});

const updatePresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.updatePresentation(req.params.id, req.body);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  res.send(presentation);
});

const deletePresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.deletePresentation(req.params.id, req.user._id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  res.send(presentation);
});

const showPresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.getPresentation(req.params.id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  presentation.isShowing = !presentation.isShowing;
  if (!presentation.isShowing) {
    await redisClient.del(presentation.code);
  }
  await presentation.save();
  res.send(presentation);
});

const addSlide = catchAsync(async (req, res) => {
  const presentation = await presentationService.addSlide(req.params.id, req.user._id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  res.send(presentation);
});

const deleteSlide = catchAsync(async (req, res) => {
  const presentation = await presentationService.deleteSlide(req.params.id, req.params.slideId, req.user._id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  res.send(presentation);
});

const updateSlide = catchAsync(async (req, res) => {
  const presentation = await presentationService.updateSlide(req.params.id, req.params.slideId, req.body, req.user._id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  res.send(presentation);
});

const joinPresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.getPresentationByCode(req.params.code);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (!presentation.isShowing) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Presentation is not showing');
  }
  res.send(true);
});

const getPresentationCollaborators = catchAsync(async (req, res) => {
  const collaborators = await presentationService.getPresentationCollaborators(req.params.id, req.user._id);
  res.send(collaborators);
});

const addCollaborator = catchAsync(async (req, res) => {
  const presentation = await presentationService.addCollaborator(req.params.id, req.body.collaboratorId, req.user._id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  res.send(presentation);
});

const addMultipleCollaborators = catchAsync(async (req, res) => {
  const presentation = await presentationService.addMultipleCollaborators(
    req.params.id,
    req.body.collaboratorIds,
    req.user._id
  );
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  const collaborators = await presentationService.getPresentationCollaborators(req.params.id, req.user._id);
  res.send(collaborators);
});

const removeCollaborator = catchAsync(async (req, res) => {
  const presentation = await presentationService.removeCollaborator(req.params.id, req.params.collaboratorId, req.user._id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  requireRole(presentation, req.user._id);
  const collaborators = await presentationService.getPresentationCollaborators(req.params.id, req.user._id);
  res.send(collaborators);
});

module.exports = {
  createPresentation,
  getPresentations,
  getPresentation,
  updatePresentation,
  deletePresentation,
  showPresentation,
  addSlide,
  deleteSlide,
  updateSlide,
  joinPresentation,
  getPresentationCollaborators,
  addCollaborator,
  removeCollaborator,
  addMultipleCollaborators,
};
