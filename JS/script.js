let currentsong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songul = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
        <img class="invert" src="Img/music.svg" alt="">
                            <div class="info">
                                <div>${decodeURI(song)}</div>
                                <div>Shaurya</div>
                            </div>
                            <div class="playnow">
                            <span>
                                Play Now
                                </span>
                                <img class="invert" src="Img/play.svg" alt="">
                            </div>
                        </li>`
    }
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = `${currFolder}/` + track;
    console.log('currentsong.src', currentsong.src);

    if (!pause) {
        currentsong.play();
        play.src = "Img/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let allas = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardContainer");
    let folder = [];
    let array = Array.from(allas);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1];
            console.log(decodeURI(folder));
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="Img/play_button_circle_light_green.svg" alt="">
                        </div>
                        <img class="pic" src="/songs/${folder}/Cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}

async function main() {
    await getsongs("songs/Arjit")
    playMusic(songs[0], true);
    displayAlbums()
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    previous.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    next.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    play.addEventListener("click", (e) => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "Img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "Img/play.svg";
        }
    })

    previous.addEventListener("click", () => {
    })
    next.addEventListener("click", () => {
    })

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = `${(currentsong.currentTime / currentsong.duration) * 100}%`;
    })

    document.querySelector(".seek-bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (percent / 100) * currentsong.duration;
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    })

    document.querySelector(".volumes>img").addEventListener("click", e => {
        console.log(e.target);
        if (e.target.src.includes("Img/volume.svg")) {
            e.target.src = e.target.src.replace("Img/volume.svg", "Img/mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("Img/mute.svg", "Img/volume.svg");
            currentsong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}
main();

