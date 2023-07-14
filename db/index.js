const Pool = require('pg').Pool;
// Node-postgres docs: https://node-postgres.com/

const { isValid } = require('creditcard.js');
const format = require('pg-format');
var bcrypt = require('bcryptjs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dolly_store',
    password: 'password',
    post: 5432
});

const getUsers = (req, res) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if(error){
            throw error
        }
        res.status(200).json(results.rows);
    })}



const getUserByEmail = function (email, cb) {
    process.nextTick(function () {
        pool.query('SELECT * FROM users WHERE email = $1',[email], (error, results) => {
            if(error) return cb(error);
            return cb(null, results.rows[0])
        })
    })
  };



const getUserById = (req,res)=> {
    const userId = parseInt(req.params.id);
    pool.query('SELECT * FROM users WHERE id = $1', [userId], (error, results) => {
        if(error){
            res.status(400).json({Reason: error.detail})
        } else if(!results.rows.length){
            res.status(400).json({Reason: `User with id: ${userId} does not exist.`});
        }
        res.status(200).json(results.rows);
    })
}

const loginUser = (req, res) => {
    const { email, password } = req.body;
    getUserByEmail(email, (err, user) => {
        if (!user) return res.status(403).json({ msg: "User not found!"})

        //Compare hash 
        const passMatch = bcrypt.compareSync(password, user.password);
        //If match, store the user in the session
        if (passMatch){
            req.session.isAuthenticated = true;
            req.session.user = {
            email,
            password,
            first_name: user.first_name,
            last_name: user.last_name,
            };
            console.log(res);
            res.status(200).json({ status: 200, msg: "Succesful"});
        } else {
            res.status(403).json({ msg: "Bad Credentials"});
        }
    })
}

const registerUser = async (req, res) => {
    const {email, password, firstName, lastName} = req.body;
    //Generate the next id from users Table
    const result = await pool.query(`SELECT id FROM users ORDER BY id DESC`);
    const nextUserId = result.rows[0].id + 1; 

    //Check is user email alredy exists in the DB
    const checkingRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if(checkingRes.rows[0]){
        res.status(409).json({msg: "User email already exists"});
    } else {
        const salt = bcrypt.genSaltSync(10);
        console.log(salt);
        const hash = bcrypt.hashSync(password, salt);
        console.log(hash);
        const storeuserRes = await pool.query('INSERT INTO users(id, email, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5)',
        [nextUserId, email, hash, firstName, lastName]);
        res.status(201).json({status: 201, msg: "Succesful"});
    }   
}




const deleteUser = (req, res) => {
    const id = req.params.id;
    pool.query('DELETE FROM users WHERE id = $1', [id],
        (error, results) => {
            if(error) {
                res.status(400).json({Reason: error.detail});
            };
            res.status(204).json([{
                "content": "Delete succesful"
            }])
        })
}

// -------------- PRODUCTS -----------------------
const getProdById = (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM products WHERE id = $1', [id], (error, results) => {
        if(error) 
        {
            res.status(400).json({Reason: error.detail})
        } else if(!results.rows.length){
            res.status(400).json({Reason: `No products with id: ${id}.`})
        }
        else {
            res.status(200).json(results.rows)
        };
        
    })
};

// get products by minimum heigth:
const getProdByHeigth = (req, res) => {
    const minHeigth = req.query.heigth;
    if(minHeigth){
        pool.query('SELECT * FROM products WHERE heigth > $1', [minHeigth], (error, results) => {
            if(error) throw error;
            if(results.rows == "") {
                res.status(204).json({msg: "No product to return."})
            }
            res.status(200).json(results.rows);
        })
    } else {
        pool.query('SELECT * FROM products', (error, results) => {
            if(error) throw error;
            if(results.rows == "") {
                res.status(204).json({msg: "No product to return."})
            }
            res.status(200).json(results.rows);
        })
    }
    
}
// ----------------- CART ------------------
const getCartById = (req, res) => {
    const cartId = req.params.id;
    pool.query(`SELECT 
                    users.email,
                    cart.id
                FROM users, cart
                WHERE users.id = cart.user_id
                AND cart.id = ${cartId};`, 
        (error, results) => {
            if(error) {
                res.status(400).json({Reason: error.detail});
            };
            res.status(200).json(results.rows)
        })
}

const postCart = async (req, res) => {
    let nextCartId;
    const userId = parseInt(req.query.userid);
    const items =  Object.keys(req.body);

    if(!userId || !items.length) {
        return res.status(404).json({Reason: "User id and cart products are required."});
    } 
    
    const result = await pool.query(`SELECT id FROM cart ORDER BY id DESC`);
    nextCartId = result.rows[0].id + 1; 

    // insert ROW in cart TABLE
    try {
        const { rows } = await pool.query(`INSERT INTO cart (id, user_id)
                VALUES (${nextCartId}, ${userId})`)
    } catch(err){
        return res.status(500).json({Reason: err.detail});
        
    }

    // insert rows in cart_products Table
    for (const prop in req.body){
        const item = parseInt(req.body[prop]);
        try {
            const result = await pool.query(`INSERT INTO cart_products (cart_id, product_id)
            VALUES (${nextCartId}, ${item})`);
        } catch (err) {
            return res.status(500).json({Reason: err.detail});
        }
        
    }
    res.status(201).json({msg: "Cart completele posted to DB."});
}

const deleteCart = (req, res) => {
    const cartId = req.params.id;
    pool.query(`DELETE FROM cart WHERE id = ${cartId}`, 
            (err, results) => {
                if(err) return res.status(404).json({Reason: err.detail});
                res.status(204).send();
            });
}


const cartCheckout = async (req, res) => {
    const cartId = req.params.id;
    const { cardNumber, userId  } = req.body;
    let cartExists;

    // 1. check cart
    const results = await pool.query(`SELECT * FROM cart WHERE cart.id = ${cartId}`);
    if(!results.rows.length) return res.status(404).json({Reason : `Cart with id = ${cartId} does not exist.`});
    // 2. check card number
    if(!isValid(cardNumber)) return res.status(406).json({Reason: "Card number incorect."});

    console.log("Cart and CardNumber checks passed.");
    
    // 3. create order
    // Find next order id:
    const lastOrderId = await pool.query(`SELECT MAX(id) as id FROM "order"`);
    const nextOrderId = parseInt(lastOrderId.rows[0].id) + 1;
    //  Create order: (id, user_id, time_date)
    const result = await pool.query(`INSERT INTO "order" (id, user_id, time_date)
                VALUES (${nextOrderId}, ${userId}, NOW());`)

//   Create orders_products (order_id, product_id)
    //Extract all products (by id) of a particular cart
    const {rows} = await pool.query( // expected carProducts = [1, 5, 3]
        `SELECT 
            product_id
        FROM cart_products, cart
        WHERE cart_products.cart_id = cart.id
        AND cart.id = ${cartId};`);
    // Formatting like [[order_id, 1], [order_id, 5], [order_id, 3]]
    let order_prod =[];
    for(const prod of rows) {
        order_prod.push([nextOrderId, prod.product_id]);
    }
    
    let query = format(
        'INSERT INTO orders_products (order_id, product_id) VALUES %L', order_prod);
    try {
        let results = await pool.query(query);
    } catch(err) {
        return res.status(404).json({Reason: err.detail});
    }
    // 4. delete cart 

    pool.query(`DELETE FROM cart WHERE id = ${cartId}`, (error, results) => {
        if(error) return res.status(404).json({Reason: error.detail});
        console.log("All done!");
        return res.status(204).send();
    });
    
}

//------------------ ODERS -----------------
const getOrders = (req, res) => {
    pool.query(`SELECT 
                    users.id AS "user_id",
                    users.email,
                    users.first_name,
                    COUNT(products.name) AS Products
                FROM users, "order", orders_products, "products"
                WHERE users.id = "order".user_id
                AND "order".id = orders_products.order_id
                AND orders_products.product_id = products.id
                GROUP BY users.id, users.email, users.first_name;`, 
        (error, results) => {
            if(error) return res.status(404).json({error});
            res.status(200).json(results.rows);
        }
)};

const getOrderById = (req, res) => {
    const orderId = req.params.id;
    pool.query(`SELECT "order".id, users.email, users.first_name 
                FROM "order", users
                WHERE "order".user_id = users.id
                AND "order".id = ${orderId};`,
        (error, results) => {
            if(error) {
                return res.status(500).json({Reason: error.detail});
            } else if(!results.rows.length){
                return res.status(404).json({Reason: `Order id ${orderId} does not exist.`});
            };
            res.status(200).json(results.rows);
        })
}

const getOrderProducts = (req, res) => {
    const orderId = req.params.id;
    pool.query(`SELECT
                    "order".id AS order_id,
                    orders_products.product_id,
                    products.name AS product_name
                FROM "order", orders_products, products
                WHERE "order".id = orders_products.order_id
                AND orders_products.product_id = products.id
                AND "order".id = ${orderId};`,
    (error, results) => {
    if(error) {
        return res.status(500).json({Reason: error.detail})
    } else if(!results.rows.length){
        return res.status(404).json({Reason: `Order id ${orderId} does not exist.`});
    };
    res.status(200).json(results.rows);
})

}

module.exports = {
    //----users----
    getUsers,
    getUserById,
    loginUser,
    registerUser,
    deleteUser,
    getUserByEmail,
    //----prods----
    getProdById,
    getProdByHeigth,
    //----cart
    getCartById,
    postCart,
    deleteCart,
    cartCheckout,
    //----orders---
    getOrders,
    getOrderById,
    getOrderProducts
};
