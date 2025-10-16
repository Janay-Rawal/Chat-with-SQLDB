import sqlite3

#connect to sqlite
connection = sqlite3.connect("student.db")

#create a cursor object to insert, record, create table
cursor = connection.cursor()

#create table
table_info = """
create table STUDENT(NAME VARCHAR(50),CLASS VARCHAR(25),SECTION VARCHAR(25),MARKS INT)
"""

cursor.execute(table_info)

#insert records
cursor.execute('''INSERT INTO STUDENT VALUES('Janay', 'Data Science', 'A', 90)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Sanvi', 'AI & ML', 'B', 85)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Arjun', 'Cybersecurity', 'A', 88)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Meera', 'Data Science', 'B', 92)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Ravi', 'AI & ML', 'A', 75)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Priya', 'Cybersecurity', 'C', 95)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Aditya', 'Data Science', 'C', 80)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Tanya', 'AI & ML', 'B', 89)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Rahul', 'Cybersecurity', 'A', 78)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Ananya', 'Data Science', 'B', 91)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Ishaan', 'Data Science', 'A', 87)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Neha', 'AI & ML', 'C', 93)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Vikram', 'Cybersecurity', 'B', 84)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Divya', 'Data Science', 'C', 79)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Kabir', 'AI & ML', 'A', 88)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Sneha', 'Cybersecurity', 'C', 90)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Aarav', 'Data Science', 'B', 76)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Pooja', 'AI & ML', 'B', 94)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Yash', 'Cybersecurity', 'B', 82)''')
cursor.execute('''INSERT INTO STUDENT VALUES('Riya', 'Data Science', 'A', 89)''')

#Display records
print("Inserted records are:")
data = cursor.execute('''SELECT * FROM STUDENT''')
for row in data:
    print(row)

#commit changes in db
connection.commit()
connection.close()
