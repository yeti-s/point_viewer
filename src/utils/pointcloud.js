import EventManager from "./EventManager";

const POTREE = window.Potree;
const MANAGER = new EventManager();
const REF = {
    isInit: false,
    rendererId: ''
    // pointclouds: {},
};

// EVENT NAME
const ADD_POINTCLOUD = "add_pointcloud";
const REMOVE_POINTCLOUD= "remove_pointcloud";
// const REMOVE_POINTCLOUD_ALL = "remove_pointcloud_all";


const isInit = () => REF.isInit;


export const init = id => {
    if (isInit()) return;

    const renderArea = document.getElementById(id);
    const viewer = new POTREE.Viewer(renderArea, {});
    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(3*1000*1000);
    viewer.setMinNodeSize(0);


    REF.isInit = true;
    REF.rendererId = id;
    const pointclouds = {};
    const scene = viewer.measuringTool.scene;
    const pcdScene = viewer.scene.scenePointCloud;
    const view = viewer.scene.view;


    MANAGER.register(ADD_POINTCLOUD, (pcd) => {
        const uuid = pcd.uuid;
        
        const eventId = MANAGER.register(REMOVE_POINTCLOUD, (id) => {
            if (id !== uuid) return;
            pcdScene.remove(pcd);
            delete pointclouds[uuid];
            MANAGER.unregister(eventId);
        })
        
        pointclouds[uuid] = pcd;
        viewer.scene.addPointCloud(pcd);
        viewer.zoomTo(pcd);
    })
}

// export const destroy = () => {
//     let rendererDom = document.getElementById(REF.rendererId);
//     let children = rendererDom.childNodes;
//     for (let i = children.length - 1; i >= 0; i--)
//         rendererDom.remove(children[i])

//     REF.isInit = false;
//     MANAGER.reset();
// }

export const loadPointCloud = (path, name = "noname") => {
    return new Promise((resolve) => {
        POTREE.loadPointCloud(path, name, result=>{
            const pcd = result.pointcloud;
            MANAGER.notify(ADD_POINTCLOUD, pcd);
            resolve(pcd.uuid);
        })
    })
}

export const removePointcloud = (id) => {
    MANAGER.notify(REMOVE_POINTCLOUD, id);
}