const presentationService = require('../../../../services/presentation.service');

function questionHandler(socket, io) {
  socket.on('presentation:question', async (data) => {
    const question = await presentationService.addQuestion(data.code, data.question, data.userId);
    io.emit(`presentation:${data.code}:question`, {
      id: question._id,
      question: question.question,
      user: question.user,
      createdAt: question.createdAt,
      upvotes: question.upvotes,
      answered: question.answered,
      voted: question.voted,
    });
  });
  socket.on('presentation:vote', async (data) => {
    const question = await presentationService.voteQuestion(data.questionId, data.userId, data.randomNumber);
    io.emit(`presentation:${data.code}:upvotequestion`, {
      id: question._id,
      question: question.question,
      user: question.user,
      createdAt: question.createdAt,
      upvotes: question.upvotes,
      voted: question.voted,
      answered: question.answered,
    });
  });
  socket.on('presentation:question:answered', async (data) => {
    const question = await presentationService.answeredQuestion(data.questionId);
    io.emit(`presentation:${data.code}:upvotequestion`, {
      id: question._id,
      question: question.question,
      user: question.user,
      createdAt: question.createdAt,
      upvotes: question.upvotes,
      voted: question.voted,
      answered: question.answered,
    });
  });
  socket.on('presentation:oldquestion', async (data) => {
    const oldquestion = await presentationService.getQuestion(data.code, data.page);
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
  });
}

module.exports.questionHandler = questionHandler;
