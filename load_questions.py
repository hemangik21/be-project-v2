import sqlite3

conn = sqlite3.connect("interview_system.db")
cursor = conn.cursor()

with open("database/queries/questions.sql", "r") as f:
    sql_script = f.read()

cursor.executescript(sql_script)

conn.commit()
conn.close()

print("✅ Questions inserted successfully")