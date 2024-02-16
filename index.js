// Mandatory to run
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
const csvtojson = require('csvtojson');
const { mongoose } = require("mongoose")
const multer = require('multer');
const session = require('express-session');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const cron = require('cron').CronJob;
const Announcement = require('./models/announcement');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const config = require("./config.json")


// Middleware
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect(config.MongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection
.on("open", () => console.log("Connected to Mongoose"))
.on("close", () => console.log("Disconnected from Mongoose"))
.on("error", (error) => console.log(error))
app.use(session({
    secret: 'crappy-patty',
    resave: false,
    saveUninitialized: true
}));

// Load login data from JSON file
const userss = JSON.parse(fs.readFileSync('./data/login.json', 'utf-8'));


// Schema
const csvSchema = new mongoose.Schema({
    user: String,
    data: Object,
    event: String,
});
const Csv = mongoose.model('Csv', csvSchema);



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
app.get('/annoucementooo', (req, res) => {
    res.render('announcements');
});
app.get('/sponsers', (req, res) => {
    res.render('comingsoon');
});
app.get('/contact', (req, res) => {
    res.render('contact');
});
app.get('/csv', (req, res) => {
    res.render('webscout');
});


const apiKey = '5yL00zjwnh2wt9O7MBHZmnBC767QEFKY10LGCJS8EVnbKsAUoUYOKha7dDBALadC'; // Replace with your Blue Alliance API key

app.get('/events', async (req, res) => {
    try {
        const events = await fetchEvents(); // Fetch events data from TBA
        res.render('events', { events });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/force-error', function(req, res, next) {
    // Intentionally throwing an error
    const error = new Error('Forced Internal Server Error');
    error.status = 500;
    next(error);
  });
  
  // Multer configuration for handling file uploads
const upload = multer({ dest: 'csv/' });

// Routes
app.get('/scout/login', (req, res) => {
    res.render('login');
});

app.post('/uploadlogin', (req, res) => {
    const { name, login } = req.body;
    const userData = JSON.parse(fs.readFileSync('./data/login.json', 'utf-8'));
    const user = userData.find(user => user.name === name && user.login === login);
    if (user) {
        res.render('upload', { user });
    } else {
        res.send('Invalid credentials');
    }
});

app.post('/upload', upload.single('csvFile'), async (req, res) => {
    const { username } = req.body;
    const csvFilePath = req.file.path;

    // Convert CSV to JSON
    const jsonData = await csvtojson().fromFile(csvFilePath);

    // Save to MongoDB
    const newCsv = new Csv({
        user: username,
        data: jsonData,
        event: 'Barrie'
    });

    try {
        await newCsv.save();
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving CSV data');
    } finally {
        // Remove the uploaded CSV file
        fs.unlinkSync(csvFilePath);
    }
});

// Routes
app.get('/data', async (req, res) => {
    try {
        const csvData = await Csv.find({});
        res.render('data', { csvData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching CSV data');
    }
});

app.post('/datalogin', (req, res) => {
    const { name, login } = req.body;
    const userData = JSON.parse(fs.readFileSync('./data/login.json', 'utf-8'));
    const user = userData.find(user => user.name === name && user.login === login);
    if (user) {
        res.render('data', { user });
    } else {
        res.send('Invalid credentials');
    }
});


app.post('/csvlogin', (req, res) => {
    const { name, login } = req.body;
    const userData = JSON.parse(fs.readFileSync('./data/login.json', 'utf-8'));
    const user = userData.find(user => user.name === name && user.login === login);
    if (user) {
        res.render('webscout', { user });
    } else {
        res.send('Invalid credentials');
    }
});

app.post('/csvsubmit', (req, res) => {
    const { teamName, teamNumber, robotHeight, robotWeight, prosCons, robotAbilities, submitterName } = req.body;

    // Create CSV data
    const csvData = [
        {
            'Team Name': teamName,
            'Team Number': teamNumber,
            'Robot Height': robotHeight,
            'Robot Weight': robotWeight,
            'Pros and Cons': prosCons,
            'What can the robot do': robotAbilities,
            'Name': submitterName
        }
    ];

    // Define CSV file path
    const csvFilePath = `./csv/${Date.now()}-robot-info.csv`;

    // Create CSV writer
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'Team Name', title: 'Team Name' },
            { id: 'Team Number', title: 'Team Number' },
            { id: 'Robot Height', title: 'Robot Height' },
            { id: 'Robot Weight', title: 'Robot Weight' },
            { id: 'Pros and Cons', title: 'Pros and Cons' },
            { id: 'What can the robot do', title: 'What can the robot do' },
            { id: 'Name', title: 'Name' }
        ]
    });

    // Write CSV data to file
    csvWriter.writeRecords(csvData)
        .then(() => {
            console.log('CSV file written successfully');
            res.send('Form submitted successfully!');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error writing CSV file');
        });
});

// Define a cron job to handle CSV files
new cron('*/1 * * * *', async () => {
    try {
        const csvFiles = fs.readdirSync('./csv');
        for (const csvFile of csvFiles) {
            if (csvFile.endsWith('.csv')) {
                const jsonData = await csvtojson().fromFile(`./csv/${csvFile}`);
                await Csv.create({
                    filename: csvFile,
                    data: jsonData,
                    user: "Web Submittion",
                    event: 'Barrie'
                });
                fs.unlinkSync(`./csv/${csvFile}`);
                console.log(`CSV file "${csvFile}" uploaded to MongoDB and deleted from /csv directory.`);
            }
        }
    } catch (error) {
        console.error('Error processing CSV files:', error);
    }
}, null, true, 'America/New_York'); // Adjust the time zone as per your requirement

// Load login data from JSON file
// Login route
app.get('/adminlogin', (req, res) => {
    res.render('adminlogin');
});

// Authentication middleware
// Get all announcements
app.get('/announcement', async (req, res) => {
    try {
        const announcements = await Announcement.find();
        res.render('lol', { announcements });
    } catch (err) {
        console.error('Error getting announcements:', err);
        res.status(500)
    }
});

// Show form to create new announcement
app.get('/post', (req, res) => {
    res.render('post');
});

// Create new announcement
app.post('/post', async (req, res) => {
    try {
        const { title, content } = req.body;
        const newAnnouncement = new Announcement({
            title,
            content,
            date: new Date(),
            author: "7722" // Default author
        });
        await newAnnouncement.save();
        res.redirect('/announcements');
    } catch (err) {
        console.error('Error creating announcement:', err);
        res.status(500).send('Server Error');
    }
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
const PORT = process.env.PORT || 3900;
app.listen(PORT, () => {
    console.log(`Server is Active | listening to port ${PORT}`);
});



// hi
// Function to fetch events data from The Blue Alliance API
async function fetchEvents() {
    const teamNumber = '7722'; // Replace with your FRC team number
    const response = await fetch(`https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/events/2022/simple`, {
        method: 'GET',
        headers: {
            'X-TBA-Auth-Key': apiKey
        }
    });
    const data = await response.json();
    return data.map(event => ({
        location: `${event.city}, ${event.state_prov}, ${event.country}`,
        eventName: event.name,
        time: event.start_date
    }));
}