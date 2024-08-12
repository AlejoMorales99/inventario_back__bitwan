const {Router} = require('express');
const {getWifi,postWifi,getOneWifi,wifiEditar} = require('../../controllers/wi-fi/wi-fiController');
const router = Router();


router.get('/api/getWifi', getWifi )

router.get('/api/getOneWifi/:id', getOneWifi )

router.post('/api/postWifi', postWifi )

router.put('/api/wifiEditar', wifiEditar )

module.exports = router;