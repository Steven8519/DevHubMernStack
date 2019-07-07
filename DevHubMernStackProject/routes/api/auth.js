const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');


const User = require('../../models/User');

// @route  GET api/auth
// @desc   Authenticate user & get token
// @access Public
router.get('/', auth, async (request, response) => {
  try {
    const user = await User.findById(request.user.id)
      .select('-password');
    response.json(user)
  } catch (err) {
    console.error(err.message);
    response.status(500).send('Server Error')
  }
});

// @route  GET api/users/register
// @desc   Register a user
// @access Public
router.post('/', [
    check('email', 'Please enter a valide email').isEmail(),
    check('password', 'Password is required').exists()
], async (request, response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty()) {
      return response.status(400).json({errors: errors.array()});
    }
    const {email, password } = request.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return response
          .status(400)
          .json({ errors: [{message: 'Invalid Credentials'}]});
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if(!isMatch) {
        return response
        .status(400)
        .json({ errors: [{message: 'Invalid Credentials'}]});
      }

      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload, 
        config.get('jwtSecret'),
        {expiresIn: 3600}, 
        (err, token) => {
          if(err) throw err;
          response.json({token})
        })

    } catch(err) {
      console.error(err.message);
      response.status(500).send('User registered');
    }   
});

module.exports = router;