# Dockerfile para Frontend
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar aplicación
RUN npm run build

# Exponer puerto
EXPOSE 5173

# Comando de inicio para desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]






