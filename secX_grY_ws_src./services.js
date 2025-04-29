const express = require('express');
const router = express.Router();
const { query } = require('./db');


router.get('/', async (req, res) => {
  try {
    const sql = `
  SELECT 
    s.service_id, 
    s.name, 
    s.img_url        AS 改成 img_url
    v.duration_minutes AS duration, 
    v.price
  FROM massage_service AS s
  JOIN service_variant AS v
    ON s.service_id = v.service_id 
    AND v.duration_minutes = 60
  ORDER BY s.service_id
`;
    const services = await query(sql);
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'cannot read' });
  }
});


router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const variants = await query(
      `SELECT duration_minutes AS duration, price
         FROM service_variant
        WHERE service_id = ?
        ORDER BY duration_minutes`,
      [serviceId]
    );
    if (!variants.length) {
      return res.status(404).json({ error: 'cannot find services' });
    }
    res.json(variants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'cannot read details' });
  }
});

module.exports = router;
