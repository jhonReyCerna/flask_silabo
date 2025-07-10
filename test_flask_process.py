#!/usr/bin/env python3
"""
Script que simula exactamente el proceso de generación de Word que usa la aplicación Flask
"""

import json
from generar_word import generar_documento_word

def test_with_flask_process():
    """Simula el proceso exacto que usa Flask para generar el documento"""
    
    # Cargar datos del historial como lo hace Flask
    with open('historial.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if not data['registros_completados']:
        print("No hay registros completados")
        return
    
    # Usar el último registro como lo hace Flask
    ultimo_registro = data['registros_completados'][-1]
    
    # Simular el proceso de cargar_datos() de Flask
    datos_general = ultimo_registro.get('general', {})
    
    # Simular la estructura que envía Flask a generar_documento_word
    datos_completos = {
        'general': datos_general,
        'unidades': ultimo_registro.get('unidades', {}),
        'competencias': ultimo_registro.get('competencias', {}),
        'productos': ultimo_registro.get('productos', {}),
        'sesiones': ultimo_registro.get('sesiones', {}),
        'cronograma': ultimo_registro.get('cronograma', {}),
        'referencias': ultimo_registro.get('referencias', {})
    }
    
    print("🔍 DATOS QUE SE ENVÍAN A GENERAR_DOCUMENTO_WORD:")
    print("=" * 60)
    
    # Mostrar estructura de competencias
    print("\n📊 COMPETENCIAS:")
    if 'competencias' in datos_completos:
        comp_data = datos_completos['competencias']
        print(f"Tipo: {type(comp_data)}")
        print(f"Claves: {list(comp_data.keys()) if isinstance(comp_data, dict) else 'No es dict'}")
        
        if 'unidades_competencias' in comp_data:
            print(f"Número de unidades con competencias: {len(comp_data['unidades_competencias'])}")
            for i, unidad in enumerate(comp_data['unidades_competencias']):
                print(f"  Unidad {i+1}:")
                if 'competencias' in unidad:
                    for j, comp in enumerate(unidad['competencias']):
                        print(f"    Competencia {j+1}: {comp['codigo']}")
                        print(f"      Título: {comp['titulo'][:50]}...")
                        print(f"      Descripción: {comp['descripcion'][:100]}...")
    
    # Mostrar estructura de productos
    print("\n📦 PRODUCTOS:")
    if 'productos' in datos_completos:
        prod_data = datos_completos['productos']
        print(f"Tipo: {type(prod_data)}")
        print(f"Claves: {list(prod_data.keys()) if isinstance(prod_data, dict) else 'No es dict'}")
        
        if 'unidades_productos' in prod_data:
            print(f"Número de unidades con productos: {len(prod_data['unidades_productos'])}")
            for i, unidad in enumerate(prod_data['unidades_productos']):
                print(f"  Unidad {i+1}:")
                if 'productos' in unidad:
                    for j, prod in enumerate(unidad['productos']):
                        print(f"    Producto {j+1}: {prod['codigo']}")
                        print(f"      Título: {prod['titulo'][:50]}...")
                        print(f"      Descripción: {prod['descripcion'][:100]}...")
    
    print("\n" + "=" * 60)
    print("🎯 GENERANDO DOCUMENTO WORD...")
    
    try:
        # Generar el documento usando el mismo proceso que Flask
        doc = generar_documento_word(datos_completos)
        
        # Guardar el documento
        nombre_archivo = "test_flask_process.docx"
        doc.save(nombre_archivo)
        
        print(f"✅ Documento generado exitosamente: {nombre_archivo}")
        
        # Verificar el contenido del documento generado
        verificar_contenido_generado(nombre_archivo)
        
        return nombre_archivo
        
    except Exception as e:
        print(f"❌ Error al generar documento: {e}")
        import traceback
        traceback.print_exc()
        return None

def verificar_contenido_generado(archivo):
    """Verifica el contenido del documento generado"""
    
    try:
        from docx import Document
        
        doc = Document(archivo)
        texto_completo = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        
        print(f"\n📄 VERIFICANDO CONTENIDO DE {archivo}:")
        print("-" * 40)
        
        # Buscar competencias específicas
        if "competencias específicas" in texto_completo.lower():
            print("✅ Sección de competencias específicas encontrada")
        else:
            print("❌ Sección de competencias específicas NO encontrada")
        
        # Buscar productos
        if "producto(s) o actividad(es)" in texto_completo.lower():
            print("✅ Sección de productos encontrada")
        else:
            print("❌ Sección de productos NO encontrada")
        
        # Buscar texto específico del problema
        textos_buscar = [
            "metodología JIMP",
            "4 fases, 12 pasos y 8 pilares",
            "ISO 55000:2024",
            "ISO 55001:2024",
            "plan preliminar"
        ]
        
        for texto in textos_buscar:
            if texto in texto_completo:
                print(f"✅ Encontrado: '{texto}'")
            else:
                print(f"❌ NO encontrado: '{texto}'")
        
        # Contar longitud de las competencias en el documento
        lines = texto_completo.split('\n')
        for i, line in enumerate(lines):
            if 'RAE1 (CE1)' in line and 'Fundamentos del TPM' in line:
                # Buscar la descripción en las siguientes líneas
                j = i + 1
                descripcion = ""
                while j < len(lines) and j < i + 5:
                    if lines[j].strip() and not lines[j].startswith('RAE'):
                        descripcion += lines[j].strip() + " "
                    j += 1
                
                print(f"\n📝 COMPETENCIA RAE1 ENCONTRADA:")
                print(f"   Título: {line}")
                print(f"   Descripción: {descripcion[:200]}...")
                print(f"   Longitud descripción: {len(descripcion)} caracteres")
                break
        
    except Exception as e:
        print(f"❌ Error al verificar contenido: {e}")

if __name__ == "__main__":
    test_with_flask_process()
