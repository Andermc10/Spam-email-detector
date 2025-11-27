"""
Clasificador de Spam de Email - Aplicación Flask
Punto de entrada principal de la aplicación usando arquitectura MVC.
"""

from flask import Flask
from flask_cors import CORS
from controllers import api_bp, view_bp
import os


def create_app():
    """
    Patrón de fábrica de aplicaciones.
    Crea y configura la aplicación Flask.
    
    Retorna:
        Flask: Instancia configurada de la aplicación Flask
    """
    # Inicializar app Flask
    app = Flask(__name__)
    
    # Configurar app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JSON_SORT_KEYS'] = False
    
    # Habilitar CORS para endpoints de API
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Registrar blueprints
    app.register_blueprint(view_bp)
    app.register_blueprint(api_bp)
    
    # Imprimir rutas registradas (para depuración)
    print("\n" + "="*60)
    print("📧 API CLASIFICADOR DE SPAM")
    print("="*60)
    print("\nRutas Registradas:")
    for rule in app.url_map.iter_rules():
        methods = ','.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
        print(f"  {rule.endpoint:30s} {methods:15s} {rule.rule}")
    print("="*60 + "\n")
    
    return app


# Crear la instancia de la app
app = create_app()


if __name__ == '__main__':
    # Obtener puerto de variable de entorno o usar 5000 por defecto
    port = int(os.environ.get('PORT', 5000))
    
    # Ejecutar la aplicación
    print(f"\n🚀 Iniciando servidor en puerto {port}...")
    print(f"📍 URL Local: http://localhost:{port}")
    print(f"📍 Endpoint API: http://localhost:{port}/api/predict")
    print(f"📍 Verificación de Estado: http://localhost:{port}/api/health\n")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.environ.get('FLASK_ENV') == 'development'
    )
