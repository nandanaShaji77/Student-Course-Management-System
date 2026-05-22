package com.example.studentcourse.controller;

import com.example.studentcourse.model.Course;
import com.example.studentcourse.repository.CourseRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@Slf4j
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    // GET /api/courses - Retrieve all courses
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        log.info("Received request to fetch all courses");
        List<Course> courses = courseRepository.findAll();
        log.debug("Fetched {} courses from database", courses.size());
        return ResponseEntity.ok(courses);
    }

    // POST /api/courses - Create a new course
    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        log.info("Received request to create a new course with code: {}", course.getCode());
        
        if (courseRepository.findByCode(course.getCode()).isPresent()) {
            log.warn("Course with code {} already exists", course.getCode());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Course with code " + course.getCode() + " already exists.");
        }
        
        Course savedCourse = courseRepository.save(course);
        log.info("Successfully created course with ID: {}", savedCourse.getId());
        return new ResponseEntity<>(savedCourse, HttpStatus.CREATED);
    }
}
