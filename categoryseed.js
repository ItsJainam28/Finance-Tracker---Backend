const category = require('./models/category');
const mongoose = require('mongoose');
require('dotenv').config(); 
const seedCategories = async () => {
    try {
        const categories = [
            { name: 'Groceries' },
            { name: 'Rent' },
            { name: 'Utilities' },
            { name: 'Transportation' },
            { name: 'Health' },
            { name: 'Insurance' },
            { name: 'Education' },
            { name: 'Entertainment' },
            { name: 'Miscellaneous' }
        ];
        await category.insertMany(categories);
        console.log('Categories seeded successfully');
    } catch (error) {
        console.error('Error seeding categories:', error.message);
    }
};
console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        seedCategories();
    })
    .catch(err => console.error('Connection error:', err));



