const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Presentation, Slice } = require('../models');
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');

const createPresentation = async (presentationBody) => {
  const presentation = await Presentation.create(presentationBody);
  const slices = await Slice.insertMany([
    {
      heading: 'Slice 1',
      content: 'Content 1',
      type: 'multipleChoice',
      options: [
        {
          name: 'Option 1',
          count: 0,
        },
        {
          name: 'Option 2',
          count: 0,
        },
        {
          name: 'Option 3',
          count: 0,
        },
      ],
    },
  ]);
  presentation.slices = slices;
  await presentation.save();
  return presentation;
};

const getPresentations = async (userId) => {
  return Presentation.find({
    $or: [
      { owner: userId },
      {
        collaborators: userId,
      },
    ],
  });
};

const getPresentation = async (presentationId) => {
  return Presentation.findById(presentationId).populate('slices');
};

const deletePresentation = async (presentationId, userId) => {
  const presentation = await getPresentation(presentationId);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (presentation.owner._id.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
  await presentation.remove();
  return presentation;
};

const updatePresentation = async (presentationId, presentationBody) => {
  const presentation = await getPresentation(presentationId);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  Object.assign(presentation, presentationBody);
  await presentation.save();
  return presentation;
};

const addSlide = async (presentationId, userId) => {
  const presentation = await getPresentation(presentationId);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (
    presentation.owner._id.toString() !== userId.toString() &&
    !presentation.collaborators.includes(mongoose.Types.ObjectId(userId))
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
  const slice = await Slice.create({
    heading: 'New Slice',
    content: 'Content',
    type: null,
    options: [],
  });
  presentation.slices.push(slice);
  await presentation.save();
  return presentation;
};

const deleteSlide = async (presentationId, slideId, userId) => {
  const presentation = await getPresentation(presentationId);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (
    presentation.owner._id.toString() !== userId.toString() &&
    !presentation.collaborators.includes(mongoose.Types.ObjectId(userId))
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
  const slice = await Slice.findById(slideId);
  presentation.slices = presentation.slices.filter((s) => s._id.toString() !== slideId.toString());
  await slice.remove();
  await presentation.save();
  return presentation;
};

const updateSlide = async (presentationId, slideId, slideBody, userId) => {
  const presentation = await getPresentation(presentationId);
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  if (
    presentation.owner._id.toString() !== userId.toString() &&
    !presentation.collaborators.includes(mongoose.Types.ObjectId(userId))
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the owner of this presentation');
  }
  const slice = await Slice.findById(slideId);
  Object.assign(slice, slideBody);
  await slice.save();
  return presentation;
};

const updateSlideOptions = async (slideId, option) => {
  const slide = await Slice.findById(slideId);
  if (!slide) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slide not found');
  }
  slide.options = slide.options.map((opt) => {
    if (opt._id.toString() === option._id.toString()) {
      return option;
    }
    return opt;
  });
  await slide.save();
  return slide;
};

const addAnswer = async (slideId, answer, userId) => {
  const slide = await Slice.findById(slideId);
  if (!slide) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slide not found');
  }
  if (!slide.answers) slide.answers = [];
  if (slide.answers.find((a) => a.user._id.toString() === userId.toString())) {
    return;
  }
  if (userId) {
    const user = await userService.getUserById(userId);
    slide.answers.push({
      user,
      answer: answer.name,
    });
  }
  slide.options = slide.options.map((opt) => {
    if (opt._id.toString() === answer._id.toString()) {
      return {
        _id: opt._id,
        name: opt.name,
        count: opt.count + 1,
      };
    }
    return opt;
  });
  await slide.save();
  return slide;
};

const getPresentationByCode = async (code) => {
  return Presentation.findOne({
    code,
  });
};

const getPresentationCollaborators = async (presentationId, userId) => {
  const presentation = await Presentation.findOne({
    _id: presentationId,
    owner: userId,
  }).populate('collaborators');
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  return presentation.collaborators;
};

const addCollaborator = async (presentationId, collaboratorId, userId) => {
  const presentation = await Presentation.findOne({
    _id: presentationId,
    owner: userId,
  });
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  presentation.collaborators.push(collaboratorId);
  await presentation.save();
  return presentation;
};

const addMultipleCollaborators = async (presentationId, collaboratorIds, userId) => {
  const presentation = await Presentation.findOne({
    _id: presentationId,
    owner: userId,
  });
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  presentation.collaborators = presentation.collaborators.concat(collaboratorIds);
  await presentation.save();
  return presentation;
};

const removeCollaborator = async (presentationId, collaboratorId, userId) => {
  const presentation = await Presentation.findOne({
    _id: presentationId,
    owner: userId,
  });
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  presentation.collaborators = presentation.collaborators.filter(
    (collaborator) => collaborator._id.toString() !== collaboratorId.toString()
  );
  await presentation.save();
  return presentation;
};

module.exports = {
  createPresentation,
  getPresentations,
  getPresentation,
  updatePresentation,
  deletePresentation,
  addSlide,
  deleteSlide,
  updateSlide,
  getPresentationByCode,
  updateSlideOptions,
  getPresentationCollaborators,
  addCollaborator,
  removeCollaborator,
  addMultipleCollaborators,
  addAnswer,
};
