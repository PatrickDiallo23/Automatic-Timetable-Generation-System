# API Documentation

### Constraints API

- **GET** `/api/v1/constraints`
    - Description: Retrieve all constraints.
    - Response: `200 OK` with a list of `ConstraintModel`.


- **GET** `/api/v1/constraints/{id}`
    - Description: Retrieve a specific constraint by its ID.
    - Path Variable: `id` (Long) - The ID of the constraint.
    - Response:
        - `200 OK` with the `ConstraintModel` if found.
        - `404 Not Found` if the constraint is not found.


- **GET** `/api/v1/constraints/count`
    - Description: Retrieve the total count of constraints.
    - Response: `200 OK` with the count (Long).


- **POST** `/api/v1/constraints`
    - Description: Create a new constraint.
    - Request Body: `ConstraintModel` - The constraint to create.
    - Response: `201 Created` with the created `ConstraintModel`.


- **PUT** `/api/v1/constraints/{id}`
    - Description: Update an existing constraint by its ID.
    - Path Variable: `id` (Long) - The ID of the constraint to update.
    - Request Body: `ConstraintModel` - The updated constraint data.
    - Response:
        - `200 OK` with the updated `ConstraintModel`.
        - `404 Not Found` if the constraint is not found.


- **DELETE** `/api/v1/constraints/{id}`
    - Description: Delete a constraint by its ID.
    - Path Variable: `id` (Long) - The ID of the constraint to delete.
    - Response: `204 No Content`.

### Lessons API

- **GET** `/api/v1/lessons`
    - Description: Retrieve all lessons.
    - Response: `200 OK` with a list of `Lesson`.


- **GET** `/api/v1/lessons/{id}`
    - Description: Retrieve a specific lesson by its ID.
    - Path Variable: `id` (Long) - The ID of the lesson.
    - Response:
        - `200 OK` with the `Lesson` if found.
        - `404 Not Found` if the lesson is not found.


- **GET** `/api/v1/lessons/count`
    - Description: Retrieve the total count of lessons.
    - Response: `200 OK` with the count (Long).


- **POST** `/api/v1/lessons`
    - Description: Create a new lesson.
    - Request Body: `Lesson` - The lesson to create.
    - Response: `201 Created` with the created `Lesson`.


- **PUT** `/api/v1/lessons/{id}`
    - Description: Update an existing lesson by its ID.
    - Path Variable: `id` (Long) - The ID of the lesson to update.
    - Request Body: `Lesson` - The updated lesson data.
    - Response:
        - `200 OK` with the updated `Lesson`.
        - `404 Not Found` if the lesson is not found.


- **DELETE** `/api/v1/lessons/{id}`
    - Description: Delete a lesson by its ID.
    - Path Variable: `id` (Long) - The ID of the lesson to delete.
    - Response: `204 No Content`.

### Rooms API

- **GET** `/api/v1/rooms`
    - Description: Retrieve all rooms.
    - Response: `200 OK` with a list of `Room`.


- **GET** `/api/v1/rooms/{id}`
    - Description: Retrieve a specific room by its ID.
    - Path Variable: `id` (Long) - The ID of the room.
    - Response:
        - `200 OK` with the `Room` if found.
        - `404 Not Found` if the room is not found.


- **GET** `/api/v1/rooms/count`
    - Description: Retrieve the total count of rooms.
    - Response: `200 OK` with the count (Long).


- **POST** `/api/v1/rooms`
    - Description: Create a new room.
    - Request Body: `Room` - The room to create.
    - Response: `201 Created` with the created `Room`.


- **PUT** `/api/v1/rooms/{id}`
    - Description: Update an existing room by its ID.
    - Path Variable: `id` (Long) - The ID of the room to update.
    - Request Body: `Room` - The updated room data.
    - Response:
        - `200 OK` with the updated `Room`.
        - `404 Not Found` if the room is not found.


- **DELETE** `/api/v1/rooms/{id}`
    - Description: Delete a room by its ID.
    - Path Variable: `id` (Long) - The ID of the room to delete.
    - Response: `204 No Content`.

### Student Groups API

- **GET** `/api/v1/studentGroups`
    - Description: Retrieve all student groups.
    - Response: `200 OK` with a list of `StudentGroup`.


- **GET** `/api/v1/studentGroups/{id}`
    - Description: Retrieve a specific student group by its ID.
    - Path Variable: `id` (Long) - The ID of the student group.
    - Response:
        - `200 OK` with the `StudentGroup` if found.
        - `404 Not Found` if the student group is not found.


- **GET** `/api/v1/studentGroups/count`
    - Description: Retrieve the total count of student groups.
    - Response: `200 OK` with the count (Long).


- **POST** `/api/v1/studentGroups`
    - Description: Create a new student group.
    - Request Body: `StudentGroup` - The student group to create.
    - Response: `201 Created` with the created `StudentGroup`.


- **PUT** `/api/v1/studentGroups/{id}`
    - Description: Update an existing student group by its ID.
    - Path Variable: `id` (Long) - The ID of the student group to update.
    - Request Body: `StudentGroup` - The updated student group data.
    - Response:
        - `200 OK` with the updated `StudentGroup`.
        - `404 Not Found` if the student group is not found.


- **DELETE** `/api/v1/studentGroups/{id}`
    - Description: Delete a student group by its ID.
    - Path Variable: `id` (Long) - The ID of the student group to delete.
    - Response: `204 No Content`.

### Teachers API

- **GET** `/api/v1/teachers`
    - Description: Retrieve all teachers.
    - Response: `200 OK` with a list of `TeacherDTO`.


- **GET** `/api/v1/teachers/{id}`
    - Description: Retrieve a specific teacher by its ID.
    - Path Variable: `id` (Long) - The ID of the teacher.
    - Response:
        - `200 OK` with the `Teacher` if found.
        - `404 Not Found` if the teacher is not found.


- **GET** `/api/v1/teachers/count`
    - Description: Retrieve the total count of teachers.
    - Response: `200 OK` with the count (Long).


- **POST** `/api/v1/teachers`
    - Description: Create a new teacher.
    - Request Body: `Teacher` - The teacher to create.
    - Response: `201 Created` with the created `Teacher`.


- **PUT** `/api/v1/teachers/{id}`
    - Description: Update an existing teacher by its ID.
    - Path Variable: `id` (Long) - The ID of the teacher to update.
    - Request Body: `Teacher` - The updated teacher data.
    - Response:
        - `200 OK` with the updated `Teacher`.
        - `404 Not Found` if the teacher is not found.


- **DELETE** `/api/v1/teachers/{id}`
    - Description: Delete a teacher by its ID.
    - Path Variable: `id` (Long) - The ID of the teacher to delete.
    - Response: `204 No Content`.

### Timeslots API

- **GET** `/api/v1/timeslots`
    - Description: Retrieve all timeslots.
    - Response: `200 OK` with a list of `Timeslot`.


- **GET** `/api/v1/timeslots/{id}`
    - Description: Retrieve a specific timeslot by its ID.
    - Path Variable: `id` (Long) - The ID of the timeslot.
    - Response:
        - `200 OK` with the `Timeslot` if found.
        - `404 Not Found` if the timeslot is not found.


- **GET** `/api/v1/timeslots/count`
    - Description: Retrieve the total count of timeslots.
    - Response: `200 OK` with the count (Long).


- **POST** `/api/v1/timeslots`
    - Description: Create a new timeslot.
    - Request Body: `TimeslotRequest` - The timeslot to create.
    - Response: `201 Created` with the created `Timeslot`.


- **PUT** `/api/v1/timeslots/{id}`
    - Description: Update an existing timeslot by its ID.
    - Path Variable: `id` (Long) - The ID of the timeslot to update.
    - Request Body: `Timeslot` - The updated timeslot data.
    - Response:
        - `200 OK` with the updated `Timeslot`.
        - `404 Not Found` if the timeslot is not found.


- **DELETE** `/api/v1/timeslots/{id}`
    - Description: Delete a timeslot by its ID.
    - Path Variable: `id` (Long) - The ID of the timeslot to delete.
    - Response: `204 No Content`.

### Timetable API

#### List All Job IDs

- **GET** `/api/v1/timetables/list`
  - Description: Retrieve a collection of all job IDs related to timetables.
  - Response: `200 OK` with a collection of `String` representing job IDs.

#### Generate Timetable Data

- **GET** `/api/v1/timetables`
  - Description: Generate and retrieve the current timetable data.
  - Response:
    - `200 OK` with the `Timetable` data.

#### Solve Timetable Problem

- **POST** `/api/v1/timetables`
  - Description: Submit a timetable problem to solve and initiate a solving process.
  - Request Body: `Timetable` - The timetable problem to solve.
  - Response:
    - `200 OK` with a JSON map containing the `jobId` of the initiated solving process.

#### Analyze Timetable Problem

- **PUT** `/api/v1/timetables/analyze`
  - Description: Analyze a timetable problem and return the score analysis.
  - Request Body: `Timetable` - The timetable problem to analyze.
  - Query Parameter:
    - `fetchPolicy` (optional) - The fetch policy for the score analysis.
  - Response:
    - `200 OK` with a `ScoreAnalysis<HardSoftScore>` containing the analysis results.

#### Get Timetable by Job ID

- **GET** `/api/v1/timetables/{jobId}`
  - Description: Retrieve the timetable associated with a specific job ID.
  - Path Variable: `jobId` (String) - The ID of the job.
  - Response:
    - `200 OK` with the `Timetable` if found.

#### Get Status by Job ID

- **GET** `/api/v1/timetables/{jobId}/status`
  - Description: Retrieve the current status of a timetable-solving process by job ID.
  - Path Variable: `jobId` (String) - The ID of the job.
  - Response:
    - `200 OK` with the `Timetable` containing the current status.

#### Terminate Solving Process

- **DELETE** `/api/v1/timetables/{jobId}`
  - Description: Terminate a timetable-solving process by its job ID.
  - Path Variable: `jobId` (String) - The ID of the job.
  - Response:
    - `200 OK` with the `Timetable` associated with the terminated job.