const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const generateRandomHex = require('./randomId.js')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let userData = []

app.post('/api/users', (req, res) => {
    const user_id = generateRandomHex(24)
    const newUser = req.body.username
/*
    try {
        userData = JSON.parse(fs.readFileSync('users.json'))
    } catch (error) {
        console.error('Error reading user data', error)
    }
*/
    userData.push({ _id: user_id, username: newUser })
    const newUserData = userData.filter(user => user.username === newUser);
    console.log(userData)
/*
    fs.writeFile('users.json', JSON.stringify(userData, null, 2), err => {
        if (err) {
            console.error('Error writing user data', err)
            res.status(500).send('Error saving user')
        } else {
*/
            let response = {username: newUserData[0].username, _id: newUserData[0]._id}
            res.send(response)
 //       }
  //  })
})

app.get('/api/users', (req, res) => {
/*
    try {
        userData = JSON.parse(fs.readFileSync('users.json'))
    } catch (error) {
        console.error('Error reading user data', error)
    }
    */
    let usersList = userData.map(user =>({
        _id: user._id,
        username: user.username
    }) )
    console.log(usersList)
    res.send(usersList)
})

app.post('/api/users/:_id/exercises', (req, res) => {
    const userId = req.params._id;
    let { description, duration, date } = req.body;
    duration = parseInt(duration);
    date = date ? new Date(date) : new Date();
    date = date.toDateString();

    // Fetch the current user from the user data
    const currentUser = userData.find(user => user._id === userId);

    if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
    }

    if (!currentUser.hasOwnProperty('exercises')) {
        currentUser.exercises = [];
    }

    // Add the exercise to the current user's data
    const newExercise = { description, duration, date };
    currentUser.exercises.push(newExercise);

    // Prepare the response containing only the added exercise
    const response = {
        _id: currentUser._id,
        username: currentUser.username,
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date
    };

    res.json(response);
});

app.get('/api/users/:_id/logs', (req, res) => {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    // Find the user with the specified _id
    const currentUser = userData.find(user => user._id === userId);

    if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
    }

    // Filter exercises based on from and to dates
    let filteredExercises = currentUser.exercises || [];
    if (from) {
        filteredExercises = filteredExercises.filter(exercise => new Date(exercise.date) >= new Date(from));
    }
    if (to) {
        filteredExercises = filteredExercises.filter(exercise => new Date(exercise.date) <= new Date(to));
    }

    // Limit the number of exercises if limit is provided
    if (limit) {
        filteredExercises = filteredExercises.slice(0, limit);
    }

    // Prepare the log array
    const log = filteredExercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date
    }));

    // Construct the response object
    const response = {
        _id: currentUser._id,
        username: currentUser.username,
        count: log.length,
        log: log
    };

    res.json(response);
    console.log(response)
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
