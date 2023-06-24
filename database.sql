CREATE TABLE users(
  id uuid DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
location VARCHAR(255),
contact VARCHAR(20),
license VARCHAR(20),
gender VARCHAR(30),
date_of_birth Date,
  PRIMARY KEY(id),
  updated_at Date,
  token VARCHAR(200),
type VARCHAR(255) NOT NULL UNIQUE
);