# 🎮 Bomberman DOM

A multiplayer browser-based Bomberman game built with a custom JavaScript framework and WebSocket real-time communication.

## 📋 Project Overview

This is a real-time multiplayer implementation of the classic Bomberman game where 2-4 players battle until only one remains standing. Built entirely with vanilla JavaScript using a custom mini-framework (no Canvas or WebGL), this project demonstrates advanced web game development techniques including real-time synchronization, performance optimization, and client-server architecture.

## ✨ Features

### 🕹️ Core Gameplay
- **2-4 Player Multiplayer**: Real-time battles with up to 4 simultaneous players
- **3 Lives System**: Each player starts with 3 lives before elimination
- **Strategic Combat**: Place bombs strategically to eliminate opponents and destroy obstacles
- **Power-Up System**: Collect random power-ups from destroyed blocks:
  - 💣 **Bombs**: Increase bomb capacity by 1
  - 🔥 **Flames**: Extend explosion range by 1 block
  - ⚡ **Speed**: Increase movement speed

### 🗺️ Map Design
- Fixed map visible to all players
- **Walls**: Indestructible obstacles in fixed positions
- **Blocks**: Destructible obstacles randomly generated
- **Safe Starting Zones**: Players spawn in corners with guaranteed survival space

### 💬 Real-Time Chat
- WebSocket-powered chat system
- Communicate with other players during matches
- Lobby chat before game starts

### ⚡ Performance Optimized
- Maintains **60 FPS** consistently
- Zero frame drops
- Efficient use of `requestAnimationFrame`
- Performance monitoring and optimization

## 🎯 Game Mechanics

### Matchmaking Flow
1. **Nickname Entry**: Players enter a unique nickname upon joining
2. **Waiting Lobby**: Player counter displays current participants (max 4)
3. **Auto-Start Logic**:
   - If 2-3 players join: 20-second wait, then 10-second countdown
   - If 4 players join: Immediate 10-second countdown
4. **Game Start**: Battle begins after countdown completes

### Controls
- **Arrow Keys** or **WASD**: Move player
- **Spacebar**: Place bomb
- Bombs explode automatically after a set timer
- Explosions travel in 4 directions until hitting a wall or reaching range limit

### Victory Condition
Last player standing wins the match!

## 🛠️ Technical Stack

- **Frontend**: Custom JavaScript mini-framework (DOM manipulation)
- **Real-Time Communication**: WebSockets
- **No External Game Libraries**: No Canvas, WebGL, or game engines
- **Performance Tools**: Browser DevTools for profiling

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/FriMohamed/bomberman-dom.git

# Navigate to project directory
cd bomberman-dom

# Install dependencies (if any)
npm install

# Start the server
npm start
```
