-- ─────────────────────────────────────────────────────────────────────────────
-- docker/postgres/init/01_init.sql
--
-- This script runs ONCE when the Postgres container is first created.
-- Place any initial seed data or extension setup here.
-- Flyway/Liquibase migrations in Spring Boot handle the schema itself.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- The schema and tables are created/updated by Spring Boot (ddl-auto=update)
-- No manual DDL needed here.
