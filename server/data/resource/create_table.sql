-- SQLite
CREATE TABLE exam (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 date DATETIME NOT NULL,
 count_down_time TEXT NOT NULL,
 maker TEXT NULL
);


CREATE TABLE exam_detail (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 exam_id INTEGER NOT NULL,
 num INTEGER NOT NULL,
 question TEXT NOT NULL,
 answers TEXT NOT NULL,
 answer_correct NOT NULL
);

CREATE TABLE exam_result (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 exam_id INTEGER NOT NULL,
 student_name TEXT NOT NULL,
 student_score DECIMAL DEFAULT 0,
 date DATETIME NOT NULL
);

CREATE TABLE exam_result_detail (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 exam_id INTEGER NOT NULL,
 exam_result_id INTEGER NOT NULL,
 num INTEGER NOT NULL,
 question TEXT NOT NULL,
 answers TEXT NOT NULL,
 answer_correct NOT NULL,
 answer_user NOT NULL
);
