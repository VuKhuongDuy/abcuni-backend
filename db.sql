CREATE TABLE admin (
admin_id INT(6) AUTO_INCREMENT PRIMARY KEY,
admin_username VARCHAR(50) NOT NULL,
admin_password VARCHAR(50) NOT NULL,
admin_email VARCHAR(50)
)

CREATE TABLE exam (
exam_id INT(6) AUTO_INCREMENT PRIMARY KEY,
exam_name VARCHAR(50) NOT NULL
)

CREATE TABLE room_subject_turn (
turn_id INT(6) NOT NULL,
room_id INT(6) NOT NULL,
subject_id INT(6) NOT NULL,
PRIMARY KEY (turn_id, room_id, subject_id)
)

CREATE TABLE room (
room_id INT(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
room_name VARCHAR(120) NOT NULL,
count_computer INT(4)
)

CREATE TABLE student (
mssv VARCHAR(30) NOT NULL PRIMARY KEY,
user_id INT(6) NOT NULL,
name_student VARCHAR(100) NOT NULL,
sex VARCHAR(10) NOT NULL 
)

CREATE TABLE subject_student (
subject_id INT(6) NOT NULL,
mssv VARCHAR(30) NOT NULL,
exam_id  INT(6) NOT NULL,
enable_test BOOLEAN NOT NULL,
PRIMARY KEY(subject_id, mssv, exam_id)
)

CREATE TABLE subject (
subject_id INT(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
subject_name VARCHAR(120) NOT NULL
)

CREATE TABLE turn (
turn_id INT(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
exam_id INT(6) NOT NULL,
time DATETIME NOT NULL
)

CREATE TABLE user (
user_id INT(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(120) NOT NULL,
password VARCHAR(30) NOT NULL
)




