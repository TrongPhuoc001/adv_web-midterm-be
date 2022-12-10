const httpStatus = require('http-status');
const { Presentation, Slice } = require('../models');
const ApiError = require('../utils/ApiError');

const createPresentation = async (presentationBody) => {
  const presentation = await Presentation.create(presentationBody);
  return presentation;
};

module.exports = {
  createPresentation,
};
