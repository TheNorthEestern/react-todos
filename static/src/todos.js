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
  componentDidMount: function() {
    this.getTodosOnLoad();
  },
  render: function() {
    return ( 
      <div className="todo-container">
        <h1 className="todo-container-title">Todos</h1>
        <TodoForm url={this.props.url} />
        <TodoList data={this.state.data} />
        <footer className="todo-list-footer">
          <GenericCounter initialCount={0}/>
          <TodoCheckboxManager />
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
      alert(this.props.url);
      $.ajax({
        url: this.props.url,
        contentType:'application/json',
        method: 'POST',
        data: JSON.stringify(data),
        success: function(data) {
          console.log(data) 
          this.refs.todoText.value = "";
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString()); 
        }.bind(this)
      });
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
  render: function() {
    return (
      <li key={this.props.key}>
        <TodoCheckbox />
        {this.props.children}
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
  render: function() {
    return (
      <input type="checkbox" name="todo_is_completed" />
    );
  }
});

var TodoCheckboxManager = React.createClass({
  render: function() {
    return (
      <a onChange={this.handleChange} ref="checkboxManager" href="#">Mark all as complete</a> 
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
