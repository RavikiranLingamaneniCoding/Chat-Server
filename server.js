
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
                                                         //or command-line arguments

const ROOT_DIR = 'html' //dir to serve static files from

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}

// names of the users
let users=[];

// user Ids
let userIds=[];


//Socket Server
io.on('connection', function(socket) {
  console.log('client connected')
  //console.dir(socket)

  socket.emit('serverSays', 'You are connected to CHAT SERVER')

  socket.on('clientSays', function(data) {
    console.log('RECEIVED: ' + data)
    
    // stores the index of the user id to get the username
    let index = userIds.indexOf(socket.id)

    //to broadcast message to everyone thats been registered
    io.to('users').emit('serverSays', users[index]+ ': ' + data) 

    

  
  })

  // runs the callback function when it listens to the event called for private messaging
  socket.on('privMess',function(data)
  {
    console.log('RECEIVED: ' + data)

    // stores the index of the user id to get the username
    let index = userIds.indexOf(socket.id)
    
    // goes through the users to find the name of the person the message is sent
    for(let i=0;i<users.length;i++)
    {
      if(data.startsWith(users[i] + ':'))
      {
         // Remove the 'users[i] +:' part from data
        let message = data.replace(users[i] + ':', '').trim();
        //to broadcast message to the other person
        io.to(userIds[i]).emit('serverSays', users[index]+ ': ' + message) 
        io.to(userIds[index]).emit('serverSays', users[index]+ ': ' + message)
        return;

      }
    

    }
    console.log("Message Not Sent")

    
  })
  
  // runs the callback function when it listens to the event called user which registers the users
  socket.on('user',function(data)
  {
    // adds all the users to an array
    users.push(data)
    
    // adds all the user ids
    userIds.push(socket.id)
    // add the registered clients to a room
    socket.join('users')
    // adds the data of registering the users
    socket.emit('serverSays', 'You are registered as ' + data)

    
  })

  // runs the callback function when it listens to the event called user which its not a user
  socket.on('notUser',function(data)
  {
    // adds the data of registering the users
    socket.emit('serverSays', 'Invalid Username')

    
  })

  // runs the callback function when it listens to the event called erase which connects to the chat server since everything gets erased
  socket.on('erase',function(data)
  {
    socket.emit('serverSays', 'You are connected to CHAT SERVER')

    
  })

  socket.on('disconnect', function(data) {
    //event emitted when a client disconnects
    console.log('client disconnected')
  })
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)
