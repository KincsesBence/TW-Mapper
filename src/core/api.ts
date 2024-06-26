import { loadingWindow } from "../view/loadingWindow";
import { Lang } from "./Language";
import { xml2json } from "./xml2json";

const server:string="https://"+window.location.hostname;
const unitConfigAPI:string="/interface.php?func=get_unit_info";
const gameConfigAPI:string="/interface.php?func=get_config";

export async function getServerConfig():Promise<gameConfig>{
    let json:gameConfig;
    let gameConfig = localStorage.getItem('get_config');
    if(gameConfig==null){
        let result = await $.ajax({url: server+gameConfigAPI});
        json = xml2json(result,"")
        localStorage.setItem('get_config',JSON.stringify(json));
    }else{
        json=JSON.parse(gameConfig);
    }
    return  json;
}

export async function getUnitConfig():Promise<unitConfig>{
    let json:unitConfig;
    let unitConfig = localStorage.getItem('get_unit_info');
    if(unitConfig==null){
        let result = await $.ajax({url: server+unitConfigAPI});
        json = xml2json(result,"")
        localStorage.setItem('get_unit_info',JSON.stringify(json));
    }else{
        json=JSON.parse(unitConfig);
    }
    return json;
}


async function parseCSVToIndexed(data:string,tableName:string,fields:string[]){
    console.log('started '+tableName);
    
    let lines = data.trim().split('\n');
    await sendUpdate(lines,0,tableName,fields);
    console.log('finished outer'+tableName);
}

async function sendUpdate(lines:string[],i:number,tableName:string,fields:string[]){
    return new Promise<any>(async (resolve,reject)=>{
        let obj = decodeLine(lines[i],fields)
        await window.DB.setData(tableName,obj)
        let pct:number=Math.ceil((i+1)/lines.length*100);$('html').find('.mapper-loader-label').text(`${pct}%`);
        $('html').find('#mapper-loader-pct').css('width',`${pct}%`)
        $('html').find('#mapper-loading span').text(`${Lang(tableName) } ${Lang('loading') }...` );
        i++;
        if(i<lines.length){
            await sendUpdate(lines,i,tableName,fields);
        }
        resolve('done');
        return
    })
}

function decodeLine(line:string,fields:string[]){
    let cols=line.split(',');
    let obj:any={};
    cols.forEach((col,index)=>{
        let fieldValue:any=decodeURIComponent(col).replaceAll('+',' ')
        if(!isNaN(fieldValue)){
            fieldValue=parseInt(fieldValue);
        }
        obj[fields[index]]=fieldValue;
        
    })
    return obj;
}

export function getLastUpdate(){
    let lastUpdate= new Date(parseInt(localStorage.getItem('TW_API_LAST_UPDATE'))-(60*60*24*1000));
    return lastUpdate.toLocaleString('hu-HU');
}

function getData(ajaxurl:string) { 
    return $.ajax({
      url: ajaxurl,
      type: 'GET',
    });
};

export async function updateWorldData(){
    let lastUpdate= parseInt(localStorage.getItem('TW_API_LAST_UPDATE'));
    if(lastUpdate>new Date().getTime()) return;
    await update()
}

export async function update() {
    console.log('Updating...');
    window.Dialog.show("launchDialog",loadingWindow());
    $('.popup_box_close').hide();
    $('.popup_box_container').append('<div style="position: fixed;width: 100%;height: 100%;top:0;left:0;z-index:12001"></div>');
    let resVillages= await getData(`${server}/map/village.txt`);
    let resPlayers = await getData(`${server}/map/player.txt`);
    let resAllies = await getData(`${server}/map/ally.txt`);
    await parseCSVToIndexed(resVillages,'villages',['id','name','x','y','player','points','rank']);
    await wait(1000);
    await parseCSVToIndexed(resPlayers,'players',['id','name','ally','villages','points','rank']);
    await wait(1000);
    await parseCSVToIndexed(resAllies,'allies',['id','name','tag','members','villages','points','all_points','rank']);
    await wait(1000);
    localStorage.setItem('TW_API_LAST_UPDATE',new Date(new Date().setDate(new Date().getDate() + 1)).getTime().toString());
    $('html').find('#mapper-loading span').text(Lang('api_updated') );
    await wait(2000);
    window.Dialog.close("launchDialog");
    console.log('Update finished');
}

async function wait(ms:number) {
    return new Promise<void>(async (resolve,reject)=>{
        setTimeout(()=>{
            resolve();
        },ms)
    })
    
}

export function redirect(){
    if(!window.location.href.includes('screen=map')) {
        window.top.UI.InfoMessage(Lang('redirect_to_map'));
        setTimeout(()=>{
            window.location.href=`game.php?village=${window.game_data.village.id}&screen=map`
        },1000);
        return true;
    }
    return false;
}


export function getTravelTime(distance:number,unit:string):string{
    let speed = window.unitConfig[unit as keyof unitConfig].speed;
    let time = Math.round((speed * 1000 / window.gameConfig.speed / (window.gameConfig.unit_speed)) * distance);
    let h=Math.floor(time/60000);
    time-=h*60000;
    let m=Math.floor(time/1000);
    time-=m*1000;
    let s = Math.floor(time/16.5);
    return `${h.toString().padStart(1,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}