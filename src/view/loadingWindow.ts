import { Lang } from "../core/Language";

export function loadingWindow(){
    return /*html*/`
        <h1 style="text-align:center">${Lang('updating_map_data')}</h1>
        <div style="width:250px; display:block; margin:0 auto;" class="progress-bar progress-bar-alive">
            <span  class="label mapper-loader-label"></span>
            <div id="mapper-loader-pct" style="width: 0%">
                <span class="label  mapper-loader-label" style="width:250px"></span>
            </div>
        </div>
        <div id="mapper-loading" style="display: flex; justify-content: center; width: 100%;">
            <img style="height:25px" src="https://dshu.innogamescdn.com/asset/6389cdba/graphic/loading.gif"><span style="padding:5px">${Lang('loading')}...</span>
        </div>
    `
}
