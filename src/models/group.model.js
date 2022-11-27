const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');


const groupSchema = mongoose.Schema(
    {
        name: { 
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        owner:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [{ 
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        }],
        coOwner: [{ 
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        }],
    });

groupSchema.plugin(toJSON);
groupSchema.plugin(paginate);


const Group = mongoose.model('Group', groupSchema);

module.exports = Group;