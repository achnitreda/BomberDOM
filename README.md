# mini-framework

A lightweight JavaScript framework that implements core features of modern web frameworks like DOM abstraction, routing, state management, and event handling.

## Features

- **Virtual DOM**: Efficiently update the real DOM by comparing virtual DOM representations
- **State Management**: Centralized state management with subscription capability
- **Routing System**: Hash-based routing system synchronizes URLs with application state
- **Custom Event System**: Framework-level event handling system

## Getting Started

### Installation

You can include MiniFramework in your project using one of these methods:

**Method 1: HTML script tag**
```html
<script src="path/to/mini-framework.js"></script>
```

**Method 2: ES Module Import (recommended)**
```javascript
// Import the framework in your JavaScript file
import MiniFramework from 'path/to/mini-framework.js';

// Use the framework
const element = MiniFramework.createElement('div', {}, 'Hello World');
```

## Core Features

### Creating Elements

MiniFramework provides a `createElement` function to create virtual DOM elements:

```javascript
// Syntax: createElement(tag, attributes, ...children)
const vNode = MiniFramework.createElement('div', { class: 'container' },
  MiniFramework.createElement('h1', { class: 'title' }, 'Hello MiniFramework'),
  MiniFramework.createElement('p', { class: 'content' }, 'This is a paragraph')
);

// Render to DOM
MiniFramework.render(vNode, document.getElementById('app'));
```

### Adding Attributes

Attributes are specified as an object in the second parameter of createElement:

```javascript
const button = MiniFramework.createElement('button', { 
  class: 'btn primary',
  id: 'submit-btn',
  disabled: true,
  style: 'background-color: blue; color: white;'
}, 'Click me');
```

### Nesting Elements

Elements can be nested easily by passing child elements as additional arguments:

```javascript
const card = MiniFramework.createElement('div', { class: 'card' },
  MiniFramework.createElement('div', { class: 'card-header' },
    MiniFramework.createElement('h2', {}, 'Card Title')
  ),
  MiniFramework.createElement('div', { class: 'card-body' },
    MiniFramework.createElement('p', {}, 'Card content goes here'),
    MiniFramework.createElement('button', { 
      class: 'btn',
      onClick: () => alert('Button clicked')
    }, 'Click me')
  )
);
```

### Event Handling

#### DOM Events

You can add DOM events as attributes with the 'on' prefix:

```javascript
const button = MiniFramework.createElement('button', { 
  class: 'btn',
  onClick: (e) => {
    console.log('Button clicked!', e);
  }
}, 'Click me');
```

#### Custom Events

MiniFramework provides a custom event system for framework-level events:

```javascript
// Subscribe to an event
const unsubscribe = MiniFramework.on('userLoggedIn', (userData) => {
  console.log('User logged in:', userData);
});

// Emit an event
MiniFramework.emit('userLoggedIn', { id: 1, name: 'John' });

// Unsubscribe when no longer needed
unsubscribe();
```

### State Management

MiniFramework includes a simple but powerful state management system:

```javascript
// Create a store with initial state
const store = MiniFramework.createStore({
  count: 0,
  todos: []
});

// Get current state
const state = store.getState();
console.log(state.count); // 0

// Update state
store.setState({ count: state.count + 1 });

// Subscribe to state changes
const unsubscribe = store.subscribe((newState) => {
  console.log('State updated:', newState);
  // Re-render UI here
  MiniFramework.render(App(newState), document.getElementById('app'));
});

// Unsubscribe when no longer needed
unsubscribe();
```

### Routing

MiniFramework provides a basic routing system:

```javascript
// Initialize router with store
MiniFramework.router.init(store);

// Add routes
MiniFramework.router.addRoute('/', homeComponent);
MiniFramework.router.addRoute('/about', aboutComponent);
MiniFramework.router.addRoute('/todos', todosComponent);
MiniFramework.router.addRoute('*', notFoundComponent); // Fallback route

// Navigate to a route
MiniFramework.router.navigate('/about');
```

## How MiniFramework Works

### Virtual DOM

MiniFramework uses a virtual DOM approach to efficiently update the real DOM. When you create elements using `createElement`, you're building a lightweight JavaScript object representation of the DOM. When you call `render`, MiniFramework converts this virtual DOM into real DOM elements and inserts them into the provided container.

The virtual DOM follows this structure:

```javascript
{
  tag: 'div',
  attrs: { class: 'container' },
  children: [
    {
      tag: 'h1',
      attrs: { class: 'title' },
      children: ['Hello MiniFramework']
    },
    {
      tag: 'p',
      attrs: { class: 'content' },
      children: ['This is a paragraph']
    }
  ]
}
```

### State Management

The state management system is based on a centralized store pattern. When state changes, all subscribers are notified, allowing you to update your UI accordingly.

### Routing

Hash-based routing system synchronizes URLs with application state:

- **URL Synchronization**: URL reflects the current application state
- **Route Configuration**: Define routes and their associated components
- **Navigation Control**: Programmatic navigation between routes

### Event System

MiniFramework provides two types of event handling:
1. DOM-level events through attributes prefixed with 'on'
2. Application-level events through the custom event system (`on`/`emit`)

This separation allows for both direct DOM interaction and application-wide communication.

## Todo MVC Example

The framework includes a complete TodoMVC implementation, demonstrating all features:

- Adding, editing, completing, and removing todos
- Filtering todos (all, active, completed)
- Persisting todos in local storage
- URL-based routing for filters

To run the TodoMVC example:

1. Open `index.html` in your browser
2. Start adding and managing your todos
