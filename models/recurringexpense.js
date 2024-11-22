const mongoose = require('mongoose');

// // Define the schema for the recurring expenses
// {
//     "recurringExpenseId": "String",
//     "userId": "String",
//     "amount": "Decimal",
//     "category": Category,
//     "startDate": "Date",
//     "endDate": "Date", // Optional
//     "frequency": "String", // Values: 'Daily', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'
//     "isActive": "Boolean"
//   }

const recurringExpenseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: false
    },
    frequency: {
        type: String,
        required: true,
        enum: ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Yearly']
    },
    isActive: {
        type: Boolean,
        required: true
    },
    nextExpenseDate: {
        type: Date,
        required: true
    }
});


const RecurringExpense = mongoose.model('RecurringExpense', recurringExpenseSchema);

module.exports = RecurringExpense;

  