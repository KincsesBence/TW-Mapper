import { Lang } from "../core/Language";
import { render } from "../core/map";
import { filterWindow } from "./filterWindow";
import { importWindow } from "./importWindow";

export function groupsWindow():string{
    return /*html*/`
    <style>
        ::-webkit-scrollbar {
        width: 5px;
        }
        ::-webkit-scrollbar-track {
            box-shadow: inset 0 0 5px grey;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
            background: grey;
            border-radius: 10px;
        }
        #popup_box_groupsModal{
            width: 1200px !important;
        }
        .container {
            height:500px;
            display: grid; 
            grid-template-columns: 1fr 2fr; 
            grid-template-rows: 40px calc(100% - 40px); 
            gap: 0px 0px; 
            grid-template-areas: 
                "menu menu"
                "groups villages"; 
        }
        .menu { grid-area: menu; }
        .groups { grid-area: groups; text-align:center}
        .villages { grid-area: villages; text-align:center}
        .group-row {  display: grid;
            grid-template-columns: 3fr 1fr 0.5fr 50px;
            grid-template-rows: 30px;
            gap: 0px 0px;
            grid-auto-flow: row;
            grid-template-areas:
                "name color checkbox view";
        }
        .group-row div{
            padding: 6px;
        }

        .group-items .group-row:nth-of-type(even){
            background-color: #fff5da
        }

        .name { grid-area: name; }
        .view { grid-area: view; }
        .color { grid-area: color; }
        .checkbox { grid-area: checkbox; }
        
        .group-items{overflow-y: scroll; height: calc(100% - 40px);}

        .village-row {  display: grid;
            grid-template-columns:3fr 1fr 1.5fr 0.5fr 50px 35px;
            grid-template-rows: 30px;
            gap: 0px 0px;
            grid-auto-flow: row;
            grid-template-areas:
                "village-name point owner ally type goto";
        }

        .village-row div{
            padding: 6px;
        }

        .village-items .village-row:nth-of-type(even){
            background-color: #fff5da
        }

        .village-name {grid-area: village-name; }
        .point{grid-area: point; }
        .owner{grid-area: owner; }
        .ally{grid-area: ally; }
        .type{grid-area: type; }
        .go-to{ grid-area: goto}
        .village-items{
            overflow-y: scroll; height: calc(100% - 40px);
        }

        .group-header{
            margin-right:5px;
            background: linear-gradient(to bottom,#e2c07c 0%,#dab874 44%,#c1a264 100%);
            font-weight:bold;
        }

        .village-header{
            margin-right:5px;
            background: linear-gradient(to bottom,#e2c07c 0%,#dab874 44%,#c1a264 100%);
            font-weight:bold;
        }
    </style>
    <div class="container">
        <div class="menu">
            <button class="btn" onclick="groupWindow.union()">${Lang('union')}</button>
            <button class="btn" onclick="groupWindow.subtract()">${Lang('subtract')}</button>
            <button class="btn" onclick="groupWindow.section()">${Lang('section')}</button>
            <button class="btn" onclick="groupWindow.openImportCoords()">${Lang('import')}</button>
            <button class="btn" onclick="groupWindow.openFilter()">${Lang('filter')}</button>
            <button class="btn" onclick="groupWindow.deleteSelected()">${Lang('delete')}</button>
            <span>TW-mapper - v1.2 by: toldi26</span>
            <button style="float:right;" class="btn" onclick="groupWindow.copyCoords()">${Lang('copy')}</button>
        </div>
        <div class="groups">
            <div class="group-row group-header" >
                <div class="name">${Lang('name')}</div>
                <div class="color">${Lang('color')}</div>
                <div class="checkbox">✔</div>
                <div class="view">${Lang('view')}</div>
            </div>
            <div class="group-items"></div>
        </div>
        <div class="villages">
            <div class="village-row village-header"  >
                <div class="village-name">${Lang('village_name')}</div>
                <div class="point">${Lang('points')}</div>
                <div class="owner">${Lang('owner')}</div>
                <div class="ally">${Lang('ally')}</div>
                <div class="type">${Lang('type')}</div>
                <div class="go-to"></div>
            </div>
            <div class="village-items"></div>
            ${filterWindow()}
            ${importWindow()}
        </div>
    </div>
    `
}   

window.groupWindow = {
    selectedGroups:[],
    renderGroupList(){
        let html='';
        window.groups.forEach((group)=>{
            html+=/* html */`
                <div class="group-row" id="g-${group.id}">
                    <div class="name">${group.name} (${group.villages.length})<a onclick="groupWindow.editGroupName(${group.id})" class="rename-icon" href="#" data-title="Átnevez"></a></div>
                    <div class="color"><input onchange="groupWindow.changeColor(${group.id})" class="color-input" type="color" value="${group.color}"></div>
                    <div class="checkbox"><input onclick="groupWindow.toggleSelected(${group.id})" type="checkbox" value="${group.id}" ${window.groupWindow.selectedGroups.includes(group.id)? `checked`:``}></div>
                    <div class="view"><button onclick="groupWindow.loadActiveGoup(${group.id})" class="btn">➜</button></div>
                </div>
            `
        })
        $('.group-items').html(html);
    },
    editGroupName(id:number){
        let idx = window.groups.findIndex((group)=>{return group.id==id});
        $('html').find(`#g-${id}`).find('.name').html(`<input value="${window.groups[idx].name}" type="text"/><button class="btn" onclick="groupWindow.saveGroupName(${window.groups[idx].id})" >${Lang('rename')}</button>`)
    },
    saveGroupName(id:number){
        let val=$('html').find(`#g-${id}`).find('.name input').val().toString().trim();
        if(val.length==0){
            window.UI.ErrorMessage(Lang('group_name_req'))
            return;
        }
        if(val.length>20){
            window.UI.ErrorMessage(Lang('max_name_length'))
            return;
        }
    
        let idx = window.groups.findIndex((group)=>{return group.id==id});
        window.groups[idx].name=val;
        $('html').find(`#g-${id}`).find('.name').html(`${window.groups[idx].name} (${window.groups[idx].villages.length})<a onclick="groupWindow.editGroupName(${window.groups[idx].id})" class="rename-icon" href="#" data-title="${Lang('rename')}"></a>`);
        window.mapMenu.renderGroupSelect();
    },
    changeColor(id:number){
        let idx = window.groups.findIndex((group)=>{return group.id==id});
        window.groups[idx].color=$('html').find(`#g-${id}`).find('.color input').val().toString(); 
        render();
    },
    loadActiveGoup(id:number){
        let idx= window.groups.findIndex((group)=>{return group.id==id})
        window.activeGroup=window.groups[idx];
        window.groupWindow.renderSelectedVillages()
        window.mapMenu.renderGroupSelect();
    },
    renderSelectedVillages(){
        let html='';
        window.activeGroup.villages.forEach((village)=>{
            let player:player=null;
            let ally:ally=null;

            let pInd=window.players.findIndex((player)=>{return player.id==village.player})
            if(pInd>-1){
                player=window.players[pInd];
                let aInd=window.allies.findIndex((ally)=>{return ally.id==player.ally})
                if(aInd>-1){
                    ally=window.allies[aInd];
                }
            }
           
            html+=/* html */`
            <div class="village-row">
                <div class="village-name"><a target="_blank" href="/game.php?village=${window.game_data.village.id}&screen=info_village&id=${village.id}">${village.name} (${village.x}|${village.y})</a></div>
                <div class="point">${village.points}</div>
                <div class="owner">${player!=null ? /* html */`<a target="_blank" href="/game.php?village=${window.game_data.village.id}&screen=info_player&id=${player.id}">${player.name}</a>`:''}</div>
                <div class="ally">${ally!=null?  /* html */`<a target="_blank" href="/game.php?village=${window.game_data.village.id}&screen=info_ally&id=${ally.id}">${ally.tag}</a>`:''}</div>
                <div class="type">${village.rank>0 ? /* html */`<span class="bonus_icon bonus_icon_${village.rank}" />`:''}</div>
                <div class="go-to" onclick="groupWindow.goTo(${village.x},${village.y})"><button class="btn">🎯</button></div>
            </div>
            `
        })
        $('.village-items').html(html);
    },
    toggleSelected(id:number){
        let ind = window.groupWindow.selectedGroups.findIndex((e)=>{return e==id});
        if(ind==-1){
            window.groupWindow.selectedGroups.push(id);
            return;
        }
        window.groupWindow.selectedGroups.splice(ind,1);
    },
    deleteSelected(){
        if(window.groupWindow.selectedGroups.length==0){
            window.UI.ErrorMessage(Lang('no_group_selected'));
            return;
        }

        window.groupWindow.selectedGroups.forEach((selectedGroup)=>{
        let ind = window.groups.findIndex((group)=>{return group.id==selectedGroup});
        window.groups.splice(ind,1);
        })
        window.groupWindow.selectedGroups=[];
        window.mapMenu.renderGroupSelect();
        window.groupWindow.renderGroupList();
    },
    union(){
        if(window.groupWindow.selectedGroups.length<2){
            window.top.UI.ErrorMessage(Lang('not_enough_group_selected'));
            return;
        }
    
        let mainInd = window.groups.findIndex((group)=>{return group.id==window.groupWindow.selectedGroups[0]});
        let villages = [...window.groups[mainInd].villages];

        let name = window.groups[mainInd].name;
        for (let i = 1; i < window.groupWindow.selectedGroups.length; i++) {
            let subInd = window.groups.findIndex((group)=>{return group.id==window.groupWindow.selectedGroups[i]});
            let subVillages = [...window.groups[subInd].villages];
            name+=" ∪ "+window.groups[subInd].name;
            subVillages.forEach((subVillage)=>{
                let ind= villages.findIndex((village)=>{return subVillage.x==village.x && subVillage.y==village.y});
                if(ind==-1){
                    villages.push(subVillage);
                }
            })
        }


        window.groups.push({
            id:new Date().getTime(),
            name:name,
            color: window.groups[mainInd].color,
            villages:villages
        });

        window.groupWindow.selectedGroups=[];
        window.mapMenu.renderGroupSelect();
        window.groupWindow.renderGroupList();
        render();
    },
    subtract(){
        if(window.groupWindow.selectedGroups.length<2){
            window.top.UI.ErrorMessage(Lang('no_group_selected'));
            return;
        }
        let mainInd = window.groups.findIndex((group)=>{return group.id==window.groupWindow.selectedGroups[0]});
        let villages = [...window.groups[mainInd].villages];
        let name = window.groups[mainInd].name;

        for (let i = 1; i < window.groupWindow.selectedGroups.length; i++) {
            let subInd = window.groups.findIndex((group)=>{return group.id==window.groupWindow.selectedGroups[i]});
            let subVillages = [...window.groups[subInd].villages];
            name+=" - "+window.groups[subInd].name;
            subVillages.forEach((subVillage)=>{
                let ind= villages.findIndex((village)=>{return subVillage.x==village.x && subVillage.y==village.y});
                if(ind!=-1){
                    villages.splice(ind,1);
                }
            })
        }

        window.groups.push({
            id:new Date().getTime(),
            name:name,
            color: window.groups[mainInd].color,
            villages:villages
        });

        window.groupWindow.selectedGroups=[];
        window.mapMenu.renderGroupSelect();
        window.groupWindow.renderGroupList();
        render();
    },
    section(){
        if(window.groupWindow.selectedGroups.length<2){
            window.top.UI.ErrorMessage(Lang('no_group_selected'));
            return;
        }
        let mainInd = window.groups.findIndex((group)=>{return group.id==window.groupWindow.selectedGroups[0]});
        let villages = [...window.groups[mainInd].villages];
        
        let name = window.groups[mainInd].name;
        for (let i = 1; i < window.groupWindow.selectedGroups.length; i++) {
            let subInd = window.groups.findIndex((group)=>{return group.id==window.groupWindow.selectedGroups[i]});
            let subVillages = [...window.groups[subInd].villages];
            let newVillages:village[]=[];
            name+=" ∩ "+window.groups[subInd].name;
            villages.forEach((village)=>{
                let ind= subVillages.findIndex((subVillage)=>{return subVillage.x==village.x && subVillage.y==village.y});
                if(ind!=-1){
                    newVillages.push(village);
                }
            })
            villages=newVillages;
        }
        window.groups.push({
            id:new Date().getTime(),
            name:name,
            color: window.groups[mainInd].color,
            villages:villages
        });

        window.groupWindow.selectedGroups=[];
        window.mapMenu.renderGroupSelect();
        window.groupWindow.renderGroupList();
        render();
    },
    copyCoords(){
        if(!window.activeGroup){
            window.UI.ErrorMessage(Lang('no_group_selected'))
            return;
        }
        if(window.activeGroup.villages.length==0){
            window.UI.ErrorMessage(Lang('empty_group'))
            return;
        }
        window.UI.SuccessMessage(Lang('copied_to_clipboard'))
        navigator.clipboard.writeText(window.activeGroup.villages.map((village)=>{return village.x+"|"+village.y}).join(' '));
    },
    openFilter(){
        window.filterWindow.filters=[];
        if(window.groupWindow.selectedGroups.length==0){
            window.UI.ErrorMessage(Lang('no_group_selected'));
            return;
        }
        $('.filter-window').show();
        $('.group-items').find('input[type="checkbox"]').get().forEach((elem)=>{
            if(!$(elem).prop('disabled')){
                $(elem).prop("disabled",true);
            }
        })
    
    },
    openImportCoords(){
        if(window.groupWindow.selectedGroups.length==0){
            window.UI.ErrorMessage(Lang('no_group_selected'));
            return;
        }

        if(window.groupWindow.selectedGroups.length>1){
            window.UI.ErrorMessage(Lang('only_one'));
            return;
        }

        let sel=window.groupWindow.selectedGroups[0];
        let gInd=window.groups.findIndex((group)=>{return group.id==sel})
        $('#validCoords').html('0');
        $('.import-window').show();
        $('#importTextarea').val('');
        $('#importGroupName').text(window.groups[gInd].name);
        $('.group-items').find('input[type="checkbox"]').get().forEach((elem)=>{
            if(!$(elem).prop('disabled')){
                $(elem).prop("disabled",true);
            }
        })
    },
    goTo(x:number,y:number){
        window.Dialog.close('groupsModal');
        $('#mapx').val(x.toString())
        $('#mapy').val(y.toString())
        window.TWMap.focusSubmit();
    }
}











