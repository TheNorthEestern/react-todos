var TodoContainer = React.createClass({
  getInitialState: function() {
    return {data: []};
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
    var todos = this.state.data;
    var newTodos = todos.concat([todo]);
    this.setState({data: newTodos});
    $.ajax({
      url: this.props.url,
      contentType:'application/json',
      method: 'POST',
      data: JSON.stringify(todo),
      success: function(data) {
        console.log(data, "created")
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString()); 
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.getTodosOnLoad();
  },
  render: function() {
    return ( 
      <div className="todo-container">
        <h1 className="todo-container-title">Todos</h1>
        <TodoForm onTodoSubmit={this.handleTodoSubmission} url={this.props.url} />
        <TodoList data={this.state.data} />
        <footer className="todo-list-footer">
          <GenericCounter initialCount={0}/>
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
      var data = {
        todo_text: todoText,
        todo_is_completed: false 
      };
      this.props.onTodoSubmit(data);
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
  render: function() {
    var todos = this.props.data.map(function(todo){
      return (
        <TodoItem key={todo.id}>
          {todo.todo_text}
        </TodoItem>
      ) 
    })
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
  getInitialState: function() {
    return {
      complete: (!!this.props.complete) || false
    };
  },
  handleChange: function(){
    this.setState({
      complete: !this.state.complete 
    });
  },
  render: function() {
    var labelStyle={
      'textDecoration': this.state.complete?'line-through':'' 
    };
    return (
      <li key={this.props.key}>
        <label style={labelStyle}><TodoCheckbox />{this.props.children.toString()}</label>
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
  getInitialState: function() {
    return {
      complete: (!!this.props.complete) || false
    };
  },
  render: function() {
    return (
      <input className="todo-checkbox" ref="complete" defaultChecked={this.state.complete} type="checkbox" name="todo_is_completed" />
    );
  }
});

var TodoCheckboxManager = React.createClass({
  handleChange: function(e) {
    alert('This functionality was not implemented.')
  },
  render: function() {
    return (
      <p className="all-complete" onClick={this.handleChange} ref="checkboxManager">Mark all as complete</p> 
    ) 
  }
});

var GenericCounter = React.createClass({
  getInitialState: function() {
    return {count: this.props.initialThing}; 
  },
  render: function() {
    return (
      <p>{this.state.count}</p>
    );
  }
});

React.render(
  <TodoContainer url="http://localhost:5000/api/v1/todos"/>,
  document.getElementById('todo-list')
);
