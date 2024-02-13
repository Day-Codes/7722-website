// Mandatory to run
const express = require('express');
const path = require('path');
// Installing Firebase
const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
// GFX

// Utility 

// Middleware
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

//Firebase installation

// Routes
app.get('/', (req, res) => {
    res.render('loading');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/promovid', (req, res) => {
    res.render('promovideo');
});

app.get('/event', (req, res) => {
    res.render('comingsoon');
});
app.get('/donate', (req, res) => {
    res.render('comingsoon');
});
app.get('/ourteam', (req, res) => {
    res.render('comingsoon');
});
app.get('/photos', (req, res) => {
    res.render('comingsoon');
});
app.get('/annoucements', (req, res) => {
    res.render('comingsoon');
});
app.get('/sponsers', (req, res) => {
    res.render('comingsoon');
});
app.get('/contact', (req, res) => {
    res.render('contact');
});


const apiKey = '5yL00zjwnh2wt9O7MBHZmnBC767QEFKY10LGCJS8EVnbKsAUoUYOKha7dDBALadC'; // Replace with your Blue Alliance API key

app.get('/events', (req, res) => {
    const { teamNumber } = req.params;
    fetch(`https://www.thebluealliance.com/api/v3/team/frc7722/events/2024/simple`, {
        method: 'GET',
        headers: {
            'X-TBA-Auth-Key': apiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        const events = data.map(event => ({
            name: event.name,
            date: event.start_date,
            location: `${event.city}, ${event.state_prov}, ${event.country}`
        }));
        res.json(events);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    });
});

app.get('/force-error', function(req, res, next) {
    // Intentionally throwing an error
    const error = new Error('Forced Internal Server Error');
    error.status = 500;
    next(error);
  });
  
// Errors 
// Route for handling 404 errors
app.use(function(req, res, next) {
    res.status(404).render('404');
  });
  
  // Route for handling internal server errors
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('error');
  });
// Start server
const PORT = process.env.PORT || 3400;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
