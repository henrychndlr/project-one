--table name = name of whatever the table is holding
--key name = table name + "_id"
--DONT ABBREVIATE NAMES
--check address table is there already - SELECT * FROM address ORDER BY first_line;
--foreign key constraint between 
 
-- DROP TABLE order_line;
-- DROP TABLE order_header;
-- DROP TABLE card;
-- DROP TABLE person;
-- DROP TABLE address;
-- DROP TABLE item;
 
-- CREATE TABLE address
-- (address_id INT AUTO_INCREMENT PRIMARY KEY,
-- first_line VARCHAR,
-- second_line VARCHAR,
-- county VARCHAR,
-- postcode VARCHAR,
-- country VARCHAR );
 
-- CREATE TABLE card
-- (card_id INT AUTO_INCREMENT PRIMARY KEY,
-- card_number VARCHAR(20) NOT NULL,
-- expiration_date DATE NOT NULL,
-- cvc INT(3) NOT NULL,
-- person_id INT NOT NULL );
 
-- insert into card (card_number,expiration_date,cvc,holder_name) values ('0123 4567 8987 6543','24-06-01','123','Henry Chandler');
 
-- CREATE TABLE item
-- (item_id INT AUTO_INCREMENT PRIMARY KEY,
-- description VARCHAR(500),
-- cost VARCHAR(50) NOT NULL,
-- item_name VARCHAR(50) NOT NULL );
 
-- insert into item (description,cost,item_name) values ('A very useful tool','20','Tool');
 
-- CREATE TABLE order_line
-- (order_line_id INT AUTO_INCREMENT PRIMARY KEY,
-- order_header_id INT NOT NULL,
-- item_id INT NOT NULL, 
-- cost INT NOT NULL );
 
-- insert into order_line () 

-- CREATE TABLE order_header
-- (order_header_id INT AUTO_INCREMENT PRIMARY KEY,
-- order_line_id INT NOT NULL,
-- person_id INT NOT NULL,
-- date DATE NOT NULL,
-- address_id NOT NULL,
-- total_cost INT NOT NULL );    
 
-- CREATE TABLE person
-- (person_id INT AUTO_INCREMENT PRIMARY KEY,
-- address_id INT NOT NULL,
-- name VARCHAR NOT NULL,
-- age INT NOT NULL,
-- card_id INT NOT NULL );



-- DROP TABLE IF EXISTS order_line;
-- DROP TABLE IF EXISTS order_header;
-- DROP TABLE IF EXISTS card;
-- DROP TABLE IF EXISTS person;
-- DROP TABLE IF EXISTS address;
-- DROP TABLE IF EXISTS item;

-- Show all foreign key constraints and delete them:

-- SELECT 
--     table_name, 
--     constraint_name 
-- FROM 
--     information_schema.table_constraints 
-- WHERE 
--     constraint_type = 'FOREIGN KEY' 
--     AND table_schema = 'henrydb';

-- ALTER TABLE tableName DROP FOREIGN KEY foreign_key_constraint_name;





--Or if you dont wanna destroy all the key constraints, do:
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_line;
TRUNCATE TABLE card;
TRUNCATE TABLE address;
TRUNCATE TABLE item;
TRUNCATE TABLE person;
TRUNCATE TABLE order_header;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    first_line VARCHAR(100) NOT NULL,
    second_line VARCHAR(100) NOT NULL,
    county VARCHAR(50) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL
);


CREATE TABLE item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(500),
    cost DECIMAL(10, 2) NOT NULL,
    item_name VARCHAR(50) NOT NULL
);


CREATE TABLE card (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    card_number VARCHAR(20) NOT NULL,
    expiration_date DATE NOT NULL,
    cvc INT NOT NULL,
    person_id INT NOT NULL
);


CREATE TABLE person (
    person_id INT AUTO_INCREMENT PRIMARY KEY,
    address_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    card_id INT,
    CONSTRAINT fk_person_address FOREIGN KEY (address_id) REFERENCES address(address_id)
);


ALTER TABLE card
ADD CONSTRAINT fk_card_person FOREIGN KEY (person_id) REFERENCES person(person_id);


ALTER TABLE person
ADD CONSTRAINT fk_person_card FOREIGN KEY (card_id) REFERENCES card(card_id);


INSERT INTO address (first_line, second_line, county, postcode, country)
VALUES ('Firlands', 'Cuckfield Road', 'West Sussex', 'RH15 8RE', 'UK');


INSERT INTO person (address_id, name, age, card_id)
VALUES (1, 'Henry Chandler', 30, NULL);


INSERT INTO card (card_number, expiration_date, cvc, person_id) 
VALUES ('0123 4567 8987 6543', '2024-06-01', 123, 1);

-- Update person table to set card_id now that card record exists
UPDATE person SET card_id = 1 WHERE person_id = 1;


INSERT INTO item (description, cost, item_name) 
VALUES ('A very useful tool', '20.00', 'Tool');


CREATE TABLE order_header (
    order_header_id INT AUTO_INCREMENT PRIMARY KEY,
    person_id INT NOT NULL,
    date DATE NOT NULL,
    address_id INT NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_header_person FOREIGN KEY (person_id) REFERENCES person(person_id),
    CONSTRAINT fk_order_header_address FOREIGN KEY (address_id) REFERENCES address(address_id)
);


CREATE TABLE order_line (
    order_line_id INT AUTO_INCREMENT PRIMARY KEY,
    order_header_id INT NOT NULL,
    item_id INT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_line_order_header FOREIGN KEY (order_header_id) REFERENCES order_header(order_header_id),
    CONSTRAINT fk_order_line_item FOREIGN KEY (item_id) REFERENCES item(item_id)
);


INSERT INTO order_header (person_id, date, address_id, total_cost)
VALUES (1, '2024-06-01', 1, 20.00);


INSERT INTO order_line (order_header_id, item_id, cost) 
VALUES (1, 1, 20.00);

To view these tables together once information has been put in them, use:
SELECT
    p.person_id,
    p.name AS person_name,
    a.first_line,
    a.second_line,
    a.county,
    a.postcode,
    a.country,
    c.card_number,
    c.expiration_date,
    c.cvc,
    oh.order_header_id,
    oh.date AS order_date,
    oh.total_cost AS order_total_cost,
    i.item_id,
    i.item_name,
    i.description AS item_description,
    ol.cost AS line_cost,
    ol.order_line_id
INTO OUTFILE '/tmp/totaltables.txt'
FROM
    person p
    LEFT JOIN address a ON p.address_id = a.address_id
    LEFT JOIN card c ON p.card_id = c.card_id
    LEFT JOIN order_header oh ON p.person_id = oh.person_id
    LEFT JOIN order_line ol ON oh.order_header_id = ol.order_header_id
    LEFT JOIN item i ON ol.item_id = i.item_id;

-- Ideas - add website which is a form of some type, asks you to insert this information. Then adds it
-- to the tables, and there needs to be a little bit of python, so when a new form is submitted, the 
-- value of order_header_id, item_id, address_id, person_id and card_id all match with each other and
-- increase by 1 every time a new form is submitted. Makes it so a table cant have two different sets
-- of info with the same table_id  










--Example tables and foreign key constraints

CREATE TABLE employee (
    employee_id INT NOT NULL PRIMARY KEY,
    employee_name VARCHAR(50),
    employee_age INT,
    employee_salary INT
);

create table department (
    department_id INT NOT NULL PRIMARY KEY,
    department_name VARCHAR(50),
    employee_id INT,
    CONSTRAINT fk_department_employee_id FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
);

-- Insert some data into the tables

INSERT INTO employee (employee_id, employee_name, employee_age, employee_salary) 
VALUES (1, 'John Doe', 30, 50000), 
       (2, 'Jane Smith', 25, 60000);

INSERT INTO department (department_id, department_name, employee_id) 
VALUES (1, 'HR', 1), 
       (2, 'Engineering', 2);

--Test it's all working

SELECT 
    e.employee_id, 
    e.employee_name, 
    e.employee_age, 
    e.employee_salary, 
    d.department_name 
FROM 
    employee e
JOIN 
    department d ON e.employee_id = d.employee_id;