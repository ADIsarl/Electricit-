// --- VARIABLES GLOBALES ---
let isTriphasé = false;

// --- DOM ELEMENTS ---
const uInput = document.getElementById('u-val');
const iInput = document.getElementById('i-val');
const rInput = document.getElementById('r-val');
const pInput = document.getElementById('p-val');
const phaseToggle = document.getElementById('phase-toggle');

const inputs = [uInput, iInput, rInput, pInput];

// --- INIT ---
// Gère le basculement Mono/Tri
phaseToggle.addEventListener('change', () => {
    isTriphasé = phaseToggle.checked;
    if (!uInput.value || uInput.value == 230 || uInput.value == 400) {
        uInput.value = isTriphasé ? 400 : 230;
    }
    // On relance le calcul basé sur U et I si présents
    if (uInput.value && iInput.value) calculate('u-val');
});

// Valeur par défaut
uInput.value = 230; 

// --- LOGIQUE INTELLIGENTE ---
// On écoute chaque champ pour savoir Lequel est modifié
inputs.forEach(input => {
    input.addEventListener('input', (e) => calculate(e.target.id));
});

function calculate(sourceId) {
    let u = parseFloat(uInput.value);
    let i = parseFloat(iInput.value);
    let r = parseFloat(rInput.value);
    let p = parseFloat(pInput.value);
    const rac3 = 1.732; // Racine de 3

    // LOGIQUE DE PRIORITÉ : On calcule selon ce que l'utilisateur modifie

    // CAS 1 : Tu modifies la TENSION (U) ou l'INTENSITÉ (I)
    // -> On recalcule P et R
    if ((sourceId === 'u-val' || sourceId === 'i-val') && u && i) {
        if (isTriphasé) pInput.value = (u * i * rac3).toFixed(2);
        else pInput.value = (u * i).toFixed(2);
        
        rInput.value = (u / i).toFixed(2);
    }

    // CAS 2 : Tu modifies la PUISSANCE (P)
    // -> On recalcule I et R (en gardant U fixe)
    else if (sourceId === 'p-val' && u && p) {
        let iCalc;
        if (isTriphasé) iCalc = p / (u * rac3);
        else iCalc = p / u;
        
        iInput.value = iCalc.toFixed(2);
        rInput.value = (u / iCalc).toFixed(2);
    }

    // CAS 3 : Tu modifies la RÉSISTANCE (R)
    // -> On recalcule U et P (loi d'ohm simple U=RI)
    else if (sourceId === 'r-val' && r && i) {
        let uCalc = r * i;
        uInput.value = uCalc.toFixed(2);

        if (isTriphasé) pInput.value = (uCalc * i * rac3).toFixed(2);
        else pInput.value = (uCalc * i).toFixed(2);
    }
}

function resetCalculator() {
    inputs.forEach(inp => inp.value = '');
    uInput.value = isTriphasé ? 400 : 230;
}

// --- NAVIGATION (Rien ne change ici) ---
function showSection(id) {
    document.getElementById('calculator').classList.remove('active-section');
    document.getElementById('calculator').classList.add('hidden-section');
    document.getElementById('guide').classList.remove('active-section');
    document.getElementById('guide').classList.add('hidden-section');
    
    document.getElementById('btn-calc').classList.remove('active-btn');
    document.getElementById('btn-guide').classList.remove('active-btn');

    const target = document.getElementById(id);
    target.classList.remove('hidden-section');
    target.classList.add('active-section');

    if(id === 'calculator') document.getElementById('btn-calc').classList.add('active-btn');
    else document.getElementById('btn-guide').classList.add('active-btn');
}

// --- LOGIQUE MULTIMÈTRE ---
// Mise à jour des coordonnées pour être pile sur tes photos
const positions = {
    red: {
        tension: { top: 85, left: 70 },     
        resistance: { top: 85, left: 30 }, 
        intensite: { top: 25, left: 25 }   
    },
    yellow: {
        tension: { top: 85, left: 50 },     
        resistance: { top: 50, left: 15 },  
        intensite: { top: 15, left: 50 }   
    }
};

const images = {
    red: 'assets/red_multimeter.png',
    yellow: 'assets/yellow_multimeter.png'
};

function selectMeasurement(type) {
    currentMeasure = type;
    document.getElementById('guide-display').classList.remove('hidden-section');
    document.getElementById('guide-display').classList.add('active-section');
    updateGuideContent();
    updateMultimeterView();
}

function updateGuideContent() {
    const title = document.getElementById('measure-title');
    const warning = document.getElementById('safety-warning');
    const desc = document.getElementById('measure-desc');

    if (currentMeasure === 'tension') {
        title.innerText = "Mesure de Tension (Volt)";
        warning.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> ATTENTION : Mesure SOUS TENSION !";
        warning.className = "warning-box bg-danger";
        desc.innerText = "Branchez le voltmètre en parallèle (dérivation). En Triphasé : Mesure entre phases (400V). En Mono : Entre Phase et Neutre (230V).";
    } else if (currentMeasure === 'intensite') {
        title.innerText = "Mesure d'Intensité (Ampère)";
        warning.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> ATTENTION : Mesure SOUS TENSION avec Pince !";
        warning.className = "warning-box bg-danger";
        desc.innerText = "Utilisez impérativement une pince ampèremétrique. N'enserrez qu'UN SEUL fil (Phase) à la fois dans la pince.";
    } else if (currentMeasure === 'resistance') {
        title.innerText = "Mesure de Résistance (Ohm)";
        warning.innerHTML = "<i class='fa-solid fa-check'></i> IMPORTANT : Mesure HORS TENSION !";
        warning.className = "warning-box bg-safe";
        desc.innerText = "Coupez le courant avant de mesurer. Débranchez le composant si possible. Branchez en parallèle sur le composant isolé.";
    }
}

function updateMultimeterView() {
    if (!currentMeasure) return;
    const select = document.getElementById('multimeter-select');
    const model = select.value;
    const imgElement = document.getElementById('multimeter-img');
    const ring = document.getElementById('selector-ring');
    
    imgElement.src = images[model];
    const coords = positions[model][currentMeasure];
    
    if (coords) {
        ring.style.display = 'block';
        ring.style.top = coords.top + '%';
        ring.style.left = coords.left + '%';
    } else {
        ring.style.display = 'none';
    }
}
