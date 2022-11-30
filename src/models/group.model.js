const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const groupSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  coOwner: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  inviteCode: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    default: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  },
  openForJoin: { 
    type: Boolean,
    default: false,
  },
});

groupSchema.plugin(toJSON);
groupSchema.plugin(paginate);

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
