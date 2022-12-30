const redisClient = require('../../config/redis');
const presentationService = require('../../services/presentation.service');

function presentationHandler(socket, io) {
  socket.on('presentation:join', async (data) => {
    const slide = await redisClient.get(data);
    io.emit(`presentation:${data}:slide`, JSON.parse(slide));
  });

  socket.on('presentation:slide', async (data) => {
    await redisClient.set(data.code, JSON.stringify(data.slide));
    io.emit(`presentation:${data.code}:slide`, data.slide);
  });

  socket.on('presentation:updateSlide', async (data) => {
    io.emit(`presentation:${data.code}:updateSlide`, data.data);
  });

  socket.on('presentation:answer', async (data) => {
    const oldSlideJSON = await redisClient.get(data.code);
    const oldSlide = JSON.parse(oldSlideJSON);
    const slide = await presentationService.updateSlideOptions(oldSlide.id, {
      ...data.answer,
      count: data.answer.count + 1,
    });
    await redisClient.set(data.code, JSON.stringify(slide));
    io.emit(`presentation:${data.code}:answer`, slide);
  });
}

module.exports.presentationHandler = presentationHandler;
