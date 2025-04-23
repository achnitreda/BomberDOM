import MiniFramework from "./mini-framework.js";

const gameState = {
    playerId: null,
    nickname: '',
    state: 'login'
}

const store = MiniFramework.createStore(gameState)

let socket;

const screens = {
    login: document.getElementById('login-screen'),
    waiting: document.getElementById('waiting-screen'),
    game: document.getElementById('game-screen'),
    win: document.getElementById('win-screen'),
    lose: document.getElementById('lose-screen')
}

function init() {
    document.getElementById('join-button').addEventListener('click', handleJoinGame)

    showScreen('login')
}

function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.toggle('hidden', key !== screenName)
    })
    store.setState({ state: screenName })
}

function connectWebSocket() {
    const protocol = window.location.protocol === 'https' ? 'wss' : 'ws'
    const wsUrl = `${protocol}//${window.location.host}`

    socket = new WebSocket(wsUrl)

    socket.onopen = () => {
        console.log('Connected to server')
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleServerMessage(data)
    }

    socket.onclose = () => {
        console.log('Disconnected from server')
        setTimeout(connectWebSocket, 3000);
    }

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    }
}

function handleServerMessage(data) {
    switch (data.type) {
        case 'playerId':
            store.setState({ playerId: data.playerId })
            break
    }
}

function handleJoinGame() {
    const nicknameInput = document.getElementById('nickname-input')
    const nickname = nicknameInput.value.trim()

    if (!nickname) {
        alert('Please enter a nickname');
        return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
        connectWebSocket()

        const checkConnection = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                clearInterval(checkConnection)
                sendJoinRequest(nickname)
            }
        }, 100)
    } else {
        sendJoinRequest(nickname)
    }
}

function sendJoinRequest(nickname) {
    store.setState({ nickname })

    socket.send(JSON.stringify({
        type: 'joinGame',
        nickname,
        playerId: store.getState().playerId
    }))
}

document.addEventListener('DOMContentLoaded', init)