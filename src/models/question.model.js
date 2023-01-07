const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const questionSchema = mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  question: {
    type: String,
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  voted: [
    {
      type: String,
    },
  ],
  answered: {
    type: Boolean,
    default: false,
  },
  presentation: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Presentation',
  },
});

// add plugin that converts mongoose to json
questionSchema.plugin(toJSON);

/**
 * @typedef Question
 */
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
