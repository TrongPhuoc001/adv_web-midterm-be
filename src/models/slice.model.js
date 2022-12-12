const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const sliceSchema = mongoose.Schema({
  type: {
    type: String,
    trim: true,
    nullAllowed: true,
    enum: ['multipleChoice', 'heading', 'paragragh', null],
  },
  heading: {
    type: String,
    trim: true,
  },
  subHeading: {
    type: String,
  },
  content: {
    type: String,
  },
  options: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  ],
});

sliceSchema.plugin(toJSON);
sliceSchema.plugin(paginate);

const Slice = mongoose.model('Slice', sliceSchema);

module.exports = Slice;
