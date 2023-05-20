import EventManager from "./EventManager";

const POTREE = window.Potree;
const MANAGER = new EventManager();
const REF = {
    isInit: false,
    rendererId: ''
    // pointclouds: {},
};

// EVENT NAME

const SET_POINT_SIZE = "set_point_size";

const ADD_POINTCLOUD = "add_pointcloud";
const REMOVE_POINTCLOUD= "remove_pointcloud";
// const REMOVE_POINTCLOUDS = "remove_pointclouds";

const ADD_CLIPPING_VOLUME = "add_clipping_volume";
const REMOVE_CLIPPING_VOLUME = "remove_clipping_volume";
const REMOVE_CLIPPING_VOLUMES = "remove_clipping_volumes";
const SET_CLIP_TASK = "set_clip_task";




// const
export const CLIPTASK = {
    NONE: 0,
    HIGHLIGHT: 1,
    INSIDE: 2,
    OUTSIDE: 3
};


const isInit = () => REF.isInit;
const getViewer = () => REF.viewer;

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
    REF.viewer = viewer;
    REF.pointSize = 1.0;

    const pointclouds = {};
    const volumes = {};
    const scene = viewer.scene;
    const msScene = viewer.measuringTool.scene;
    const pcdScene = viewer.scene.scenePointCloud;
    const view = viewer.scene.view;


    // pointcloud
    MANAGER.register(ADD_POINTCLOUD, (pcd) => {
        const uuid = pcd.uuid;
        
        const setPointSizeEventId = MANAGER.register(SET_POINT_SIZE, () => {
            pcd.material.size = REF.pointSize;
        })

        const removeEventId = MANAGER.register(REMOVE_POINTCLOUD, (id) => {
            if (id !== uuid) return;

            MANAGER.unregister(setPointSizeEventId);
            MANAGER.unregister(removeEventId);
            pcdScene.remove(pcd);
            delete pointclouds[uuid];
        });
        
        pcd.material.size = REF.pointSize;
        pointclouds[uuid] = pcd;
        viewer.scene.addPointCloud(pcd);
        viewer.zoomTo(pcd);
    })

    // clipping tools
    MANAGER.register(ADD_CLIPPING_VOLUME, (volume) => {
        const uuid = volume.uuid;
        
        const eventId = MANAGER.register(REMOVE_CLIPPING_VOLUME, id => {
            if (id !== uuid) return;
            scene.removeVolume(volumes[uuid]);
            delete volumes[uuid];
            MANAGER.unregister(eventId);
        });

        volumes[uuid] = volume;
    })

    MANAGER.register(SET_CLIP_TASK, (task) => {
        viewer.setClipTask(task);
    })
}

// export const destroy = () => {
//     let rendererDom = document.getElementById(REF.rendererId);
//     let children = rendererDom.childNodes;
//     for (let i = children.length - 1; i >= 0; i--)
//         rendererDom.remove(children[i])

//     for (let key in REF) {
//         delete REF[key];
//     }
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


export const addClippingVolume = () => {
    const volume = getViewer().volumeTool.startInsertion({clip: true});
    MANAGER.notify(ADD_CLIPPING_VOLUME, volume);
    return volume.uuid;
}

export const removeClippingVolume = (id) => {
    MANAGER.notify(REMOVE_CLIPPING_VOLUME, id);
}


// NONE 0, HIGHLIGHT 1, INSIDE 2, OUTSIDE 3
export const setClipTask = (task) => {
    MANAGER.notify(SET_CLIP_TASK, task);
}


export const getPointSize = (size) => {
    size = REF.pointSize;
    if (size) return size;
    return 1;
}

export const setPointSize = (size) => {
    REF.pointSize = size;
    MANAGER.notify(SET_POINT_SIZE);
}