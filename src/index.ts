import { determineLang } from "./core/Language";
import { updateWorldData } from "./core/api";
import { indexedDBHandler } from "./core/indexedDBHandler";

(async()=>{
    window.Lang=determineLang();
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
    updateWorldData();
})();