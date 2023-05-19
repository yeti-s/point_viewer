import EventManager from "./EventManager";

const Manager = new EventManager();
const REF = {
    isInit: false,
    pointclouds: {}
};


const isInit = () => REF.isInit;
// const getCanvas = () => REF.canvas;
// const getScene = () => REF.scene;
// const getCamera = () => REF.camera;
// const getRenderer = () => REF.renderer;
// const getControls = () => REF.controls;


// const render = () => {
//     getControls().update();
//     getRenderer().render(getScene(), getCamera());
//     requestAnimationFrame(render);
// }

export const initPotree = id => {
    if (isInit()) return;

    // const renderArea = document.getElementById(id);
    // const viewer = new Potree.Viewer(renderArea, {});
    // viewer.setEDLEnabled(true);
    // viewer.setFOV(60);
    // viewer.setPointBudget(3*1000*1000);
    // viewer.setMinNodeSize(0);

    // REF.isInit = true;
}

// export const createPointcloud = (path, name) => {
//     Potree.loadPointCloud(path, name, res=>{
//         window.viewer.scene.addPointCloud(res.pointcloud);
//         console.log(res);

//     })
// } 
