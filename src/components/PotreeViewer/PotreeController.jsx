import React, { useState } from "react";
import { 
    loadPointCloud, 
    addClippingVolume, 
    removeClippingVolume, 
    setClipTask, 
    CLIPTASK, 
    setPointSize, 
    getPointSize, 
    setIntensityThreshold,
    getVolumeMatrix
} from "src/utils/pointcloud";
import SliderWithText from "src/components/slider/SliderWithText";
import { getIntensityThreshold } from "../../utils/pointcloud";

const styles = {
    controllerContainer: {
        position: 'absolute',
        zIndex: 1,
        height: '100%',
        width: 200,
        padding: 20
    }
}

export default function PotreeContorller() {
    const [clip, setClip] = useState(false);
    const [path, setPath] = useState("");
    const [json, setJson] = useState();

    const load = () => {
        loadPointCloud(`http://localhost:10001/file?path=${path}`);
        setJson({lasPath: path, boxes:[]});
    }

    const toggleClip = () => {
        if (clip) {
            removeClippingVolume(clip);
            setClip(false);
        }
        else {
            setClip(addClippingVolume());
        }

    }

    const highlight = () => {
        setClipTask(CLIPTASK.HIGHLIGHT);
    }

    const inside = () => {
        setClipTask(CLIPTASK.INSIDE);
    }

    const onPointSizeChange = (event) => {
        let value = event.target.value;
        setPointSize(value);
    }

    const onIntesityChange = (event) => {
        let value = event.target.value;
        setIntensityThreshold(value);
    }

    const testChange = (event) => {
        setPath(event.target.value);
    }

    const check = () => {
        let box = {
            intensity: getIntensityThreshold(),
            matrix: getVolumeMatrix(clip).elements
        }
        json.boxes.push(box);
        setJson(Object.assign({}, json));
    }
    
    const exportJson = () => {
        const blob = new Blob([JSON.stringify(json)], {type: 'text/plain'});
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `exported.json`
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url);
    }

    return (
        <div style={styles.controllerContainer}>
            <SliderWithText text="point size" min={0.1} max={10} step={0.1} defaultValue={getPointSize()} onChange={onPointSizeChange} />
            <SliderWithText text="intensity" min={0} max={255} step={1} defaultValue={0} onChange={onIntesityChange} />
            <input onChange={testChange}/>
            <button onClick={load}>load</button>
            <button onClick={toggleClip}>{clip ? "unclip" : "clip"}</button>
            <button onClick={inside}>inside</button>
            <button onClick={highlight}>highlight</button>
            <button onClick={check}>check</button>
            <button onClick={exportJson}>export</button>
        </div>
    )
}
// export default 