import * as THREE from 'three'
import Controllers from './Controllers.js'
import Experience from './Experience.js'

// Utility Vectors
const g = new THREE.Vector3(0,-9.8,0);
const tempVec0 = new THREE.Vector3();
const tempVec1 = new THREE.Vector3();
const tempVecP = new THREE.Vector3();
const tempVecV = new THREE.Vector3();

// The guideline
const lineSegments=10;
const lineGeometry = new THREE.BufferGeometry();
const lineGeometryVertices = new Float32Array((lineSegments +1) * 3);
lineGeometryVertices.fill(0);
const lineGeometryColors = new Float32Array((lineSegments +1) * 3);
lineGeometryColors.fill(0.5);
lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineGeometryVertices, 3));
lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineGeometryColors, 3));
const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });
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
    this.guidingController = this;
    guidelight.intensity = 1;
    window.experience.scene.add(guideline);
    window.experience.scene.add(guidesprite);
}


function onSelectEnd() {
    if (this.guidingController === this) {

        // teleport work out vector from feet to cursor

        // feet pos

        //window.expreience.camera, window.experience.renderer
        console.log(feetPos)
        console.log(window.experience.camera, "camera")
        console.log(window.experience.renderer.instance.xr, "instance")
        //console.log(console.log(window.experience.renderer.instance.xr.getCamera()), "xr getCamera alternative?")
        //console.log(window.experience.renderer.instance.xr.getCamera(window.experience.camera)); //window is weird way
        console.log('0')
        const feetPos = window.experience.camera.position;
        feetPos.y = 0;

        console.log('1')

        // cursor pos
        const cursorPos = tempVec1;
        const p = tempVecP;
        this.guidingController.getWorldPosition(p);
        const v = tempVecV;
        this.guidingController.getWorldDirection(v);
        v.multiplyScalar(6);
        const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;
        positionAtT(cursorPos,t,p,v,g);
        console.log('2')

        const offset = cursorPos;
        offset.addScaledVector(feetPos ,-1);
        console.log('3')

        // clean up
        this.guidingController = null;
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
        this.guidingController = null;

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
        if (this.guidingController) {
            // Controller start position
            const p = tempVecP;
            this.guidingController.getWorldPosition(p);
    
            // virtual tele ball velocity
            const v = tempVecV;
            this.guidingController.getWorldDirection(v);
            v.multiplyScalar(6);
    
            // Time for tele ball to hit ground
            const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;
    
            const from = tempVec0;
            const to = tempVec1;
    
            from.set(0,0,0);
            for (let i=1; i<=lineSegments; i++) {
    
                // Current position of the virtual ball at time t, written to the variable 'to'
                positionAtT(to,i*t/lineSegments,p,v,g);
                this.guidingController.worldToLocal(to);
                to.toArray(lineGeometryVertices,i*3);
            }
            guideline.geometry.attributes.position.needsUpdate = true;
            
            // Place the light near the end of the poing
            positionAtT(guidelight.position,t*0.98,p,v,g);
            positionAtT(guidesprite.position,t*0.98,p,v,g);
        }
    
    }
}
