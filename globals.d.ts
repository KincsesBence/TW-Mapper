import { indexedDBHandler } from "./src/core/indexedDBHandler";

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

  interface Window {
    Lang:string;
    UI:UI,
    Dialog:Dialog;
    DB:indexedDBHandler;
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