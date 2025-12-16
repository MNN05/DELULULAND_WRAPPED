// --- Global State Variables ---
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
let musicPlaying = false;
const totalSlides = document.querySelectorAll(".slide").length;


// Animation Intervals (global scope for clearing them)
let heartFireworksInterval = null;
let flameInterval = null;

const confettiContainer = document.querySelector('.confetti');
const colors = ['#ff006e', '#ffbe0b', '#8338ec', '#3a86ff', '#06d6a0'];

for (let i = 0; i < 40; i++) {
  const confetti = document.createElement('span');
  confetti.style.left = Math.random() * 100 + '%';
  confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
  confetti.style.animationDelay = (Math.random() * 4) + 's';
  confettiContainer.appendChild(confetti);
}

// --- 1. SLIDE NAVIGATION LOGIC (FIXED) ---

function updateNavButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
}

function showSlide(newIndex) {
  if (newIndex < 0 || newIndex >= totalSlides || newIndex === currentSlide) {
    return;
  }

  const direction = newIndex > currentSlide ? 1 : -1;
  const oldSlide = slides[currentSlide];
  const newSlide = slides[newIndex];

  // Clear old animations
  clearSlideAnimations(currentSlide);

  // Animate old slide out
  gsap.to(oldSlide, {
    x: -direction * 100 + '%',
    opacity: 0,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      oldSlide.classList.remove('active');
      oldSlide.style.visibility = 'hidden';
      oldSlide.style.transform = direction === 1 
        ? 'translateX(-100%)'   // if moving forward, push left
        : 'translateX(100%)';   // if moving backward, push right
    }
  });

  // Prepare new slide off-screen
  newSlide.style.visibility = 'visible';
  newSlide.style.opacity = 1;
  newSlide.style.transform = `translateX(${direction * 100}%)`;
  newSlide.classList.add('active');

  // Animate new slide in
  gsap.to(newSlide, {
    x: 0,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      newSlide.style.transform = 'translateX(0)';
    }
  });

  // Update state
  currentSlide = newIndex;
  updateNavButtons();

  // Run animations for the new slide
  runSlideAnimations(newIndex);
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    showSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    showSlide(currentSlide - 1);
  }
}

function clearSlideAnimations(index) {
    // Battle Slide (Index 3)
    if (index === 4) {
        // Find and kill all active GSAP animations related to power texts
        gsap.killTweensOf(document.getElementById('kelly-power'));
        gsap.killTweensOf(document.getElementById('tammy-power'));
        // Any setInterval logic for the old battle needs to be stopped here if it was used instead of GSAP
    }
    // Heart Slide (Index 8)
    if (index === 9 && heartFireworksInterval) {
        clearInterval(heartFireworksInterval);
        heartFireworksInterval = null;
        const container = document.getElementById('heart-burst-container');
        if (container) container.innerHTML = '';
    }
    // Fire Slide (Index 8)
    if (index === 10 && flameInterval) {
        clearInterval(flameInterval);
        flameInterval = null;
        const container = document.getElementById('flame-container');
        if (container) container.innerHTML = '';
    }
}

function runSlideAnimations(index) {
    gsap.from(slides[index].querySelector(".slide-title"), { 
        y: 40, 
        opacity: 0, 
        duration: 0.8 
    });
    
    // Trigger battle animation on slide 4 (index 3)
    if (index === 4) {
        setTimeout(animateBattle, 500);
    }
    
    // Trigger heart fireworks on slide 8 (index 7)
    if (index === 9) {
        setTimeout(startHeartFireworks, 300);
    }
    
    // Trigger flame animation on slide 9 (index 8)
    if (index === 10) {
        setTimeout(startFlameAnimation, 300);
    }
}


// --- 2. ANIMATIONS ---

// --- 2.1 Heart Fireworks (Index 7) ---

const heartEmojis = ['❤️', '💕', '💖', '💗', '💝', '💞', '💓'];

function startHeartFireworks() {
    if (currentSlide !== 9) return; 
    const container = document.getElementById('heart-burst-container'); 
    if (!container) return;

    if (heartFireworksInterval) clearInterval(heartFireworksInterval);
    
    const spawnAndClear = () => {
        if (currentSlide !== 9) { 
            clearInterval(heartFireworksInterval);
            return;
        }
        spawnHearts(container);
    };

    spawnAndClear(); 
    heartFireworksInterval = setInterval(spawnAndClear, 400);
}

function spawnHearts(container) {
    for (let i = 0; i < 12; i++) {
        const heart = document.createElement('div');
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.classList.add('heart-particle'); // Use the flyOut animation from CSS
        
        // Random direction, size, duration
        const angle = Math.random() * Math.PI * 2;
        const distance = 120 + Math.random() * 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const duration = 1 + Math.random() * 0.6;
        const delay = Math.random() * 0.1;
        const rotation = (Math.random() * 360) + 'deg';
        
        // Set CSS variables for the flyOut keyframes
        heart.style.setProperty('--tx', tx + 'px');
        heart.style.setProperty('--ty', ty + 'px');
        heart.style.setProperty('--rot', rotation);
        heart.style.animation = `flyOut ${duration}s ease-out ${delay}s forwards`;
        
        container.appendChild(heart);
        
        // Cleanup: Remove after animation
        setTimeout(() => heart.remove(), (duration + delay) * 1000 + 100);
    }
}


// --- 2.2 Flame Animation (Index 8) ---

const fireEmojis = ['🔥', '💨'];

function startFlameAnimation() {
    if (currentSlide !== 10) return; 
    const container = document.getElementById('flame-container');
    if (!container) return;

    if (flameInterval) clearInterval(flameInterval);
    
    const spawnAndClear = () => {
        if (currentSlide !== 10) { 
            clearInterval(flameInterval);
            return;
        }
        triggerFlames(10); // Spawn 10 flames per burst
    };

    triggerFlames(15); // Initial burst
    flameInterval = setInterval(spawnAndClear, 1000); // Recurring burst
}

function createFlameParticle() {
    const flame = document.createElement('span');
    flame.classList.add('fire-particle');
    
    const emoji = fireEmojis[Math.floor(Math.random() * fireEmojis.length)];
    flame.innerText = emoji;

    const size = 1 + Math.random() * 1.5 + 'rem';
    flame.style.fontSize = size;
    const duration = 1.5 + Math.random() * 1.5; // Duration in seconds
    const delay = Math.random() * 0.3; // Delay in seconds
    
    // Random parameters for the riseAndBurn keyframes
    const wiggle = (Math.random() * 30 - 15) + 'px'; 
    const rotation = (Math.random() * 60 - 30) + 'deg';
    // Start flame from anywhere on the bottom edge of the container (0% to 100%)
    const startPos = Math.random() * 100 + '%'; 
    
    flame.style.setProperty('--wiggle', wiggle);
    flame.style.setProperty('--rot', rotation);
    flame.style.setProperty('--start-x', startPos);
    flame.style.animation = `riseAndBurn ${duration}s ease-in-out ${delay}s forwards`;

    const container = document.getElementById('flame-container');
    if (!container) return;

    container.appendChild(flame);

    // Cleanup: Remove element after animation finishes
    setTimeout(() => flame.remove(), (duration + delay) * 1000 + 100);
}

function triggerFlames(count) {
    if (currentSlide !== 10) return; 

    for (let i = 0; i < count; i++) {
        setTimeout(createFlameParticle, i * 50);
    }
}


// --- 3. OTHER FUNCTIONS (TOGGLE MUSIC, BATTLE, EXPAND, DATA) ---
// (NOTE: This section is condensed for brevity, but includes the working logic)

function toggleMusic() {
    const audio = document.getElementById("bgMusic");
    const btn = document.getElementById("musicToggle");
    
    if (musicPlaying) {
        audio.pause();
        btn.textContent = "🎵";
        musicPlaying = false;
    } else {
        audio.muted = false;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                btn.textContent = "🔇";
                musicPlaying = true;
            }).catch(err => {
                console.error("Audio playback error:", err);
                btn.textContent = "🎵";
                musicPlaying = false;
            });
        }
    }
}

document.addEventListener('click', function() {
    const audio = document.getElementById("bgMusic");
    if (audio && !musicPlaying) {
        audio.play().catch(err => console.log("Autoplay blocked - click music button to play:", err));
    }
}, { once: true });


function expand(el) {
    el.classList.toggle("expanded");

    gsap.from(el.querySelector(".details"), {
        opacity: 0,
        y: -10,
        duration: 0.5
    });
}

function animateBattle() {
    const kellyPower = document.getElementById('kelly-power');
    const tammyPower = document.getElementById('tammy-power');
    const kellyEffects = document.getElementById('kelly-effects');
    const tammyEffects = document.getElementById('tammy-effects');
    const battleStatus = document.getElementById('battle-status');
    const winnerAnnounce = document.getElementById('winner-announce');
    
    if (!kellyPower || !tammyPower) return;
    
    // Reset state
    kellyEffects.innerHTML = '';
    tammyEffects.innerHTML = '';
    battleStatus.textContent = 'Battle Start!';
    winnerAnnounce.style.opacity = '0';
    
    // GSAP for smooth power bar increase
    gsap.to({kelly: 0, tammy: 0}, {
        kelly: 60,
        tammy: 90,
        duration: 7,
        ease: "power2.inOut",
        onUpdate: function() {
            const kellyValue = Math.round(this.targets()[0].kelly);
            const tammyValue = Math.round(this.targets()[0].tammy);

            kellyPower.textContent = `⚡ Power: ${kellyValue}%`;
            tammyPower.textContent = `⚡ Power: ${tammyValue}%`;

            const timeElapsed = this.totalTime();
            if (timeElapsed < 2) {
                battleStatus.textContent = '⚔️ Clash!';
            } else if (timeElapsed < 4.5) {
                battleStatus.textContent = '💥 Intense!';
            } else if (timeElapsed < 6) {
                battleStatus.textContent = '🔥 Tammy Gaining!';
            } else {
                battleStatus.textContent = '💪 Tammy Dominates!';
            }
        },
        onComplete: () => {
            battleStatus.textContent = '🏆 Victory!';
            gsap.to(winnerAnnounce, { opacity: 1, duration: 0.5 });
            
            const kellyFinalEffect = document.createElement('div');
            kellyFinalEffect.innerHTML = '😵';
            kellyFinalEffect.style.animation = 'shockwave 1.5s ease-out';
            kellyEffects.appendChild(kellyFinalEffect);
            setTimeout(() => kellyFinalEffect.remove(), 1500);
        }
    });
}

const dummyData = {
    topUser: "Rage Baiter Siziwe",
    userCounts: { "Rage Baiter Siziwe": 1245, "Angy": 987, "Psycho": 654, "Olwethu": 543, " Trusted adult Simz": 432 },
    topWords: { "anegke": 287, "gag": 256, "define": 234, "chommie": 156, "rude": 142 },
};

function displayDummyStats() {
    const topUserElement = document.getElementById("topUser");
    if (topUserElement) topUserElement.innerText = `👏 ${dummyData.topUser} 👏`;
    
    const userBreakdownElement = document.getElementById("userBreakdown");
    const userBreakdown = Object.entries(dummyData.userCounts)
        .map(([name, count]) => `${name}: ${count}`)
        .join("\n");
    if (userBreakdownElement) userBreakdownElement.innerText = userBreakdown;
    
    const topWordsElement = document.getElementById("topWords");
    const topWords = Object.entries(dummyData.topWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => `${word}: ${count}`)
        .join(" | ");
    if (topWordsElement) topWordsElement.innerText = topWords;
}


// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", function() {
  displayDummyStats();

  slides.forEach((slide, index) => {
    slide.style.position = "absolute";
    slide.style.top = "0";
    slide.style.width = "100%";
    slide.style.height = "100%";
    slide.style.transform = index === 0 ? "translateX(0)" : "translateX(100%)";
  });

  slides[0].classList.add("active");
  updateNavButtons();
  runSlideAnimations(0);
});