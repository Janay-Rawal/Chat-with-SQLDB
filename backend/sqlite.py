import sqlite3

connection = sqlite3.connect("student.db")
cursor = connection.cursor()

# Drop table if it already exists (safe to re-run)
cursor.execute("DROP TABLE IF EXISTS STUDENT")

cursor.execute("""
    CREATE TABLE STUDENT (
        NAME    VARCHAR(50),
        CLASS   VARCHAR(25),
        SECTION VARCHAR(25),
        MARKS   INT
    )
""")

students = [
    ('Janay',   'Data Science',  'A', 90),
    ('Sanvi',   'AI & ML',       'B', 85),
    ('Arjun',   'Cybersecurity', 'A', 88),
    ('Meera',   'Data Science',  'B', 92),
    ('Ravi',    'AI & ML',       'A', 75),
    ('Priya',   'Cybersecurity', 'C', 95),
    ('Aditya',  'Data Science',  'C', 80),
    ('Tanya',   'AI & ML',       'B', 89),
    ('Rahul',   'Cybersecurity', 'A', 78),
    ('Ananya',  'Data Science',  'B', 91),
    ('Ishaan',  'Data Science',  'A', 87),
    ('Neha',    'AI & ML',       'C', 93),
    ('Vikram',  'Cybersecurity', 'B', 84),
    ('Divya',   'Data Science',  'C', 79),
    ('Kabir',   'AI & ML',       'A', 88),
    ('Sneha',   'Cybersecurity', 'C', 90),
    ('Aarav',   'Data Science',  'B', 76),
    ('Pooja',   'AI & ML',       'B', 94),
    ('Yash',    'Cybersecurity', 'B', 82),
    ('Riya',    'Data Science',  'A', 89),
]

cursor.executemany("INSERT INTO STUDENT VALUES (?, ?, ?, ?)", students)

print("Inserted records:")
for row in cursor.execute("SELECT * FROM STUDENT"):
    print(row)

connection.commit()
connection.close()
print("\nDone. student.db is ready.")