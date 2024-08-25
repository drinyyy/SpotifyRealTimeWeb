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
    var currentRotation = 0; // Track the current rotation angle
    var rotationSpeed = 0.05; // Adjust the speed of rotation
    var animationFrameId;

    // Function to rotate the image
    function rotateImage() {
        if (isPlaying) {
            currentRotation += rotationSpeed; // Increase the rotation angle
            trackImageDisplay.style.transform = `rotate(${currentRotation}deg)`; // Apply rotation

            animationFrameId = requestAnimationFrame(rotateImage); // Continue the animation
        }
    }

    // Play/Pause button functionality
    playPauseButton.addEventListener('click', function () {
        widget.isPaused(function (isPaused) {
            if (isPaused) {
                widget.play();
                playPauseIcon.textContent = 'pause'; // Change icon to 'pause'
                isPlaying = true;
                rotateImage(); // Start rotating
            } else {
                widget.pause();
                playPauseIcon.textContent = 'play_arrow'; // Change icon to 'play_arrow'
                isPlaying = false;
                cancelAnimationFrame(animationFrameId); // Stop rotating
            }
        });
    });

    // Next button functionality
    nextButton.addEventListener('click', function () {
        if (isPlaying) {
            cancelAnimationFrame(animationFrameId); // Stop any ongoing rotation
        }
        widget.next(); // Move to the next track
        if (isPlaying) {
            rotateImage(); // Restart rotating if it was playing
        }
    });

    // Previous button functionality
    prevButton.addEventListener('click', function () {
        if (isPlaying) {
            cancelAnimationFrame(animationFrameId); // Stop any ongoing rotation
        }
        widget.prev(); // Move to the previous track
        if (isPlaying) {
            rotateImage(); // Restart rotating if it was playing
        }
    });

    // Function to update track information
    function updateTrackInfo(currentSound) {
        trackNameDisplay.textContent = currentSound.title;

        // Set track and background images if available
        if (currentSound.artwork_url) {
            var artworkUrl = currentSound.artwork_url.replace('-large', '-t500x500');
            trackImageDisplay.src = artworkUrl;
            backgroundImageDisplay.src = artworkUrl; // Set background image
        } else {
            trackImageDisplay.src = ''; // Set to a default image or blank if no artwork
            backgroundImageDisplay.src = ''; // Set background image to default or blank
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
    });

    // Automatically start/stop rotation when the track is played/paused via widget events
    widget.bind(SC.Widget.Events.PLAY, function () {
        isPlaying = true;
        rotateImage(); // Start rotating
    });

    widget.bind(SC.Widget.Events.PAUSE, function () {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId); // Stop rotating
    });
});
