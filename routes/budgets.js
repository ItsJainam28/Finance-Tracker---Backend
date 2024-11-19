const express = require('express');
const router = express.Router();
const Budget = require('../models/budget');
const authMiddleware = require('../middleware/auth');
const { default: mongoose } = require('mongoose');

// Add a budget
router.post('/addBudget', authMiddleware, async (req, res) => {
    try {
        const temp_budget = req.body;
        temp_budget.userId = req.user._id;
        temp_budget.amount = parseFloat(req.body.amount);
        temp_budget.startDate = new Date(req.body.startDate);
        temp_budget.endDate = new Date(req.body.endDate);
        const budget = new Budget(temp_budget);
        await budget.save();
        res.status(201).send(budget);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Get all budgets for the current user
router.get('/allBudgets', authMiddleware, async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user._id });
        res.status(200).send(budgets);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a single budget
router.get('/budget/:id', authMiddleware, async (req, res) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
        if (!budget) {
            return res.status(404).send({ error: 'Budget not found' });
        }
        res.status(200).send(budget);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a budget
router.patch('/budget/:id', authMiddleware, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['amount', 'date'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }
        const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
        if (!budget) {
            return res.status(404).send({ error: 'Budget not found' });
        }
        updates.forEach(update => budget[update] = req.body[update]);
        await budget.save();
        res.status(200).send(budget);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a budget
router.delete('/budget/:id', authMiddleware, async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!budget) {
            return res.status(404).send({ error: 'Budget not found' });
        }
        res.status(200).send(budget);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get the current budget based on the current date
router.get('/currentBudget', authMiddleware, async (req, res) => {
    try {
        const currentDate = new Date();
        const budget = await Budget.findOne({ userId: req.user._id, startDate: { $lte: currentDate }, endDate: { $gte: currentDate } });
        if (!budget) {
            return res.status(404).send({ error: 'Budget not found' });
        }
        res.status(200).send(budget);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;