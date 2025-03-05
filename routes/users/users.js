const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Register Route

router.post('/register', async function(req, res, next) {

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  console.log( `Name: ${name}, Email: ${email}, Password: ${password} `)

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

    console.log(user);

    if (user){
      res.status(409).json({
        error: true,
        message: 'User email already exists'
      });
      return;
    } else if(!user){
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      
      const newUser = {name: name, email: email, password: hash};

    await req.db
      .from('users')
      .insert(newUser)
      
      res.status(200).json({
        error: false,
        message: 'New user created'
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

  console.log( `Backend reached: ${email}, ${password}`)

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

      console.log(user);

      if(!user){
        res.status(401).json({
          error: true,
          message: "No user found with this email"
        })
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword){
          res.status(401).json({
          error: true,
          message: "Incorrect email or password"
          });
        return;
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
