const redisClient = require('../../../../config/redis');
const presentationService = require('../../../../services/presentation.service');

function joinHandler(socket, io) {
  socket.on('presentation:present', async (data) => {
    data.groups.forEach((group) => {
      io.emit(`notify:${group}`, {
        title: 'Presentation started',
        message: `Presentation ${data.presentationName} has started`,
      });
    });
  });
  socket.on('presentation:stop', async (data) => {
    io.emit(`presentation:${data.code}:stop`);
  });
  socket.on('presentation:join', async (data) => {
    const slide = await redisClient.get(data.code);
    const oldchat = await presentationService.getChat(data.code, 0);
    const oldquestion = await presentationService.getQuestion(data.code, 0);
    io.emit(
      `presentation:${data.randomNumber}:oldchat`,
      oldchat.map((message) => {
        return {
          id: message._id,
          message: message.message,
          user: message.user,
          createdAt: message.createdAt,
        };
      })
    );
    io.emit(
      `presentation:${data.randomNumber}:oldquestion`,
      oldquestion.map((question) => {
        return {
          id: question._id,
          question: question.question,
          user: question.user,
          createdAt: question.createdAt,
          upvotes: question.upvotes,
          voted: question.voted,
          answered: question.answered,
        };
      })
    );
    io.emit(`presentation:${data.code}:slide`, JSON.parse(slide));
  });
}

module.exports.joinHandler = joinHandler;
