# Student Course Management System | DevOps Portal

Welcome to the **Student Course Management System** - a comprehensive, end-to-end DevOps demonstration project. This repository features a fully containerized, microservices-style layout hosting a modern single-page dashboard UI, a Spring Boot REST API service, and a PostgreSQL persistence tier, fully managed through state-of-the-art CI/CD pipelines (GitHub Actions + Jenkins).

---

## 🏛️ System Architecture Overview

```mermaid
graph TD
    subgraph Client Layer
        Browser[Client Browser] -->|Port 80| NginxProxy[Nginx Web Server]
    end

    subgraph Service Layer (student_net Bridge)
        NginxProxy -->|Serves Static Files| Static[HTML/CSS/JS Assets]
        NginxProxy -->|Proxies /api/* requests| BootApp[Spring Boot REST API App :8080]
        BootApp -->|JPA/JDBC connection| PostgresContainer[(PostgreSQL DB :5432)]
    end

    subgraph Persistence Layer
        PostgresContainer -->|Saves data| DBVolume[(Docker Persistent Volume: postgres_data)]
    end
```

### Component Details
1. **Frontend Portal (Nginx)**: Serves a sleek, dark-themed responsive dashboard styled with Tailwind CSS, leveraging custom async JS workflows, loader skeletons, state-based metrics, and a dynamic toast notification engine. Additionally, Nginx acts as a reverse proxy for API routing to eliminate CORS (Cross-Origin Resource Sharing) complications.
2. **REST API Backend (Spring Boot)**: Powered by Java 17, Maven, and Spring Data JPA. Exposes entity mapping relationships, transaction safeguards, structured logging (SLF4J/Logback), and comprehensive Actuator health-check nodes.
3. **Database Tier (PostgreSQL)**: Serves as a containerized relational engine holding two `@ManyToMany` relational mapping tables (`students`, `courses`, and `student_courses` join-matrix).

---

## 📂 Microservices Folder Structure

```text
OM2 Main Project/
├── docker-compose.yml       # Production-ready Multi-container Orchestrations
├── Jenkinsfile              # Declarative Jenkins Continuous Delivery Pipeline
├── README.md                # Global Project Manual & Reference Guide
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions Continuous Integration Workflow
├── backend/                 # Backend Java Spring Boot Service
│   ├── pom.xml              # Maven dependencies, plugins, and metadata
│   ├── Dockerfile           # Optimized multi-stage Java JRE Alpine containerization
│   └── src/                 # Application codebase (REST Controllers, JPA Models, Tests)
└── frontend/                # Frontend Portal Web Service
    ├── Dockerfile           # Nginx base web server containerization
    ├── nginx.conf           # Gateway reverse-proxy configuration
    ├── index.html           # Single Page Application Dashboard layout
    ├── app.js               # Dynamic SPA routes and API client binding
    └── styles.css           # Custom glassmorphic tokens and loader transitions
```

---

## 🚀 Quick Start: Run Locally with Docker Compose

Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running on your Windows workstation.

### 1. Launch the Ecosystem
In the project root directory, run:
```powershell
docker compose up --build -d
```

### 2. Access the Applications
- **Interactive UI Dashboard**: Open [http://localhost/](http://localhost/) in your browser.
- **REST API Swagger/Health check**: Access [http://localhost:8080/api/health](http://localhost:8080/api/health).
- **Spring Actuator Diagnostics**: View [http://localhost:8080/api/actuator/health](http://localhost:8080/api/actuator/health).

### 3. Tear Down the Containers
To gracefully stop all services and preserve database volume states:
```powershell
docker compose down
```
To wipe data clean including database volumes:
```powershell
docker compose down -v
```

---

## 🛠️ Developer Operations CLI Commands Reference

### 1. Maven Lifecycle Commands (Backend Service)
Navigate to `/backend` directory before executing:
- **Clean previous outputs & Compile classes**:
  ```bash
  mvn clean compile
  ```
- **Execute unit tests (via Surefire plugin)**:
  ```bash
  mvn test
  ```
- **Compile, test, and package executable JAR file**:
  ```bash
  mvn clean package
  ```
- **Compile, package, and ignore executing tests**:
  ```bash
  mvn clean package -DskipTests
  ```

### 2. Docker & Compose Operations
Execute in root workspace directory:
- **Recompile and build images without launching**:
  ```bash
  docker compose build
  ```
- **Inspect active container resource utilization**:
  ```bash
  docker compose stats
  ```
- **Stream tail live logs from the backend container**:
  ```bash
  docker compose logs -f backend
  ```
- **Interact directly with database inside container**:
  ```bash
  docker exec -it student-db psql -U postgres -d studentdb
  ```

---

## 🔄 Automated CI/CD Pipelines

### 1. GitHub Actions (Continuous Integration)
Located in `.github/workflows/ci.yml`. On every `push` or `pull_request` to the `main` branch, the runner:
1. Provisions an Ubuntu container.
2. Checks out the branch codebase.
3. Sets up Java JDK 17 (caching maven dependencies automatically).
4. Runs full compilation and runs tests (`mvn clean package`).
5. Configures Docker Buildx.
6. Authenticates with Docker Hub using secrets (`DOCKER_USERNAME` / `DOCKER_PASSWORD`).
7. Builds and publishes production-ready images to Docker Hub.

### 2. Jenkins CD Pipeline (Continuous Delivery)
Configured using the root `Jenkinsfile`.
- **Pre-requisites**: Configure the tool `Maven3` inside Jenkins Global Tool Configurations, and set up Docker Hub Credentials in your credentials vault named `docker-hub-credentials`.
- **Flow Stages**:
  ```text
  [SCM Checkout] ➡️ [Maven Compile] ➡️ [Execute Tests] ➡️ [Docker Image Build] ➡️ [Push to Docker Hub] ➡️ [Deploy compose]
  ```

---

## 🔌 API Gateway Specifications & Examples

### 1. Add a Course
- **Endpoint**: `POST /api/courses`
- **Request Payload**:
  ```json
  {
    "code": "CS201",
    "name": "Data Structures & Algorithms",
    "instructor": "Dr. Alan Turing",
    "credits": 4
  }
  ```
- **Curl Command**:
  ```bash
  curl -X POST http://localhost:8080/api/courses \
    -H "Content-Type: application/json" \
    -d "{\"code\":\"CS201\",\"name\":\"Data Structures\",\"instructor\":\"Dr. Alan Turing\",\"credits\":4}"
  ```

### 2. Add a Student
- **Endpoint**: `POST /api/students`
- **Request Payload**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane.smith@university.edu",
    "department": "Computer Science"
  }
  ```
- **Curl Command**:
  ```bash
  curl -X POST http://localhost:8080/api/students \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Jane Smith\",\"email\":\"jane.smith@university.edu\",\"department\":\"Computer Science\"}"
  ```

### 3. Enroll Student to a Course
- **Endpoint**: `POST /api/students/{studentId}/register/{courseId}`
- **Curl Command** (Enrolling student 1 in course 1):
  ```bash
  curl -X POST http://localhost:8080/api/students/1/register/1
  ```

### 4. Fetch All Students
- **Endpoint**: `GET /api/students`
- **Curl Command**:
  ```bash
  curl -X GET http://localhost:8080/api/students
  ```

### 5. Fetch All Courses
- **Endpoint**: `GET /api/courses`
- **Curl Command**:
  ```bash
  curl -X GET http://localhost:8080/api/courses
  ```

### 6. Health Check Monitoring Status
- **Endpoint**: `GET /api/health`
- **Curl Command**:
  ```bash
  curl -X GET http://localhost:8080/api/health
  ```
