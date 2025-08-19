// Get the viewer
//Brain_model//
const viewer = document.querySelector('#brainModel');

let initialCameraTarget;
let initialCameraOrbit;

viewer.addEventListener("load", () => {
  // Save starting camera state
  initialCameraTarget = viewer.getCameraTarget();
  initialCameraOrbit = viewer.getCameraOrbit();
});

// Highlight part
function highlightPart(el, part) {
  // Hide all hotspots
  document.querySelectorAll('.hotspot').forEach(b => {
    b.classList.remove('active');
  });
  
  // Show the clicked one
  el.classList.add('active');

  // Move camera
  moveToPart(part);
}

// Highlight via button
function highlightViaButton(part) {
  const hotspot = document.querySelector(`[slot="hotspot-${part}"]`);
  if (hotspot) highlightPart(hotspot, part);
}
  document.querySelectorAll('#brainModel .label')
    .forEach(label => label.classList.remove('active'));

// Move camera
function moveToPart(part) {
  switch (part) {
    case 'frontal':
      viewer.cameraTarget = '0 1 0';
      viewer.cameraOrbit = '10deg 50deg 2m';
      break;
    case 'parietal':
      viewer.cameraTarget = '0 0.1 0';
      viewer.cameraOrbit = '-90deg 40deg 2.3m';
      break;
    case 'temporal':
      viewer.cameraTarget = '0.1 -0.05 0';
      viewer.cameraOrbit = '-70deg 90deg 2.3m';
      break;
    case 'occipital':
      viewer.cameraTarget = '-0.1 0.05 -0.1';
      viewer.cameraOrbit = '180deg 40deg 2.3m';
      break;
    case 'cerebellum':
      viewer.cameraTarget = '0 -0.15 -0.15';
      viewer.cameraOrbit = '-180deg 100deg 2.3m';
      break;
    case 'stem':
      viewer.cameraTarget = '0 -0.15 -0.15';
      viewer.cameraOrbit = '0deg 190deg 2.3m';
      break;
  }
}

// Button handlers
const buttons = document.querySelectorAll('.lobe-button');
buttons.forEach(button => {
  button.addEventListener('click', (e) => {
    buttons.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');

    const lobe = e.currentTarget.getAttribute('data-lobe');
    highlightViaButton(lobe);
  });
});

// Reset camera
const BrainModel = document.querySelector("#brainModel");
const resetBrainButton = document.querySelector('#resetCameraBtn');
resetBrainButton?.addEventListener('click', () => {
  BrainModel.setAttribute('camera-orbit', initialLungOrbit);
});


const brainInfo = {
  frontal: "The Frontal Lobe is responsible for reasoning, planning, and controlling voluntary movements. It governs emotions, problem-solving, and speech production. It also plays a vital role in shaping our personality and making complex decisions.",
  parietal: "The Parietal Lobe processes sensory information such as touch, pressure, and pain. It assists with spatial orientation, navigation, and understanding language. Its role is crucial for integrating sensory inputs into a coherent picture.",
  temporal: "The Temporal Lobe is vital for processing auditory information and understanding language. It's deeply involved in forming memories and interpreting emotions, making it central for both learning and communication.",
  occipital: "The Occipital Lobe is primarily responsible for visual processing, interpreting shapes, colors, and motion. It connects with other brain areas to help us recognize objects and understand the world we see.",
  cerebellum: "The Cerebellum coordinates voluntary movements, maintains balance, and refines motor skills. It plays a role in motor learning, making movements smooth and precise. Without it, basic activities like walking or writing would be challenging.",
  stem: "The Brain Stem controls vital life-sustaining functions such as breathing, heart rate, and blood pressure. It acts as a relay center, connecting the brain to the spinal cord, and governs essential reflexes like swallowing, coughing, and sleeping. Its role is crucial for survival and maintaining consciousness."
};
// innerText.innerHTML = brainInfo.frontal.

//infoInsertion

const displayDiv = document.querySelector('.innerText');
let typingTimeouts = [];

// Main click listener
document.querySelectorAll('.lobe-button').forEach(button => {
  button.addEventListener('click', e => {
    const part = e.currentTarget.getAttribute('data-lobe');
    if (brainInfo[part]) {
      cancelTyping();
      typeWriter(brainInfo[part]);
    }
  });
});

// Cancel any ongoing typing
function cancelTyping() {
  typingTimeouts.forEach(timeout => clearTimeout(timeout));
  typingTimeouts = [];
}

// Typing animation
function typeWriter(text) {
  displayDiv.innerHTML = ""; 
  let index = 0;

  function addCharacter() {
    if (index < text.length) {
      displayDiv.innerHTML += text[index];
      index++;
      typingTimeouts.push(setTimeout(addCharacter, 20));
    }
  }
  addCharacter();
}
//heart_Model //
const heartModel = document.querySelector('#heart-model');

// Camera angles/distances for every heart part
const heartPartPositions = {
  "right-atrium": "275deg 70deg 2.2m",
  "left-atrium": "200deg 60deg 1.5m",
  "right-ventricle": "30deg 120deg 1.5m",
  "left-ventricle": "70deg 115deg 1.5m",
  "Left anterior descending coronary artery": "25deg 110deg 1.5m",
  "pulmonary-trunk": "15deg 55deg 1.5m",
  "aorta": "-20deg 20deg 2m",
  "pulmonary-artery": "220deg 40deg 1.5m",
   "Inferior Vena Cava": "275deg 120deg 2.2m",
   "superior Vena Cava": "290deg 45deg 2.2m",

};

function highlightHeartPart(button, part) {
  // Move camera
  heartModel.setAttribute('camera-orbit', heartPartPositions[part]);

  // Reset any active labels
  document.querySelectorAll('#heart-model .heart-label')
    .forEach(label => label.classList.remove('active'));

  // Highlight only if it's an internal hotspot
  if (button && button.querySelector('.heart-label')) {
    button.querySelector('.heart-label').classList.add('active');
  }
}

// Handle clicks from external buttons
document.querySelectorAll('#heart-buttons button').forEach(button => {
  button.addEventListener('click', e => {
    const part = e.currentTarget.getAttribute('data-part');
    if (heartPartPositions[part]) {
      highlightHeartPart(null, part);
    }
  });
});
// ==================== HEART MODEL CAMERA HANDLERS =====================

// Get the model viewer element

function highlightHeartPartForHeart(button, part) {
  // Save the camera position if this is the first click
  if (!heartInitialOrbit) {
    heartInitialOrbit = heartModelViewer.getAttribute('camera-orbit');
  }

  // Move the camera
  heartModelViewer.setAttribute('camera-orbit', heartPartPositions[part]);

  // Highlight label
  // if (button && button.querySelector('.label')) {
  //   document.querySelectorAll('#heart-model .label')
  //     .forEach(label => label.classList.remove('active'));
  //   button.querySelector('.label')?.classList.add('active');
  // }
}
const heartModelViewer = document.querySelector('#heart-model');
const initialHeartOrbit = heartModelViewer.getAttribute('camera-orbit');
const heartResetButton = document.querySelector('#reset-camera');
heartResetButton.addEventListener('click', () => {
  heartModelViewer.setAttribute('camera-orbit', initialHeartOrbit);
});
// Hide all hotspots
// Hide all hotspots
// When external buttons are clicked
const externalButtons = document.querySelectorAll('#heart-buttons button');
externalButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const part = e.currentTarget.getAttribute('data-part');

    // Move camera
    if (heartPartPositions[part]) {
      highlightHeartPart(null, part);
    }

    // Hide all hotspots
    document.querySelectorAll('.heart-hotspot')
      .forEach(hotspot => hotspot.classList.remove('visible'));

    // SHOW the specific hotspot
    const targetHotspot = document.querySelector(`.heart-hotspot[data-part="${part}"]`);
    if (targetHotspot) {
      targetHotspot.classList.add('visible');
    }
  });
});
const heartPartInfo = {
  "right-atrium": "Right Atrium: Collects deoxygenated blood from the body via the vena cavae.\nActs as a reservoir before passing blood to the right ventricle.\nHas thin walls suited for low pressure.\nPlays a vital role in initiating pulmonary circulation.",
  "left-atrium": "Left Atrium: Receives oxygen-rich blood from the pulmonary veins.\nActs as a chamber to fill the left ventricle.\nHas slightly thicker walls than the right atrium.\nSupports systemic blood flow to the rest of the body.",
  "right-ventricle": "Right Ventricle: Pumps deoxygenated blood to the lungs via the pulmonary artery.\nHas moderately thick walls for low-pressure pulmonary circulation.\nWorks with valves to maintain unidirectional blood flow.\nSupports gas exchange in the lungs.",
  "left-ventricle": "Left Ventricle: Pumping chamber for oxygen-rich blood to the body.\nHas the thickest walls due to high systemic pressure.\nWorks with valves for efficient and controlled blood flow.\nEssential for providing oxygen and nutrients to all organs.",
  "Left anterior descending coronary artery": "LAD Artery: Supplies oxygen-rich blood to the front of the heart.\nTravels down the interventricular groove towards the apex.\nCommon site for blockages leading to heart attacks.\nVital for perfusion of the left ventricle and septum.",
  "pulmonary-trunk": "Pulmonary Trunk: Carries deoxygenated blood from the right ventricle.\nDivides into right and left pulmonary arteries.\nSupports gas exchange by sending blood to the lungs.\nActs as the main conduit of the pulmonary circuit.",
  "aorta": "Aorta: Main artery transporting oxygen-rich blood from the left ventricle.\nHas strong, elastic walls to tolerate high systemic pressure.\nBranches extensively to supply the entire body.\nEssential for sustaining systemic circulation.",
  "pulmonary-artery": "Right Pulmonary Artery: Transports deoxygenated blood from the heart to the right lung.\nConnects the right ventricle to the pulmonary capillaries.\nSupports gas exchange and reoxygenation of blood.\nPlays a vital role in the pulmonary circulation pathway.",
  "Inferior Vena Cava": "Inferior Vena Cava: Returns deoxygenated blood from the lower body to the right atrium.\nTravels upward along the spine towards the heart.\nHas a wide diameter for high-volume venous return.\nSupports right atrial filling and overall cardiac output.",
  "superior Vena Cava": "The Superior Vena Cava is a large vein that collects deoxygenated blood from the head, neck, upper chest, and arms and returns it to the Right Atrium of the heart. It is one of the main veins of the body and plays a vital role in ensuring blood returns to the heart for reoxygenation."
};

const heartDisplayDiv = document.querySelector('.innerText2');
let heartTypingQueue = [];

document.querySelectorAll('[data-part]').forEach(button => {
  button.addEventListener('click', e => {
    const part = e.currentTarget.getAttribute('data-part');
    if (heartPartInfo[part]) {
      cancelHeartTyping();
      runHeartTyping(heartPartInfo[part]);
    }
  });
});

function cancelHeartTyping() {
  heartTypingQueue.forEach(timeout => clearTimeout(timeout));
  heartTypingQueue = [];
}

function runHeartTyping(text) {
  heartDisplayDiv.innerHTML = ""; 
  let index = 0;

  function addCharacter() {
    if (index < text.length) {
      heartDisplayDiv.innerHTML += text[index];
      index++;
      heartTypingQueue.push(setTimeout(addCharacter, 20));
    }
  }
  addCharacter();
}
const cards = document.querySelectorAll('.syn_card');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse X relative to card
    const y = e.clientY - rect.top;  // Mouse Y relative to card
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 14; // Max 8° tilt
    const rotateY = ((x - centerX) / centerX) * 14;

    card.style.transition = 'none';
    card.style.transform = `rotateX(${ -rotateX }deg) rotateY(${ rotateY }deg) scale(1.04)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  });
});
  document.getElementById('goToBrain').addEventListener('click', () => {
    document.getElementById('brainSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
    document.getElementById('goBrain').addEventListener('click', () => {
    document.getElementById('brainSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
    document.getElementById('goToHeart').addEventListener('click', () => {
    document.getElementById('heartSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
      document.getElementById('goHeart').addEventListener('click', () => {
    document.getElementById('heartSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
   document.getElementById('goToLungs').addEventListener('click', () => {
    document.getElementById('lungsSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
     document.getElementById('goLungs').addEventListener('click', () => {
    document.getElementById('lungsSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
  
     document.getElementById('goToKidney').addEventListener('click', () => {
    document.getElementById('kidneySection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
       document.getElementById('gokidney').addEventListener('click', () => {
    document.getElementById('kidneySection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
       document.getElementById('goToLiver').addEventListener('click', () => {
    document.getElementById('liverSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
         document.getElementById('goLiver').addEventListener('click', () => {
    document.getElementById('liverSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
        document.getElementById('goTostomach').addEventListener('click', () => {
    document.getElementById('stomachSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
          document.getElementById('goStomach').addEventListener('click', () => {
    document.getElementById('stomachSection')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
         document.getElementById('goToTop').addEventListener('click', () => {
    document.querySelector('.syn_wrapper')
            .scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
  });
  const boxes = document.querySelectorAll('.box');

boxes.forEach(box => {
  box.addEventListener('mousemove', (e) => {
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse X relative to card
    const y = e.clientY - rect.top;  // Mouse Y relative to card
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 10; // Max 8° tilt
    const rotateY = ((x - centerX) / centerX) * 10;

    box.style.transition = 'none';
    box.style.transform = `rotateX(${ -rotateX }deg) rotateY(${ rotateY }deg) scale(1.04)`;
  });

  box.addEventListener('mouseleave', () => {
    box.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    box.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  });
});
// Define camera positions for each part of the lung
// ==================== LUNGS MODEL CAMERA HANDLERS =====================

// Positions
// ==================== LUNG PART POSITIONS =====================

// ==================== LUNG PART POSITIONS =====================

//Lungs_Model //
const lungModel = document.querySelector('#lungsModel');
const lungDataMap = {
  trachea: "Trachea: The main airway that connects the throat (larynx) to the bronchi, reinforced with C-shaped cartilage rings to stay open, allowing air to move smoothly in and out of the lungs.",
  bronchi: "Bronchi: The two primary branches of the trachea that direct air into the right and left lungs, progressively dividing into smaller bronchi and bronchioles for efficient air distribution throughout the lung tissue.",
  "right-lung": "Right Lung: The larger of the two lungs, divided into three lobes (superior, middle, and inferior), providing a significant area for gas exchange and supporting a greater volume of breathing.",
  "left-lung": "Left Lung: The smaller lung with two lobes (superior and inferior), shaped to accommodate the heart and maintain vital gas exchange despite its slightly reduced volume.",
  apex: "Apex: The rounded top portion of the lung that sits just above the first rib and slightly extends into the root of the neck, aiding in the uppermost area of breathing and gas distribution.",
  base: "Base: The broad, dome-shaped lower surface of the lung resting on the diaphragm, rising and falling with breathing to enable deep air intake and release.",
  "superior-lobe": "Superior Lobe: The uppermost segment of both lungs, rich in alveoli, facilitating a significant portion of oxygen intake and carbon dioxide expulsion during breathing.",
  "middle-lobe": "Middle Lobe: The right lung's central segment, adding surface area for gas exchange and contributing to overall lung efficiency and breathing capacity.",
  "inferior-lobe": "Inferior Lobe: The largest and lowest lobe of both lungs, expanding extensively with breathing and providing the majority of the surface area for vital gas exchange.",
  notch: "Cardiac Notch: A distinct indentation in the left lung shaped to accommodate the heart, allowing it to fit snugly within the chest and ensuring both organs have enough space to function effectively."
};
const lungOutputDiv = document.querySelector('.innerText3');
let lungTypingTimeouts = [];
function clearLungTyping() {
  lungTypingTimeouts.forEach(t => clearTimeout(t));
  lungTypingTimeouts = [];
}

function animateLungText(content) {
  lungOutputDiv.innerHTML = ""; 
  let pos = 0;

  function addNextLungCharacter() {
    if (pos < content.length) {
      lungOutputDiv.innerHTML += content[pos];
      pos++;
      lungTypingTimeouts.push(setTimeout(addNextLungCharacter, 20));
    }
  }

  addNextLungCharacter();
}

// Event listener
document.querySelectorAll('[data-part]').forEach(button => {
  button.addEventListener('click', e => {
    const partKey = e.currentTarget.getAttribute('data-part');
    if (lungDataMap[partKey]) {
      clearLungTyping();
      animateLungText(lungDataMap[partKey]);
    }
  });
});

// Event listener for all buttons with data-part
document.querySelectorAll('[data-part]').forEach(button => {
  button.addEventListener('click', e => {
    const part = e.currentTarget.getAttribute('data-part');
    if (lungPartsInfo[part]) {
      cancelTyping();
      runTyping(lungPartsInfo[part]);
    }
  });
});
const lungPartPositions = {
  "trachea": "0deg 45deg 0.8m",
  "bronchi": "-7deg 110deg 1m",
  "right-lung": "-45deg 90deg 0.9m",
  "left-lung": "45deg 90deg 0.9m",
  "apex": "45deg 35deg 0.9m",
  "base": "-20deg 90deg 1m",
  "superior-lobe": "-35deg 70deg 0.9m",
  "middle-lobe": "-35deg 90deg 0.9m",
  "inferior-lobe": "-35deg 110deg 0.9m",
  "notch": "-45deg 110deg 0.4m"
};
const initialLungOrbit = lungModel.getAttribute('camera-orbit');

function highlightLungPart(button, part) {
  // Move camera
  if (lungPartPositions[part]) {
    lungModel.setAttribute('camera-orbit', lungPartPositions[part]);
  }

  // Reset any active labels
  document.querySelectorAll('#lungsModel .lungs-label')
    .forEach(label => label.classList.remove('active'));

  // Highlight only if it's an internal hotspot
  if (button && button.querySelector('.lungs-label')) {
    button.querySelector('.lungs-label').classList.add('active');
  }
}

// ==================== HANDLE EXTERNAL BUTTONS ===================
const externalLungButtons = document.querySelectorAll('#lung-buttons button');
externalLungButtons.forEach(button => {
  button.addEventListener('click', e => {
    const part = e.currentTarget.getAttribute('data-part');

    // Move camera
    highlightLungPart(null, part);

    // Hide all hotspots
    document.querySelectorAll('.lungs-hotspot')
      .forEach(hotspot => hotspot.classList.remove('visible'));

    // Show the specific hotspot
    const targetHotspot = document.querySelector(`.lungs-hotspot[data-part="${part}"]`);
    if (targetHotspot) {
      targetHotspot.classList.add('visible');
    }
  });
});

// ==================== RESET CAMERA BUTTON ===================
const resetLungButton = document.querySelector('#reset-lung-camera');
resetLungButton?.addEventListener('click', () => {
  lungModel.setAttribute('camera-orbit', initialLungOrbit);
});
//Liver_Model
const liverModel = document.querySelector('#liverModel');
const liverDataMap = {
  "right-lobe": "The right lobe is the largest lobe of the liver and performs most of its metabolic, detoxification, and synthetic functions. It's located on the right side of the body beneath the diaphragm.",
  "left-lobe": "The left lobe is smaller and extends across the midline toward the left side of the body. It works with the right lobe in processing nutrients and detoxifying blood.",

  "falciform-ligament": "A thin ligament on the front surface of the liver that separates the right and left lobes. It also connects the liver to the anterior abdominal wall.",


  "gall-bladder": "A small greenish sac located under the right lobe of the liver. It stores and concentrates bile, which aids in digestion of fats.",

  "hepatic-arteries": "An external vessel that brings oxygenated blood to the liver from the heart. It is one of the main blood supplies to the liver.",

  "inferior-vena-cava": "A large vein running behind the liver that carries deoxygenated blood from the lower half of the body back to the heart. The liver partially surrounds it."
};

const liverOutputDiv = document.querySelector('.innerText5');
let liverTypingTimeouts = [];
function clearLiverTyping() {
  liverTypingTimeouts.forEach(t => clearTimeout(t));
  liverTypingTimeouts = [];
}

function animateLiverText(content) {
  liverOutputDiv.innerHTML = ""; 
  let pos = 0;

  function addNextLiverCharacter() {
    if (pos < content.length) {
      liverOutputDiv.innerHTML += content[pos];
      pos++;
      liverTypingTimeouts.push(setTimeout(addNextLiverCharacter, 20));
    }
  }

  addNextLiverCharacter();
}

// Event listener
document.querySelectorAll('[data-part]').forEach(button => {
  button.addEventListener('click', e => {
    const partKey = e.currentTarget.getAttribute('data-part');
    if (liverDataMap[partKey]) {
      clearLiverTyping();
      animateLiverText(liverDataMap[partKey]);
    }
  });
});

// Event listener for all buttons with data-part
document.querySelectorAll('[data-part]').forEach(button => {
  button.addEventListener('click', e => {
    const part = e.currentTarget.getAttribute('data-part');
    if (liverPartsInfo[part]) {
      cancelTyping();
      runTyping(liverPartsInfo[part]);
    }
  });
});
const liverPartPositions = {
  "right-lobe": "100deg 45deg 0.2m",
  "left-lobe": "130deg 45deg 0.2m",
  "falciform-ligament": "140deg 45deg 0.1m",
  "gall-bladder": "270deg 90deg 0.2m",
  "hepatic-arteries": "280deg 120deg 0.2m",
  "inferior-vena-cava": "120deg 45deg 0.6m",
};
const initialLiverOrbit = liverModel.getAttribute('camera-orbit');

function highlightLiverPart(button, part) {
  // Move camera
  if (liverPartPositions[part]) {
    liverModel.setAttribute('camera-orbit', liverPartPositions[part]);
  }

  // Reset any active labels
  document.querySelectorAll('#liverModel .liver-label')
    .forEach(label => label.classList.remove('active'));
  // Highlight only if it's an internal hotspot
  if (button && button.querySelector('.liver-label')) {
    button.querySelector('.liver-label').classList.add('active');
  }
}

// ==================== HANDLE EXTERNAL BUTTONS ===================
const externalLiverButtons = document.querySelectorAll('#liver-buttons button');
externalLiverButtons.forEach(button => {
  button.addEventListener('click', e => {
    const part = e.currentTarget.getAttribute('data-part');

    // Move camera
    highlightLiverPart(null, part);

    // Hide all hotspots
    document.querySelectorAll('.liver-hotspot')
      .forEach(hotspot => hotspot.classList.remove('visible'));

    // Show the specific hotspot
    const targetHotspot = document.querySelector(`.liver-hotspot[data-part="${part}"]`);
    if (targetHotspot) {
      targetHotspot.classList.add('visible');
    }
  });
});

// ==================== RESET CAMERA BUTTON ===================
const resetLiverButton = document.querySelector('#reset-liver-camera');
resetLiverButton?.addEventListener('click', () => {
  liverModel.setAttribute('camera-orbit', initialLiverOrbit);
});
const headElements = document.querySelectorAll('.head');

headElements.forEach(el => {
  el.addEventListener('click', () => {
    window.location.reload();
  });
});
// Get all cards
const scrollCards = document.querySelectorAll('.card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // When card is in view, add 'show' class
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      // Optional: Unobserve after it's shown once
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1 // Trigger when 10% of card is visible
});

// Observe each card
scrollCards.forEach(card => observer.observe(card));
const layoutItems = document.querySelectorAll('.layout > *');

const layoutObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const index = Array.from(layoutItems).indexOf(entry.target);
      entry.target.style.transitionDelay = `${index * 0.03}s`;
      entry.target.classList.add('show');
      layoutObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1
});

// Observe every direct child
layoutItems.forEach(item => layoutObserver.observe(item));

//Kidney_Model//
const kidneyModel = document.querySelector('#kidney-model');
const kidneyPartPositions = {
  "cortex": "-75deg 75deg 2m",
  "medulla": "0deg 60deg 1.5m",
  "pelvis": "0deg 70deg 2m",
  "artery": "0deg 80deg 1m",
  "vein": "15deg 100deg 2m",
  "ureter": "25deg 60deg 2m"
};
const initialKidneyOrbit = kidneyModel.getAttribute('camera-orbit');

function highlightKidneyPart(button, part) {
  // Move camera
  if (kidneyPartPositions[part]) {
    kidneyModel.setAttribute('camera-orbit', kidneyPartPositions[part]);
  }

  // Reset any active labels
  document.querySelectorAll('#kidney-model .kidney-label')
    .forEach(label => label.classList.remove('active'));

  // Highlight only if it's an internal hotspot
  if (button && button.querySelector('.kidney-label')) {
    button.querySelector('.kidney-label').classList.add('active');
  }
}

// ==================== HANDLE EXTERNAL BUTTONS ===================
const externalKidneyButtons = document.querySelectorAll('.kidney-buttons button');
externalKidneyButtons.forEach(button => {
  button.addEventListener('click', e => {
    const part = e.currentTarget.getAttribute('data-part');

    // Move camera
    highlightKidneyPart(null, part);

    // Hide all hotspots
    document.querySelectorAll('.kidney-hotspot')
      .forEach(hotspot => hotspot.classList.remove('visible'));

    // Show the specific hotspot
    const targetHotspot = document.querySelector(`.kidney-hotspot[data-part="${part}"]`);
    if (targetHotspot) {
      targetHotspot.classList.add('visible');
    }
  });
});

// ==================== RESET CAMERA BUTTON ===================
const resetKidneyButton = document.querySelector('#reset-kidney-camera');
resetKidneyButton?.addEventListener('click', () => {
  kidneyModel.setAttribute('camera-orbit', initialKidneyOrbit);

  // Hide all hotspots
  document.querySelectorAll('.kidney-hotspot')
    .forEach(hotspot => hotspot.classList.remove('visible'));
});
const kidneyInfoMap = {
  cortex: "Cortex: The outer layer of the kidney containing the glomeruli and convoluted tubules. It's the primary site for blood filtration and the initial steps of urine formation.",
  medulla: "Medulla: The innermost part of the kidney, organized into renal pyramids. It contains loops of Henle and collecting ducts that concentrate urine by reabsorbing water and salts.",
  pelvis: "Renal Pelvis: A funnel-shaped cavity that collects urine from the major and minor calyces. It channels the urine into the ureter for transport to the bladder.",
  artery: "Renal Artery: A branch of the abdominal aorta that supplies oxygen-rich blood to the kidney. It further divides into segmental, interlobar, arcuate, and cortical radiate arteries.",
  vein: "Renal Vein: The vessel that drains deoxygenated and filtered blood from the kidney into the inferior vena cava, maintaining systemic circulation balance.",
  ureter: "Ureter: A narrow, muscular tube that connects the renal pelvis to the urinary bladder. It transports urine via peristaltic contractions and prevents backflow through a valve at the bladder end."
};

// ====== Typing Animation for Kidney Info ======
const kidneyTextTarget = document.querySelector('.innerText4');
let kidneyTypingInterval;

function kidneyTypeText(text) {
  clearInterval(kidneyTypingInterval);
  kidneyTextTarget.textContent = '';
  let index = 0;

  kidneyTypingInterval = setInterval(() => {
    if (index < text.length) {
      kidneyTextTarget.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(kidneyTypingInterval);
    }
  }, 30); // Typing speed (ms per character)
}

// ====== External Button Events for Kidney ======
document.querySelectorAll('.kidney-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const part = btn.getAttribute('data-part');
    const info = kidneyInfoMap[part];
    if (info) kidneyTypeText(info);
  });
});
//Stomach_Model//
const stomachModel = document.querySelector('#stomach-model');
const stomachPartPositions = {
  "esophagus": "90deg 75deg 0.6m",
  "outer-muscle-layer": "120deg 90deg 0.04m",
  "middle-muscle-layer": "120deg 110deg 0.04m",
  "inner-muscle-layer": "120deg 120deg 0.04m",
  "mucosa": "90deg 100deg 0.04m",
  "duodenum": "70deg 100deg 0.04m",
};
const initialstomachOrbit = stomachModel.getAttribute('camera-orbit');

function highlightstomachPart(button, part) {
  // Move camera
  if (stomachPartPositions[part]) {
    stomachModel.setAttribute('camera-orbit', stomachPartPositions[part]);
  }

  // Reset any active labels
  document.querySelectorAll('#stomach-model .stomach-label')
    .forEach(label => label.classList.remove('active'));

  // Highlight only if it's an internal hotspot
  if (button && button.querySelector('.stomach-label')) {
    button.querySelector('.stomach-label').classList.add('active');
  }
}

// ==================== HANDLE EXTERNAL BUTTONS ===================
const externalstomachButtons = document.querySelectorAll('.stomach-buttons button');
externalstomachButtons.forEach(button => {
  button.addEventListener('click', e => {
    const part = e.currentTarget.getAttribute('data-part');

    // Move camera
    highlightstomachPart(null, part);

    // Hide all hotspots
    document.querySelectorAll('.stomach-hotspot')
      .forEach(hotspot => hotspot.classList.remove('visible'));

    // Show the specific hotspot
    const targetHotspot = document.querySelector(`.stomach-hotspot[data-part="${part}"]`);
    if (targetHotspot) {
      targetHotspot.classList.add('visible');
    }
  });
});

// ==================== RESET CAMERA BUTTON ===================
const resetstomachButton = document.querySelector('#reset-stomach-camera');
resetstomachButton?.addEventListener('click', () => {
  stomachModel.setAttribute('camera-orbit', initialstomachOrbit);

  // Hide all hotspots
  document.querySelectorAll('.stomach-hotspot')
    .forEach(hotspot => hotspot.classList.remove('visible'));
});
const stomachInfoMap = {
  "esophagus": "The esophagus is a muscular tube that connects the throat to the stomach. It uses rhythmic contractions called peristalsis to push food down into the stomach for digestion.",
  
  "outer-muscle-layer": "The outermost longitudinal muscle layer of the stomach wall. It contracts to help push and mix the stomach's contents, working with the inner layers to enable powerful churning motions.",
  
  "middle-muscle-layer": "Also known as the circular muscle layer, it wraps around the stomach and plays a key role in grinding food and controlling the flow of chyme into the intestines.",
  
  "inner-muscle-layer": "The innermost oblique muscle layer unique to the stomach. It provides extra strength for mechanical digestion by enhancing mixing and crushing of food.",
  
  "mucosa": "This is the innermost lining of the stomach. It contains glands that secrete digestive enzymes, hydrochloric acid, and mucus to break down food and protect the stomach walls.",
  
  "duodenum": "The first section of the small intestine, directly connected to the stomach. It receives partially digested food (chyme), bile from the liver, and enzymes from the pancreas for further digestion."
};


// ====== Typing Animation for Kidney Info ======
const stomachTextTarget = document.querySelector('.innerText6');
let stomachTypingInterval;

function stomachTypeText(text) {
  clearInterval(stomachTypingInterval);
  stomachTextTarget.textContent = '';
  let index = 0;

  stomachTypingInterval = setInterval(() => {
    if (index < text.length) {
      stomachTextTarget.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(stomachTypingInterval);
    }
  }, 30); // Typing speed (ms per character)
}

// ====== External Button Events for Kidney ======
document.querySelectorAll('.stomach-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const part = btn.getAttribute('data-part');
    const info = stomachInfoMap[part];
    if (info) stomachTypeText(info);
  });
});
const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: null, y: null };
const totalBones = 150;
const boneImg = new Image();
boneImg.src = 'assets/backdemo2.png';

const bones = [];

for (let i = 0; i < totalBones; i++) {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
  bones.push({
    x: x,
    y: y,
    originalX: x,
    originalY: y,
    size: Math.random() * 30 + 15,
    angle: Math.random() * 360
  });
}

document.addEventListener('mousemove', function(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function drawBone(bone) {
  ctx.save();
  ctx.translate(bone.x, bone.y);
  ctx.rotate((bone.angle * Math.PI) / 180);
  ctx.drawImage(boneImg, -bone.size / 2, -bone.size / 2, bone.size, bone.size);
  ctx.restore();
}

function animateBones() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let bone of bones) {
    const dx = mouse.x - bone.x;
    const dy = mouse.y - bone.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 100) {
      const angle = Math.atan2(dy, dx);
      const force = (100 - dist) / 100;
      const pushX = Math.cos(angle) * force * 4;
      const pushY = Math.sin(angle) * force * 4;
      bone.x -= pushX;
      bone.y -= pushY;
    } else {
      bone.x += (bone.originalX - bone.x) * 0.05;
      bone.y += (bone.originalY - bone.y) * 0.05;
    }

    drawBone(bone);
  }

  requestAnimationFrame(animateBones);
}
boneImg.onload = () => {
  animateBones();
};
  const follower = document.getElementById("footerFollower");
    const footer = document.getElementById("footer-area");

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let isActive = false;

    // Change this value to control chase speed (0.05 = slow, 0.3 = fast)
    const chaseSpeed = 0.05;

    footer.addEventListener("mouseenter", () => {
      isActive = true;
      follower.style.opacity = "1";
    });

    footer.addEventListener("mouseleave", () => {
      isActive = false;
      follower.style.opacity = "0";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isActive) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateFollower() {
      if (isActive) {
        followerX += (mouseX - followerX) * chaseSpeed;
        followerY += (mouseY - followerY) * chaseSpeed;
        follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
      }
      requestAnimationFrame(animateFollower);
    }

    animateFollower();
   const footer2 = document.getElementById('footer-area');

  function toggleFooterOnScroll() {
    const rect = footer2.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Show if footer enters view
    if (rect.top < windowHeight - 100 && rect.bottom > 0) {
      footer2.classList.add('visible');
    } else {
      footer2.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleFooterOnScroll);
  window.addEventListener('load', toggleFooterOnScroll);
  //   document.getElementById("myForm").addEventListener("submit", function(e) {
  //   e.preventDefault(); // 🔒 Prevent page refresh
  //   // ✅ Handle the form data here
  //   console.log("Form submitted without page reload!");
  // });
   const form = document.getElementById("myForm");

  form.addEventListener("submit", function () {
    // Show animated toast
    const toast = document.getElementById("toast");
    toast.classList.add("show");

    // Auto hide toast
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  });
  (function () {
    const locomotiveScroll = new LocomotiveScroll();
})();
  