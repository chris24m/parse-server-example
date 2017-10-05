var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: {
    type: String
  },
  username: {
    type: String
  },
  firstname: {
    type: String
  },
  surname: {
    type: String
  },
  _hashed_password: {
    type: String
  },
  _wperm: [{
    type: String
  }],
  _rperm: [{
    type: String
  }],
  _acl: {},
  _created_at: {
    type: Date,
    default: Date.now
  },
  _updated_at: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String
  },
  _auth_data_facebook: {},
  role: {
    type: String
  },
  _perishable_token: {
    type: String
  }
});

mongoose.model('_User',UserSchema);
