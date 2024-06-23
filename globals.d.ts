import { indexedDBHandler } from "./src/core/indexedDBHandler";
import { Vec2d } from "./src/core/Vec2d";
declare module '*.css';
declare module "*.html" {
    const content: string;
    export default content;
}

declare global {

  interface player {
    id:number,
    name:string,
    ally:number,
    villages:number,
    points:number,
    rank:number
  }

  type village = {
    id:number,
    name:string,
    x:number,
    y:number,
    player:number,
    points:number,
    rank:number
  }

  type ally = {
    id:number,
    name:string,
    tag:string,
    members:number,
    villages:number,
    points:number,
    all_points:number,
    rank:number
  }

  type group = {
    id:number
    name:string
    color:string,
    villages:village[]
  }

  type marker ={
    id:number,
    color:string,
    type:string,
    canClose:boolean,
    points:Vec2d[]
    length?:number,
    villages:village[],
  }

  interface mapMenu {
    selectTool:(tool:string,elem:HTMLElement) => void 
    updateApi:() => void 
    newGroupModal:() => void 
    addNewGroup:() => void 
    cancelNewGroupModal:() => void 
    renderGroupSelect:() => void 
    toggleDrawing:() => void 
    toggleInfo:() => void
    isDrawing:boolean;
    selectedTool:string;
  }
  interface map{
    _handleClick:(e:any)=>boolean
  }

  interface TWMap{
    map:map
  }

  interface Window {
    Lang:string;
    UI:UI,
    TWMap:TWMap,
    Dialog:Dialog;
    DB:indexedDBHandler;
    mapMenu:mapMenu;
    groups:group[];
    activeGroup:group;
    backupTW:() => void
    ctxMini:CanvasRenderingContext2D,
    ctxBig:CanvasRenderingContext2D,
    translateBig:Vec2d
    translateMini:Vec2d
    markers:marker[]
    activeMarker:number;
    canDraw:boolean;
    villages:village[];
  }

  interface UI {
    InfoMessage:(msg:string)=>void
    SuccessMessage:(msg:string)=>void
    ErrorMessage:(msg:string)=>void
  }
  
  interface Dialog{
    show : (name:string,content:string)=> void
    close: (name:string)=> void
  } 

}