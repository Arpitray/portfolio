(() => {
  // Cache DOM elements
  const roomWrap = document.querySelector(".room-wrap");
  const room = document.querySelector(".room");
  const roomCanvas = document.querySelector("#room");
  // const inventory = document.querySelector("#inventory"); // Removed unused variable

  // Constants and state
  const views = ["back-view", "left-view", "front-view", "right-view"];
  const walls = ["wall-back", "wall-left", "wall-front", "wall-right"];
  let currentViewIndex = 1; // Start at 'front-view'
  let currentRotationY = -90;

  // Room transformation functions
  const updateRoomTransform = (offsetX, offsetY) => {
    room.style.transform = `rotateX(${offsetY}deg) rotateY(${currentRotationY + offsetX}deg)`;
  };

  const updateView = (direction) => {
    if (direction === "left") {
      currentViewIndex = (currentViewIndex + 1) % views.length;
      currentRotationY -= 90;
    } else if (direction === "right") {
      currentViewIndex = (currentViewIndex - 1 + views.length) % views.length;
      currentRotationY += 90;
    }

    roomWrap.classList.remove(...views);
    roomWrap.classList.add(views[currentViewIndex]);

    // Trigger CSS rotation animation
    roomWrap.classList.add("rotating");
    setTimeout(() => roomWrap.classList.remove("rotating"), 500);

    // Update active wall
    document.querySelectorAll(".room div").forEach((wall) => wall.classList.remove("active"));
    document.querySelector(`.${walls[currentViewIndex]}`).classList.add("active");

    updateRoomTransform(0, 0);
  };

  const initButtons = () => {
    document.getElementById("turnLeft").addEventListener("click", () => updateView("left"));
    document.getElementById("turnRight").addEventListener("click", () => updateView("right"));
    document.getElementById("zoom").addEventListener("click", () => roomCanvas.classList.toggle("zoomed"));
    document.getElementById("inv").addEventListener("click", () => roomCanvas.classList.toggle("inv-open"));
  };

  // Keyboard arrow key support
  const initKeyboardSupport = () => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") updateView("left");
      else if (e.key === "ArrowRight") updateView("right");
    });
  };

  // Mobile swipe support
  const initSwipeSupport = () => {
    let touchStartX = null;
    roomWrap.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    roomWrap.addEventListener("touchend", (e) => {
      if (touchStartX === null) return;
      const touchEndX = e.changedTouches[0].screenX;
      const diffX = touchStartX - touchEndX;
      if (Math.abs(diffX) > 30) { // Minimum swipe distance threshold
        diffX > 0 ? updateView("left") : updateView("right");
      }
      touchStartX = null;
    });
  };

  // Mouse movement interactivity
  const initMouseMovement = () => {
    roomWrap.addEventListener("mousemove", (e) => {
      const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
      const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;
      const rotateXOffset = parseFloat((xPercent * 15).toFixed(2));
      const rotateYOffset = parseFloat((-yPercent * 15).toFixed(2));
      updateRoomTransform(rotateXOffset, rotateYOffset);
    });
  };

  // Create cube faces for each .cube element
  const initCubes = () => {
    document.querySelectorAll(".cube").forEach((cube) => {
      const faces = ["top", "left", "front", "right", "back", "bottom"];
      faces.forEach((face) => {
        const faceElement = document.createElement("div");
        faceElement.classList.add(`cube-${face}`);
        cube.appendChild(faceElement);
      });
    });
  };

  // Tooltip tracker functionality
  const initTooltip = () => {
    const tooltip = document.querySelector("#tooltip");
    document.addEventListener("mousemove", (event) => {
      const tooltipPadding = 10;
      const pageWidth = window.innerWidth;
      const pageHeight = window.innerHeight;
      let top = event.clientY + tooltipPadding;
      let left = event.clientX + tooltipPadding;

      // Adjust if overflowing right or bottom edge
      if (left + tooltip.offsetWidth > pageWidth) {
        left = event.clientX - tooltip.offsetWidth - tooltipPadding;
      }
      if (top + tooltip.offsetHeight > pageHeight) {
        top = event.clientY - tooltip.offsetHeight - tooltipPadding;
      }
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    });

    document.querySelectorAll("[data-title]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const span = document.createElement("span");
        tooltip.innerHTML = "";
        span.textContent = el.getAttribute("data-title");
        span.classList.add("tooltip-content");
        tooltip.appendChild(span);
        tooltip.style.display = "block";
      });
      el.addEventListener("mouseleave", () => {
        tooltip.innerHTML = "";
        tooltip.style.display = "none";
      });
    });
  };

  // Comment dialogs with fade-out and hint functionality
  const initCommentDialogs = () => {
    const commentElements = document.querySelectorAll("[data-comment]");
    const dialog = document.querySelector("#dialog");

    const addComment = (htmlContent, commentClass) => {
      const commentDiv = document.createElement("div");
      commentDiv.innerHTML = htmlContent;
      if (commentClass) commentDiv.className = commentClass;
      commentDiv.style.cursor = "pointer";
      commentDiv.style.transition = "opacity 0.5s ease";

      const fadeOut = (element) => {
        element.style.opacity = "0";
        setTimeout(() => {
          if (element.parentElement) {
            element.parentElement.removeChild(element);
          }
        }, 500);
      };

      commentDiv.addEventListener("click", () => fadeOut(commentDiv));
      dialog.appendChild(commentDiv);
      setTimeout(() => fadeOut(commentDiv), 4000);
    };

    commentElements.forEach((el) => {
      el.addEventListener("click", () => {
        addComment(el.getAttribute("data-comment"));
      });
    });

    const hints = [
      "Ask again later.",
      "Think for yourself.",
      "Don't leave the house today.",
      "Stay asleep.",
      "Have you seen the exit?",
      "Always look on the bright side.",
       "If the house whispers your name... whisper back. But like, sarcastically.",
  "Don't split up. That's how side characters become backstory.",
  "Check under the bed. If something grabs you, at least you tried.",
  "If a doll moves, politely tell it you're not emotionally available.",
  "Locked doors usually mean secrets... or monsters. Either way, investigate!",
  "Basements are just evil gravity traps. Avoid unless you enjoy jump scares.",
  "The attic has answers. And probably ghosts. Bring snacks.",
  "See a mirror? Don't say anything three times unless you want regrets.",
  "If a piano plays itself, applaud. It's rude not to.",
  "Creaky stairs are normal. Creaky ceilings? You should run.",
  "If a portrait's eyes move, compliment its bone structure and leave.",
  "When you find a key, assume it unlocks trauma.",
  "Always take the flashlight. Phones die. So will you if you don't.",
  "Footsteps behind you? Walk faster. It's rude to keep fans waiting.",
  "Found a ritual circle? DO NOT add candles. This is not a DIY moment."
    ];
    document.querySelector("#hint").addEventListener("click", () => {
      addComment(hints[Math.floor(Math.random() * hints.length)], "hint");
    });
      const jokes = [
  "Why don't skeletons fight each other? They don't have the guts.",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "What do you call fake spaghetti? An impasta!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "I would avoid the sushi if I were you. It's a little fishy.",
  "Why don't eggs tell jokes? They'd crack each other up.",
  "What's orange and sounds like a parrot? A carrot.",
  "I only know 25 letters of the alphabet. I don't know y.",
  "Why can't your nose be 12 inches long? Because then it would be a foot!",
  "What did the ocean say to the beach? Nothing, it just waved.",
  "Why did the math book look sad? Because it had too many problems.",
  "What did one wall say to the other? 'I'll meet you at the corner.'",
  "Did you hear about the guy who invented Lifesavers? He made a mint!",
  "Why don't scientists trust atoms? Because they make up everything!",
  "I'm reading a book about anti-gravity. It's impossible to put down!"
];
   document.querySelector("#Joke").addEventListener("click", () => {
      addComment(jokes[Math.floor(Math.random() * jokes.length)], "jokes");
    });
    const facts = [
  "Bananas are berries, but strawberries aren't.",
  "A group of flamingos is called a 'flamboyance'.",
  "Honey never spoils — archaeologists found 3000-year-old honey in tombs that's still edible.",
  "Octopuses have three hearts and blue blood.",
  "There are more stars in the universe than grains of sand on Earth.",
  "Sloths can hold their breath longer than dolphins can.",
  "Wombat poop is cube-shaped.",
  "A day on Venus is longer than its year.",
  "Sharks existed before trees did.",
  "Humans share about 60% of their DNA with bananas.",
  "Your brain uses around 20% of your body’s total energy.",
  "Some cats are allergic to humans (rare, but real!).",
  "The Eiffel Tower can grow over 6 inches taller in the summer due to heat expansion.",
  "A bolt of lightning is five times hotter than the surface of the sun.",
  "Scotland's national animal is the unicorn."
];
   document.querySelector("#Facts").addEventListener("click", () => {
      addComment(facts[Math.floor(Math.random() * facts.length)], "facts");
    });
    const horrorFacts = [
  "Mirrors were once thought to trap souls.",
  "Some corpses twitch after death.",
  "Victorians took photos with the dead.",
  "The Amityville house is based on real events.",
  "Shadow people are common in sleep paralysis.",
  "The 'Hat Man' appears to many during nightmares.",
  "Aokigahara is Japan's haunted forest.",
  "Stairs in the Winchester House lead nowhere.",
  "Dolls like Annabelle are locked away in museums.",
  "Doppelgängers are seen by people worldwide.",
  "Ghost ships were found completely empty.",
  "Bells were once used in graves — just in case.",
  "Some claim children spirits are demons in disguise.",
  "Burial rituals were meant to stop the undead.",
  "Exorcists say demons lie about their names."
];
  document.querySelector("#supernatural").addEventListener("click", () => {
      addComment(horrorFacts[Math.floor(Math.random() * horrorFacts.length)], "horrorFacts");
    });
  };


  // Utility: Fan toggle and dark mode switch
  const initUtilities = () => {
    const fan = document.querySelector(".fan");
    if (fan) {
      fan.addEventListener("click", () => fan.classList.toggle("active"));
    }
    document.querySelectorAll(".switch").forEach((toggler) => {
      toggler.addEventListener("click", () => roomCanvas.classList.toggle("dark"));
    });
  };

  // Inventory item transfer setup
  const initInventory = () => {
    const roomItems = document.querySelectorAll('#room [data-item]');
    const invSlots = document.querySelectorAll('#invGrid li');
    roomItems.forEach((item) => {
      item.addEventListener('click', () => {
        // Move the item to the first empty inventory slot
        for (let slot of invSlots) {
          if (slot.children.length === 0) {
            slot.appendChild(item);
            break;
          }
        }
      });
    });
  };

  // Main initialization function called on DOMContentLoaded
  const init = () => {
    updateView(); // Initialize room view
    initButtons();
    initKeyboardSupport();
    initSwipeSupport();
    initMouseMovement();
    initCubes();
    initTooltip();
    initCommentDialogs();
    initUtilities();
    initInventory();
  };

  document.addEventListener("DOMContentLoaded", init);
})();
  const soundMap = {
    'cube-1': '../virtual project/Assets/audio/sound.1.mp3',
    'cube-3': '../virtual project/Assets/audio/sound.3.mp3',
    'cube-4': '../virtual project/Assets/audio/sound.4.mp3',
    'cube-5': '../virtual project/Assets/audio/sound.2.mp3',
  };

  document.querySelectorAll('.cube').forEach(cube => {
    cube.addEventListener('click', () => {
      const classList = [...cube.classList];
      const cubeClass = classList.find(cls => cls.startsWith('cube-') && cls !== 'cube');
      const soundFile = soundMap[cubeClass];
      if (soundFile) {
        const audio = new Audio(soundFile);
        audio.play();
      }
    });
  });
 const soundDiv = document.querySelector(".flat.switch.hover.day");
   const audio = document.getElementById("loop-sound");

    soundDiv.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        soundDiv.classList.remove("stopped");
        soundDiv.classList.add("playing");
      } else {
        audio.pause();
        audio.currentTime = 0;
        soundDiv.classList.remove("playing");
        soundDiv.classList.add("stopped");
      }
    });
