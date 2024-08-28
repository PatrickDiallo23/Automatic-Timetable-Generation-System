```shell
podman volume create data
podman-compose -f ./compose.yaml up
```

```shell
export POSTGRES_USERNAME=postgres
export POSTGRES_PASSWORD=postgres
export HOSTNAME=localhost
export PORT=5432
export DATABASENAME=postgres
psql postgres://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${HOSTNAME}:${PORT}/${DATABASENAME}
```

```sql
create user timetable with password 'timetable';
create database timetable;
grant all privileges on database timetable to timetable;

\connect timetable
grant all privileges on schema public to timetable;

insert into users (email, password, role)
values ('admin', '$2a$10$N95E35ktrigooZC70VzVXe3QGUDDbvqScT1TmY3OXRmn6Bod4b1CS', 'ADMIN');
```
