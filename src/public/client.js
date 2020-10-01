let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    return Home(state)
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
        getRover(`curiosity`)
    } else {
        return showError(apod)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.url}" height="350px" width="100%" />
            <p>${apod.explanation}</p>
        `)
    }
}

const Home = (state) => {
    let { rovers, apod } = state

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            ${Menu(rovers)}
            <section>
                ${ImageOfTheDay(apod)}
                ${PhotoList(store.activeMenu)}
            </section>
        </main>
        <footer></footer>
    `
}

const Menu = () => {
    const { rovers } = store

    return(`
        <ul class='menu'>
            <li class='menu-item'><a href='#'>APOD</a></li>
            ${rovers.map((rover) => (
                `<li id='${rover}' class='menu-item'><a href='/${rover}'>${rover}</a></li>`
            )).join("")}
        </ul>
    `)
}

const PhotoList = (name) => {
    const roverPhotos = store.roversPhoto[name].photos

    return (`
        <div class='gallery-title'>
            <h3 class='rover-name'>${roverPhotos[0].rover.name}</h3>
            <h4 class='latest-date'>${roverPhotos[0].earth_date}</h4>
        </div>
        <div class='gallery'>
            ${roverPhotos.map(photo => (`
                <ul class='photo-list'>
                    <li class='photo-info'>ID: ${photo.id}</li>
                    <li class='photo-info'>
                        <img src='${photo.img_src}' alt='${photo.name}' />
                    </li>
                    <li class='photo-info'>Launch Date: ${photo.rover.launch_date}</li>
                    <li class='photo-info'>Landing Date: ${photo.rover.landing_date}</li>
                    <li class='photo-info'>Status: ${photo.rover.status}</li>
                </ul>
        `)).join("")}
        </div>
    `)
}

const showError = (err) => {
    return(`
        <h2>${err.code}: ${err.msg}</h2>
    `)
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod: apod.image }))
        .catch(err => console.log(err))
    // return data
}

const getRover = rover => {
    fetch(`http://localhost:3000/rovers/${rover}/photos`)
        .then(res => res.json())
        .then(data => 
            updateStore(store, {
                roversPhoto: {
                    [rover]: {
                        photos: data.latest_photos
                    }
                },
                activeMenu: rover
            }))
            // updateStore(store, data))
        // .catch(err => console.log(err))
        .then(data => console.log(store))
}
