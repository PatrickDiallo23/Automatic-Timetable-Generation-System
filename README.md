# Automatic-Timetable-Generation-System

This project is designed to streamline and optimize the process of creating academic schedules, ensuring that resources such as time slots, faculty members,
and rooms are utilized to their fullest potential. By automating the complex task of timetable generation,
this system aims to reduce scheduling conflicts, enhance faculty and student satisfaction, and improve overall academic operations.

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

- **Node.js** (version 16.x or later)
- **Angular CLI** (version 16.x)
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

### 1.Run the Backend

   Navigate to the backend directory and start the Spring Boot application:

```bash
mvn spring-boot:run
```
The backend server will start on http://localhost:8200.

### 2. Run the Frontend

   Navigate to the frontend directory and start the Angular application:

```bash
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

