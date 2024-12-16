//Previous file: doctor-office-backend/index.js - https://github.com/vi-kinn/Doctors-Office-Appointment-site/blob/main/doctor-office-backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Using AWS Secrets Manager to fetch DynamoDB credentials
// Change: Replaced hardcoded credentials with Secrets Manager to ensure security
const secretsManager = new AWS.SecretsManager();
async function getDBCredentials() {
  const secretValue = await secretsManager.getSecretValue({ SecretId: 'dynamo-secret' }).promise();
  return JSON.parse(secretValue.SecretString);
}

// Configure AWS with environment variables and secrets
// Change: Credentials should be fetched from environment variables or secrets manager
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'Appointments';

// Get all appointments
app.get('/appointments', async (req, res) => {
  const params = { TableName: tableName };
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
    Key: { appointmentId: appointmentId },
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
