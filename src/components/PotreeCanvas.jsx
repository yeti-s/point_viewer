import React, { useEffect, useState } from "react";
import { initPotree } from "../utils/pointcloud";

const styles = {
    potree_container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
    },
    potree_render_area: {
        width: '100%',
        height: '100%'
    }
}


export default function PotreeCanvas() {
    const [isInit, setIsInit] = useState(false);
    useEffect(()=>{
        if (isInit) return;
        initPotree('potree_render_area');
        setIsInit(true);
    },[isInit])

    return(
        <div id="potree_container" style={styles.potree_container}>
            <div id="potree_render_area" style={styles.potree_render_area}></div>
		    <div id="potree_sidebar_container"></div>
        </div>
    )
};