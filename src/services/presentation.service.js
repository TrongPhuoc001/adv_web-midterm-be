const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Presentation, Slice, Message, Question } = require('../models');
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
  return Presentation.findById(presentationId).populate({
    path: 'slices',
    populate: {
      path: 'answers.user',
      select: 'name email ',
    },
  });
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
// collaborator management

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

// slide management

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
  if (userId) {
    if (slide.answers.find((a) => a.user._id.toString() === userId.toString())) {
      return;
    }
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

// chat management

const addMessage = async (presentationCode, messageBody, userId) => {
  const presentation = await Presentation.findOne({ code: presentationCode });
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  let message = {};
  if (userId && userId !== 1) {
    const user = await userService.getUserById(userId);
    message = await Message.create({
      user,
      message: messageBody,
    });
  } else {
    message = await Message.create({
      message: messageBody,
    });
  }
  message.presentation = presentation._id;
  await message.save();
  return message;
};

const getChat = async (presentationCode, page) => {
  const presentation = await Presentation.findOne({ code: presentationCode });
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  const chats = await Message.find(
    {
      presentation: presentation._id,
    },
    null,
    {
      sort: { createdAt: -1 },
    }
  )
    .populate('user')
    .skip(page * 5)
    .limit(5);
  return chats;
};

// question management

const addQuestion = async (presenationCode, questionBody, userId) => {
  const presentation = await Presentation.findOne({ code: presenationCode });
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  let question = {};
  if (userId && userId !== 1) {
    const user = await userService.getUserById(userId);
    question = await Question.create({
      user,
      question: questionBody,
    });
  } else {
    question = await Question.create({
      question: questionBody,
    });
  }
  question.presentation = presentation._id;
  await question.save();
  return question;
};

const getQuestion = async (presentationCode, page) => {
  const presentation = await Presentation.findOne({ code: presentationCode });
  if (!presentation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Presentation not found');
  }
  const questions = await Question.find(
    {
      presentation: presentation._id,
    },
    null,
    {
      sort: { upvotes: -1, answered: -1 },
    }
  )
    .populate('user')
    .skip(page * 5)
    .limit(5);
  return questions;
};

const voteQuestion = async (questionId, userId, randomNumber) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Question not found');
  }
  if (!question.voted) {
    question.voted = [];
  }
  if (userId) {
    if (question.voted.includes(userId)) {
      question.voted = question.voted.filter((u) => u.toString() !== userId.toString());
      question.upvotes -= 1;
    } else {
      question.voted.push(userId);
      question.upvotes += 1;
    }
  } else if (question.voted.includes(randomNumber)) {
    question.voted = question.voted.filter((u) => u.toString() !== randomNumber.toString());
    question.upvotes -= 1;
  } else {
    question.voted.push(randomNumber);
    question.upvotes += 1;
  }
  await question.save();
  return question;
};
const answeredQuestion = async (questionId) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Question not found');
  }
  question.answered = true;
  await question.save();
  return question;
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
  addMessage,
  getChat,
  addQuestion,
  getQuestion,
  voteQuestion,
  answeredQuestion,
};
