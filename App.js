const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dbconnect = 'mongodb+srv://jyotisharma6672:Qf4aA4Q184BTI0nd@emp.i8sw6.mongodb.net/';

const app = express();
const PORT = 3000;
app.use(express.static("public"));
const cors = require("cors")

// Middleware to parse JSON and urlencoded bodies
app.use(express.json());
app.use(bodyParser.json())
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(dbconnect);
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true,
  }

})

const Users = mongoose.model("users", userSchema);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)

  if (!username || !password) {
    return res.json({
      message: "Required Feilds"
    })
  }

  try {
    const user = await Users.findOne({ username })

    if (user) {
      return res.json({
        message: "Username is already used",
      })
    }
    const newUser = Users({
      username,
      password
    })
    await newUser.save();

    res.json({
      message: "Register Successfully"
    })
  } catch (err) {
    res.json({
      message: "Something went wrong",
      err: err.message
    })
  }
})

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)

  if (!username || !password) {
    return res.json({
      message: "Required Feilds"
    })
  }

  try {
    const user = await Users.findOne({ username })

    if (!user) {
      return res.json({
        message: "Username not exist",
      })
    }
    const check = user.password === password;

    if (check) {
      return res.json({
        message: "Login successfull",
      })
    }

    res.json({
      message: "Login Failed"
    })
  } catch (err) {
    res.json({
      message: "Something went wrong",
      err: err.message
    })
  }
})

// Define a route for the root URL '/'
app.get('/', (req, res) => {
  // Send the index.html file as a response
  // res.send("something is here")
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Define a route for handling form submission to create a new user
app.post('/newuser', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  // You can send a response back if needed
  let user = new Users({ username, password });
  await user.save();
  res.send('New user created successfully!');
});

app.post('/delete', async (req, res) => {
  const { username } = req.body;
  // You can send a response back if needed

  Users.deleteOne({ username }).then(() => {
    res.send('Delete successfully!');
  })
});

app.post('/update', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username and update their password
    const user = await Users.findOne({ username });
    if (!user) {
      // If user not found, send an error response
      return res.status(404).send('User not found');
    }

    // Update the user's password
    user.password = password;
    await user.save();

    res.send('Password updated successfully!');
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/alluser', async (req, res) => {
  let alluser = await Users.find({});
  res.json(alluser);
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});