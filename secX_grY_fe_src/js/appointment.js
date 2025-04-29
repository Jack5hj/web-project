const express2 = require('express');
const router2 = express2.Router();
const { query: q2 } = require('../../db');


router2.post('/', async (req, res) => {
  try {
    const { patientId, serviceId, date, time, duration, price } = req.body;
    if (!patientId || !serviceId || !date || !time || !duration || !price) {
      return res.status(400).json({ error: 'lack text' });
    }
    const result = await q2(
      `INSERT INTO appointment
         (patient_id, service_id, appointment_date, appointment_time, duration_used, price_snapshot)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientId, serviceId, date, time, duration, price]
    );
    res.json({ appointmentId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'cannot create' });
  }
});

module.exports = router2;