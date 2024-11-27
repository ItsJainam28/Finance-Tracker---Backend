const moment = require('moment');
const  RecurringExpense  = require('../models/recurringexpense');
const  Expense  = require('../models/expense');
/**
 * Calculate the next expense date.
 * @param {Date} startDate - The start date of the recurring expense.
 * @param {string} frequency - Frequency of the recurrence ('Daily', 'Weekly', 'Biweekly', 'Monthly', 'Yearly').
 * @param {Date} [currentDate=new Date()] - The current date to calculate from.
 * @param {Date} lastExpenseDate - The last expense date.
 * @returns {Date|null} The next occurrence date or null if no valid frequency is provided.
 */
function calculateNextExpenseDate(startDate, frequency,  lastExpenseDate, currentDate = new Date()) {
    const start = moment(startDate).utc(); // Convert startDate to Moment
    const current = moment(currentDate).utc(); // Convert currentDate to Moment
    const lastExpense = moment(lastExpenseDate).utc(); // Convert lastExpenseDate to Moment

    // Ensure we calculate from the latest occurrence
    if (current.isBefore(start, 'day')) return start.toDate();

    // Calculate the next occurrence based on frequency
    let nextDate;
    switch (frequency) {
        case 'Daily':
            nextDate = lastExpense.clone().add(1, 'days');
            break;
        case 'Weekly':
            nextDate = lastExpense.clone().add(1, 'weeks');
            break;
        case 'Biweekly':
            nextDate = lastExpense.clone().add(2, 'weeks');
            break;
        case 'Monthly':
            nextDate = lastExpense.clone().add(1, 'months');
            break;
        case 'Yearly':
            nextDate = lastExpense.clone().add(1, 'years');
            break;
        default:
            throw new Error(`Unknown frequency: ${frequency}`);
    }

    // For Monthly/Yearly, ensure the same day of the month or fallback to the last valid day
    if (['Monthly', 'Yearly'].includes(frequency)) {
        const desiredDay = start.date(); // Day of the start date
        const daysInMonth = nextDate.daysInMonth();

        // If the desired day is not possible in the new month, use the last day of the month
        if (desiredDay > daysInMonth) {
            nextDate.date(daysInMonth);
        } else {
            nextDate.date(desiredDay);
        }
    }

    // Return the next occurrence date
    return nextDate.toDate();
}

// // Test case
// const startDate = new Date('2024-01-30'); // Start date
// const frequency = 'Monthly'; // Frequency
// const currentDate = new Date('2024-02-15'); // Current date
// const lastExpenseDate = startDate; // Last expense date

// const nextDate = calculateNextExpenseDate(startDate, frequency, currentDate, lastExpenseDate);
// console.log('Next Expense Date:', nextDate); // Output should be 2024-02-29

async function makeExpense(recurringExpense) {
    try {
        if (!recurringExpense.isActive) {
            return;
        }

        // Process all missed expenses
        while (moment(recurringExpense.nextExpenseDate).utc().isBefore(moment().utc())) {
            const newExpense = new Expense({
                amount: recurringExpense.amount,
                date: recurringExpense.nextExpenseDate,
                userId: recurringExpense.userId,
                category: recurringExpense.category,
                isReccuring: true
            });
            await newExpense.save();
            
            recurringExpense.nextExpenseDate = calculateNextExpenseDate(
                recurringExpense.startDate, 
                recurringExpense.frequency, 
                recurringExpense.nextExpenseDate
            );
            await recurringExpense.save();  
        }

        // Process current day's expense
        if (moment(recurringExpense.nextExpenseDate).utc().isSame(moment().utc())) {
            const newExpense = new Expense({
                amount: recurringExpense.amount,
                date: recurringExpense.nextExpenseDate,
                userId: recurringExpense.userId,
                category: recurringExpense.category,
                isReccuring: true
            });
            await newExpense.save();
            
            recurringExpense.nextExpenseDate = calculateNextExpenseDate(
                recurringExpense.startDate, 
                recurringExpense.frequency, 
                recurringExpense.nextExpenseDate
            );
            await recurringExpense.save();

            return newExpense;
        }

        return;
    } catch (error) {
        console.error('Error processing recurring expense:', error);
        throw error;
    }
}

async function processRecurringPayments() {
    try {
      // Find all active recurring expenses
      const recurringExpenses = await RecurringExpense.find({ isActive: true });
  
      for (const recurringExpense of recurringExpenses) {
        await makeExpense(recurringExpense);
      }
  
      console.log(`Processed recurring expenses at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Error processing recurring expenses:', error);
    }
  }

module.exports = { calculateNextExpenseDate, makeExpense, processRecurringPayments };

