const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { presentationService } = require('../services');
const redisClient = require('../config/redis');

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
  if (presentation.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
  res.send(presentation);
});

const updatePresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.updatePresentation(req.params.id, req.body);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (presentation.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
  res.send(presentation);
});

const deletePresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.deletePresentation(req.params.id, req.user._id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (presentation.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
  res.send(presentation);
});

const showPresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.getPresentation(req.params.id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (presentation.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
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
  if (presentation.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
  res.send(presentation);
});

const deleteSlide = catchAsync(async (req, res) => {
  const presentation = await presentationService.deleteSlide(req.params.id, req.params.slideId, req.user._id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (presentation.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
  res.send(presentation);
});

const updateSlide = catchAsync(async (req, res) => {
  const presentation = await presentationService.updateSlide(req.params.id, req.params.slideId, req.body, req.user._id);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (presentation.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
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
};
