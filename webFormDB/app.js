const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const nodemailer = require('nodemailer');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // Handle JSON responses

// Session middleware setup
app.use(session({
    secret: '2NjBHtyXkiOVQ2ndtN0K4BxghHfwr5nd',  // Replace with your secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'god',
    password: 'god',
    database: 'henrydb'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

// Serve static files
app.use(express.static('public'));

// Serve the main HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/main.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

app.get('/signin', (req, res) => {
    res.sendFile(__dirname + '/signin.html');
});

app.get('/status', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/place-order', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin');
    }
    res.sendFile(__dirname + '/order.html');
});

app.post('/submit-signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (password.length < 6) {
        return res.status(400).send('Password must be at least 6 characters long');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const checkEmailQuery = 'SELECT email FROM person WHERE email = ?';
        db.query(checkEmailQuery, [email], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                return res.status(400).send('Email already registered');
            }
            const insertQuery = 'INSERT INTO person (name, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [fullName, email, hashedPassword], (err, result) => {
                if (err) throw err;
                req.session.userId = result.insertId; // Set user session
                res.redirect('/place-order');
            });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.post('/submit-signin', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT person_id, password FROM person WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(401).send('Invalid credentials');
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).send('Invalid credentials');
        }

        req.session.userId = user.person_id; // Set user session
        res.redirect('/place-order');
    });
});

// Fetch items for the select element
app.get('/items', (req, res) => {
    const query = "SELECT item_id, item_name FROM item";
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
 
// Fetch item details based on selected item
app.get('/item-details', (req, res) => {
    const itemId = req.query.id;
    const query = "SELECT description, cost FROM item WHERE item_id = ?";
    db.query(query, [itemId], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});
 
// Handle form submission
app.post('/submit-order', (req, res) => {
    const { person_name, person_age, person_email, first_line, second_line, county, postcode, country, card_number, expiration_date, cvc, item_id, item_description, item_cost } = req.body;

    // Validate and parse the expiration date
    const [expMonth, expYear] = expiration_date.split('/');
    if (!expMonth || !expYear || isNaN(expMonth) || isNaN(expYear) || expMonth < 1 || expMonth > 12) {
        return res.status(400).send('Invalid expiration date format.');
    }
    const expirationDateFormatted = `20${expYear}-${expMonth}-01`;

    if (!person_name || !person_age || !person_email || !first_line || !second_line || !county || !postcode || !country || !card_number || !expiration_date || !cvc || !item_id || !item_description || !item_cost) {
        return res.status(400).send('All fields are required.');
    }

    // Insert address
    const addressQuery = "INSERT INTO address (first_line, second_line, county, postcode, country) VALUES (?, ?, ?, ?, ?)";
    db.query(addressQuery, [first_line, second_line, county, postcode, country], (err, result) => {
        if (err) throw err;
        const address_id = result.insertId;

        // Insert person
        const personQuery = "INSERT INTO person (address_id, name, age, email, card_id) VALUES (?, ?, ?, ?, NULL)";
        db.query(personQuery, [address_id, person_name, person_age, person_email], (err, result) => {
            if (err) throw err;
            const person_id = result.insertId;

            // Insert card
            const cardQuery = "INSERT INTO card (card_number, expiration_date, cvc, person_id) VALUES (?, ?, ?, ?)";
            db.query(cardQuery, [card_number, expirationDateFormatted, cvc, person_id], (err, result) => {
                if (err) throw err;
                const card_id = result.insertId;

                // Update person with card_id
                const updatePersonQuery = "UPDATE person SET card_id = ? WHERE person_id = ?";
                db.query(updatePersonQuery, [card_id, person_id], (err, result) => {
                    if (err) throw err;

                    // Insert order header
                    const orderHeaderQuery = "INSERT INTO order_header (person_id, date, address_id, total_cost) VALUES (?, NOW(), ?, ?)";
                    db.query(orderHeaderQuery, [person_id, address_id, item_cost], (err, result) => {
                        if (err) throw err;
                        const order_header_id = result.insertId;

                        // Insert order line
                        const orderLineQuery = "INSERT INTO order_line (order_header_id, item_id, cost) VALUES (?, ?, ?)";
                        db.query(orderLineQuery, [order_header_id, item_id, item_cost], (err, result) => {
                            if (err) throw err;

                            const getItemNameQuery = "SELECT item_name FROM item WHERE description = ? AND cost = ?";
                            db.query(getItemNameQuery, [item_description, item_cost], (err, result) => {
                                if (err) throw err;
                                const item_name = result[0].item_name;

                                res.send('Order placed successfully!');
                                console.log('Order placed successfully!');

                                // Send confirmation email
                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'orderconfirmationmailer@gmail.com',
                                        pass: 'your-password'
                                    }
                                });

                                const emailOptions = {
                                    from: 'orderconfirmationmailer@gmail.com',
                                    to: person_email,
                                    subject: 'Order Confirmation',
                                    text: `Thank you, ${person_name}, for your order. Your order details: \n\nItem: ${item_name}\nDescription: ${item_description}\nCost: ${item_cost}`
                                };

                                transporter.sendMail(emailOptions, (error, info) => {
                                    if (error) {
                                        console.error(`Error sending email: ${error}`);
                                        return;
                                    }
                                    console.log(`Email sent to ${person_email}.`);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
