# Automatic-Timetable-Generation-System

This project is designed to streamline and optimize the process of creating academic schedules, ensuring that resources such as time slots, faculty members,
and rooms are utilized to their fullest potential. By automating the complex task of timetable generation,
this system aims to reduce scheduling conflicts, enhance faculty and student satisfaction, and improve overall academic operations. More details can be found in the published article [Optimizing the Scheduling of Teaching Activities in a Faculty](https://www.mdpi.com/2076-3417/14/20/9554).

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running the Application](#running-the-application)
6. [Project Structure](#project-structure)
7. [API Documentation](#api-documentation)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)
11. [License](#license)
12. [Notice](#notice)

## Project Overview

In educational institutions, the process of scheduling can be a daunting challenge, often leading to resource wastage,
conflicts, and dissatisfaction among faculty and students.
This project introduces a robust solution by implementing an Automated Timetable Generation System that leverages evolutionary algorithms and multi-objective optimization techniques.
The system is designed to:

- Maximize Resource Usage: Efficiently allocate available resources including classrooms, teachers, and time slots.
- Minimize Conflicts: Prevent issues such as overlapping classes, double-booked faculty, and student timetable clashes.
- Improve Satisfaction: Generate schedules that consider the preferences and availability of both faculty members and students,
leading to a more harmonious academic environment.

## Architecture

- **Frontend**: Angular
   - Component-based architecture
   - Reactive Forms and Services for state management
   - Angular CLI for project scaffolding and build management

- **Backend**: Spring Boot
   - RESTful APIs for communication with the frontend
   - JPA/Hibernate for database interactions
   - Spring Security for authentication and authorization

- **Database**: PostgresSQL
   - Store data related to university/faculty (teachers, students, etc.)

## Prerequisites

Before setting up the project locally, ensure you have the following installed:

- **Node.js** (version 17.x or later)
- **Angular CLI** (version 17.x)
- **Java** (JDK 21 or later)
- **Maven** (version 3.2.5 or later)
- **PostgreSQL**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/PatrickDiallo23/Automatic-Timetable-Generation-System.git
cd Automatic-Timetable-Generation-System
```

### 2.Set Up the Backend (Spring Boot)
1. Navigate to the backend directory:

```bash
cd timetable-app-backend
```
2. Configure the database connection in src/main/resources/application.properties
and provide the secrete key for JWT Token:

```bash
spring.datasource.url=jdbc:postgresql://localhost:5432/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update

timetableApp.secretKey=<YOUR_GENERATED_SECRET_KEY>
```

**Note**: Make sure that you created some users with "ADMIN" or "USER" role before using the application.
**Note2**: You can use `pom.xml.bak` to switch to the Enterprise Edition of the application. `pom.xml` will run the build for the Community Edition.

### 2.1 Set Up Timefold Solver License (Enterprise Edition only)

When running the **Enterprise Edition**, you must supply a Timefold license key (`.pem` file) to prevent startup or runtime constraints. The project supports seamless key loading for both host (non-container) and container development. **All `.pem` keys are strictly ignored by Git.**

Choose the setup that matches your environment:

#### 💡 Option A: Easiest Local/IDE Run (Host/Bare-Metal)
* **Instructions:** Name your license file `timefold-license.pem` and place it in the root of the backend classpath:
  ```bash
  # Place the file directly here:
  timetable-app-backend/src/main/resources/timefold-license.pem
  ```
* **Why it works:** Timefold Solver natively checks the application classpath root. When you run `./mvnw spring-boot:run` or launch the application from your IDE, the key is automatically bundled and loaded without requiring any environment variables or aliases. It is safely ignored by Git under `*.pem` rules.

#### 🐳 Option B: Containerized Run (Docker Compose)
* **Instructions:** Place your license file in the root `secrets/` directory of the workspace:
  ```bash
  # Place the file directly here:
  secrets/timefold-license.pem
  ```
* **Why it works:** The `docker-compose.yml` base file is pre-configured to mount the host's `./secrets` directory as a **read-only volume** inside the backend container (`/app/secrets`). The `TIMEFOLD_LICENSE_PATH=./secrets/timefold-license.pem` variable is automatically injected, mapping perfectly for both host and container runs.

#### ☁️ Option C: Cloud/CI/CD (Environment Variable)
* **Instructions:** Store the license's raw PEM string in the `TIMEFOLD_LICENSE` environment variable in your environment configuration or local `.env` overrides:
  ```properties
  TIMEFOLD_LICENSE="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
  ```

---

3. Build the backend:
```bash
mvn clean install
```

### 3. Set Up the Frontend (Angular)

1. Navigate to the frontend directory:

```bash
cd timetable-app
```

2. Install the required dependencies:

```bash
npm install
```

## Running the Application

You can run the application either **locally (bare-metal)** for direct development, or fully **containerized via Docker/Podman** for parity with production.

### Option A: Running with Docker (Recommended for Dev & Prod)

The project includes a robust, production-ready containerization setup with **Docker Compose**, including a multi-stage build, automated health checks, security hardening, and an Nginx reverse proxy/load balancer.

#### Prerequisites
- **Docker Desktop** (or **Podman** with Compose support)

#### 1. Development Mode (Hot-Reload & Remote Debugging Enabled)
In development mode, a single backend instance runs alongside a pre-configured PostgreSQL database, with remote debugger ports enabled (5005) and Swagger UI fully accessible.

You can manage the dev stack with the following simple command-line interface:
- **Start the stack** (forces an initial build if `--build` is specified):
  ```bash
  ./dev.sh           # Foreground with live logging
  ./dev.sh --build   # Force rebuild and run
  ./dev.sh --detach  # Run in background (no log tail)
  ```
- **Stop the stack**:
  ```bash
  ./dev.sh stop      # Stops running dev containers
  ```
- **Wipe and reset the database** (recreates clean PostgreSQL state):
  ```bash
  ./dev.sh clean     # Stops containers and destroys Postgres volume (WIPES DB)
  ```
- **Restart the stack**:
  ```bash
  ./dev.sh restart
  ```
- **View status**:
  ```bash
  ./dev.sh ps
  ```
- **Tail logs**:
  ```bash
  ./dev.sh logs             # Tail logs of all containers
  ./dev.sh logs backend     # Tail logs of a specific service (e.g. backend, frontend)
  ```
- **Open terminal inside container**:
  ```bash
  ./dev.sh shell            # Terminal into the backend container
  ./dev.sh shell frontend   # Terminal into the frontend container
  ```

**Access Points (Dev):**
- **Frontend SPA**: [http://localhost:4200](http://localhost:4200)
- **Backend API**: [http://localhost:8200/actuator/health](http://localhost:8200/actuator/health)
- **Swagger Documentation**: [http://localhost:4200/swagger-ui.html](http://localhost:4200/swagger-ui.html)
- **Database (PostgreSQL)**: `localhost:5433` (exposed to host)
- **Remote JVM Debugger**: `localhost:5005` (attach your IDE for hot-swap/debugging)

**Creating Users in Development:**
Because the application uses BCrypt for password hashing, you cannot insert plain-text passwords directly. You can use the following command to create an admin (`admin@gmail.com`) and a regular user (`user@gmail.com`), both with the password `admin123` (hashed):

```bash
docker exec -it timetable_postgres psql -U timetable_user -d timetable_dev -c "INSERT INTO users (email, password, role) VALUES ('admin@gmail.com', '\$2a\$12\$WUDvKsIM5iOE1GlamK6UG.JzrlpUy3Y9y0u0ONiavuwclirStSw06', 'ADMIN'), ('user@gmail.com', '\$2a\$12\$WUDvKsIM5iOE1GlamK6UG.JzrlpUy3Y9y0u0ONiavuwclirStSw06', 'USER') ON CONFLICT (email) DO NOTHING;"
```

**Database Backups**

```bash
# Backup
docker exec -t timetable_postgres pg_dump -U timetable_user timetable_dev > backup.sql

# Restore later (wipes current data)
cat backup.sql | docker exec -i timetable_postgres psql -U timetable_user -d timetable_dev
```

#### 2. Production Mode (Hardened, Load-Balanced, Resource-Limited)
In production, Swagger UI is blocked for security, log rotation is enabled, cgroup memory limits are enforced for high-performance Timefold solving, and Nginx acts as a round-robin load balancer between **two active backend replicas**.

1. Copy the production environment template and populate real passwords:
   ```bash
   cp .env.prod.example .env.prod
   # Edit .env.prod to set strong passwords/secrets
   ```
2. Manage the production stack:
   - **Validate Compose configuration**:
     ```bash
     ./prod.sh --check
     ```
   - **Deploy / start production stack** (runs in background by default):
     ```bash
     ./prod.sh --build     # Force rebuild and deploy
     ./prod.sh             # Reuses cached images and deploy
     ```
   - **Stop production stack**:
     ```bash
     ./prod.sh stop
     ```
   - **Wipe production database** (prompts with an interactive confirmation before wiping):
     ```bash
     ./prod.sh clean
     ```
   - **Tail production logs**:
     ```bash
     ./prod.sh logs
     ./prod.sh logs backend
     ```
   - **Check health status**:
     ```bash
     ./prod.sh ps
     ```
   - **Access container shell**:
     ```bash
     ./prod.sh shell backend
     ```

---

### Option B: Running Locally (Bare-Metal)

#### 1. Run the Backend

Navigate to the backend directory and start the Spring Boot application:

```bash
cd timetable-app-backend
mvn spring-boot:run
```
The backend server will start on http://localhost:8200. The SWAGGER UI will be available at http://localhost:8200/swagger-ui.html.

#### 2. Run the Frontend

Navigate to the frontend directory and start the Angular application:

```bash
cd timetable-app
ng serve
```

The frontend application will start on http://localhost:4200.

## Project Structure

### Backend (Spring Boot)

- src/main/java: Contains the Java source code (controllers, services, repositories, models, etc.).
- src/main/resources: Configuration files (application.properties, static resources, etc.).
- pom.xml: Maven configuration file.

### Frontend (Angular)

- src/app: Contains the Angular components, services, and modules.
- angular.json: Angular CLI configuration file.
- package.json: Node.js dependencies and scripts.

## API Documentation

Please refer to [API Documentation](./API_Documentation.md) file for details.

## Testing

### Backend

To run tests for the Spring Boot application:

```bash
mvn test
```

### Frontend

To run unit tests for the Angular application:

```bash
ng test
```

To run end-to-end tests:

```bash
ng e2e
```

## Troubleshooting

- Ensure that your database is running and accessible with the correct credentials.
- Ensure that you added the secreteKey using HS256 Algorithm.
- Check that the backend server is running on http://localhost:8200.
- Make sure Angular is running on http://localhost:4200.
- To add Constraints in the Timetable Application copy the constraint's name (for example: "roomConflict").
You can find the defined constraints in [TimetableConstraintConfiguration.java](./timetable-app-backend/src/main/java/com/patrick/timetableappbackend/solver/TimetableConstraintConfiguration.java) class.
- For some entities, the update method doesn't work properly because it will create a new entity instead of updating.
It will be solved in a future version.
- You can configure Timefold Solver .xml file (`timetableSolverConfig.xml`) and `application.properties` in any way you want. 
Please refer to this [documentation](https://docs.timefold.ai/timefold-solver/latest/quickstart/overview).


## Contributing
Contributions are welcome! Please follow the standard GitHub workflow:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

## License

Copyright 2024 Francis-Patrick Diallo

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

## Notice

Distributions of this software ("bundles") contain code from other
libraries. For a list of software included in a bundle, refer to
package.json, pom.xml and the list of dependencies.

This project includes software/code developed at Timefold (https://timefold.ai/).

This project is licensed under the Apache License 2.0.
However, the author request that this software not be used for commercial purposes.
This request is not legally binding and does not alter the terms of the Apache License 2.0.

