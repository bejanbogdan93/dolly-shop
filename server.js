//Project Codecademy link: 
//https://www.codecademy.com/paths/full-stack-engineer-career-path/tracks/fscp-22-portfolio-project-e-commerce-app-rest-api/modules/fscp-22-e-commerce-app-rest-api/kanban_projects/ecommerce-app-rest-api 
const express = require('express');
const cors = require('cors');
const session = require('express-session');
var path = require('path');
const store = new session.MemoryStore();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// Passport-local docs: http://www.passportjs.org/howtos/password/

const bodyParser = require('body-parser');
//body parser Docs: https://expressjs.com/en/resources/middleware/body-parser.html
const app = express();
const port = 3001;
//swagger-jsdoc
var swaggerJSDoc = require('swagger-jsdoc');

// swagger definition
var swaggerDefinition = {
  info: {
    title: "Dolly Store",
    version: '1.0.0',
    description: 'Hand made doll store'
  },
  host: 'localhost:3001',
  basePath: '/',
}
//options for swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./server.js'],
}
// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

const db = require('./db/index');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: "f4z4gs$Gcg",
    cookie: { maxAge: 300000000, secure: false },
    saveUninitialized: false,
    resave: false,
    store,
    secure: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.users.findById(id, function (err, user) {
    if (err) {
      return done(err);
    }
    done(null, user);
  });
});

// app.get('/login', (req, res) => {
//   res.render("login");
// });

app.get('/',(req, res) => {
  res.redirect("/login");
})

app.post(
  "/login",
  // passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    const { email, password } = req.body;
    db.getUserByEmail(email, (err, user) => {
      if (!user) return res.status(403).json({ msg: "No user found!"})
      if (user.password === password){
        req.session.isAuthenticated = true;
        req.session.user = {
          email,
          password,
          first_name: user.first_name,
          last_name: user.last_name,
        };
        res.status(200).json({ status: 200, msg: "Succesful"});
      } else {
        res.status(403).json({ msg: "Bad Credentials"});
      }
    })
  });

app.get("/profile", (req, res) => {
  res.render("profile", { user: req.session.user });
});


//Add swagger to your project, article:
//https://mherman.org/blog/swagger-and-nodejs/

//------------------------------------------------------------- Products "CRUD"
/**
 * @swagger
 * definitions:
 *   Doll:
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *       heigth:
 *         type: integer
 *       description:
 *         type: string
 *       price:
 *         type: integer
 *       pic_link:
 *         type: string
 *   User:
 *     properties:
 *       id:
 *         type: integer
 *       email:
 *         type: string
 *       password:
 *         type: string
 *       first_name:
 *         type: string
 *       last_name:
 *         type: string
 *   Cart:
 *     properties:
 *       id:
 *         type: integer
 *       user_id:
 *         type: integer
 *   Order:
 *     properties:
 *       id:
 *         type: integer
 *       user_id:
 *         type: integer
 *       time_date:
 *         type: string
 *   Checkout:
 *     properties:
 *       cardNumber:
 *         type: string
 *         default: "4916108926268679"
 *       user_id:
 *         type: integer
 *         default: 1
 *   
 */

/**
 * @swagger
 * /products/:
 *   get:
 *     tags:
 *       - Dolls
 *     description: Returns dolls
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: heigth
 *         description: Doll's heigth (optional)
 *         in: query
 *         required: false
 *         type: integer
 *         default: 400
 *     responses:
 *       200:
 *         description: A collection of dolls
 *         schema:
 *           $ref: '#/definitions/Doll'
 */
app.get('/products/', db.getProdByHeigth); //I should check if the body has the heigth, if not, this should return all products

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags:
 *       - Dolls
 *     description: Returns a single doll
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Doll's id
 *         in: path
 *         required: true
 *         type: integer
 *         default: 1
 *     responses:
 *       400:
 *         description: Bad request. Check error Reason.
 *       200:
 *         description: A single doll
 *         schema:
 *           $ref: '#/definitions/Doll'
 */
app.get('/products/:id', db.getProdById);

//------------------------------------------------------------- User "CRUD"
/**
 * @swagger
 * /users/:
 *   get:
 *     tags:
 *       - User
 *     description: Returns all users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All users
 *         schema:
 *           $ref: '#/definitions/User'
 */
app.get('/users/', db.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - User
 *     description: Returns a single user
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: User's id
 *         in: path
 *         required: true
 *         type: integer
 *         default: 1
 *     responses:
 *       400:
 *         description: Bad request. Check Reason in the response.
 *       200:
 *         description: A single user
 *         schema:
 *           $ref: '#/definitions/User'
 */
app.get('/users/:id', db.getUserById);

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags:
 *       - User
 *     description: Creates a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: user object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       201:
 *         description: Successfully created
 *       400:
 *         description: Bad request. Check error Reason.
 */
app.post('/users/register', db.registerUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - User
 *     description: Delete a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: user id
 *         in: path
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       400:
 *         description: Bad request. Check error Reason.
 *       204:
 *         description: Successfully deleted
 */
app.delete('/users/:id', db.deleteUser);

//------------------------------------------------------------- Cart "CRUD"
/**
 * @swagger
 * /cart/{id}:
 *   get:
 *     tags:
 *       - Cart
 *     description: Returns a single cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Cart's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       400:
 *         description: Bad request. Check Reason.
 *       200:
 *         description: A single cart
 *         schema:
 *           $ref: '#/definitions/Cart'
 */
app.get('/cart/:id', db.getCartById);
//Need to add one get for the products of a cart

/**
 * @swagger
 * /cart:
 *   post:
 *     tags:
 *       - Cart
 *     description: Creates a new cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cart
 *         description: cart object
 *         in: body
 *         required: true
 *         schema:
 *           properties:
 *             item1:
 *               type: integer
 *               default: 2
 *             item2:
 *               type: integer
 *               default: 3
 *       - name: userid
 *         description: user's id
 *         in: query
 *         required: true
 *         default: 3
 *     responses:
 *       400:
 *         description: Bad request. Check Reason.
 *       201:
 *         description: Successfully created
 */
app.post('/cart', db.postCart);


/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     tags:
 *       - Cart
 *     description: Delete a cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: cart id
 *         in: path
 *         required: true
 *     responses:
 *       404:
 *         description: Bad request. Check Reason.
 *       201:
 *         description: Successfully deleted
 */
app.delete('/cart/:id', db.deleteCart);

/**
 * @swagger
 * /cart/{id}/checkout:
 *   post:
 *     tags:
 *       - Cart
 *     description: Translate cart into order. Delete cart.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: cart id
 *         in: path
 *         required: true
 *         default: 1

 *       - name: checkout
 *         description: checkout object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Checkout'
 *     responses:
 *       204:
 *         description: Checkout succesfull
 */
app.post('/cart/:id/checkout', db.cartCheckout);

//------------------------------------------------------------- Orders "CRUD"
/**
 * @swagger
 * /orders:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns orders
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All the orders
 *         schema:
 *           $ref: '#/definitions/Order'
 */
app.get('/orders', db.getOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns a single order
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Order's id
 *         in: path
 *         required: true
 *         type: integer
 *         default: 1
 *     responses:
 *       500:
 *         description: Server/Database error. Check Reason.
 *       404:
 *         description: Order id not found.
 *       200:
 *         description: A single order
 *         schema:
 *           $ref: '#/definitions/Order'
 */
app.get('/orders/:id', db.getOrderById);

/**
 * @swagger
 * /orders/{id}/products:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns all products of an order
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Order's id
 *         in: path
 *         required: true
 *         type: integer
 *         default: 1
 *     responses:
 *       500:
 *         description: Server/Database error. Check Reason.
 *       404:
 *         description: Order id not found.
 *       200:
 *         description: Products of the specified order id.
 */
app.get('/orders/:id/products', db.getOrderProducts);



app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
})

app.listen(port, () => {
    console.log(`Listening on post ${port}.`);
})

