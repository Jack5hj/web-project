// app.js
const express    = require('express');
const mysql2     = require('mysql2');
const bodyParser = require('body-parser');
const multer     = require('multer');
const bcrypt     = require('bcrypt');
const path       = require('path');
const jwt        = require('jsonwebtoken');

const JWT_SECRET = 'lysywebproject';
const PORT       = 3000;
const app        = express();

// -- static files under http/ --
app.use(express.static(path.join(__dirname, 'http')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());

const pool = mysql2.createPool({
  host:            'localhost',
  user:            'lysy',
  password:        'lysy12345678',
  database:        'sec2_gr13_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit:      0
});
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) =>
      err ? reject(err) : resolve(results)
    );
  });
}

function authenticate(req, res, next) {
  const auth  = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/, '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.patientId = payload.patientId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/avatars'),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fn  = Date.now() + '-' + Math.random().toString(36).slice(2);
    cb(null, fn + ext);
  }
});
const upload = multer({ storage });

app.post(
  '/api/auth/register',
  upload.single('avatar'),
  async (req, res) => {
    try {
      const { first_name, last_name, password, email, phone, gender, dob } = req.body;
      if (!first_name || !last_name || !password || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const hash      = await bcrypt.hash(password, 10);
      const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

      const result = await query(
        `INSERT INTO patient
           (first_name, last_name, password, email, phone, gender, dob, avatar)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [ first_name, last_name, hash, email, phone||null, gender||null, dob||null, avatarUrl ]
      );

      res.json({ message: 'Registration successful', patientId: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const rows = await query(
      'SELECT patient_id, password FROM patient WHERE email = ?',
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { patient_id, password: hash } = rows[0];
    const match = await bcrypt.compare(password, hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ patientId: patient_id }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// === PROFILE ===

// GET profile
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const rows = await query(
      'SELECT first_name, last_name, email, phone, avatar FROM patient WHERE patient_id = ?',
      [req.patientId]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE profile
app.put('/api/profile', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, dob, password } = req.body;
    const fields = [];
    const params = [];

    if (first_name) { fields.push('first_name = ?'); params.push(first_name); }
    if (last_name)  { fields.push('last_name  = ?'); params.push(last_name);  }
    if (email)      { fields.push('email      = ?'); params.push(email);      }
    if (phone)      { fields.push('phone      = ?'); params.push(phone);      }
    if (dob)        { fields.push('dob        = ?'); params.push(dob);        }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      params.push(hash);
    }
    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      fields.push('avatar = ?');
      params.push(avatarUrl);
    }
    if (!fields.length) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    await query(
      `UPDATE patient SET ${fields.join(', ')} WHERE patient_id = ?`,
      [ ...params, req.patientId ]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot update profile' });
  }
});



// list all services (60-min default)
app.get('/api/services', async (req, res) => {
  try {
    const services = await query(`
      SELECT s.service_id, s.name, s.img_url, v.duration_minutes AS duration, v.price
      FROM massage_service AS s
      JOIN service_variant AS v
        ON v.service_id = s.service_id AND v.duration_minutes = 60
      ORDER BY s.service_id
    `);
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot fetch services' });
  }
});

// service variants (durations & prices)
app.get('/api/services/:serviceId', async (req, res) => {
  try {
    const variants = await query(
      `SELECT duration_minutes AS duration, price
         FROM service_variant
        WHERE service_id = ?
        ORDER BY duration_minutes`,
      [req.params.serviceId]
    );
    if (!variants.length) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(variants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot fetch service details' });
  }
});



app.post('/api/appointments', authenticate, async (req, res) => {
  try {
    const { serviceId, date, time, duration, price } = req.body;
    const patientId = req.patientId;
    if (!serviceId || !date || !time || !duration || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await query(
      `INSERT INTO appointment
  (patient_id, service_id, appointment_date, appointment_time, duration_used, price_snapshot)
VALUES (?,         ?,          ?,                ?,                ?,             ?)`,
      [patientId, serviceId, date, time, duration, price]
    );
    res.json({ appointmentId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot create appointment' });
  }
});



app.post('/api/payments', authenticate, async (req, res) => {
  try {
    const { appointmentId, method, amount } = req.body;
    if (!appointmentId || !method || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await query(
      `INSERT INTO payment
         (appointment_id, payment_method, amount, payment_status, payment_time)
       VALUES (?, ?, ?, 'paid', NOW())`,
      [appointmentId, method, amount]
    );
    res.json({ paymentId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot process payment' });
  }
});

app.post(
  '/api/admin/services',
  authenticate, 
  async (req, res) => {
    const { name, img_url } = req.body;
    if (!name || !img_url) {
      return res.status(400).json({ error: 'Missing name or img_url' });
    }
    try {
      const result = await query(
        `INSERT INTO massage_service (name, img_url)
         VALUES (?, ?)`,
        [name, img_url]
      );
      res.json({ serviceId: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Cannot insert service' });
    }
  }
);


app.put(
  '/api/admin/services/:serviceId',
  authenticate, 
  async (req, res) => {
    const { serviceId } = req.params;
    const { name, img_url } = req.body;
    const sets = [], params = [];
    if (name)    { sets.push('name = ?');    params.push(name); }
    if (img_url) { sets.push('img_url = ?'); params.push(img_url); }
    if (!sets.length) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    params.push(serviceId);
    try {
      await query(
        `UPDATE massage_service
           SET ${sets.join(', ')}
         WHERE service_id = ?`,
        params
      );
      res.json({ message: 'Service updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Cannot update service' });
    }
  }
);


app.delete(
  '/api/admin/services/:serviceId',
  authenticate, 
  async (req, res) => {
    const { serviceId } = req.params;
    try {
      await query(
        `DELETE FROM massage_service
         WHERE service_id = ?`,
        [serviceId]
      );
      res.json({ message: 'Service deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Cannot delete service' });
    }
  }
);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
