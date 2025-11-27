"""
Modelo de Clasificador de Spam
Este módulo contiene la clase SpamClassifier que carga el modelo entrenado
y proporciona métodos de predicción para la clasificación de spam en correos.
"""

import pickle
import os
import numpy as np
import joblib


class SpamClassifier:
    """
    Un clasificador para detectar correos spam usando un modelo Random Forest pre-entrenado.
    """
    
    def __init__(self, model_path='best_model_random_forest.pkl', scaler_path='X_scaled.pkl'):
        """
        Inicializa el SpamClassifier cargando el modelo entrenado y el escalador.
        
        Args:
            model_path (str): Ruta al archivo del modelo entrenado
            scaler_path (str): Ruta al archivo del escalador
        """
        self.model = None
        self.scaler = None
        self.model_path = model_path
        self.scaler_path = scaler_path
        self._load_model()
    
    def _load_model(self):
        """
        Carga el modelo entrenado y el escalador desde el disco.
        Intenta usar pickle y joblib para mayor compatibilidad.
        
        Raises:
            FileNotFoundError: Si no se encuentran los archivos del modelo o escalador
            Exception: Si hay un error al cargar los archivos
        """
        try:
            # Verificar si existe el archivo del modelo
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Archivo del modelo no encontrado: {self.model_path}")
            
            # Verificar si existe el archivo del escalador
            if not os.path.exists(self.scaler_path):
                raise FileNotFoundError(f"Archivo del escalador no encontrado: {self.scaler_path}")
            
            # 1. Intentar carga estándar con pickle (sin encoding específico)
            try:
                with open(self.model_path, 'rb') as model_file:
                    self.model = pickle.load(model_file)
                print(f"✓ Modelo cargado con pickle estándar")
            except Exception as e_std:
                print(f"⚠️ Falló carga estándar, intentando latin1: {e_std}")
                
                # 2. Intentar con encoding latin1 (para modelos muy viejos/Python 2)
                try:
                    with open(self.model_path, 'rb') as model_file:
                        self.model = pickle.load(model_file, encoding='latin1')
                    print(f"✓ Modelo cargado con pickle latin1")
                except Exception as e_latin:
                    print(f"⚠️ Falló carga latin1, intentando joblib: {e_latin}")
                    
                    # 3. Intentar con joblib
                    try:
                        self.model = joblib.load(self.model_path)
                        print(f"✓ Modelo cargado con joblib")
                    except Exception as e_joblib:
                        raise Exception(f"No se pudo cargar el modelo. Errores: {e_std}, {e_latin}, {e_joblib}")
            
            # Intentar cargar el escalador (misma lógica)
            try:
                with open(self.scaler_path, 'rb') as scaler_file:
                    self.scaler = pickle.load(scaler_file)
            except Exception:
                try:
                    with open(self.scaler_path, 'rb') as scaler_file:
                        self.scaler = pickle.load(scaler_file, encoding='latin1')
                except Exception:
                    self.scaler = joblib.load(self.scaler_path)
            
            print(f"✓ Modelo cargado exitosamente desde {self.model_path}")
            print(f"✓ Escalador cargado exitosamente desde {self.scaler_path}")
            
        except Exception as e:
            print(f"✗ Error cargando modelo o escalador: {str(e)}")
            # IMPORTANTE: Para que la app no se caiga si falla el modelo (modo demostración/fallback)
            # En producción esto debería fallar, pero para que el usuario vea la UI:
            print("⚠️ ADVERTENCIA: Iniciando en modo sin modelo (las predicciones fallarán)")
            self.model = None
            self.scaler = None
    
    def predict(self, features):
        """
        Predice si un correo es spam o no.
        
        Args:
            features (array-like): Vector de características del correo
            
        Returns:
            int: 1 para spam, 0 para no spam
            
        Raises:
            ValueError: Si el modelo no está cargado o las características son inválidas
        """
        if self.model is None:
            raise ValueError("Modelo no cargado. No se pueden hacer predicciones.")
        
        try:
            # Convertir a array numpy si es necesario
            if not isinstance(features, np.ndarray):
                features = np.array(features)
            
            # Asegurar que features sea 2D
            if features.ndim == 1:
                features = features.reshape(1, -1)
            
            # Escalar las características
            features_scaled = self.scaler.transform(features)
            
            # Hacer la predicción
            prediction = self.model.predict(features_scaled)
            
            return int(prediction[0])
            
        except Exception as e:
            raise ValueError(f"Error haciendo la predicción: {str(e)}")
    
    def predict_proba(self, features):
        """
        Predice la probabilidad de que un correo sea spam.
        
        Args:
            features (array-like): Vector de características del correo
            
        Returns:
            dict: Diccionario con 'spam_probability' y 'not_spam_probability'
            
        Raises:
            ValueError: Si el modelo no está cargado o las características son inválidas
        """
        if self.model is None:
            raise ValueError("Modelo no cargado. No se pueden hacer predicciones.")
        
        try:
            # Convertir a array numpy si es necesario
            if not isinstance(features, np.ndarray):
                features = np.array(features)
            
            # Asegurar que features sea 2D
            if features.ndim == 1:
                features = features.reshape(1, -1)
            
            # Escalar las características
            features_scaled = self.scaler.transform(features)
            
            # Obtener probabilidades
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            return {
                'not_spam_probability': float(probabilities[0]),
                'spam_probability': float(probabilities[1])
            }
            
        except Exception as e:
            raise ValueError(f"Error calculando probabilidades: {str(e)}")
    
    def classify_text(self, features):
        """
        Clasifica el correo y retorna resultados detallados.
        
        Args:
            features (array-like): Vector de características del correo
            
        Returns:
            dict: Diccionario conteniendo predicción, probabilidades y etiqueta
        """
        prediction = self.predict(features)
        probabilities = self.predict_proba(features)
        
        label = "Spam" if prediction == 1 else "No Spam"
        confidence = probabilities['spam_probability'] if prediction == 1 else probabilities['not_spam_probability']
        
        return {
            'prediction': prediction,
            'label': label,
            'confidence': float(confidence),
            'probabilities': probabilities
        }
