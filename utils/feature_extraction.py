"""
Extractor de Características para Spambase
Convierte texto crudo de emails en el vector de 57 características numéricas
requerido por el modelo.
"""
import re
import numpy as np

class SpambaseFeatureExtractor:
    def __init__(self):
        # Las 48 palabras clave del dataset Spambase
        self.keywords = [
            "make", "address", "all", "3d", "our", "over", "remove", "internet",
            "order", "mail", "receive", "will", "people", "report", "addresses",
            "free", "business", "email", "you", "credit", "your", "font", "000",
            "money", "hp", "hpl", "george", "650", "lab", "labs", "telnet", "857",
            "data", "415", "85", "technology", "1999", "parts", "pm", "direct",
            "cs", "meeting", "original", "project", "re", "edu", "table", "conference"
        ]
        
        # Los 6 caracteres especiales
        self.chars = [";", "(", "[", "!", "$", "#"]
        
    def extract(self, text):
        """
        Extrae las 57 características de un texto.
        
        Args:
            text (str): El contenido del email (asunto + cuerpo)
            
        Returns:
            list: Lista de 57 floats
        """
        if not text:
            return [0.0] * 57
            
        # Calcular estadísticas básicas
        total_chars = len(text)
        
        # Tokenización simple para palabras (dividir por no-alfanuméricos)
        # Convertimos a minúsculas para contar
        words = re.split(r'[^a-zA-Z0-9]', text.lower())
        # Filtrar strings vacíos
        words = [w for w in words if w]
        total_words = len(words)
        
        features = []
        
        # 1. Frecuencias de palabras (0-47)
        # Fórmula: 100 * (count / total_words)
        if total_words > 0:
            for keyword in self.keywords:
                count = words.count(keyword)
                freq = 100.0 * count / total_words
                features.append(freq)
        else:
            features.extend([0.0] * 48)
            
        # 2. Frecuencias de caracteres (48-53)
        # Fórmula: 100 * (count / total_chars)
        if total_chars > 0:
            for char in self.chars:
                count = text.count(char)
                freq = 100.0 * count / total_chars
                features.append(freq)
        else:
            features.extend([0.0] * 6)
            
        # 3. Estadísticas de mayúsculas (54-56)
        # Encontrar todas las secuencias de mayúsculas
        capital_sequences = re.findall(r'[A-Z]+', text)
        
        if capital_sequences:
            lengths = [len(seq) for seq in capital_sequences]
            
            # 54: Promedio de longitud de secuencias de mayúsculas
            avg_length = sum(lengths) / len(lengths)
            
            # 55: Longitud de la secuencia más larga
            max_length = max(lengths)
            
            # 56: Total de mayúsculas
            total_caps = sum(lengths)
            
            features.extend([avg_length, float(max_length), float(total_caps)])
        else:
            # Si no hay mayúsculas
            features.extend([0.0, 0.0, 0.0])
            
        return features
