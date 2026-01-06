# Imagen base con Node
FROM node:20

# Carpeta de trabajo dentro del contenedor
WORKDIR /app/frontend

# Copiamos package.json y package-lock.json
COPY frontend/package*.json ./

# Instalamos dependencias
RUN npm install

# Exponemos el puerto de desarrollo
EXPOSE 3000

# Comando para iniciar el dev server
CMD ["npm", "start"]
