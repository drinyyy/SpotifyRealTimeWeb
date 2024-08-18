import './style.css';
import Experience from './Experience/experience';

const experience = new Experience(document.querySelector('.experience-canvas'));
// Assuming the `dot` element and the `curve` are available in your HTML
const dot = document.getElementById('dot');
const curve = document.getElementById('curve');

function getMousePosition(evt) {
    const CTM = curve.getScreenCTM();
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

function getClosestPointOnPath(path, point) {
    const pathLength = path.getTotalLength();
    let closestPoint = path.getPointAtLength(0);
    let closestDistance = distance(point, closestPoint);
    for (let i = 0; i <= pathLength; i++) {
        const currentPoint = path.getPointAtLength(i);
        const currentDistance = distance(point, currentPoint);
        if (currentDistance < closestDistance) {
            closestDistance = currentDistance;
            closestPoint = currentPoint;
        }
    }
    return closestPoint;
}

function distance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}

function moveDot(evt) {
    const mousePos = getMousePosition(evt);
    const closestPoint = getClosestPointOnPath(curve, mousePos);

    // Calculate the normalized position along the curve
    const pathLength = curve.getTotalLength();
    let closestLength = 0;
    let closestDistance = distance(mousePos, curve.getPointAtLength(0));

    for (let i = 0; i <= pathLength; i++) {
        const currentPoint = curve.getPointAtLength(i);
        const currentDistance = distance(mousePos, currentPoint);
        if (currentDistance < closestDistance) {
            closestDistance = currentDistance;
            closestLength = i;
        }
    }

    const normalizedPosition = closestLength / pathLength;

    // Update the Three.js camera position
    experience.camera.updateCameraPosition(normalizedPosition);

    dot.setAttribute('cx', closestPoint.x);
    dot.setAttribute('cy', closestPoint.y);
}

dot.addEventListener('mousedown', function() {
    document.addEventListener('mousemove', moveDot);
});

document.addEventListener('mouseup', function() {
    document.removeEventListener('mousemove', moveDot);
});

const clientId = 'c22592c67d3b410b9adf4663b836114f';
const redirectUri = 'https://peaceful-background.vercel.app/';
const scopes = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

let player;
let deviceId;

function getTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

function redirectToSpotifyAuth() {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
}

function setupSpotifyPlayer(token) {
    window.onSpotifyWebPlaybackSDKReady = () => {
        player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
            getOAuthToken: cb => { cb(token); },
            volume: 0.5
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            deviceId = device_id;
            enableControls();
            startPlayback(token, device_id);
        });

        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
            disableControls();
        });

        // Player State Changed
        player.addListener('player_state_changed', state => {
            if (state) {
                document.getElementById('track-name').textContent = state.track_window.current_track.name;
                document.getElementById('track-artist').textContent = state.track_window.current_track.artists[0].name;
                
                const playPauseIcon = document.getElementById('play-pause-icon');
                if (state.paused) {
                    playPauseIcon.textContent = 'play_arrow';
                } else {
                    playPauseIcon.textContent = 'pause';
                }
            }
        });

        // Error handling
        player.on('initialization_error', ({ message }) => {
            console.error('Failed to initialize', message);
        });
        player.on('authentication_error', ({ message }) => {
            console.error('Failed to authenticate', message);
            redirectToSpotifyAuth();
        });
        player.on('account_error', ({ message }) => {
            console.error('Failed to validate Spotify account', message);
        });
        player.on('playback_error', ({ message }) => {
            console.error('Failed to perform playback', message);
        });

        player.connect().then(success => {
            if (success) {
                console.log('The Web Playback SDK successfully connected to Spotify!');
            }
        });
    };
}

function enableControls() {
    document.getElementById('play-pause').disabled = false;
    document.getElementById('next-track').disabled = false;
    document.getElementById('previous-track').disabled = false;
}

function disableControls() {
    document.getElementById('play-pause').disabled = true;
    document.getElementById('next-track').disabled = true;
    document.getElementById('previous-track').disabled = true;
}

async function startPlayback(token, device_id) {
    const playlistUri = 'spotify:playlist:2tDsxJAuDXeenhCpHAzSfz';
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
            method: 'PUT',
            body: JSON.stringify({ context_uri: playlistUri }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Playback started successfully');
    } catch (e) {
        console.error('Error starting playback:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = getTokenFromUrl();
    
    if (!token) {
        redirectToSpotifyAuth();
    } else {
        localStorage.setItem('spotifyAccessToken', token);
        setupSpotifyPlayer(token);

        document.getElementById('play-pause').addEventListener('click', () => {
            if (player) {
                player.togglePlay().then(() => {
                    console.log('Toggled playback!');
                    const playPauseIcon = document.getElementById('play-pause-icon');
                    player.getCurrentState().then(state => {
                        if (state.paused) {
                            playPauseIcon.textContent = 'play_arrow';
                        } else {
                            playPauseIcon.textContent = 'pause';
                        }
                    });
                });
            }
        });

        document.getElementById('next-track').addEventListener('click', () => {
            if (player) {
                player.nextTrack().then(() => {
                    console.log('Skipped to next track!');
                });
            }
        });

        document.getElementById('previous-track').addEventListener('click', () => {
            if (player) {
                player.previousTrack().then(() => {
                    console.log('Skipped to previous track!');
                });
            }
        });
    }
});


