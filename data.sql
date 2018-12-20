DROP DATABASE IF EXISTS jobly;
CREATE DATABASE jobly;

\c jobly

CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees int NOT NULL,
    description text,
    logo_url text
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary int NOT NULL,
    equity float NOT NULL CHECK (equity >= 0 AND equity <= 1),
    company_handle text references companies(handle),
    date_posted timestamp without time zone
    ON DELETE CASCADE
);

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin boolean NOT NULL DEFAULT FALSE
);