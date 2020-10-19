import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

let tipoTextoAnterior = new Array(),
    tipoTexto = new Array(),
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
    mensagens = new Array(),
    elements = new Array(),
    helper = new Array(),
    info2 = new Array(),
    info = new Array(),
    idToObject = {},
    old = false,
    ids = {};

carregaBotoes();
pegarDadosXML();

function init(infoElementos) {

    const titulos = (infoElementos.getElementsByTagName("titulo"));
    numObjects = titulos.length;
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
    ids[0] = box.id;
    scene.add(box);

    let box2 = new THREE.Mesh(new THREE.BoxBufferGeometry(50, 5, 5), new THREE.MeshNormalMaterial());
    ids[1] = box2.id;
    scene.add(box2);
    box2.position.set(0, -2.5, 0);

    const labelContainerElem = document.querySelector('#labels');
    labelContainerElem.style = "width: 200px; margin-top:-100px;";

    for (let i = 0; i < numObjects; i++) {
        arrayElements[i].marker = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.25, 0.25, 0.5, 16), new THREE.MeshBasicMaterial({ color: "#FFFF00" }));
        arrayElements[i].marker.geometry.translate(0, 0.25, 0);
        arrayElements[i].marker.position.set(arrayElements[i].posx, arrayElements[i].posy, arrayElements[i].posz);

        scene.add(arrayElements[i].marker);

        let id = arrayElements[i].marker.id;
        idToObject[id] = arrayElements[i];
        mensagens[id] = arrayElements[i].titulo + "\nTemperatura: " + arrayElements[i].temp + "\nFuncionamento: " + arrayElements[i].func + ".";
        tipoTexto[id] = 1;
        tipoTextoAnterior[id] = 0;

        // const elem = document.createElement('div');

        // elem.textContent = mensagens[i];

        // labelContainerElem.appendChild(elem);

        // elements.push({ auxMarker, elem });
        helper[id] = 0;

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

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        if (intersects[0].object.id != ids[0] && intersects[0].object.id != ids[1]) {
            displayInfo(intersects[0].object.id);
        }
    }
}

function displayInfo(pickedObjectId) {
    if (pickedObjectId == idToObject[pickedObjectId].marker.id) {
        if (tipoTexto[pickedObjectId] == 1) {
            if (tipoTextoAnterior[pickedObjectId] == 2) {
                info2[pickedObjectId].visible = false;
                helper[pickedObjectId] = 0;
                tipoTextoAnterior[pickedObjectId] = 1;
            }
            tipoTextoAnterior[pickedObjectId] = 1;
            if (helper[pickedObjectId] == 0) {
                var loader = new THREE.FontLoader();
                loader.load('https://threejs.org/examples/fonts/gentilis_regular.typeface.json', function(font) {
                    var geometry = new THREE.TextGeometry(mensagens[pickedObjectId], {
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
                    mesh.position.y = 7 + Number(idToObject[pickedObjectId].marker.position.y);
                    mesh.position.x = Number(idToObject[pickedObjectId].marker.position.x);
                    scene.add(mesh);
                    info[pickedObjectId] = mesh;
                    helper[pickedObjectId] = 1;
                    renderer.render(scene, camera);
                });
            } else if (helper[pickedObjectId] == 1) {
                info[pickedObjectId].visible = false;
                helper[pickedObjectId] = 2;
            } else {
                info[pickedObjectId].visible = true;
                helper[pickedObjectId] = 1;
            }
        } else {
            if (tipoTextoAnterior[pickedObjectId] == 1) {
                info[pickedObjectId].visible = false;
                helper[pickedObjectId] = 0;
                tipoTextoAnterior[pickedObjectId] = 2;
            }
            tipoTextoAnterior[pickedObjectId] = 2;
            if (helper[pickedObjectId] == 0) {
                var spritey = makeTextSprite(pickedObjectId);
                spritey.position.y = 7 + Number(idToObject[pickedObjectId].marker.position.y);
                spritey.position.x = Number(idToObject[pickedObjectId].marker.position.x);
                scene.add(spritey);
                info2[pickedObjectId] = spritey;
                helper[pickedObjectId] = 1;
                renderer.render(scene, camera);
            } else if (helper[pickedObjectId] == 1) {
                info2[pickedObjectId].visible = false;
                helper[pickedObjectId] = 2;
            } else {
                info2[pickedObjectId].visible = true;
                helper[pickedObjectId] = 1;
            }
        }

    }
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
    let alerta;
    for (let i = 0; i < numObjects; i++) {
        let id = arrayElements[i].marker.id;

        if (tipoTexto[id] == 1) {
            tipoTexto[id] = 2;
            alerta = 0;
        } else {
            tipoTexto[id] = 1;
            alerta = 1;
        }
    }
    if (alerta == 0) {
        alert("5a. Labels aparecem orientados de frente ao Canvas, independentemente da posição zoom ou orbit que se impõem ao canvas.\n\nClique em um objeto selecionável para atualizar!");
    } else {
        alert("5b. Labels sensíveis a posição de visão, orbit , zoom e pan, podendo ser até visto de trás\n\nClique em um objeto selecionável para atualizar!");
    }
}

function makeTextSprite(id, opts) {
    var parameters = opts || {};
    var fontface = parameters.fontface || 'Helvetica';
    var fontsize = parameters.fontsize || 25;
    var canvas = document.createElement('canvas');
    canvas.id = "sprite";
    var context = canvas.getContext('2d');
    context.font = fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    // var metrics = context.measureText(message);
    // var textWidth = metrics.width;

    // text color
    context.fillStyle = 'rgba(255, 255, 255, 1.0)';
    context.fillText(idToObject[id].titulo, 10, 25);
    context.fillText("Temperatura: " + idToObject[id].temp, 10, 50);
    context.fillText("Funcionamento: " + idToObject[id].func, 10, 75);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 5, 1.0);
    // sprite.center.set(0, 1);

    // get the position of the center of the cube
    sprite.updateWorldMatrix(true, false);
    sprite.getWorldPosition(tempV);

    // get the normalized screen coordinate of that position
    // x and y will be in the -1 to +1 range with x = -1 being
    // on the left and y = -1 being on the bottom
    tempV.project(camera);

    // ask the raycaster for all the objects that intersect
    // from the eye toward this object's position
    raycaster.setFromCamera(tempV, camera);
    const intersectedObjects = raycaster.intersectObjects(scene.children);
    // We're visible if the first intersection is this object.
    const show = intersectedObjects.length && sprite === intersectedObjects[0].object;

    if (!show || Math.abs(tempV.z) > 1) {
        // hide the label
        canvas.style.display = 'none';
    } else {
        // unhide the label
        canvas.style.display = '';

        // convert the normalized position to CSS coordinates
        const x = (tempV.x * .5 + .5) * canvas.clientWidth;
        const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

        // move the elem to that position
        canvas.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;

        // set the zIndex for sorting
        canvas.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
    }

    return sprite;
}

function adaptCanvasToText(canvas, message, font_size, font_face) {

    "use strict";

    var context = canvas.getContext('2d');

    if (canvas.height > canvas.width) {
        canvas.width = canvas.height;
    }


    while (true) {
        var side = getNextPowerOfTwo(canvas.width);

        if (side < 128) {
            side = 128;
        }

        canvas.width = canvas.height = side;

        context.font = "Bold " + font_size + "pt " + font_face;

        var metrics = context.measureText(message);
        var text_width = metrics.width;
        var text_side = getNextPowerOfTwo(Math.max(text_width, font_size));

        if (text_side >= 128) {
            if (side !== text_side) {
                canvas.width = text_side;
                continue;
            }
        } else if (side !== 128) {
            canvas.width = 128;
            continue;
        }

        break;
    }
}

function getNextPowerOfTwo(num) {

    "use strict";

    if (num < 0) {
        throw new Error("Argument must be positive");
    }

    var bin_str = toBinaryInt(num - 1);

    if (bin_str.indexOf("0") < 0 || bin_str === "0") {
        return num;
    } else {
        return Math.pow(2, bin_str.length);
    }
}

function toBinaryInt(num) {
    "use strict";

    return (num >>> 0).toString(2); // jshint ignore:line
}