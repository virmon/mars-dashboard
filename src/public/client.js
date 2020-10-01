let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    roversPhoto: '',
    activeMenu: 'apod'
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const AttachEventClick = (link) => {
    console.log('<AttachEventClick />')
    link.addEventListener("click", function (el) {
        if (this.id === "apod") {
            console.log(this.id, `is clicked`)
            updateStore(store, { activeMenu: 'apod' })
            // getImageOfTheDay(store)
        } else {
            console.log(this.id, `is clicked`)
            updateStore(store, { activeMenu: this.id })
            console.log('fetch rover')
            getRover(this.id)
        }
      },
      false
    );
};

const render = async (root, state) => {
    root.innerHTML = App(state)

    const menu = root.getElementsByTagName("li");
    [...menu].forEach((element, i) => i < 4 ? AttachEventClick(element) : null);
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
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <h3 class=''>Astronomic Picture of the Day</h3>
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p class='apod-explain'>${apod.explanation}</p>
        `)
    } else {
        return (`
            <h3 class=''>Astronomic Picture of the Day</h3>
            <img src="${apod.url}" height="350px" width="100%" />
            <p class='apod-explain'>${apod.explanation}</p>
        `)
    }
}

const Home = (state) => {
    let { rovers, apod } = state

    return `
        <header><h1>Mars Rover Dashboard</h1></header>
        <main>
            ${Menu(rovers)}
            <section>
                ${Dashboard(store)}
            </section>
        </main>
        <footer></footer>
    `
}

const Menu = () => {
    const { rovers } = store

    return(`
        <ul class='menu'>
            <li id='apod' class='menu-item'>APOD</li>
            ${rovers.map((rover) => (
                `<li id='${rover}' class='menu-item'>${rover}</li>`
            )).join("")}
        </ul>
    `)
}

const Dashboard = (state) => {
    console.log('<Dashboard />')
    if (!state.apod) {
        console.log('Fetching apod data')
        getImageOfTheDay(state)
        return `Loading...`
    } else {
        if (state.activeMenu === 'apod') {
            console.log('<SHOW APOD at startup>')
            return ImageOfTheDay(state.apod)
        }
        console.log(`SHOW ${state.activeMenu}`)
        return PhotoList(state.activeMenu)
    }
}

const PhotoList = (rover) => {

    if (!store.roversPhoto[rover]) {
        return `Loading...`
    }
    let roverPhotos = store.roversPhoto[rover].photos
    
    return (`
        <div class='gallery-title'>
            <h3 class='rover-name'>${roverPhotos[0].rover.name}</h3>
            <h4 class='latest-date'>Launch Date: ${roverPhotos[0].rover.launch_date}</h4>
            <h4 class='latest-date'>Landing Date: ${roverPhotos[0].rover.landing_date}</h4>
            <h4 class='latest-date'>Status: ${roverPhotos[0].rover.status}</h4>
        </div>
        <div class='gallery'>
            ${roverPhotos.map(photo => (`
                <ul class='photo-list'>
                    <li class='photo-info'>ID: ${photo.id}</li>
                    <li class='photo-info'>
                        <img src='${photo.img_src}' alt='${photo.name}' />
                    </li>
                    <li class='photo-info'>${photo.camera.full_name}</li>
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
const getImageOfTheDay = async (state) => {
    await fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { 
                apod: apod.image,
                activeMenu: 'apod'
            })
        )
        .catch(err => console.log(err))
}

const getRover = async rover => {
    await fetch(`http://localhost:3000/rovers/${rover}/photos`)
        .then(res => res.json())
        .then(data => 
            updateStore(store, {
                roversPhoto: {
                    [rover]: {
                        photos: data.latest_photos
                    }
                },
                // activeMenu: rover
            }))
            // updateStore(store, data))
        // .catch(err => console.log(err))
        .then(data => console.log(store))
}
