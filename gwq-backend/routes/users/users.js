const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Register Route
router.post('/register', async function(req, res, next) {

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  //Handling edge case - all fields completed
  if(!name || !email || !password){
    res.status(400).json({
      error: true,
      message: 'All paramenters must be included'
    })
    return;
  }

  try{
    const user = await req.db('users')
      .where('email', '=', email).first();

    //Checking to see if the user email has already been registered
    if (user){
      res.status(409).json({
        error: true,
        message: 'User email already exists'
      });
      return;
    //Hashing user password for security
    } else if(!user){
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      
      const newUser = {name: name, email: email, password: hash};
    
    //Adding new user into the database
    await req.db
      .from('users')
      .insert(newUser)
      
      res.status(200).json({
        error: false,
        message: 'New user created! Directing to login page....'
      })
    }
  } catch(error){
    res.status(500).json({
      error: true,
      message: "Error While accessing the database",
      details: error.message
    });
  }
});

// LOGIN ROUTE
router.post('/login', async function(req, res, next) {
  const email =  req.body.email;
  const password = req.body.password;

  //Handling edge case - all fields completed
  if (!email || !password){
    res.status(400).json({
      error: true,
      message: "Email and password are required"
    })
    return;
  }
  try{
    const user = await req.db
      .from('users')
      .where('email', "=", email).first();
      
      //handling error if user does not exist
      if(!user){
        res.status(401).json({
          error: true,
          message: "No user found with this email"
        })
        return;
      }

      //Comparing user password input with database password
      const isValidPassword = await bcrypt.compare(password, user.password);

      //Error if password is not matching
      if (!isValidPassword){
          res.status(401).json({
          error: true,
          message: "Incorrect email or password"
          });
        return;

      //Granting a JSON Web Token if user password matches database password
      } else if (isValidPassword){
        const expiresIn = 3600;
        const exp = Math.floor(Date.now() / 1000) + expiresIn;
        const token = jwt.sign({ email, exp }, process.env.JWT_SECRET);

        console.log(token);

        res.status(200). json({
          "token": token,
          token_type: "Bearer",
          "expires_in": expiresIn,
          name: user.name,
          email: user.email,
          id: user.id
        });
      }     
  } catch(error){
    res.status(500).json({
      error: true,
      message: "Error while accessing the database",
      detials: error.message
    })
  }
});

module.exports = router;
