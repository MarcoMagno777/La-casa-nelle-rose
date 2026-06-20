CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS furniture (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  placement VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL,
  period VARCHAR(80) NOT NULL,
  images JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
  user_id INT UNSIGNED NOT NULL,
  furniture_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, furniture_id),
  CONSTRAINT favorites_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT favorites_furniture_fk FOREIGN KEY (furniture_id) REFERENCES furniture(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  furniture_id INT UNSIGNED NULL,
  subject VARCHAR(220) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inquiries_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT inquiries_furniture_fk FOREIGN KEY (furniture_id) REFERENCES furniture(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT password_resets_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX password_resets_user_idx (user_id),
  INDEX password_resets_expires_idx (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_visits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(255) NOT NULL,
  user_agent VARCHAR(255) NULL,
  ip_hash CHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX site_visits_created_idx (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO users (username, email, password_hash) VALUES
('camille', 'camille@example.com', '$2y$10$oe2xagg0Mllfe8mx1/CJLu5JJ8uYoZ39CqBZJJuEnotspqBbsNjTm');

DELETE FROM favorites;
DELETE FROM furniture;
ALTER TABLE furniture AUTO_INCREMENT = 1;

INSERT INTO furniture (name, description, placement, category, period, images) VALUES
(
  'Armadi letti',
  'Selezione di armadi, letti e portemanteau francesi scelti per atmosfera, patina e semplicita.',
  'Zona notte, ingresso, guardaroba',
  'Armadi letti',
  'Arredi francesi e provenzali',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/80568f31-1ca9-47e4-8336-6209bcc38436.jpg',
    'https://www.lacasanellerose.com/datastore/b5b8179e-0175-4766-9d68-fa9869c41c98.jpg',
    'https://www.lacasanellerose.com/datastore/4d6e451f-ea5b-440a-8070-de99a5092a99.jpg'
  )
),
(
  'Arredi da esterno',
  'Elementi per giardino e spazi aperti, con materiali vissuti e linee leggere.',
  'Giardino, veranda, terrazza',
  'Arredi da esterno',
  'Outdoor provenzale',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/c840ee5d-75b5-492a-89a6-f897721a5d49.jpg',
    'https://www.lacasanellerose.com/datastore/f273ed13-33be-498e-8992-7d764f1dc9fc.jpg',
    'https://www.lacasanellerose.com/datastore/b97c2ef3-219b-41d4-b8af-f28fa3cabe35.jpg'
  )
),
(
  'Attaccapanni',
  'Portemanteau e attaccapanni decorativi, perfetti per ingressi e disimpegni.',
  'Ingresso, corridoio, guardaroba',
  'Attaccapanni',
  'Rocaille e provenzale',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/72110e0a-3f02-4e29-9cf9-ba52195459ba.jpg',
    'https://www.lacasanellerose.com/datastore/a255db25-3a94-46f7-ab5b-0c97172465f9.jpg',
    'https://www.lacasanellerose.com/datastore/80568f31-1ca9-47e4-8336-6209bcc38436.jpg'
  )
),
(
  'Complementi d''arredo',
  'Vasi, potiche, cachepot e piccoli oggetti scelti per completare la casa con misura.',
  'Salotto, consolle, libreria',
  'Complementi d''arredo',
  'Decorazione',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/c714e909-aa99-478c-9c89-dd6cba15011c.png',
    'https://www.lacasanellerose.com/datastore/cc971030-f458-486a-be98-6772e7d80b66.jpg',
    'https://www.lacasanellerose.com/datastore/3cccfad7-ebba-4d97-82e0-3597720053c1.png'
  )
),
(
  'Credenze doppiocorpo vetrine',
  'Credenze, vetrine e doppi corpi francesi per sale da pranzo e ambienti di carattere.',
  'Sala da pranzo, cucina, soggiorno',
  'Credenze doppiocorpo vetrine',
  'LXV e LXVI',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/90ae057a-858a-4c9e-a00f-45059932a329.jpg',
    'https://www.lacasanellerose.com/datastore/1666f283-af3b-4725-9541-66e3333f1db6.jpg',
    'https://www.lacasanellerose.com/datastore/96d348ec-91d0-4b40-8a9a-740475c32c1d.jpg'
  )
),
(
  'Cassettoni comodini toilette',
  'Cassettoni, comodini e toilette con patine calde, proporzioni eleganti e dettagli originali.',
  'Camera, corridoio, zona notte',
  'Cassettoni comodini toilette',
  'LXV e Rocaille',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/3dc11d90-fd42-4c2a-9520-7fdc6c20975d.JPG',
    'https://www.lacasanellerose.com/datastore/36d8b716-4b3e-4893-83ec-b457006bbc8e.JPG',
    'https://www.lacasanellerose.com/datastore/74838722-8b16-45ad-aefe-6544c2a22b48.jpg'
  )
),
(
  'Quadri',
  'Dipinti, acquerelli, stampe e collezioni decorative per dare voce alle pareti.',
  'Pareti, ingresso, studio',
  'Quadri',
  'Decorazione pittorica',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/420b7493-39b8-4d9d-8ee3-6f030bf7d8a3.jpg',
    'https://www.lacasanellerose.com/datastore/5d44dc43-0d7a-4483-a508-7567effdfd5c.JPG',
    'https://www.lacasanellerose.com/datastore/6227e66a-35f0-4cfb-b45a-f48055c9bb9f.jpg'
  )
),
(
  'Tavoli e sedie',
  'Tavoli, sedie provenzali e gruppi da pranzo per ambienti conviviali.',
  'Sala da pranzo, cucina, veranda',
  'Tavoli e sedie',
  'LXV provenzale',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/39715f74-ee74-4bd2-a99c-8327a59529e0.jpg',
    'https://www.lacasanellerose.com/datastore/f619ccba-4666-4907-806f-577337c6abef.jpg',
    'https://www.lacasanellerose.com/datastore/cf9614cf-2ce7-495c-b0b7-ec6cb80bf4c0.png'
  )
),
(
  'Divani nuovi',
  'Divani e imbottiti nuovi pensati per dialogare con arredi antichi e atmosfere francesi.',
  'Salotto, camera, studio',
  'Divani nuovi',
  'Imbottiti',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/243c61fe-bf16-46f1-8166-8891e526e097.jpg',
    'https://www.lacasanellerose.com/datastore/e8271cfb-518d-41e7-88bc-d62704c227e9.jpg',
    'https://www.lacasanellerose.com/datastore/571d3d04-7878-4251-8940-3d72d64f6e13.jpg'
  )
),
(
  'Oggetti insoliti',
  'Piccoli pezzi fuori dal comune, accessori da camino, manichini, busti e curiosita.',
  'Camino, ingresso, scenografie domestiche',
  'Oggetti insoliti',
  'Curiosita',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/f6e0b96d-e987-406e-9105-89ba6b2395be.jpg',
    'https://www.lacasanellerose.com/datastore/60d742d0-fb38-4ffc-9961-6c17bb23d6cf.png',
    'https://www.lacasanellerose.com/datastore/73455a73-ce92-431e-81dc-92106c02a016.jpg'
  )
),
(
  'Libreria Etager Mobiletti',
  'Librerie, etagere e mobiletti per organizzare libri, oggetti e collezioni.',
  'Studio, soggiorno, corridoio',
  'Libreria Etager Mobiletti',
  'Mobili contenitori',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/a3451b10-741d-4526-916f-9622af264936.jpg',
    'https://www.lacasanellerose.com/datastore/2789cf78-1ebc-493f-b148-d95484fa742a.jpg',
    'https://www.lacasanellerose.com/datastore/e48ee8db-615a-4dd1-921e-cffe1f2bd679.jpg'
  )
),
(
  'Scrittoi tavolini consolle',
  'Scrittoi, tavolini e consolle francesi per angoli studio e punti focali della casa.',
  'Studio, ingresso, salotto',
  'Scrittoi tavolini consolle',
  'LXV e LXVI',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/00b41e65-6049-49e3-931b-b0ba5cd55cf9.jpg',
    'https://www.lacasanellerose.com/datastore/533a3ff4-ef99-4178-b7a7-27250dfc4386.jpg',
    'https://www.lacasanellerose.com/datastore/a200bc87-bd58-456d-b932-b4e84a68e26d.jpg'
  )
),
(
  'Poltrone e Divani',
  'Poltrone, divanetti e sedute imbottite con tessuti, paglia di Vienna e linee francesi.',
  'Salotto, camera, zona lettura',
  'Poltrone e Divani',
  'Sedute francesi',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/84d4094d-d802-4416-81f3-e55460f41907.JPG',
    'https://www.lacasanellerose.com/datastore/3b778d7d-46b9-411b-b3d9-9aef5c4b900f.jpg',
    'https://www.lacasanellerose.com/datastore/a07ec244-7c2e-4c31-a904-d54b15b3046e.jpg'
  )
),
(
  'Specchiere',
  'Specchiere dorate, laccate e in pastiglia, dalle caminiere alle piccole coppie decorative.',
  'Ingresso, camino, camera',
  'Specchiere',
  'Decorazione',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/266ca70a-0ca9-4076-ba86-7a91d1728f46.jpg',
    'https://www.lacasanellerose.com/datastore/70165bf6-5dd6-47b1-82f8-2a5ff335b1e8.jpg',
    'https://www.lacasanellerose.com/datastore/355b12a4-10e9-49fd-a268-8654969f7b5d.jpg'
  )
),
(
  'Lampade,lampadari,applique',
  'Lampade, lampadari e applique per illuminare la casa con dettagli antichi e decorativi.',
  'Salotto, camera, corridoio',
  'Lampade,lampadari,applique',
  'Illuminazione',
  JSON_ARRAY(
    'https://www.lacasanellerose.com/datastore/0c0837a5-aafe-46c9-af9d-2e12f6ac03d6.png',
    'https://www.lacasanellerose.com/datastore/cf8b5dc1-f760-4b9d-b44c-5a90e9f74090.png',
    'https://www.lacasanellerose.com/datastore/fc81794c-e844-40f1-8181-178e7ddb2e1f.jpg'
  )
);

INSERT IGNORE INTO favorites (user_id, furniture_id) VALUES (1, 1), (1, 4);
