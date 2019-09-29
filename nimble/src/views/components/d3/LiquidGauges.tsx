import * as React from 'react';
import {loadLiquidFillGauge, liquidFillGaugeDefaultSettings} from '../../../functions/loadLiquidGauge';

interface Asset {
    name: string;
    size: number;
}

interface Props {
    initialBundleStats: Asset[];
    postBundleStats: Asset[];
}

interface MainBundle {
    initial?: number;
    post: number;
}
const LiquidGauges: React.FC<Props> = (props) => {
    // const [liquidFill, setliquidFill] = React.useState()
    React.useEffect(()=>{
        const config = liquidFillGaugeDefaultSettings();
        config.circleThickness = 0.1;
        config.circleColor = "#3342FF";
        config.textColor = "#6E92F3";
        config.waveTextColor = "#FFFFFF";
        config.waveColor = "#305FDE";
        config.textVertPosition = 0.8;
        config.waveAnimateTime = 1000;
        config.waveHeight = 0.05;
        config.waveAnimate = true;
        config.waveRise = false;
        config.waveHeightScaling = false;
        config.waveOffset = 0.25;
        config.textSize = 0.75;
        config.waveCount = 3;
        const mainBundle = getMainSize(props.initialBundleStats, props.postBundleStats);
        const gauge = loadLiquidFillGauge("fillgauge1",mainBundle.initial, config, mainBundle.post);
        document.getElementById('fillgauge1')!.onclick=()=>{
            console.log('on click CLICKED');
            gauge.update(mainBundle.post);
        };
    }, []);
    return <svg id="fillgauge1" width="19%" height="200"></svg>;
};
function getMainSize(initial: Asset[], post: Asset[]) {
    //iterate thru initial and post - and only use where nane = 'bundle.js'
    let initialN=0;
    let postN = 0;
    for (let obj of initial) {
        if (obj.name === 'bundle.js') {
            initialN = obj.size;
        }
    }

    for (let obj of post) {
        if (obj.name === 'bundle.js') {
            postN = obj.size;
        }
    }
    const mainObjs: MainBundle = { initial: initialN, post: postN };
    return mainObjs;
}
export default LiquidGauges;