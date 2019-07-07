const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  GET api/profiles
// @desc   Get current users profile.
// @access Private
router.get('/currentProfile', auth, async (request, response) => {
  try {
    const profile = await Profile.findOne({ user: request.user.id}).populate('user', ['name', 'avatar']);

    if(!profile) {
      return response.status(400).json({message: 'There is no profile tide to this user.'})
    }

    response.json(profile);
  } catch (error) {
    console.error(error.message)
  }
});

// @route  Post api/profiles
// @desc   Create or update a users profile.
// @access Private
router.post('/', [
  auth, 
  [
  check('typeOfDeveloper', 'Type of Developer is required')
    .not()
    .isEmpty(),
  check('skills', 'Skills is required')
    .not()
    .isEmpty()
  ]
], 
async (request, response) => {
  const errors = validationResult(request);

    if(!errors.isEmpty()) {
      return response.status(400).json({errors: errors.array()});
    }

    const {
      currentCompany,
      website, 
      location,
      bio,
      typeOfDeveloper,
      githubusername,
      skills,
      facebook,
      twitter,
      instagram,
      linkedin
    } = request.body;

    const profileFields = {};
    profileFields.user = request.user.id;
    if(currentCompany) {
      profileFields.company = company;
    }

    if(website) {
      profileFields.website = website;
    }

    if(location) {
      profileFields.location = location;
    }

    if(bio) {
      profileFields.bio = bio;
    }

    if(typeOfDeveloper) {
      profileFields.typeOfDeveloper = typeOfDeveloper;
    }

    if(githubusername) {
      profileFields.githubusername = githubusername;
    }

    if(skills) {
      profileFields.skills = skills
        .split(',')
        .map(skill => skill.trim());
    }

    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({user: request.user.id});

      if(profile) {
        profile = await Profile.findOneAndUpdate(
        {user: request.user.id}, 
        {$set: profileFields}, 
        {new: true});

        return response.json(profile);
      }

      profile = new Profile(profileFields);

      await profile.save();
      response.json(profile);
    } catch (error) {
      console.error(error.message);
      response.status(500).send('Server error');
    }
})

// @route  GET api/profiles
// @desc   Get all profiles.
// @access Public
router.get('/', async (request, response) => {
  try {
    const profiles = await Profile.find().populate('user', [
      'name', 'avatar'
    ])
    response.json(profiles);
  } catch (error) {
    console.error(error.message);
    response.status(500).send('Server error');
  }
});

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user ID.
// @access Public
router.get('/user/:user_id', async (request, response) => {
  try {
    const profile = await Profile.findOne({user: request.params.user_id}).populate('user', [
      'name', 'avatar'
    ])

    if(!profile) {
      return response.status(400).json({message: 'Profile not found'})
    }
    response.json(profile);
  } catch (error) {
    console.error(error.message);
    if(error.kind == 'ObjectId') {
      return response.status(400).json({message: 'Profile not found'})
    }
    response.status(500).send('Server error');
  }
});

// @route  DELETE api/profile
// @desc   Delete profile, user and posts.
// @access Private
router.delete('/', auth, async (request, response) => {
  try {
    // Remove a profile
    await Profile.findOneAndRemove({user: request.user.id});

    // Remove a user
    await User.findOneAndRemove({_id: request.user.id});

    response.json({message: 'User removed'});

  } catch (error) {
    console.error(error.message);
    response.status(500).send('Server error');
  }
});

// @route  Put api/profile/experience
// @desc   Add profile experience.
// @access Private
router.put('/experience', [auth, [
  check('title', 'Title is required')
    .not()
    .isEmpty(),
  check('company', 'Company is required')
    .not()
    .isEmpty(),
  check('from', 'From date is required')
    .not()
    .isEmpty()
]], async (request, response) => {
      const errors = validationResult(request);
      if(!errors.isEmpty()) {
        return response.status(400).json({errors: errors.array()})
      }
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = request.body;

      const newExperience = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      }

      try {
        const profile = await Profile.findOne({user: request.user.id});

        profile.experience.unshift(newExperience);

        await profile.save();
        response.json(profile);
      } catch (error) {
        console.error(error.message)
        response.status(500).send('Server error');
      }
  }
);

// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete experience from profile.
// @access Private
router.delete('/experience/:exp_id', auth, async (request, response) => {
  try {
    const profile = await Profile.findOne({user: request.user.id});

    // Get remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(request.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    response.json(profile);
  } catch (error) {
    console.error(error.message)
    response.status(500).send('Server error')
  }
});

// @route  Put api/profile/education
// @desc   Add profile education.
// @access Private
router.put('/education', [auth, [
  check('school', 'School is required')
    .not()
    .isEmpty(),
  check('degree', 'Degree is required')
    .not()
    .isEmpty(),
  check('fieldofstudy', 'Field of study is required')
    .not()
    .isEmpty(),
  check('from', 'From date is required')
    .not()
    .isEmpty()
]], async (request, response) => {
      const errors = validationResult(request);
      if(!errors.isEmpty()) {
        return response.status(400).json({errors: errors.array()})
      }
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = request.body;

      const newEducation = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      }

      try {
        const profile = await Profile.findOne({user: request.user.id});

        profile.education.unshift(newEducation);

        await profile.save();
        response.json(profile);
      } catch (error) {
        console.error(error.message)
        response.status(500).send('Server error');
      }
  }
);

// @route  DELETE api/profile/education/:edu_id
// @desc   Delete education from profile.
// @access Private
router.delete('/education/:edu_id', auth, async (request, response) => {
  try {
    const profile = await Profile.findOne({user: request.user.id});

    // Get remove index
    const removeIndex = profile.education.map(item => item.id).indexOf(request.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    response.json(profile);
  } catch (error) {
    console.error(error.message)
    response.status(500).send('Server error')
  }
});

// @route  GET api/profile/github/:username
// @desc   Get users repos from Github.
// @access Public
router.get('/github/:username', (request, response) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${request.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: {'user-agent': 'node.js'}
    };

    request(options, (error, response, body) => {
      if(error) {
        console.error(error);
      }

      if(response.statusCode !== 200) {
        return response.status(404).json({message: 'No Github profile found'})
      }
      response.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message)
    response.status(500).send('Server error')
  }
})



module.exports = router;