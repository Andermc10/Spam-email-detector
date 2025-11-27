"""
Controlador de Vistas
Maneja las rutas para servir plantillas HTML.
"""

from flask import Blueprint, render_template

# Crear blueprint
view_bp = Blueprint('views', __name__)


@view_bp.route('/')
def index():
    """
    Sirve la página principal HTML.
    
    Retorna:
        Plantilla HTML renderizada
    """
    return render_template('index.html')


@view_bp.route('/about')
def about():
    """
    Sirve la página acerca de (opcional).
    
    Retorna:
        Plantilla HTML renderizada o información básica
    """
    return render_template('about.html') if False else {
        'app': 'Clasificador de Spam de Email',
        'version': '1.0.0',
        'model': 'Random Forest'
    }
