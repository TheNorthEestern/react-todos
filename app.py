from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.admin import Admin
from flask.ext.admin.contrib.sqla import ModelView
from flask.ext.cors import CORS

from sqlalchemy.sql import func

import flask.ext.restless
import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/todos.db'
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'fhalr-280ur02842'

db = SQLAlchemy(app)
CORS(app, resouces=r'/api/v1/*', allow_headers='Content-Type')

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    priority = db.Column(db.Integer, nullable=True)
    todo_is_completed = db.Column(db.Boolean)
    todo_text = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now())
    updated_at = db.Column(db.DateTime, onupdate=datetime.datetime.now())

    def __init__(self, todo_is_completed=False, todo_text=""):
        # In Lieu of a database agnostic solution, this will have to do for now
        num_todos = db.session.query(Todo).count()
        if not num_todos:
            self.priority = 1
        else:
            priority = db.session.query(func.max(Todo.priority).label('max_pri')).first()[0]
            self.priority = priority + 1
        self.todo_is_completed = todo_is_completed
        self.todo_text = todo_text

    def __repr__(self):
        return "<Todo('%s', '%s', '%s')>" % (self.priority, self.todo_is_completed, self.todo_text)

class TodosView(ModelView):
    form_excluded_columns = ('priority', 'created_at', 'updated_at')

    def __init__(self, session, **kwargs):
        super(TodosView, self).__init__(Todo, session, **kwargs)

@app.route('/')
def index(name=None):
    return render_template('index.html', name=name)

admin = Admin(app, name="Todos")
admin.add_view(TodosView(db.session, name="All Todos"))

api_manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)
api_manager.create_api(Todo, 
                       collection_name='todos', 
                       url_prefix='/api/v1', 
                       exclude_columns=['created_at', 'updated_at'], 
                       results_per_page=30, 
                       methods=['GET', 'POST', 'PATCH'])

if __name__ == '__main__':
    app.run()
