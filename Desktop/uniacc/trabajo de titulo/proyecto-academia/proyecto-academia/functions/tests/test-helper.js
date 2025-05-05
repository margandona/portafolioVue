/**
 * Utilidad simple para ayudar a ejecutar pruebas de API
 */

/**
 * Reemplaza las variables en una URL o cuerpo de solicitud
 * @param {string|Object} content - URL o cuerpo a procesar
 * @param {Object} variables - Variables a reemplazar
 * @returns {string|Object} - Contenido con variables reemplazadas
 */
function replaceVariables(content, variables) {
  if (typeof content === 'string') {
    let result = content;
    
    // Reemplazar todas las variables en formato {{VARIABLE}}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, variables[key]);
    });
    
    return result;
  } 
  else if (typeof content === 'object' && content !== null) {
    // Si es un objeto, convertirlo a string, reemplazar y volver a objeto
    const stringified = JSON.stringify(content);
    const processed = replaceVariables(stringified, variables);
    return JSON.parse(processed);
  }
  
  return content;
}

/**
 * Guarda una variable para uso posterior
 * @param {Object} variables - Objeto que guarda las variables
 * @param {string} name - Nombre de la variable
 * @param {any} value - Valor a guardar
 */
function saveVariable(variables, name, value) {
  variables[name] = value;
  console.log(`Variable guardada: ${name} = ${value}`);
}

/**
 * Convierte objeto de parámetros en string de query
 * @param {Object} params - Parámetros para la URL
 * @returns {string} - String para query de URL
 */
function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) return '';
  
  const parts = [];
  for (const key in params) {
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  }
  
  return '?' + parts.join('&');
}

/**
 * Función para simular una solicitud HTTP con Node.js nativo
 * @param {Object} requestConfig - Configuración de la solicitud
 * @param {Object} variables - Variables a reemplazar
 * @returns {Promise<Object>} - Respuesta
 */
async function makeRequest(requestConfig, variables = {}) {
  const http = require('http');
  const https = require('https');
  const url = require('url');
  
  return new Promise((resolve, reject) => {
    try {
      // Reemplazar variables en la URL y cuerpo
      const processedUrl = replaceVariables(requestConfig.url, variables);
      const method = requestConfig.method || 'GET';
      const headers = { ...requestConfig.headers };
      let body = null;
      
      // Procesar los headers
      if (headers) {
        Object.keys(headers).forEach(key => {
          headers[key] = replaceVariables(headers[key], variables);
        });
      }
      
      // Procesar el cuerpo si existe
      if (requestConfig.body) {
        body = replaceVariables(requestConfig.body, variables);
        
        if (typeof body === 'object') {
          body = JSON.stringify(body);
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
        }
        
        if (!headers['Content-Length']) {
          headers['Content-Length'] = Buffer.byteLength(body);
        }
      }
      
      // Parsear la URL
      const parsedUrl = url.parse(processedUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.path,
        method,
        headers
      };
      
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          let responseBody;
          
          try {
            responseBody = JSON.parse(data);
          } catch (e) {
            responseBody = data;
          }
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseBody
          });
        });
      });
      
      req.on('error', (e) => {
        reject(e);
      });
      
      if (body) {
        req.write(body);
      }
      
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Imprime una solicitud en formato curl para debug
 * @param {Object} requestConfig - Configuración de la solicitud
 * @param {Object} variables - Variables a reemplazar
 * @returns {string} - Comando curl
 */
function toCurl(requestConfig, variables = {}) {
  // Reemplazar variables
  const url = replaceVariables(requestConfig.url, variables);
  const method = requestConfig.method || 'GET';
  const headers = { ...requestConfig.headers };
  let body = requestConfig.body 
    ? replaceVariables(requestConfig.body, variables)
    : null;
  
  // Inicio del comando curl
  let curl = `curl -X ${method} "${url}"`;
  
  // Agregar headers
  if (headers) {
    Object.keys(headers).forEach(key => {
      const value = replaceVariables(headers[key], variables);
      curl += ` -H "${key}: ${value}"`;
    });
  }
  
  // Agregar cuerpo
  if (body) {
    if (typeof body === 'object') {
      body = JSON.stringify(body);
    }
    curl += ` -d '${body}'`;
  }
  
  return curl;
}

module.exports = {
  replaceVariables,
  saveVariable,
  buildQueryString,
  makeRequest,
  toCurl
};
