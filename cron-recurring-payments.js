const cron = require('node-cron');
const {processRecurringPayments} = require('./utils/recurring_expense_utils');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI) 
    .then(() =>console.log("Connected to MongoDB"))
    .catch(err => console.error("Connection error:", err));
// For testing purposes, we will run the cron job every minute to check for recurring expenses

const recurringExpensesCron = cron.schedule('* * * * *', async () => {

    console.log(`Recurring Expenses Cron Job Started at ${new Date().toISOString()}`);
      mongoose.connection.on('connected', () => {
        console.log('Database connected successfully')});
    try {
        const startTime = Date.now();
        
        // Process recurring payments
        await processRecurringPayments();
        
        const duration = Date.now() - startTime;
        console.log(`Recurring Expenses Cron Job Completed. Duration: ${duration}ms`);
    } catch (error) {
        console.error('Critical error in recurring expenses cron job:', error);
    }
}, {
    scheduled: true,
    timezone: "UTC"
});

// Error handling for cron job
recurringExpensesCron.on('error', (err) => {
    console.error('Recurring Expenses Cron Job Error:', err);
});

// Start the cron job
recurringExpensesCron.start();

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down recurring expenses cron job...');
    recurringExpensesCron.stop();
});

module.exports = {
    recurringExpensesCron
};