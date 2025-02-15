//connect to server and retain the socket
//connect to same host that served the document

//const socket = io('http://' + window.document.location.host)
const socket = io() //by default connects to same server that served the page

// variable to store current user
let username;

// variable to store private user
let privUser;

socket.on('serverSays', function(message) {
  let msgDiv = document.createElement('div')

  // Checks if the message is from the current user to change colours using classes
  //if the message starts the the current user
  if(message.startsWith(username))
  {
    // changes the colour to blue using class
    msgDiv.className='userMessage'
  }
  else
  {
    // changes the colour to back using class
    msgDiv.className='otherMessage'

  }
  
  /*
  What is the distinction among the following options to set
  the content? That is, the difference among:
  .innerHTML, .innerText, .textContent
  */
  //msgDiv.innerHTML = message
  //msgDiv.innerText = message
  msgDiv.textContent = message
  document.getElementById('messages').appendChild(msgDiv)

})

// function that enables the chatting text field and send button when they press the connect button
function allowChat()
{
  // stores all the valid characters for a username as a regular expression
  let validExpression=/^[a-zA-Z][a-zA-Z0-9]*$/;
  
  // saves the entered username in the text field
  let message = document.getElementById('username').value.trim()
  if(message === '') return //do nothing


  // if username is valid, then you do all of this
  // checks if starting char is a letter using regular expression and the rest are only numbers and letters
  if(message.match(validExpression))
  {

    // stores current user
    username = document.getElementById('username').value.trim()

    // sends the username to the socket
    socket.emit('user', message)
    document.getElementById('username').value = ''

    // enables the chatting box
    let sendMessage=document.getElementById('msgBox');
    sendMessage.disabled = false;
    
    // enables the send button
    let sendButton=document.getElementById('send_button');
    sendButton.disabled = false;

    // disables the user from entering a username after entering it
    let enterUsername=document.getElementById('username');
    enterUsername.disabled = true;
    
    // disables the user from connecting after already connecting
    let connectAs=document.getElementById('connect_button');
    connectAs.disabled = true;

  }

  else
  {
    // sends the username to the socket
    socket.emit('notUser')
    document.getElementById('username').value = ''

  }


}

// current chat will be erased for that client
function erase()
{
  // clears the message div
  document.getElementById('messages').innerHTML = ''
  
  // sends the erase signal to put the connection to the chat server
  socket.emit('erase')
  
  

}



function sendMessage() {
  let message = document.getElementById('msgBox').value.trim()
  if(message === '') return //do nothing

  // checks the message to see if its a private message
  if(message.includes(':'))
  {
    socket.emit('privMess', message)
    document.getElementById('msgBox').value = ''

  }
  // normal message
  else
  {
    socket.emit('clientSays', message)
    document.getElementById('msgBox').value = ''

  }
  
}

function handleKeyDown(event) {
  const ENTER_KEY = 13 //keycode for enter key
  if (event.keyCode === ENTER_KEY) {
    sendMessage()
    return false //don't propogate event
  }
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  //This function is called after the browser has loaded the web page

  //add listener to buttons
  document.getElementById('connect_button').addEventListener('click', allowChat)
  document.getElementById('send_button').addEventListener('click', sendMessage)
  document.getElementById('clear_button').addEventListener('click', erase)

  //add keyboard handler for the document as a whole, not separate elements.
  document.addEventListener('keydown', handleKeyDown)
  //document.addEventListener('keyup', handleKeyUp)
})
