const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
      
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user) { 
            throw new Error();
        }
        
        req.user = user; // Attach user info to the request

        next();
    }catch(e){
        res.status(401).send({error: 'Autentication failed.'});
    }
};

module.exports = authMiddleware;