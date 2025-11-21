const express = require('express');
const router = express.Router();
const { PersonalizationOption } = require('../models');

// GET /api/personalization-options
router.get('/', async (req, res) => {
    try {
        console.log('Fetching personalization options...');
        const options = await PersonalizationOption.getGroupedByType();
        console.log('Options found:', Object.keys(options));
        res.json(options);
    } catch (error) {
        console.error('Error fetching personalization options:', error);
        res.status(500).json({ 
            error: 'Error al cargar opciones de personalización',
            details: error.message 
        });
    }
});

module.exports = router;