const { presentationHandler } = require('./handler/presentation.handler');
const logger = require('../config/logger');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info('SOCKET : a user connected');
    presentationHandler(socket, io);
    socket.on('disconnect', () => {
      logger.info('user disconnected');
    });
  });
};

module.exports.initSocket = initSocket;