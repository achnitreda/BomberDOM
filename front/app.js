import Mini from './mini-framework.js';

let nickname = ''
let c = null;
let playersOnline = 0
let hasJoined = false
let inGame = false
let messages = []

const socket = new WebSocket('ws://localhost:3000')

socket.onmessage = function (event) {
  const data = JSON.parse(event.data)

  switch (data.type) {
    case 'join':
      playersOnline = data.pOnline
      c = null
      Mini.render(App(), document.getElementById('app'))
      break

    case 'countdown':
      c = data.value
      Mini.render(App(), document.getElementById('app'))
      break

    case 'start-game':
      inGame = true
      Mini.render(App(), document.getElementById('app'))
      break

    case 'leave':
      playersOnline = data.pOnline
      c = null
      Mini.render(App(), document.getElementById('app'))
      break

    case 'chat':
      messages = [...messages, { nickname: data.nickname, message: data.message }]
      Mini.render(App(), document.getElementById('app'))
       break
  }
}

function App() {
  if (inGame) return GameScreen()
  return hasJoined ? WaitingRoom({ playersOnline, c }) : NicknameForm()
}

function NicknameForm() {
  return Mini.createElement('div', { class: 'nickname-screen' }, [
    Mini.createElement('input', {
      type: 'text',
      placeholder: 'Enter your nickname',
      oninput: (e) => nickname = e.target.value,
    }),
    Mini.createElement('button', {
      onclick: () => {
        if (nickname.trim()) {
          hasJoined = true;
          socket.send(JSON.stringify({ type: 'join', nickname }));
        }
      }
    }, 'Join Game')
  ])
}

function WaitingRoom({ playersOnline, c }) {
  return Mini.createElement('div', { class: 'waiting-room' }, [
    Mini.createElement('p', {}, `Players Joined: ${playersOnline} / 4`),
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
        socket.send(JSON.stringify({
          type: 'chat',
          nickname,
          message: inputValue.trim()
        }))
        inputValue = ''
        e.target.value = ''
      }
    }
  })

  return Mini.createElement('div', { class: 'chat-box' }, [
    Mini.createElement('div', { class: 'messages' }, messages.map((msg) =>
      Mini.createElement('p', {}, `${msg.nickname} : ${msg.message}`)
    )),
    inGame ? input : null
  ])
}


Mini.render(App(), document.getElementById('app'))
