const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');


const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');


// @route  Post api/posts
// @desc   Create a post
// @access Private
router.post('/', [ 
  auth, 
  [
  check('text', 'Text is required')
    .not()
    .isEmpty()
  ]
], async (request, response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty()) {
      return response.status(400).json({errors: errors.array()});
    }

    try {
      const user = await User.findById(request.user.id).select('-password');

    const newPost = new Post({
      text: request.body.text,
      name: user.name,
      avatar: user.avatar,
      user: request.user.id
    });
     const post = await newPost.save();

     response.json(post);
    } catch (error) {
      console.error(error.message);
      response.status(500).send('Server error');
      
    }
});

// @route  GET api/posts
// @desc   Get all posts
// @access Private
router.get('/', auth, async (request, response) => {
  try {
    const posts = await Post.find().sort({date: -1})
    response.json(posts);
  } catch (error) {
    console.error(error.message);
    response.status(500).send('Server error');
  }
});

// @route  GET api/posts/:id
// @desc   Get post by ID
// @access Private
router.get('/:id', auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if(!post) {
      return response.status(404).json({message: 'Post not found'})
    }

    response.json(post);
  } catch (error) {
    console.error(error.message);
    if(error.kind === 'ObjectId') {
      return response.status(404).json({message: 'Post not found'})
    }
    response.status(500).send('Server error');
  }
});

// @route  DETETE api/posts/:id
// @desc   Delete a post by ID
// @access Private
router.delete('/:id', auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if(!post) {
      return response.status(404).json({message: 'Post not found'})
    }

    if(post.user.toString() !== request.user.id) {
      return response.status(401).json({message: 'User not authorized'});
    }

    await post.remove()

    response.json({message: 'Post removed'});
  } catch (error) {
    console.error(error.message);
    if(error.kind === 'ObjectId') {
      return response.status(404).json({message: 'Post not found'})
    }
    response.status(500).send('Server error');
  }
});

// @route  Put api/posts/like/:id
// @desc   Give a like to a post
// @access Private
router.put('/like/:id', auth, async(request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if(post.likes.filter(like => like.user.toString() === request.user.id).length > 0) {
      return response.status(400).json({message: 'Post already liked'})
    }

    await post.save();

    response.json(post.likes)

    post.likes.unshift({message: request.user.id});
  } catch (error) {
    console.error(error.message);
    response.status(500).send('Server error');
  }
}) 

// @route  Put api/posts/unlike/:id
// @desc   Give a like to a post
// @access Private
router.put('/unlike/:id', auth, async(request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if(post.likes.filter(like => like.user.toString() === request.user.id).length === 0) {
      return response.status(400).json({message: 'The post has not been liked'})
    }

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(request.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    response.json(post.likes)

    post.likes.unshift({message: request.user.id});
  } catch (error) {
    console.error(error.message);
    response.status(500).send('Server error');
  }
}) 

// @route  Post api/posts/comment/:id
// @desc   Comment on a post
// @access Private
router.post('/comment/:id', [ 
  auth, 
  [
  check('text', 'Text is required')
    .not()
    .isEmpty()
  ]
], async (request, response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty()) {
      return response.status(400).json({errors: errors.array()});
    }

    try {
      const user = await User.findById(request.user.id).select('-password');

      const post = await Post.findById(request.user.id);

    const newComment = {
      text: request.body.text,
      name: user.name,
      avatar: user.avatar,
      user: request.user.id
    };

    post.comments.unshift(newComment);

    await newPost.save();

    response.json(post.comments)

    } catch (error) {
      console.error(error.message);
      response.status(500).send('Server error');
      
    }
});

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Delete comment
// @access Private
router.delete('/comment/:id/:comment_id', auth, async (request, response) => {
  try {
    const post = await Post.findById(request.user.id);

    const comment = post.comments.find(comment => comment.id === request.params.comment_id)

    if(!comment) {
      return response.status(404).json({message: 'Comment does not exists'})
    }

    if(comment.user.toString() !== request.user.id) {
      return response.status(401).json({message: 'User not authorized'})
    }

    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(request.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    response.json(post.comments)
  } catch (error) {
    console.error(error.message);
    response.status(500).send('Server error');
  }
})

module.exports = router;