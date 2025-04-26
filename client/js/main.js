import { startGame } from "./game.js";
import MiniFramework from "./mini-framework.js";

const gameState = {
    playerId: null,
    nickname: '',
    state: 'login',
    players: {},
    countdown: null,
    grid: null,
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

    document.getElementById('chat-send').addEventListener('click', () => {
        sendChatMessage('chat-input');
    });

    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage('chat-input');
    });

    document.getElementById('game-chat-send').addEventListener('click', () => {
        sendChatMessage('game-chat-input');
    });

    document.getElementById('game-chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage('game-chat-input');
    });

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

function updatePlayersList(players) {
    const container = document.getElementById('players-list-container')

    const playersList = MiniFramework.createElement('ul', { id: 'players-list' },
        ...Object.values(players).map(player =>
            MiniFramework.createElement('li', { key: player.id }, player.nickname)
        )
    );

    MiniFramework.render(playersList, container);
}

function updatePlayerCount(count) {
    document.getElementById('player-count').textContent = count
}

function addChatMessage(message, sender) {
    const chatMessages = [
        document.getElementById('chat-messages'),
        document.getElementById('game-chat-messages')
    ]

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const isSystem = sender === 'system'

    chatMessages.forEach(container => {
        let messageContent

        if (isSystem) {
            messageContent = [
                MiniFramework.createElement('span', { class: 'system' }, message),
                MiniFramework.createElement('span', { class: 'time' }, time)
            ]
        } else {
            messageContent = [
                MiniFramework.createElement('span', { class: 'sender' }, `${sender}:`),
                message,
                MiniFramework.createElement('span', { class: 'time' }, time)
            ]
        }

        const msgElement = MiniFramework.createElement('div', { class: 'chat-message', key: Date.now().toString() }, ...messageContent)

        // Render to a temporary container
        const tempDiv = document.createElement('div');
        MiniFramework.render(msgElement, tempDiv);

        container.appendChild(tempDiv.firstChild);
        container.scrollTop = container.scrollHeight
    })
}

function showCountdown(seconds, isWaiting) {
    const countdownContainer = document.getElementById('countdown-container')
    const countdownElement = document.getElementById('countdown')
    const waitingMessage = document.getElementById('waiting-message')

    countdownContainer.classList.remove('hidden')
    countdownElement.textContent = seconds
    if (isWaiting) {
        countdownContainer.style.color = '#FFA500';
        waitingMessage.textContent = 'Waiting for more players...';
    } else {
        countdownContainer.style.color = '#FF0000';
        waitingMessage.textContent = 'Get ready to play!'
    }
}

function handleServerMessage(data) {
    switch (data.type) {
        case 'playerId':
            store.setState({ playerId: data.playerId })
            break
        case 'joinedRoom':
            store.setState({
                players: data.players,
                state: 'waiting'
            })
            showScreen('waiting')
            updatePlayersList(data.players)
            updatePlayerCount(data.playerCount)
            break
        case 'playerJoined':
            const updatedPlayers = { ...store.getState().players }
            updatedPlayers[data.player.id] = data.player
            store.setState({ players: updatedPlayers })
            updatePlayersList(updatedPlayers)
            updatePlayerCount(Object.keys(updatedPlayers).length)
            addChatMessage(`${data.player.nickname} has joined the game.`, 'system');
            break
        case 'playerLeft':
            const currentPlayers = { ...store.getState().players };
            const leftPlayer = currentPlayers[data.playerId];
            delete currentPlayers[data.playerId];
            store.setState({ players: currentPlayers })
            updatePlayersList(currentPlayers)
            updatePlayerCount(Object.keys(currentPlayers).length)
            if (leftPlayer) {
                addChatMessage(`${leftPlayer.nickname} has left the game.`, 'system')
            }
            break
        case 'countdown':
            const isWaiting = data.isWaiting || false;
            store.setState({ countdown: data.countdown })
            showCountdown(data.countdown, isWaiting)
            break
        case 'countdownCancelled':
            document.getElementById('countdown-container').classList.add('hidden');
            break;
        case 'gameStart':
            store.setState({
                players: data.players,
                state: 'playing',
                grid: data.map
            });
            showScreen('game');
            startGame(data.map, data.players, store.getState().playerId)
            break
        case 'chatMessage':
            addChatMessage(data.message, data.sender);
            break;
        case 'roomReset':
            store.setState({
                state: 'login',
                players: {},
            })
            showScreen('login')
            break
        case 'error':
            if (data.error === 'nickname_taken') {
                alert(data.message)

                document.getElementById('nickname-input').value = '';
                document.getElementById('nickname-input').focus();
            } else {
                alert(data.message)
            }
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

function sendChatMessage(inputId) {
    const input = document.getElementById(inputId);
    const message = input.value.trim();
    if (message && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'chatMessage',
            message,
        }));
        input.value = '';
    }
}

document.addEventListener('DOMContentLoaded', init)