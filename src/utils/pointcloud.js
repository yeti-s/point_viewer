import EventManager from "./EventManager";

const { ipcRenderer } = window.require("electron");

const fetchFile = (path, headers) => {
    return new Promise((resovle, reject)=> {
        ipcRenderer.invoke('fetch-file', path, headers).then((res) => {
            resovle(new Response(res))
        })
    })
}

window.fetch = fetchFile;
const Manager = new EventManager();
const Potree = window.Potree;

const REF = {
    isInit: false,
    pointclouds: {}
};


const isInit = () => REF.isInit;
const getCanvas = () => REF.canvas;
const getScene = () => REF.scene;
const getCamera = () => REF.camera;
const getRenderer = () => REF.renderer;
const getControls = () => REF.controls;


const render = () => {
    getControls().update();
    getRenderer().render(getScene(), getCamera());
    requestAnimationFrame(render);
}

export const initPotree = id => {
    if (isInit()) return;

    const renderArea = document.getElementById(id);
    const viewer = new Potree.Viewer(renderArea, {});
    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(3*1000*1000);
    viewer.setMinNodeSize(0);

    REF.isInit = true;


    window.viewer = viewer;
    createPointcloud('/mnt/s/workspace/github/data/Paris-Lille-3D/raw_data/las/total_converted/metadata.json', "test")
    viewer.scene.view.position.set(1629.0373014185272, -1835.0872473843096, 100.920341253627);
    viewer.scene.view.lookAt(-944, -1053, 0);
}

export const createPointcloud = (path, name) => {
    Potree.loadPointCloud(path, name, res=>{
        window.viewer.scene.addPointCloud(res.pointcloud);
        console.log(res);

    })
} 
