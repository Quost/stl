import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

var camera, scene, renderer, geometry, material, mesh, light1, stats;
init();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 100);
    camera.position.setScalar(10);
    camera.lookAt(scene.position);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);

    let controls = new OrbitControls(camera, renderer.domElement);

    // let box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
    // scene.add(box);

    // new code below

    xhr.open("GET", './assets/montagem-final.stl', true);
    xhr.responseType = "arraybuffer";
    xhr.send(null);

    // new code above

    let marker = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.25, 0.25, 0.5, 16), new THREE.MeshBasicMaterial({ color: "yellow" }));
    marker.geometry.translate(0, 0.25, 0);
    marker.position.set(0, 5, 0);
    scene.add(marker);

    let scaleVector = new THREE.Vector3();
    let scaleFactor = 10;

    renderer.setAnimationLoop(() => {
        let scale = scaleVector.subVectors(camera.position, marker.position).length() / scaleFactor;
        marker.scale.setScalar(scale);
        window.addEventListener("click", getClicked3DPoint);
        renderer.render(scene, camera);
    })
}


function getClicked3DPoint(e) {
    // alert("clicked");

    const canvas = renderer.domElement;
    const canvasPosition = $(canvas).position();
    const rayCaster = new THREE.Raycaster();
    let mousePosition = new THREE.Vector2();

    mousePosition.x = ((e.clientX - canvasPosition.left) / canvas.width) * 2 - 1;
    mousePosition.y = -((e.clientY - canvasPosition.top) / canvas.height) * 2 + 1;

    rayCaster.setFromCamera(mousePosition, camera);
    var intersects = rayCaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        console.log(intersects[0].point);
        return intersects[0].point;
    }
    return null;
}