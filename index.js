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

app.post('/api/users', (req, res) => {
    const user_id = generateRandomHex(24)
    const newUser = req.body.username

    let userData = []

    try {
        userData = JSON.parse(fs.readFileSync('users.json'))
    } catch (error) {
        console.error('Error reading user data', error)
    }

    userData.push({ username: newUser, _id: user_id })
    const newUserData = userData.filter(user => user.username === newUser);
    console.log(userData)

    fs.writeFile('users.json', JSON.stringify(userData, null, 2), err => {
        if (err) {
            console.error('Error writing user data', err)
            res.status(500).send('Error saving user')
        } else {
            res.send(newUserData[0])
        }
    })
})

app.get('/api/users', (req, res) => {
    let userData = []

    try {
        userData = JSON.parse(fs.readFileSync('users.json'))
    } catch (error) {
        console.error('Error reading user data', error)
    }
    console.log(userData)
    res.send(userData)
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
