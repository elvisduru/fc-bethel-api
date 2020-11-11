const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const uri =
  "mongodb+srv://elvis:victory1@bethel.xcoy9.mongodb.net/bethel?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(
  () => console.log("Connected to Mongo"),
  (err) => console.log("Error connecting to Mongo: \n", err)
);

module.exports = mongoose.connection;
