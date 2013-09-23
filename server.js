var _ = require('underscore')
  , Backbone = require('backbone') 
  , fs = require('fs')
  , express = require('express') 
  , server = express() 
  , idCounter
  , idCounterDb = 'db/id_counter'

var fetchIdCounter = function() {
  fs.readFile( idCounterDb
             , {encoding: 'utf8'}
             , function(err, data) {
                 if (err) throw err
                 idCounter = parseInt(data)
               }
             )
}

var saveIdCounter = function() {
  fs.writeFile( idCounterDb
              , idCounter
              , function(err){ if (err) throw err }
              )
}

var uniqueId = function(prefix) {
  if (_.isUndefined(idCounter)) 
    console.log('idCounter not defined yet')
  var id = ++idCounter + ''
  saveIdCounter()
  return prefix ? prefix + id : id
}

var Todo = Backbone.Model.extend
  ( { defaults: function() {
        return { id: uniqueId()
               , title: "empty todo..."
               , order: Todos.nextOrder()
               , done: false
               }
      } 
    , toggle: function() {
        this.set({done: !this.get("done")})
      }
    }
  )

var TodoList = Backbone.Collection.extend
  ( { model: Todo
    , initialize: function(models, options) {
        this.db = options.db
      }
    , done: function() {
        return this.where({done: true})
      }
    , remaining: function() {
        return this.where({done: false})
      }
      // We keep the Todos in sequential order, despite being saved by unordered
      // GUID in the database. This generates the next order number for new items.
    , nextOrder: function() {
        if (!this.length) return 1
        return this.last().get('order') + 1
      }
    , comparator: 'order'
    , save: function(callback) {
        fs.writeFile( this.db
                    , JSON.stringify(this.toJSON())
                    , function(err) {
                        if (err) throw err
                        callback()
                      }
                    )
      }
    , fetch: function(callback) {
        fs.readFile( this.db
                   , {encoding: 'utf8'}
                   , _.bind(function(err, data) {
                       if (err) throw err
                       this.reset( data ? JSON.parse(data) : [] )
                       callback()
                     }, this)
                   )
      }
    }
  )

server.use('/static', express.static(__dirname + '/static'))
server.use(express.bodyParser())

server.get( '/'
          , function(req, res) {
              fs.readFile( 'index.html'
                         , {encoding: 'utf8'}
                         , function(err, data) {
                             if (err) throw err
                             res.send(data)
                           }
                         )
            }
          )

server.get( '/todos'
          , function(req, res) {
              res.setHeader('Content-Type', 'application/json')
              res.send(Todos)
            }
          )

server.get( '/todos/:id'
          , function(req, res) {
              res.setHeader('Content-Type', 'application/json')
              var todo = Todos.get(req.params.id)
              res.send(todo)
            }
          )

server.post( '/todos'
           , function(req, res) {
               res.setHeader('Content-Type', 'application/json')
               var todo = Todos.add(req.body)
               Todos.save(function(){ res.send(todo) })
              }
            )

server.put( '/todos/:id'
          , function(req, res) {
              res.setHeader('Content-Type', 'application/json')
              var todo = Todos.get(req.params.id)
              todo.set(req.body)
              Todos.save(function(){ res.send(todo) })
            }
          )

server.delete( '/todos/:id'
             , function(req, res) {
                 res.setHeader('Content-Type', 'application/json')
                 var todo = Todos.get(req.params.id)
                 Todos.remove(todo)
                 Todos.save(function(){ res.send(todo) })
               }
             )

fetchIdCounter()
var Todos = new TodoList([], {db: 'db/todos'})
Todos.fetch(function() {
  server.listen(1337)
  console.log('Listening on port 1337')
})
