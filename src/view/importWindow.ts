import { Lang } from "../core/Language";
import { render } from "../core/map";

export function importWindow():string{
    return /*html */`
    <style>
        .import-window{
            width:500px;
            height: max-content;
            position:fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            background-color:#f4e4bc;
            background: transparent url(https://dshu.innogamescdn.com/asset/fd86cac8/graphic/index/contentbg.png) scroll left top repeat;
            filter: drop-shadow(0 0 0.75rem rgb(88, 88, 88));
            border: 2px solid #6c4824;
            border-radius: 10px;
            display:grid;
            padding:5px;
            row-gap:10px;
        }
        textarea {
            resize: none;
            height:200px;
            width:calc(100% - 10px);
        }
        .import-header{
            text-align: center;
            background: linear-gradient(to bottom, #e2c07c 0%, #dab874 44%, #c1a264 100%);
            height:20px;
            border-radius:5px;
        }
    </style>
    <div class="import-window" style="display:none;">
        <div class="import-header">
            <h4>${Lang('import_coords')} "<span id="importGroupName"></span>" ${Lang('into_group')}</h4>
        </div>
        <div>${Lang('valid_coorsd')}: <span id="validCoords">0</span></div>
        <textarea onkeyup="importWindow.textareaChanged(event)" id="importTextarea"></textarea>
        <div class="import-footer">
            <button id="cancelBtn" class="btn" onclick="importWindow.importCoords()">${Lang('apply')}</button>
            <button id="applyBtn" class="btn" onclick="importWindow.cancelImport()">${Lang('cancel')}</button>   
        </div>
    </div>
    `
}


window.importWindow ={
    to:null,
    importVillages:[],
    cancelImport(){
        $('.import-window').hide();
        window.filterWindow.filters=[];
        $('.group-items').find('input[type="checkbox"]').get().forEach((elem)=>{
            if($(elem).prop('disabled')){
                $(elem).prop("disabled", false );
            }
        })
    },
    importCoords(){
        let sel=window.groupWindow.selectedGroups[0];
        let gInd=window.groups.findIndex((group)=>{return group.id==sel})
        window.importWindow.importVillages.forEach((importV)=>{
            let idx=window.groups[gInd].villages.findIndex((village:village)=>{ return village.id==importV.id})
            if(idx==-1){
                window.groups[gInd].villages.push(importV)
            }
        })
        window.importWindow.cancelImport();
        window.groupWindow.selectedGroups=[];
        window.groupWindow.renderGroupList()
        window.mapMenu.renderGroupSelect()
        render();
        window.groupWindow.renderSelectedVillages();
    },
    textareaChanged(e:Event){
        e.preventDefault();
        e.stopPropagation();
        clearTimeout(window.importWindow.to);
        window.importWindow.to = setTimeout(()=>{
            window.importWindow.importVillages=[];
            $('#validCoords').html(`<img style="height:15px" src="https://dshu.innogamescdn.com/asset/6389cdba/graphic/loading.gif"><span style="padding:5px">${Lang('loading')}...</span>`)
            let coordsInput=$('#importTextarea').val().toString();
            $('#importTextarea').prop('disabled',true);
            $('#applyBtn').prop('disabled',true);
            $('#cancelBtn').prop('disabled',true);
            setTimeout(()=>{
            
                let reg = Array.from(coordsInput.matchAll(/([0-9]{1,3}).([0-9]{1,3})/g));
                reg.forEach((elem:any)=>{
                    let coord=elem[1]+"|"+elem[2];
                    let village = window.villages.find((village:village)=>{ return `${village.x}|${village.y}`==coord})
                    let idx = window.importWindow.importVillages.findIndex((village:village)=>{ return `${village.x}|${village.y}`==coord})
                    if(village && idx==-1){
                        window.importWindow.importVillages.push(village);
                    }
                });
                $('#validCoords').html(window.importWindow.importVillages.length.toString())
                $('#importTextarea').prop('disabled',false);
                $('#applyBtn').prop('disabled',false);
                $('#cancelBtn').prop('disabled',false);
                $('#importTextarea').focus();
            },100)
        },1000)
    }
}