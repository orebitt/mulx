import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Sphere {
    constructor(){
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.sushiModel

        this.model = this.resource.scene
        this.model.scale.set(1,1,1)
        this.scene.add(this.model)

        const geometry = new THREE.SphereGeometry( 13, 60, 40 );
        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale( - 1, 1, 1 );
        
        const imageSource = './images/test.png'
        const image = new Image()
        const texture = new THREE.Texture(image)
        image.addEventListener('load', () =>
        {
            texture.needsUpdate = true
        })
        image.src = imageSource
        const material = new THREE.MeshBasicMaterial( { map: texture } );
        // const material = new THREE.MeshBasicMaterial( { color: "red" } );

        const mesh = new THREE.Mesh( geometry, material );
        mesh.position.y += 4
        this.scene.add( mesh );


        // this.sushiGeometry, this.sushiMaterial = ... import glb file
    }
}