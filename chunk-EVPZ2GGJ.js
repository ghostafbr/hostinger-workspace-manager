import{a as je,b as Le}from"./chunk-R3SCWHIH.js";import{a as ze,b as Ae}from"./chunk-X7CD7GNO.js";import{a as _e}from"./chunk-DFVSDEUQ.js";import{Ab as Ee,Bb as Se,Ca as B,Cb as Pe,Db as Be,Ea as ye,Fb as Fe,Ib as De,Mb as Ne,Nb as Oe,Ya as F,Za as D,a as fe,c as be,db as d,e as he,eb as W,i as q,kb as xe,lb as Ce,nb as we,ob as Me,u as ve,ub as Ie,vb as G,xb as ke,ya as U,yb as Te,za as g}from"./chunk-TZ5WZBNW.js";import{Eb as V,Ec as J,Fb as se,Ja as te,Jb as H,Kb as c,Lb as N,Mb as O,Nb as re,O as M,Oa as r,P as I,Pb as A,Qb as j,R as k,T as a,Ub as ae,Vb as pe,Wb as le,Xb as ce,Y as Z,Yb as u,Z as ee,Zb as x,_ as R,_b as L,a as $,ab as y,bb as T,da as ne,eb as E,ec as P,fb as S,gb as _,gc as de,ia as z,mb as m,nb as oe,oa as b,ob as ie,pb as h,qb as v,qc as ue,tc as me,vb as s,wb as l,wc as ge,xb as p,yb as f}from"./chunk-ZVXIGZDY.js";var Ge=`
    .p-message {
        display: grid;
        grid-template-rows: 1fr;
        border-radius: dt('message.border.radius');
        outline-width: dt('message.border.width');
        outline-style: solid;
    }

    .p-message-content-wrapper {
        min-height: 0;
    }

    .p-message-content {
        display: flex;
        align-items: center;
        padding: dt('message.content.padding');
        gap: dt('message.content.gap');
    }

    .p-message-icon {
        flex-shrink: 0;
    }

    .p-message-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-inline-start: auto;
        overflow: hidden;
        position: relative;
        width: dt('message.close.button.width');
        height: dt('message.close.button.height');
        border-radius: dt('message.close.button.border.radius');
        background: transparent;
        transition:
            background dt('message.transition.duration'),
            color dt('message.transition.duration'),
            outline-color dt('message.transition.duration'),
            box-shadow dt('message.transition.duration'),
            opacity 0.3s;
        outline-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        cursor: pointer;
        user-select: none;
    }

    .p-message-close-icon {
        font-size: dt('message.close.icon.size');
        width: dt('message.close.icon.size');
        height: dt('message.close.icon.size');
    }

    .p-message-close-button:focus-visible {
        outline-width: dt('message.close.button.focus.ring.width');
        outline-style: dt('message.close.button.focus.ring.style');
        outline-offset: dt('message.close.button.focus.ring.offset');
    }

    .p-message-info {
        background: dt('message.info.background');
        outline-color: dt('message.info.border.color');
        color: dt('message.info.color');
        box-shadow: dt('message.info.shadow');
    }

    .p-message-info .p-message-close-button:focus-visible {
        outline-color: dt('message.info.close.button.focus.ring.color');
        box-shadow: dt('message.info.close.button.focus.ring.shadow');
    }

    .p-message-info .p-message-close-button:hover {
        background: dt('message.info.close.button.hover.background');
    }

    .p-message-info.p-message-outlined {
        color: dt('message.info.outlined.color');
        outline-color: dt('message.info.outlined.border.color');
    }

    .p-message-info.p-message-simple {
        color: dt('message.info.simple.color');
    }

    .p-message-success {
        background: dt('message.success.background');
        outline-color: dt('message.success.border.color');
        color: dt('message.success.color');
        box-shadow: dt('message.success.shadow');
    }

    .p-message-success .p-message-close-button:focus-visible {
        outline-color: dt('message.success.close.button.focus.ring.color');
        box-shadow: dt('message.success.close.button.focus.ring.shadow');
    }

    .p-message-success .p-message-close-button:hover {
        background: dt('message.success.close.button.hover.background');
    }

    .p-message-success.p-message-outlined {
        color: dt('message.success.outlined.color');
        outline-color: dt('message.success.outlined.border.color');
    }

    .p-message-success.p-message-simple {
        color: dt('message.success.simple.color');
    }

    .p-message-warn {
        background: dt('message.warn.background');
        outline-color: dt('message.warn.border.color');
        color: dt('message.warn.color');
        box-shadow: dt('message.warn.shadow');
    }

    .p-message-warn .p-message-close-button:focus-visible {
        outline-color: dt('message.warn.close.button.focus.ring.color');
        box-shadow: dt('message.warn.close.button.focus.ring.shadow');
    }

    .p-message-warn .p-message-close-button:hover {
        background: dt('message.warn.close.button.hover.background');
    }

    .p-message-warn.p-message-outlined {
        color: dt('message.warn.outlined.color');
        outline-color: dt('message.warn.outlined.border.color');
    }

    .p-message-warn.p-message-simple {
        color: dt('message.warn.simple.color');
    }

    .p-message-error {
        background: dt('message.error.background');
        outline-color: dt('message.error.border.color');
        color: dt('message.error.color');
        box-shadow: dt('message.error.shadow');
    }

    .p-message-error .p-message-close-button:focus-visible {
        outline-color: dt('message.error.close.button.focus.ring.color');
        box-shadow: dt('message.error.close.button.focus.ring.shadow');
    }

    .p-message-error .p-message-close-button:hover {
        background: dt('message.error.close.button.hover.background');
    }

    .p-message-error.p-message-outlined {
        color: dt('message.error.outlined.color');
        outline-color: dt('message.error.outlined.border.color');
    }

    .p-message-error.p-message-simple {
        color: dt('message.error.simple.color');
    }

    .p-message-secondary {
        background: dt('message.secondary.background');
        outline-color: dt('message.secondary.border.color');
        color: dt('message.secondary.color');
        box-shadow: dt('message.secondary.shadow');
    }

    .p-message-secondary .p-message-close-button:focus-visible {
        outline-color: dt('message.secondary.close.button.focus.ring.color');
        box-shadow: dt('message.secondary.close.button.focus.ring.shadow');
    }

    .p-message-secondary .p-message-close-button:hover {
        background: dt('message.secondary.close.button.hover.background');
    }

    .p-message-secondary.p-message-outlined {
        color: dt('message.secondary.outlined.color');
        outline-color: dt('message.secondary.outlined.border.color');
    }

    .p-message-secondary.p-message-simple {
        color: dt('message.secondary.simple.color');
    }

    .p-message-contrast {
        background: dt('message.contrast.background');
        outline-color: dt('message.contrast.border.color');
        color: dt('message.contrast.color');
        box-shadow: dt('message.contrast.shadow');
    }

    .p-message-contrast .p-message-close-button:focus-visible {
        outline-color: dt('message.contrast.close.button.focus.ring.color');
        box-shadow: dt('message.contrast.close.button.focus.ring.shadow');
    }

    .p-message-contrast .p-message-close-button:hover {
        background: dt('message.contrast.close.button.hover.background');
    }

    .p-message-contrast.p-message-outlined {
        color: dt('message.contrast.outlined.color');
        outline-color: dt('message.contrast.outlined.border.color');
    }

    .p-message-contrast.p-message-simple {
        color: dt('message.contrast.simple.color');
    }

    .p-message-text {
        font-size: dt('message.text.font.size');
        font-weight: dt('message.text.font.weight');
    }

    .p-message-icon {
        font-size: dt('message.icon.size');
        width: dt('message.icon.size');
        height: dt('message.icon.size');
    }

    .p-message-sm .p-message-content {
        padding: dt('message.content.sm.padding');
    }

    .p-message-sm .p-message-text {
        font-size: dt('message.text.sm.font.size');
    }

    .p-message-sm .p-message-icon {
        font-size: dt('message.icon.sm.size');
        width: dt('message.icon.sm.size');
        height: dt('message.icon.sm.size');
    }

    .p-message-sm .p-message-close-icon {
        font-size: dt('message.close.icon.sm.size');
        width: dt('message.close.icon.sm.size');
        height: dt('message.close.icon.sm.size');
    }

    .p-message-lg .p-message-content {
        padding: dt('message.content.lg.padding');
    }

    .p-message-lg .p-message-text {
        font-size: dt('message.text.lg.font.size');
    }

    .p-message-lg .p-message-icon {
        font-size: dt('message.icon.lg.size');
        width: dt('message.icon.lg.size');
        height: dt('message.icon.lg.size');
    }

    .p-message-lg .p-message-close-icon {
        font-size: dt('message.close.icon.lg.size');
        width: dt('message.close.icon.lg.size');
        height: dt('message.close.icon.lg.size');
    }

    .p-message-outlined {
        background: transparent;
        outline-width: dt('message.outlined.border.width');
    }

    .p-message-simple {
        background: transparent;
        outline-color: transparent;
        box-shadow: none;
    }

    .p-message-simple .p-message-content {
        padding: dt('message.simple.content.padding');
    }

    .p-message-outlined .p-message-close-button:hover,
    .p-message-simple .p-message-close-button:hover {
        background: transparent;
    }

    .p-message-enter-active {
        animation: p-animate-message-enter 0.3s ease-out forwards;
        overflow: hidden;
    }

    .p-message-leave-active {
        animation: p-animate-message-leave 0.15s ease-in forwards;
        overflow: hidden;
    }

    @keyframes p-animate-message-enter {
        from {
            opacity: 0;
            grid-template-rows: 0fr;
        }
        to {
            opacity: 1;
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-message-leave {
        from {
            opacity: 1;
            grid-template-rows: 1fr;
        }
        to {
            opacity: 0;
            margin: 0;
            grid-template-rows: 0fr;
        }
    }
`;var nn=["container"],tn=["icon"],on=["closeicon"],sn=["*"],rn=e=>({closeCallback:e});function an(e,i){e&1&&V(0)}function pn(e,i){if(e&1&&_(0,an,1,0,"ng-container",4),e&2){let n=c();s("ngTemplateOutlet",n.iconTemplate||n._iconTemplate)}}function ln(e,i){if(e&1&&f(0,"i",1),e&2){let n=c();u(n.cn(n.cx("icon"),n.icon)),s("pBind",n.ptm("icon")),m("data-p",n.dataP)}}function cn(e,i){e&1&&V(0)}function dn(e,i){if(e&1&&_(0,cn,1,0,"ng-container",5),e&2){let n=c();s("ngTemplateOutlet",n.containerTemplate||n._containerTemplate)("ngTemplateOutletContext",de(2,rn,n.closeCallback))}}function un(e,i){if(e&1&&f(0,"span",9),e&2){let n=c(3);s("pBind",n.ptm("text"))("ngClass",n.cx("text"))("innerHTML",n.text,te),m("data-p",n.dataP)}}function mn(e,i){if(e&1&&(l(0,"div"),_(1,un,1,4,"span",8),p()),e&2){let n=c(2);r(),s("ngIf",!n.escape)}}function gn(e,i){if(e&1&&(l(0,"span",7),x(1),p()),e&2){let n=c(3);s("pBind",n.ptm("text"))("ngClass",n.cx("text")),m("data-p",n.dataP),r(),L(n.text)}}function fn(e,i){if(e&1&&_(0,gn,2,4,"span",10),e&2){let n=c(2);s("ngIf",n.escape&&n.text)}}function bn(e,i){if(e&1&&(_(0,mn,2,1,"div",6)(1,fn,1,1,"ng-template",null,0,ue),l(3,"span",7),O(4),p()),e&2){let n=ae(2),o=c();s("ngIf",!o.escape)("ngIfElse",n),r(3),s("pBind",o.ptm("text"))("ngClass",o.cx("text")),m("data-p",o.dataP)}}function hn(e,i){if(e&1&&f(0,"i",7),e&2){let n=c(2);u(n.cn(n.cx("closeIcon"),n.closeIcon)),s("pBind",n.ptm("closeIcon"))("ngClass",n.closeIcon),m("data-p",n.dataP)}}function vn(e,i){e&1&&V(0)}function yn(e,i){if(e&1&&_(0,vn,1,0,"ng-container",4),e&2){let n=c(2);s("ngTemplateOutlet",n.closeIconTemplate||n._closeIconTemplate)}}function _n(e,i){if(e&1&&(R(),f(0,"svg",14)),e&2){let n=c(2);u(n.cx("closeIcon")),s("pBind",n.ptm("closeIcon")),m("data-p",n.dataP)}}function xn(e,i){if(e&1){let n=se();l(0,"button",11),H("click",function(t){Z(n);let C=c();return ee(C.close(t))}),h(1,hn,1,5,"i",12),h(2,yn,1,1,"ng-container"),h(3,_n,1,4,":svg:svg",13),p()}if(e&2){let n=c();u(n.cx("closeButton")),s("pBind",n.ptm("closeButton")),m("aria-label",n.closeAriaLabel)("data-p",n.dataP),r(),v(n.closeIcon?1:-1),r(),v(n.closeIconTemplate||n._closeIconTemplate?2:-1),r(),v(!n.closeIconTemplate&&!n._closeIconTemplate&&!n.closeIcon?3:-1)}}var Cn={root:({instance:e})=>["p-message p-component p-message-"+e.severity,e.variant&&"p-message-"+e.variant,{"p-message-sm":e.size==="small","p-message-lg":e.size==="large"}],contentWrapper:"p-message-content-wrapper",content:"p-message-content",icon:"p-message-icon",text:"p-message-text",closeButton:"p-message-close-button",closeIcon:"p-message-close-icon"},Re=(()=>{class e extends B{name="message";style=Ge;classes=Cn;static \u0275fac=(()=>{let n;return function(t){return(n||(n=b(e)))(t||e)}})();static \u0275prov=M({token:e,factory:e.\u0275fac})}return e})();var Ve=new k("MESSAGE_INSTANCE"),X=(()=>{class e extends D{_componentStyle=a(Re);bindDirectiveInstance=a(d,{self:!0});$pcMessage=a(Ve,{optional:!0,skipSelf:!0})??void 0;onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}severity="info";text;escape=!0;style;styleClass;closable=!1;icon;closeIcon;life;showTransitionOptions="300ms ease-out";hideTransitionOptions="200ms cubic-bezier(0.86, 0, 0.07, 1)";size;variant;motionOptions=ge(void 0);computedMotionOptions=me(()=>$($({},this.ptm("motion")),this.motionOptions()));onClose=new ne;get closeAriaLabel(){return this.config.translation.aria?this.config.translation.aria.close:void 0}visible=z(!0);containerTemplate;iconTemplate;closeIconTemplate;templates;_containerTemplate;_iconTemplate;_closeIconTemplate;closeCallback=n=>{this.close(n)};onInit(){this.life&&setTimeout(()=>{this.visible.set(!1)},this.life)}onAfterContentInit(){this.templates?.forEach(n=>{switch(n.getType()){case"container":this._containerTemplate=n.template;break;case"icon":this._iconTemplate=n.template;break;case"closeicon":this._closeIconTemplate=n.template;break}})}close(n){this.visible.set(!1),this.onClose.emit({originalEvent:n})}get dataP(){return this.cn({outlined:this.variant==="outlined",simple:this.variant==="simple",[this.severity]:this.severity,[this.size]:this.size})}static \u0275fac=(()=>{let n;return function(t){return(n||(n=b(e)))(t||e)}})();static \u0275cmp=y({type:e,selectors:[["p-message"]],contentQueries:function(o,t,C){if(o&1&&re(C,nn,4)(C,tn,4)(C,on,4)(C,U,4),o&2){let w;A(w=j())&&(t.containerTemplate=w.first),A(w=j())&&(t.iconTemplate=w.first),A(w=j())&&(t.closeIconTemplate=w.first),A(w=j())&&(t.templates=w)}},hostAttrs:["role","alert","aria-live","polite"],hostVars:5,hostBindings:function(o,t){o&1&&(oe(function(){return"p-message-enter-active"}),ie(function(){return"p-message-leave-active"})),o&2&&(m("data-p",t.dataP),u(t.cn(t.cx("root"),t.styleClass)),le("p-message-leave-active",!t.visible()))},inputs:{severity:"severity",text:"text",escape:[2,"escape","escape",J],style:"style",styleClass:"styleClass",closable:[2,"closable","closable",J],icon:"icon",closeIcon:"closeIcon",life:"life",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",size:"size",variant:"variant",motionOptions:[1,"motionOptions"]},outputs:{onClose:"onClose"},features:[P([Re,{provide:Ve,useExisting:e},{provide:F,useExisting:e}]),E([d]),S],ngContentSelectors:sn,decls:7,vars:12,consts:[["escapeOut",""],[3,"pBind"],[3,"pBind","class"],["pRipple","","type","button",3,"pBind","class"],[4,"ngTemplateOutlet"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[4,"ngIf","ngIfElse"],[3,"pBind","ngClass"],[3,"pBind","ngClass","innerHTML",4,"ngIf"],[3,"pBind","ngClass","innerHTML"],[3,"pBind","ngClass",4,"ngIf"],["pRipple","","type","button",3,"click","pBind"],[3,"pBind","class","ngClass"],["data-p-icon","times",3,"pBind","class"],["data-p-icon","times",3,"pBind"]],template:function(o,t){o&1&&(N(),l(0,"div",1)(1,"div",1),h(2,pn,1,1,"ng-container"),h(3,ln,1,4,"i",2),h(4,dn,1,4,"ng-container")(5,bn,5,5),h(6,xn,4,8,"button",3),p()()),o&2&&(u(t.cx("contentWrapper")),s("pBind",t.ptm("contentWrapper")),m("data-p",t.dataP),r(),u(t.cx("content")),s("pBind",t.ptm("content")),m("data-p",t.dataP),r(),v(t.iconTemplate||t._iconTemplate?2:-1),r(),v(t.icon?3:-1),r(),v(t.containerTemplate||t._containerTemplate?4:5),r(2),v(t.closable?6:-1))},dependencies:[q,fe,be,he,xe,Ce,g,d,De],encapsulation:2,changeDetection:0})}return e})(),He=(()=>{class e{static \u0275fac=function(o){return new(o||e)};static \u0275mod=T({type:e});static \u0275inj=I({imports:[X,g,g]})}return e})();var qe=`
    .p-progressspinner {
        position: relative;
        margin: 0 auto;
        width: 100px;
        height: 100px;
        display: inline-block;
    }

    .p-progressspinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    .p-progressspinner-spin {
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        animation: p-progressspinner-rotate 2s linear infinite;
    }

    .p-progressspinner-circle {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        stroke: dt('progressspinner.colorOne');
        animation:
            p-progressspinner-dash 1.5s ease-in-out infinite,
            p-progressspinner-color 6s ease-in-out infinite;
        stroke-linecap: round;
    }

    @keyframes p-progressspinner-rotate {
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes p-progressspinner-dash {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
        }
        100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
        }
    }
    @keyframes p-progressspinner-color {
        100%,
        0% {
            stroke: dt('progressspinner.color.one');
        }
        40% {
            stroke: dt('progressspinner.color.two');
        }
        66% {
            stroke: dt('progressspinner.color.three');
        }
        80%,
        90% {
            stroke: dt('progressspinner.color.four');
        }
    }
`;var Mn={root:()=>["p-progressspinner"],spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},Ue=(()=>{class e extends B{name="progressspinner";style=qe;classes=Mn;static \u0275fac=(()=>{let n;return function(t){return(n||(n=b(e)))(t||e)}})();static \u0275prov=M({token:e,factory:e.\u0275fac})}return e})();var We=new k("PROGRESSSPINNER_INSTANCE"),In=(()=>{class e extends D{$pcProgressSpinner=a(We,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=a(d,{self:!0});styleClass;strokeWidth="2";fill="none";animationDuration="2s";ariaLabel;onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}_componentStyle=a(Ue);static \u0275fac=(()=>{let n;return function(t){return(n||(n=b(e)))(t||e)}})();static \u0275cmp=y({type:e,selectors:[["p-progressSpinner"],["p-progress-spinner"],["p-progressspinner"]],hostVars:5,hostBindings:function(o,t){o&2&&(m("aria-label",t.ariaLabel)("role","progressbar")("aria-busy",!0),u(t.cn(t.cx("root"),t.styleClass)))},inputs:{styleClass:"styleClass",strokeWidth:"strokeWidth",fill:"fill",animationDuration:"animationDuration",ariaLabel:"ariaLabel"},features:[P([Ue,{provide:We,useExisting:e},{provide:F,useExisting:e}]),E([d]),S],decls:2,vars:10,consts:[["viewBox","25 25 50 50",3,"pBind"],["cx","50","cy","50","r","20","stroke-miterlimit","10",3,"pBind"]],template:function(o,t){o&1&&(R(),l(0,"svg",0),f(1,"circle",1),p()),o&2&&(u(t.cx("spin")),pe("animation-duration",t.animationDuration),s("pBind",t.ptm("spin")),r(),u(t.cx("circle")),s("pBind",t.ptm("circle")),m("fill",t.fill)("stroke-width",t.strokeWidth))},dependencies:[q,g,d],encapsulation:2,changeDetection:0})}return e})(),Qe=(()=>{class e{static \u0275fac=function(o){return new(o||e)};static \u0275mod=T({type:e});static \u0275inj=I({imports:[In,g,g]})}return e})();var $e=`
    .p-inputgroup,
    .p-inputgroup .p-iconfield,
    .p-inputgroup .p-floatlabel,
    .p-inputgroup .p-iftalabel {
        display: flex;
        align-items: stretch;
        width: 100%;
    }

    .p-inputgroup .p-inputtext,
    .p-inputgroup .p-inputwrapper {
        flex: 1 1 auto;
        width: 1%;
    }

    .p-inputgroupaddon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: dt('inputgroup.addon.padding');
        background: dt('inputgroup.addon.background');
        color: dt('inputgroup.addon.color');
        border-block-start: 1px solid dt('inputgroup.addon.border.color');
        border-block-end: 1px solid dt('inputgroup.addon.border.color');
        min-width: dt('inputgroup.addon.min.width');
    }

    .p-inputgroupaddon:first-child,
    .p-inputgroupaddon + .p-inputgroupaddon {
        border-inline-start: 1px solid dt('inputgroup.addon.border.color');
    }

    .p-inputgroupaddon:last-child {
        border-inline-end: 1px solid dt('inputgroup.addon.border.color');
    }

    .p-inputgroupaddon:has(.p-button) {
        padding: 0;
        overflow: hidden;
    }

    .p-inputgroupaddon .p-button {
        border-radius: 0;
    }

    .p-inputgroup > .p-component,
    .p-inputgroup > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iconfield > .p-component,
    .p-inputgroup > .p-floatlabel > .p-component,
    .p-inputgroup > .p-floatlabel > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel > .p-component,
    .p-inputgroup > .p-iftalabel > .p-inputwrapper > .p-component {
        border-radius: 0;
        margin: 0;
    }

    .p-inputgroupaddon:first-child,
    .p-inputgroup > .p-component:first-child,
    .p-inputgroup > .p-inputwrapper:first-child > .p-component,
    .p-inputgroup > .p-iconfield:first-child > .p-component,
    .p-inputgroup > .p-floatlabel:first-child > .p-component,
    .p-inputgroup > .p-floatlabel:first-child > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel:first-child > .p-component,
    .p-inputgroup > .p-iftalabel:first-child > .p-inputwrapper > .p-component {
        border-start-start-radius: dt('inputgroup.addon.border.radius');
        border-end-start-radius: dt('inputgroup.addon.border.radius');
    }

    .p-inputgroupaddon:last-child,
    .p-inputgroup > .p-component:last-child,
    .p-inputgroup > .p-inputwrapper:last-child > .p-component,
    .p-inputgroup > .p-iconfield:last-child > .p-component,
    .p-inputgroup > .p-floatlabel:last-child > .p-component,
    .p-inputgroup > .p-floatlabel:last-child > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel:last-child > .p-component,
    .p-inputgroup > .p-iftalabel:last-child > .p-inputwrapper > .p-component {
        border-start-end-radius: dt('inputgroup.addon.border.radius');
        border-end-end-radius: dt('inputgroup.addon.border.radius');
    }

    .p-inputgroup .p-component:focus,
    .p-inputgroup .p-component.p-focus,
    .p-inputgroup .p-inputwrapper-focus,
    .p-inputgroup .p-component:focus ~ label,
    .p-inputgroup .p-component.p-focus ~ label,
    .p-inputgroup .p-inputwrapper-focus ~ label {
        z-index: 1;
    }

    .p-inputgroup > .p-button:not(.p-button-icon-only) {
        width: auto;
    }

    .p-inputgroup .p-iconfield + .p-iconfield .p-inputtext {
        border-inline-start: 0;
    }
`;var kn=["*"],Tn=`
    ${$e}

    /*For PrimeNG*/

    .p-inputgroup > .p-component,
    .p-inputgroup > .p-inputwrapper > .p-component,
    .p-inputgroup:first-child > p-button > .p-button,
    .p-inputgroup > .p-floatlabel > .p-component,
    .p-inputgroup > .p-floatlabel > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel > .p-component,
    .p-inputgroup > .p-iftalabel > .p-inputwrapper > .p-component {
        border-radius: 0;
        margin: 0;
    }

    .p-inputgroup p-button:first-child,
    .p-inputgroup p-button:last-child {
        display: inline-flex;
    }

    .p-inputgroup:has(> p-button:first-child) .p-button {
        border-start-start-radius: dt('inputgroup.addon.border.radius');
        border-end-start-radius: dt('inputgroup.addon.border.radius');
    }

    .p-inputgroup:has(> p-button:last-child) .p-button {
        border-start-end-radius: dt('inputgroup.addon.border.radius');
        border-end-end-radius: dt('inputgroup.addon.border.radius');
    }

    .p-inputgroup > p-inputmask > .p-inputtext {
        width: 100%;
    }
`,En={root:({instance:e})=>["p-inputgroup",{"p-inputgroup-fluid":e.fluid}]},Je=(()=>{class e extends B{name="inputgroup";style=Tn;classes=En;static \u0275fac=(()=>{let n;return function(t){return(n||(n=b(e)))(t||e)}})();static \u0275prov=M({token:e,factory:e.\u0275fac})}return e})();var Ke=new k("INPUTGROUP_INSTANCE"),Sn=(()=>{class e extends D{_componentStyle=a(Je);$pcInputGroup=a(Ke,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=a(d,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}styleClass;static \u0275fac=(()=>{let n;return function(t){return(n||(n=b(e)))(t||e)}})();static \u0275cmp=y({type:e,selectors:[["p-inputgroup"],["p-inputGroup"],["p-input-group"]],hostVars:2,hostBindings:function(o,t){o&2&&u(t.cn(t.cx("root"),t.styleClass))},inputs:{styleClass:"styleClass"},features:[P([Je,{provide:Ke,useExisting:e},{provide:F,useExisting:e}]),E([d]),S],ngContentSelectors:kn,decls:1,vars:0,template:function(o,t){o&1&&(N(),O(0))},dependencies:[W],encapsulation:2})}return e})(),Xe=(()=>{class e{static \u0275fac=function(o){return new(o||e)};static \u0275mod=T({type:e});static \u0275inj=I({imports:[Sn,g,g]})}return e})();var Pn=["*"],Bn={root:"p-inputgroupaddon"},Ye=(()=>{class e extends B{name="inputgroupaddon";classes=Bn;static \u0275fac=(()=>{let n;return function(t){return(n||(n=b(e)))(t||e)}})();static \u0275prov=M({token:e,factory:e.\u0275fac})}return e})(),Ze=new k("INPUTGROUPADDON_INSTANCE"),Fn=(()=>{class e extends D{_componentStyle=a(Ye);$pcInputGroupAddon=a(Ze,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=a(d,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}style;styleClass;get hostStyle(){return this.style}static \u0275fac=(()=>{let n;return function(t){return(n||(n=b(e)))(t||e)}})();static \u0275cmp=y({type:e,selectors:[["p-inputgroup-addon"],["p-inputGroupAddon"]],hostVars:4,hostBindings:function(o,t){o&2&&(ce(t.hostStyle),u(t.cn(t.cx("root"),t.styleClass)))},inputs:{style:"style",styleClass:"styleClass"},features:[P([Ye,{provide:Ze,useExisting:e},{provide:F,useExisting:e}]),E([d]),S],ngContentSelectors:Pn,decls:1,vars:0,template:function(o,t){o&1&&(N(),O(0))},dependencies:[W],encapsulation:2})}return e})(),en=(()=>{class e{static \u0275fac=function(o){return new(o||e)};static \u0275mod=T({type:e});static \u0275inj=I({imports:[Fn,g,g]})}return e})();function Dn(e,i){e&1&&(l(0,"div",13)(1,"h1",14),x(2,"Hostinger Workspace Manager"),p(),l(3,"p",15),x(4,"Gesti\xF3n de dominios y suscripciones"),p()())}function Nn(e,i){if(e&1&&f(0,"p-message",3),e&2){let n=c();s("text",n.errorMessage())}}function On(e,i){if(e&1&&(l(0,"small",8),x(1),p()),e&2){let n=c();r(),L(n.getFieldError("email"))}}function zn(e,i){if(e&1&&(l(0,"small",8),x(1),p()),e&2){let n=c();r(),L(n.getFieldError("password"))}}function An(e,i){e&1&&(l(0,"div",16)(1,"p",17),f(2,"i",18),x(3," Solo usuarios autorizados pueden acceder a esta aplicaci\xF3n. "),p()())}var Y=class e{fb=a(Be);authService=a(_e);router=a(ve);loginForm=this.fb.group({email:["",[G.required,G.email]],password:["",[G.required,G.minLength(6)]]});isLoading=z(!1);errorMessage=z(null);async onSubmit(){if(this.loginForm.invalid){this.loginForm.markAllAsTouched();return}this.isLoading.set(!0),this.errorMessage.set(null);let{email:i,password:n}=this.loginForm.value;if(!i||!n){this.errorMessage.set("Email y contrase\xF1a son requeridos"),this.isLoading.set(!1);return}try{await this.authService.signIn(i,n),await this.router.navigate(["/dashboard"])}catch(o){this.handleAuthError(o)}finally{this.isLoading.set(!1)}}handleAuthError(i){if(i instanceof ye)switch(i.code){case"auth/user-not-found":case"auth/wrong-password":case"auth/invalid-credential":this.errorMessage.set("Email o contrase\xF1a incorrectos. Por favor, verifica tus credenciales.");break;case"auth/user-disabled":this.errorMessage.set("Esta cuenta ha sido deshabilitada. Contacta al administrador.");break;case"auth/too-many-requests":this.errorMessage.set("Demasiados intentos fallidos. Por favor, intenta m\xE1s tarde.");break;case"auth/network-request-failed":this.errorMessage.set("Error de conexi\xF3n. Verifica tu conexi\xF3n a internet.");break;case"auth/invalid-email":this.errorMessage.set("El formato del email no es v\xE1lido.");break;default:this.errorMessage.set("Error al iniciar sesi\xF3n. Por favor, intenta de nuevo."),console.error("Auth error:",i)}else this.errorMessage.set("Error inesperado. Por favor, intenta de nuevo."),console.error("Unexpected error:",i)}hasFieldError(i){let n=this.loginForm.get(i);return!!(n?.invalid&&n?.touched)}getFieldError(i){let n=this.loginForm.get(i);return!n||!n.errors||!n.touched?"":n.errors.required?"Este campo es obligatorio":n.errors.email?"Ingresa un email v\xE1lido":n.errors.minlength?"La contrase\xF1a debe tener al menos 6 caracteres":""}static \u0275fac=function(n){return new(n||e)};static \u0275cmp=y({type:e,selectors:[["app-login"]],decls:18,vars:10,consts:[[1,"login-container"],[1,"login-card-wrapper"],["pTemplate","header"],["severity","error",3,"text"],[1,"login-form",3,"ngSubmit","formGroup"],[1,"field"],["for","email",1,"field-label"],["pInputText","","id","email","formControlName","email","type","email","placeholder","usuario@ejemplo.com","fluid","","autocomplete","email",3,"invalid"],[1,"field-error"],["for","password",1,"field-label"],["formControlName","password","inputId","password","placeholder","Ingresa tu contrase\xF1a","fluid","","autocomplete","current-password",3,"toggleMask","feedback","invalid"],["type","submit","label","Iniciar Sesi\xF3n","icon","pi pi-sign-in","severity","primary","fluid","",3,"loading","disabled"],["pTemplate","footer"],[1,"card-header"],[1,"app-title"],[1,"app-subtitle"],[1,"card-footer"],[1,"footer-note"],[1,"pi","pi-info-circle"]],template:function(n,o){n&1&&(l(0,"div",0)(1,"div",1)(2,"p-card"),_(3,Dn,5,0,"ng-template",2),h(4,Nn,1,1,"p-message",3),l(5,"form",4),H("ngSubmit",function(){return o.onSubmit()}),l(6,"div",5)(7,"label",6),x(8,"Email"),p(),f(9,"input",7),h(10,On,2,1,"small",8),p(),l(11,"div",5)(12,"label",9),x(13,"Contrase\xF1a"),p(),f(14,"p-password",10),h(15,zn,2,1,"small",8),p(),f(16,"p-button",11),p(),_(17,An,4,0,"ng-template",12),p()()()),n&2&&(r(4),v(o.errorMessage()?4:-1),r(),s("formGroup",o.loginForm),r(4),s("invalid",o.hasFieldError("email")),r(),v(o.hasFieldError("email")?10:-1),r(4),s("toggleMask",!0)("feedback",!1)("invalid",o.hasFieldError("password")),r(),v(o.hasFieldError("password")?15:-1),r(),s("loading",o.isLoading())("disabled",o.loginForm.invalid||o.isLoading()))},dependencies:[Fe,Ee,Ie,ke,Te,Pe,Se,Ae,ze,U,Oe,Ne,Le,je,Me,we,He,X,Qe,Xe,en],styles:[".login-container[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#f5f7fa,#e4e8ec);padding:1rem}.login-card-wrapper[_ngcontent-%COMP%]{width:100%;max-width:420px}.card-header[_ngcontent-%COMP%]{text-align:center;padding:2.5rem 2rem 1.5rem;background:#fff;border-bottom:1px solid #f0f0f0}.app-title[_ngcontent-%COMP%]{margin:0;font-size:1.625rem;font-weight:700;letter-spacing:-.5px;color:#1a1a1a}.app-subtitle[_ngcontent-%COMP%]{margin:.625rem 0 0;font-size:.9rem;color:#6b7280;font-weight:400}.login-form[_ngcontent-%COMP%]{padding:2rem}.field[_ngcontent-%COMP%]{margin-bottom:1.25rem}.field[_ngcontent-%COMP%]:last-of-type{margin-bottom:1.75rem}.field-label[_ngcontent-%COMP%]{display:block;margin-bottom:.5rem;font-weight:500;color:#374151;font-size:.875rem}.field-error[_ngcontent-%COMP%]{display:block;margin-top:.375rem;color:#374151;font-size:.8125rem}.card-footer[_ngcontent-%COMP%]{padding:1.25rem 2rem;background-color:#fafafa;text-align:center;border-top:1px solid #f0f0f0}.footer-note[_ngcontent-%COMP%]{margin:0;font-size:.8125rem;color:#6b7280;display:flex;align-items:center;justify-content:center;gap:.5rem}.footer-note[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{font-size:.9375rem;color:#9ca3af}@media(max-width:768px){.login-card-wrapper[_ngcontent-%COMP%]{max-width:100%}.card-header[_ngcontent-%COMP%]{padding:2rem 1.5rem 1.25rem}.app-title[_ngcontent-%COMP%]{font-size:1.5rem}.login-form[_ngcontent-%COMP%]{padding:1.5rem}}"],changeDetection:0})};export{Y as default};
