import * as THREE from 'three'
export default class Socket{
    constructor(){
        this.connection = new WebSocket('wss://k42olxgw0i.execute-api.us-west-2.amazonaws.com/production')
        this.connected = false
        console.log('attempting ws connection')
        this.connection.addEventListener('open', e => {
          console.log('WebSocket is connected')
          console.log(this.socket)
          this.connected = true
        //Create the head, left, right of the person
        const geometry = new THREE.BoxGeometry( 0.3, 0.3, 0.3 );
        const lrmaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const hmaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );

        this.head = new THREE.Mesh( geometry, hmaterial );
        this.left = new THREE.Mesh( geometry, lrmaterial );
        this.right = new THREE.Mesh( geometry, lrmaterial );

        this.inScene = false
        this.pending = false
        })



        this.connection.addEventListener('close', e => {
          console.log('WebSocket is closed')
          this.connected = false
        })
        
        this.connection.addEventListener('error', e => {
          console.error('WebSocket is in error', e)
          this.connected = false
        })

        this.fin_msg = {}



    }
}
