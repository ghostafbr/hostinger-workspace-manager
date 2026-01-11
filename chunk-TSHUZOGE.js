import{c as Be}from"./chunk-TZCQML4M.js";import"./chunk-S2TTRKFC.js";import{a as Se,b as xe,c as Me,d as ke}from"./chunk-EKUSNDL3.js";import{a as Pe,b as Re}from"./chunk-MWQGGTEH.js";import"./chunk-XDH7PSGG.js";import"./chunk-ZY6A37SQ.js";import{d as Ee,e as De,f as Ie,g as Oe}from"./chunk-WRDN2UFV.js";import{a as be,b as ve}from"./chunk-WXCZB3FF.js";import{b as ge,c as ye}from"./chunk-35XEZBLQ.js";import{q as fe,r as _e}from"./chunk-JTDRYVRP.js";import{b as Te,c as we}from"./chunk-WGH6LJ37.js";import"./chunk-XT6DYFZT.js";import{a as Ce,b as he}from"./chunk-QVUCWJDY.js";import{Ca as me,Xa as de,Ya as ue,cb as T,d as oe,f as ae,g as se,i as le,mb as E,nb as D,s as ce,u as pe,ua as F,ya as M,za as k}from"./chunk-JG2KDI2N.js";import{$b as Z,Db as J,Dc as ie,Eb as v,Ec as re,Ib as g,Jb as c,Mb as K,O as L,Oa as s,Ob as B,P as j,Pb as V,R as H,T as u,Tb as U,Ub as P,Xb as x,Y as y,Yb as m,Z as f,Zb as X,_b as Y,ab as C,bb as q,dc as R,eb as G,ec as z,fb as W,fc as ee,gb as h,ia as Q,mb as S,mc as te,oa as O,oc as ne,pb as _,qb as b,ub as l,uc as N,vb as r,vc as A,wb as o,xb as p}from"./chunk-BYQLS5JT.js";var Ve=`
    .p-progressbar {
        display: block;
        position: relative;
        overflow: hidden;
        height: dt('progressbar.height');
        background: dt('progressbar.background');
        border-radius: dt('progressbar.border.radius');
    }

    .p-progressbar-value {
        margin: 0;
        background: dt('progressbar.value.background');
    }

    .p-progressbar-label {
        color: dt('progressbar.label.color');
        font-size: dt('progressbar.label.font.size');
        font-weight: dt('progressbar.label.font.weight');
    }

    .p-progressbar-determinate .p-progressbar-value {
        height: 100%;
        width: 0%;
        position: absolute;
        display: none;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: width 1s ease-in-out;
    }

    .p-progressbar-determinate .p-progressbar-label {
        display: inline-flex;
    }

    .p-progressbar-indeterminate .p-progressbar-value::before {
        content: '';
        position: absolute;
        background: inherit;
        inset-block-start: 0;
        inset-inline-start: 0;
        inset-block-end: 0;
        will-change: inset-inline-start, inset-inline-end;
        animation: p-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    }

    .p-progressbar-indeterminate .p-progressbar-value::after {
        content: '';
        position: absolute;
        background: inherit;
        inset-block-start: 0;
        inset-inline-start: 0;
        inset-block-end: 0;
        will-change: inset-inline-start, inset-inline-end;
        animation: p-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
        animation-delay: 1.15s;
    }

    @keyframes p-progressbar-indeterminate-anim {
        0% {
            inset-inline-start: -35%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
        100% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
    }
    @-webkit-keyframes p-progressbar-indeterminate-anim {
        0% {
            inset-inline-start: -35%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
        100% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
    }

    @keyframes p-progressbar-indeterminate-anim-short {
        0% {
            inset-inline-start: -200%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
        100% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
    }
    @-webkit-keyframes p-progressbar-indeterminate-anim-short {
        0% {
            inset-inline-start: -200%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
        100% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
    }
`;var $e=["content"],Le=t=>({$implicit:t});function je(t,n){if(t&1&&(r(0,"div"),m(1),o()),t&2){let e=c(2);P("display",e.value!=null&&e.value!==0?"flex":"none"),s(),Z("",e.value,"",e.unit)}}function He(t,n){t&1&&J(0)}function Qe(t,n){if(t&1&&(r(0,"div",2)(1,"div",2),h(2,je,2,4,"div",3)(3,He,1,0,"ng-container",4),o()()),t&2){let e=c();x(e.cn(e.cx("value"),e.valueStyleClass)),P("width",e.value+"%")("display","flex")("background",e.color),l("pBind",e.ptm("value")),S("data-p",e.dataP),s(),x(e.cx("label")),l("pBind",e.ptm("label")),S("data-p",e.dataP),s(),l("ngIf",e.showValue&&!e.contentTemplate&&!e._contentTemplate),s(),l("ngTemplateOutlet",e.contentTemplate||e._contentTemplate)("ngTemplateOutletContext",ee(17,Le,e.value))}}function qe(t,n){if(t&1&&p(0,"div",2),t&2){let e=c();x(e.cn(e.cx("value"),e.valueStyleClass)),P("background",e.color),l("pBind",e.ptm("value")),S("data-p",e.dataP)}}var Ge={root:({instance:t})=>["p-progressbar p-component",{"p-progressbar-determinate":t.mode=="determinate","p-progressbar-indeterminate":t.mode=="indeterminate"}],value:"p-progressbar-value",label:"p-progressbar-label"},ze=(()=>{class t extends me{name="progressbar";style=Ve;classes=Ge;static \u0275fac=(()=>{let e;return function(a){return(e||(e=O(t)))(a||t)}})();static \u0275prov=L({token:t,factory:t.\u0275fac})}return t})();var Ne=new H("PROGRESSBAR_INSTANCE"),We=(()=>{class t extends ue{$pcProgressBar=u(Ne,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=u(T,{self:!0});value;showValue=!0;styleClass;valueStyleClass;unit="%";mode="determinate";color;contentTemplate;onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}_componentStyle=u(ze);templates;_contentTemplate;onAfterContentInit(){this.templates?.forEach(e=>{switch(e.getType()){case"content":this._contentTemplate=e.template;break;default:this._contentTemplate=e.template}})}get dataP(){return this.cn({determinate:this.mode==="determinate",indeterminate:this.mode==="indeterminate"})}static \u0275fac=(()=>{let e;return function(a){return(e||(e=O(t)))(a||t)}})();static \u0275cmp=C({type:t,selectors:[["p-progressBar"],["p-progressbar"],["p-progress-bar"]],contentQueries:function(i,a,d){if(i&1&&K(d,$e,4)(d,M,4),i&2){let w;B(w=V())&&(a.contentTemplate=w.first),B(w=V())&&(a.templates=w)}},hostAttrs:["role","progressbar"],hostVars:7,hostBindings:function(i,a){i&2&&(S("aria-valuemin",0)("aria-valuenow",a.value)("aria-valuemax",100)("aria-level",a.value+a.unit)("data-p",a.dataP),x(a.cn(a.cx("root"),a.styleClass)))},inputs:{value:[2,"value","value",re],showValue:[2,"showValue","showValue",ie],styleClass:"styleClass",valueStyleClass:"valueStyleClass",unit:"unit",mode:"mode",color:"color"},features:[R([ze,{provide:Ne,useExisting:t},{provide:de,useExisting:t}]),G([T]),W],decls:2,vars:2,consts:[[3,"class","pBind","width","display","background",4,"ngIf"],[3,"class","pBind","background",4,"ngIf"],[3,"pBind"],[3,"display",4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"]],template:function(i,a){i&1&&h(0,Qe,4,19,"div",0)(1,qe,1,6,"div",1),i&2&&(l("ngIf",a.mode==="determinate"),s(),l("ngIf",a.mode==="indeterminate"))},dependencies:[le,oe,ae,k,T],encapsulation:2,changeDetection:0})}return t})(),Fe=(()=>{class t{static \u0275fac=function(i){return new(i||t)};static \u0275mod=q({type:t});static \u0275inj=j({imports:[We,k,k]})}return t})();var Ue=()=>[10,25,50],Xe=()=>({"min-width":"70rem"});function Ye(t,n){if(t&1){let e=v();r(0,"div",6)(1,"div",7)(2,"h2"),p(3,"i",8),m(4," Historial de Sincronizaciones"),o(),p(5,"p-chip",9),o(),r(6,"div",10)(7,"span",11),p(8,"i",12),r(9,"input",13),g("input",function(a){y(e),c();let d=U(1);return f(d.filterGlobal(a.target.value,"contains"))}),o()()()()}if(t&2){let e=c();s(5),l("label",e.syncRuns().length.toString())}}function Ze(t,n){t&1&&(r(0,"tr")(1,"th",14),m(2," Inicio "),p(3,"p-sortIcon",15),o(),r(4,"th"),m(5,"Duraci\xF3n"),o(),r(6,"th",16),m(7,"Dominios"),o(),r(8,"th",16),m(9,"Suscripciones"),o(),r(10,"th",16),m(11,"Estado"),o(),r(12,"th"),m(13,"Errores"),o(),r(14,"th",16),m(15,"Acciones"),o()())}function et(t,n){if(t&1&&p(0,"p-chip",18),t&2){let e=c().$implicit,i=c();l("label",i.formatDuration(e.getDuration()))}}function tt(t,n){t&1&&(r(0,"span",19),m(1,"En progreso..."),o())}function nt(t,n){if(t&1){let e=v();r(0,"p-button",26),g("onClick",function(){y(e);let a=c().$implicit,d=c();return f(d.viewErrors.emit(a))}),o()}if(t&2){let e=c().$implicit;l("label",e.errors.length+" error(es)")("text",!0)("size","small")}}function it(t,n){t&1&&(r(0,"span",24),p(1,"i",27),m(2," Sin errores "),o())}function rt(t,n){if(t&1){let e=v();r(0,"tr")(1,"td"),p(2,"i",17),m(3),te(4,"date"),o(),r(5,"td"),_(6,et,1,1,"p-chip",18)(7,tt,2,0,"span",19),o(),r(8,"td",16),p(9,"p-chip",20),o(),r(10,"td",16),p(11,"p-chip",21),o(),r(12,"td",16),p(13,"p-tag",22),o(),r(14,"td"),_(15,nt,1,3,"p-button",23)(16,it,3,0,"span",24),o(),r(17,"td",16)(18,"p-button",25),g("onClick",function(){let a=y(e).$implicit,d=c();return f(d.viewDetails.emit(a))}),o()()()}if(t&2){let e=n.$implicit,i=c();s(3),Y(" ",ne(4,10,e.startedAt.toDate(),"dd/MM/yyyy HH:mm:ss")," "),s(3),b(e.getDuration()?6:7),s(3),l("label",(e.domainsProcessed||0).toString()),s(2),l("label",(e.subscriptionsProcessed||0).toString()),s(2),l("value",e.getStatusLabel())("severity",e.getSeverity())("icon",i.getStatusIcon(e)),s(2),b(e.errors&&e.errors.length>0?15:16),s(3),l("rounded",!0)("text",!0)}}function ot(t,n){t&1&&(r(0,"tr")(1,"td",28),p(2,"i",29),r(3,"p",30),m(4," No se encontraron sincronizaciones "),o()()())}var I=class t{syncRuns=A.required();isLoading=A(!1);viewDetails=N();viewErrors=N();formatDuration(n){let e=Math.floor(n/1e3);if(e<60)return`${e}s`;let i=Math.floor(e/60),a=e%60;return`${i}m ${a}s`}getStatusIcon(n){return n.isSuccess()?"pi pi-check-circle":n.isFailed()?"pi pi-times-circle":n.isPartialSuccess&&n.isPartialSuccess()?"pi pi-exclamation-circle":"pi pi-info-circle"}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=C({type:t,selectors:[["app-sync-runs-table"]],inputs:{syncRuns:[1,"syncRuns"],isLoading:[1,"isLoading"]},outputs:{viewDetails:"viewDetails",viewErrors:"viewErrors"},decls:6,vars:9,consts:[["dt",""],["styleClass","p-datatable-sm",3,"value","loading","paginator","rows","rowsPerPageOptions","tableStyle","rowHover"],["pTemplate","caption"],["pTemplate","header"],["pTemplate","body"],["pTemplate","emptymessage"],[1,"table-header"],[1,"header-left"],[1,"pi","pi-sync"],["styleClass","ml-2",3,"label"],[1,"header-right"],[1,"p-input-icon-left"],[1,"pi","pi-search"],["pInputText","","type","text","placeholder","Buscar...",3,"input"],["pSortableColumn","startedAt"],["field","startedAt"],[2,"text-align","center"],[1,"pi","pi-calendar","mr-2"],["styleClass","duration-chip",3,"label"],[1,"text-muted"],["styleClass","count-chip","icon","pi pi-globe",3,"label"],["styleClass","count-chip","icon","pi pi-shopping-cart",3,"label"],[3,"value","severity","icon"],["icon","pi pi-exclamation-triangle","severity","danger","pTooltip","Ver errores",3,"label","text","size"],[1,"text-success"],["icon","pi pi-eye","severity","secondary","pTooltip","Ver detalles",3,"onClick","rounded","text"],["icon","pi pi-exclamation-triangle","severity","danger","pTooltip","Ver errores",3,"onClick","label","text","size"],[1,"pi","pi-check-circle","mr-1"],["colspan","7",2,"text-align","center","padding","3rem"],[1,"pi","pi-inbox",2,"font-size","3rem","color","var(--text-color-secondary)"],[2,"margin-top","1rem","color","var(--text-color-secondary)"]],template:function(e,i){e&1&&(r(0,"p-table",1,0),h(2,Ye,10,1,"ng-template",2)(3,Ze,16,0,"ng-template",3)(4,rt,19,13,"ng-template",4)(5,ot,5,0,"ng-template",5),o()),e&2&&l("value",i.syncRuns())("loading",i.isLoading())("paginator",!0)("rows",10)("rowsPerPageOptions",z(7,Ue))("tableStyle",z(8,Xe))("rowHover",!0)},dependencies:[Oe,Ee,M,De,Ie,D,E,ke,Me,ve,be,ye,ge,_e,fe,Fe,se],styles:[".table-header[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;padding:1rem;background:var(--surface-100);border-radius:8px;margin-bottom:1rem}.header-left[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.5rem}.header-left[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0;font-size:1.5rem;display:flex;align-items:center;gap:.5rem}.header-left[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{color:var(--primary-color)}.header-right[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.5rem}.duration-chip[_ngcontent-%COMP%]{background-color:var(--blue-100);color:var(--blue-900)}.count-chip[_ngcontent-%COMP%]{background-color:var(--surface-200);color:var(--text-color)}.text-muted[_ngcontent-%COMP%]{color:var(--text-color-secondary);font-style:italic}.text-success[_ngcontent-%COMP%]{color:var(--green-600)}"],changeDetection:0})};function at(t,n){t&1&&(r(0,"p-card"),p(1,"p-skeleton",10),o())}function st(t,n){if(t&1){let e=v();r(0,"p-card")(1,"div",11),p(2,"i",12),r(3,"h2"),m(4,"Error al cargar historial"),o(),r(5,"p"),m(6),o(),r(7,"p-button",13),g("onClick",function(){y(e);let a=c();return f(a.loadSyncRuns())}),o()()()}if(t&2){let e=c();s(6),X(e.error())}}function lt(t,n){if(t&1){let e=v();r(0,"app-sync-runs-table",14),g("viewDetails",function(a){y(e);let d=c();return f(d.onViewDetails(a))})("viewErrors",function(a){y(e);let d=c();return f(d.onViewErrors(a))}),o()}if(t&2){let e=c();l("syncRuns",e.syncRuns())("isLoading",e.isLoading())}}var $=class t{syncRunService=u(Be);route=u(ce);router=u(pe);messageService=u(F);syncRuns=this.syncRunService.syncRuns;isLoading=this.syncRunService.isLoading;error=this.syncRunService.error;workspaceId=Q("");ngOnInit(){this.route.paramMap.subscribe(n=>{let e=n.get("workspaceId");e&&(this.workspaceId.set(e),this.loadSyncRuns())})}async loadSyncRuns(){let n=this.workspaceId();if(n)try{await this.syncRunService.getSyncRunsByWorkspace(n)}catch{this.messageService.add({severity:"error",summary:"Error",detail:"No se pudo cargar el historial de sincronizaciones"})}}onViewDetails(n){let e=n.getDurationMs(),i=e?`${Math.floor(e/1e3)}s`:"En progreso";this.messageService.add({severity:"info",summary:"Detalles de Sincronizaci\xF3n",detail:`
        Estado: ${n.status}
        Duraci\xF3n: ${i}
        Dominios: ${n.domainsProcessed||0}
        Suscripciones: ${n.subscriptionsProcessed||0}
      `,life:5e3})}onViewErrors(n){let e=n.errors||[];this.messageService.add({severity:"error",summary:`${e.length} Error(es) en Sincronizaci\xF3n`,detail:e.map(i=>`\u2022 ${i.message}`).join(`
`),life:1e4})}goBack(){let n=this.workspaceId();n?this.router.navigate(["/w",n]):this.router.navigate(["/dashboard"])}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=C({type:t,selectors:[["app-sync-runs-page"]],features:[R([F])],decls:14,vars:6,consts:[[1,"sync-runs-container"],["styleClass","sync-runs-toolbar"],[1,"p-toolbar-group-start"],[1,"page-title"],[1,"pi","pi-sync"],[1,"p-toolbar-group-end"],["label","Actualizar","icon","pi pi-refresh","pTooltip","Actualizar historial","tooltipPosition","bottom",3,"onClick","outlined","loading"],["label","Volver","icon","pi pi-arrow-left","severity","secondary","styleClass","ml-2",3,"onClick","outlined"],[1,"sync-runs-content"],[3,"syncRuns","isLoading"],["height","400px"],[1,"error-state"],[1,"pi","pi-exclamation-triangle"],["label","Reintentar","icon","pi pi-refresh",3,"onClick"],[3,"viewDetails","viewErrors","syncRuns","isLoading"]],template:function(e,i){e&1&&(r(0,"div",0),p(1,"p-toast"),r(2,"p-toolbar",1)(3,"div",2)(4,"h1",3),p(5,"i",4),m(6," Historial de Sincronizaciones "),o()(),r(7,"div",5)(8,"p-button",6),g("onClick",function(){return i.loadSyncRuns()}),o(),r(9,"p-button",7),g("onClick",function(){return i.goBack()}),o()()(),r(10,"div",8),_(11,at,2,0,"p-card"),_(12,st,8,1,"p-card"),_(13,lt,1,2,"app-sync-runs-table",9),o()()),e&2&&(s(8),l("outlined",!0)("loading",i.isLoading()),s(),l("outlined",!0),s(2),b(i.isLoading()&&i.syncRuns().length===0?11:-1),s(),b(i.error()&&!i.isLoading()?12:-1),s(),b(i.syncRuns().length>0||!i.isLoading()&&!i.error()?13:-1))},dependencies:[he,Ce,D,E,xe,Se,we,Te,Re,Pe,I],styles:[".sync-runs-container[_ngcontent-%COMP%]{min-height:100vh;background-color:var(--surface-50)}.sync-runs-toolbar[_ngcontent-%COMP%]{box-shadow:0 2px 4px #00000014;margin-bottom:2rem;background:#fff;border-bottom:1px solid var(--surface-200)}.page-title[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;font-weight:700;font-size:1.5rem;color:var(--text-color);margin:0}.page-title[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{color:var(--primary-color)}.sync-runs-content[_ngcontent-%COMP%]{max-width:1400px;margin:0 auto;padding:0 2rem 2rem}.error-state[_ngcontent-%COMP%]{text-align:center;padding:3rem}.error-state[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{font-size:4rem;color:var(--red-500);margin-bottom:1rem}.error-state[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{color:var(--text-color);margin-bottom:.5rem}.error-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:var(--text-color-secondary);margin-bottom:2rem}@media(max-width:768px){.page-title[_ngcontent-%COMP%]{font-size:1.25rem}.sync-runs-content[_ngcontent-%COMP%]{padding:0 1rem 1rem}}"],changeDetection:0})};export{$ as default};
