const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const authMiddleware = require('../middleware/auth');
const Category = require('../models/category');
const { default: mongoose } = require('mongoose');

// Add an expense
router.post('/addExpense', authMiddleware, async (req, res) => {
    try {
        // console.log(req.body);
        const temp_expense = req.body;
        temp_expense.userId = req.user._id;
       
        //Convert the req.body.category to a category id with type ObjectId - I am getting category id from the category 
        //name that is passed in the request body
        temp_expense.categoryId = new mongoose.Types.ObjectId(req.body.category);
        // console.log(temp_expense.categoryId);
        temp_expense.amount = parseFloat(req.body.amount);
        // console.log(temp_expense);
        temp_expense.date = new Date(req.body.date);
        if(req.body.isReccuring === 'true'){
            temp_expense.isReccuring = true;
        }else{
            temp_expense.isReccuring = false;
        }
        const expense = new Expense(temp_expense);
        await expense.save();
        res.status(201).send(expense);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Get all expenses for the current user
router.get('/allExpenses', authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id });
        res.status(200).send(expenses);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a single expense
router.get('/expense/:id', authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
        if (!expense) {
            return res.status(404).send({ error: 'Expense not found' });
        }
        res.status(200).send(expense);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update an expense
router.patch('/expense/:id', authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
        if (!expense) {
            return res.status(404).send({ error: 'Expense not found' });
        }
        Object.keys(req.body).forEach(update => expense[update] = req.body[update]);
        await expense.save();
        res.status(200).send(expense);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete an expense
router.delete('/expense/:id', authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!expense) {
            return res.status(404).send({ error: 'Expense not found' });
        }
        res.status(200).send(expense);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get expenses by category
router.get('/expensesByCategory/:category', authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id, category: req.params.category });
        res.status(200).send(expenses);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get expenses by date
router.get('/expensesByDate/:date', authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id, date: req.params.date });
        res.status(200).send(expenses);
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;
