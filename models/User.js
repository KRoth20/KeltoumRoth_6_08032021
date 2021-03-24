const mongoose = require('mongoose');//connexion avec BDD
const uniqueValidator = require('mongoose-unique-validator');//pour éviter que plusieurs users puissent utiliser la même adresse mail

const userSchema = mongoose.Schema({
  // userId : {type: String, required : true, unique: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); 

module.exports = mongoose.model('User', userSchema);