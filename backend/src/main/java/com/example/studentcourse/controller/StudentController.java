package com.example.studentcourse.controller;

import com.example.studentcourse.exception.ResourceNotFoundException;
import com.example.studentcourse.model.Course;
import com.example.studentcourse.model.Student;
import com.example.studentcourse.repository.CourseRepository;
import com.example.studentcourse.repository.StudentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@Slf4j
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    // GET /api/students - Retrieve all students
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        log.info("Received request to fetch all students");
        List<Student> students = studentRepository.findAll();
        log.debug("Fetched {} students from database", students.size());
        return ResponseEntity.ok(students);
    }

    // POST /api/students - Create a new student
    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody Student student) {
        log.info("Received request to create student with email: {}", student.getEmail());
        
        if (studentRepository.findByEmail(student.getEmail()).isPresent()) {
            log.warn("Student with email {} already exists", student.getEmail());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Student with email " + student.getEmail() + " already exists.");
        }
        
        Student savedStudent = studentRepository.save(student);
        log.info("Successfully created student with ID: {}", savedStudent.getId());
        return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
    }

    // POST /api/students/{studentId}/register/{courseId} - Enroll a student in a course
    @PostMapping("/{studentId}/register/{courseId}")
    public ResponseEntity<?> registerStudentToCourse(@PathVariable Long studentId, @PathVariable Long courseId) {
        log.info("Attempting to register student (ID: {}) to course (ID: {})", studentId, courseId);
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> {
                    log.error("Registration failed: Student with ID {} not found", studentId);
                    return new ResourceNotFoundException("Student not found with ID: " + studentId);
                });
                
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.error("Registration failed: Course with ID {} not found", courseId);
                    return new ResourceNotFoundException("Course not found with ID: " + courseId);
                });

        if (student.getCourses().contains(course)) {
            log.warn("Student (ID: {}) is already registered for course (ID: {})", studentId, courseId);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Student is already registered to this course.");
        }
        
        student.getCourses().add(course);
        Student updatedStudent = studentRepository.save(student);
        
        log.info("Registration successful: Student {} enrolled in course {}", student.getName(), course.getName());
        return ResponseEntity.ok(updatedStudent);
    }
}
