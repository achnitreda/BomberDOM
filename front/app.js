import Mini from './mini-framework.js';


let room = {
nickname : '',
c : null ,
playersOnline : 0 ,
hasJoined : false,
inGame : false,
messages : [],
socket : null,
}
room.socket = new WebSocket('ws://localhost:3000')

room.socket.onmessage = function (event) {
  const data = JSON.parse(event.data)

  switch (data.type) {
    case 'join':
      room.playersOnline = data.pOnline
      room.c = null
      Mini.render(App(), document.getElementById('app'))
      break

    case 'countdown':
      room.c = data.value
      Mini.render(App(), document.getElementById('app'))
      break

    case 'start-game':
      room.inGame = true
      Mini.render(App(), document.getElementById('app'))
      break

    case 'leave':
      room.playersOnline = data.pOnline
      room.c = null
      Mini.render(App(), document.getElementById('app'))
      break

    case 'chat':
      room.messages = [...room.messages, {nickname: data.nickname, message: data.message }]
      Mini.render(App(), document.getElementById('app'))
       break
    case 'error':
      alert(data.message)
      break
  }
}

function App() {
  if (room.inGame) return GameScreen()
  return room.hasJoined ? WaitingRoom( room.playersOnline, room.c ) : NicknameForm()
}

function NicknameForm() {
  return Mini.createElement('div', { class: 'nickname-screen' }, [
    Mini.createElement('input', {
      type: 'text',
      placeholder: 'Enter your nickname',
      oninput: (e) => room.nickname = e.target.value,
    }),
    Mini.createElement('button', {
      onclick: () => {
        if (room.nickname.trim()) {
          room.hasJoined = true;
          room.socket.send(JSON.stringify({ type: 'join', nickname : room.nickname }));
        }
      }
    }, 'Join Game')
  ])
}

function WaitingRoom( p, c ) {
  return Mini.createElement('div', { class: 'waiting-room' }, [
    Mini.createElement('p', {}, `Players Joined: ${p} / 4`),
    c !== null
      ? Mini.createElement('p', {}, `Game starts in ${c} seconds...`)
      : null,
  
  ])
}

function GameScreen() {
  return Mini.createElement('div', { class: 'game-screen' }, [
    Mini.createElement('h1', {}, 'CHAT'),
    ChatComponent()
  ])
}

function ChatComponent() {
  let inputValue = ''

  const input = Mini.createElement('input', {
    type: 'text',
    placeholder: 'Type a message...',
    oninput: (e) => inputValue = e.target.value,
    onkeydown: (e) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        room.socket.send(JSON.stringify({
          type: 'chat',
          nickname: room.nickname,
          message: inputValue.trim()
        }))
        inputValue = ''
        e.target.value = ''
      }
    }
  })

  return Mini.createElement('div', { class: 'chat-box' }, [
    Mini.createElement('div', { class: 'messages' }, room.messages.map((msg) =>
      Mini.createElement('p', {}, `${msg.nickname} : ${msg.message}`)
    )),
    room.inGame ? input : null
  ])
}


Mini.render(App(), document.getElementById('app'))
