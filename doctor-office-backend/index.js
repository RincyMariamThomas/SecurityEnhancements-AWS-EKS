//Previous file: doctor-office-backend/index.js - https://github.com/vi-kinn/Doctors-Office-Appointment-site/blob/main/doctor-office-backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const rateLimit = require('express-rate-limit'); // Import rate-limit package

const app = express();
app.use(cors());
app.use(express.json());

// Set up rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later."
});

app.use(limiter); // Apply rate limit to all routes

// Fetch AWS credentials securely from Secrets Manager instead of hardcoding them
const secretManager = new AWS.SecretsManager();
const secretName = "DynamoDBCredentials";

async function getAWSCredentials() {
  try {
    // Retrieve AWS credentials securely
    const data = await secretManager.getSecretValue({ SecretId: secretName }).promise();
    const secret = JSON.parse(data.SecretString);

    // Configure AWS with secure credentials
    AWS.config.update({
      region: process.env.AWS_REGION,
      accessKeyId: secret.AWS_ACCESS_KEY_ID, // Use secret credentials
      secretAccessKey: secret.AWS_SECRET_ACCESS_KEY
    });
  } catch (err) {
    // Handle errors if credentials retrieval fails
    console.error("Error retrieving AWS credentials: ", err);
  }
}

// Invoke function to fetch AWS credentials
getAWSCredentials();

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'Appointments';

// Get all appointments
app.get('/appointments', async (req, res) => {
  const params = {
    TableName: tableName,
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve appointments' });
  }
});

// Add a new appointment
app.post('/appointments', async (req, res) => {
  const { patientName, doctorName, date } = req.body;
  const appointmentId = String(new Date().getTime());

  const params = {
    TableName: tableName,
    Item: {
      appointmentId: appointmentId,
      patientName: patientName,
      doctorName: doctorName,
      date: date,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    res.json(params.Item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not save appointment' });
  }
});

// Delete an appointment
app.delete('/appointments/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;

  const params = {
    TableName: tableName,
    Key: {
      appointmentId: appointmentId,
    },
  };

  try {
    await dynamoDB.delete(params).promise();
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not delete appointment' });
  }
});

// Start the server on port 5000
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
