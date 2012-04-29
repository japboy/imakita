/**
 * My model definitions
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , models = {};

var users = new Schema({
    user_id: String
  , screen_name: String
  , name: String
  , location: {
      latitude: String
    , longitude: String
    }
  , attended: Date
  , created: Date
  , modified: Date
});

var events = new Schema({
    name: String
  , address: String
  , duration: {
      start: Date
    , end: Date
    }
  , location: {
      latitude: String
    , longitude: String
    }
  , attendees: [users]
  , created: Date
  , modified: Date
});

models['Events'] = mongoose.model('events', events);

exports.mongoose = mongoose;
exports.models = models;
