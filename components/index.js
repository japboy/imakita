/**
 * My components
 */

var distance = require('./distance_and_azimuth');

exports.distance = distance.distance;

var oauth = require('oauth')
  , OAuth = oauth.OAuth;

exports.twitter = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  'KNdkDdt2VOjaQX8p1Tzg',
  '9XIAzu9nhLMWrpREyfir6TNTJeP75XRHc8eUE3Oa2Pw',
  '1.0',
  //'http://imakita.herokuapp.com/login',
  'http://localhost:3000/login',
  'HMAC-SHA1'
);
