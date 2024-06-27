import { indexedDBHandler } from "./src/core/indexedDBHandler";
import { Vec2d } from "./src/core/Vec2d";
declare module '*.css';
declare module "*.html" {
    const content: string;
    export default content;
}

declare global {

  interface unitConfig {
    archer?:unitData
    axe:unitData
    catapult:unitData
    heavy:unitData
    knight:unitData
    light:unitData
    marcher?:unitData
    ram:unitData
    snob:unitData
    spear:unitData
    spy:unitData
    sword:unitData
  }

  interface unitData {
    build_time:number
    pop:number
    speed:number
    attack:number
    defense:number
    defense_cavalry:number
    defense_archer:number
    carry:number
  }

  interface build {
    destroy:number
  }

  interface misc{
    kill_ranking:number,
    tutorial:number,
    trade_cancel_time:number,
  }

  interface commands{
    millis_arrival:number,
    command_cancel_time:number
  }

  interface newbie{
    days:number,
    ratio_days:number
    ratio:number
    removeNewbieVillages:number
  }
  interface game{
    buildtime_formula:number
    knight:number
    knight_new_items:number
    knight_archer_bonus:number
    archer:number
    tech:number
    farm_limit:number
    church:number
    watchtower:number
    stronghold:number
    fake_limit:number
    barbarian_rise:number
    barbarian_shrink:number
    barbarian_max_points:number
    scavenging:number
    hauls:number
    hauls_base:number
    hauls_max:number
    base_production:number
    event:number
    suppress_events:number
  }

  interface buildings{
    custom_main:number
    custom_farm:number
    custom_storage:number
    custom_place:number
    custom_barracks:number
    custom_church:number
    custom_smith:number
    custom_wood:number
    custom_stone:number
    custom_iron:number
    custom_market:number
    custom_stable:number
    custom_wall:number
    custom_garage:number
    custom_hide:number
    custom_snob:number
    custom_statue:number
    custom_watchtower:number
  }

  interface snob{
    gold:number
    cheap_rebuild:number
    rise:number
    max_dist:number
    factor:number
    coin_wood:number
    coin_stone:number
    coin_iron:number
    no_barb_conquer:number
  }

  interface c_ally{
    no_harm:number
    no_other_support:number
    no_other_support_type:number
    allytime_support:number
    no_leave:number
    no_join:number
    limit:number
    fixed_allies:number
    wars_member_requirement:number
    wars_points_requirement:number
    wars_autoaccept_days:number
    levels:number
    xp_requirements:number
  }

  interface config_coord{
    map_size:number,
    func:number,
    empty_villages:number,
    bonus_villages:number,
    inner:number,
    select_start:number,
    village_move_wait:number,
    snob_restart:number,
    start_villages:number,
  }

  interface sitter{
    allow:number
  }

  interface sleep{
    active:number,
    delay:number,
    min:number,
    max_awake:number,
    min_awake:number,
    warn_time:number,
  }

  interface night{
    active:number,
    start_hour:number,
    end_hour:number,
    def_factor:number,
    duration:number,
  }

  interface win{
    check:number
  }


  interface gameConfig {
    speed:number,
    unit_speed:number,
    moral:number,
    build:build,
    misc:misc,
    commands:commands
    newbie:newbie
    game:game
    buildings:buildings
    snob:snob
    ally:c_ally
    coord:config_coord
    sitter:sitter
    sleep:sleep
    night:night
    win:win
  }

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
    resetMarkers:() => void,
    addToGroup:() => void,
    selectTool:(tool:string,elem:HTMLElement) => void 
    updateApi:() => void 
    newGroupModal:() => void 
    addNewGroup:() => void 
    cancelNewGroupModal:() => void 
    renderGroupSelect:() => void 
    toggleDrawing:() => void 
    toggleInfo:() => void
    groupChanged:() => void 
    openGroups:() => void
    isDrawing:boolean;
    selectedTool:string;
  }
  interface map{
    _handleClick:(e:any)=>boolean
  }

  interface TWMap{
    map:map
    bonus_data:any
    focusSubmit:()=>void
  }
  interface bonus_keydata{
    text:string
    image:string
  }



  interface gameData{
    village:village
    units:string[]
  }

  interface groupWindow{
    selectedGroups:number[]
    renderGroupList:()=>void
    editGroupName:(id:number) =>void,
    saveGroupName:(id:number) =>void
    changeColor:(id:number) =>void
    loadActiveGoup:(id:number) =>void
    renderSelectedVillages:()=>void
    toggleSelected:(id:number)=>void
    deleteSelected:()=>void
    union:()=>void
    subtract:()=>void
    section:()=>void
    copyCoords:()=>void
    openFilter:()=>void
    openImportCoords:()=>void
    goTo:(x:number,y:number)=>void
  }

  type filter= {
    type:string,
    op:string,
    val:val
  }

  type val = {
    id?:number,
    name?:string,
    stmt?:string,
    val?:string | number
  }

  interface filterWindow{
    filters:filter[]
    barbMenu:()=>void
    playerMenu :()=>void
    allyMenu:()=>void
    pointMenu:()=>void
    bonusMenu:()=>void
    applyFilter:()=>void
    cancelFilter:()=>void
    mainMenu:()=>void
    renderFilter:()=>void
    removeFilter:(index:number)=>void
    addFilter:(type:string,op:string)=>void
    addPlayerFilter:(filter:filter,base:village[],filtered:village[])=>village[]
    removePlayerFilter:(filter:filter,filtered:village[])=>village[]
    addAllyFilter:(filter:filter,base:village[],filtered:village[])=>village[]
    removeAllyFilter:(filter:filter,filtered:village[])=>village[]
    addBonusFilter:(filter:filter,base:village[],filtered:village[])=>village[]
    removeBonusFilter:(filter:filter,filtered:village[])=>village[]
    addBarbsFilter:(base:village[],filtered:village[])=>village[]
    removeBarbsFilter:(filtered:village[])=>village[]
    addPointsFilter:(filter:filter,base:village[],filtered:village[])=>village[]
    removePointsFilter:(filter:filter,filtered:village[])=>village[]
    statement:(op:string,x:number,val:number)=>boolean
  }

  interface importWindow{
    importVillages:village[],
    to:NodeJS.Timeout,
    cancelImport:()=>void
    importCoords:()=>void
    textareaChanged:(e:Event)=>void
  }

  interface Window {
    Lang:string;
    UI:UI,
    TWMap:TWMap,
    Dialog:Dialog;
    DB:indexedDBHandler;
    mapMenu:mapMenu;
    groupWindow:groupWindow;
    filterWindow:filterWindow;
    importWindow:importWindow;
    groups:group[];
    activeGroup:group;
    backupTW:(e:any) => boolean;
    ctxMini:CanvasRenderingContext2D;
    ctxBig:CanvasRenderingContext2D;
    translateBig:Vec2d;
    translateMini:Vec2d;
    markers:marker[];
    activeMarker:number;
    canDraw:boolean;
    villages:village[];
    players:player[];
    allies:ally[];
    game_data:gameData;
    gameConfig:gameConfig;
    unitConfig:unitConfig;
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