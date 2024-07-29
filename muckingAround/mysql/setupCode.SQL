#table name = name of whatever the table is holding
#key name = table name + "_id"
#DONT ABBREVIATE NAMES
#check address table is there already - SELECT * FROM address ORDER BY first_line;
#foreign key constraint between 
 
DROP TABLE order_line;
DROP TABLE order_header;
DROP TABLE card;
DROP TABLE person;
DROP TABLE address;
DROP TABLE item;
 
 
CREATE TABLE card
(card_id INT AUTO_INCREMENT PRIMARY KEY,
card_number VARCHAR(20) NOT NULL,
expiration_date DATE NOT NULL,
cvc INT(3) NOT NULL,
person_id INT NOT NULL );
 
insert into card (card_number,expiration_date,cvc,holder_name) values ('0123 4567 8987 6543','24-06-01','123','Henry Chandler');
 
CREATE TABLE item
(item_id INT AUTO_INCREMENT PRIMARY KEY,
description VARCHAR(500),
cost VARCHAR(50) NOT NULL,
item_name VARCHAR(50) NOT NULL );
 
insert into item (description,cost,item_name) values ('A very useful tool','20','Tool');
 
CREATE TABLE order_line
(order_line_id INT AUTO_INCREMENT PRIMARY KEY,
order_header_id INT NOT NULL,
item_id INT NOT NULL, 
cost INT NOT NULL );
 
insert into order_line (item_id, order_header_id, cost) 

CREATE TABLE order_header
(order_header_id INT AUTO_INCREMENT PRIMARY KEY,
date DATE NOT NULL,
address_id NOT NULL,
total_cost INT NOT NULL );    
 
CREATE TABLE person
(person_id INT AUTO_INCREMENT PRIMARY KEY,
address_id INT NOT NULL,
name VARCHAR NOT NULL,
age INT NOT NULL,
card_id INT NOT NULL );