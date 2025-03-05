USE good_weekend_quiz;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE leagues (
    id INT UNIQUE PRIMARY KEY,
    league_name VARCHAR(100) NOT NULL,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL
);

CREATE TABLE user_leagues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    league_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    FOREIGN KEY (league_id) REFERENCES leagues(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

CREATE TABLE submission (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    league_id INT NOT NULL,
    week_number INT NOT NULL,
    year INT NOT NULL,
    score INT NOT NULL,
    number_of_players INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    FOREIGN KEY (league_id) REFERENCES leagues(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);