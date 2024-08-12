const querystring = require('querystring');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
function validarToken(token) {
  const data = querystring.stringify({ authorization: token });

  return fetch('https://serviciostest.bitwan.info/api/public/checktoken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data
  })
    .then(response => response.json())
    .then(authorization => {
      // La solicitud fue exitosa, puedes acceder a los datos de la respuesta en `data`
      return authorization;
    })
    .catch(error => {
      // Ocurrió un error al hacer la solicitud POST
      throw error;
    });
}

module.exports = validarToken;