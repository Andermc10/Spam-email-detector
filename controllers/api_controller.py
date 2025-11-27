"""
Controlador de API
Maneja las rutas de la API para la clasificación de spam.
"""

from flask import Blueprint, request, jsonify
from models.spam_classifier import SpamClassifier
from utils.feature_extraction import SpambaseFeatureExtractor
import numpy as np

# Crear blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Inicializar el clasificador (patrón singleton)
classifier = None
feature_extractor = None

def get_classifier():
    """Obtener o crear la instancia del clasificador de spam."""
    global classifier
    if classifier is None:
        classifier = SpamClassifier()
    return classifier

def get_extractor():
    """Obtener o crear la instancia del extractor de características."""
    global feature_extractor
    if feature_extractor is None:
        feature_extractor = SpambaseFeatureExtractor()
    return feature_extractor


@api_bp.route('/predict', methods=['POST'])
def predict():
    """
    Predice si un correo es spam o no.
    
    JSON Esperado (Opción 1 - Texto):
    {
        "email_text": "Texto completo del correo..."
    }
    
    JSON Esperado (Opción 2 - Features manuales):
    {
        "features": [array de 57 características]
    }
    """
    try:
        # Verificar si la petición tiene datos JSON
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'La petición debe ser JSON'
            }), 400
        
        data = request.get_json()
        features = None
        
        # Caso 1: Texto del email
        if 'email_text' in data:
            extractor = get_extractor()
            features = extractor.extract(data['email_text'])
            
        # Caso 2: Features manuales
        elif 'features' in data:
            features = data['features']
        else:
            return jsonify({
                'success': False,
                'error': 'Se requiere "email_text" o "features"'
            }), 400
        
        # Validar que features sea una lista/array
        if not isinstance(features, (list, np.ndarray)):
            return jsonify({
                'success': False,
                'error': 'Features debe ser un array'
            }), 400
        
        # Validar longitud de features (debe ser 57 para el dataset de spam)
        if len(features) != 57:
            return jsonify({
                'success': False,
                'error': f'Se esperaban 57 características, se recibieron {len(features)}'
            }), 400
        
        # Obtener clasificador y hacer predicción
        clf = get_classifier()
        result = clf.classify_text(features)
        
        # Retornar respuesta exitosa
        return jsonify({
            'success': True,
            'prediction': result['prediction'],
            'label': result['label'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities'],
            'extracted_features': features if 'email_text' in data else None
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }), 500


@api_bp.route('/health', methods=['GET'])
def health():
    """
    Endpoint de verificación de estado (Health check).
    
    Retorna:
    {
        "status": "healthy",
        "model_loaded": true
    }
    """
    try:
        clf = get_classifier()
        model_loaded = clf.model is not None and clf.scaler is not None
        
        return jsonify({
            'status': 'healthy',
            'model_loaded': model_loaded
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
