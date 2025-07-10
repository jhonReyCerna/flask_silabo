#!/usr/bin/env python3
"""
Script para verificar el contenido del documento Word generado
y confirmar que las descripciones largas se muestran completas.
"""

from docx import Document
import json

def verificar_documento_word():
    """Abre y verifica el contenido del documento Word generado"""
    
    try:
        # Abrir el documento generado
        doc = Document('formato_silabo.docx')
        
        print("📄 Verificando contenido del documento Word generado...")
        print("=" * 60)
        
        # Extraer todo el texto del documento
        texto_completo = []
        for para in doc.paragraphs:
            if para.text.strip():
                texto_completo.append(para.text.strip())
        
        # Buscar las secciones de competencias específicas
        print("\n🎯 BUSCANDO COMPETENCIAS ESPECÍFICAS:")
        print("-" * 40)
        
        encontro_competencias = False
        for i, texto in enumerate(texto_completo):
            if "Resultado de aprendizaje específico" in texto and "Competencias específicas" in texto:
                encontro_competencias = True
                print(f"✅ Encontrada sección: {texto}")
                
                # Revisar los siguientes párrafos para encontrar las competencias
                j = i + 1
                competencia_actual = ""
                while j < len(texto_completo) and j < i + 20:  # Revisar los siguientes 20 párrafos
                    parrafo = texto_completo[j]
                    
                    if "RAE" in parrafo and "CE" in parrafo:
                        if competencia_actual:
                            print(f"\n📝 Competencia encontrada:")
                            print(f"   Longitud: {len(competencia_actual)} caracteres")
                            print(f"   Contenido: {competencia_actual[:200]}...")
                        competencia_actual = parrafo
                    elif competencia_actual and parrafo and not parrafo.startswith("3.3"):
                        competencia_actual += " " + parrafo
                    elif parrafo.startswith("3.3"):
                        break
                    
                    j += 1
                
                # Mostrar la última competencia
                if competencia_actual:
                    print(f"\n📝 Última competencia encontrada:")
                    print(f"   Longitud: {len(competencia_actual)} caracteres")
                    print(f"   Contenido: {competencia_actual[:200]}...")
                
                break
        
        if not encontro_competencias:
            print("❌ No se encontró la sección de competencias específicas")
        
        # Buscar las secciones de productos
        print("\n\n📦 BUSCANDO PRODUCTOS/ACTIVIDADES:")
        print("-" * 40)
        
        encontro_productos = False
        for i, texto in enumerate(texto_completo):
            if "Producto(s) o actividad(es) de aprendizaje evaluados" in texto:
                encontro_productos = True
                print(f"✅ Encontrada sección: {texto}")
                
                # Revisar los siguientes párrafos para encontrar los productos
                j = i + 1
                producto_actual = ""
                while j < len(texto_completo) and j < i + 20:  # Revisar los siguientes 20 párrafos
                    parrafo = texto_completo[j]
                    
                    if "PA" in parrafo and "C" in parrafo:
                        if producto_actual:
                            print(f"\n📋 Producto encontrado:")
                            print(f"   Longitud: {len(producto_actual)} caracteres")
                            print(f"   Contenido: {producto_actual[:200]}...")
                        producto_actual = parrafo
                    elif producto_actual and parrafo and not parrafo.startswith("IV."):
                        producto_actual += " " + parrafo
                    elif parrafo.startswith("IV."):
                        break
                    
                    j += 1
                
                # Mostrar el último producto
                if producto_actual:
                    print(f"\n📋 Último producto encontrado:")
                    print(f"   Longitud: {len(producto_actual)} caracteres")
                    print(f"   Contenido: {producto_actual[:200]}...")
                
                break
        
        if not encontro_productos:
            print("❌ No se encontró la sección de productos/actividades")
        
        # Verificar la presencia del texto específico mencionado por el usuario
        print("\n\n🔍 BUSCANDO TEXTO ESPECÍFICO DEL PROBLEMA:")
        print("-" * 50)
        
        texto_buscar = "metodología JIMP (4 fases, 12 pasos y 8 pilares) y las normativas ISO 55000"
        texto_documento = " ".join(texto_completo)
        
        if texto_buscar in texto_documento:
            print("✅ El texto específico mencionado SÍ aparece en el documento")
        else:
            print("❌ El texto específico mencionado NO aparece completo en el documento")
        
        # Buscar frases que indiquen truncamiento
        frases_problema = [
            "metodología JIMP (4 fases, 12 pasos y 8 pilares) y las normativas ISO 55000",
            "con el fin de diseñar un plan preliminar",
            "para la implementación de un sistema"
        ]
        
        print("\n📊 VERIFICACIÓN DE FRASES CLAVE:")
        for frase in frases_problema:
            if frase in texto_documento:
                print(f"✅ Encontrada: '{frase}'")
            else:
                print(f"❌ NO encontrada: '{frase}'")
        
        print("\n" + "=" * 60)
        print("🏁 Verificación completada.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al verificar el documento: {e}")
        return False

if __name__ == "__main__":
    verificar_documento_word()
