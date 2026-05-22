package com.example.studentcourse;

import com.example.studentcourse.controller.HealthController;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(HealthController.class)
public class StudentCourseApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DataSource dataSource;

    @Test
    public void testSystemHealthCheckEndpointUp() throws Exception {
        // Mock standard Database connection behavior
        Connection mockConnection = Mockito.mock(Connection.class);
        Mockito.when(dataSource.getConnection()).thenReturn(mockConnection);
        Mockito.when(mockConnection.isValid(2)).thenReturn(true);

        // Perform GET request and assert results
        this.mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("UP"))
                .andExpect(jsonPath("$.db_connection").value("SUCCESS"));
    }
}
