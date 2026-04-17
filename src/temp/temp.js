
ALTER DATABASE "Demonstration" OWNER TO mayankpatel104;
GRANT ALL PRIVILEGES ON DATABASE "Demonstration" TO mayankpatel104;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mayankpatel104;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mayankpatel104;




psql -U postgres -d Demo -h localhost


psql -U postgres -h localhost
CREATE USER mayankpatel104 WITH PASSWORD 'Online@112018';
CREATE DATABASE "Demonstration";
ALTER DATABASE "Demonstration" OWNER TO mayankpatel104;
GRANT ALL PRIVILEGES ON DATABASE "Demonstration" TO mayankpatel104;
\c Demonstration
GRANT ALL ON SCHEMA public TO mayankpatel104;



ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO mayankpatel104;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO mayankpatel104;

psql -U mayankpatel104 -h localhost -d Demonstration

ALTER USER postgres WITH PASSWORD 'Online@112018';