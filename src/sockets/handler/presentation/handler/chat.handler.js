const presentationService = require('../../../../services/presentation.service');

function chatHandler(socket, io) {
  socket.on('presentation:chat', async (data) => {
    const chat = await presentationService.addMessage(data.code, data.message, data.userId);
    io.emit(`presentation:${data.code}:chat`, {
      id: chat._id,
      message: chat.message,
      user: chat.user,
      createdAt: chat.createdAt,
    });
  });
  socket.on('presentation:oldchat', async (data) => {
    const oldchat = await presentationService.getChat(data.code, data.page);
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
  });
}

module.exports.chatHandler = chatHandler;
