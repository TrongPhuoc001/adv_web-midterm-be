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
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  group: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Group',
  },
  isShowing: {
    type: Boolean,
    default: false,
  },
});

presentationSchema.plugin(toJSON);
presentationSchema.plugin(paginate);

const Presentation = mongoose.model('Presentation', presentationSchema);

module.exports = Presentation;
