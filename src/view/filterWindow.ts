import { Lang } from "../core/Language";
import { render } from "../core/map";

export function filterWindow():string{
    return /*html */`
    <div class="filter-window" style="display:none;">
        <div class="filter-menu">
            <div class="filter-main">
                <button class="btn" onclick="filterWindow.barbMenu()">${Lang('barb')}</button>
                <button class="btn" onclick="filterWindow.playerMenu()">${Lang('player')}</button>  
                <button class="btn" onclick="filterWindow.allyMenu()">${Lang('ally')}</button>
                <button class="btn" onclick="filterWindow.pointMenu()">${Lang('points')}</button>
                <button class="btn" onclick="filterWindow.bonusMenu()">${Lang('bonus')}</button>   
            </div>
            <div class="filter-sub"></div>
        </div>
        <div class="filter-items"></div>
        <div class="filter-footer">
            <input id="copyCheck" type="checkbox"/><label style="padding:5px">${Lang('carbon_copy')}</label>
            <button class="btn" onclick="filterWindow.applyFilter()">${Lang('apply')}</button>
            <button class="btn" onclick="filterWindow.cancelFilter()">${Lang('cancel')}</button>   
        </div>
    </div>`
}

window.filterWindow = {
    filters:[],
    cancelFilter(){
        $('.filter-window').hide();
        window.filterWindow.filters=[];
        $('.group-items').find('input[type="checkbox"]').get().forEach((elem)=>{
            if($(elem).prop('disabled')){
                $(elem).attr("disabled", 'false');
            }
        })
    },
    mainMenu(){
        $('.filter-main').show();
        $('.filter-sub').hide();
    },
    barbMenu(){
        $('.filter-main').hide();
        $('.filter-sub').html(/*html*/`
            <div>
                <button onclick="filterWindow.addFilter('barbs','+')" class="btn">+ ${Lang('barb')}</button>
                <button onclick="filterWindow.addFilter('barbs','-')" class="btn">- ${Lang('barb')}</button>
                <button onclick="filterWindow.mainMenu()" class="btn">${Lang('cancel')}</button>
            </div>
        `);
        $('.filter-sub').show();
    },
    allyMenu(){
        let allies:any[]=[];

    
        window.groupWindow.selectedGroups.forEach((selectedGroup)=>{
            let gInd=window.groups.findIndex((group)=>{return group.id==selectedGroup})
            if(gInd==-1) return;
            window.groups[gInd].villages.forEach((village)=>{
                if(village.player!=0){
                    let pIndex=window.players.findIndex((player)=>{return player.id==village.player})
                    if(pIndex==-1) return;
                    let aIndex=window.allies.findIndex((ally)=>{return window.players[pIndex].ally==ally.id})
                    if(aIndex==-1) return;
                    let aIn=allies.findIndex((ally)=>{return ally.id==window.allies[aIndex].id})
                    if(aIn==-1){
                        allies.push({
                            id:window.allies[aIndex].id,
                            tag:window.allies[aIndex].tag
                        })
                    }
                }
            })
        })
        allies.sort((ally1,ally2)=>{return ally1.tag<ally2.tag? -1:1})
        $('.filter-main').hide();
        $('.filter-sub').html(/*html*/`
            <div>
                <select id="filter-ally">
                    ${allies.map((ally)=>{
                        return /*html*/`<option value="${ally.id}">${ally.tag}</option>`
                    }).join('')}
                </select>
            </div>
            <div>
                <button onclick="filterWindow.addFilter('ally','+')" class="btn">+ ${Lang('ally')}</button>
                <button onclick="filterWindow.addFilter('ally','-')" class="btn">- ${Lang('ally')}</button>
                <button onclick="filterWindow.mainMenu()" class="btn">${Lang('cancel')}</button>
            </div>
        `);
        $('.filter-sub').show();
    },
    playerMenu(){
        let players:any[]=[];
        window.groupWindow.selectedGroups.forEach((selectedGroup)=>{
            let gInd=window.groups.findIndex((group)=>{return group.id==selectedGroup})
            window.groups[gInd].villages.forEach((village)=>{
                if(village.player!=0){
                    let pIndex=window.players.findIndex((player)=>{return player.id==village.player})
                    let pIn=players.findIndex((player)=>{return player.id==window.players[pIndex].id})
                    if(pIn==-1){
                        players.push({
                            id:window.players[pIndex].id,
                            name:window.players[pIndex].name
                        })
                    }
                }
            })
        })
        players.sort((player1,player2)=>{return player1.name<player2.name? -1:1});
        $('.filter-main').hide();
        $('.filter-sub').html(/*html*/`
            <div>
                <select id="filter-player">
                    ${players.map((player)=>{
                        return /*html*/`<option value="${player.id}">${player.name}</option>`
                    }).join('')}
                </select>
            </div>
            <div>
                <button onclick="addFilter('player','+')" class="btn">+ ${Lang('player')}</button>
                <button onclick="addFilter('player','-')" class="btn">- ${Lang('player')}</button>
                <button onclick="mainMenu()" class="btn">${Lang('cancel')}</button>
            </div>
        `);
        $('.filter-sub').show();
    },
    bonusMenu(){
        $('.filter-main').hide();
        $('.filter-sub').html(/*html*/`
            <div>
                <select id="filter-bonus">
                    <option value="-1">${Lang('only_barbs')}</option>
                    <option value="0">${Lang('not_bonus')}</option>
                    ${Object.keys(window.TWMap.bonus_data).map((key:string)=>{
                        return /*html*/`<option value="${key}">${window.TWMap.bonus_data[key].text}</option>`
                    }).join('')}
                </select>
            </div>
            <div>
                <button onclick="addFilter('bonus','+')" class="btn">+ ${Lang('bonus')}</button>
                <button onclick="addFilter('bonus','-')" class="btn">-  ${Lang('bonus')}</button>
                <button onclick="mainMenu()" class="btn"> ${Lang('cancel')}</button>
            </div>
        `);
        $('.filter-sub').show();
    },
    pointMenu(){
        $('.filter-main').hide();
        $('.filter-sub').html(/*html*/`
            <div>
                <label>${Lang('village_points')}: </label>
                <select id="filter-points-select">
                    <option value=">" selected="">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value="=">=</option>
                    <option value=">=">≥</option>
                    <option value="<=">≤</option>
                    <option value="!=">≠</option>
                </select>
                <input type="number" id="filter-points">
            </div>
            <div>
                <button onclick="filterWindow.addFilter('points','+')" class="btn">+ ${Lang('points')}</button>
                <button onclick="filterWindow.addFilter('points','-')" class="btn">- ${Lang('points')}</button>
                <button onclick="filterWindow.mainMenu()" class="btn">${Lang('cancel')}</button>
            <div>
        `);
        $('.filter-sub').show();
    },
    addFilter(type,op){
        let val:val;
        if(type=='points'){
            if($('html').find('#filter-points').val().toString().trim()==""){
                window.UI.ErrorMessage(Lang('filter_must_be_entered'))
                return;
            }
    
            val={
                stmt:$('html').find('#filter-points-select').val().toString(),
                val:parseInt($('html').find('#filter-points').val().toString())
            }
        }else if(type=='player'){
            val={
                id:parseInt($('html').find('#filter-player').val().toString()),
                name:$('html').find('#filter-player option:selected').text()
            }
        }else if(type=='ally'){
            val={
                id:parseInt($('html').find('#filter-ally').val().toString()),
                name:$('html').find('#filter-ally option:selected').text()
            }
        }else if(type=='bonus'){
            val={
                id:parseInt($('html').find('#filter-bonus').val().toString()),
                name:$('html').find('#filter-bonus option:selected').text()
            }
        }
        window.filterWindow.filters.push({
            type:type,
            op:op,
            val:val
        })
        $('.filter-main').show();
        $('.filter-sub').hide();
        window.filterWindow.renderFilter()
    },
    renderFilter(){
        let html='';
        window.filterWindow.filters.forEach((filter,index)=>{
            let text=``
            switch(filter.type){
                case 'player':
                    text=`${Lang('player')} ${filter.op=='-'? Lang('remove_it'):Lang('add_it')}: ${filter.val.name}`;
                break;
                case 'ally':
                    text=`${Lang('ally')} ${filter.op=='-'? Lang('remove_it'):Lang('add_it')}: ${filter.val.name}`;
                break;
                case 'bonus':
                    text=`${Lang('bonus')} ${filter.op=='-'? Lang('remove_it'):Lang('add_it')}: ${filter.val.name}`;
                break;
                case 'barbs':
                    text=`${Lang('barbs')} ${filter.op=='-'? Lang('remove_it'):Lang('add_it')}`;
                break;
                case 'points':
                    text=`${filter.op=='-'? Lang('remove'):Lang('add')} ${Lang('if_village_points')} ${filter.val.stmt} ${filter.val.val}`;
                break;
            }
            html+=/*html */`<div id="fi-${index}" class="filter-item">
            <span style="display:inline-flex"> 
            <div style="margin:3px 5px;width: 11px; height:11px; background-image: url(https://dshu.innogamescdn.com/asset/7fe7ab60/graphic/sorthandle.png); cursor:pointer" class="qbhandle ui-sortable-handle"></div>${text}</span>
            <img onclick="removeFilter(${index})" src="https://dshu.innogamescdn.com/asset/7fe7ab60/graphic/delete.png" class="" data-title="Törlés">
           </div>`;
        })
    
        $('.filter-items').html(html);
        $('.filter-items').sortable({
            update: ( ) => {
                let newItems:any[]=[];
                $('.filter-items .filter-item').get().forEach((item)=>{
                    let ind = parseInt($(item).attr('id').replace('fi-',''));
                    newItems.push(window.filterWindow.filters[ind]);
                })
                window.filterWindow.filters=newItems;
                window.filterWindow.renderFilter();
            }
        });
    },
    removeFilter(index:number){
        window.filterWindow.filters.splice(index,1);
        window.filterWindow.renderFilter();
    },
    applyFilter(){
        if(window.groupWindow.selectedGroups.length==0){
            window.UI.ErrorMessage(Lang('no_group_selected'))
            return;
        }
    
        if(window.filterWindow.filters.length==0){
            window.UI.ErrorMessage(Lang('no_filter_added'))
            return;
        }
    
        window.groupWindow.selectedGroups.forEach((selectedGroup)=>{
           
            let ind=window.groups.findIndex((group)=>{return group.id==selectedGroup});
            let baseVillages=[...window.groups[ind].villages];
            let villages=[...window.groups[ind].villages];
            let reseted=false;
            window.filterWindow.filters.forEach((filter)=>{
                if(filter.op=="+" && !reseted){
                    console.log('reset');
                    baseVillages=[...villages];
                    villages=[];
                    reseted=true;
                }else if(filter.op=="-"){
                    reseted=false;
                }
                switch(filter.type){
                    
                    case 'player':
                        if(filter.op=="+"){
                            
                            villages=[...window.filterWindow.addPlayerFilter(filter,baseVillages,villages)]
                        }else{
                            villages=[...window.filterWindow.removePlayerFilter(filter,villages)]
                        }
                    break;
                    case 'ally':
                        if(filter.op=="+"){
                            villages=[...window.filterWindow.addAllyFilter(filter,baseVillages,villages)]
                        }else{
                            villages=[...window.filterWindow.removeAllyFilter(filter,villages)]
                        }
                    break;
                    case 'bonus':
                        if(filter.op=="+"){
                            villages=[...window.filterWindow.addBonusFilter(filter,baseVillages,villages)]
                        }else{
                            villages=[...window.filterWindow.removeBonusFilter(filter,villages)]
                        }
                    break;
                    case 'barbs':
                        if(filter.op=="+"){
                            villages=[...window.filterWindow.addBarbsFilter(baseVillages,villages)]
                        }else{
                            villages=[...window.filterWindow.removeBarbsFilter(villages)]
                        }
                    break;
                    case 'points':
                        if(filter.op=="+"){
                            villages=[...window.filterWindow.addPointsFilter(filter,baseVillages,villages)]
                        }else{
                            villages=[...window.filterWindow.removePointsFilter(filter,villages)]
                        }
                    break;
                }
            })
            if($('#copyCheck').is(':checked')){
                let cc={...window.groups[ind]}
                cc.villages=villages;
                cc.id=new Date().getTime(),
                window.groups.push(cc)
                window.groupWindow.loadActiveGoup(cc.id)
            }else{
                window.groups[ind].villages=villages;
            }
            
        })
        $('.filter-items').html('');
        window.groupWindow.selectedGroups=[];
        window.groupWindow.renderGroupList()
        window.mapMenu.renderGroupSelect()
        render();
        window.filterWindow.cancelFilter()
        window.groupWindow.renderSelectedVillages();
    },
    addPlayerFilter(filter:filter,base:village[],filtered:village[]):village[]{
        let result=[...filtered];
        base.forEach((village)=>{
            if(village.player==filter.val.id){
                let ind=filtered.findIndex((fVillage)=>{return fVillage.id==village.id});
                if(ind==-1){
                    result.push(village);
                }  
            }
        })
        return result;
    },
    removePlayerFilter(filter:filter,filtered:village[]){
        let result:village[]=[];
        filtered.forEach((village)=>{
            if(village.player!=filter.val.id){
                result.push(village);
            }
        })
        return result;
    },
    addAllyFilter(filter:filter,base:village[],filtered:village[]){
        let result=[...filtered];
        base.forEach((village)=>{
            let pInd=window.players.findIndex((player)=>{return player.id==village.player});
            if(pInd==-1) return;
            if(window.players[pInd].ally==filter.val.id){
                let ind=filtered.findIndex((fVillage)=>{return fVillage.id==village.id});
                if(ind==-1){
                    result.push(village);
                }
            }
        })
        console.log(result);
        return result;
    },
    removeAllyFilter(filter:filter,filtered:village[]){
        let result:village[]=[];
        filtered.forEach((village)=>{
            let pInd=window.players.findIndex((player)=>{return player.id==village.player});
            if(pInd>-1){
                if(window.players[pInd].ally!=filter.val.id){
                    result.push(village);
                }
            }
        })
        return result;
    },
    addBonusFilter(filter:filter,base:village[],filtered:village[]){
        let result=[...filtered];
        base.forEach((village)=>{
            if(village.rank==filter.val.id && filter.val.id!=-1){
                result.push(village);
            }
            if(village.rank>0 && filter.val.id==-1){
                result.push(village);
            }
        })
        return result;
    },
    removeBonusFilter(filter:filter,filtered:village[]){
        let result:village[]=[];
        filtered.forEach((village)=>{
            if(village.rank!=filter.val.id && filter.val.id!=-1){
                result.push(village);
            }
            if(village.rank==0 && filter.val.id==-1){
                result.push(village);
            }
        })
        return result;
    },
    addBarbsFilter(base:village[],filtered:village[]){
        let result=[...filtered];
        base.forEach((village)=>{
            if(village.player==0){
                result.push(village);
            }
        })
        return result;
    },
    removeBarbsFilter(filtered:village[]){
        let result:village[]=[];
        filtered.forEach((village)=>{
            if(village.player!=0){
                result.push(village);
            }
        })
        return result;
    },
    addPointsFilter(filter:filter,base:village[],filtered:village[]){
        let result=[...filtered];
        base.forEach((village)=>{
            if(window.filterWindow.statement(filter.val.stmt,village.points,parseInt(filter.val.val.toString()))){
                result.push(village);
            }
        })
        return result;
    },
    removePointsFilter(filter:filter,filtered:village[]){
        let result:village[]=[];
        filtered.forEach((village)=>{
            if(!window.filterWindow.statement(filter.val.stmt,village.points,parseInt(filter.val.val.toString()))){
                result.push(village);
            }
        })
        return result;
    },
    statement(op:string,x:number,val:number):boolean{
        switch (op) {
            case ">":
                return x > val
            case "<":
                return x < val
            case "=":
                return x == val
            case ">=":
                return x >= val
            case "<=":
                return x <= val
            case "!=":
                return x != val
        }
    }

}
