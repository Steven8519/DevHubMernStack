const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(request, response, next) {
  const token = request.header('x-auth-token');

  if(!token) {
    return response.status(401).json({message: 'Authorization denied'});
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    request.user = decoded.user;
    next();
  } catch(err) {
    response.status(401).json({message: 'Token is not valid'})
  }
};