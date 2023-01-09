const { chatHandler } = require('./handler/chat.handler');
const { joinHandler } = require('./handler/join.handler');
const { questionHandler } = require('./handler/question.handler');
const { slideHandler } = require('./handler/slide.handler');

function presentationHandler(socket, io) {
  joinHandler(socket, io);

  slideHandler(socket, io);

  chatHandler(socket, io);

  questionHandler(socket, io);
}

module.exports.presentationHandler = presentationHandler;
