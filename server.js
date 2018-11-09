// server.js
const express = require("express");
const app = express();
const path = require("path");
// Run the app by serving the static files
// in the dist directory
app.use(express.static(path.join(__dirname, "/build")));

console.log(path.join(__dirname, "/build"));
console.log(path.join(__dirname + "/build/index.html"));

app.listen(process.env.PORT || 9000);

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});
