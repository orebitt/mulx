import * as THREE from 'three'
import Controllers from './Controllers.js'

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

function onSelectStart() {
    this.guidingController = this;
    guidelight.intensity = 1;
    this.add(guideline);
    scene.add(guidesprite);
}

function onSelectEnd() {
    if (this.guidingController === this) {

        // teleport work out vector from feet to cursor

        // feet pos
        const feetPos = tempVec0;
        renderer.xr.getCamera(camera).getWorldPosition(feetPos);
        feetPos.y = 0;

        // cursor pos
        const cursorPos = tempVec1;
        const p = tempVecP;
        this.guidingController.getWorldPosition(p);
        const v = tempVecV;
        this.guidingController.getWorldDirection(v);
        v.multiplyScalar(6);
        const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;
        positionAtT(cursorPos,t,p,v,g);

        const offset = cursorPos;
        offset.addScaledVector(feetPos ,-1);

        // Do the locomotion
        locomotion(offset);

        // clean up
        this.guidingController = null;
        guidelight.intensity = 0;
        this.remove(guideline);
        scene.remove(guidesprite);
    }
}



export default class Locomotion
{
    constructor()
    {
        this.controller1 = Controllers.controller1
        this.controller2 = Controllers.controller2
        this.guidingController = null;

        // Once controllers are rendered
        if(this.controller1 && this.controller2){
            this.controller1.addEventListener('selectstart', onSelectStart);
            this.controller1.addEventListener('selectend', onSelectEnd);

            this.controller2.addEventListener('selectstart', onSelectStart);
            this.controller2.addEventListener('selectend', onSelectEnd);
        }
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
