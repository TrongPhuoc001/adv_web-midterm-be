const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { presentationService } = require('../services');

const createPresentation = catchAsync(async (req, res) => {
  const presentation = await presentationService.createPresentation({ ...req.body, owner: req.user });
  res.status(httpStatus.CREATED).send(presentation);
});

module.exports = {
  createPresentation,
};
