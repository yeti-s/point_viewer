import React, { useEffect, useState } from "react";
import { init, loadPointCloud, destroy } from "src/utils/pointcloud";
import PotreeContorller from "./PotreeController";

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
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
    }
}


export default function PotreeCanvas() {
    const [isInit, setIsInit] = useState(false);
    useEffect(()=>{
        init('potree_render_area');
    },[])

    return(
        <div id="potree_container" style={styles.potree_container}>
            <PotreeContorller/>
            <div id="potree_render_area" style={styles.potree_render_area}></div>
		    {/* <div id="potree_sidebar_container"></div> */}
        </div>
    )
};