import { Vec2d } from "./Vec2d";

const fieldHeightBig=38;
const fieldWidthBig=53;
const fieldHeightMini=5;
const fieldWidthMini=5;

export const mapAction = function (e:any) {
    var pos = this.coordByEvent(e);
    if(!window.canDraw){
        return false;
    }
    switch(window.mapMenu.selectedTool){
        case 'circle':
            drawCircle(new Vec2d(pos[0],pos[1]))
        break;
        case 'concave':
            drawConcave(new Vec2d(pos[0],pos[1]))
        break;
        case 'rectangle':
            drawRectangle(new Vec2d(pos[0],pos[1]))
        break;
        case 'single':
            drawSingle(new Vec2d(pos[0],pos[1]))
        break;
        case 'kontinent':
            drawKontinent(new Vec2d(pos[0],pos[1]))
        break;
        case 'tape':
            drawTape(new Vec2d(pos[0],pos[1]))
        break; 
    }
    return false;
}


export function initMap(){
    $("#minimap_mover").append('<canvas id="mini_map" />');
    $("#map_mover").append('<canvas id="big_map" />');
    $('[onclick*="VillageInfo.Notes.toggleEdit()"]').removeAttr("onclick");
    let canvasMini =  document.getElementById('mini_map') as HTMLCanvasElement;
    window.ctxMini = canvasMini.getContext('2d');
    let canvasBig = document.getElementById('big_map') as HTMLCanvasElement;
    window.ctxBig  = canvasBig.getContext('2d');

    window.ctxBig.canvas.width =  $("#map_mover").innerWidth();
    window.ctxBig.canvas.height =  $("#map_mover").innerHeight();
    window.ctxMini.canvas.width =  $("#minimap_mover").innerWidth();
    window.ctxMini.canvas.height =  $("#minimap_mover").innerHeight();

    window.ctxBig.save();
    window.ctxMini.save();
    translating();
    render();
    const observer = new MutationObserver(updatePos);
    observer.observe(document.querySelector("#map_container"), { attributes: true });
}

function translating(){
    let tx = parseFloat($("#map_coord_x").css('left').replace('px',''));
    let ty = parseFloat($("#map_coord_y").css('top').replace('px',''));
    let stx = parseFloat($("#minimap_container").css('left').replace('px',''));
    let sty = parseFloat($("#minimap_container").css('top').replace('px',''));
    window.translateBig = new Vec2d(26500,26500).subtr(new Vec2d(tx,ty));
    window.translateMini = new Vec2d(-stx,-sty);
}

function render(){
    window.ctxBig.canvas.width =  $("#map_mover").innerWidth();
    window.ctxBig.canvas.height =  $("#map_mover").innerHeight();
    window.ctxMini.canvas.width =  $("#minimap_mover").innerWidth();
    window.ctxMini.canvas.height =  $("#minimap_mover").innerHeight();
    window.ctxBig.clearRect(0, 0, window.ctxBig.canvas.width, window.ctxBig.canvas.height);
    window.ctxMini.clearRect(0, 0, window.ctxMini.canvas.width, window.ctxMini.canvas.height);
    window.ctxMini.reset();
    window.ctxMini.translate(-window.translateMini.x,-window.translateMini.y);
    window.ctxBig.reset();
    window.ctxBig.translate(-window.translateBig.x,-window.translateBig.y);
    window.markers.forEach((elem:marker)=>{
        window.ctxMini.strokeStyle = elem.color;
        window.ctxBig.strokeStyle = elem.color;
        window.ctxMini.fillStyle = elem.color+"80";
        window.ctxBig.fillStyle = elem.color+"80";
        window.ctxMini.lineWidth = 2;
        window.ctxBig.lineWidth = 5;
        

        switch(elem.type){
            case 'circle':
                renderCircle(elem);
            break;
            case 'concave':
                renderConcave(elem);
            break;
            case 'rectangle':
                renderRectangle(elem);
            break;
            case 'kontinent':
                renderKontinent(elem);
            break;
            case 'tape':
                renderTape(elem);
            break;
        }
        
        if(typeof elem.villages!=='undefined'){
            elem.villages.forEach((village)=>{ 
                window.ctxBig.fillStyle = elem.color+"66";
                window.ctxBig.fillRect((village.x+1)*fieldWidthBig-fieldWidthBig, (village.y+1)*fieldHeightBig-fieldHeightBig, fieldWidthBig, fieldHeightBig);

                window.ctxMini.fillStyle = elem.color;
                window.ctxMini.fillRect((village.x+1)*fieldWidthMini-fieldWidthMini, (village.y+1)*fieldHeightMini-fieldHeightMini, fieldWidthMini, fieldHeightMini);
            });
        }
   
    })
    window.groups.forEach((group)=>{
        group.villages.forEach((village)=>{
            window.ctxBig.fillStyle = group.color+"66";
            window.ctxBig.fillRect((village.x+1)*fieldWidthBig-fieldWidthBig, (village.y+1)*fieldHeightBig-fieldHeightBig, fieldWidthBig, fieldHeightBig);
            window.ctxMini.fillStyle = group.color;
            window.ctxMini.fillRect((village.x+1)*fieldWidthMini-fieldWidthMini, (village.y+1)*fieldHeightMini-fieldHeightMini, fieldWidthMini, fieldHeightMini);
        })
    })
}

function renderConcave(elem:marker){
    window.ctxBig.beginPath();
    if(elem.points.length>0){
        window.ctxBig.ellipse((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2, (fieldWidthBig/2)*0.5, (fieldHeightBig/2)*0.5, 0, 0, 2 * Math.PI);
        window.ctxBig.fill();
    }
    
    for (let i = 0; i < elem.points.length-1; i++) {
        renderLines(elem.points[i],elem.points[i+1])
    }
    if(elem.canClose){
        renderLines(elem.points[0],elem.points[elem.points.length-1])
    }
    window.ctxMini.stroke();
    window.ctxBig.stroke();
}

function renderRectangle(elem:marker){
    if(elem.points.length>=1){
        window.ctxBig.beginPath();
        window.ctxBig.ellipse((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2, (fieldWidthBig/2)*0.5, (fieldHeightBig/2)*0.5, 0, 0, 2 * Math.PI);
        window.ctxBig.fill();
        window.ctxBig.closePath();
    }
    if(elem.points.length==2){
        window.ctxBig.beginPath();
        window.ctxBig.setLineDash([5, 15]);
        window.ctxBig.moveTo((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2);
        window.ctxBig.lineTo((elem.points[1].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[1].y+1)*fieldHeightBig-fieldHeightBig/2);
        window.ctxBig.stroke();
        window.ctxBig.closePath();
    }
    if(elem.canClose){
        window.ctxBig.beginPath();
        window.ctxMini.beginPath();
        window.ctxBig.setLineDash([]);
        let from = new Vec2d(elem.points[0].x,elem.points[0].y);
        let to = from.subtr(elem.points[1]);
        console.log(to);
        window.ctxBig.rect(elem.points[1].x*fieldWidthBig, elem.points[1].y*fieldHeightBig,(to.x+1)*fieldWidthBig, (to.y+1)*fieldHeightBig);
        window.ctxBig.stroke();
        window.ctxMini.rect(elem.points[1].x*fieldWidthMini, elem.points[1].y*fieldHeightMini,(to.x+1)*fieldWidthMini, (to.y+1)*fieldHeightMini);
        window.ctxMini.stroke();
        window.ctxBig.closePath();
        window.ctxMini.closePath();
    }
}
function renderKontinent(elem:marker){
        window.ctxBig.beginPath();
        window.ctxMini.beginPath();
        window.ctxBig.setLineDash([]);
        console.log(elem.points);
        let from = elem.points[0];
        let to = from.subtr(elem.points[1]);
        window.ctxBig.rect(elem.points[1].x*fieldWidthBig, elem.points[1].y*fieldHeightBig,(to.x+1)*fieldWidthBig, (to.y+1)*fieldHeightBig);
        window.ctxBig.stroke();
        window.ctxMini.rect(elem.points[1].x*fieldWidthMini, elem.points[1].y*fieldHeightMini,(to.x+1)*fieldWidthMini, (to.y+1)*fieldHeightMini);
        window.ctxMini.stroke();
        window.ctxBig.closePath();
        window.ctxMini.closePath();
}


function renderCircle(elem:marker){
    if(elem.points.length>=1){
        window.ctxBig.beginPath();
        window.ctxBig.ellipse((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2, (fieldWidthBig/2)*0.5, (fieldHeightBig/2)*0.5, 0, 0, 2 * Math.PI);
        window.ctxBig.fill();
        window.ctxBig.closePath();
    }
    if(elem.points.length==2){
        window.ctxBig.beginPath();
        window.ctxBig.setLineDash([5, 15]);
        window.ctxBig.moveTo((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2);
        window.ctxBig.lineTo((elem.points[1].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[1].y+1)*fieldHeightBig-fieldHeightBig/2);
        window.ctxBig.stroke();
        window.ctxBig.closePath();
    }            
    if(elem.canClose){
        window.ctxBig.beginPath();
        window.ctxMini.beginPath();
        window.ctxBig.setLineDash([]);
        window.ctxBig.ellipse((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2, (fieldWidthBig/2)*elem.length*2, (fieldHeightBig/2)*elem.length*2, 0, 0, 2 * Math.PI);
        window.ctxBig.stroke();
        window.ctxMini.ellipse((elem.points[0].x+1)*fieldWidthMini-fieldWidthMini/2, (elem.points[0].y+1)*fieldHeightMini-fieldHeightMini/2, (fieldWidthMini/2)*elem.length*2, (fieldHeightMini/2)*elem.length*2, 0, 0, 2 * Math.PI);
        window.ctxMini.stroke();
        window.ctxBig.closePath();
        window.ctxMini.closePath();
    }
}

function renderTape(elem:marker){
    if(elem.points.length>=1){
        window.ctxBig.beginPath();
        window.ctxBig.ellipse((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2, (fieldWidthBig/2)*0.5, (fieldHeightBig/2)*0.5, 0, 0, 2 * Math.PI);
        window.ctxBig.fill();
        window.ctxBig.setLineDash([]);
        window.ctxBig.stroke();
        window.ctxBig.closePath();
    }
    if(elem.points.length==2){
        window.ctxBig.beginPath();
        window.ctxBig.setLineDash([5, 10]);
        window.ctxBig.moveTo((elem.points[0].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[0].y+1)*fieldHeightBig-fieldHeightBig/2);
        window.ctxBig.lineTo((elem.points[1].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[1].y+1)*fieldHeightBig-fieldHeightBig/2);
        window.ctxBig.stroke();
        window.ctxBig.closePath();
        window.ctxBig.beginPath();
        window.ctxBig.setLineDash([]);
        window.ctxBig.ellipse((elem.points[1].x+1)*fieldWidthBig-fieldWidthBig/2, (elem.points[1].y+1)*fieldHeightBig-fieldHeightBig/2, (fieldWidthBig/2)*0.5, (fieldHeightBig/2)*0.5, 0, 0, 2 * Math.PI);
        window.ctxBig.stroke();
        window.ctxBig.fill();
        window.ctxBig.closePath();

    }            
    if(elem.canClose){
        window.ctxBig.fillStyle = 'white';
        window.ctxBig.fillRect(elem.points[1].x*fieldWidthBig, elem.points[1].y*fieldHeightBig-24,100,26);
        window.ctxBig.fillStyle = 'black';
        window.ctxBig.font = "24px serif";
        window.ctxBig.fillText(elem.length.toFixed(2), elem.points[1].x*fieldWidthBig, elem.points[1].y*fieldHeightBig);
    }
}

function renderLines(point:Vec2d,point2:Vec2d){
    window.ctxBig.moveTo((point.x+1)*fieldWidthBig-fieldWidthBig/2, (point.y+1)*fieldHeightBig-fieldHeightBig/2);
    window.ctxBig.lineTo((point2.x+1)*fieldWidthBig-fieldWidthBig/2, (point2.y+1)*fieldHeightBig-fieldHeightBig/2);

    window.ctxMini.moveTo((point.x+1)*fieldWidthMini-fieldWidthMini/2, (point.y+1)*fieldHeightMini-fieldHeightMini/2);
    window.ctxMini.lineTo((point2.x+1)*fieldWidthMini-fieldWidthMini/2, (point2.y+1)*fieldHeightMini-fieldHeightMini/2);
}

function updatePos(){
    translating();
    render()
}




function drawCircle(point:Vec2d){
    let idx = window.markers.findIndex((marker:marker)=>{ return marker.id==window.activeMarker});
    console.log(idx);
    
    if(idx==-1){
        window.activeMarker=new Date().getTime()
        window.markers.push({
            id:window.activeMarker,
            type:"circle",
            points:[point],
            canClose:false,
            color: window.activeGroup.color,
            villages:[]
        })
       
    }else{
        window.markers[idx].points.push(point); 
        if(window.markers[idx].points.length==2){
            let distance=window.markers[idx].points[0].getDistance(window.markers[idx].points[1]);
            console.log(distance);
            window.activeMarker=window.markers[idx].id;
            window.markers[idx].length=distance;
            window.markers[idx].canClose = true;
            window.markers[idx].villages = getVillagesByCircle(distance,window.markers[idx].points[0])
            window.activeMarker = null;
        }
    }
    render();
}

function drawRectangle(point:Vec2d){
    let idx = window.markers.findIndex((marker:marker)=>{ return marker.id==window.activeMarker});
    
    if(idx==-1){
        window.activeMarker=new Date().getTime()
        window.markers.push({
            id:window.activeMarker,
            type:"rectangle",
            points:[point],
            canClose:false,
            color: window.activeGroup.color,
            villages:[]
        })
       
    }else{
        window.markers[idx].points.push(point); 

        if(window.markers[idx].points.length==2){
            window.activeMarker=window.markers[idx].id;
            window.markers[idx].canClose = true;
            window.markers[idx].points = window.markers[idx].points.sort((pointA,pointB)=>{return (pointA.x>=pointB.x && pointA.y>=pointB.y)? -1:1})
            window.markers[idx].villages = getVillagesByRectangle([...window.markers[idx].points])
            window.activeMarker = null;
        }
    }
    render();
}

async function drawSingle(point:Vec2d){
    let vil = getVillagesByRectangle([point,point]);
    let ind = window.markers.findIndex((markers)=>{return markers.villages[0].id==vil[0].id})
    if(ind==-1){
        window.activeMarker=new Date().getTime()
        window.markers.push({
            id:window.activeMarker,
            type:'single',
            points:[point],
            villages: vil,
            color: window.activeGroup.color,
            canClose:false,
        })
        
        window.activeMarker = null
    }else{
        window.markers.splice(ind,1);
    }
    render();
}

async function drawKontinent(point:Vec2d){

    let baseX=Math.floor(point.x/100)*100;
    let baseY=Math.floor(point.y/100)*100;
    let from=new Vec2d(baseX,baseY)
    let to=from.add(new Vec2d(99,99));
    let vil = getVillagesByRectangle([to,from]);
    let ind = window.markers.findIndex((markers)=>{return markers.villages[0].id==vil[0].id})
    if(ind==-1){
        window.activeMarker=new Date().getTime()
        window.markers.push({
            id:window.activeMarker,
            type:'kontinent',
            points:[to,from],
            villages: vil,
            color: window.activeGroup.color,
            canClose:true,
        })
        
        window.activeMarker = null
    }else{
        window.markers.splice(ind,1);
    }
    render();
}

async function drawConcave(point:Vec2d){
    let idx = window.markers.findIndex((marker:marker)=>{ return marker.id==window.activeMarker});
    if(idx==-1){
        window.activeMarker=new Date().getTime()
        window.markers.push({
            id:window.activeMarker,
            type:"concave",
            points:[point],
            canClose:false,
            color: window.activeGroup.color,
            villages: []
        })
        render();
    }else{
        if(window.markers[idx].points[0].equal(point)){
            window.activeMarker=window.markers[idx].id;
            window.markers[idx].canClose=true;
            window.markers[idx].villages = getVillagesByConcave(window.markers[idx].points)
        }else{
            window.markers[idx].points.push(point); 
        }
        render();
    }
}

function drawTape(point:Vec2d){
    let idx = window.markers.findIndex((marker:marker)=>{ return marker.type=='tape' && marker.canClose});
    if(idx>-1){
        window.markers.splice(idx,1);
    }

    idx = window.markers.findIndex((marker:marker)=>{ return marker.id==window.activeMarker});
    console.log(idx);
    
    if(idx==-1){
        window.activeMarker=new Date().getTime()
        window.markers.push({
            id:window.activeMarker,
            type:"tape",
            points:[point],
            canClose:false,
            color: window.activeGroup.color,
            villages:[]
        })
    }else{
        window.markers[idx].points.push(point); 
        if(window.markers[idx].points.length==2){
            let distance=window.markers[idx].points[0].getDistance(window.markers[idx].points[1]);
            window.activeMarker=window.markers[idx].id;
            window.markers[idx].length=distance;
            window.markers[idx].canClose = true;
            window.markers[idx].villages = [];
            window.activeMarker = null;
        }
    }

    render();
}

function getVillagesByRectangle(points:Vec2d[]):village[]{
    let villages = window.villages;
    let villagesOpt:village[]=[];
    villages.forEach((village)=>{
        if(village.x>=points[1].x && village.x<=points[0].x && village.y>=points[1].y && village.y<=points[0].y){
            villagesOpt.push(village);
        }
    })
    return villagesOpt;
}

function getVillagesByConcave(points:Vec2d[]):village[]{
    let minX=Infinity;  
    let maxX=-Infinity; 
    let minY=Infinity;  
    let maxY=-Infinity; 
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
    
    let villagesOpt:village[]=[];
    villages.forEach((village)=>{
        if(village.x>=minX && village.x<=maxX && village.y>=minY && village.y<=maxY){
                villagesOpt.push(village);
        }
    })

    let villagesInside:village[] =[]
  
    villagesOpt.forEach((village)=>{
        let ins=false;
        if(rayCasting(points,new Vec2d(village.x,village.y))){
            ins=true;
        }

        for (let i = 0; i < points.length-1; i++) {
            if(calcIsInsideThickLineSegment(points[i],new Vec2d(village.x,village.y),points[i+1],0.2)){
                ins=true;
            }
        }

        if(calcIsInsideThickLineSegment(points[0],new Vec2d(village.x,village.y),points[points.length-1],0.2)){
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

function getVillagesByCircle(r:number,point:Vec2d):village[]{
    let villages = window.villages;
    let villagesOpt:village[]=[];
    villages.forEach((village:village)=>{
        if(point.getDistance(new Vec2d(village.x,village.y))<=r){
            villagesOpt.push(village);
        }
    })
    return villagesOpt;
}

function calcIsInsideThickLineSegment(line1:Vec2d, pnt:Vec2d, line2:Vec2d, lineThickness:number) {
    var L2 = ( ((line2.x - line1.x) * (line2.x - line1.x)) + ((line2.y - line1.y) * (line2.y - line1.y)) );
    if(L2 == 0) return false;
    var r = ( ((pnt.x - line1.x) * (line2.x - line1.x)) + ((pnt.y - line1.y) * (line2.y - line1.y)) ) / L2;

    //line thickness is circular
    if(r < 0) {
        //Outside line1
        return line1.getDistance(pnt) <= lineThickness;
    } else if((0 <= r) && (r <= 1)) {
        //On the line segment
        var s = (((line1.y - pnt.y) * (line2.x - line1.x)) - ((line1.x - pnt.x) * (line2.y - line1.y))) / L2;
        return (Math.abs(s) * Math.sqrt(L2) <= lineThickness);
    } else {
        //Outside line2
        return line1.getDistance(pnt) <= lineThickness;
    }
}


function rayCasting(polygon:Vec2d[],point:Vec2d) {
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


document.addEventListener("keydown", (event) => {
    switch(event.key){
        case "Shift":
            window.canDraw=true;
        break;
    }
});

document.addEventListener("keyup", (event) => {
    switch(event.key){
        case "Shift":
            window.canDraw=false;
        break;
    }
});