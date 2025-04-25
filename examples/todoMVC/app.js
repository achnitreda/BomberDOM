import Mini from '../../mini-framework.js';

let nickname = ''
let c = null;
let playersOnline = 0
let hasJoined = false

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
      alert('Game started!')
      break

    case 'leave':
      playersOnline = data.pOnline
      c = null
      Mini.render(App(), document.getElementById('app'))
      break
  }
}

function App() {
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
      ? Mini.createElement('p', {}, `game starts in ${c} seconds...`)
      : null
  ])
}

Mini.render(App(), document.getElementById('app'))
