# 🏢 Sistema de Formularios de Empleados - IT Solutions

## 📋 **Descripción**
Sistema completo de gestión de formularios de onboarding de empleados con base de datos SQLite, generación de PDFs y módulo de edición.

## 🌐 **URLs de Acceso**
- **Formulario Principal**: http://localhost:3001
- **Lista de Formularios**: http://localhost:3001/list.html
- **API Backend**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 🎯 **Funcionalidades Implementadas**

### ✅ **Formulario Principal**
- **Número de Empleado**: Campo de texto opcional
- **Nombre Completo**: Campo de texto obligatorio  
- **Departamento**: Selector con opciones predefinidas
- **Fecha de Inicio**: Campo de fecha obligatorio
- **Hardware (Laptop)**: Radio buttons con dos opciones (solo una selección)
- **Capacitaciones**: Checkboxes con tres opciones (múltiple selección)
- **Software Requerido**: Lista de checkboxes múltiples

### ✅ **Base de Datos SQLite**
- **Tabla**: `formularios` con todos los campos del formulario
- **Campos JSON**: Capacitaciones y software como arrays JSON
- **Timestamps**: `created_at` y `updated_at` automáticos
- **ID**: Auto-incremento para identificación única

### ✅ **API REST Completa**
- **POST** `/api/formularios` - Crear nuevo formulario
- **GET** `/api/formularios` - Listar todos los formularios
- **GET** `/api/formularios/:id` - Obtener formulario por ID
- **PUT** `/api/formularios/:id` - Actualizar formulario
- **DELETE** `/api/formularios/:id` - Eliminar formulario

### ✅ **Módulo de Lista**
- **Vista de tabla**: Todos los formularios con información resumida
- **Badges**: Departamentos, hardware, conteo de capacitaciones/software
- **Acciones**: Botones para editar y eliminar
- **Responsive**: Adaptado para móviles

### ✅ **Módulo de Edición**
- **Formulario completo**: Mismos campos que el formulario principal
- **Carga automática**: Datos del formulario seleccionado
- **Validaciones**: Mismas validaciones que el formulario principal
- **Actualización**: Guarda cambios en la base de datos

### ✅ **Generación de PDF**
- **Librería**: jsPDF para documentos profesionales
- **Diseño corporativo**: Colores de marca y logo
- **Contenido completo**: Todos los datos del formulario
- **Descarga automática**: Archivo PDF listo para usar

## 🚀 **Instalación y Uso**

### **1. Instalar Dependencias**
```bash
npm install
```

### **2. Iniciar Servidor**
```bash
npm start
```

### **3. Acceder a la Aplicación**
- Abrir navegador en: http://localhost:3001

## 📊 **Estructura de la Base de Datos**

```sql
CREATE TABLE formularios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_number TEXT,
    full_name TEXT NOT NULL,
    department TEXT NOT NULL,
    start_date TEXT NOT NULL,
    hardware TEXT NOT NULL,
    trainings TEXT NOT NULL,           -- JSON array
    software_requirements TEXT NOT NULL, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 **Tecnologías Utilizadas**

### **Backend**
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **SQLite3**: Base de datos ligera
- **CORS**: Middleware para cross-origin requests

### **Frontend**
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsive
- **JavaScript**: Lógica del cliente
- **jsPDF**: Generación de documentos PDF

### **Base de Datos**
- **SQLite**: Base de datos embebida
- **JSON**: Almacenamiento de arrays en campos de texto

## 📝 **Flujo de Trabajo**

### **Crear Formulario**
1. Llenar formulario principal
2. Validar campos obligatorios
3. Generar PDF automáticamente
4. Guardar en base de datos
5. Mostrar mensaje de confirmación

### **Gestionar Formularios**
1. Acceder a lista de formularios
2. Ver todos los registros en tabla
3. Editar formulario existente
4. Eliminar formulario (con confirmación)
5. Actualizar lista en tiempo real

### **Editar Formulario**
1. Seleccionar formulario de la lista
2. Cargar datos en formulario de edición
3. Modificar campos necesarios
4. Guardar cambios en base de datos
5. Redirigir a lista actualizada

## 🎨 **Diseño**

- **Interfaz**: Moderna y limpia
- **Logo**: Logo corporativo en todas las páginas
- **Responsive**: Funciona en móviles y escritorio
- **Colores**: Azul corporativo (#007bff)
- **Tipografía**: Clara y legible
- **Interactividad**: Hover effects y transiciones suaves

## ✅ **Criterios de Aceptación Cumplidos**

- ✅ Formulario con todos los campos solicitados
- ✅ Base de datos SQLite con persistencia
- ✅ API REST completa para CRUD
- ✅ Módulo de lista de formularios
- ✅ Módulo de edición de formularios
- ✅ Generación de PDF profesional
- ✅ Validaciones frontend y backend
- ✅ Interfaz responsive y accesible
- ✅ Manejo de errores y mensajes
- ✅ Navegación entre módulos

## 🔄 **Notas Técnicas**

- **Base de datos**: Se crea automáticamente al iniciar el servidor
- **Archivo DB**: `formularios.db` en el directorio raíz
- **Puerto**: 3001 (configurable en server.js)
- **CORS**: Habilitado para desarrollo local
- **Validaciones**: Duplicadas en frontend y backend
- **PDF**: Generado en el cliente usando jsPDF

## 🎉 **¡Sistema Completo y Funcional!**

**El sistema está listo para uso en producción con todas las funcionalidades solicitadas:**

1. **Formulario principal** con validaciones
2. **Base de datos SQLite** para persistencia
3. **API REST** para operaciones CRUD
4. **Módulo de lista** para gestionar formularios
5. **Módulo de edición** para modificar registros
6. **Generación de PDF** profesional
7. **Interfaz responsive** y moderna

**¡Puedes empezar a usar el sistema inmediatamente!**






