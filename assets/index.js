const audio = document.getElementById('audio');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');

const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const repeatBtn = document.getElementById('repeat');

const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const audioTitle = document.getElementById('audio-title');

const folderInput = document.getElementById('folder-picker');
const songList = document.getElementById('song-list');

let playlist = [];       // Array of {name, url}
let currentIndex = 0;

// ---------------- Folder Selection ----------------
folderInput.addEventListener('change', () => {
    const files = Array.from(folderInput.files).filter(file => file.type.startsWith('audio/') || file.name.endsWith('.wav'));
    playlist = files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
    currentIndex = 0;

    // Populate the song list
    songList.innerHTML = '';
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = track.name.replace(/\.[^/.]+$/, '');
        li.addEventListener('click', () => {
            currentIndex = index;
            loadTrack(currentIndex);
        });
        songList.appendChild(li);
    });

    if (playlist.length) loadTrack(0);
});

// ---------------- Progress Bar ----------------
audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = percent + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

progressBar.addEventListener('click', e => {
    const rect = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
});

let isDragging = false;
progressBar.addEventListener('mousedown', () => isDragging = true);
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const rect = progressBar.getBoundingClientRect();
    let moveX = e.clientX - rect.left;
    moveX = Math.max(0, Math.min(moveX, rect.width));
    audio.currentTime = (moveX / rect.width) * audio.duration;
});

// ---------------- Play/Pause ----------------
playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
});

audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        nextTrack();
    }
});


// ---------------- Playlist Navigation ----------------
prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentIndex);
});

nextBtn.addEventListener('click', nextTrack);

function nextTrack() {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadTrack(currentIndex);
}

function loadTrack(index) {
    const track = playlist[index];
    if (!track) return;

    audio.src = track.url;
    audio.play();
    audioTitle.textContent = track.name.replace(/\.[^/.]+$/, '');
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';

    // Highlight and scroll
    const items = document.querySelectorAll('#song-list li');
    items.forEach((li, i) => {
        li.classList.toggle('active', i === index);
        if (i === index) li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// ---------------- Repeat Button ----------------
let isRepeat = false;

repeatBtn.classList.remove('active');

repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat); // highlight when active
});

// ---------------- Time Formatting ----------------
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
