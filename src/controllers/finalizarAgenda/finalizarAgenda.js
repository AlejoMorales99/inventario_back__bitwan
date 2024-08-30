const querystring = require('querystring');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
function finalizarAgenda(token,idAgenda) {

    const finalagenda = {
        fechafinal: new Date().getTime(),
        coordenadas: "39.9390731,116.1172782",
        idoperacion: 32510,
        idagenda: idAgenda
    }

    let formData = new FormData();

    formData.append('authorization',token)
    formData.append('json',JSON.stringify(finalagenda))


  return fetch('https://serviciostest.bitwan.info/api/public/operacionesservicios/edit', {
    method: 'POST',
    body: formData
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

module.exports = finalizarAgenda;