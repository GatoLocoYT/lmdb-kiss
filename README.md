# LMDB — La Mona de Baviera (Catálogo + Pedidos por WhatsApp)

Este repositorio contiene el sitio web oficial de **La Mona de Baviera (LMDB)**, un emprendimiento dedicado a la venta de snacks, bebidas y postres, con stock inmediato y productos por encargo.

El sitio funciona como un **catálogo interactivo** que permite a los clientes armar su pedido y enviarlo directamente por WhatsApp, sin pagos online ni backend propio.

---

## 🎯 Objetivo del Proyecto

El objetivo principal es:

- Mostrar el catálogo de productos disponibles.
- Facilitar pedidos por WhatsApp.
- Reducir errores en la toma de pedidos.
- Agilizar la atención al cliente.
- Mantener una estructura simple (KISS: *Keep It Simple, Stupid*).

No se procesan pagos desde la web.  
Los precios finales y formas de pago se confirman directamente con el vendedor.

---

## 🧩 Características Principales

- ✅ Sitio 100% estático (HTML, CSS, JavaScript)
- ✅ Sin backend
- ✅ Sin base de datos
- ✅ Sin sistema de usuarios
- ✅ Carrito local (localStorage)
- ✅ Envío automático de pedidos por WhatsApp
- ✅ Firma de referencia para comisiones (`Vendedor: RAMIRO`)
- ✅ Separación entre:
  - Productos en stock
  - Productos por encargo (seleccionados)

---

## 📁 Estructura del Proyecto

/
├── index.html # Página principal
├── stock.html # Productos en stock
├── seleccionados.html # Productos por encargo
│
├── assets/
│ ├── css/
│ │ └── styles.css # Estilos globales
│ ├── js/
│ │ └── app.js # Lógica principal
│ └── img/ # Imágenes de productos
│
├── data/
│ └── products.json # Catálogo de productos
│
└── README.md # Documentación


---

## 📦 Gestión de Productos

Todos los productos se administran desde:

data/products.json

No existe panel de administración.

Las modificaciones se realizan editando este archivo y subiendo los cambios al repositorio.

### Ejemplo de Producto

```json
{
  "sku": "SNK-001",
  "name": "Doritos 120g",
  "type": "stock",
  "category": "snacks",
  "inStock": true,
  "price": 3500,
  "currency": "ARS",
  "desc": "Sabor Nacho.",
  "img": "assets/img/doritos.jpg"
}
```
## Campos Disponibles
Campo	Descripción
sku	Identificador interno
name	Nombre del producto
type	stock o seleccionado
category	snacks / bebidas / postres / otros
inStock	true / false (solo stock)
price	Precio numérico (solo stock)
priceLabel	Texto alternativo (ej: "A acordar")
currency	Moneda (default ARS)
desc	Descripción
img	Ruta de imagen
badge	Etiqueta opcional

---
## 🛒 Funcionamiento del Carrito

El carrito se guarda en localStorage.
No se almacena información en servidores.
Cada usuario gestiona su propio carrito localmente.

Al presionar "Enviar pedido", se genera un mensaje automático con:
* Producto
* Cantidad
* Precio (si aplica)
* Subtotal
* Notas
* Referencia del vendedor

Ejemplo:

```lua
Hola LMDB! Quiero hacer un pedido:

Producto: Doritos 120g
Cantidad: 2
Precio: ARS $3.500
Subtotal: ARS $7.000

Notas:
Pago en efectivo

Vendedor: RAMIRO
```
---
## 🔐 Seguridad

Este proyecto no maneja:
* Pagos
* Datos personales
* Usuarios
* Contraseñas

Por lo tanto:
* No requiere backend.
* No expone información sensible.
* No es vulnerable a fraudes financieros directos.
* Cualquier precio o pago es validado manualmente por el vendedor.
---
## 🚀 Deploy

El sitio está pensado para ser alojado como Static Site.
Plataforma:
Render

---
## 📈 Escalabilidad

Este proyecto está diseñado para una primera etapa.
Si el negocio crece, se puede migrar a:
* Backend propio
* Base de datos
* Panel admin
* Control de stock real
* Historial de pedidos

La estructura actual permite una migración progresiva sin rehacer el frontend.
---
## 👨‍💻 Autor y Mantenimiento

Desarrollado y mantenido por:
> Ramiro Rahman Rintoul

Técnico Superior en Programación

Responsable de:
* Desarrollo
* Mantenimiento
* Actualizaciones
* Integración

---

## 📄 Licencia

Proyecto de uso privado para LMDB.
No está autorizado su uso comercial externo sin permiso del autor.