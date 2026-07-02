# Lógica de Créditos — Agrobanco Sales Force

## 1. Visión General del Sistema

Agrobanco Sales Force es una plataforma de **originación y gestión de microcréditos** para microempresas y productores agropecuarios en Perú. El sistema implementa tres capas independientes con la misma lógica de negocio:

| Capa | Tecnología | Archivo clave |
|------|-----------|---------------|
| **Backend** | Python FastAPI | `backend/routers/comite.py` |
| **App Móvil** | Flutter (Dart) | `lib/features/loan_request/loan_simulator_screen.dart` |
| **Web** | Next.js (React) | `web_next/src/app/components/SimuladorView.js` |

El ciclo completo del crédito sigue **5 etapas**:

```
Pre-evaluación → Evaluación → Aprobación → Desembolso → Recuperación
```

---

## 2. Tasas de Interés (TEA)

### 2.1. Tasas Oficiales

El sistema maneja **dos tasas base** definidas en el tarifario oficial:

| TEA | Seguro de Desgravamen | Aplica a |
|-----|----------------------|----------|
| **40.92%** | Con seguro (`seguro=True`) | Créditos preferenciales / fomento |
| **43.92%** | Sin seguro (`seguro=False`) | Créditos regulares |

Adicionalmente, el simulador web independiente ofrece una tercera opción:
- **48.50%** TEA — Microcrédito (solo en `SimuladorView.js`)

> **Nota**: El simulador rápido de la app móvil (`loan_simulator_screen.dart`) utiliza una TEA fija de **22.5%** que es un valor de demostración, NO la tasa real del banco.

### 2.2. Cálculo de la Tasa Efectiva Mensual (TEM)

La TEM se calcula mediante **descomposición geométrica** (NO lineal):

```
TEM = (1 + TEA) ^ (1/12) - 1
```

**Ejemplos:**
- Para TEA = 40.92%: TEM = (1.4092)^(1/12) - 1 = **0.02896** (2.896% mensual)
- Para TEA = 43.92%: TEM = (1.4392)^(1/12) - 1 = **0.03064** (3.064% mensual)

### 2.3. Cálculo de la Cuota Fija (Sistema Francés)

La cuota mensual se calcula con la **fórmula de amortización francesa** (cuota constante):

```
Cuota = Monto × [TEM × (1 + TEM)^n] / [(1 + TEM)^n - 1]
```

Donde:
- `Monto` = Capital solicitado
- `TEM` = Tasa Efectiva Mensual
- `n` = Número de meses del plazo

### 2.4. Descomposición de Cada Cuota

Para cada período `i`:

```
Interés(i)    = SaldoPendiente(i-1) × TEM
Capital(i)    = Cuota - Interés(i)
Saldo(i)      = Saldo(i-1) - Capital(i)
```

### 2.5. Ajuste de Redondeo

La última cuota absorbe la diferencia de redondeo acumulada:

```python
diff = monto_original - sum(capitales)
if abs(diff) > 0.01:
    installments[-1]["capital"] += diff
    installments[-1]["interes"] = cuota - capital_ajustado
    installments[-1]["saldo_pendiente"] = 0.0
```

---

## 3. Parámetros del Crédito

### 3.1. Montos

| Parámetro | Rango |
|-----------|-------|
| Monto mínimo | S/ 500 |
| Monto máximo estándar | S/ 25,000 |
| Monto máximo simulador web | S/ 50,000 |
| Paso del slider | S/ 500 |

### 3.2. Plazos

| Plazo (meses) | Tipo |
|---------------|------|
| 3 | Corto plazo |
| 6 | Corta campaña |
| 12 | Estándar anual |
| 18 | Mediano plazo |
| 24 | Largo plazo |
| 36, 48 | Plazo extendido (solo en simulador móvil) |

### 3.3. Monedas

- **PEN** (Sol peruano) — Principal
- **USD** (Dólar americano) — Disponible en simulador

### 3.4. Frecuencia de Pago

- **Mensual** (predeterminado)
- Quincenal
- Semanal

### 3.5. Tipos de Garantía

| Garantía | Descripción |
|----------|-------------|
| `sin garantia` | Crédito quirografario |
| `prendaria` | Prenda de bienes muebles |
| `hipotecaria` | Hipoteca de inmueble |
| `vehicular` | Vehículo en garantía |

### 3.6. Destinos del Crédito

- Capital de trabajo
- Compra de mercadería / stock
- Compra de maquinaria o equipo
- Ampliación de local o galpón
- Compra de vehículo de carga
- Refinanciamiento
- Ganado

### 3.7. Categorías de Negocio

- Agropecuario
- Comercio
- Servicios
- Producción

---

## 4. Cronograma de Pagos (Amortización)

### 4.1. Estructura del Cronograma

Cada fila del cronograma contiene:

| Campo | Descripción |
|-------|-------------|
| `numero_cuota` | Número de cuota (1-indexed) |
| `fecha_pago` | Fecha de vencimiento (mes+1) |
| `monto_cuota` | Cuota fija mensual |
| `capital` | Porción de amortización |
| `interes` | Porción de interés |
| `saldo_pendiente` | Saldo deudor después del pago |
| `estado` | `pendiente` / `pagado` / `vencido` |

### 4.2. Cálculo de Fechas

Las fechas se calculan avanzando 1 mes calendario desde la fecha de desembolso:

```python
year = current_date.year
month = current_date.month + 1
if month > 12:
    month = 1
    year += 1
day = min(current_date.day, 28)
```

### 4.3. Ejemplo Numérico

**Caso**: S/ 5,000 a 12 meses con TEA 40.92% (con seguro)

| Parámetro | Valor |
|-----------|-------|
| Monto | S/ 5,000.00 |
| Plazo | 12 meses |
| TEA | 40.92% |
| TEM | 2.896% |
| Cuota mensual | **S/ 499.32** |
| Total intereses | S/ 991.84 |
| Total a pagar | S/ 5,991.84 |

**Cronograma simplificado:**

| Cuota | Capital | Interés | Saldo |
|-------|---------|---------|-------|
| 1 | 354.52 | 144.80 | 4,645.48 |
| 2 | 364.79 | 134.53 | 4,280.69 |
| 3 | 375.35 | 123.96 | 3,905.34 |
| 4 | 386.22 | 113.10 | 3,519.12 |
| 5 | 397.41 | 101.91 | 3,121.71 |
| 6 | 408.92 | 90.40 | 2,712.79 |
| 7 | 420.76 | 78.55 | 2,292.03 |
| 8 | 432.95 | 66.37 | 1,859.08 |
| 9 | 445.49 | 53.83 | 1,413.59 |
| 10 | 458.40 | 40.92 | 955.19 |
| 11 | 471.67 | 27.65 | 483.52 |
| 12 | 483.52 | 14.00 | 0.00 |

---

## 5. Flujo de Solicitud de Crédito

### 5.1. Pipeline de Estados

```
ENVIADO → RECIBIDO_COMITE → EN_EVALUACION → APROBADO → DESEMBOLSADO
                                                ↘
                                          CONDICIONADO → DESEMBOLSADO (monto reducido)
                                                ↘
                                            RECHAZADO
```

### 5.2. Solicitud por el Cliente (Home Banking)

Endpoint: `POST /cliente/solicitud/crear`

```json
{
  "monto": 5000.0,
  "plazo": 12,
  "tea": 40.92,
  "seguro": true,
  "garantia": "sin garantia",
  "destino": "Capital de trabajo"
}
```

**Reglas:**
- No puede existir otra solicitud pendiente del mismo cliente
- Se genera expediente automático: `EXP-2026-{NNN}`
- Estado inicial: `enviado`
- Canal: `cliente`

### 5.3. Solicitud por el Asesor (App Móvil — 4 pasos)

1. **Paso 1**: Datos personales del productor (nombre, DNI, teléfono, estado civil)
2. **Paso 2**: Datos del negocio (tipo, nombre, dirección, antigüedad, ingresos/gastos)
3. **Paso 3**: Condiciones del crédito (monto, plazo, moneda, frecuencia, garantía) + simulación en tiempo real
4. **Paso 4**: Firma digital + declaración de visita

**Endpoints del flujo:**
- `POST /fv/solicitud/visita` — Registrar visita con GPS
- `POST /fv/solicitud/documentos` — Subir firma digital
- `POST /fv/solicitud/promover` — Promover al comité (cambia a `recibido_comite`)

### 5.4. Procesamiento por el Comité

Endpoint: `POST /comite/procesar/{solicitud_id}`

El comité evalúa contra `CASES_METADATA` (30 casos precargados):

| Resultado | Acción |
|-----------|--------|
| `APROBADO` | Solicitud → `aprobado`, luego desembolso automático |
| `CONDICIONADO` | Solicitud → `condicionado`, desembolso con monto reducido |
| `RECHAZADO` | Solicitud → `rechazado`, se registra motivo |

### 5.5. Desembolso (Automático al Aprobar)

1. Crea registro en `creditos` con estado `vigente`
2. Genera `cronograma` completo (N cuotas)
3. Abona el monto en `cuentas_ahorro` del cliente
4. Registra movimiento `DESEMBOLSO`
5. Fecha de vencimiento: `desembolso + 30 * plazo_meses`

---

## 6. Pre-evaluación Crediticia

### 6.1. Scoring Automático

| Score | Resultado | Acción |
|-------|-----------|--------|
| >= 85 | **APTO** | Continuar evaluación |
| 60 - 84 | **REVISAR** | Requiere análisis adicional |
| < 60 | **NO PROCEDE** | No cumple condiciones |

### 6.2. Reglas de Negocio

| Condición | Efecto |
|-----------|--------|
| `inhabilitado = true` | **Bloqueo total** (HTTP 403) |
| Score < 60 | Rechazo automático |
| Mora máxima > 15 días | Señal de alerta (revisión) |
| Mora máxima >= 60 días | Probable rechazo |
| Mora máxima >= 90 días | Rechazo automático |
| Ingresos - Gastos <= S/ 500 | NO PROCEDE |

### 6.3. Buró de Crédito (SBS)

La consulta al buró devuelve:

| Campo | Significado |
|-------|-------------|
| `sbs_rating` | NORMAL / CPP / DEFICIENTE / DUDOSO / PERDIDA |
| `entidades_deuda` | Número de entidades con deuda activa |
| `deuda_total` | Deuda total consolidada |
| `mora_max` | Máximo de días de mora histórica |
| `inhabilitado` | Lista de inhabilitados |

**Semaforización SBS:**
| Rating | Color | Acción |
|--------|-------|--------|
| NORMAL | Verde | Continuar |
| CPP | Amarillo | Requiere atención |
| DEFICIENTE | Naranja | Comité especial |
| DUDOSO | Rojo | Alto riesgo |
| PERDIDA | Gris | No procede |

---

## 7. Pago de Cuotas

Endpoint: `POST /cliente/operaciones/pagar`

**Reglas:**
1. Se verifica que la cuota existe y no está pagada
2. Se verifica saldo suficiente en la cuenta de ahorros
3. Se descuenta el monto de la cuenta
4. Se marca la cuota como `pagado` con fecha
5. Se actualiza el crédito: `cuotas_pagadas += 1`, `saldo_actual = saldo_pendiente`
6. Si `cuotas_pagadas >= cuotas_total`, el crédito pasa a estado `pagado`

---

## 8. Cartera y Priorización

### 8.1. Tipos de Gestión

| Tipo | Color | Prioridad Base |
|------|-------|---------------|
| RECUPERACIÓN MORA | Rojo | ALTA (40 pts) |
| RENOVACIÓN | Azul | MEDIA (35 pts) |
| AMPLIACIÓN | Verde | MEDIA (25 pts) |
| NUEVA SOLICITUD | Naranja | NORMAL (5 pts) |
| SEGUIMIENTO | Gris | BAJA (10 pts) |
| DESERTOR | Morado | BAJA |

### 8.2. Puntaje de Prioridad (0-100)

```
mora activa:         40 pts base + días_mora (hasta +30)
renovación > S/5000: 35 pts
ampliación:          25 pts
seguimiento:         10 pts
nueva solicitud:      5 pts
```

---

## 9. Casos de Prueba (30 Casos)

El sistema incluye **30 casos precargados** en `backend/cases_data.py` que cubren:

| Escenario | Cantidad |
|-----------|----------|
| Aprobados sin seguro | 6 |
| Aprobados con seguro | ~15 |
| Aprobados con CPP | ~3 |
| Condicionados (monto reducido) | 3 |
| Rechazados por inhabilitado | 1 |
| Rechazados por capacidad de pago | ~2 |
| Rechazados por rating SBS | ~2 |

**Distribución de montos:** S/ 1,000 a S/ 25,000
**Distribución de plazos:** 6, 12, 18, 24 meses

---

## 10. Implementaciones del Cálculo

### Backend (Python) — `backend/routers/comite.py:14-57`

```python
tem = (1 + tea / 100.0) ** (1.0 / 12.0) - 1.0
cuota = amount * (tem * (1 + tem) ** term_months) / ((1 + tem) ** term_months - 1)

for i in range(1, term_months + 1):
    interest = outstanding_balance * tem
    capital = cuota - interest
    outstanding_balance = outstanding_balance - capital
```

### Web (JavaScript) — `web_next/src/app/components/SimuladorView.js:11-59`

```javascript
const TEM = Math.pow(1 + annualRate, 1 / 12) - 1;
const cuotaVal = (p * TEM * Math.pow(1 + TEM, n)) / (Math.pow(1 + TEM, n) - 1);
```

### Móvil (Dart) — `lib/features/loan_request/loan_request_screen.dart:106-125`

```dart
final double rEquiv = pow(1.0 + teaVal, 1.0 / 12.0) - 1.0;
final double quota = (_requestedAmount * rEquiv) / (1.0 - pow(1.0 + rEquiv, -_repaymentTerm));
```

---

## 11. Modelo de Datos (Entidades Principales)

```
SolicitudCredito (monto_solicitado, plazo_meses, tea, seguro_desgravamen, estado)
       ↓
   Credito (monto_desembolsado, plazo_meses, tea, estado, saldo_actual, cuotas_pagadas)
       ↓
  Cronograma (N registros: numero_cuota, fecha_pago, monto_cuota, capital, interes, saldo_pendiente, estado)
```

**Relaciones:**
- `Cliente 1 → N SolicitudCredito`
- `Cliente 1 → N Credito`
- `SolicitudCredito 1 → 1 Credito`
- `Credito 1 → N Cronograma`
- `Cliente 1 → 1 CuentaAhorro`
- `CuentaAhorro 1 → N Movimiento`

---

## 12. Glosario

| Término | Significado |
|---------|-------------|
| **TEA** | Tasa Efectiva Anual — tasa de interés anualizada |
| **TEM** | Tasa Efectiva Mensual — tasa de interés mensual |
| **Sistema Francés** | Amortización con cuota constante (fija) |
| **Seguro de Desgravamen** | Seguro que cubre el saldo deudor en caso de fallecimiento |
| **Pre-evaluación** | Evaluación inicial de capacidad de pago y riesgo |
| **Scoring** | Puntaje de crédito interno (0-100) |
| **SBS** | Superintendencia de Banca, Seguros y AFP — ente regulador |
| **CPP** | Con Problemas Potenciales — calificación SBS |
| **Cronograma** | Plan de pagos con fechas y montos de cada cuota |
| **Desembolso** | Entrega del monto del crédito al cliente |
| **Expediente** | Número único de solicitud (formato: EXP-2026-XXX) |
