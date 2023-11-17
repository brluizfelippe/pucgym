const dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var app = express();
var cors = require("cors");
var path = require("path");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var routes = require("./api/routes/");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
app.use(cors());
app.use(morgan("dev"));
// Add middleware to console log every request
app.use(function (req, res, next) {
  console.log(req.method, req.url);
  next();
});

// Set static directory before defining routes
//app.use(express.static(path.join(__dirname, "www")));
app.use(express.static(__dirname));
app.use("/node_modules", express.static(__dirname + "/node_modules"));
app.use("/fonts", express.static(__dirname + "/fonts"));

// Enable parsing of posted forms
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add some routing
app.use("/api/v1", routes);

//error handler taken from the kindle book: express.js
app.use(function errorHandler(error, request, response, next) {
  //response.status(500);
  //response.render("app_error", { error: error });
  response.status(500).json({ error: error });
});

if (process.env.NODE_ENV === "production") {
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(express.static("www"));

  // Express will serve up the index.html file
  // if it doesn't recognize the route
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "www", "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log(
  "estou rodando na porta: ",
  PORT,
  " NODE_ENV :",
  process.env.NODE_ENV
);
