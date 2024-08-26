import './style.css';
import Experience from './Experience/experience';

const experience = new Experience(document.querySelector('.experience-canvas'));
const dot = document.getElementById('dot');
const curve = document.getElementById('curve');

function getMousePosition(evt) {
    const CTM = curve.getScreenCTM();
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

function getTouchPosition(evt) {
    const CTM = curve.getScreenCTM();
    const touch = evt.touches[0];
    return {
        x: (touch.clientX - CTM.e) / CTM.a,
        y: (touch.clientY - CTM.f) / CTM.d
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
    let mousePos;
    if (evt.type === 'mousemove') {
        mousePos = getMousePosition(evt);
    } else if (evt.type === 'touchmove') {
        mousePos = getTouchPosition(evt);
    }

    const closestPoint = getClosestPointOnPath(curve, mousePos);
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

    experience.camera.updateCameraPosition(normalizedPosition);

    dot.setAttribute('cx', closestPoint.x);
    dot.setAttribute('cy', closestPoint.y);
}

function onDragStart(evt) {
    evt.preventDefault(); // Prevent default behavior for touch events
    if (evt.type === 'mousedown' || evt.type === 'touchstart') {
        document.addEventListener('mousemove', moveDot);
        document.addEventListener('touchmove', moveDot);
    }
}

function onDragEnd() {
    document.removeEventListener('mousemove', moveDot);
    document.removeEventListener('touchmove', moveDot);
}

dot.addEventListener('mousedown', onDragStart);
dot.addEventListener('touchstart', onDragStart);
document.addEventListener('mouseup', onDragEnd);
document.addEventListener('touchend', onDragEnd);

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the SoundCloud player
    var iframeElement = document.getElementById('soundcloud-player');
    var widget = SC.Widget(iframeElement);

    // Get DOM elements for controls
    var playPauseButton = document.getElementById('playPauseButton');
    var prevButton = document.getElementById('prevButton');
    var nextButton = document.getElementById('nextButton');
    var trackNameDisplay = document.getElementById('trackName');
    var trackImageDisplay = document.getElementById('trackImage');
    var backgroundImageDisplay = document.getElementById('backgroundImage');
    var playPauseIcon = playPauseButton.querySelector('.material-icons');

    // Set initial state
    var isPlaying = false;
    var currentRotation = 0;
    var rotationSpeed = 0.05;
    var animationFrameId;

    // Function to rotate the image
    function rotateImage() {
        if (isPlaying) {
            currentRotation += rotationSpeed;
            trackImageDisplay.style.transform = `rotate(${currentRotation}deg)`;
            animationFrameId = requestAnimationFrame(rotateImage);
        }
    }

    function startRotation() {
        if (!isPlaying) {
            isPlaying = true;
            rotateImage();
        }
    }

    function stopRotation() {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
    }

    // Play/Pause button functionality
    playPauseButton.addEventListener('click', function () {
        widget.isPaused(function (isPaused) {
            if (isPaused) {
                widget.play();
                playPauseIcon.textContent = 'pause';
                startRotation();
            } else {
                widget.pause();
                playPauseIcon.textContent = 'play_arrow';
                stopRotation();
            }
        });
    });

    // Next button functionality
    nextButton.addEventListener('click', function () {
        stopRotation();
        widget.next();
        startRotation();
    });

    // Previous button functionality
    prevButton.addEventListener('click', function () {
        stopRotation();
        widget.prev();
        startRotation();
    });

    // Function to update track information
    function updateTrackInfo(currentSound) {
        trackNameDisplay.textContent = currentSound.title;

        // Set track and background images if available
        if (currentSound.artwork_url) {
            var artworkUrl = currentSound.artwork_url.replace('-large', '-t500x500');
            trackImageDisplay.src = artworkUrl;
            backgroundImageDisplay.src = artworkUrl;
        } else {
            trackImageDisplay.src = ''; // Set to a default image or blank if no artwork
            backgroundImageDisplay.src = '';
        }
    }

    // Update track information on player ready
    widget.bind(SC.Widget.Events.READY, function () {
        widget.getCurrentSound(function (currentSound) {
            updateTrackInfo(currentSound);
        });
    });

    // Update track information on track change
    widget.bind(SC.Widget.Events.PLAY, function () {
        widget.getCurrentSound(function (currentSound) {
            updateTrackInfo(currentSound);
        });
        startRotation();
    });

    widget.bind(SC.Widget.Events.PAUSE, function () {
        stopRotation();
    });
});