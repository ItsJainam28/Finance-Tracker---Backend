const express = require('express');
const router = express.Router();
const RecurringExpense = require('../models/recurringexpense');
const authMiddleware = require('../middleware/auth');
const { default: mongoose } = require('mongoose');

// Add a recurring expense

router.post('/addRecurringExpense', authMiddleware, async (req, res) => {
    try {
        const temp_recurringexpense = req.body;
        temp_recurringexpense.userId = req.user._id;
        temp_recurringexpense.category = new mongoose.Types.ObjectId(req.body.category);
        temp_recurringexpense.amount = parseFloat(req.body.amount);
        temp_recurringexpense.startDate = new Date(req.body.startDate);
        if(req.body.endDate === ''){
            temp_recurringexpense.endDate = null;
        } else{
            temp_recurringexpense.endDate = new Date(req.body.endDate);
        }
        if(req.body.isActive === 'true'){
            temp_recurringexpense.isActive = true;
        } else{
            temp_recurringexpense.isActive = false;
        }
        const recurringexpense = new RecurringExpense(temp_recurringexpense);
        await recurringexpense.save();
        res.status(201).send(recurringexpense);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Get all recurring expenses for the current user
router.get('/allRecurringExpenses', authMiddleware, async (req, res) => {
    try {
        const recurringexpenses = await RecurringExpense.find({ userId: req.user._id });
        res.status(200).send(recurringexpenses);
    } catch (error) {
        res.status(500).send(error);
    }
});


// Get a single recurring expense
router.get('/recurringexpense/:id', authMiddleware, async (req, res) => {
    try {
        const recurringexpense = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user._id });
        if (!recurringexpense) {
            return res.status(404).send({ error: 'Recurring Expense not found' });
        }
        res.status(200).send(recurringexpense);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a recurring expense
router.patch('/recurringexpense/:id', authMiddleware, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['amount', 'date'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }
        const recurringexpense = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user._id });
        if (!recurringexpense) {
            return res.status(404).send({ error: 'Recurring Expense not found' });
        }
        updates.forEach(update => recurringexpense[update] = req.body[update]);
        await recurringexpense.save();
        res.status(200).send(recurringexpense);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a recurring expense
router.delete('/recurringexpense/:id', authMiddleware, async (req, res) => {
    try {
        const recurringexpense = await RecurringExpense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!recurringexpense) {
            return res.status(404).send({ error: 'Recurring Expense not found' });
        }
        res.status(200).send(recurringexpense);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router; // Export router to use in index.js
