/**
 * Clasificador de Spam de Email - JavaScript Frontend
 * Maneja el envío del formulario, llamadas a la API y renderizado de resultados
 */

// Múltiples ejemplos de SPAM para pruebas
// NOTA: Este modelo es muy conservador, solo detecta SPAM muy obvio
const SPAM_EXAMPLES = [
    // Ejemplo 1: SPAM clásico (el único que funciona consistentemente)
    [0.21,0.28,0.50,0.00,0.14,0.28,0.21,0.07,0.00,0.94,0.00,1.00,0.00,0.00,0.32,0.00,1.29,1.93,0.00,0.96,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.778,0.000,0.000,3.756],
    
    // Ejemplo 2: Variación con más "receive" y "will"
    [0.25,0.30,0.55,0.00,0.15,0.30,0.25,0.10,0.00,1.00,0.00,1.10,0.00,0.00,0.35,0.00,1.35,2.00,0.00,1.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.850,0.000,0.000,4.200],
    
    // Ejemplo 3: Más "!" y MAYÚSCULAS
    [0.20,0.25,0.48,0.00,0.12,0.25,0.20,0.05,0.00,0.90,0.00,0.95,0.00,0.00,0.30,0.00,1.25,1.85,0.00,0.92,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.900,0.000,0.000,5.500],
    
    // Ejemplo 4: Con más palabras spam
    [0.22,0.30,0.52,0.00,0.16,0.30,0.22,0.08,0.00,0.96,0.00,1.05,0.00,0.00,0.34,0.00,1.32,1.95,0.00,0.98,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.800,0.000,0.000,4.500],
    
    // Ejemplo 5: Variación balanceada
    [0.23,0.27,0.51,0.00,0.13,0.27,0.23,0.06,0.00,0.92,0.00,0.98,0.00,0.00,0.31,0.00,1.27,1.90,0.00,0.94,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.750,0.000,0.000,4.000]
];

// Múltiples ejemplos de NO SPAM (HAM) para pruebas (verificados del dataset real)
const HAM_EXAMPLES = [
    // Ejemplo 1: Email profesional de reunión
    [0.00,0.64,0.64,0.00,0.32,0.00,0.00,0.00,0.00,0.00,0.00,0.64,0.00,0.00,0.00,0.00,0.00,1.29,1.93,0.00,0.96,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.000,0.000,0.000,1.500],
    
    // Ejemplo 2: Email de proyecto universitario
    [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.39,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.39,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.78,0.00,0.39,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.000,0.000,0.000,1.140],
    
    // Ejemplo 3: Email de conferencia académica
    [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,1.16,0.00,0.00,0.00,0.00,0.00,0.000,0.000,0.000,1.250],
    
    // Ejemplo 4: Email de respuesta (Re:)
    [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,1.16,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.000,0.000,0.000,1.010],
    
    // Ejemplo 5: Email técnico sobre datos
    [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,1.16,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.58,0.00,0.00,0.00,0.00,0.00,0.00,0.000,0.000,0.000,1.420]
];

// Elementos del DOM
const form = document.getElementById('predictionForm');
const featuresInput = document.getElementById('featuresInput');
const emailInput = document.getElementById('emailInput');
const featureCount = document.getElementById('featureCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsContent = document.getElementById('resultsContent');
const predictionResults = document.getElementById('predictionResults');
const resultBadge = document.getElementById('resultBadge');
const resultIcon = document.getElementById('resultIcon');
const resultLabel = document.getElementById('resultLabel');
const confidenceValue = document.getElementById('confidenceValue');
const confidenceBar = document.getElementById('confidenceBar');
const spamProb = document.getElementById('spamProb');
const hamProb = document.getElementById('hamProb');
const spamBar = document.getElementById('spamBar');
const hamBar = document.getElementById('hamBar');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const textMode = document.getElementById('textMode');
const featuresMode = document.getElementById('featuresMode');
let currentMode = 'text'; // 'text' o 'features'

// Botones de ejemplo
const exampleButtons = document.querySelectorAll('.example-btn');

/**
 * Cambiar pestaña activa
 */
function switchTab(mode) {
    currentMode = mode;
    
    // Actualizar botones
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Actualizar vista
    if (mode === 'text') {
        textMode.classList.remove('hidden');
        featuresMode.classList.add('hidden');
        emailInput.focus();
    } else {
        textMode.classList.add('hidden');
        featuresMode.classList.remove('hidden');
        featuresInput.focus();
    }
}

/**
 * Actualizar visualización del conteo de características
 */
function updateFeatureCount() {
    const text = featuresInput.value.trim();
    if (!text) {
        featureCount.textContent = '0 features detectadas';
        return;
    }
    
    const features = text.split(',').map(f => f.trim()).filter(f => f !== '');
    const count = features.length;
    
    if (count === 57) {
        featureCount.textContent = `✓ ${count} features - Correcto`;
        featureCount.style.color = '#10b981';
    } else {
        featureCount.textContent = `${count} features - Se necesitan 57`;
        featureCount.style.color = '#f59e0b';
    }
}

/**
 * Cargar datos de ejemplo aleatorio
 */
function loadExample(type) {
    // Seleccionar array de ejemplos según el tipo
    const examples = type === 'spam' ? SPAM_EXAMPLES : HAM_EXAMPLES;
    
    // Seleccionar un ejemplo aleatorio
    const randomIndex = Math.floor(Math.random() * examples.length);
    const exampleData = examples[randomIndex];
    
    // Cargar en el textarea
    featuresInput.value = exampleData.join(',');
    updateFeatureCount();
    
    // Mostrar notificación de qué ejemplo se cargó
    console.log(`✓ Cargado ejemplo ${type.toUpperCase()} #${randomIndex + 1} de ${examples.length}`);
    
    // Desplazamiento suave al área de texto
    featuresInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    featuresInput.focus();
}

/**
 * Analizar características de la entrada manual
 */
function parseFeatures() {
    const text = featuresInput.value.trim();
    if (!text) {
        throw new Error('Por favor ingresa las características del email');
    }
    
    const features = text.split(',').map(f => {
        const value = parseFloat(f.trim());
        if (isNaN(value)) {
            throw new Error('Todos los valores deben ser números');
        }
        return value;
    });
    
    if (features.length !== 57) {
        throw new Error(`Se necesitan exactamente 57 características, se encontraron ${features.length}`);
    }
    
    return features;
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
    resultsContent.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3>Error</h3>
            <p style="color: #ef4444;">${message}</p>
        </div>
    `;
    predictionResults.classList.add('hidden');
}

/**
 * Mostrar resultados de predicción
 */
function displayResults(data) {
    const { prediction, label, confidence, probabilities } = data;
    
    // Ocultar estado vacío
    resultsContent.querySelector('.empty-state')?.remove();
    
    // Mostrar resultados
    predictionResults.classList.remove('hidden');
    
    // Actualizar insignia
    resultBadge.className = `result-badge ${prediction === 1 ? 'spam' : 'not-spam'}`;
    resultIcon.textContent = prediction === 1 ? '⚠️' : '✅';
    resultLabel.textContent = label;
    
    // Actualizar confianza
    const confidencePercent = Math.round(confidence * 100);
    confidenceValue.textContent = `${confidencePercent}%`;
    
    // Animar barra de confianza
    setTimeout(() => {
        confidenceBar.style.width = `${confidencePercent}%`;
    }, 100);
    
    // Actualizar probabilidades
    const spamPercent = Math.round(probabilities.spam_probability * 100);
    const hamPercent = Math.round(probabilities.not_spam_probability * 100);
    
    spamProb.textContent = `${spamPercent}%`;
    hamProb.textContent = `${hamPercent}%`;
    
    // Animar barras de probabilidad
    setTimeout(() => {
        spamBar.style.width = `${spamPercent}%`;
        hamBar.style.width = `${hamPercent}%`;
    }, 200);
    
    // Desplazar a resultados
    setTimeout(() => {
        predictionResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

/**
 * Realizar llamada a la API de predicción
 */
async function makePrediction(payload) {
    const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud');
    }
    
    if (!data.success) {
        throw new Error(data.error || 'Error en la predicción');
    }
    
    return data;
}

/**
 * Manejar envío del formulario
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    // Agregar estado de carga
    analyzeBtn.classList.add('loading');
    analyzeBtn.disabled = true;
    
    try {
        let payload = {};
        
        if (currentMode === 'text') {
            const text = emailInput.value.trim();
            if (!text) throw new Error('Por favor ingresa el texto del email');
            payload = { email_text: text };
        } else {
            const features = parseFeatures();
            payload = { features: features };
        }
        
        // Hacer predicción
        const result = await makePrediction(payload);
        
        // Mostrar resultados
        displayResults(result);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        // Remover estado de carga
        analyzeBtn.classList.remove('loading');
        analyzeBtn.disabled = false;
    }
}

// Listeners de eventos
form.addEventListener('submit', handleSubmit);
featuresInput.addEventListener('input', updateFeatureCount);

// Botón Limpiar
document.getElementById('clearBtn').addEventListener('click', () => {
    // Limpiar inputs
    emailInput.value = '';
    featuresInput.value = '';
    updateFeatureCount();
    
    // Ocultar resultados
    predictionResults.classList.add('hidden');
    
    // Mostrar estado vacío si no existe
    if (!resultsContent.querySelector('.empty-state')) {
        resultsContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>Sin resultados aún</h3>
                <p>Ingresa las características y presiona "Analizar Email" para obtener la predicción</p>
            </div>
        `;
    }
    
    // Enfocar el input activo
    if (currentMode === 'text') {
        emailInput.focus();
    } else {
        featuresInput.focus();
    }
});

// Listeners para tabs
tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault(); // Evitar submit si está dentro del form
        switchTab(btn.dataset.tab);
    });
});

exampleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        loadExample(type);
    });
});

// Inicializar
updateFeatureCount();
switchTab('text'); // Iniciar en modo texto

// Log de estado listo
console.log('✓ Clasificador de Spam de Email cargado exitosamente');
