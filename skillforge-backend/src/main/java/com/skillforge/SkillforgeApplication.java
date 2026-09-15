package com.skillforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@SpringBootApplication
public class SkillforgeApplication {
    public static void main(String[] args) {
        // Automatically create the skillforge database if it doesn't exist
        try {
            Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/postgres", "postgres",
                    "Narayana");
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement
                    .executeQuery("SELECT count(*) FROM pg_database WHERE datname = 'skillforge'");
            if (resultSet.next() && resultSet.getInt(1) == 0) {
                statement.executeUpdate("CREATE DATABASE skillforge");
                System.out.println("Database 'skillforge' created successfully.");
            }
        } catch (Exception e) {
            System.out.println("Could not auto-create database (it might already exist or PostgreSQL is not running): "
                    + e.getMessage());
        }

        SpringApplication.run(SkillforgeApplication.class, args);
    }
}
