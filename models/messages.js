const mongoose = require('mongoose');

// User Schema
const MessagesSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    created: {
        type: String,
        required: true
    },
    updated: {
        type: String,
        required: false
    }
});

const Message = mongoose.model('Message', MessagesSchema);
module.exports = Message;