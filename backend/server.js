// Setup empty JS object to act as endpoint for all routes
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Start up an instance of app
const app = express();

/* Middleware */
// Configure express to use body-parser as middle-ware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static('website'));

// Setup Server
const port = 3000;
const server = app.listen(port, () => {
    console.log(`🚀 Server running on localhost: ${port}`);
});

// Path to data.json file
const dataFilePath = path.join(__dirname, 'data.json');

// Helper function to read data from JSON file
const readData = () => {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return [];
    }
};

// Helper function to write data to JSON file
const writeData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing to data file:', error);
        return false;
    }
};

// GET route to retrieve all weather entries
app.get('/weather', (req, res) => {
    const weatherData = readData();
    res.send(weatherData);
    console.log('📖 Weather data retrieved');
});

// POST route to add new weather entry
app.post('/addWeather', (req, res) => {
    const newEntry = req.body;
    
    // Add timestamp if not present
    if (!newEntry.date) {
        newEntry.date = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Read existing data
    const weatherData = readData();
    
    // Add new entry to the beginning of array (most recent first)
    weatherData.unshift(newEntry);
    
    // Write updated data back to file
    const success = writeData(weatherData);
    
    if (success) {
        res.send({ success: true, message: 'Weather entry added successfully', data: newEntry });
        console.log('✅ New weather entry added:', newEntry.city);
    } else {
        res.status(500).send({ success: false, message: 'Failed to save weather entry' });
    }
});

// DELETE route to clear all weather entries (optional feature)
app.delete('/weather', (req, res) => {
    const success = writeData([]);
    
    if (success) {
        res.send({ success: true, message: 'All weather entries cleared' });
        console.log('🗑️  All weather entries cleared');
    } else {
        res.status(500).send({ success: false, message: 'Failed to clear weather entries' });
    }
});
