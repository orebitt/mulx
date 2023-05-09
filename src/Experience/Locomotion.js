import * as THREE from 'three'
import Controllers from './Controllers.js'
import Experience from './Experience.js'

// Utility Vectors
const g = new THREE.Vector3(0,-9.8,0);
const tempVec0 = new THREE.Vector3();
const tempVec1 = new THREE.Vector3();
const tempVecP = new THREE.Vector3();
const tempVecV = new THREE.Vector3();

//guiding controller
let guidingController = null;


// The guideline
const lineSegments=10;
const lineGeometry = new THREE.BufferGeometry();
const lineGeometryVertices = new Float32Array((lineSegments + 1) * 3);
lineGeometryVertices.fill(0);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888, blending: THREE.AdditiveBlending });
const guideline = new THREE.Line( lineGeometry, lineMaterial );

// The light at the end of the line
const guidelight = new THREE.PointLight(0xffeeaa, 0, 2);

// The target on the ground
const guidespriteTexture = new THREE.TextureLoader().load('images/target.png');
const guidesprite = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3, 1, 1),
    new THREE.MeshBasicMaterial({
        map: guidespriteTexture,
        blending: THREE.AdditiveBlending,
        color: 0x555555,
        transparent: true
    })
);
guidesprite.rotation.x = -Math.PI/2;

// Guideline parabola function
function positionAtT(inVec,t,p,v,g) {
    inVec.copy(p);
    inVec.addScaledVector(v,t);
    inVec.addScaledVector(g,0.5*t**2);
    return inVec;
}


function onSelectStart() {
    console.log('start selected')
    const controller = this;
    guidingController = controller;
    guidelight.intensity = 1;
    window.experience.scene.add(guideline);
    window.experience.scene.add(guidesprite);
}


function onSelectEnd() {
    if (guidingController === this) {

        // teleport work out vector from feet to cursor

        // feet pos

        //window.expreience.camera, window.experience.renderer
        console.log(window.experience.camera, "camera")
        console.log(window.experience.renderer.instance.xr, "instance")
        //console.log(console.log(window.experience.renderer.instance.xr.getCamera()), "xr getCamera alternative?")
        //console.log(window.experience.renderer.instance.xr.getCamera(window.experience.camera)); //window is weird way
        console.log('0')
        const feetPos = window.experience.camera.instance.position;
        console.log(feetPos)
        feetPos[1] = 0; // feetPos.y = 0

        console.log('1')

        // cursor pos
        const cursorPos = tempVec1;
        let p = tempVecP;
        p = guidingController.getWorldPosition(p);
        let v = tempVecV;
        v = guidingController.getWorldDirection(v);
        v.multiplyScalar(6);
        let t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;
        cursorPos = positionAtT(cursorPos,t,p,v,g);
        console.log('2')

        let offset = cursorPos;
        offset.addScaledVector(feetPos ,-1);
        console.log('3')

        window.experience.camera.position.add(offset); // do teleportation?

        // clean up
        guidingController = null;
        guidelight.intensity = 0;
        window.experience.scene.remove(guideline);
        window.experience.scene.remove(guidesprite);
        console.log('4')
    }
}



export default class Locomotion
{
    constructor()
    {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer
        this.scene = this.experience.scene
        console.log(this.scene, "Scene")
        console.log("Creating Locomotion")
        console.log(this.camera, "another camera???")

        this.controller1 = this.renderer.instance.xr.getController( 0 );

        this.controller2 = this.renderer.instance.xr.getController( 1 );

        // Once controllers are rendered
        if(this.controller1 && this.controller2){
            this.controller1.addEventListener('selectstart', onSelectStart);
            this.controller1.addEventListener('selectend', onSelectEnd);

            this.controller2.addEventListener('selectstart', onSelectStart);
            this.controller2.addEventListener('selectend', onSelectEnd);
        }

        console.log("testing", this.controller1)
        console.log(this.controller2)
    }
    calculateLocomotion(){
        console.log('locomoting!')
        console.log(guidingController)
        if (guidingController) {
            // Controller start position
            const p = tempVecP;
            p = guidingController.getWorldPosition(p);
    
            // virtual tele ball velocity
            const v = tempVecV;
            v = guidingController.getWorldDirection(v);
            v.multiplyScalar(6);
    
            // Time for tele ball to hit ground
            const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;
    
            const vertex = tempVec0.set(0,0,0);    
            for (let i=1; i<=lineSegments; i++) {
    
                // Current position of the virtual ball at time t, written to the variable 'to'
                positionAtT(vertex,i*t/lineSegments,p,v,g);
                guidingController.worldToLocal(vertex);
                vertex.toArray(lineGeometryVertices,i*3);
            }
            console.log(guideline)
            //guideline needs to be fixed
            //guideline.geometry.attributes.position.needsUpdate = true; 
            
            // Place the light near the end of the poing
            positionAtT(guidelight.position,t*0.98,p,v,g);
            positionAtT(guidesprite.position,t*0.98,p,v,g);
        } else {
            console.log('gyah! not locomoting!')
        }
    
    }
}
