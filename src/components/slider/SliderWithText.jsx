import React from "react";
import { Slider, Grid } from "@mui/material";
import {createTheme} from '@mui/material/styles';
// '#fd98ff'
const styles = {
    text: {
        fontSize: 18,
        color: '#fd98ff'
    },
    sliderContainer: {
        paddingLeft: 3
    }
}

export default function SliderWithText({text, min, max, step, defaultValue, onChange}) {

    return (
        <div className="slider_with_text">
            <Grid container direction="column" justifyContent="space-around" alignItems="center">
                <Grid container direction="row" justifyContent="flex-start">
                    <Grid item>
                        <div style={styles.text}>{text}</div>
                    </Grid>
                </Grid>
                <Grid container direction="row" justifyContent="flex-start">
                    <Grid item alignItems="center" style={styles.sliderContainer} xs={10}>
                        <Slider size="small" min={min} max={max} step={step} defaultValue={defaultValue} 
                                onChange={onChange ? onChange : ()=>{}} valueLabelDisplay="auto"/>
                    </Grid>
                </Grid>

            </Grid>

        </div>
    )
}