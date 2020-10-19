import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

var tipoTextoAnterior = new Array(1, 1, 1),
    tipoTexto = new Array(1, 1, 1),
    pickHelper,
    buttons,
    camera,
    scene,
    numObjects;

const canvas = document.querySelector('#c'),
    renderer = new THREE.WebGLRenderer({ canvas }),
    raycaster = new THREE.Raycaster(),
    pickingScene = new THREE.Scene(),
    pickingMarker = new Array(),
    arrayElements = new Array(),
    tempV = new THREE.Vector3(),
    mouse = new THREE.Vector2(),
    projector = { x: 0, y: 0 },
    mensagens = new Array(),
    elements = new Array(),
    helper = new Array(),
    info = new Array(),
    idToObject = {},
    ids = {};

carregaBotoes();
pegarDadosXML();

function init(infoElementos) {

    console.log(infoElementos);

    const titulos = (infoElementos.getElementsByTagName("titulo"));
    numObjects = titulos.length;
    console.log(numObjects);
    const posx = (infoElementos.getElementsByTagName("posx"));
    const posy = (infoElementos.getElementsByTagName("posy"));
    const posz = (infoElementos.getElementsByTagName("posz"));
    const temp = (infoElementos.getElementsByTagName("temperatura"));
    const func = (infoElementos.getElementsByTagName("funcionamento"));

    class elemento {
        constructor(id) {
            this.id = id;
            this.marker = "";
            this.titulo = titulos[id].firstChild.nodeValue;
            console.log(this.titulo)
            this.posx = posx[id].firstChild.nodeValue;
            this.posy = posy[id].firstChild.nodeValue;
            this.posz = posz[id].firstChild.nodeValue;
            this.temp = temp[id].firstChild.nodeValue;
            this.func = func[id].firstChild.nodeValue;
            this.elem = "";
            this.show = "";
        }
    }

    for (let i = 0; i < numObjects; i++) {
        arrayElements[i] = new elemento(i);
    }

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
    camera.position.setScalar(10);
    camera.lookAt(scene.position);
    camera.position.z = 25;

    renderer.setSize(innerWidth, innerHeight);

    let controls = new OrbitControls(camera, canvas);

    let box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
    console.log("id box: " + box.id);
    ids[0] = box.id;
    scene.add(box);

    let box2 = new THREE.Mesh(new THREE.BoxBufferGeometry(50, 5, 5), new THREE.MeshNormalMaterial());
    ids[1] = box2.id;
    console.log("id box2: " + box2.id);
    scene.add(box2);
    box2.position.set(0, -2.5, 0);

    const labelContainerElem = document.querySelector('#labels');
    labelContainerElem.style = "width: 200px; margin-top:-100px;";

    for (let i = 0; i < numObjects; i++) {
        arrayElements[i].marker = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.25, 0.25, 0.5, 16), new THREE.MeshBasicMaterial({ color: "#FFFF00" }));
        arrayElements[i].marker.geometry.translate(0, 0.25, 0);
        arrayElements[i].marker.position.set(arrayElements[i].posx, arrayElements[i].posy, arrayElements[i].posz);
        arrayElements[i].marker.name = i;
        scene.add(arrayElements[i].marker);
        idToObject[i] = arrayElements[i].marker;
        mensagens[i] = arrayElements[i].titulo + "\nTemperatura: " + arrayElements[i].temp + "\nFuncionamento: " + arrayElements[i].func + ".";
        const elem = document.createElement('div');
        elem.textContent = mensagens[i];
        arrayElements[i].elem = elem;
        labelContainerElem.appendChild(elem);
        let auxMarker = arrayElements[i].marker;
        elements.push({ auxMarker, elem });
        helper[i] = 0;

        pickingMarker[i] = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.25, 0.25, 0.5, 16), new THREE.MeshBasicMaterial({ color: "#000022" }));
        pickingScene.add(pickingMarker[i]);
        pickingMarker[i].position.copy(arrayElements[i].marker.position);
        pickingMarker[i].rotation.copy(arrayElements[i].marker.rotation);
        pickingMarker[i].scale.copy(arrayElements[i].marker.scale);

    }

    let scaleVector = new THREE.Vector3();
    let scaleFactor = 10;

    renderer.setAnimationLoop(() => {
        for (let i = 0; i < numObjects; i++) {
            let scale = scaleVector.subVectors(camera.position, arrayElements[i].marker.position).length() / scaleFactor;
            arrayElements[i].marker.scale.setScalar(scale);
            pickingMarker[i].scale.setScalar(scale);
        }
        window.addEventListener("click", onDocumentMouseDown);
        renderer.render(pickingScene, camera);
        renderer.render(scene, camera);

    })
}

function onDocumentMouseDown(event) {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    console.log("Click.");

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children);

    console.log("intersects: " + intersects);

    if (intersects.length > 0) {
        if (intersects[0].object.id != ids[0] && intersects[0].object.id != ids[1]) {
            displayInfo(intersects[0].object.id);
        }
    }
}

function displayInfo(pickedObjectId) {
    console.log("displayInfo()");
    console.log("pickedObjectId: " + pickedObjectId);

    for (let i = 0; i < numObjects; i++) {
        console.log("numObj: " + numObjects);
        console.log("i: " + i);
        console.log("arrayElements[i].marker.id: " + arrayElements[i].marker.id);
        if (pickedObjectId == arrayElements[i].marker.id) {
            if (tipoTexto[i] == 1) {
                alert("tipoTexto: 1");
                if (tipoTextoAnterior[i] == 2) {
                    arrayElements[i].elem.style.display = 'none';
                    helper[i] = 0;
                    tipoTextoAnterior[i] = 1;
                }
                if (helper[i] == 0) {
                    alert("helper: 0");
                    var loader = new THREE.FontLoader();
                    loader.load('https://threejs.org/examples/fonts/gentilis_regular.typeface.json', function(font) {
                        var geometry = new THREE.TextGeometry(mensagens[i], {
                            font: font,
                            size: 1,
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
                        mesh.position.y = 7 + Number(arrayElements[i].marker.position.y);
                        mesh.position.x = Number(arrayElements[i].marker.position.x);
                        scene.add(mesh);
                        info[i] = mesh;
                        helper[i] = 1;
                        renderer.render(scene, camera);
                    });
                } else if (helper[i] == 1) {
                    alert("helper: 1");
                    info[i].visible = false;
                    helper[i] = 2;
                } else {
                    alert("helper: 2");
                    info[i].visible = true;
                    helper[i] = 1;
                }
            } else {
                elements.forEach((elementInfo) => {
                    alert("aqui");
                    // if (auxMarker.id == pickedObjectId) {
                    alert("here");
                    const { auxMarker, elem } = elementInfo;

                    // get the position of the center of the cube
                    auxMarker.updateWorldMatrix(true, false);
                    auxMarker.getWorldPosition(tempV);

                    // get the normalized screen coordinate of that position
                    // x and y will be in the -1 to +1 range with x = -1 being
                    // on the left and y = -1 being on the bottom
                    tempV.project(camera);

                    // ask the raycaster for all the objects that intersect
                    // from the eye toward this object's position
                    raycaster.setFromCamera(tempV, camera);
                    const intersectedObjects = raycaster.intersectObjects(scene.children);
                    // We're visible if the first intersection is this object.
                    const show = intersectedObjects.length && auxMarker === intersectedObjects[0].object;

                    if (!show || Math.abs(tempV.z) > 1) {
                        // hide the label
                        arrayElements[i].elem.style.display = 'none';
                    } else {
                        mostrarLabel();
                    }
                    // }
                });
                alert("tipoTexto: 2");
                if (tipoTextoAnterior[i] == 1) {
                    info[i].visible = false;
                    helper[i] = 0;
                    tipoTextoAnterior[i] = 2;
                }
                if (helper[i] == 0) {
                    alert("helper: 0");
                    if (!arrayElements[i].show || Math.abs(tempV.z) > 1) {
                        // hide the label
                        arrayElements[i].elem.style.display = 'none';
                    } else {
                        // unhide the label
                        mostrarLabel(i);
                    }
                    helper[i] = 1;
                } else if (helper[i] == 1) {
                    alert("helper: 1");
                    elemento.elem.style.display = 'none';
                    helper[i] = 2;
                } else {
                    alert("helper: 2");
                    elemento.elem.style.display = '';
                    helper[i] = 1;
                }
            }

        }
    }
}


function mostrarLabel(i) {
    arrayElements[i].style.display = '';

    // convert the normalized position to CSS coordinates
    const x = (tempV.x * .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

    // move the elem to that position
    arrayElements[i].style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;

    // set the zIndex for sorting
    arrayElements[i].style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
}

function pegarDadosXML() {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const infoElementos = this.responseXML;
            init(infoElementos);
        }
    };
    xhttp.open("GET", "./assets/objects.xml", true);
    xhttp.send();
}

function carregaBotoes() {
    buttons = document.getElementsByTagName("button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", onButtonClick, false);
    };
}

function onButtonClick(event) {
    if (tipoTexto == 1) {
        tipoTexto = 2;
        tipoTextoAnterior = 1;
        alert("5a. Labels aparecem orientados de frente ao Canvas, independentemente da posição zoom ou orbit que se impõem ao canvas.\n\nClique em um objeto selecionável para atualizar!");
    } else {
        tipoTexto = 1;
        tipoTextoAnterior = 2;
        alert("5b. Labels sensíveis a posição de visão, orbit , zoom e pan, podendo ser até visto de trás\n\nClique em um objeto selecionável para atualizar!");
    }
}

function buscaElementoPorId(id) {
    let aux;
    class auxiliar {
        constructor() {
            this.elem = "";
            this.show = "";
        }
    }
    elements.forEach((elementInfo) => {

        const { auxMarker, elem } = elementInfo;
        // get the position of the center of the cube
        auxMarker.updateWorldMatrix(true, false);
        auxMarker.getWorldPosition(tempV);

        // get the normalized screen coordinate of that position
        // x and y will be in the -1 to +1 range with x = -1 being
        // on the left and y = -1 being on the bottom
        tempV.project(camera);

        // ask the raycaster for all the objects that intersect
        // from the eye toward this object's position
        raycaster.setFromCamera(tempV, camera);
        const intersectedObjects = raycaster.intersectObjects(scene.children);
        // We're visible if the first intersection is this object.
        const show = intersectedObjects.length && auxMarker === intersectedObjects[0].object;
        if (elem.id == id) {
            aux = new auxiliar();
            aux.elem = elem;
            aux.show = show;
        }
    });
    return aux;
}