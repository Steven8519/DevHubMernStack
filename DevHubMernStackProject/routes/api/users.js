const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');


// Load User model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/', (request, response) => 
response.json({msg: 'User works'}));

// @route  GET api/users/register
// @desc   Register a user
// @access Public
router.post('/', [
  check('name', 'Name is required')
    .not()
    .isEmpty(),
    check('email', 'Please enter a valide email').isEmail(),
    check('password', 'Please enter a password that contains 8 characters or more').isLength({min: 8})
], async (request, response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty()) {
      return response.status(400).json({errors: errors.array()});
    }
    const {name, email, password } = request.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return response
        .status(400)
        .json({ errors: [{message: 'User already exists'}]});
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      })

      user = new User({
        name,
        email,
        avatar,
        password
      })

      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt);

      await user.save();

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