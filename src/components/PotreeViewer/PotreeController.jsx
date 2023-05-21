import React, { useState } from "react";
import { loadPointCloud, addClippingVolume, removeClippingVolume, setClipTask, CLIPTASK, setPointSize, getPointSize} from "src/utils/pointcloud";
import SliderWithText from "src/components/slider/SliderWithText";

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

    const load = () => {
        loadPointCloud("/file?path=C:/Users/yeti/Documents/github/data/test_potree/metadata.json");
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

    return (
        <div style={styles.controllerContainer}>
            <SliderWithText text="point size" min={0.1} max={10} step={0.1} defaultValue={getPointSize()} onChange={onPointSizeChange} />
            <button onClick={load}>load</button>
            <button onClick={toggleClip}>{clip ? "unclip" : "clip"}</button>
            <button onClick={inside}>inside</button>
            <button onClick={highlight}>highlight</button>
        </div>
    )
}
// export default 