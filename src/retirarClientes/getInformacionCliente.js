function getInformacionClientes(numeroCedulaRetirar,token) {
    
   

    const body = new URLSearchParams();
    body.set('numeroservicio', numeroCedulaRetirar);
    body.set('authorization' , token)

    return fetch('http://104.131.8.122:8000/servicios/getserviciobynumero', {
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
        
    });
}


module.exports = getInformacionClientes;