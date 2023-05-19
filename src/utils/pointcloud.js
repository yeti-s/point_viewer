import EventManager from "./EventManager";

const Potree = window.Potree;
const Manager = new EventManager();
const REF = {
    isInit: false,
    pointclouds: {}
};


const isInit = () => REF.isInit;
const getViewer = () => REF.viewer;
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

    const renderArea = document.getElementById(id);
    const viewer = new Potree.Viewer(renderArea, {});
    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(3*1000*1000);
    viewer.setMinNodeSize(0);

    REF.isInit = true;
    REF.viewer = viewer;

    createPointcloud('/file?path=/home/yeti/pointcloud_manipulator/express/total_converted/metadata.json',"test");
}

export const createPointcloud = (path, name) => {
    Potree.loadPointCloud(path, name, res=>{
        let viewer = getViewer();
        viewer.scene.addPointCloud(res.pointcloud);
        console.log(res);

        viewer.scene.view.position.set(-500, -500, 100);
        viewer.scene.view.lookAt(-500, -500, 0);
    })
} 
