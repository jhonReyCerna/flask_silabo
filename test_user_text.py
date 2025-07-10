#!/usr/bin/env python3
"""
Script para crear un registro de prueba con el texto específico mencionado por el usuario
"""

import json
from datetime import datetime

def crear_registro_prueba():
    """Crea un registro con el texto largo específico del usuario"""
    
    texto_largo_usuario = """Analiza un caso práctico de una organización industrial para identificar, describir y evaluar sus componentes esenciales (estructura organizativa, procesos clave y portafolio de activos críticos) en relación con la metodología JIMP (4 fases, 12 pasos y 8 pilares) y las normativas ISO 55000:2024 e ISO 55001:2024, con el fin de diseñar un plan preliminar para la implementación de un sistema Analiza un caso práctico de una organización industrial para identificar, describir y evaluar sus componentes esenciales (estructura organizativa, procesos clave y portafolio de activos críticos) en relación con la metodología JIMP (4 fases, 12 pasos y 8 pilares) y las normativas ISO 55000:2024 e ISO 55001:2024, con el fin de diseñar un plan preliminar para la implementación de un sistema"""
    
    registro_prueba = {
        "general": {
            "fecha_guardado": datetime.now().isoformat(),
            "codigo": "TEST002",
            "version": "1",
            "fecha": "2025-07-09",
            "maestria": "PRUEBA TEXTOS LARGOS",
            "asignatura": "COMPETENCIAS LARGAS TEST",
            "semestre": "A",
            "docente": "TEST TEACHER",
            "horas_teoria": "16",
            "horas_practica": "0",
            "creditos": "4",
            "sesiones": "4",
            "semanas": "4",
            "correo": "test@example.com",
            "codigo_programa": "TEST001",
            "caracter": "Obligatorio",
            "proposito": "Curso de prueba para verificar textos largos",
            "horario": "Sábado - Domingo",
            "modalidad": "Virtual",
            "link_virtual": "https://test.com"
        },
        "unidades": {
            "sesiones": 4,
            "unidades": 1,
            "unidades_detalle": [
                {
                    "numero": 1,
                    "nombre": "Unidad de Prueba",
                    "sesiones": 4,
                    "logro": "Logro de prueba",
                    "instrumentos": ["Test"]
                }
            ]
        },
        "competencias": {
            "unidades_competencias": [
                {
                    "unidad_numero": 1,
                    "unidad_nombre": "Unidad de Prueba",
                    "competencias": [
                        {
                            "codigo": "RAE1 (CE1)",
                            "titulo": "Competencia de Análisis Organizacional",
                            "descripcion": texto_largo_usuario
                        }
                    ]
                }
            ]
        },
        "productos": {
            "unidades_productos": [
                {
                    "unidad_numero": 1,
                    "unidad_nombre": "Unidad de Prueba",
                    "productos": [
                        {
                            "codigo": "PA1 (C1)",
                            "titulo": "Informe Completo de Análisis",
                            "descripcion": texto_largo_usuario
                        }
                    ]
                }
            ]
        },
        "sesiones": {
            "unidades_sesiones": [
                {
                    "unidad_numero": 1,
                    "unidad_nombre": "Unidad de Prueba",
                    "total_sesiones": 4,
                    "sesiones": [
                        {"numero_sesion": 1, "temario": "Tema 1"},
                        {"numero_sesion": 2, "temario": "Tema 2"},
                        {"numero_sesion": 3, "temario": "Tema 3"},
                        {"numero_sesion": 4, "temario": "Tema 4"}
                    ]
                }
            ]
        },
        "cronograma": {
            "fecha_inicio": "2025-07-09",
            "cronograma": []
        },
        "referencias": {
            "libros": [],
            "articulos": [],
            "web": []
        },
        "metadatos": {
            "fecha_finalizacion": datetime.now().isoformat(),
            "estado": "completado",
            "id_registro": 999
        }
    }
    
    print("📝 REGISTRO DE PRUEBA CREADO:")
    print(f"Longitud del texto: {len(texto_largo_usuario)} caracteres")
    print(f"Texto: {texto_largo_usuario[:100]}...")
    
    return registro_prueba

def test_generar_con_registro_prueba():
    """Genera documento Word con el registro de prueba"""
    
    from generar_word import generar_documento_word
    
    registro = crear_registro_prueba()
    
    # Estructura como la espera Flask
    datos_completos = {
        'general': registro['general'],
        'unidades': registro['unidades'],
        'competencias': registro['competencias'],
        'productos': registro['productos'],
        'sesiones': registro['sesiones'],
        'cronograma': registro['cronograma'],
        'referencias': registro['referencias']
    }
    
    print("\n🎯 GENERANDO DOCUMENTO WORD CON TEXTO DEL USUARIO...")
    
    try:
        doc = generar_documento_word(datos_completos)
        archivo = "test_usuario_texto_largo.docx"
        doc.save(archivo)
        
        print(f"✅ Documento generado: {archivo}")
        
        # Verificar contenido
        from docx import Document
        doc_verificar = Document(archivo)
        texto_completo = "\n".join([p.text for p in doc_verificar.paragraphs if p.text.strip()])
        
        print("\n📊 VERIFICACIÓN:")
        
        # Buscar el texto específico del usuario
        if "metodología JIMP (4 fases, 12 pasos y 8 pilares) y las normativas ISO 55000:2024 e ISO 55001:2024, con el fin de diseñar un plan preliminar para la implementación de un sistema" in texto_completo:
            print("✅ El texto COMPLETO del usuario aparece en el documento")
        else:
            print("❌ El texto del usuario está incompleto o no aparece")
        
        # Contar apariciones del texto repetido
        apariciones = texto_completo.count("Analiza un caso práctico de una organización industrial")
        print(f"📊 Apariciones del texto: {apariciones}")
        
        # Buscar competencia específica
        if "RAE1 (CE1) Competencia de Análisis Organizacional:" in texto_completo:
            print("✅ Competencia encontrada en formato correcto")
        else:
            print("❌ Competencia no encontrada o formato incorrecto")
        
        return archivo
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    test_generar_con_registro_prueba()
