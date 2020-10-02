const Map = Immutable.Map
const List = Immutable.List

const store = Map({
    user: { name: "Student" },
    apod: '',
    rovers: List(['Curiosity', 'Opportunity', 'Spirit']),
    roversPhoto: '',
    activeMenu: 'apod'
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = store.mergeDeep(newState)
    render(root, store)
}

const AttachEventClick = (link) => {
    link.addEventListener("click", function (el) {
        if (this.id === "apod") {
            updateStore(store, { activeMenu: 'apod' })
        } else {
            updateStore(store, { activeMenu: this.id })
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
    const date = apod.get('date')
    const media_type = apod.get('media_type')
    const url = apod.get('url')
    const title = apod.get('title')
    const explanation = apod.get('explanation')

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    // const photodate = new Date(apod.date)
    // console.log(photodate.getDate(), today.getDate());

    // console.log(photodate.getDate() === today.getDate());
    if (!apod || date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (media_type === "video") {
        return (`
            <h3 class='apod-title'>Astronomic Picture of the Day</h3>
            <p>See today's featured video <a href="${url}">here</a></p>
            <p>${title}</p>
            <p class='apod-explain'>${explanation}</p>
        `)
    } else {
        return (`
            <h3 class='apod-title'>Astronomic Picture of the Day</h3>
            <img src="${url}" height="350px" width="100%" />
            <p class='apod-explain'>${explanation}</p>
        `)
    }
}

/**
* @description Main section of the content
* @param {string} state
*/
const Home = (state) => {

    return `
        <header><h1>Mars Rover Dashboard</h1></header>
        <main>
            ${Menu(state.get('rovers'))}
            <section>
                ${Dashboard(state)}
            </section>
        </main>
        <footer>All Content are from https://api.nasa.gov/</footer>
    `
}

/**
* @description Menu component
* @param {string} rover - The name of the rover to be fetched
* @returns {string} - unordered list of rovers
*/
const Menu = (rovers) => {
    return(`
        <ul class='menu'>
            <li id='apod' class='menu-item'>APOD</li>
            ${rovers.map(rover => (
                `<li id='${rover}' class='menu-item'>${rover}</li>`
            )).join("")}
        </ul>
    `)
}

/**
* @description Dashboard component
* @param {string} state - current state of the store
* @returns {function} component
*/
const Dashboard = (state) => {
    const apod = state.get('apod')
    const activeMenu = state.get('activeMenu')

    if (!apod) {
        // console.log('Fetching apod data')
        getImageOfTheDay(state)
        return `Loading...`
    } else {
        if (activeMenu === 'apod') {
            // console.log('<SHOW APOD at startup>')
            return ImageOfTheDay(apod)
        }
        // console.log(`SHOW ${activeMenu}`)
        return PhotoList(state)
    }
}

/**
* @description List of photos component
* @param {string} rover - Selected rover name to be displayed
*/
const PhotoList = (state) => {
    const currentRover = state.get('roversPhoto')

    if (!currentRover) {
        return `Loading...`
    }
    
    const roverName = currentRover.get('0').rover.name
    const launchDate = currentRover.get('0').rover.launch_date
    const landingDate = currentRover.get('0').rover.landing_date
    const status = currentRover.get('0').rover.status
    
    return (`
        <div class='gallery-title'>
            <h3 class='rover-name'>${roverName}</h3>
            <h4 class='latest-date'>Launch Date: ${launchDate}</h4>
            <h4 class='latest-date'>Landing Date: ${landingDate}</h4>
            <h4 class='latest-date'>Status: ${status}</h4>
        </div>
        <div class='gallery'>
            ${currentRover.map(photo => (`
                <ul class='photo-list'>
                    <li class='photo-info'>ID: ${photo.id}</li>
                    <li class='photo-info'>
                        <img src='${photo.img_src}' alt='${photo.name}' />
                    </li>
                    <li class='photo-info'>${photo.camera.full_name}</li>
                    <li class='photo-info'>${photo.earth_date}</li>
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

/**
* @description Fetch APOD to update store
*/
const getImageOfTheDay = async (state) => {
    await fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => 
            updateStore(state, { apod: apod.image })
        )
        .catch(err => console.error(err))
}

/**
* @description Fetch rover photos to update store
* @param {string} rover - The name of the rover to be fetched
*/
const getRover = async rover => {
    await fetch(`http://localhost:3000/rovers/${rover}/photos`)
        .then(res => res.json())
        .then(data => 
            updateStore(store, {
                roversPhoto: List(data.latest_photos),
                activeMenu: rover
            }))
        .catch(err => console.error(err))
}
