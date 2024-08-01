const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
 
// Create Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // Add this to handle JSON responses
 
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
 
// Serve the form HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
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
                            res.send('Order placed successfully!');
                            console.log('Order placed successfully!');
 
                            // Send confirmation email
                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'orderconfirmationmailer@gmail.com',
                                    pass: 'qgot lzel eonq igal'
                                }
                            });
 
                            const emailOptions = {
                                from: 'orderconfirmationmailer@gmail.com',
                                to: person_email,
                                subject: 'Order Confirmation',
                                text: `Thank you, ${person_name}, for your order. Your order details: \n\nItem: ${item_description}\nCost: ${item_cost}`
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
 

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});