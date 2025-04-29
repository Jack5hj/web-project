
USE sec2_gr13_database;
CREATE TABLE IF NOT EXISTS patient (
  patient_id   INT             AUTO_INCREMENT PRIMARY KEY,
  avatar       VARCHAR(255),
  first_name   VARCHAR(50)     NOT NULL,
  last_name    VARCHAR(50)     NOT NULL,
  password     VARCHAR(100)    NOT NULL,
  email        VARCHAR(100)    UNIQUE NOT NULL,
  phone        VARCHAR(20),
  gender       ENUM('Male','Female','Other'),
  dob          DATE,
  created_at   DATETIME        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE IF NOT EXISTS massage_service (
  service_id       INT           AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100), 
  description VARCHAR(255),
  category    varchar(255),
  duration_minutes INT,
  price            DECIMAL(10,2),
  img_url       VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE IF NOT EXISTS service_variant (
  variant_id       INT           AUTO_INCREMENT PRIMARY KEY,
  service_id       INT           NOT NULL,
  duration_minutes INT           NOT NULL,  
  price            DECIMAL(10,2) NOT NULL, 
  FOREIGN KEY (service_id)
    REFERENCES massage_service(service_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS appointment (
  appointment_id   INT            AUTO_INCREMENT PRIMARY KEY,
  patient_id       INT            NOT NULL,
  service_id       INT            NOT NULL,
  appointment_date DATE           NOT NULL,
  appointment_time TIME           NOT NULL,
  duration_used   INT 			  NOT NULL,
  price_snapshot    DECIMAL(10,2)  NOT NULL,
  status            ENUM('pending','confirmed','completed','canceled')
                      DEFAULT 'pending',
  created_at        DATETIME       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id)
    REFERENCES patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (service_id)
    REFERENCES massage_service(service_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS patient_setting (
  setting_id               INT       AUTO_INCREMENT PRIMARY KEY,
  patient_id               INT       NOT NULL,
  prefers_female_therapist BOOLEAN   DEFAULT FALSE,
  notification_opt_in      BOOLEAN   DEFAULT TRUE,
  notes                    TEXT,
  FOREIGN KEY (patient_id)
    REFERENCES patient(patient_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payment (
  payment_id      INT             AUTO_INCREMENT PRIMARY KEY,
  appointment_id  INT             NOT NULL,
  payment_method  ENUM('Visa','QR','Cash') NOT NULL,
  payment_status  ENUM('paid','unpaid')    DEFAULT 'unpaid',
  amount          DECIMAL(10,2),
  payment_time    DATETIME,
  FOREIGN KEY (appointment_id)
    REFERENCES appointment(appointment_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO massage_service (name, description, category, img_url) VALUES
('Foot Massage',        'Relax your feet',       'Foot',        '/images/foot.png'),
('Head Massage',        'Stress relief',         'Head',        '/images/head.jpg'),
('Body Massage',        'Full body relaxation',  'Body',        '/images/body.jpg'),
('Oil Massage',         'Aromatic oil treatment','Relaxation', '/images/oil.png'),
('Massage for Kid',     'Light and fun',         'Kids',        '/images/kid.png'),
('Thai Style Massage',  'Traditional Thai style','Traditional', '/images/thai.png'),
('Aromatherapy Massage','With essential oils',   'Aroma',       '/images/aromatherapy.jpg'),
('Facial Massage',      'Gentle facial massage', 'Facial',      '/images/face.png');


INSERT INTO service_variant (service_id, duration_minutes, price) VALUES
  -- Foot Massage 
  (1,  60,  400.00),
  (1,  90,  650.00),
  (1, 120,  800.00),

  -- Head Massage 
  (2,  60, 400.00),
  (2,  90, 650.00),

  -- Body Massage 
  (3,  60, 600.00),
  (3,  90, 800.00),
  (3, 120,1000.00),

  -- Oil Massage 
  (4,  60, 600.00),
  (4,  90,1100.00),
  (4, 120,1200.00),

  -- Massage for Kid 
  (5,  60, 400.00),
  (5,  90, 600.00),

  -- Thai Style Massage 
  (6,  60, 500.00),
  (6,  90, 800.00),

  -- Aromatherapy Massage 
  (7,  60, 600.00),
  (7,  90, 900.00),

  -- Facial Massage 
  (8,  60, 600.00),
  (8,  90,1000.00),
  (8, 120,1200.00);


