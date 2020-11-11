const { iniciarServidor } = require('./src/config/app')
const { iniciarBaseDeDatos } = require('./src/config/database')

function main(){
    iniciarBaseDeDatos()
    iniciarServidor()
}

main()