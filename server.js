var _        = require('underscore')
  , Backbone = require('backbone') 
  , express  = require('express') 
  , server   = express() 
  , fs       = require('fs')


// Todo Model
// ----------

// Our basic **Todo** model has `title`, `order`, and `done` attributes.
var Todo = Backbone.Model.extend({

  // Default attributes for the todo item.
  defaults: function() {
    return {
      title: "empty todo...",
      order: Todos.nextOrder(),
      done: false
    };
  },

  initialize: function() {
    this.set('id', _.uniqueId())
  },

  // Toggle the `done` state of this todo item.
  toggle: function() {
    //this.save({done: !this.get("done")});
  }

});

// Todo Collection
// ---------------

var TodoList = Backbone.Collection.extend({

  // Reference to this collection's model.
  model: Todo,

  url: '/todos',

  // Filter down the list of all todo items that are finished.
  done: function() {
    return this.where({done: true});
  },

  // Filter down the list to only todo items that are still not finished.
  remaining: function() {
    return this.where({done: false});
  },

  // We keep the Todos in sequential order, despite being saved by unordered
  // GUID in the database. This generates the next order number for new items.
  nextOrder: function() {
    if (!this.length) return 1;
    return this.last().get('order') + 1;
  },

  // Todos are sorted by their original insertion order.
  comparator: 'order'

});

// Create our global collection of **Todos**.
var Todos = new TodoList;

server.use('/static', express.static(__dirname + '/static'))
server.use(express.bodyParser())

server.get('/', function(req, res) {
  fs.readFile('index.html', {encoding: 'utf8'}, function(err, data) {
    if (err) throw err
    res.send(data)
  })
})

server.get('/todos', function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(Todos)
})

server.get('/todos/:id', function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  var todo = Todos.get(req.params.id)
  res.send(todo)
})

server.post('/todos', function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  var todo = Todos.add(req.body)
  res.send(todo)
})

server.put('/todos/:id', function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  var todo = Todos.get(req.params.id)
  todo.set(req.body)
  res.send(todo)
})

server.delete('/todos/:id', function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  var todo = Todos.get(req.params.id)
  Todos.remove(todo)
  res.send(todo)
})

server.listen(1337)
console.log('Listening on port 1337')
