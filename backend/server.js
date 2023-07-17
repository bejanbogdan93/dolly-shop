//Project Codecademy link:
//https://www.codecademy.com/paths/full-stack-engineer-career-path/tracks/fscp-22-portfolio-project-e-commerce-app-rest-api/modules/fscp-22-e-commerce-app-rest-api/kanban_projects/ecommerce-app-rest-api
const express = require("express");
const cors = require("cors");
var path = require("path");

// var LocalStrategy = require("passport-local").Strategy;

// Passport-local docs: http://www.passportjs.org/howtos/password/

const bodyParser = require("body-parser");
//body parser Docs: https://expressjs.com/en/resources/middleware/body-parser.html
const app = express();
require("dotenv").config();

var swaggerJSDoc = require("swagger-jsdoc");

require("./auth/passport");



// swagger definition
var swaggerDefinition = {
  info: {
    title: "Dolly Store",
    version: "1.0.0",
    description: "Hand made doll store",
  },
  host: "localhost:3001",
  basePath: "/",
};
//options for swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ["./server-swagger.js"],
};
// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);
app.use(express.static(path.join(__dirname, "public")));

//Import Database utils
const db = require("./db/index");

const corsOptions = {
  //@bejanbogdan93 This origin should be changed to the frontend url. You may have to parameterize this somehow when you deploy it.
  origin: "http://localhost:3000", //Your Client, do not write '*'
  credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post("/login", db.loginUser);

//------------------------------------------------------------- Products "CRUD"
app.get("/products/", db.getProdByHeigth); //I should check if the body has the heigth, if not, this should return all products
app.get("/products/:id", db.getProdById);

//------------------------------------------------------------- User "CRUD"
app.get("/users/", db.getUsers);
app.get("/users/:id", db.getUserById);
app.post("/users/register", db.registerUser);
app.delete("/users/:id", db.deleteUser);

//------------------------------------------------------------- Cart "CRUD"

app.get("/cart/:id", db.getCartById);
//Need to add one get for the products of a cart
app.post("/cart", db.postCart);
app.delete("/cart/:id", db.deleteCart);
app.post("/cart/:id/checkout", db.cartCheckout);

//------------------------------------------------------------- Orders "CRUD"
app.get("/orders", db.getOrders);
app.get("/orders/:id", db.getOrderById);
app.get("/orders/:id/products", db.getOrderProducts);

app.get("/swagger.json", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});






app.listen(3001, () => {
  console.log(`Listening on post ${3001}.`);
});
