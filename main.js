import './style.css';
import Experience from './Experience/experience';
import gsap from 'gsap';
const experience = new Experience(document.querySelector('.experience-canvas'));
// const dot = document.getElementById('dot');
// const curve = document.getElementById('curve');

// dot.addEventListener('mouseover', () => {
//   gsap.to(dot, {
//     duration: 0.2,
//     attr: { r: 3 }, // Increase radius to 3 on hover
//     ease: 'power1.out',
//   });
// });

// dot.addEventListener('mouseout', () => {
//   if (!isDragging) { // Ensure it only reverts when not dragging
//     gsap.to(dot, {
//       duration: 0.2,
//       attr: { r: 2 }, // Revert radius to 2
//       ease: 'power1.out',
//     });
//   }
// });

// let isDragging = false; // Flag to track if dragging is in progress

// function getMousePosition(evt) {
//   const CTM = curve.getScreenCTM();
//   return {
//     x: (evt.clientX - CTM.e) / CTM.a,
//     y: (evt.clientY - CTM.f) / CTM.d,
//   };
// }

// function getTouchPosition(evt) {
//   const CTM = curve.getScreenCTM();
//   const touch = evt.touches[0];
//   return {
//     x: (touch.clientX - CTM.e) / CTM.a,
//     y: (touch.clientY - CTM.f) / CTM.d,
//   };
// }

// function distance(point1, point2) {
//   return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
// }

// function getClosestPointOnPath(path, point) {
//   const pathLength = path.getTotalLength();
//   let closestPoint = path.getPointAtLength(0);
//   let closestDistance = distance(point, closestPoint);

//   for (let i = 0; i <= pathLength; i++) {
//     const currentPoint = path.getPointAtLength(i);
//     const currentDistance = distance(point, currentPoint);
//     if (currentDistance < closestDistance) {
//       closestDistance = currentDistance;
//       closestPoint = currentPoint;
//     }
//   }
//   return closestPoint;
// }

// function moveDot(evt) {
//   let mousePos;
//   if (evt.type === 'mousemove') {
//     mousePos = getMousePosition(evt);
//   } else if (evt.type === 'touchmove') {
//     mousePos = getTouchPosition(evt);
//   }

//   const closestPoint = getClosestPointOnPath(curve, mousePos);
//   const pathLength = curve.getTotalLength();
//   let closestLength = 0;
//   let closestDistance = distance(mousePos, curve.getPointAtLength(0));

//   for (let i = 0; i <= pathLength; i++) {
//     const currentPoint = curve.getPointAtLength(i);
//     const currentDistance = distance(mousePos, currentPoint);
//     if (currentDistance < closestDistance) {
//       closestDistance = currentDistance;
//       closestLength = i;
//     }
//   }

//   const normalizedPosition = closestLength / pathLength;
//   experience.camera.updateCameraPosition(normalizedPosition);

//   gsap.to(dot, {
//     attr: { cx: closestPoint.x, cy: closestPoint.y },
//     duration: 0.1, // Animation duration
//     ease: "power2.out",
//     delay: 0.1 // Delay before the animation starts
//   });
// }

// function onDragStart(evt) {
//   evt.preventDefault();
//   isDragging = true;

//   gsap.to(dot, {
//     duration: 0.2,
//     attr: { r: 3 }, // Increase radius during drag
//     ease: 'power1.out',
//   });

//   document.addEventListener('mousemove', moveDot);
//   document.addEventListener('touchmove', moveDot);
// }

// function onDragEnd() {
//   isDragging = false;

//   gsap.to(dot, {
//     duration: 0.2,
//     attr: { r: 2 }, // Revert radius back after dragging ends
//     ease: 'power1.out',
//   });

//   document.removeEventListener('mousemove', moveDot);
//   document.removeEventListener('touchmove', moveDot);
// }

// dot.addEventListener('mousedown', onDragStart);
// dot.addEventListener('touchstart', onDragStart);
// document.addEventListener('mouseup', onDragEnd);
// document.addEventListener('touchend', onDragEnd);
document.addEventListener('DOMContentLoaded', function () {
    // Create and insert the SoundCloud iframe
    function decodeUrl(encodedUrl) {
        return atob(encodedUrl);
    }

    // Obfuscated SoundCloud URL (Base64 encoded)
    var encodedUrl = 'aHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9kcmluLWxhamNpL3NldHMvY2hpbGxzdGF0aW9u';
    
    // Decode the URL
    var decodedUrl = decodeUrl(encodedUrl);

    // Create and insert the SoundCloud iframe
    var soundcloudPlayerContainer = document.getElementById('soundcloud-player-container');
    var iframe = document.createElement('iframe');
    iframe.id = 'soundcloud-player';
    iframe.width = '100%';
    iframe.height = '166';
    iframe.scrolling = 'no';
    iframe.frameBorder = 'no';
    iframe.allow = 'autoplay';
    iframe.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(decodedUrl) + '&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&visual=false';
    soundcloudPlayerContainer.appendChild(iframe);

    // Initialize the SoundCloud player
    var widget = SC.Widget(iframe);

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




        