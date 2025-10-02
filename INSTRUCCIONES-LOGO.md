# 📸 **Cómo Usar una Imagen JPG como Logo**

## 🎯 **Pasos para Configurar tu Logo**

### **1. Preparar la Imagen**
- **Formato**: JPG, PNG, SVG
- **Tamaño recomendado**: 200x200 píxeles o más
- **Nombre**: `logo.jpg` (o el nombre que prefieras)

### **2. Colocar la Imagen**
Coloca tu archivo `logo.jpg` en la carpeta del proyecto:
```
Cursor-Project/
├── logo.jpg          ← Tu imagen aquí
├── index.html
├── list.html
├── edit.html
├── server.js
└── database.js
```

### **3. Configuración Actual**
El sistema ya está configurado para usar `logo.jpg`:

```css
.logo-icon {
    width: 60px;
    height: 60px;
    background-image: url('logo.jpg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}
```

### **4. Personalizar el Tamaño**
Si quieres cambiar el tamaño del logo:

```css
.logo-icon {
    width: 80px;        /* Ancho */
    height: 80px;       /* Alto */
    background-image: url('logo.jpg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}
```

### **5. Usar Diferente Nombre de Archivo**
Si tu imagen tiene otro nombre:

```css
.logo-icon {
    background-image: url('mi-logo.png');  /* Cambia aquí */
    /* resto del código igual */
}
```

### **6. Usar Imagen desde Internet**
Si quieres usar una imagen desde una URL:

```css
.logo-icon {
    background-image: url('https://ejemplo.com/mi-logo.jpg');
    /* resto del código igual */
}
```

## ✅ **¡Listo para Usar!**

**Solo necesitas:**
1. ✅ Colocar tu archivo `logo.jpg` en la carpeta del proyecto
2. ✅ El sistema automáticamente lo mostrará
3. ✅ Funciona en todas las páginas (formulario, lista, edición)

## 🔧 **Si No Aparece la Imagen**

### **Verificar:**
1. **Archivo existe**: ¿Está `logo.jpg` en la carpeta correcta?
2. **Nombre correcto**: ¿El nombre del archivo coincide exactamente?
3. **Formato válido**: ¿Es JPG, PNG o SVG?
4. **Permisos**: ¿El archivo se puede leer?

### **Alternativas:**
- Usar formato PNG: `logo.png`
- Usar formato SVG: `logo.svg`
- Usar URL externa: `url('https://...')`

## 🎨 **Personalización Adicional**

### **Cambiar Bordes:**
```css
.logo-icon {
    border-radius: 50%;  /* Logo circular */
    /* o */
    border-radius: 0;     /* Logo cuadrado */
}
```

### **Cambiar Sombra:**
```css
.logo-icon {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);  /* Sombra más fuerte */
    /* o */
    box-shadow: none;  /* Sin sombra */
}
```

### **Cambiar Fondo:**
```css
.logo-icon {
    background-color: white;  /* Fondo blanco */
    padding: 5px;             /* Espacio alrededor */
}
```

**¡Tu logo personalizado estará listo!** 🎉
