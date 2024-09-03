import './style.css';
import Experience from './Experience/experience';
import gsap from 'gsap';
const experience = new Experience(document.querySelector('.experience-canvas'));

document.addEventListener('DOMContentLoaded', function () {
    
    function decodeUrl(encodedUrl) {
        return atob(encodedUrl);
    }

    
    var encodedUrl = 'aHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9kcmluLWxhamNpL3NldHMvY2hpbGxzdGF0aW9u';
    
    
    var decodedUrl = decodeUrl(encodedUrl);

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

    
    var widget = SC.Widget(iframe);

    
    var playPauseButton = document.getElementById('playPauseButton');
    var prevButton = document.getElementById('prevButton');
    var nextButton = document.getElementById('nextButton');
    var trackNameDisplay = document.getElementById('trackName');
    var trackImageDisplay = document.getElementById('trackImage');
    var backgroundImageDisplay = document.getElementById('backgroundImage');
    var playPauseIcon = playPauseButton.querySelector('.material-icons');

    
    var isPlaying = false;
    var currentRotation = 0;
    var rotationSpeed = 0.05;
    var animationFrameId;

    
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

    
    nextButton.addEventListener('click', function () {
        stopRotation();
        widget.next();
        startRotation();
    });

    
    prevButton.addEventListener('click', function () {
        stopRotation();
        widget.prev();
        startRotation();
    });

    
    function updateTrackInfo(currentSound) {
        trackNameDisplay.textContent = currentSound.title;

        
        if (currentSound.artwork_url) {
            var artworkUrl = currentSound.artwork_url.replace('-large', '-t500x500');
            trackImageDisplay.src = artworkUrl;
            backgroundImageDisplay.src = artworkUrl;
        } else {
            trackImageDisplay.src = ''; 
            backgroundImageDisplay.src = '';
        }
    }

   
    widget.bind(SC.Widget.Events.READY, function () {
        widget.getCurrentSound(function (currentSound) {
            updateTrackInfo(currentSound);
        });
    });

    
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




const aboutIcon = document.getElementById('aboutIcon');
const aboutContainer = document.getElementById('aboutContainer');


const tl = gsap.timeline({ paused: true });


tl.fromTo(
  aboutContainer,
  {
    scale: 0.8,   
    opacity: 0,   
    display: 'none', 
  },
  {
    scale: 1,     
    opacity: 1,   
    display: 'flex',
    duration: 0.5, 
    ease: 'power2.out', 
  }
);


aboutIcon.addEventListener('click', () => {
  if (aboutContainer.classList.contains('show')) {
    
    gsap.to(aboutContainer, {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        aboutContainer.style.display = 'none'; 
        aboutContainer.classList.remove('show'); 
      }
    });
  } else {
    
    aboutContainer.style.display = 'flex'; 
    aboutContainer.classList.add('show'); 
    tl.restart(); 
  }
});


document.addEventListener('mousemove', (event) => {
  const x = (window.innerWidth / 2 - event.clientX) / 50;
  const y = (window.innerHeight / 2 - event.clientY) / 50;
  aboutContainer.style.transform = `translate(-50%, -50%) rotateX(${y}deg) rotateY(${x}deg)`;
});
     


      