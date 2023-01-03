/* eslint-disable object-shorthand */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const presentationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    default: function () {
      return parseInt(Math.floor(Math.random() * 99999999), 10).toString();
    },
  },
  slices: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Slice',
      required: true,
    },
  ],
  chats: [
    {
      user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
      message: {
        type: String,
        required: true,
      },
    },
  ],
  questions: [
    {
      user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
      question: {
        type: String,
        required: true,
      },
      upvotes: {
        type: Number,
        default: 0,
      },
      answered: {
        type: Boolean,
        default: false,
      },
    },
  ],
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
  ],
  isShowing: {
    type: Boolean,
    default: false,
  },
  isShowInGroup: {
    type: Boolean,
    default: false,
  },
});

presentationSchema.plugin(toJSON);
presentationSchema.plugin(paginate);

const Presentation = mongoose.model('Presentation', presentationSchema);

module.exports = Presentation;
