var mongoose = require("mongoose");

// variable for schema/mogoose
var Schema = mongoose.Schema;

// Using schema
var NoteSchema = new Schema({
  title: String,
  body: String
});


var Note = mongoose.model("Note", NoteSchema);

// Export
module.exports = Note;
