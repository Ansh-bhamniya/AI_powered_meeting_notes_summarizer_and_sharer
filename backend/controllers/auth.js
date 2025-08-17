const ApiKey = require('../models/ApiKey'); // adjust path if needed

const authController = async (req, res) => {
    console.log('Received register-user request:', req.body);

    const { userId } = req.body;
    console.log( " this is user id " , userId);
  
    if (!userId) {
        console.log('No userId provided');
        return res.status(400).json({ error: 'userId is required' });
    }
  
    try {
        const user = await ApiKey.findOneAndUpdate(
            { userId },
            { $setOnInsert: { apiKey: "" } },
            { new: true, upsert: true }
        );
        console.log( " this is user id " ,userId);
  
        console.log('✅ User registered/found:', user);
        res.json({ message: 'User registered successfully', data: user });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

module.exports = authController;
