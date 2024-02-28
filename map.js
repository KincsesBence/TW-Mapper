const fieldHeightBig=38;
const fieldWidthBig=53;
const fieldHeightMini=5;
const fieldWidthMini=5;
var canDraw=false;
var backupTW = null
var canvasMini = null;
var ctxMini = null;
var translateMini= null;
var canvasBig = null;
var ctxBig = null;
var translateBig= null;
var groups=[];
var selectedGroups=[];
var markers=[];
var activeMarker;
var activeGroup=null;
var isDrawing=false;
var db=null;
var filters=[];

(async () =>{
    if(redirect())
        return
    await InitData();
    initMap();
    loadUI();
})();

async function InitData(){
    return new Promise((resolve,reject)=>{
        let openRequest = indexedDB.open("TW_API_DATA", 1);
        let loadCnt=0;

        function dataLodaded(){
            loadCnt++;
            if(loadCnt==3){
                console.log('All data loaded ✔');
                window.top.UI.SuccessMessage("Térkép adatok betöltve!");
                window.Dialog.close("launchDialog");
                resolve();
            }
        }

        openRequest.onupgradeneeded = function() {
            console.log('init database');
            db = openRequest.result;
            if (!db.objectStoreNames.contains('villages'))
                db.createObjectStore('villages', {keyPath: 'id', autoIncrement: false}); 
            if (!db.objectStoreNames.contains('players'))
                db.createObjectStore('players', {keyPath: 'id', autoIncrement: false});
            if (!db.objectStoreNames.contains('allies'))
                db.createObjectStore('allies', {keyPath: 'id', autoIncrement: false}); 
        };
            
        openRequest.onerror = function() {
            console.error("Error", openRequest.error);
        };
            
        openRequest.onsuccess = async () => {
            db = openRequest.result;
            let lastUpdate= localStorage.getItem('TW_API_LAST_UPDATE');
            if(lastUpdate<new Date().getTime() || lastUpdate==null){
                await addLoadingModal();
                await update()
            }

            let tVillages = db.transaction("villages");
            let rVillages = await tVillages.objectStore("villages").getAll();

            rVillages.onsuccess= () =>{
                window.villages=rVillages.result
                dataLodaded();
            }
            
            tPlayers = db.transaction("players");
            rPlayers = await tPlayers.objectStore("players").getAll();
            rPlayers.onsuccess= () =>{
                window.players=rPlayers.result
                dataLodaded();
            }

            tAllies = db.transaction("allies");
            rAllies = await tAllies.objectStore("allies").getAll();
            rAllies.onsuccess= () =>{
                window.allies=rAllies.result
                dataLodaded();
            }
        
        };

        async function parseCSVToIndexed(data,tableName,fields){
            let transaction = db.transaction(tableName, "readwrite");
            let lines = data.trim().split('\n');
            lines.forEach(async (line) => {
                let cols=line.split(',');
                let obj={};
                cols.forEach((col,index)=>{
                    let fieldValue=decodeURIComponent(col).replaceAll('+',' ')
                    if(!isNaN(fieldValue)){
                        fieldValue=parseInt(fieldValue);
                    }
                    obj[fields[index]]=fieldValue;
                })
                await transaction.objectStore(tableName).put(obj);
            });  
        }
    
        async function update(){
            console.log('Updating...');
            let resVillages = await getData(`https://${window.location.host}/map/village.txt`);
            let resPlayers = await getData(`https://${window.location.host}/map/player.txt`);
            let resAllies = await getData(`https://${window.location.host}/map/ally.txt`);
            await parseCSVToIndexed(resVillages,'villages',['id','name','x','y','player','points','rank'])
            await parseCSVToIndexed(resPlayers,'players',['id','name','ally','villages','points','rank'])
            await parseCSVToIndexed(resAllies,'allies',['id','name','tag','members','villages','points','all_points','rank'])
            console.log('Updated allies');
            localStorage.setItem('TW_API_LAST_UPDATE',new Date(new Date().setDate(new Date().getDate() + 1)).getTime());
        }
    

    })
}

async function updateApi(){
    localStorage.setItem('TW_API_LAST_UPDATE',new Date().getTime());
    await InitData();
    $("#updated").text(`Api frissítve: ${getLastUpdate()}`);
}

function addLoadingModal(){
    return new Promise((resolve,reject)=>{
        window.Dialog.show("launchDialog",
            /*html*/`
                <h1 style="text-align:center">Térkép adatok frissítése</h1>
                <div id="counter-loading" style="display: flex; justify-content: center; width: 100%;">
                    <img style="height:25px" src="https://dshu.innogamescdn.com/asset/6389cdba/graphic/loading.gif"><span style="padding:5px">Betöltés...</span>
                </div>
            `);
        $('.popup_box_close').hide();
        $('.popup_box_container').append('<div style="position: fixed;width: 100%;height: 100%;top:0;left:0;z-index:12001"></div>');

        setTimeout(()=>{
            resolve()
        },500)
    });
}

function getData(ajaxurl) { 
    return $.ajax({
      url: ajaxurl,
      type: 'GET',
    });
};

function redirect(){
    if(!window.location.href.includes('screen=map')) {
        window.top.UI.InfoMessage("Átírányítás a térképre!");
        setTimeout(()=>{
            window.location.href=`game.php?village=${game_data.village.id}&screen=map`
        },1000);
        return true
    }
    backupTW=TWMap.map._handleClick;
    return false
}

function getLastUpdate(){
    let lastUpdate =  localStorage.getItem('TW_API_LAST_UPDATE');
    lastUpdate= new Date(parseInt(lastUpdate)-(60*60*24*1000));
    return lastUpdate.toLocaleString('hu-HU');
}

function loadUI(){
    $("#content_value").prepend(/*html*/`
        <div style="display:table;width:100%">
            <div style="margin:5px 0;width:100%">
                <button class="btn" onclick="renderModal()">Csoportok</button>
                <button id="newGroup" class="btn" onclick="newGroup()">Új csoport</button>
                <div style="float:right" >
                <span id="updated" style="float:right">Api frissítve: ${getLastUpdate()}</span><br>
                <button style="float:right;margin-top:5px;" class="btn" onclick="updateApi()">Adatok frissítése</button>
                </div>
            </div>
            <select style="margin:5px 0; font-size:14px; width:100px" onchange="groupChanged()" id="groupSelector" placeholder="-- Válassz csoportot--"></select>
            <div style="margin:5px 0;display:none;" id="addGroup">
                <label for="color">Szín:</label>
                <input type="color" id="color" value="#e66465" />
                <label for="groupName">Név:</label>
                <input type="text" id="groupName" value="#e66465" />
                <button class="btn" onclick="addGroup()">Hozzáad</button>
                <button class="btn" onclick="cancelAdd()">Mégse</button>
            </div>
            <div style="margin:5px 0;display:none;" id="tools">
                <input type="checkbox" onchange="toggleDrawing()" id="draw" >
                <label for="draw" >Rajzolás</label>
                <input type="checkbox" onchange="toggleInfo()" id="vinfo" >
                <label for="vinfo" >FaluInfo</label>
                <input type="radio" id="concave" name="tool">
                <label for="concave">Konkáv</label>
                <input type="radio" id="circle" name="tool">
                <label for="circle">Kör</label>
                <input type="number" id="radius" value="10" min="1" max="1000" >
                <input type="radio" id="single" name="tool">
                <label for="circle">Egyenként</label>
                <button class="btn" onclick="addToGroup()">Hozzáad</button>
                <button class="btn" onclick="resetSelected()">visszaállít</button>
            </div>
        </div>
    `);
}

function initMap(){
    $("#minimap_mover").append('<canvas id="mini_map" />');
    $("#map_mover").append('<canvas id="big_map" />');
    $('[onclick*="VillageInfo.Notes.toggleEdit()"]').removeAttr("onclick");
    canvasMini = document.getElementById('mini_map');
    ctxMini = canvasMini.getContext('2d');
    canvasBig = document.getElementById('big_map');
    ctxBig = canvasBig.getContext('2d');

    ctxBig.canvas.width =  $("#map_mover").innerWidth();
    ctxBig.canvas.height =  $("#map_mover").innerHeight();
    ctxMini.canvas.width =  $("#minimap_mover").innerWidth();
    ctxMini.canvas.height =  $("#minimap_mover").innerHeight();

    ctxBig.save();
    ctxMini.save();
    translating();
    render();
    const observer = new MutationObserver(updatePos);
    observer.observe(document.querySelector("#map_container"), { attributes: true });
}

function newGroup(){
    $('#tools').hide();
    $('#newGroup').hide();
    $('#addGroup').show();
    $('#groupName').val('');
    $('#color').val('#e66465');
}

function addGroup(){
    if($('#groupName').val().trim()==""){
        window.UI.ErrorMessage('A csoport nevét kötelező megadni!')
        return;
    }

    $('#newGroup').show();
    $('#addGroup').hide();
    $('#tools').show();

    let newGroup = {
        id:new Date().getTime(),
        name:$('#groupName').val(),
        color:$('#color').val(),
        villages:[]
    };
    groups.push(newGroup)
    activeGroup=newGroup;
    renderGroupSelect();
}

function cancelAdd(){
    $('#newGroup').show();
    $('#addGroup').hide();
    renderGroupSelect();
}

function renderGroupSelect(){
    let html='';
    groups.forEach((group)=>{
        html+=/*html*/`<option ${group.id==activeGroup.id? 'selected':''} value="${group.id}">${group.name} (${group.villages.length})</option>`;
    })
    $('#groupSelector').html(html);

    if(groups.length>0){
        $('#tools').show();
    }
}

function groupChanged(){
    if($('#groupSelector').val()==""){
        $('#tools').hide();
        return
    }else{
        $('#tools').show();
    }

    let val = parseInt($('#groupSelector').val().toString())

    let ind = groups.findIndex((group)=>{return group.id==val})
    
    activeGroup=groups[ind];
    renderGroupSelect();
}

document.addEventListener("keydown", (event) => {
    switch(event.key){
        case "Shift":
            canDraw=true;
        break;
    }
});

document.addEventListener("keyup", (event) => {
    switch(event.key){
        case "Shift":
            canDraw=false;
        break;
    }
});

function toggleDrawing(){
    if(!isDrawing){
        isDrawing=true;
        TWMap.map._handleClick = mapAction;
        
    }else{
        isDrawing=false;
        TWMap.map._handleClick = backupTW;
        $('#map_popup').css('opacity','1');
    }
}

function toggleInfo(){
    if($('#vinfo').is(':checked')){
        $('#map_popup').css('opacity','1');
    }else{
        $('#map_popup').css('opacity','0');
    }
}

const mapAction = function (e) {
    var pos = this.coordByEvent(e);
    if(!canDraw){
        return false;
    }

    if($('#concave').is(':checked')){
        drawConcave(pos[0],pos[1])
    }

    if($('#circle').is(':checked')){
        drawCircle(pos[0],pos[1])
    }

    if($('#single').is(':checked')){
        drawSingle(pos[0],pos[1])
    }
    return false;
}


function drawCircle(x,y){
    let r= $("#radius").val();
    activeMarker=new Date().getTime();
    markers.push({
        id:activeMarker,
        type:"circle",
        r:r*2,
        x:x,
        y:y,
        villages: getVillagesByCircle(r,x,y),
        color: activeGroup.color
    })
    render();
    activeMarker = null
}

function drawSingle(x,y){
    let vil=getVillagesByCircle(0,x,y);
    if(vil.length>0){
        activeMarker=new Date().getTime()
        markers.push({
            id:activeMarker,
            type:'single',
            x:x,
            y:y,
            villages: vil,
            color: activeGroup.color
        })
        render();
        activeMarker = null
    }
}

function drawConcave(x,y){
    let idx = markers.findIndex((obj)=>{ return obj.id==activeMarker});
    if(idx==-1){
        activeMarker=new Date().getTime()
        markers.push({
            id:activeMarker,
            type:"concave",
            points:[{x:x,y:y}],
            canClose:false,
            color: activeGroup.color
        })
        render();
    }else{
        if(markers[idx].points[0].x==x && markers[idx].points[0].y==y){
            activeMarker=new Date().getTime();
            markers[idx].canClose=true;
            markers[idx].villages = getVillagesByRect(markers[idx].points)
        }else{
            markers[idx].points.push({x:x,y:y}); 
        }
        render();
    }
}

function getVillagesByCircle(r,x,y){
    let villages = window.villages;
    let villagesOpt=[];
    villages.forEach((village)=>{
        if(isInside({x:x,y:y},village,r)){
            villagesOpt.push(village);
        }
    })
    return villagesOpt;
}

function isInside(circle, village, r)
{
    if ((village.x - circle.x) * (village.x - circle.x) +(village.y - circle.y) * (village.y - circle.y) <= r * r)
        return true;
    else
        return false;
}

function getVillagesByRect(points){
    let minX=999;  
    let maxX=0; 
    let minY=999;  
    let maxY=0; 
    points.forEach((point)=>{
        if(point.x>maxX){
            maxX=point.x
        }
        if(point.y>maxY){
            maxY=point.y
        }
        if(point.x<minX){
            minX=point.x
        }
        if(point.y<minY){
            minY=point.y
        }
    })
    let villages = window.villages;
    
    let villagesOpt=[];
    villages.forEach((village)=>{
        if(village.x>=minX && village.x<=maxX && village.y>=minY && village.y<=maxY){
                villagesOpt.push(village);
        }
    })

    let villagesInside =[]
  
    villagesOpt.forEach((village)=>{
        let ins=false;
        if(rayCasting(points,{x:village.x,y:village.y})){
            ins=true;
        }

        for (let i = 0; i < points.length-1; i++) {
            
            if(calcIsInsideThickLineSegment(points[i],village,points[i+1],0.2)){
                ins=true;
            }
        }

        if(calcIsInsideThickLineSegment(points[0],village,points[points.length-1],0.2)){
            ins=true;
        }
        
        if(ins){
            villagesInside.push(village)
        }
    })

    render();
    let vil="";
    villagesInside.forEach((elem)=>{
        vil+="','"+elem.x+"|"+elem.y
    })
    return villagesInside
}

function rayCasting(polygon,point) {
    var x = point.x, y = point.y;
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i].x, yi = polygon[i].y;
        var xj = polygon[j].x, yj = polygon[j].y;
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

function calcIsInsideThickLineSegment(line1, pnt,line2, lineThickness) {
    var L2 = ( ((line2.x - line1.x) * (line2.x - line1.x)) + ((line2.y - line1.y) * (line2.y - line1.y)) );
    if(L2 == 0) return false;
    var r = ( ((pnt.x - line1.x) * (line2.x - line1.x)) + ((pnt.y - line1.y) * (line2.y - line1.y)) ) / L2;

    //line thickness is circular
    if(r < 0) {
        //Outside line1
        return (Math.sqrt(( (line1.x - pnt.x) * (line1.x - pnt.x) ) + ( (line1.y - pnt.y) * (line1.y - pnt.y) )) <= lineThickness);
    } else if((0 <= r) && (r <= 1)) {
        //On the line segment
        var s = (((line1.y - pnt.y) * (line2.x - line1.x)) - ((line1.x - pnt.x) * (line2.y - line1.y))) / L2;
        return (Math.abs(s) * Math.sqrt(L2) <= lineThickness);
    } else {
        //Outside line2
        return (Math.sqrt(( (line2.x - pnt.x) * (line2.x - pnt.x) ) + ( (line2.y - pnt.y) * (line2.y - pnt.y) )) <= lineThickness);
    }
}

function render(){
    ctxBig.canvas.width =  $("#map_mover").innerWidth();
    ctxBig.canvas.height =  $("#map_mover").innerHeight();
    ctxMini.canvas.width =  $("#minimap_mover").innerWidth();
    ctxMini.canvas.height =  $("#minimap_mover").innerHeight();
    ctxBig.clearRect(0, 0, ctxBig.canvas.width, ctxBig.canvas.height);
    ctxMini.clearRect(0, 0, ctxMini.canvas.width, ctxMini.canvas.height);
    ctxMini.reset();
    ctxMini.translate(-translateMini.x,-translateMini.y);
    ctxBig.reset();
    ctxBig.translate(-translate.x,-translate.y);
    markers.forEach((elem)=>{
        ctxMini.beginPath();
        ctxBig.beginPath();
        ctxMini.strokeStyle = elem.color;
        ctxBig.strokeStyle = elem.color;
        ctxMini.fillStyle = elem.color;
        ctxBig.fillStyle = elem.color+"80";
        ctxMini.lineWidth = 2;
        ctxBig.lineWidth = 5;
        
        if(elem.type=="circle"){
            ctxBig.ellipse((elem.x+1)*fieldWidthBig-fieldWidthBig/2, (elem.y+1)*fieldHeightBig-fieldHeightBig/2, (fieldWidthBig/2)*elem.r, (fieldHeightBig/2)*elem.r, 0, 0, 2 * Math.PI);
            ctxBig.stroke();

            ctxMini.ellipse((elem.x+1)*fieldWidthMini-fieldWidthMini/2, (elem.y+1)*fieldHeightMini-fieldHeightMini/2, (fieldWidthMini/2)*elem.r, (fieldHeightMini/2)*elem.r, 0, 0, 2 * Math.PI);
            ctxMini.stroke();

            ctxBig.beginPath();
            ctxBig.ellipse((elem.x+1)*fieldWidthBig-fieldWidthBig/2, (elem.y+1)*fieldHeightBig-fieldHeightBig/2, (fieldWidthBig/2)*0.5, (fieldHeightBig/2)*0.5, 0, 0, 2 * Math.PI);
            ctxBig.fill();
        }
        if(elem.type=="concave" ){

            if(elem.points.length>0){
                ctxBig.ellipse((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2, (fieldWidthBig/2)*0.5, (fieldHeightBig/2)*0.5, 0, 0, 2 * Math.PI);
                ctxBig.fill();
            }
            for (let i = 0; i < elem.points.length-1; i++) {
                ctxBig.moveTo((elem.points[i].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[i].y+1)*fieldHeightBig-fieldHeightBig/2);
                ctxBig.lineTo((elem.points[i+1].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[i+1].y+1)*fieldHeightBig-fieldHeightBig/2);

                ctxMini.moveTo((elem.points[i].x+1)*fieldWidthMini-fieldWidthMini/2, (elem.points[i].y+1)*fieldHeightMini-fieldHeightMini/2);
                ctxMini.lineTo((elem.points[i+1].x+1)*fieldWidthMini-fieldWidthMini/2, (elem.points[i+1].y+1)*fieldHeightMini-fieldHeightMini/2);
            }
            if(elem.canClose){ 
                ctxBig.moveTo((elem.points[elem.points.length-1].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[elem.points.length-1].y+1)*fieldHeightBig-fieldHeightBig/2);
                ctxBig.lineTo((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2);

                ctxMini.moveTo((elem.points[elem.points.length-1].x+1)*fieldWidthMini-fieldWidthMini/2, (elem.points[elem.points.length-1].y+1)*fieldHeightMini-fieldHeightMini/2);
                ctxMini.lineTo((elem.points[0].x+1)*fieldWidthMini-fieldWidthMini/2, (elem.points[0].y+1)*fieldHeightMini-fieldHeightMini/2);
            }
            ctxBig.closePath();
            ctxBig.stroke();
            ctxMini.stroke();
        }
        if(typeof elem.villages!=='undefined'){
            elem.villages.forEach((village)=>{ 
                ctxBig.fillStyle = elem.color+"66";
                ctxBig.fillRect((village.x+1)*fieldWidthBig-fieldWidthBig, (village.y+1)*fieldHeightBig-fieldHeightBig, fieldWidthBig, fieldHeightBig);

                ctxMini.fillStyle = elem.color;
                ctxMini.fillRect((village.x+1)*fieldWidthMini-fieldWidthMini, (village.y+1)*fieldHeightMini-fieldHeightMini, fieldWidthMini, fieldHeightMini);
            });
        }
   
    })
    groups.forEach((group)=>{
        group.villages.forEach((village)=>{
            ctxBig.fillStyle = group.color+"66";
            ctxBig.fillRect((village.x+1)*fieldWidthBig-fieldWidthBig, (village.y+1)*fieldHeightBig-fieldHeightBig, fieldWidthBig, fieldHeightBig);
            ctxMini.fillStyle = group.color;
            ctxMini.fillRect((village.x+1)*fieldWidthMini-fieldWidthMini, (village.y+1)*fieldHeightMini-fieldHeightMini, fieldWidthMini, fieldHeightMini);
        })
    })
}

function translating(){
    let tx = $("#map_coord_x").css('left').replace('px','');
    let ty = $("#map_coord_y").css('top').replace('px','');
    let stx = $("#minimap_container").css('left').replace('px','');
    let sty = $("#minimap_container").css('top').replace('px','');
    translate={x:26500-tx,y:26500-ty}
    translateMini={x:-stx,y:-sty}
}

function updatePos(){
    translating();
    render()
}

function addToGroup(){
    let activeInd=groups.findIndex((g)=>{return g.id==activeGroup.id})
    markers.forEach((marker)=>{
        marker.villages.forEach((village)=>{
            let villInd= groups[activeInd].villages.findIndex((gVillage)=>{return gVillage.id==village.id})
            if(villInd==-1){
                groups[activeInd].villages.push(village)
            }
        })
    })

    markers=[];
    render()
    renderGroupSelect();
}

function resetSelected(){
    markers=[];
    render()
}

window.toClipBoard = () => {
    navigator.clipboard.writeText(selectedVillages.trim());
}

window.renderModal = () => {
    selectedGroups=[];
    window.Dialog.show("groupsModal",
    /*html*/`
        <style>
            ::-webkit-scrollbar {
            width: 5px;
            }
            
            /* Track */
            ::-webkit-scrollbar-track {
                box-shadow: inset 0 0 5px grey;
                border-radius: 10px;
            }
            
            /* Handle */
            ::-webkit-scrollbar-thumb {
                background: grey;
                border-radius: 10px;
            }
            #popup_box_groupsModal{
                width: 1100px !important;
            }
            .container {
                height:500px;
                display: grid; 
                grid-template-columns: 1fr 1fr; 
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
                grid-template-columns: 3fr 2fr 1fr 50px;
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
                grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
                grid-template-rows: 30px;
                gap: 0px 0px;
                grid-auto-flow: row;
                grid-template-areas:
                    "village-name point owner ally type";
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
            .filter-window{
                height:400px;
                width:500px;
                position:fixed;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                margin: auto;
                background: transparent url(https://dshu.innogamescdn.com/asset/fd86cac8/graphic/index/contentbg.png) scroll left top repeat;
                filter: drop-shadow(0 0 0.75rem rgb(88, 88, 88));
                border: 2px solid #6c4824;
                border-radius: 10px;
                display:grid;
                grid-template-rows: 1fr 3fr 25px; 
                gap: 0px 0px;
                grid-template-areas: 
                    "filter-menu"
                    "filter-items"
                    "filter-footer"; 
                padding:5px;
                row-gap:10px;
            }
            .filter-menu{
                display:grid;
                justify-content:center;
                grid-area: filter-menu;
            }
            .filter-sub{
                margin:10px auto;
                display:table;
                justify-content:center;
                grid-area: filter-sub;
            }
            .filter-footer{
                display:flex;
                justify-content:center;
                grid-area: filter-footer;
            }
            .filter-items{
                grid-area: filter-items;
                overflow-y: scroll;
            }

            .filter-sub select{
                max-width:150px;
                font-size:14px;
            }
            .filter-sub div{
                margin-bottom:5px;
            }
            .filter-sub div:first-of-type{
                display: flex;
                justify-content:center;
            }
            .filter-item{
                padding:5px;
                background-color: #fff5da;
                border-top: solid 1px #ebd7af;
                display:flex;
                justify-content:space-between;
            }
        </style>
        <div class="container">
            <div class="menu">
                <button class="btn" onclick="union()">Összevon</button>
                <button class="btn" onclick="subtract()">Kivon</button>
                <button class="btn" onclick="section()">Metszet</button>
                <button class="btn" onclick="openFilter()">Szűrés</button>
                <button class="btn" onclick="deleteSelected()">Törlés</button>
                <span>TW-mapper - v1.1 by: toldi26</span>
                <button style="float:right;" class="btn" onclick="copyCoords()">Másolás</button>
            </div>
            <div class="groups">
                <div class="group-row group-header" >
                    <div class="name">Csoport Név</div>
                    <div class="color">Szín</div>
                    <div class="checkbox">választ</div>
                    <div class="view">Nézet</div>
                </div>
                <div class="group-items">
                </div>
            </div>
            <div class="villages">
                <div class="village-row village-header"  >
                    <div class="village-name">Falu Név</div>
                    <div class="point">Pont</div>
                    <div class="owner">Tulajdonos</div>
                    <div class="ally">Klán</div>
                    <div class="type">Típus</div>
                </div>
                <div class="village-items">
                    
                </div>
            </div>
            <div class="filter-window" style="display:none;">
                <div class="filter-menu">
                    <div class="filter-main">
                        <button class="btn" onclick="barbMenu()">Barbár</button>
                        <button class="btn" onclick="playerMenu()">Játékos</button>  
                        <button class="btn" onclick="allyMenu()">Klán</button>
                        <button class="btn" onclick="pointMenu()">Pont</button>
                        <button class="btn" onclick="bonusMenu()">Bónusz</button>   
                    </div>
                    <div class="filter-sub">
                
                    </div>
                </div>
                
                <div class="filter-items">
                
                </div>
                <div class="filter-footer">
                <input id="copyCheck" type="checkbox"/><label style="padding:5px">Másolat</label>
                <button class="btn" onclick="applyFilter()">Alkalmaz</button>
                <button class="btn" onclick="cancelFilter()">Mégse</button>   
                </div>
            </div>
        </div>
    `);
    renderGroupList();
}

function renderGroupList(){
    let html='';
    groups.forEach((group)=>{
        html+=/* html */`
            <div class="group-row" id="g-${group.id}">
                <div class="name">${group.name} (${group.villages.length})<a onclick="editGroupName(${group.id})" class="rename-icon" href="#" data-title="Átnevez"></a></div>
                <div class="color"><input onchange="changeColor(${group.id})" style="height:20px" type="color" value="${group.color}"></div>
                <div class="checkbox"><input onclick="toggleSelected(${group.id})" type="checkbox" value="${group.id}"></div>
                <div class="view"><button onclick="loadActiveGoup(${group.id})" class="btn">-></button></div>
            </div>
        `
    })
    $('.group-items').html(html);
}

function editGroupName(id){
    let idx = groups.findIndex((group)=>{return group.id==id});
    $('html').find(`#g-${id}`).find('.name').html(`<input value="${groups[idx].name}" type="text"/><button onclick="saveGroupName(${groups[idx].id})" >Átnevez</button>`)
    
}

function saveGroupName(id){
    let idx = groups.findIndex((group)=>{return group.id==id});
    groups[idx].name=$('html').find(`#g-${id}`).find('.name input').val();
    $('html').find(`#g-${id}`).find('.name').html(`${groups[idx].name} (${groups[idx].villages.length})<a onclick="editGroupName(${groups[idx].id})" class="rename-icon" href="#" data-title="Átnevez"></a>`);
    renderGroupSelect();
}

function changeColor(id){
    let idx = groups.findIndex((group)=>{return group.id==id});
    groups[idx].color=$('html').find(`#g-${id}`).find('.color input').val(); 
    render();
}

function loadActiveGoup(id){
    let idx= groups.findIndex((group)=>{return group.id==id})
    activeGroup=groups[idx];
    renderSelectedVillages()
    renderGroupSelect();
}

function renderSelectedVillages(){
    let html='';
    activeGroup.villages.forEach((village)=>{
        let playerName='';
        let AllyName='';
        let pInd=window.players.findIndex((player)=>{return player.id==village.player})
        if(pInd>-1){
            let player=window.players[pInd];
            let aInd=window.allies.findIndex((ally)=>{return ally.id==player.ally})
            playerName=player.name;
            if(aInd>-1){
                let ally=window.allies[aInd];
                AllyName=ally.tag;
            }
        }
       
        html+=/* html */`
        <div class="village-row">
            <div class="village-name"> ${village.name} (${village.x}|${village.y})</div>
            <div class="point">${village.points}</div>
            <div class="owner">${playerName}</div>
            <div class="ally">${AllyName}</div>
            <div class="type">${village.rank>0? `<span class="bonus_icon bonus_icon_${village.rank}"/>`:''}</div>
        </div>
        `
    })
    $('.village-items').html(html);
}

function toggleSelected(id){
    let ind = selectedGroups.findIndex((e)=>{return e==id});
    if(ind==-1){
        selectedGroups.push(id);
        return;
    }
    selectedGroups.splice(ind,1);
}

function deleteSelected(){
    if(selectedGroups.length==0){
        window.UI.ErrorMessage('Nincs egy csoport se kiválasztva!');
        return;
    }

    selectedGroups.forEach((selectedGroup)=>{
       let ind = groups.findIndex((group)=>{return group.id==selectedGroup});
       groups.splice(ind,1);
    })
    selectedGroups=[];
    renderGroupSelect();
    renderGroupList();
}


function union(){
    if(selectedGroups.length<2){
        window.top.UI.ErrorMessage("Nincs elegendő csoport kiválasztva");
        return;
    }
   
    let mainInd = groups.findIndex((group)=>{return group.id==selectedGroups[0]});
    let villages = [...groups[mainInd].villages];

    let name = groups[mainInd].name;
    for (let i = 1; i < selectedGroups.length; i++) {
        let subInd = groups.findIndex((group)=>{return group.id==selectedGroups[i]});
        let subVillages = [...groups[subInd].villages];
        name+=" ∪ "+groups[subInd].name;
        subVillages.forEach((subVillage)=>{
            let ind= villages.findIndex((village)=>{return subVillage.x==village.x && subVillage.y==village.y});
            if(ind==-1){
                villages.push(subVillage);
            }
        })
    }


    groups.push({
        id:new Date().getTime(),
        name:name,
        color: groups[mainInd].color,
        villages:villages
    });

    selectedGroups=[];
    renderGroupSelect();
    renderGroupList();
    render();
}


function subtract(){
    if(selectedGroups.length<2){
        window.top.UI.ErrorMessage("Nincs elegendő csoport kiválasztva");
        return;
    }
    let mainInd = groups.findIndex((group)=>{return group.id==selectedGroups[0]});
    let villages = [...groups[mainInd].villages];
    let name = groups[mainInd].name;

    for (let i = 1; i < selectedGroups.length; i++) {
        let subInd = groups.findIndex((group)=>{return group.id==selectedGroups[i]});
        let subVillages = [...groups[subInd].villages];
        name+=" - "+groups[subInd].name;
        subVillages.forEach((subVillage)=>{
            let ind= villages.findIndex((village)=>{return subVillage.x==village.x && subVillage.y==village.y});
            if(ind!=-1){
                villages.splice(ind,1);
            }
        })
    }

    groups.push({
        id:new Date().getTime(),
        name:name,
        color: groups[mainInd].color,
        villages:villages
    });

    selectedGroups=[];
    renderGroupSelect();
    renderGroupList();
    render();
}



window.section = () => {
    if(selectedGroups.length<2){
        window.top.UI.ErrorMessage("Nincs elegendő csoport kiválasztva");
        return;
    }
    let mainInd = groups.findIndex((group)=>{return group.id==selectedGroups[0]});
    let villages = [...groups[mainInd].villages];
    
    let name = groups[mainInd].name;
    for (let i = 1; i < selectedGroups.length; i++) {
        let subInd = groups.findIndex((group)=>{return group.id==selectedGroups[i]});
        let subVillages = [...groups[subInd].villages];
        let newVillages=[];
        name+=" ∩ "+groups[subInd].name;
        villages.forEach((village)=>{
            let ind= subVillages.findIndex((subVillage)=>{return subVillage.x==village.x && subVillage.y==village.y});
            if(ind!=-1){
                newVillages.push(village);
            }
        })
        villages=newVillages;
    }
    groups.push({
        id:new Date().getTime(),
        name:name,
        color: groups[mainInd].color,
        villages:villages
    });

    selectedGroups=[];
    renderGroupSelect();
    renderGroupList();
    render();
}

function openFilter(){
    if(selectedGroups.length==0){
        window.UI.ErrorMessage('Nincs egy csoport se kiválasztva!');
        return;
    }

    $('.filter-window').show();
    $('.group-items').find('input[type="checkbox"]').get().forEach((elem)=>{
        if(!$(elem).prop('disabled')){
            $(elem).attr("disabled", true);
        }
    })

}

function cancelFilter(){
    $('.filter-window').hide();
    filters=[];
    $('.group-items').find('input[type="checkbox"]').get().forEach((elem)=>{
        if($(elem).prop('disabled')){
            $(elem).attr("disabled", false);
        }
    })
}

function mainMenu(){
    $('.filter-main').show();
    $('.filter-sub').hide();
}

function barbMenu(){
    $('.filter-main').hide();
    $('.filter-sub').html(/*html*/`
        <div>
            <button onclick="addFilter('barbs','+')" class="btn">+ Barbár</button>
            <button onclick="addFilter('barbs','-')" class="btn">- Barbár</button>
            <button onclick="mainMenu()" class="btn">Mégse</button>
        </div>
    `);
    $('.filter-sub').show();
}

function allyMenu(){
    let allies=[];
    selectedGroups.forEach((selectedGroup)=>{
        let gInd=groups.findIndex((group)=>{return group.id==selectedGroup})
        groups[gInd].villages.forEach((village)=>{
            if(village.player!=0){
                let pIndex=window.players.findIndex((player)=>{return player.id==village.player})
                let aIndex=window.allies.findIndex((ally)=>{return window.players[pIndex].ally==ally.id})
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
            <button onclick="addFilter('ally','+')" class="btn">+ klán</button>
            <button onclick="addFilter('ally','-')" class="btn">- Klán</button>
            <button onclick="mainMenu()" class="btn">Mégse</button>
        </div>
    `);
    $('.filter-sub').show();
}

function playerMenu(){
    let players=[];
    selectedGroups.forEach((selectedGroup)=>{
        let gInd=groups.findIndex((group)=>{return group.id==selectedGroup})
        groups[gInd].villages.forEach((village)=>{
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
            <button onclick="addFilter('player','+')" class="btn">+ játékos</button>
            <button onclick="addFilter('player','-')" class="btn">- játékos</button>
            <button onclick="mainMenu()" class="btn">Mégse</button>
        </div>
    `);
    $('.filter-sub').show();
}

function bonusMenu(){
    $('.filter-main').hide();
    $('.filter-sub').html(/*html*/`
        <div>
            <select id="filter-bonus">
                <option value="-1">Csak bónusz</option>
                <option value="0">Nem bónusz</option>
                ${Object.keys(TWMap.bonus_data).map((key)=>{
                    return /*html*/`<option value="${key}">${TWMap.bonus_data[key].text}</option>`
                }).join('')}
            </select>
        </div>
        <div>
            <button onclick="addFilter('bonus','+')" class="btn">+ Búnusz</button>
            <button onclick="addFilter('bonus','-')" class="btn">- Búnusz</button>
            <button onclick="mainMenu()" class="btn">Mégse</button>
        </div>
    `);
    $('.filter-sub').show();
}

function pointMenu(){
    $('.filter-main').hide();
    $('.filter-sub').html(/*html*/`
        <div>
            <label>Falu pont: </label>
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
            <button onclick="addFilter('points','+')" class="btn">+ Pont</button>
            <button onclick="addFilter('points','-')" class="btn">- Pont</button>
            <button onclick="mainMenu()" class="btn">Mégse</button>
        <div>
    `);
    $('.filter-sub').show();
}


function addFilter(type,op){
    let val=null;
    if(type=='points'){
        if($('html').find('#filter-points').val().trim()==""){
            window.UI.ErrorMessage('A szűrési értéket kötelező megadni!')
            return;
        }

        val={
            stmt:$('html').find('#filter-points-select').val(),
            val:$('html').find('#filter-points').val()
        }
    }else if(type=='player'){
        val={
            id:$('html').find('#filter-player').val(),
            name:$('html').find('#filter-player option:selected').text()
        }
    }else if(type=='ally'){
        val={
            id:$('html').find('#filter-ally').val(),
            name:$('html').find('#filter-ally option:selected').text()
        }
    }else if(type=='bonus'){
        val={
            id:$('html').find('#filter-bonus').val(),
            name:$('html').find('#filter-bonus option:selected').text()
        }
    }
    filters.push({
        type:type,
        op:op,
        val:val
    })
    $('.filter-main').show();
    $('.filter-sub').hide();
    renderFilter()
}

function renderFilter(){
    let html='';
    filters.forEach((filter,index)=>{
        let text=``
        switch(filter.type){
            case 'player':
                text=`Játékos ${filter.op=='-'? "eltávolítása":"hozzáadása"}: ${filter.val.name}`;
            break;
            case 'ally':
                text=`Klán ${filter.op=='-'? "eltávolítása":"hozzáadása"}: ${filter.val.name}`;
            break;
            case 'bonus':
                text=`Bónusz ${filter.op=='-'? "eltávolítása":"hozzáadása"}: ${filter.val.name}`;
            break;
            case 'barbs':
                text=`Barbárok ${filter.op=='-'? "eltávolítása":"hozzáadása"}`;
            break;
            case 'points':
                text=`${filter.op=='-'? "Eltávolítás":"Hozzáadás"} ha falu pont ${filter.val.stmt} ${filter.val.val}`;
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
            let newItems=[];
            $('.filter-items .filter-item').get().forEach((item)=>{
                let ind = parseInt($(item).attr('id').replace('fi-',''));
                newItems.push(filters[ind]);
            })
            filters=newItems;
            renderFilter();
        }
    });
}

function removeFilter(index){
    filters.splice(index,1);
    renderFilter();
}

function applyFilter(){
    if(selectedGroups.length==0){
        window.UI.ErrorMessage('Nincs egy csoport se kiválasztva!')
        return;
    }

    if(filters.length==0){
        window.UI.ErrorMessage('Nincs egy szűrő se hozzáadva!')
        return;
    }

    selectedGroups.forEach((selectedGroup)=>{
       
        let ind=groups.findIndex((group)=>{return group.id==selectedGroup});
        let baseVillages=[...groups[ind].villages];
        let villages=[...groups[ind].villages];
        let reseted=false;
        filters.forEach((filter)=>{
            if(filter.op=="+" && !reseted){
                baseVillages=[...villages];
                villages=[];
                reseted=true;
            }else{
                reseted=false;
            }
            switch(filter.type){
                
                case 'player':
                    if(filter.op=="+"){
                        villages=[...addPlayerFilter(filter,baseVillages,villages)]
                    }else{
                        villages=[...removePlayerFilter(filter,villages)]
                    }
                break;
                case 'ally':
                    if(filter.op=="+"){
                        villages=[...addAllyFilter(filter,baseVillages,villages)]
                    }else{
                        villages=[...removeAllyFilter(filter,villages)]
                    }
                break;
                case 'bonus':
                    if(filter.op=="+"){
                        villages=[...addBonusFilter(filter,baseVillages,villages)]
                    }else{
                        villages=[...removeBonusFilter(filter,villages)]
                    }
                break;
                case 'barbs':
                    if(filter.op=="+"){
                        villages=[...addBarbsFilter(baseVillages,villages)]
                    }else{
                        villages=[...removeBarbsFilter(villages)]
                    }
                break;
                case 'points':
                    if(filter.op=="+"){
                        villages=[...addPointsFilter(filter,baseVillages,villages)]
                    }else{
                        villages=[...removePointsFilter(filter,villages)]
                    }
                break;
            }
        })
        if($('#copyCheck').is(':checked')){
            let cc={...groups[ind]}
            cc.villages=villages;
            cc.id=new Date().getTime(),
            groups.push(cc)
        }else{
            groups[ind].villages=villages;
        }
        
    })
    $('.filter-items').html('');
    selectedGroups=[];
    renderGroupList()
    renderGroupSelect()
    render();
    cancelFilter()
    renderSelectedVillages();
}

function addPlayerFilter(filter,base,filtered){
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
}

function removePlayerFilter(filter,filtered){
    let result=[];
    filtered.forEach((village)=>{
        if(village.player!=filter.val.id){
            result.push(village);
        }
    })
    return result;
}

function addAllyFilter(filter,base,filtered){
    let result=[...filtered];
    base.forEach((village)=>{
        pInd=window.players.findIndex((player)=>{return player.id==village.player});
        if(pInd>-1){
            if(window.players[pInd].ally==filter.val.id){
                let ind=filtered.findIndex((fVillage)=>{return fVillage.id==village.id});
                if(ind==-1){
                    result.push(village);
                }
            }
        }
    })
    return result;
}

function removeAllyFilter(filter,filtered){
    let result=[];
    filtered.forEach((village)=>{
        pInd=window.players.findIndex((player)=>{return player.id==village.player});
        if(pInd>-1){
            if(window.players[pInd].ally!=filter.val.id){
                result.push(village);
            }
        }
    })
    return result;
}

function addBonusFilter(filter,base,filtered){
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
}

function removeBonusFilter(filter,filtered){
    let result=[];
    filtered.forEach((village)=>{
        if(village.rank!=filter.val.id && filter.val.id!=-1){
            result.push(village);
        }
        if(village.rank==0 && filter.val.id==-1){
            result.push(village);
        }
    })
    return result;
}

function addBarbsFilter(base,filtered){
    let result=[...filtered];
    base.forEach((village)=>{
        if(village.player==0){
            result.push(village);
        }
    })
    return result;
}

function removeBarbsFilter(filtered){
    let result=[];
    filtered.forEach((village)=>{
        if(village.player!=0){
            result.push(village);
        }
    })
    return result;
}

function addPointsFilter(filter,base,filtered){
    let result=[...filtered];
    base.forEach((village)=>{
        if(statement(filter.val.stmt,village.points,parseInt(filter.val.val))){
            result.push(village);
        }
    })
    return result;
}

function removePointsFilter(filter,filtered){
    let result=[];
    filtered.forEach((village)=>{
        if(!statement(filter.val.stmt,village.points,parseInt(filter.val.val))){
            result.push(village);
        }
    })
    return result;
}

function statement(op,x,val){
    switch (op) {
        case ">":
            return x > val
        case "<":
            return x < val
        case "=":
            return x = val
        case ">=":
            return x >= val
        case "<=":
            return x <= val
        case "!=":
            return x != val
    }
}

function copyCoords(){
    window.UI.SuccessMessage('A koordináták sikeresen vágólapra lettek másolva!')
    navigator.clipboard.writeText(activeGroup.villages.map((village)=>{return village.x+"|"+village.y}).join(' '));
}