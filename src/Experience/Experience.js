import * as THREE from 'three'
import Debug from './Utils/Debug.js'
import Sizes from "./Utils/Sizes.js"
import Time from './Utils/Time.js'
import Socket from './Utils/Socket.js'
import Resources from './Utils/Resources.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import sources from './sources.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import Controllers from './Controllers.js'

let instance = null

export default class Experience
{
    constructor(canvas){
        if (instance){
            return instance
        }
        instance = this
        // Global access
        window.experience = this
        this.canvas = canvas
        this.debug = new Debug()
        this.sampleBoolean = true
        this.sampleNumber = 5
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('experience')
            const debugObject = {
                sampleBoolean: this.sampleBoolean,
                sampleNumber: this.sampleNumber
            }
            this.debugFolder.add(debugObject, 'sampleBoolean').onChange( value =>{
                this.sampleBoolean = value
                console.log(this.sampleBoolean)
            })
            this.debugFolder.add(debugObject, 'sampleNumber').min(0.5).max(15).onChange( value =>{
                this.sampleNumber = value
                console.log(this.sampleNumber)
            })
        }
        this.sizes = new Sizes()
        this.time = new Time()
        this.lastUpdated = this.time.current
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.world = new World()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.socket = new Socket()
        console.log('Starting connection to', this.socket)

        // Once message is sent, wait for response
        this.socket.connection.addEventListener('message', e => {
            // console.log('WebSocket received a message:', e)
            this.socket.fin_msg = JSON.parse(e.data).message
            this.renderFriends(this.socket.fin_msg)             
            
            })

        this.renderer.instance.xr.enabled = true;
        document.body.appendChild( VRButton.createButton( this.renderer.instance ) );
        this.renderer.instance.setAnimationLoop( ()=> {
            this.renderer.instance.render( this.scene, this.camera.instance );
        });


        this.controllers = new Controllers()


        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.INTERSECTED = null
        window.addEventListener('mousemove', (event) =>
        {
            this.mouse.x = event.clientX / this.sizes.width * 2 - 1
            this.mouse.y = - (event.clientY / this.sizes.height) * 2 + 1
        })
        window.addEventListener('click', () =>
        {
            if(this.INTERSECTED)
            {
                // do something here if there is something in this.INTERSECTED
            }
        })
        this.sizes.on('resize', ()=>
        {
            this.resize()
            this.camera.resize()
            this.renderer.resize()
        })
        this.time.on('tick', ()=>
        {
            this.update()
            console.log(this.time.current)
            // Should be modified to a global tick value so that all requests can be sent at the same time.
            if(this.time.current % 100 == 0){
                this.getInfo()
            }
        })
        
        

    }

    resize()
    {
        console.log('resized occured')
        this.camera.resize()
    }
    update()
    {
        this.camera.update()
        // this.renderer.update()
        this.world.update()
        console.log(". ", this.time.current)

        // this.world.circles.undulate(this.time.elapsed)
        // this.world.hypercube.wub(this.time.elapsed)
        //https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_cubes.html
        
        //change this to be controller if controller is active
        this.raycaster.setFromCamera( this.mouse, this.camera.instance );
        // console.log(this.mouse)
        // TODO, make raycaster its own class
        // const intersects = this.raycaster.intersectObjects( this.scene.children, false );
        // if ( intersects.length > 0 ) {
        //     if ( this.INTERSECTED != intersects[ 0 ].object ) {
        //         if ( this.INTERSECTED ) this.INTERSECTED.material.color.setHex( this.INTERSECTED.currentHex );
        //         this.INTERSECTED = intersects[ 0 ].object;
        //         this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
        //         this.INTERSECTED.material.color.setHex( 0xff0000 );

        //     }
        // } else {

        //     if ( this.INTERSECTED ) this.INTERSECTED.material.color.setHex( this.INTERSECTED.currentHex );

        //     this.INTERSECTED = null;

        // }
    }
    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) =>
        {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                // Loop through the material properties
                for(const key in child.material)
                {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })
        this.camera.controls.dispose()
        this.renderer.instance.dispose()
        if(this.debug.active)
        {
            this.debug.ui.destroy()
        }
            
    }
    getInfo(){
        let buttonState = document.getElementById("VRButton").innerHTML

        console.log(this.socket.connected)
        if (!this.socket.connected){
            console.log('Trying to connect...')
        }else{
            let msg = {"name": "A", "c1": [1,1,1], "c2": [1,1,1], "hmd": [1,1,1]}
            msg = JSON.stringify(msg)
            console.log(JSON.parse(msg))
            this.payload = {
                action: 'message',
                msg
            }
            console.log('sending')
            console.log(this.socket)
            if (buttonState != "ENTER VR"){
                console.log(buttonState)
                }
            else{
                console.log("not in vr. not sending.")
            }
        }
          
        console.log("Calling Controller/Head Data:")
        //If you haven't clicked "ENTER VR" button, then data won't be recorded or sent.
        if (buttonState != "ENTER VR"){
            
            //To Do: Stringify when passing to node server
            try{
            let grip0 = this.renderer.instance.xr.getControllerGrip(0)?.position?.toArray()
            let grip1 = this.renderer.instance.xr.getControllerGrip(1)?.position?.toArray()
            let hmd = this.camera.instance.position?.toArray()
            console.log("Grip 0", grip0)
            console.log("Grip 1", grip1)
            //console.log("Grip 0 Forward", this.renderer.instance.xr.getController(0))
            //console.log("Grip 1 Forward", this.renderer.instance.xr.getController(1))   
            console.log("Head 0", hmd)

            let msg = {"c0": grip0, "c1": grip1, "hmd": hmd}
            msg = JSON.stringify(msg)
            console.log(JSON.parse(msg))
            this.payload = {
                action: 'message',
                msg
            }
            this.socket.connection.send(JSON.stringify(this.payload))
      

            } catch(err){
                console.log("Finding data failed. Error: , websocket not sent", err)
            }
        } else {
            console.log("Not in VR mode. Data not called.")
        }
    }
    renderFriends(msg){
        
        if(this.socket.connected === true && this.socket.inScene === false){ // On connect, add to scene
            console.log('adding objs from scene')
            this.scene.add(this.socket.head)
            this.scene.add(this.socket.left)
            this.scene.add(this.socket.right)
            this.socket.head.position.set(100,0,0)
            this.socket.left.position.set(100,0,0)
            this.socket.right.position.set(100,0,0)
            this.socket.inScene = true
        } else if (this.socket.connected === true){ // While connected, modify positions
            console.log("loading za", msg)
            let positionDict = {}
            for (var key in msg){
                console.log('haii!')
                for (var positions in msg[key]){
                    console.log('printing key')
                    console.log('key: ', positions, "val: ", msg[key][positions])
                    console.log('before', positionDict, positions)
                    positionDict[positions.toString()] = msg[key][positions]
                    console.log('after', positionDict, positions)
                }
            }
            console.log('printing positiondict')
            console.log(positionDict)
            var isMyObjectEmpty = Object.keys(positionDict).length === 0;
            if (!isMyObjectEmpty){
                console.log("not empty", positionDict)
                this.socket.head.position.set(positionDict['hmd'][0], positionDict['hmd'][1], positionDict['hmd'][2])
                this.socket.left.position.set(positionDict['leftC'][0], positionDict['leftC'][1], positionDict['leftC'][2])
                this.socket.right.position.set(positionDict['rightC'][0], positionDict['rightC'][1], positionDict['rightC'][2])
            } else{
                console.log("PositionDict empty. Not updating information.")
            }
        } else if (this.socket.connected === false){ // On disconnect, remove objects from scene
            console.log('removing objs from scene')
            try{
                this.scene.remove(this.socket.head)
                this.scene.remove(this.socket.left)
                this.scene.remove(this.socket.right)
            } catch(error){
                console.log("Trying to remove objects that don't exist", error)
            }
            this.socket.inScene = false

        }
    }
}
