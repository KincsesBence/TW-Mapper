import { Lang } from "../core/Language";
import { circle } from "../img/circle";
import { kontinent } from "../img/kontinent";
import { line } from "../img/line";
import { rectangle } from "../img/rectangle";
import { single } from "../img/single";
import { tape } from "../img/tape";
import { getLastUpdate, update } from "../core/api";
import { mapAction, render } from "../core/map";
import { groupsWindow } from "./groupsWindow";

export function mapMenu(){
    return /* html */`
    <style>
        .tool{
            background-color:#c1a264;
            border-radius:5px;
            padding:4px;
            box-shadow:2px 3px 4px 0px #e4c588;
            cursor:pointer;
        }

        .tool:hover{
            background-color: #facc71 !important;
        }
        .tool-selected{
            box-shadow:inset 2px 3px 4px 0px #5e5e5ea6 !important;
            background-color: #facc71 !important;
        }
        .tool-bar{
            margin-top:10px;
            display:flex;
            justify-content:start;
            gap: 5px;
        }

        .tool-bar label{
            margin-top:3px;
        }
    </style>
    <div>
        <div style="float:right" >
            <span id="updated" style="float:right">${Lang('api_last_update')}: ${getLastUpdate()}</span><br>
            <button style="float:right;margin-top:5px;" class="btn" onclick="mapMenu.updateApi()">${Lang('update_api')}</button>
        </div>
        <div class="tool-bar" style="display:none;" id="addGroup">
            <label for="color">${Lang('color')}:</label>
            <input type="color" style="height:21px" id="color" value="#e66465" />
            <label for="groupName">${Lang('name')}:</label>
            <input type="text" id="groupName" />
            <button class="btn" onclick="mapMenu.addNewGroup()">${Lang('add')}</button>
            <button class="btn" onclick="mapMenu.cancelNewGroupModal()">${Lang('cancel')}</button>
        </div>
        <div class="tool-bar" id="mapControls">
            <button class="btn" onclick="mapMenu.openGroups()">${Lang('groups')}</button>
            <button class="btn" onclick="mapMenu.newGroupModal()">${Lang('new_group')}</button>
            <input type="checkbox" onchange="mapMenu.toggleDrawing()" id="draw" >
            <label for="draw">${Lang('draw')}</label>
            <input type="checkbox" onchange="mapMenu.toggleInfo()" id="vinfo" >
            <label for="vinfo" style="">${Lang('village_info')}</label>
        </div>
        <div class="tool-bar">
            <select style="font-size:14px; width:100px" onchange="mapMenu.groupChanged()" id="groupSelector" placeholder="${Lang('choose_group')}"></select>
            <button class="btn" onclick="mapMenu.addToGroup()">${Lang('add')}</button>
            <button class="btn" onclick="mapMenu.resetMarkers()">${Lang('reset')}</button>
        </div>
        <div class="tool-bar">
            <div class="tool" onclick="mapMenu.selectTool('circle',this)">
                ${circle()}
            </div>
            <div class="tool" onclick="mapMenu.selectTool('concave',this)">
                ${line()}
            </div>
            <div class="tool" onclick="mapMenu.selectTool('rectangle',this)">
                ${rectangle()}
            </div>
            <div class="tool" onclick="mapMenu.selectTool('single',this)">
                ${single()}
            </div>
            <div class="tool" onclick="mapMenu.selectTool('kontinent',this)">
                ${kontinent()}
            </div>
            <div class="tool" onclick="mapMenu.selectTool('tape',this)">
                ${tape()}
            </div>
        </div>

    </div>
    `
}

window.mapMenu = {
    isDrawing:false,
    selectedTool:'',
    groupChanged(){
        if($('#groupSelector').val()==""){
            $('#tools').hide();
            return
        }else{
            $('#tools').show();
        }
    
        let val = parseInt($('#groupSelector').val().toString())
    
        let ind = window.groups.findIndex((group)=>{return group.id==val})
        
        window.activeGroup=window.groups[ind];
        window.mapMenu.renderGroupSelect();
    },
    resetMarkers(){
        window.markers=[];
        render()
    },
    addToGroup(){
        let activeInd=window.groups.findIndex((g)=>{return g.id==window.activeGroup.id})
        window.markers.forEach((marker)=>{
            marker.villages.forEach((village)=>{
                let villInd= window.groups[activeInd].villages.findIndex((gVillage)=>{return gVillage.id==village.id})
                if(villInd==-1){
                    window.groups[activeInd].villages.push(village)
                }
            })
        })
    
        window. markers=[];
        render()
        window.mapMenu.renderGroupSelect();
    },
    selectTool(tool:string,elem:HTMLElement){
        $('.tool-bar .tool').removeClass('tool-selected');
        $(elem).addClass('tool-selected');
        $('#inputBar').html('');
        window.mapMenu.selectedTool=tool;
    },
    async updateApi(){
        await update();
        $('#updated').text(`${Lang('api_last_update')}: ${getLastUpdate()}`);
    },
    newGroupModal(){
        $('#mapControls').hide();
        $('#addGroup').show();
    },
    cancelNewGroupModal(){
        $('#mapControls').show();
        $('#addGroup').hide();
    },
    addNewGroup(){
        let name=$('#groupName').val().toString();
        let color=$('#color').val().toString();
        if(name==""){
            window.UI.ErrorMessage(Lang('group_name_req'))
            return;
        }
        if(name.length>20){
            window.UI.ErrorMessage(Lang('max_name_length'))
            return;
        }
    
        $('#mapControls').show();
        $('#addGroup').hide();

        let newGroup:group={
            id:new Date().getTime(),
            name:name,
            color:color,
            villages:[]
        }
        window.groups.push(newGroup)
        window.activeGroup=newGroup;
        window.mapMenu.renderGroupSelect();
        $('#groupName').val('');
    },
    renderGroupSelect(){
        let html='';
        window.groups.forEach((group)=>{
            html+=/*html*/`<option ${group.id==window.activeGroup.id && `selected`} value="${group.id}">${group.name} (${group.villages.length})</option>`;
        })
        $('#groupSelector').html(html);
    },
    toggleDrawing(){
        if(!window.mapMenu.isDrawing){
            window.mapMenu.isDrawing=true;
            window.TWMap.map._handleClick = mapAction;
        }else{
            window.mapMenu.isDrawing=false;
            window.TWMap.map._handleClick = window.backupTW;
            $('#map_popup').css('opacity','1');
        }
    },
    toggleInfo(){
        if($('#vinfo').is(':checked')){
            $('#map_popup').css('opacity','1');
        }else{
            $('#map_popup').css('opacity','0');
        }
    },
    openGroups(){
        window.Dialog.show("groupsModal", groupsWindow());
        window.groupWindow.renderGroupList();
    }

}