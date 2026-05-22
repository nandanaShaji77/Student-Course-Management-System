# Student Course Management System

An End-to-End DevOps Project implementing CI/CD pipelines using Docker, Maven, GitHub Actions, Jenkins, and Docker Compose.

---

# Project Overview

The Student Course Management System is a microservices-based web application designed to manage students, courses, and course registrations. The project demonstrates modern DevOps practices including containerization, automated builds, Continuous Integration (CI), and Continuous Deployment (CD).

This project integrates:

- Frontend application
- Spring Boot backend REST APIs
- PostgreSQL database
- Docker containerization
- Docker Compose orchestration
- Maven build automation
- GitHub Actions CI pipelines
- Jenkins CD pipelines

---

# Features

## Student Management
- Add Student
- View Students
- Update Student
- Delete Student

## Course Management
- Add Course
- View Courses
- Update Course
- Delete Course

## Registration Management
- Register Students to Courses
- View Registrations

## DevOps Features
- Dockerized services
- Multi-container deployment
- Automated CI/CD pipelines
- Image publishing to Docker Hub/GHCR
- Jenkins automated deployment

---

# System Architecture

```text
Frontend  --->  Backend API  --->  PostgreSQL Database
     |                |
     |                |
 Docker Container   Docker Container
           \          /
            \        /
          Docker Compose
                 |
      GitHub Actions CI
                 |
             Jenkins CD
                 |
          Docker Hub / GHCR