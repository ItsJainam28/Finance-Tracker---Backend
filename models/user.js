const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        validate:{
            validator: function(name){
                return name.length >=1
            },
            message: 'First Name must be atleast 2 character long'
        }
    },

    lastname:{
        type: String,
        required: true,
        validate:{
            validator: function(name){
                return name.length >=1
            },
            message: 'Last Name must be atleast 2 character long'
        }
    },

    email:{
        type: String,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        unique: true
    },

    password: {
        type: String,
        required: true,
    
    },

    currency: {
        type: String,
        required: true,
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'INR'], 
      },
    }, {
      timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;