import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

var camera, scene, renderer, geometry, material, mesh, light1, stats,
    canvas, pickHelper;
const idToObject = {},
    pickingScene = new THREE.Scene(),
    pickPosition = { x: 0, y: 0 },
    mensagens = new Array(),
    helper = new Array(),
    info = new Array();
clearPickPosition();

init();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 100);
    camera.position.setScalar(10);
    camera.lookAt(scene.position);
    camera.position.z = 25;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(innerWidth, innerHeight);
    canvas = renderer.domElement;
    document.body.appendChild(canvas);

    let controls = new OrbitControls(camera, canvas);

    let box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
    scene.add(box);

    class GPUPickHelper {
        constructor() {
            // create a 1x1 pixel render target
            this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
            this.pixelBuffer = new Uint8Array(4);
            this.pickedObject = null;
            this.pickedObjectSavedColor = 0;
        }
        pick(cssPosition, scene, camera) {
            const { pickingTexture, pixelBuffer } = this;

            // restore the color if there is a picked object
            if (this.pickedObject) {
                this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
                this.pickedObject = undefined;
            }

            // set the view offset to represent just a single pixel under the mouse
            const pixelRatio = renderer.getPixelRatio();
            camera.setViewOffset(
                renderer.getContext().drawingBufferWidth, // full width
                renderer.getContext().drawingBufferHeight, // full top
                cssPosition.x * pixelRatio | 0, // rect x
                cssPosition.y * pixelRatio | 0, // rect y
                1, // rect width
                1, // rect height
            );
            // render the scene
            renderer.setRenderTarget(pickingTexture);
            renderer.render(scene, camera);
            renderer.setRenderTarget(null);
            // clear the view offset so rendering returns to normal
            camera.clearViewOffset();
            //read the pixel
            renderer.readRenderTargetPixels(
                pickingTexture,
                0, // x
                0, // y
                1, // width
                1, // height
                pixelBuffer);

            const id =
                (pixelBuffer[0] << 16) |
                (pixelBuffer[1] << 8) |
                (pixelBuffer[2]);

            const intersectedObject = idToObject[id];
            if (intersectedObject) {
                // pick the first object. It's the closest one
                this.pickedObject = intersectedObject;
                // save its color
                this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
                // set its emissive color to flashing red/yellow
                this.pickedObject.material.emissive.setHex((8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
            }
            return (id);
        }
    }

    pickHelper = new GPUPickHelper();
    let i = 1;

    let marker = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.25, 0.25, 0.5, 16), new THREE.MeshBasicMaterial({ color: "#FFFF00" }));
    marker.geometry.translate(0, 0.25, 0);
    marker.position.set(0, 5, 0);
    marker.name = i;
    scene.add(marker);
    idToObject[i] = marker;
    mensagens[i] = "Painel A9-41\nTemperatura: 40ºC\nFuncionamento: ok."
    helper[i] = 0;

    const pickingMarker = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.25, 0.25, 0.5, 16), new THREE.MeshBasicMaterial({ color: "#FFFF22" }));
    pickingScene.add(pickingMarker);
    pickingMarker.position.copy(marker.position);
    pickingMarker.rotation.copy(marker.rotation);
    pickingMarker.scale.copy(marker.scale);

    let scaleVector = new THREE.Vector3();
    let scaleFactor = 10;

    renderer.setAnimationLoop(() => {
        let scale = scaleVector.subVectors(camera.position, marker.position).length() / scaleFactor;
        marker.scale.setScalar(scale);
        pickingMarker.scale.setScalar(scale);
        window.addEventListener('mousemove', setPickPosition);
        window.addEventListener("click", displayInfo);
        window.addEventListener('mouseout', clearPickPosition);
        window.addEventListener('mouseleave', clearPickPosition);
        window.addEventListener('touchstart', (event) => {
            // prevent the window from scrolling
            event.preventDefault();
            setPickPosition(event.touches[0]);
        }, { passive: false });

        window.addEventListener('touchmove', (event) => {
            setPickPosition(event.touches[0]);
        });

        window.addEventListener('touchend', clearPickPosition);
        renderer.render(scene, camera);
        // renderer.render(pickingScene, camera);
    })
}

function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height,
    };
}

function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = pos.x;
    pickPosition.y = pos.y;
}

function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    pickPosition.x = -100000;
    pickPosition.y = -100000;
}

function displayInfo() {
    let i = 1;
    let pickedObjectId = pickHelper.pick(pickPosition, pickingScene, camera);
    if (pickedObjectId > 0) {
        if (helper[i] == 0) {
            var object = scene.getObjectByName(i);
            alert(object.name);
            var loader = new THREE.FontLoader();
            loader.load('https://threejs.org/examples/fonts/gentilis_regular.typeface.json', function(font) {
                var geometry = new THREE.TextGeometry(mensagens[i], {
                    font: font,
                    size: 0.5,
                    height: 0.2,
                    curveSegments: 4,
                    bevelEnabled: true,
                    bevelThickness: 0.02,
                    bevelSize: 0.05,
                    bevelSegments: 3
                });
                geometry.center();
                var material = new THREE.MeshNormalMaterial();
                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 2;
                object.add(mesh);
                info[i] = mesh;
                helper[i] = 1;
                renderer.render(scene, camera);
            });
        } else if (helper[i] == 1) {
            info[i].visible = false;
            helper[i] = 2;
        } else {
            info[i].visible = true;
            helper[i] = 1;
        }
    }
}