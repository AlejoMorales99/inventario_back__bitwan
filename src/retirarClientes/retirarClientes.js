function getClientes(token,numServicio) {
   
   console.log(token,numServicio);

    const body = new URLSearchParams();
    body.set('json', JSON.stringify({"claseservicio":[],"status":[],"criteria":["nservicio"],"value":numServicio,"page":0,"limit":10}));
    body.set('authorization' , token)

    return fetch('https://www.bitwan.info/api/public/servicios/searchserviciobycriteria', {
        method: 'POST',
        body: body
    })
    .then(response => response.json())
    .then(authorization => {
        // La solicitud fue exitosa, puedes acceder a los datos de la respuesta en `data`
        return authorization;
    })
    .catch(error => {
        // Ocurrió un error al hacer la solicitud POST
        throw error;
    }).finally(() => {
        // Restaura el comportamiento predeterminado de Node.js para la verificación de certificados
        
    });
}


module.exports = getClientes;