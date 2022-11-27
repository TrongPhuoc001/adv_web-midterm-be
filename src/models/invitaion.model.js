const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const invitationSchema = mongoose.Schema({
  group: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Group',
    required: true,
  },
  sender: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
});

invitationSchema.plugin(toJSON);
invitationSchema.plugin(paginate);

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;
