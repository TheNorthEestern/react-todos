var TodoContainer = React.createClass({
  getInitialState: function() {
    return {data: [], numRemaining: 0};
  },
  getTodosOnLoad: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data["objects"]});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString()); 
      }.bind(this)
    });
  },
  handleTodoSubmission: function(todo) {
    $.ajax({
      url: this.props.url,
      contentType:'application/json',
      method: 'post',
      data: JSON.stringify(todo),
      success: function(data) {
        var todos = this.state.data;
        todo.id = data.id;
        var newTodos = todos.concat([todo]);
        this.setState({data: newTodos});
        console.log(data, "created")
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.tostring()); 
      }.bind(this)
    });
  },
  finishAllTasks: function() {
    var todoList = this.refs.theTodoList.refs;
    for (todo in todoList) {
      if (todoList.hasOwnProperty(todo)) {
        todoList[todo].finishTodo();
      } 
    }
  },
  getCount: function() {
    return this.refs.theTodoList.state.count;
  },
  componentDidMount: function() {
    this.getTodosOnLoad();
  },
  render: function() {
    return ( 
      <div className="todo-container">
        <h1 className="todo-container-title">Todos</h1>
        <TodoForm onTodoSubmit={this.handleTodoSubmission} url={this.props.url} />
        <TodoList ref="theTodoList" data={this.state.data} url={this.props.url} />
        <footer className="todo-list-footer">
          <GenericCounter ref="completedTodoCounter" initialCount={this.getCount}/>
          <TodoCheckboxManager checkAllMembers={this.finishAllTasks} />
        </footer>
      </div>
    );
  }
});

var TodoForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var todoText = React.findDOMNode(this.refs.todoText).value.trim();
    if (!todoText) {
      alert('No text entered'); 
    } else {
      var todo = {
        todo_text: todoText,
        todo_is_completed: false 
      };
      this.props.onTodoSubmit(todo);
      React.findDOMNode(this.refs.todoText).value = "";
    }
  },
  render: function() {
    return (
      <form className="todo-form">
        <input type="text" placeholder="What needs to be done?" ref="todoText" />
        <TodoSubmitButton parentFormSubmissionFn={this.handleSubmit}/>
      </form>  
    );
  }
});

var TodoList = React.createClass({
  getInitialState: function() {
    return {count: 0}; 
  },
  render: function() {
    var todos = this.props.data.map(function(todo, i){
      if (!todo.todo_is_completed) {
        this.state.count++;
      }
      return (
        <TodoItem key={todo.id} 
                  ref={'todo' + i} 
                  todoID={todo.id} 
                  todo_is_completed={todo.todo_is_completed} url={this.props.url}>
          {todo.todo_text}
        </TodoItem>
      ) 
    }.bind(this))
    return (
      <section>
        <ul>
          {todos}
        </ul>
      </section> 
    );
  }
});

var TodoItem = React.createClass({
  updateTodo: function(updatedTodo) {
    $.ajax({
      url: this.props.url + '/' + this.props.todoID,
      contentType:'application/json',
      method: 'PATCH',
      data: JSON.stringify(updatedTodo),
      success: function(data) {
        console.log(data, "updated")
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.tostring()); 
      }.bind(this)
    });
  },
  finishTodo: function() {
    this.setState({complete: true})

    var updatedTodo = {
      todo_is_completed: true
    }

    this.setState({data: updatedTodo})
    this.updateTodo(updatedTodo)

  },
  handleChange: function() {
    this.setState({complete: !this.state.complete})

    var updatedTodo = {
      todo_is_completed: !this.state.complete
    }

    this.setState({data: updatedTodo})
    this.updateTodo(updatedTodo);
  },
  getInitialState: function() {
    return ({complete: this.props.todo_is_completed});
  },
  render: function() {
    var componentStyle={
      'textDecoration': this.state.complete ?'line-through':'',
      'color': 'gray'
    };
    return (
      <li>
        <label style={componentStyle}><TodoCheckbox currentState={this.state.complete} 
                                                    parentAction={this.handleChange} 
                                                    />{this.props.children.toString()}</label>
      </li>
    ) 
  }
})

var TodoSubmitButton = React.createClass({
  render: function() {
    return (
      <input onClick={this.props.parentFormSubmissionFn} type="submit" value="Add Todo" className="todo-submit-button" /> 
    );
  }
});

var TodoCheckbox = React.createClass({
  onChange: function() {
    this.setState({isChecked: !this.state.isChecked});
  },
  render: function() {
    return (
      <input className="todo-checkbox" checked={this.props.currentState} onChange={this.props.parentAction} type="checkbox" name="todo_is_completed" />
    );
  }
});

var TodoCheckboxManager = React.createClass({
  render: function() {
    return (
      <p className="all-complete" onClick={this.props.checkAllMembers} ref="checkboxManager">Mark all as complete</p> 
    ) 
  }
});

var GenericCounter = React.createClass({
  render: function() {
    return (
      <p className="remaining-text">Couldn't quite get the correct implementation here.</p>
    );
  }
});

React.render(
  <TodoContainer url="http://localhost:5000/api/v1/todos"/>,
  document.getElementById('todo-list')
);
