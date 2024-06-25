/*! For license information please see bundle.js.LICENSE.txt */(()=>{"use strict";var e={"./src/core/Language.ts":(e,n,t)=>{t.r(n),t.d(n,{Lang:()=>a,determineLang:()=>s});var i=t("./src/view/language/en.ts"),o=t("./src/view/language/hu.ts");function a(e){let n=o.hu;switch(window.Lang){case"hu":n=o.hu;break;case"en":n=i.en}return n.hasOwnProperty(e)?n[e]:`lang.${window.Lang}.${e}`}function s(){const e=navigator.language.split("-")[0];return["hu","en"].includes(e)?e:"en"}},"./src/core/Vec2d.ts":(e,n,t)=>{t.r(n),t.d(n,{Vec2d:()=>i});class i{constructor(e,n){this.x=e,this.y=n}rotateMatrix(e,n=null){let t=this;if(0==(e%=360))return t;null!=n&&(t=t.base(n));let o=Math.PI/180*e,a=Math.cos(o),s=Math.sin(o),r=s*t.y+a*t.x,l=a*t.y-s*t.x,c=new i(r,l);return null!=n&&(c=c.rebase(n)),c}getDistance(e){return this.base(e).mag()}base(e){return new i(e.x-this.x,e.y-this.y)}rebase(e){return new i(e.x+this.x,e.y+this.y)}dotProduct(e){return this.x*e.x+this.y*e.y}angle(e){return Math.acos(this.dotProduct(e)/(this.mag()*e.mag()))*(180/Math.PI)}crossProduct(e){return e.x*this.y-e.y*this.x}mult(e){return new i(this.x*e,this.y*e)}normal(){return new i(-1*this.y,this.x).unit()}unit(){return 0===this.mag()?new i(0,0):new i(this.x/this.mag(),this.y/this.mag())}mag(){return Math.sqrt(this.x**2+this.y**2)}add(e){return new i(this.x+e.x,this.y+e.y)}subtr(e){return new i(this.x-e.x,this.y-e.y)}equal(e){return this.x==e.x&&this.y==e.y}}},"./src/core/api.ts":(e,n,t)=>{t.r(n),t.d(n,{getLastUpdate:()=>r,redirect:()=>p,update:()=>d,updateWorldData:()=>c});var i=t("./src/view/loadingWindow.ts"),o=t("./src/core/Language.ts");async function a(e,n,t){console.log("started "+n);let i=e.trim().split("\n");await s(i,0,n,t),console.log("finished outer"+n)}async function s(e,n,t,i){return new Promise((async(a,r)=>{let l=function(e,n){let t=e.split(","),i={};return t.forEach(((e,t)=>{let o=decodeURIComponent(e).replaceAll("+"," ");isNaN(o)||(o=parseInt(o)),i[n[t]]=o})),i}(e[n],i);await window.DB.setData(t,l);let c=Math.ceil((n+1)/e.length*100);$("html").find(".mapper-loader-label").text(`${c}%`),$("html").find("#mapper-loader-pct").css("width",`${c}%`),$("html").find("#mapper-loading span").text(`${(0,o.Lang)(t)} ${(0,o.Lang)("loading")}...`),++n<e.length&&await s(e,n,t,i),a("done")}))}function r(){return new Date(parseInt(localStorage.getItem("TW_API_LAST_UPDATE"))-864e5).toLocaleString("hu-HU")}function l(e){return $.ajax({url:e,type:"GET"})}async function c(){parseInt(localStorage.getItem("TW_API_LAST_UPDATE"))>(new Date).getTime()||await d()}async function d(){console.log("Updating..."),window.Dialog.show("launchDialog",(0,i.loadingWindow)()),$(".popup_box_close").hide(),$(".popup_box_container").append('<div style="position: fixed;width: 100%;height: 100%;top:0;left:0;z-index:12001"></div>');let e=await l(`https://${window.location.host}/map/village.txt`),n=await l(`https://${window.location.host}/map/player.txt`),t=await l(`https://${window.location.host}/map/ally.txt`);await a(e,"villages",["id","name","x","y","player","points","rank"]),await w(1e3),await a(n,"players",["id","name","ally","villages","points","rank"]),await w(1e3),await a(t,"allies",["id","name","tag","members","villages","points","all_points","rank"]),await w(1e3),localStorage.setItem("TW_API_LAST_UPDATE",new Date((new Date).setDate((new Date).getDate()+1)).getTime().toString()),$("html").find("#mapper-loading span").text((0,o.Lang)("api_updated")),await w(2e3),window.Dialog.close("launchDialog"),console.log("Update finished")}async function w(e){return new Promise((async(n,t)=>{setTimeout((()=>{n()}),e)}))}function p(){return!window.location.href.includes("screen=map")&&(window.top.UI.InfoMessage((0,o.Lang)("redirect_to_map")),setTimeout((()=>{window.location.href=`game.php?village=${window.game_data.village.id}&screen=map`}),1e3),!0)}},"./src/core/indexedDBHandler.ts":(e,n,t)=>{t.r(n),t.d(n,{indexedDBHandler:()=>i});class i{constructor(e,n,t,i){this.db=e,this.dbName=n,this.stores=t,this.version=i,console.log(`loaded ${this.dbName} DB 🚀`)}static async init(e,n,t){return new Promise(((o,a)=>{let s=indexedDB.open(e,t);s.onupgradeneeded=()=>{n.forEach((e=>{s.result.objectStoreNames.contains(e.keyName)||s.result.createObjectStore(e.name,{keyPath:e.keyName,autoIncrement:e.AI})})),s.onsuccess=()=>{o(new i(s.result,e,n,t))}},s.onsuccess=()=>{o(new i(s.result,e,n,t))},s.onerror=()=>{throw console.error("Error",s.error),new Error(s.error.message)}}))}getTransaction(e){let n=this.stores.findIndex((n=>n.name==e));return-1==n?null:(this.stores[n].transaction||(this.stores[n].transaction=this.db.transaction(e,"readwrite")),this.stores[n].transaction)}async getAllData(e){return new Promise((async(n,t)=>{if(!this.db.objectStoreNames.contains(e))return void n([]);let i=this.getTransaction(e),o=await i.objectStore(e).getAll();o.onsuccess=()=>{n(o.result)}}))}async getData(e,n){return new Promise((async(t,i)=>{if(!this.db.objectStoreNames.contains(e))return void t(null);let o=this.getTransaction(e),a=await o.objectStore(e).get(n);a.onsuccess=()=>{a.result?t(a.result):t(null)}}))}async setData(e,n){return new Promise((async(t,i)=>{if(!this.db.objectStoreNames.contains(e))return void t(null);let o=this.getTransaction(e),a=await o.objectStore(e).put(n);a.onsuccess=()=>{t(a.result)}}))}async removeData(e,n){return new Promise((async(t,i)=>{if(!this.db.objectStoreNames.contains(e))return void t(null);let o=this.getTransaction(e),a=await o.objectStore(e).delete(n);a.onsuccess=()=>{t(a.result)}}))}}},"./src/core/map.ts":(e,n,t)=>{t.r(n),t.d(n,{initMap:()=>c,mapAction:()=>l});var i=t("./src/core/Vec2d.ts");const o=38,a=53,s=5,r=5,l=function(e){var n=this.coordByEvent(e);if(!window.canDraw)return!1;switch(window.mapMenu.selectedTool){case"circle":!function(e){let n=window.markers.findIndex((e=>e.id==window.activeMarker));if(console.log(n),-1==n)window.activeMarker=(new Date).getTime(),window.markers.push({id:window.activeMarker,type:"circle",points:[e],canClose:!1,color:window.activeGroup.color,villages:[]});else if(window.markers[n].points.push(e),2==window.markers[n].points.length){let e=window.markers[n].points[0].getDistance(window.markers[n].points[1]);console.log(e),window.activeMarker=window.markers[n].id,window.markers[n].length=e,window.markers[n].canClose=!0,window.markers[n].villages=function(e,n){let t=window.villages,o=[];return t.forEach((t=>{n.getDistance(new i.Vec2d(t.x,t.y))<=e&&o.push(t)})),o}(e,window.markers[n].points[0]),window.activeMarker=null}w()}(new i.Vec2d(n[0],n[1]));break;case"concave":!async function(e){let n=window.markers.findIndex((e=>e.id==window.activeMarker));-1==n?(window.activeMarker=(new Date).getTime(),window.markers.push({id:window.activeMarker,type:"concave",points:[e],canClose:!1,color:window.activeGroup.color,villages:[]}),w()):(window.markers[n].points[0].equal(e)?(window.activeMarker=window.markers[n].id,window.markers[n].canClose=!0,window.markers[n].villages=function(e){let n=1/0,t=-1/0,o=1/0,a=-1/0;e.forEach((e=>{e.x>t&&(t=e.x),e.y>a&&(a=e.y),e.x<n&&(n=e.x),e.y<o&&(o=e.y)}));let s=window.villages,r=[];s.forEach((e=>{e.x>=n&&e.x<=t&&e.y>=o&&e.y<=a&&r.push(e)}));let l=[];r.forEach((n=>{let t=!1;(function(e,n){for(var t=n.x,i=n.y,o=!1,a=0,s=e.length-1;a<e.length;s=a++){var r=e[a].x,l=e[a].y,c=e[s].x,d=e[s].y;l>i!=d>i&&t<(c-r)*(i-l)/(d-l)+r&&(o=!o)}return o})(e,new i.Vec2d(n.x,n.y))&&(t=!0);for(let o=0;o<e.length-1;o++)h(e[o],new i.Vec2d(n.x,n.y),e[o+1],.2)&&(t=!0);h(e[0],new i.Vec2d(n.x,n.y),e[e.length-1],.2)&&(t=!0),t&&l.push(n)})),w();let c="";return l.forEach((e=>{c+="','"+e.x+"|"+e.y})),l}(window.markers[n].points)):window.markers[n].points.push(e),w())}(new i.Vec2d(n[0],n[1]));break;case"rectangle":!function(e){let n=window.markers.findIndex((e=>e.id==window.activeMarker));-1==n?(window.activeMarker=(new Date).getTime(),window.markers.push({id:window.activeMarker,type:"rectangle",points:[e],canClose:!1,color:window.activeGroup.color,villages:[]})):(window.markers[n].points.push(e),2==window.markers[n].points.length&&(window.activeMarker=window.markers[n].id,window.markers[n].canClose=!0,window.markers[n].points=window.markers[n].points.sort(((e,n)=>e.x>=n.x&&e.y>=n.y?-1:1)),window.markers[n].villages=u([...window.markers[n].points]),window.activeMarker=null)),w()}(new i.Vec2d(n[0],n[1]));break;case"single":!async function(e){let n=u([e,e]),t=window.markers.findIndex((e=>e.villages[0].id==n[0].id));-1==t?(window.activeMarker=(new Date).getTime(),window.markers.push({id:window.activeMarker,type:"single",points:[e],villages:n,color:window.activeGroup.color,canClose:!1}),window.activeMarker=null):window.markers.splice(t,1),w()}(new i.Vec2d(n[0],n[1]));break;case"kontinent":!async function(e){let n=100*Math.floor(e.x/100),t=100*Math.floor(e.y/100),o=new i.Vec2d(n,t),a=o.add(new i.Vec2d(99,99)),s=u([a,o]),r=window.markers.findIndex((e=>e.villages[0].id==s[0].id));-1==r?(window.activeMarker=(new Date).getTime(),window.markers.push({id:window.activeMarker,type:"kontinent",points:[a,o],villages:s,color:window.activeGroup.color,canClose:!0}),window.activeMarker=null):window.markers.splice(r,1),w()}(new i.Vec2d(n[0],n[1]));break;case"tape":!function(e){let n=window.markers.findIndex((e=>"tape"==e.type&&e.canClose));if(n>-1&&window.markers.splice(n,1),n=window.markers.findIndex((e=>e.id==window.activeMarker)),console.log(n),-1==n)window.activeMarker=(new Date).getTime(),window.markers.push({id:window.activeMarker,type:"tape",points:[e],canClose:!1,color:window.activeGroup.color,villages:[]});else if(window.markers[n].points.push(e),2==window.markers[n].points.length){let e=window.markers[n].points[0].getDistance(window.markers[n].points[1]);window.activeMarker=window.markers[n].id,window.markers[n].length=e,window.markers[n].canClose=!0,window.markers[n].villages=[],window.activeMarker=null}w()}(new i.Vec2d(n[0],n[1]))}return!1};function c(){$("#minimap_mover").append('<canvas id="mini_map" />'),$("#map_mover").append('<canvas id="big_map" />'),$('[onclick*="VillageInfo.Notes.toggleEdit()"]').removeAttr("onclick");let e=document.getElementById("mini_map");window.ctxMini=e.getContext("2d");let n=document.getElementById("big_map");window.ctxBig=n.getContext("2d"),window.ctxBig.canvas.width=$("#map_mover").innerWidth(),window.ctxBig.canvas.height=$("#map_mover").innerHeight(),window.ctxMini.canvas.width=$("#minimap_mover").innerWidth(),window.ctxMini.canvas.height=$("#minimap_mover").innerHeight(),window.ctxBig.save(),window.ctxMini.save(),d(),w(),new MutationObserver(g).observe(document.querySelector("#map_container"),{attributes:!0})}function d(){let e=parseFloat($("#map_coord_x").css("left").replace("px","")),n=parseFloat($("#map_coord_y").css("top").replace("px","")),t=parseFloat($("#minimap_container").css("left").replace("px","")),o=parseFloat($("#minimap_container").css("top").replace("px",""));window.translateBig=new i.Vec2d(26500,26500).subtr(new i.Vec2d(e,n)),window.translateMini=new i.Vec2d(-t,-o)}function w(){window.ctxBig.canvas.width=$("#map_mover").innerWidth(),window.ctxBig.canvas.height=$("#map_mover").innerHeight(),window.ctxMini.canvas.width=$("#minimap_mover").innerWidth(),window.ctxMini.canvas.height=$("#minimap_mover").innerHeight(),window.ctxBig.clearRect(0,0,window.ctxBig.canvas.width,window.ctxBig.canvas.height),window.ctxMini.clearRect(0,0,window.ctxMini.canvas.width,window.ctxMini.canvas.height),window.ctxMini.reset(),window.ctxMini.translate(-window.translateMini.x,-window.translateMini.y),window.ctxBig.reset(),window.ctxBig.translate(-window.translateBig.x,-window.translateBig.y),window.markers.forEach((e=>{switch(window.ctxMini.strokeStyle=e.color,window.ctxBig.strokeStyle=e.color,window.ctxMini.fillStyle=e.color+"80",window.ctxBig.fillStyle=e.color+"80",window.ctxMini.lineWidth=2,window.ctxBig.lineWidth=5,e.type){case"circle":!function(e){e.points.length>=1&&(window.ctxBig.beginPath(),window.ctxBig.ellipse((e.points[0].x+1)*a-a/2,(e.points[0].y+1)*o-o/2,a/2*.5,o/2*.5,0,0,2*Math.PI),window.ctxBig.fill(),window.ctxBig.closePath()),2==e.points.length&&(window.ctxBig.beginPath(),window.ctxBig.setLineDash([5,15]),window.ctxBig.moveTo((e.points[0].x+1)*a-a/2,(e.points[0].y+1)*o-o/2),window.ctxBig.lineTo((e.points[1].x+1)*a-a/2,(e.points[1].y+1)*o-o/2),window.ctxBig.stroke(),window.ctxBig.closePath()),e.canClose&&(window.ctxBig.beginPath(),window.ctxMini.beginPath(),window.ctxBig.setLineDash([]),window.ctxBig.ellipse((e.points[0].x+1)*a-a/2,(e.points[0].y+1)*o-o/2,a/2*e.length*2,o/2*e.length*2,0,0,2*Math.PI),window.ctxBig.stroke(),window.ctxMini.ellipse((e.points[0].x+1)*r-r/2,(e.points[0].y+1)*s-s/2,r/2*e.length*2,s/2*e.length*2,0,0,2*Math.PI),window.ctxMini.stroke(),window.ctxBig.closePath(),window.ctxMini.closePath())}(e);break;case"concave":!function(e){window.ctxBig.beginPath(),e.points.length>0&&(window.ctxBig.ellipse((e.points[0].x+1)*a-a/2,(e.points[0].y+1)*o-o/2,a/2*.5,o/2*.5,0,0,2*Math.PI),window.ctxBig.fill());for(let n=0;n<e.points.length-1;n++)p(e.points[n],e.points[n+1]);e.canClose&&p(e.points[0],e.points[e.points.length-1]),window.ctxMini.stroke(),window.ctxBig.stroke()}(e);break;case"rectangle":!function(e){if(e.points.length>=1&&(window.ctxBig.beginPath(),window.ctxBig.ellipse((e.points[0].x+1)*a-a/2,(e.points[0].y+1)*o-o/2,a/2*.5,o/2*.5,0,0,2*Math.PI),window.ctxBig.fill(),window.ctxBig.closePath()),2==e.points.length&&(window.ctxBig.beginPath(),window.ctxBig.setLineDash([5,15]),window.ctxBig.moveTo((e.points[0].x+1)*a-a/2,(e.points[0].y+1)*o-o/2),window.ctxBig.lineTo((e.points[1].x+1)*a-a/2,(e.points[1].y+1)*o-o/2),window.ctxBig.stroke(),window.ctxBig.closePath()),e.canClose){window.ctxBig.beginPath(),window.ctxMini.beginPath(),window.ctxBig.setLineDash([]);let n=new i.Vec2d(e.points[0].x,e.points[0].y).subtr(e.points[1]);console.log(n),window.ctxBig.rect(e.points[1].x*a,e.points[1].y*o,(n.x+1)*a,(n.y+1)*o),window.ctxBig.stroke(),window.ctxMini.rect(e.points[1].x*r,e.points[1].y*s,(n.x+1)*r,(n.y+1)*s),window.ctxMini.stroke(),window.ctxBig.closePath(),window.ctxMini.closePath()}}(e);break;case"kontinent":!function(e){window.ctxBig.beginPath(),window.ctxMini.beginPath(),window.ctxBig.setLineDash([]),console.log(e.points);let n=e.points[0].subtr(e.points[1]);window.ctxBig.rect(e.points[1].x*a,e.points[1].y*o,(n.x+1)*a,(n.y+1)*o),window.ctxBig.stroke(),window.ctxMini.rect(e.points[1].x*r,e.points[1].y*s,(n.x+1)*r,(n.y+1)*s),window.ctxMini.stroke(),window.ctxBig.closePath(),window.ctxMini.closePath()}(e);break;case"tape":!function(e){e.points.length>=1&&(window.ctxBig.beginPath(),window.ctxBig.ellipse((e.points[0].x+1)*a-a/2,(e.points[0].y+1)*o-o/2,a/2*.5,o/2*.5,0,0,2*Math.PI),window.ctxBig.fill(),window.ctxBig.setLineDash([]),window.ctxBig.stroke(),window.ctxBig.closePath()),2==e.points.length&&(window.ctxBig.beginPath(),window.ctxBig.setLineDash([5,10]),window.ctxBig.moveTo((e.points[0].x+1)*a-a/2,(e.points[0].y+1)*o-o/2),window.ctxBig.lineTo((e.points[1].x+1)*a-a/2,(e.points[1].y+1)*o-o/2),window.ctxBig.stroke(),window.ctxBig.closePath(),window.ctxBig.beginPath(),window.ctxBig.setLineDash([]),window.ctxBig.ellipse((e.points[1].x+1)*a-a/2,(e.points[1].y+1)*o-o/2,a/2*.5,o/2*.5,0,0,2*Math.PI),window.ctxBig.stroke(),window.ctxBig.fill(),window.ctxBig.closePath()),e.canClose&&(window.ctxBig.fillStyle="white",window.ctxBig.fillRect(e.points[1].x*a,e.points[1].y*o-24,100,26),window.ctxBig.fillStyle="black",window.ctxBig.font="24px serif",window.ctxBig.fillText(e.length.toFixed(2),e.points[1].x*a,e.points[1].y*o))}(e)}void 0!==e.villages&&e.villages.forEach((n=>{window.ctxBig.fillStyle=e.color+"66",window.ctxBig.fillRect((n.x+1)*a-a,(n.y+1)*o-o,a,o),window.ctxMini.fillStyle=e.color,window.ctxMini.fillRect((n.x+1)*r-r,(n.y+1)*s-s,r,s)}))})),window.groups.forEach((e=>{e.villages.forEach((n=>{window.ctxBig.fillStyle=e.color+"66",window.ctxBig.fillRect((n.x+1)*a-a,(n.y+1)*o-o,a,o),window.ctxMini.fillStyle=e.color,window.ctxMini.fillRect((n.x+1)*r-r,(n.y+1)*s-s,r,s)}))}))}function p(e,n){window.ctxBig.moveTo((e.x+1)*a-a/2,(e.y+1)*o-o/2),window.ctxBig.lineTo((n.x+1)*a-a/2,(n.y+1)*o-o/2),window.ctxMini.moveTo((e.x+1)*r-r/2,(e.y+1)*s-s/2),window.ctxMini.lineTo((n.x+1)*r-r/2,(n.y+1)*s-s/2)}function g(){d(),w()}function u(e){let n=window.villages,t=[];return n.forEach((n=>{n.x>=e[1].x&&n.x<=e[0].x&&n.y>=e[1].y&&n.y<=e[0].y&&t.push(n)})),t}function h(e,n,t,i){var o=(t.x-e.x)*(t.x-e.x)+(t.y-e.y)*(t.y-e.y);if(0==o)return!1;var a=((n.x-e.x)*(t.x-e.x)+(n.y-e.y)*(t.y-e.y))/o;if(a<0)return e.getDistance(n)<=i;if(0<=a&&a<=1){var s=((e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y))/o;return Math.abs(s)*Math.sqrt(o)<=i}return e.getDistance(n)<=i}document.addEventListener("keydown",(e=>{"Shift"===e.key&&(window.canDraw=!0)})),document.addEventListener("keyup",(e=>{"Shift"===e.key&&(window.canDraw=!1)}))},"./src/img/circle.ts":(e,n,t)=>{function i(){return'\n <svg width="25"\n height="25"\n viewBox="0 0 26.458333 26.458334">\n <circle\n style="opacity:1;fill:none;stroke:#6c4824;stroke-width:2.365;fill-opacity:1;stroke-opacity:1"\n id="path848"\n cx="13.229167"\n cy="13.229167"\n r="11.347473" />\n </svg>\n '}t.r(n),t.d(n,{circle:()=>i})},"./src/img/kontinent.ts":(e,n,t)=>{function i(){return'\n <svg width="25"\n height="25"\n viewBox="0 0 26.458333 26.458334">\n <text\n xml:space="preserve"\n style="font-style:normal;font-weight:normal;font-size:22.3015px;line-height:1.25;font-family:sans-serif;fill:#6c4824;fill-opacity:1;stroke:none;stroke-width:0.232307"\n x="5.0529065"\n y="20.811829"\n id="text9912"\n transform="scale(0.9603528,1.041284)"><tspan\n sodipodi:role="line"\n id="tspan9910"\n style="font-size:22.3015px;stroke-width:0.232307;fill:#6c4824;fill-opacity:1"\n x="5.0529065"\n y="20.811829">K</tspan></text>\n <rect\n style="fill:none;stroke:#6c4824;stroke-width:2;stroke-miterlimit:4;stroke-dasharray:6.00000017,2.00000006;stroke-dashoffset:0"\n id="rect13536"\n width="21.801445"\n height="21.801445"\n x="2.3284442"\n y="2.3284442"\n ry="0.82648951" />\n </svg>\n'}t.r(n),t.d(n,{kontinent:()=>i})},"./src/img/line.ts":(e,n,t)=>{function i(){return'\n <svg width="25"\n height="25"\n viewBox="0 0 26.458333 26.458334">\n <circle\n style="opacity:1;fill:none;fill-opacity:1;stroke:#6c4824;stroke-width:1;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"\n id="path6255"\n cx="4.6238723"\n cy="4.6238718"\n r="4" />\n <circle\n style="fill:none;fill-opacity:1;stroke:#6c4824;stroke-width:1;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"\n id="path6255-3"\n cx="21.935469"\n cy="21.890795"\n r="4" />\n <rect\n style="opacity:1;fill:#6c4824;fill-opacity:1;stroke:none;stroke-width:1.5;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"\n id="rect6483"\n width="1.8512045"\n height="25.774113"\n x="-0.48315775"\n y="5.8062401"\n ry="0.92407191"\n transform="matrix(0.73956041,-0.67309019,0.69019138,0.72362687,0,0)" />\n </svg>\n '}t.r(n),t.d(n,{line:()=>i})},"./src/img/rectangle.ts":(e,n,t)=>{function i(){return'\n <svg width="25"\n height="25"\n viewBox="0 0 26.458333 26.458334">\n <rect\n style="opacity:1;fill:none;fill-opacity:1;stroke:#6c4824;stroke-width:2.365;stroke-opacity:1"\n id="rect4951"\n width="22.158844"\n height="21.846119"\n x="2.1497447"\n y="2.3061073" />\n </svg>\n'}t.r(n),t.d(n,{rectangle:()=>i})},"./src/img/single.ts":(e,n,t)=>{function i(){return'\n <svg width="25"\n height="25"\n viewBox="0 0 26.458333 26.458334">\n <path\n style="fill:none;stroke:#6c4824;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;fill-opacity:1"\n d="M 2.2174779,1.0042411 V 15.679964 L 8.6041772,11.460693 17.728033,25.402632 24.570925,21.366806 12.481815,9.2593345 17.499936,5.9572972 Z"\n id="path11483" />\n </svg>\n'}t.r(n),t.d(n,{single:()=>i})},"./src/img/tape.ts":(e,n,t)=>{function i(){return'\n <svg width="25"\n height="25"\n viewBox="0 0 26.458333 26.458334">\n <path\n id="path15664"\n style="fill:none;fill-opacity:1;stroke:#6c4824;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"\n d="m 3.6509501,11.328717 c -1.9535173,2.511818 -2.67871088,6.073186 -1.8681182,6.639987 l 7.6530813,5.805014 7.1447008,-9.272191 -0.587741,-0.463325 8.03692,-10.5399487 0.727482,0.5381894 0.3553,-0.4316423 -2.069155,-1.5416048 -8.322045,10.9722824 -1.35904,-1.535475 0.626117,-1.7121804 -1.459553,-1.1071 -1.666541,0.866568 C 7.731817,7.8865856 5.2695789,9.2474976 3.6509501,11.328717 Z" />\n <circle\n style="fill:none;fill-opacity:1;stroke:#6c4824;stroke-width:2;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"\n id="path17705"\n cx="-7.1404595"\n cy="15.965486"\n r="3.0"\n transform="rotate(-52.818961)" />\n </svg>\n '}t.r(n),t.d(n,{tape:()=>i})},"./src/view/language/en.ts":(e,n,t)=>{t.r(n),t.d(n,{en:()=>i});const i={map_loaded:"Map data loaded!",api_updated:"Api updated",updating_map_data:"Updating map data",redirect_to_map:"Redirecting to the map!",groups:"Groups",new_group:"New Group",update_api:"Update Data",api_last_update:"Api updated",choose_group:"-- Choose a group --",color:"Color",name:"Name",add:"Add",cancel:"Cancel",draw:"Drawing",village_info:"Village info",concave:"Concave",circle:"Circle",single:"Single",reset:"Reset",group_name_req:"The name of the group must be entered!",union:"Union",subtract:"Subtract",section:"Section",filter:"Filter",delete:"Delete",copy:"Copy",carbon_copy:"Carbon Copy",groupe_name:"Group Name",select:"choose",view:"View",village_name:"Village Name",loading:"loading",villages:"Villages",players:"Players",allies:"Allies",points:"Points",owner:"Owner",ally:"Tribe",type:"Type",barb:"Barb",player:"Player",bonus:"Bonus",apply:"Apply",rename:"Rename",no_group_selected:"No group is selected!",not_enough_group_selected:"Not enough groups selected",only_barbs:"Bonus Only",not_bonus:"Not bonus",village_points:"Village Points",filter_must_be_entered:"The filtering value must be entered!",remove_it:"remove",add_it:"add",remove:"Remove",if_village_points:"if village points",no_filter_added:"No filter added!",copied_to_clipboard:"The coordinates were successfully copied to the clipboard!",barbs:"Barbs",no_villages_in_group:"There are no villages in the group!",max_name_length:"The group name can be a maximum of 20 characters"}},"./src/view/language/hu.ts":(e,n,t)=>{t.r(n),t.d(n,{hu:()=>i});const i={map_loaded:"Térkép adatok betöltve!",api_updated:"Api frissítve",updating_map_data:"Térkép adatok frissítése",redirect_to_map:"Átírányítás a térképre!",groups:"Csoportok",new_group:"Új csoport",update_api:"Adatok frissítése",api_last_update:"Api frissítve",choose_group:"-- Válassz csoportot --",color:"Szín",name:"Név",add:"Hozzáad",cancel:"Mégse",draw:"Rajzolás",village_info:"Falu info",concave:"Konkáv",circle:"Kör",single:"Egyenként",reset:"Visszaállít",group_name_req:"A csoport nevét kötelező megadni!",union:"Összevon",subtract:"Kivon",section:"Metszet",filter:"Szűrés",delete:"Törlés",copy:"Másolás",carbon_copy:"Másolat",groupe_name:"Csoport Név",select:"választ",view:"Nézet",village_name:"Falu Név",loading:"beltöltése",villages:"Falvak",players:"Játékosok",allies:"Klánok",points:"Pontok",owner:"Tulajdonos",ally:"Klán",type:"Típus",barb:"Barbár",player:"Játékos",bonus:"Bónusz",apply:"Alkalmaz",rename:"Átnevez",no_group_selected:"Nincs egy csoport se kiválasztva!",not_enough_group_selected:"Nincs elegendő csoport kiválasztva",only_barbs:"Csak bónusz",not_bonus:"Nem bónusz",village_points:"Falu pontok",filter_must_be_entered:"A szűrési értéket kötelező megadni!",remove_it:"eltávolítása",add_it:"hozzáadása",remove:"Eltávolítás",if_village_points:"ha falu pontok",no_filter_added:"Nincs egy szűrő se hozzáadva!",copied_to_clipboard:"A koordináták sikeresen vágólapra lettek másolva!",barbs:"Barbárok",max_name_length:"A csoport neve max 20 karakter lehet!"}},"./src/view/loadingWindow.ts":(e,n,t)=>{t.r(n),t.d(n,{loadingWindow:()=>o});var i=t("./src/core/Language.ts");function o(){return`\n <h1 style="text-align:center">${(0,i.Lang)("updating_map_data")}</h1>\n <div style="width:250px; display:block; margin:0 auto;" class="progress-bar progress-bar-alive">\n <span class="label mapper-loader-label"></span>\n <div id="mapper-loader-pct" style="width: 0%">\n <span class="label mapper-loader-label" style="width:250px"></span>\n </div>\n </div>\n <div id="mapper-loading" style="display: flex; justify-content: center; width: 100%;">\n <img style="height:25px" src="https://dshu.innogamescdn.com/asset/6389cdba/graphic/loading.gif"><span style="padding:5px">Betöltés...</span>\n </div>\n `}},"./src/view/mapMenu.ts":(e,n,t)=>{t.r(n),t.d(n,{mapMenu:()=>p});var i=t("./src/core/Language.ts"),o=t("./src/img/circle.ts"),a=t("./src/img/kontinent.ts"),s=t("./src/img/line.ts"),r=t("./src/img/rectangle.ts"),l=t("./src/img/single.ts"),c=t("./src/img/tape.ts"),d=t("./src/core/api.ts"),w=t("./src/core/map.ts");function p(){return`\n <style>\n .tool{\n background-color:#c1a264;\n border-radius:5px;\n padding:4px;\n box-shadow:2px 3px 4px 0px #e4c588;\n cursor:pointer;\n }\n\n .tool:hover{\n background-color: #facc71 !important;\n }\n .tool-selected{\n box-shadow:inset 2px 3px 4px 0px #5e5e5ea6 !important;\n background-color: #facc71 !important;\n }\n .tool-bar{\n margin-top:10px;\n display:flex;\n justify-content:start;\n gap: 5px;\n }\n\n .tool-bar label{\n margin-top:3px;\n }\n </style>\n <div>\n <div style="float:right" >\n <span id="updated" style="float:right">${(0,i.Lang)("api_last_update")}: ${(0,d.getLastUpdate)()}</span><br>\n <button style="float:right;margin-top:5px;" class="btn" onclick="mapMenu.updateApi()">${(0,i.Lang)("update_api")}</button>\n </div>\n <div class="tool-bar" style="display:none;" id="addGroup">\n <label for="color">${(0,i.Lang)("color")}:</label>\n <input type="color" style="height:21px" id="color" value="#e66465" />\n <label for="groupName">${(0,i.Lang)("name")}:</label>\n <input type="text" id="groupName" />\n <button class="btn" onclick="mapMenu.addNewGroup()">${(0,i.Lang)("add")}</button>\n <button class="btn" onclick="mapMenu.cancelNewGroupModal()">${(0,i.Lang)("cancel")}</button>\n </div>\n <div class="tool-bar" id="mapControls">\n <button class="btn">${(0,i.Lang)("groups")}</button>\n <button class="btn" onclick="mapMenu.newGroupModal()">${(0,i.Lang)("new_group")}</button>\n <input type="checkbox" onchange="mapMenu.toggleDrawing()" id="draw" >\n <label for="draw">${(0,i.Lang)("draw")}</label>\n <input type="checkbox" onchange="mapMenu.toggleInfo()" id="vinfo" >\n <label for="vinfo" style="">${(0,i.Lang)("village_info")}</label>\n </div>\n <div class="tool-bar">\n <select style="font-size:14px; width:100px" onchange="groupChanged()" id="groupSelector" placeholder="${(0,i.Lang)("choose_group")}"></select>\n <button class="btn" >${(0,i.Lang)("add")}</button>\n <button class="btn">${(0,i.Lang)("reset")}</button>\n </div>\n <div class="tool-bar">\n <div class="tool" onclick="mapMenu.selectTool('circle',this)">\n ${(0,o.circle)()}\n </div>\n <div class="tool" onclick="mapMenu.selectTool('concave',this)">\n ${(0,s.line)()}\n </div>\n <div class="tool" onclick="mapMenu.selectTool('rectangle',this)">\n ${(0,r.rectangle)()}\n </div>\n <div class="tool" onclick="mapMenu.selectTool('single',this)">\n ${(0,l.single)()}\n </div>\n <div class="tool" onclick="mapMenu.selectTool('kontinent',this)">\n ${(0,a.kontinent)()}\n </div>\n <div class="tool" onclick="mapMenu.selectTool('tape',this)">\n ${(0,c.tape)()}\n </div>\n </div>\n\n </div>\n `}window.mapMenu={isDrawing:!1,selectedTool:"",selectTool(e,n){$(".tool-bar .tool").removeClass("tool-selected"),$(n).addClass("tool-selected"),$("#inputBar").html(""),window.mapMenu.selectedTool=e},async updateApi(){await(0,d.update)(),$("#updated").text(`${(0,i.Lang)("api_last_update")}: ${(0,d.getLastUpdate)()}`)},newGroupModal(){$("#mapControls").hide(),$("#addGroup").show()},cancelNewGroupModal(){$("#mapControls").show(),$("#addGroup").hide()},addNewGroup(){let e=$("#groupName").val().toString(),n=$("#color").val().toString();if(""==e)return void window.UI.ErrorMessage((0,i.Lang)("group_name_req"));if(e.length>20)return void window.UI.ErrorMessage((0,i.Lang)("max_name_length"));$("#mapControls").show(),$("#addGroup").hide();let t={id:(new Date).getTime(),name:e,color:n,villages:[]};window.groups.push(t),window.activeGroup=t,window.mapMenu.renderGroupSelect(),$("#groupName").val("")},renderGroupSelect(){let e="";window.groups.forEach((n=>{e+=`<option ${n.id==window.activeGroup.id&&"selected"} value="${n.id}">${n.name} (${n.villages.length})</option>`})),$("#groupSelector").html(e)},toggleDrawing(){window.mapMenu.isDrawing?(window.mapMenu.isDrawing=!1,window.TWMap.map._handleClick=window.backupTW,$("#map_popup").css("opacity","1")):(window.mapMenu.isDrawing=!0,window.TWMap.map._handleClick=w.mapAction)},toggleInfo(){$("#vinfo").is(":checked")?$("#map_popup").css("opacity","1"):$("#map_popup").css("opacity","0")}}}},n={};function t(i){var o=n[i];if(void 0!==o)return o.exports;var a=n[i]={exports:{}};return e[i](a,a.exports,t),a.exports}t.d=(e,n)=>{for(var i in n)t.o(n,i)&&!t.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:n[i]})},t.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),t.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.r({});var i=t("./src/core/Language.ts"),o=t("./src/core/api.ts"),a=t("./src/core/indexedDBHandler.ts"),s=t("./src/core/map.ts"),r=t("./src/view/mapMenu.ts");(async()=>{(0,o.redirect)()||(window.groups=[],window.markers=[],window.Lang=(0,i.determineLang)(),(0,s.initMap)(),window.DB=await a.indexedDBHandler.init("TW_API_DATA",[{name:"villages",keyName:"id",AI:!1},{name:"players",keyName:"id",AI:!1},{name:"allies",keyName:"id",AI:!1}],1),await(0,o.updateWorldData)(),window.villages=await window.DB.getAllData("villages"),$("#content_value h2").after((0,r.mapMenu)()))})()})();