import { determineLang } from "./core/Language";
import { updateWorldData } from "./core/api";
import { indexedDBHandler } from "./core/indexedDBHandler";
import { initMap } from "./core/map";
import { mapMenu } from "./view/mapMenu";

(async()=>{
    window.groups=[];
    window.markers=[];
    window.Lang=determineLang();
    initMap();
    window.DB = await indexedDBHandler.init('TW_API_DATA',[
        {
            name:'villages',
            keyName:'id',
            AI:false,
        },
        {
            name:'players',
            keyName:'id',
            AI:false,
        },
        {
            name:'allies',
            keyName:'id',
            AI:false,
        },
    ],1);
    await updateWorldData();
    window.villages = await window.DB.getAllData('villages'); 
    $("#content_value h2").after(mapMenu());
})();