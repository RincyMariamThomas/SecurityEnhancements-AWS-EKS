//Previous file: doctor-office-frontend/src/App.js - https://github.com/vi-kinn/Doctors-Office-Appointment-site/blob/main/doctor-office-frontend/src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ patientName: '', doctorName: '', date: '' });
  const baseUrl = 'http://backend-service:5000/appointments';  // Updated to use Kubernetes service
//Backend URL Update: Changed the baseUrl from a hardcoded external URL to use Kubernetes service names (backend-service:5000), ensuring the frontend talks to the backend in a production-grade environment.

  
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    fetch(baseUrl)
      .then((res) => res.json())
      .then((data) => setAppointments(data));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((newAppointment) => {
        setAppointments([...appointments, newAppointment]);
        setForm({ patientName: '', doctorName: '', date: '' });
      });
  };

  const handleDelete = (appointmentId) => {
    fetch(`${baseUrl}/${appointmentId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.ok) {
          setAppointments(appointments.filter((appt) => appt.appointmentId !== appointmentId));
        }
      });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Doctor's Office Appointments</h1>
      </header>
      <main className="main-content">
        <section className="form-section">
          <form onSubmit={handleSubmit} className="appointment-form">
            <input
              placeholder="Patient Name"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              className="form-input"
            />
            <input
              placeholder="Doctor Name"
              value={form.doctorName}
              onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
              className="form-input"
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="form-input"
            />
            <button type="submit" className="submit-button">Book Appointment</button>
          </form>
        </section>

        <section className="appointments-list">
          <h2>Upcoming Appointments</h2>
          <ul className="appointment-items">
            {appointments.map((appt) => (
              <li key={appt.appointmentId} className="appointment-item">
                {appt.patientName} with Dr.{appt.doctorName} on {new Date(appt.date).toLocaleDateString()}
                <button onClick={() => handleDelete(appt.appointmentId)} className="delete-button">Delete</button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;

