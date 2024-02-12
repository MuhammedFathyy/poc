const mongoose = require("mongoose");


const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please enter name"]
        },
        file: {
            type: String,
            required: [true, "please enter a file"]
        }
    }
)

const User = mongoose.model('User', userSchema);
module.exports = User;