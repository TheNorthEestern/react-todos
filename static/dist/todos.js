var TodoContainer = React.createClass({displayName: "TodoContainer",
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
      contenttype:'application/json',
      method: 'post',
      data: json.stringify(todo),
      success: function(data) {
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
  componentDidMount: function() {
    this.getTodosOnLoad();
  },
  render: function() {
    return ( 
      React.createElement("div", {className: "todo-container"}, 
        React.createElement("h1", {className: "todo-container-title"}, "Todos"), 
        React.createElement(TodoForm, {onTodoSubmit: this.handleTodoSubmission, url: this.props.url}), 
        React.createElement(TodoList, {ref: "theTodoList", data: this.state.data, url: this.props.url}), 
        React.createElement("footer", {className: "todo-list-footer"}, 
          React.createElement(GenericCounter, {initialCount: 0}), 
          React.createElement(TodoCheckboxManager, {checkAllMembers: this.finishAllTasks})
        )
      )
    );
  }
});

var TodoForm = React.createClass({displayName: "TodoForm",
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
      React.createElement("form", {className: "todo-form"}, 
        React.createElement("input", {type: "text", placeholder: "What needs to be done?", ref: "todoText"}), 
        React.createElement(TodoSubmitButton, {parentFormSubmissionFn: this.handleSubmit})
      )  
    );
  }
});

var TodoList = React.createClass({displayName: "TodoList",
  render: function() {
    var todos = this.props.data.map(function(todo, i){
      return (
        React.createElement(TodoItem, {ref: 'todo' + i, key: todo.id, todoID: todo.id, todo_is_completed: todo.todo_is_completed, url: this.props.url}, 
          todo.todo_text
        )
      ) 
    }.bind(this))
    return (
      React.createElement("section", null, 
        React.createElement("ul", null, 
          todos
        )
      ) 
    );
  }
});

var TodoItem = React.createClass({displayName: "TodoItem",
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
      React.createElement("li", null, 
        React.createElement("label", {style: componentStyle}, React.createElement(TodoCheckbox, {currentState: this.state.complete, parentAction: this.handleChange}), this.props.children.toString())
      )
    ) 
  }
})

var TodoSubmitButton = React.createClass({displayName: "TodoSubmitButton",
  render: function() {
    return (
      React.createElement("input", {onClick: this.props.parentFormSubmissionFn, type: "submit", value: "Add Todo", className: "todo-submit-button"}) 
    );
  }
});

var TodoCheckbox = React.createClass({displayName: "TodoCheckbox",
  onChange: function() {
    this.setState({isChecked: !this.state.isChecked});
  },
  render: function() {
    return (
      React.createElement("input", {className: "todo-checkbox", checked: this.props.currentState, onChange: this.props.parentAction, type: "checkbox", name: "todo_is_completed"})
    );
  }
});

var TodoCheckboxManager = React.createClass({displayName: "TodoCheckboxManager",
  render: function() {
    return (
      React.createElement("p", {className: "all-complete", onClick: this.props.checkAllMembers, ref: "checkboxManager"}, "Mark all as complete") 
    ) 
  }
});

var GenericCounter = React.createClass({displayName: "GenericCounter",
  getInitialState: function() {
    return {count: this.props.initialThing}; 
  },
  render: function() {
    return (
      React.createElement("p", null, this.state.count)
    );
  }
});

React.render(
  React.createElement(TodoContainer, {url: "http://localhost:5000/api/v1/todos"}),
  document.getElementById('todo-list')
);
