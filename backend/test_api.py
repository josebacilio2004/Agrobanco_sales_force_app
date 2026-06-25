import requests
import os
import io

BASE_URL = "http://localhost:8003"

def run_tests():
    print("=== INICIANDO PRUEBAS DE INTEGRACIÓN DEL API NÚCLEO ===")
    
    # 1. Resetear base de datos
    print("\n1. Reseteando la base de datos...")
    res = requests.post(f"{BASE_URL}/seed")
    assert res.status_code == 200, f"Error al resetear: {res.text}"
    print("Base de datos limpia y sembrada con éxito.")
    
    # 2. Autenticación del Cliente (Anaximandro - DNI 40118120)
    print("\n2. Autenticando al Cliente (Anaximandro DNI 40118120)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "40118120",
        "password": "agrobanco"
    })
    assert res.status_code == 200, f"Error de login cliente: {res.text}"
    client_token = res.json()["token"]
    print("Autenticación de cliente exitosa. Token obtenido.")
    
    client_headers = {"Authorization": f"Bearer {client_token}"}
    
    # 3. Consultar Resumen Inicial del Cliente
    print("\n3. Obteniendo resumen inicial del Cliente...")
    res = requests.get(f"{BASE_URL}/cliente/resumen", headers=client_headers)
    assert res.status_code == 200
    res_data = res.json()
    cuenta = res_data["cuentas"][0]
    initial_balance = cuenta["saldo"]
    print(f"Cliente: {res_data['cliente']['nombres']} {res_data['cliente']['apellidos']}")
    print(f"Saldo Inicial de Ahorros: S/ {initial_balance:.2f} en cuenta {cuenta['numero_cuenta']}")
    assert initial_balance == 500.0, "El saldo inicial debería ser S/ 500.00"
    
    # 4. Crear Solicitud de Crédito desde Homebanking
    print("\n4. Registrando solicitud de crédito desde Homebanking...")
    # Caso 1 de Anaximandro: S/ 1,000 a 12 meses, TEA 43.92%, sin seguro
    solicitud_payload = {
        "monto": 1000.0,
        "plazo": 12,
        "tea": 43.92,
        "seguro": False,
        "garantia": "sin garantia",
        "destino": "Capital de trabajo: compra de mercaderia"
    }
    res = requests.post(f"{BASE_URL}/cliente/solicitud/crear", json=solicitud_payload, headers=client_headers)
    assert res.status_code == 200, f"Error al crear solicitud: {res.text}"
    sol_res = res.json()
    solicitud_id = sol_res["solicitud_id"]
    expediente = sol_res["expediente"]
    print(f"Solicitud creada correctamente. ID: {solicitud_id}, Expediente: {expediente}")
    
    # 5. Autenticación del Asesor (Código 1001)
    print("\n5. Autenticando al Asesor (Código 1001)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "1001",
        "password": "agrobanco"
    })
    assert res.status_code == 200, f"Error de login asesor: {res.text}"
    advisor_token = res.json()["token"]
    print("Autenticación de asesor exitosa. Token obtenido.")
    
    advisor_headers = {"Authorization": f"Bearer {advisor_token}"}
    
    # 6. Consultar Cartera del Asesor y buscar el caso
    print("\n6. Consultando Cartera del Asesor...")
    res = requests.get(f"{BASE_URL}/fv/cartera", headers=advisor_headers)
    assert res.status_code == 200
    cartera = res.json()
    encontrado = False
    for item in cartera:
        if item["dni"] == "40118120":
            encontrado = True
            print(f"Caso encontrado en Cartera: {item['name']} - Estado: {item['status']} - Visita: {item['isVisited']}")
            assert item["status"] == "NUEVA_SOLICITUD", "El estado debería ser NUEVA_SOLICITUD"
    assert encontrado, "No se encontró el caso del cliente en la cartera del asesor"
    
    # 7. Registrar Visita (GPS)
    print("\n7. Registrando Visita de campo (GPS)...")
    visita_payload = {
        "solicitud_id": solicitud_id,
        "lat": -12.0650,
        "lng": -75.2050,
        "observacion": "Visita en local comercial exitosa, negocio activo Bodega Don Anaxi."
    }
    res = requests.post(f"{BASE_URL}/fv/solicitud/visita", json=visita_payload, headers=advisor_headers)
    assert res.status_code == 200, f"Error al registrar visita: {res.text}"
    print("Visita registrada correctamente en el expediente.")
    
    # 8. Consultar Buró SBS
    print("\n8. Ejecutando consulta de buró de crédito SBS...")
    res = requests.post(f"{BASE_URL}/fv/buro/consultar", json={"dni": "40118120"}, headers=advisor_headers)
    assert res.status_code == 200, f"Error al consultar buró: {res.text}"
    buro_res = res.json()
    print(f"Buró consultado. SBS Rating: {buro_res['sbs_rating']} - Score: {buro_res['score']} - Deuda: S/ {buro_res['deuda_total']:.2f}")
    assert buro_res["sbs_rating"] == "NORMAL"
    assert buro_res["recomendacion"] == "RECOMENDADO"
    
    # 9. Subir Firma y Documentos
    print("\n9. Cargando expediente digital (Firma y DNI)...")
    dummy_file = io.BytesIO(b"dummy signature data")
    files = {"file": ("firma.png", dummy_file, "image/png")}
    data = {
        "solicitud_id": solicitud_id,
        "tipo_documento": "FIRMA"
    }
    res = requests.post(f"{BASE_URL}/fv/solicitud/documentos", data=data, files=files, headers=advisor_headers)
    assert res.status_code == 200, f"Error al subir firma: {res.text}"
    print("Firma capturada y guardada exitosamente.")
    
    # 10. Promover al Comité
    print("\n10. Promoviendo expediente al comité...")
    res = requests.post(f"{BASE_URL}/fv/solicitud/promover", json={"solicitud_id": solicitud_id}, headers=advisor_headers)
    assert res.status_code == 200, f"Error al promover: {res.text}"
    print("Expediente promovido correctamente.")
    
    # 11. Simulación automática de decisión del Comité y Desembolso
    print("\n11. Simulando decisión del Comité y ejecución del desembolso...")
    res = requests.post(f"{BASE_URL}/comite/procesar/{solicitud_id}")
    assert res.status_code == 200, f"Error en comité: {res.text}"
    comite_res = res.json()
    print(f"Comité finalizado. Decisión: {comite_res['decision']} - Estado Solicitud: {comite_res['estado']}")
    print(f"Monto Solicitado: S/ {comite_res['monto_solicitado']:.2f} | Aprobado: S/ {comite_res['monto_aprobado']:.2f}")
    assert comite_res["decision"] == "APROBADO"
    assert comite_res["estado"] == "desembolsado"
    
    # 12. Verificar Acreditación en Homebanking
    print("\n12. Verificando impacto en Homebanking del Cliente...")
    res = requests.get(f"{BASE_URL}/cliente/resumen", headers=client_headers)
    assert res.status_code == 200
    client_res = res.json()
    
    cuenta_actualizada = client_res["cuentas"][0]
    nuevo_saldo = cuenta_actualizada["saldo"]
    print(f"Nuevo Saldo de Ahorros: S/ {nuevo_saldo:.2f}")
    assert nuevo_saldo == 1500.0, f"El saldo debería incrementarse por el desembolso. Esperado 1500.0, obtenido {nuevo_saldo}"
    
    credito_activo = client_res["creditos"][0]
    credito_id = credito_activo["id"]
    print(f"Crédito Activo: {credito_activo['producto']} | Saldo Deuda: S/ {credito_activo['saldo_actual']:.2f} | Cuotas: {credito_activo['cuotas_pagadas']}/{credito_activo['cuotas_total']}")
    assert credito_activo["estado"] == "vigente"
    assert credito_activo["saldo_actual"] == 1000.0
    
    # 13. Obtener y verificar cronograma (French Amortization System)
    print("\n13. Cargando cronograma de cuotas (Sistema Francés)...")
    res = requests.get(f"{BASE_URL}/cliente/credito/{credito_id}/cronograma", headers=client_headers)
    assert res.status_code == 200
    cronograma = res.json()
    print("Cuota 1:")
    c1 = cronograma[0]
    print(f"  Monto Cuota: S/ {c1['monto_cuota']} (Capital: S/ {c1['capital']} | Interés: S/ {c1['interes']})")
    print(f"  Saldo Pendiente: S/ {c1['saldo_pendiente']} | Estado: {c1['estado']}")
    # Anaximandro's installment is exactly S/ 100.95
    assert c1["monto_cuota"] == 100.95, f"La cuota debería ser S/ 100.95, se obtuvo S/ {c1['monto_cuota']}"
    assert len(cronograma) == 12, "El cronograma debería tener 12 cuotas"
    
    # 14. Realizar pago de la primera cuota
    print("\n14. Pagando la primera cuota...")
    pago_payload = {
        "credito_id": credito_id,
        "cuota_id": c1["id"]
    }
    res = requests.post(f"{BASE_URL}/cliente/operaciones/pagar", json=pago_payload, headers=client_headers)
    assert res.status_code == 200, f"Error al pagar cuota: {res.text}"
    pago_res = res.json()
    print(f"Pago exitoso. Nuevo saldo de ahorros: S/ {pago_res['nuevo_saldo_ahorros']:.2f}")
    print(f"Deuda pendiente restante: S/ {pago_res['saldo_pendiente_credito']:.2f}")
    
    # Verify balances updated
    expected_savings = 1500.0 - 100.95
    assert round(pago_res["nuevo_saldo_ahorros"], 2) == round(expected_savings, 2)
    assert pago_res["cuotas_restantes"] == 11
    
    print("\n=== ¡TODAS LAS PRUEBAS SE COMPLETARON CON ÉXITO! ===")

if __name__ == "__main__":
    run_tests()
