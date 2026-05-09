-- Programming Contest Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS contest_system;
USE contest_system;

-- Users table (Admins and Participants)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'participant') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contests table
CREATE TABLE Contests (
    contest_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(user_id)
);

-- Problems table
CREATE TABLE Problems (
    problem_id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    sample_input TEXT,
    sample_output TEXT,
    time_limit INT DEFAULT 1, -- in seconds
    memory_limit INT DEFAULT 256, -- in MB
    points INT DEFAULT 100,
    FOREIGN KEY (contest_id) REFERENCES Contests(contest_id) ON DELETE CASCADE
);

-- Submissions table
CREATE TABLE Submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    contest_id INT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(20) DEFAULT 'cpp',
    status ENUM('pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error') DEFAULT 'pending',
    score INT DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (problem_id) REFERENCES Problems(problem_id),
    FOREIGN KEY (contest_id) REFERENCES Contests(contest_id)
);

-- Insert default admin user (password: admin123)
INSERT INTO Users (username, password, email, role) VALUES 
('admin', '$2a$10$K8fV1C9rL2wX3pZ4qN5mYeO5r6sT7uV8wX9yZ1aB2cD3eF4gH5iJ6k', 'admin@contest.com', 'admin');

-- Insert sample participant user (password: user123)
INSERT INTO Users (username, password, email, role) VALUES 
('participant1', '$2a$10$L9mW2D0sM3xY4qR5oN6nZfP6t7uV8wX9yZ1aB2cD3eF4gH5iJ6kL7m', 'user@contest.com', 'participant');

-- Insert sample contest
INSERT INTO Contests (title, description, start_time, end_time, created_by) VALUES 
('Sample Programming Contest', 'A sample contest for testing the system', '2024-01-01 10:00:00', '2024-01-01 12:00:00', 1);

-- Insert sample problem
INSERT INTO Problems (contest_id, title, description, input_format, output_format, sample_input, sample_output, points) VALUES 
(1, 'Simple Addition', 'Write a program that reads two integers and prints their sum.', 'Input: Two integers A and B separated by space.', 'Output: The sum of A and B.', '5 3', '8', 100);
