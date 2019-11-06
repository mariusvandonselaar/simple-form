const express = require('express');
const mysql = require('mysql');
const bodyparser = require('body-parser');
const {Validator: JSONValidator, ValidationError: JSONValidationError} = require('express-json-validator-middleware');

const jsonvalidator = new JSONValidator();


// Define the JSON Schema
// The "(^\\S.*\\S$)|(^\\S$)" regex checks to make sure the string doesn't have any leading or trailing space.
const jsonschemaForm = {
	"type": "object",
	"additionalProperties": false,
	"minProperties": 5,
	"properties": {
		"firstname": {
			"type": "string",
			"pattern": "(^\\S.*\\S$)|(^\\S$)",
			"minLength": 1,
			"maxLength": 256
		},
		"surname": {
			"type": "string",
			"pattern": "(^\\S.*\\S$)|(^\\S$)",
			"minLength": 1,
			"maxLength": 256
		},
		"address": {
			"type": "string",
			"pattern": "(^\\S.*\\S$)|(^\\S$)",
			"minLength": 1,
			"maxLength": 256
		},
		"city": {
			"type": "string",
			"pattern": "(^\\S.*\\S$)|(^\\S$)",
			"minLength": 1,
			"maxLength": 256
		},
		"postcode": {
			"type": "string",
			"pattern": "(^\\S.*\\S$)|(^\\S$)",
			"minLength": 1,
			"maxLength": 32
		}
	}
}

// Define the queries that are gonna be used to communicate with the MySQL database
const queryCreatePeopleTable = `
	CREATE TABLE if not exists people (
		firstname varchar(256) NOT NULL,
		surname varchar(256) NOT NULL,
		address varchar(256) NOT NULL,
		city varchar(256) NOT NULL,
		postcode varchar(32) NOT NULL
	)
	DEFAULT CHARSET=utf8
	COLLATE=utf8_general_ci;
`;

const queryInsertPerson = `INSERT INTO people SET ?`;


// Create a connection to the database
// (in production it should obviously not use the root user, nor should the root user's password be blank)
const database = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'simple_form'
});

// Connect to the database, and if the connection is successful execute a query that'll make sure the "people" table exists
database.connect((err) => {
	if(err) throw err;
	
	database.query(queryCreatePeopleTable, (err) => {
		if(err) throw err;
	});
});


// Initiate the router
const router = express.Router();

// Check if the Content-Type header is json otherwise throw the Unsupported Media Type error
router.use((req, res, next) => {
	if(req.is('application/json')){
		next();
	}else{
		res.sendStatus(415);
	}
});

// Parse the body as json
router.use(bodyparser.json());

router.route('/forms')
	.post(jsonvalidator.validate({body: jsonschemaForm}), (req, res) => {
		database.query(queryInsertPerson, req.body, (err, results, fields) => {
			if(err){
				res.sendStatus(500);
				throw err;
			}

			res.sendStatus(204);
		});
	})
	// If the request method is anything other than POST send the error Method Not Allowed
	.all((req, res) => {
		res.append('Allow', 'POST').sendStatus(405);
	});

// Catch any potential errors
router.use((err, req, res, next) => {
	if(err instanceof JSONValidationError){
		res.sendStatus(400);
	}else{
		res.sendStatus(500);
		throw err;
	}
});

// Handle api route misses
router.use((req, res) => res.sendStatus(404));

module.exports = router;