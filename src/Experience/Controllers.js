import * as THREE from 'three'
import Experience from './Experience.js'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

// Utility Vectors
/*
const g = new Vector3(0,-9.8,0);
const tempVec0 = new Vector3();
const tempVec1 = new Vector3();
const tempVecP = new Vector3();
const tempVecV = new Vector3();
*/

export default class Controllers
{
    constructor()
    {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.renderer = this.experience.renderer
        
        
        this.controller1 = this.renderer.instance.xr.getController( 0 );
        var audio = new Audio('audio/common_voice_en_10.mp3');
        // audio.play();    
        const onSelectStart = function(){
            console.log("playing trigger");
            audio.play();
        }
        const onSelectEnd = function(){
            pass
        }
        //this.controller1.addEventListener( 'selectstart', onSelectStart );
        //this.controller1.addEventListener( 'selectend', onSelectEnd );
        this.scene.add( this.controller1 );
        
        this.controller2 = this.renderer.instance.xr.getController( 1 );
        //this.controller2.addEventListener( 'selectstart', onSelectStart );
        //this.controller2.addEventListener( 'selectend', onSelectEnd );
        this.scene.add( this.controller2 );
        
        

        this.controllerModelFactory = new XRControllerModelFactory()

        this.controllerGrip1 = this.renderer.instance.xr.getControllerGrip( 0 )
        this.controllerGrip1.add( this.controllerModelFactory.createControllerModel( this.controllerGrip1 ) )
        this.scene.add( this.controllerGrip1 )

        this.controllerGrip2 = this.renderer.instance.xr.getControllerGrip( 1 )
        this.controllerGrip2.add( this.controllerModelFactory.createControllerModel( this.controllerGrip2 ) )
        this.scene.add( this.controllerGrip2 )

        //new code (Soruce: https://github.com/SamsungInternet/xr-locomotion-starter/blob/898fdc07f59f54c6585533e75d76ebe3f4840219/src/lib/controllers/controllers.js)
        /*
        
        const lineSegments=10;
        const lineGeometry = new BufferGeometry();
        const lineGeometryVertices = new Float32Array((lineSegments +1) * 3);

        lineGeometryVertices.fill(0);

        lineGeometry.setAttribute('position', new 

        BufferAttribute(lineGeometryVertices, 3));

        const lineMaterial = new LineBasicMaterial({ color: 0x888888, blending: AdditiveBlending });

        const guideline = new Line( lineGeometry, lineMaterial );

        // Controller start position
        const p = guidingController.getWorldPosition(tempVecP);

        // Set Vector V to the direction of the controller, at 1m/s
        const v = guidingController.getWorldDirection(tempVecV);

        // Scale the initial velocity to 6m/s
        v.multiplyScalar(6);

        // Calculate t, this is the above equation written as JS
        const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;

        const vertex = tempVec.set(0,0,0);

        for (let i=1; i<=lineSegments; i++) {

            // set vertex to current position of the virtual ball at time t
            positionAtT(vertex,i*t/lineSegments,p,v,g);

            // Copy it to the Array Buffer
            vertex.toArray(lineGeometryVertices,i*3);
        }

        guideline.geometry.attributes.position.needsUpdate = true;



        function positionAtT(inVec,t,p,v,g) {

            inVec.copy(p);
            inVec.addScaledVector(v,t);
            inVec.addScaledVector(g,0.5*t**2);
            return inVec;
          }
        */
        // end new code
          

    }

    setInstance()
    {

    }

    resize()
    {
    }

    update()
    {
    }
}