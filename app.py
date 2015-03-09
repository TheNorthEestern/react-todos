from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/todos.db'
db = SQLAlchemy(app)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    priority = db.Column(db.Integer, nullable=False, unique=True)
    todo_is_completed = db.Column(db.Boolean)
    todo_text = db.Column(db.String)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self, priority, todo_is_completed, todo_text, created_at):
        self.priority = priority
        self.todo_is_completed = todo_is_completed
        self.todo_text = todo_text

    def __repr__(self):
        return "<Todo('%s', '%s', '%s')>" % (self.priority, self.todo_is_completed, self.todo_text)
