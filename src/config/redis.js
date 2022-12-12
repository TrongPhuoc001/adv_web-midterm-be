const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
  url: 'rediss://red-cebiuqmn6mphc8o2hd5g:I4DhuTDwtWBRmtPiSkn1gYL2mnbZ6IHz@singapore-redis.render.com:6379',
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Something went wrong ' + err);
});

module.exports = redisClient;
