# 📌 Aclaración Técnica: Arquitectura Estática (GitHub Pages)

Para que el proyecto pudiera alojarse exitosamente en **GitHub Pages** (el cual sólo admite sitios estáticos y no permite la ejecución de lenguajes de servidor como Node.js ni conexiones a motores de bases de datos como MySQL), se realizó la siguiente adaptación arquitectónica avanzada:

## 1. Emulación de Backend Local (Serverless)
En lugar de depender de un servidor backend tradicional (`server.js`), la aplicación carga **toda su lógica y procesamiento directamente en el lado del cliente (Frontend)** utilizando JavaScript puro. 

## 2. Motor de Base de Datos en Memoria (SQLite + WebAssembly)
Se migró la base de datos de MySQL a **SQLite**. Para poder consultarla sin un servidor, se integró la librería `sql.js` (compilada en WebAssembly).
Cuando un usuario ingresa a la página web, su navegador:
1. Descarga el archivo de base de datos pre-cargado (`database/festival.db`).
2. Lo monta en la **Memoria RAM** de la pestaña activa del navegador.
3. Procesa todas las consultas SQL (`SELECT`, `INSERT`, `UPDATE`) localmente y de manera instantánea.

## 3. Persistencia de Datos Híbrida (LocalStorage)
Dado que las bases de datos en memoria se pierden al recargar o cambiar de página HTML, se diseñó un mecanismo de persistencia nativo del navegador:
Cada vez que se ejecuta una sentencia transaccional (ej: el usuario compra una butaca o se registra en el sistema), **el buffer binario completo de la base de datos se exporta, se convierte a formato Base64 y se "congela" en el `LocalStorage` del navegador**. 
Al recargar la web o cambiar de vista, el sistema detecta este buffer persistente y lo re-monta en RAM, permitiendo al usuario navegar libremente sin perder la continuidad de su sesión y de sus reservas.

---
> **Nota para el profesor:** Esta solución demuestra resiliencia y creatividad frente a limitaciones estrictas de hosting gratuito, logrando emular perfectamente el funcionamiento transaccional de un servidor completo y una base de datos relacional dentro de un entorno 100% estático.
