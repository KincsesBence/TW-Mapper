import { determineLang } from "./core/Language";
import { getServerConfig, getUnitConfig, redirect, updateWorldData } from "./core/api";
import { indexedDBHandler } from "./core/indexedDBHandler";
import { initMap } from "./core/map";
import { mapMenu } from "./view/mapMenu";

(async()=>{
    if(redirect())
        return
    window.groups=[];
    window.markers=[];
    window.Lang=determineLang();
    window.gameConfig = await getServerConfig();
    window.unitConfig = await getUnitConfig();
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
    window.players = await window.DB.getAllData('players'); 
    window.allies = await window.DB.getAllData('allies'); 
    $("#content_value h2").after(mapMenu());
})();