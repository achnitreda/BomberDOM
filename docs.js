// // -------- DOM abstraction --------

// const button = MiniFramework.createElement('button', {
//     class: 'btn',
//     onClick: (e) => {
//         console.log('Button clicked!', e);
//     }
// }, 'Click me');

// const vNode = MiniFramework.createElement('div', { class: 'container' },
//     MiniFramework.createElement('h1', { class: 'title' }, 'Hello MiniFramework'),
//     MiniFramework.createElement('p', { class: 'content' }, 'This is a paragraph'),
//     MiniFramework.createElement('button', {
//         class: 'btn primary',
//         id: 'submit-btn',
//         disabled: true,
//         style: 'background-color: blue; color: white;'
//     }, 'Click me'),
//     MiniFramework.createElement('div', { class: 'card' },
//         MiniFramework.createElement('div', { class: 'card-header' },
//             MiniFramework.createElement('h2', {}, 'Card Title')
//         ),
//         MiniFramework.createElement('div', { class: 'card-body' },
//             MiniFramework.createElement('p', {}, 'Card content goes here'),
//             MiniFramework.createElement('button', {
//                 class: 'btn',
//                 onClick: () => alert('Button clicked')
//             }, 'Click me')
//         )
//     ),
//     button,
// );

// // -------- state management example --------
// const store = MiniFramework.createStore({
//     count: 0,
//     todos: []
// })

// console.log("1 ->", store.getState().count)


// const unsubscribe = store.subscribe((newState) => {
//     console.log("s1 ->",newState.count)
// })

// store.setState({count : store.getState().count + 1})
// // shows s1 -> 1
// store.setState({count : store.getState().count + 1})
// // shows s1 -> 2


// unsubscribe()
// console.log("unsubscribe form store")

// store.setState({count : store.getState().count + 1})
// // nothing will appear that why subscribsion is good for re-rendering when state change

// console.log("final state ->", store.getState().count)
// // shows final state -> 3


// // Render to DOM
// const appContainer = document.getElementById('app')
// MiniFramework.render(vNode, appContainer);


// --------- routing system example -----------

// 1. create store state 
const store = MiniFramework.createStore({
    todos: [],
    filter: 'all',
})

// 2. create page components
function HomeComponent() {
    return MiniFramework.createElement(
        'div', {},
        MiniFramework.createElement('h1', {}, 'Home page'),
        MiniFramework.createElement('p', {}, 'this is home page')
    )
}

function AboutComponent() {
    return MiniFramework.createElement('div', {},
        MiniFramework.createElement('h1', {}, 'About Us'),
        MiniFramework.createElement('p', {}, 'This is a mini-framework demo')
    );
}


const appContainer = document.getElementById('app')
// 3. Initialze the router
document.addEventListener('DOMContentLoaded', () => {
    MiniFramework.router.init(store)

})

// 4. Add routes
MiniFramework.router.addRoute('/examples/todoMVC/', () => {
    MiniFramework.render(HomeComponent(), appContainer)
})

MiniFramework.router.addRoute('/examples/todoMVC/about', () => {
    MiniFramework.render(AboutComponent(), appContainer)
})

// 6. Create navigation links
function NavBar() {
    return MiniFramework.createElement('nav', {},
        MiniFramework.createElement('a', {
            href: '/',
            onClick: (e) => {
                e.preventDefault();
                MiniFramework.router.navigate('/examples/todoMVC/');
            }
        }, 'Home'),
        ' | ',
        MiniFramework.createElement('a', {
            href: '/about',
            onClick: (e) => {
                e.preventDefault();
                MiniFramework.router.navigate('/examples/todoMVC/about');
            }
        }, 'About')
    );
}

// 7. Render the navigation
MiniFramework.render(NavBar(), document.getElementById('nav'));


