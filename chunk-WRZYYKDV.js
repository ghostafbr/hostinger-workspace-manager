import{a as me}from"./chunk-IQCNXFAT.js";import{b as ge}from"./chunk-22ZNFGKD.js";import{Ba as K,Fb as be,Hb as ye,M as O,N as Y,O as k,Xa as w,Ya as I,c as ue,cb as s,db as v,e as fe,h as m,kb as ve,na as he,rb as V,ya as j}from"./chunk-MQX4I6TC.js";import{Ab as te,Cb as q,Db as Q,Gb as oe,Jb as G,Kb as g,Lb as x,Mb as D,N,Nb as ie,O as F,Oa as p,P as $,Pb as re,Qb as ae,R as A,T as r,Vb as de,Xb as ce,Yb as l,Zb as se,_ as z,_b as le,a as T,ab as h,bb as U,da as L,eb as C,ec as M,fb as _,gb as P,gc as pe,ia as X,mb as u,oa as f,pb as Z,qb as ee,tc as c,vb as d,wb as B,wc as E,xb as S,yb as H,zb as ne,zc as W}from"./chunk-ZVXIGZDY.js";var Ae=class n{expiresAt=E.required();daysUntilExpiration=c(()=>{let i=this.toDate(this.expiresAt());if(!i)return null;let e=new Date,o=i.getTime()-e.getTime();return Math.ceil(o/(1e3*60*60*24))});statusClass=c(()=>{let i=this.daysUntilExpiration();return i===null?"ok":i<0?"expired":i<=7?"critical":i<=30?"warning":"ok"});daysText=c(()=>{let i=this.daysUntilExpiration();return i===null?"?":i<0?"\u26A0":i===0?"HOY":i===1?"1d":i<100?`${i}d`:"99+"});tooltip=c(()=>{let i=this.daysUntilExpiration();return i===null?"Fecha desconocida":i<0?`Venci\xF3 hace ${Math.abs(i)} d\xEDa(s)`:i===0?"\xA1Vence hoy!":i===1?"Vence ma\xF1ana":`Vence en ${i} d\xEDa(s)`});toDate(i){return i?i instanceof Date?i:typeof i=="string"?new Date(i):typeof i=="object"&&"toDate"in i?i.toDate():typeof i=="object"&&"seconds"in i?new Date(i.seconds*1e3):null:null}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=h({type:n,selectors:[["app-expiration-semaphore"]],inputs:{expiresAt:[1,"expiresAt"]},decls:4,vars:4,consts:[[1,"semaphore"],[1,"semaphore-circle",3,"title"],[1,"semaphore-text"]],template:function(e,o){e&1&&(ne(0,"div",0)(1,"div",1)(2,"span",2),se(3),te()()()),e&2&&(l(o.statusClass()),p(),oe("title",o.tooltip()),p(2),le(o.daysText()))},dependencies:[m],styles:[".semaphore[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center}.semaphore-circle[_ngcontent-%COMP%]{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:.75rem;cursor:help;transition:transform .2s ease}.semaphore-circle[_ngcontent-%COMP%]:hover{transform:scale(1.1)}.semaphore-text[_ngcontent-%COMP%]{color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.3)}.critical[_ngcontent-%COMP%]   .semaphore-circle[_ngcontent-%COMP%]{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 2px 8px #ef444466}.warning[_ngcontent-%COMP%]   .semaphore-circle[_ngcontent-%COMP%]{background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 2px 8px #f59e0b66}.ok[_ngcontent-%COMP%]   .semaphore-circle[_ngcontent-%COMP%]{background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 2px 8px #10b98166}.expired[_ngcontent-%COMP%]   .semaphore-circle[_ngcontent-%COMP%]{background:linear-gradient(135deg,#7f1d1d,#991b1b);box-shadow:0 2px 8px #7f1d1d66;animation:_ngcontent-%COMP%_pulse 2s infinite}@keyframes _ngcontent-%COMP%_pulse{0%,to{opacity:1}50%{opacity:.7}}"],changeDetection:0})};var _e=`
    .p-divider-horizontal {
        display: flex;
        width: 100%;
        position: relative;
        align-items: center;
        margin: dt('divider.horizontal.margin');
        padding: dt('divider.horizontal.padding');
    }

    .p-divider-horizontal:before {
        position: absolute;
        display: block;
        inset-block-start: 50%;
        inset-inline-start: 0;
        width: 100%;
        content: '';
        border-block-start: 1px solid dt('divider.border.color');
    }

    .p-divider-horizontal .p-divider-content {
        padding: dt('divider.horizontal.content.padding');
    }

    .p-divider-vertical {
        min-height: 100%;
        display: flex;
        position: relative;
        justify-content: center;
        margin: dt('divider.vertical.margin');
        padding: dt('divider.vertical.padding');
    }

    .p-divider-vertical:before {
        position: absolute;
        display: block;
        inset-block-start: 0;
        inset-inline-start: 50%;
        height: 100%;
        content: '';
        border-inline-start: 1px solid dt('divider.border.color');
    }

    .p-divider.p-divider-vertical .p-divider-content {
        padding: dt('divider.vertical.content.padding');
    }

    .p-divider-content {
        z-index: 1;
        background: dt('divider.content.background');
        color: dt('divider.content.color');
    }

    .p-divider-solid.p-divider-horizontal:before {
        border-block-start-style: solid;
    }

    .p-divider-solid.p-divider-vertical:before {
        border-inline-start-style: solid;
    }

    .p-divider-dashed.p-divider-horizontal:before {
        border-block-start-style: dashed;
    }

    .p-divider-dashed.p-divider-vertical:before {
        border-inline-start-style: dashed;
    }

    .p-divider-dotted.p-divider-horizontal:before {
        border-block-start-style: dotted;
    }

    .p-divider-dotted.p-divider-vertical:before {
        border-inline-start-style: dotted;
    }

    .p-divider-left:dir(rtl),
    .p-divider-right:dir(rtl) {
        flex-direction: row-reverse;
    }
`;var Te=["*"],He={root:({instance:n})=>({justifyContent:n.layout==="horizontal"?n.align==="center"||n.align==null?"center":n.align==="left"?"flex-start":n.align==="right"?"flex-end":null:null,alignItems:n.layout==="vertical"?n.align==="center"||n.align==null?"center":n.align==="top"?"flex-start":n.align==="bottom"?"flex-end":null:null})},ke={root:({instance:n})=>["p-divider p-component","p-divider-"+n.layout,"p-divider-"+n.type,{"p-divider-left":n.layout==="horizontal"&&(!n.align||n.align==="left")},{"p-divider-center":n.layout==="horizontal"&&n.align==="center"},{"p-divider-right":n.layout==="horizontal"&&n.align==="right"},{"p-divider-top":n.layout==="vertical"&&n.align==="top"},{"p-divider-center":n.layout==="vertical"&&(!n.align||n.align==="center")},{"p-divider-bottom":n.layout==="vertical"&&n.align==="bottom"}],content:"p-divider-content"},xe=(()=>{class n extends K{name="divider";style=_e;classes=ke;inlineStyles=He;static \u0275fac=(()=>{let e;return function(t){return(e||(e=f(n)))(t||n)}})();static \u0275prov=F({token:n,factory:n.\u0275fac})}return n})();var De=new A("DIVIDER_INSTANCE"),Fe=(()=>{class n extends I{$pcDivider=r(De,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=r(s,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}styleClass;layout="horizontal";type="solid";align;_componentStyle=r(xe);get dataP(){return this.cn({[this.align]:this.align,[this.layout]:this.layout,[this.type]:this.type})}static \u0275fac=(()=>{let e;return function(t){return(e||(e=f(n)))(t||n)}})();static \u0275cmp=h({type:n,selectors:[["p-divider"]],hostAttrs:["role","separator"],hostVars:6,hostBindings:function(o,t){o&2&&(u("aria-orientation",t.layout)("data-p",t.dataP),ce(t.sx("root")),l(t.cn(t.cx("root"),t.styleClass)))},inputs:{styleClass:"styleClass",layout:"layout",type:"type",align:"align"},features:[M([xe,{provide:De,useExisting:n},{provide:w,useExisting:n}]),C([s]),_],ngContentSelectors:Te,decls:2,vars:3,consts:[[3,"pBind"]],template:function(o,t){o&1&&(x(),B(0,"div",0),D(1),S()),o&2&&(l(t.cx("content")),d("pBind",t.ptm("content")))},dependencies:[m,j,v,s],encapsulation:2,changeDetection:0})}return n})(),vn=(()=>{class n{static \u0275fac=function(o){return new(o||n)};static \u0275mod=U({type:n});static \u0275inj=$({imports:[Fe,v,v]})}return n})();var Me=`
    .p-accordionpanel {
        display: flex;
        flex-direction: column;
        border-style: solid;
        border-width: dt('accordion.panel.border.width');
        border-color: dt('accordion.panel.border.color');
    }

    .p-accordionheader {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: dt('accordion.header.padding');
        color: dt('accordion.header.color');
        background: dt('accordion.header.background');
        border-style: solid;
        border-width: dt('accordion.header.border.width');
        border-color: dt('accordion.header.border.color');
        font-weight: dt('accordion.header.font.weight');
        border-radius: dt('accordion.header.border.radius');
        transition:
            background dt('accordion.transition.duration'),
            color dt('accordion.transition.duration'),
            outline-color dt('accordion.transition.duration'),
            box-shadow dt('accordion.transition.duration');
        outline-color: transparent;
    }

    .p-accordionpanel:first-child > .p-accordionheader {
        border-width: dt('accordion.header.first.border.width');
        border-start-start-radius: dt('accordion.header.first.top.border.radius');
        border-start-end-radius: dt('accordion.header.first.top.border.radius');
    }

    .p-accordionpanel:last-child > .p-accordionheader {
        border-end-start-radius: dt('accordion.header.last.bottom.border.radius');
        border-end-end-radius: dt('accordion.header.last.bottom.border.radius');
    }

    .p-accordionpanel:last-child.p-accordionpanel-active > .p-accordionheader {
        border-end-start-radius: dt('accordion.header.last.active.bottom.border.radius');
        border-end-end-radius: dt('accordion.header.last.active.bottom.border.radius');
    }

    .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.color');
    }

    .p-accordionpanel:not(.p-disabled) .p-accordionheader:focus-visible {
        box-shadow: dt('accordion.header.focus.ring.shadow');
        outline: dt('accordion.header.focus.ring.width') dt('accordion.header.focus.ring.style') dt('accordion.header.focus.ring.color');
        outline-offset: dt('accordion.header.focus.ring.offset');
    }

    .p-accordionpanel:not(.p-accordionpanel-active):not(.p-disabled) > .p-accordionheader:hover {
        background: dt('accordion.header.hover.background');
        color: dt('accordion.header.hover.color');
    }

    .p-accordionpanel:not(.p-accordionpanel-active):not(.p-disabled) .p-accordionheader:hover .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.hover.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader {
        background: dt('accordion.header.active.background');
        color: dt('accordion.header.active.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.active.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader:hover {
        background: dt('accordion.header.active.hover.background');
        color: dt('accordion.header.active.hover.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader:hover .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.active.hover.color');
    }

    .p-accordioncontent {
        display: grid;
        grid-template-rows: 1fr;
    }

    .p-accordioncontent-wrapper {
        min-height: 0;
    }

    .p-accordioncontent-content {
        border-style: solid;
        border-width: dt('accordion.content.border.width');
        border-color: dt('accordion.content.border.color');
        background-color: dt('accordion.content.background');
        color: dt('accordion.content.color');
        padding: dt('accordion.content.padding');
    }
`;var R=["*"],Be=["toggleicon"],Se=n=>({active:n});function je(n,i){}function Ke(n,i){n&1&&P(0,je,0,0,"ng-template")}function Ve(n,i){if(n&1&&P(0,Ke,1,0,null,0),n&2){let e=g();d("ngTemplateOutlet",e.toggleicon)("ngTemplateOutletContext",pe(2,Se,e.active()))}}function Re(n,i){if(n&1&&H(0,"span",4),n&2){let e=g(3);l(e.cn(e.cx("toggleicon"),e.pcAccordion.collapseIcon)),d("pBind",e.ptm("toggleicon")),u("aria-hidden",!0)}}function $e(n,i){if(n&1&&(z(),H(0,"svg",5)),n&2){let e=g(3);l(e.cx("toggleicon")),d("pBind",e.ptm("toggleicon")),u("aria-hidden",!0)}}function ze(n,i){if(n&1&&(q(0),P(1,Re,1,4,"span",2)(2,$e,1,4,"svg",3),Q()),n&2){let e=g(2);p(),d("ngIf",e.pcAccordion.collapseIcon),p(),d("ngIf",!e.pcAccordion.collapseIcon)}}function Le(n,i){if(n&1&&H(0,"span",4),n&2){let e=g(3);l(e.cn(e.cx("toggleicon"),e.pcAccordion.expandIcon)),d("pBind",e.ptm("toggleicon")),u("aria-hidden",!0)}}function Ue(n,i){if(n&1&&(z(),H(0,"svg",7)),n&2){let e=g(3);d("pBind",e.ptm("toggleicon")),u("aria-hidden",!0)}}function qe(n,i){if(n&1&&(q(0),P(1,Le,1,4,"span",2)(2,Ue,1,2,"svg",6),Q()),n&2){let e=g(2);p(),d("ngIf",e.pcAccordion.expandIcon),p(),d("ngIf",!e.pcAccordion.expandIcon)}}function Qe(n,i){if(n&1&&P(0,ze,3,2,"ng-container",1)(1,qe,3,2,"ng-container",1),n&2){let e=g();d("ngIf",e.active()),p(),d("ngIf",!e.active())}}var Ge=`
${Me}

/* For PrimeNG */
.p-accordionheader-toggle-icon.icon-start {
    order: -1;
}

.p-accordionheader:has(.p-accordionheader-toggle-icon.icon-start) {
    justify-content: flex-start;
    gap: dt('accordion.header.padding');
}

.p-accordionheader.p-ripple {
    overflow: hidden;
    position: relative;
}

.p-accordioncontent .p-motion {
    display: grid;
    grid-template-rows: 1fr;
}
`,We={root:"p-accordion p-component",panel:({instance:n})=>["p-accordionpanel",{"p-accordionpanel-active":n.active(),"p-disabled":n.disabled()}],header:"p-accordionheader",toggleicon:"p-accordionheader-toggle-icon",contentContainer:"p-accordioncontent",contentWrapper:"p-accordioncontent-wrapper",content:"p-accordioncontent-content"},y=(()=>{class n extends K{name="accordion";style=Ge;classes=We;static \u0275fac=(()=>{let e;return function(t){return(e||(e=f(n)))(t||n)}})();static \u0275prov=F({token:n,factory:n.\u0275fac})}return n})();var Ee=new A("ACCORDION_PANEL_INSTANCE"),we=new A("ACCORDION_HEADER_INSTANCE"),Ie=new A("ACCORDION_CONTENT_INSTANCE"),Ne=new A("ACCORDION_INSTANCE"),Pe=(()=>{class n extends I{$pcAccordionPanel=r(Ee,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=r(s,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}pcAccordion=r(N(()=>J));value=W(void 0);disabled=E(!1,{transform:e=>V(e)});active=c(()=>this.pcAccordion.multiple()?this.valueEquals(this.pcAccordion.value(),this.value()):this.pcAccordion.value()===this.value());valueEquals(e,o){return Array.isArray(e)?e.includes(o):e===o}_componentStyle=r(y);static \u0275fac=(()=>{let e;return function(t){return(e||(e=f(n)))(t||n)}})();static \u0275cmp=h({type:n,selectors:[["p-accordion-panel"],["p-accordionpanel"]],hostVars:4,hostBindings:function(o,t){o&2&&(u("data-p-disabled",t.disabled())("data-p-active",t.active()),l(t.cx("panel")))},inputs:{value:[1,"value"],disabled:[1,"disabled"]},outputs:{value:"valueChange"},features:[M([y,{provide:Ee,useExisting:n},{provide:w,useExisting:n}]),C([s]),_],ngContentSelectors:R,decls:1,vars:0,template:function(o,t){o&1&&(x(),D(0))},dependencies:[m,v],encapsulation:2,changeDetection:0})}return n})(),zn=(()=>{class n extends I{$pcAccordionHeader=r(we,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=r(s,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}pcAccordion=r(N(()=>J));pcAccordionPanel=r(N(()=>Pe));id=c(()=>`${this.pcAccordion.id()}_accordionheader_${this.pcAccordionPanel.value()}`);active=c(()=>this.pcAccordionPanel.active());disabled=c(()=>this.pcAccordionPanel.disabled());ariaControls=c(()=>`${this.pcAccordion.id()}_accordioncontent_${this.pcAccordionPanel.value()}`);toggleicon;onClick(e){if(this.disabled())return;let o=this.active();this.changeActiveValue();let t=this.active(),a=this.pcAccordionPanel.value();!o&&t?this.pcAccordion.onOpen.emit({originalEvent:e,index:a}):o&&!t&&this.pcAccordion.onClose.emit({originalEvent:e,index:a})}onFocus(){!this.disabled()&&this.pcAccordion.selectOnFocus()&&this.changeActiveValue()}onKeydown(e){switch(e.code){case"ArrowDown":this.arrowDownKey(e);break;case"ArrowUp":this.arrowUpKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"Enter":case"Space":case"NumpadEnter":this.onEnterKey(e);break;default:break}}_componentStyle=r(y);changeActiveValue(){this.pcAccordion.updateValue(this.pcAccordionPanel.value())}findPanel(e){return e?.closest('[data-pc-name="accordionpanel"]')}findHeader(e){return O(e,'[data-pc-name="accordionheader"]')}findNextPanel(e,o=!1){let t=o?e:e.nextElementSibling;return t?k(t,"data-p-disabled")?this.findNextPanel(t):this.findHeader(t):null}findPrevPanel(e,o=!1){let t=o?e:e.previousElementSibling;return t?k(t,"data-p-disabled")?this.findPrevPanel(t):this.findHeader(t):null}findFirstPanel(){return this.findNextPanel(this.pcAccordion.el.nativeElement.firstElementChild,!0)}findLastPanel(){return this.findPrevPanel(this.pcAccordion.el.nativeElement.lastElementChild,!0)}changeFocusedPanel(e,o){Y(o)}arrowDownKey(e){let o=this.findNextPanel(this.findPanel(e.currentTarget));o?this.changeFocusedPanel(e,o):this.onHomeKey(e),e.preventDefault()}arrowUpKey(e){let o=this.findPrevPanel(this.findPanel(e.currentTarget));o?this.changeFocusedPanel(e,o):this.onEndKey(e),e.preventDefault()}onHomeKey(e){let o=this.findFirstPanel();this.changeFocusedPanel(e,o),e.preventDefault()}onEndKey(e){let o=this.findLastPanel();this.changeFocusedPanel(e,o),e.preventDefault()}onEnterKey(e){this.disabled()||this.changeActiveValue(),e.preventDefault()}get dataP(){return this.cn({active:this.active()})}static \u0275fac=(()=>{let e;return function(t){return(e||(e=f(n)))(t||n)}})();static \u0275cmp=h({type:n,selectors:[["p-accordion-header"],["p-accordionheader"]],contentQueries:function(o,t,a){if(o&1&&ie(a,Be,5),o&2){let b;re(b=ae())&&(t.toggleicon=b.first)}},hostVars:13,hostBindings:function(o,t){o&1&&G("click",function(b){return t.onClick(b)})("focus",function(){return t.onFocus()})("keydown",function(b){return t.onKeydown(b)}),o&2&&(u("id",t.id())("aria-expanded",t.active())("aria-controls",t.ariaControls())("aria-disabled",t.disabled())("role","button")("tabindex",t.disabled()?"-1":"0")("data-p-active",t.active())("data-p-disabled",t.disabled())("data-p",t.dataP),l(t.cx("header")),de("user-select","none"))},features:[M([y,{provide:we,useExisting:n},{provide:w,useExisting:n}]),C([ve,s]),_],ngContentSelectors:R,decls:3,vars:1,consts:[[4,"ngTemplateOutlet","ngTemplateOutletContext"],[4,"ngIf"],[3,"class","pBind",4,"ngIf"],["data-p-icon","chevron-up",3,"class","pBind",4,"ngIf"],[3,"pBind"],["data-p-icon","chevron-up",3,"pBind"],["data-p-icon","chevron-down",3,"pBind",4,"ngIf"],["data-p-icon","chevron-down",3,"pBind"]],template:function(o,t){o&1&&(x(),D(0),Z(1,Ve,1,4)(2,Qe,2,2)),o&2&&(p(),ee(t.toggleicon?1:2))},dependencies:[m,ue,fe,ge,me,v,s],encapsulation:2,changeDetection:0})}return n})(),Ln=(()=>{class n extends I{$pcAccordionContent=r(Ie,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=r(s,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}pcAccordion=r(N(()=>J));pcAccordionPanel=r(N(()=>Pe));active=c(()=>this.pcAccordionPanel.active());ariaLabelledby=c(()=>`${this.pcAccordion.id()}_accordionheader_${this.pcAccordionPanel.value()}`);id=c(()=>`${this.pcAccordion.id()}_accordioncontent_${this.pcAccordionPanel.value()}`);_componentStyle=r(y);ptParams=c(()=>({context:this.active()}));computedMotionOptions=c(()=>T(T({},this.ptm("motion",this.ptParams())),this.pcAccordion.computedMotionOptions()));static \u0275fac=(()=>{let e;return function(t){return(e||(e=f(n)))(t||n)}})();static \u0275cmp=h({type:n,selectors:[["p-accordion-content"],["p-accordioncontent"]],hostVars:6,hostBindings:function(o,t){o&2&&(u("id",t.id())("role","region")("data-p-active",t.active())("aria-labelledby",t.ariaLabelledby()),l(t.cx("contentContainer")))},features:[M([y,{provide:Ie,useExisting:n},{provide:w,useExisting:n}]),C([s]),_],ngContentSelectors:R,decls:4,vars:10,consts:[["name","p-collapsible","hideStrategy","visibility",3,"visible","mountOnEnter","unmountOnLeave","options"],[3,"pBind"]],template:function(o,t){o&1&&(x(),B(0,"p-motion",0)(1,"div",1)(2,"div",1),D(3),S()()()),o&2&&(d("visible",t.active())("mountOnEnter",!1)("unmountOnLeave",!1)("options",t.computedMotionOptions()),p(),l(t.cx("contentWrapper")),d("pBind",t.ptm("contentWrapper",t.ptParams())),p(),l(t.cx("content")),d("pBind",t.ptm("content",t.ptParams())))},dependencies:[m,v,s,ye,be],encapsulation:2,changeDetection:0})}return n})(),J=(()=>{class n extends I{$pcAccordion=r(Ne,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=r(s,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}value=W(void 0);multiple=E(!1,{transform:e=>V(e)});styleClass;expandIcon;collapseIcon;selectOnFocus=E(!1,{transform:e=>V(e)});transitionOptions="400ms cubic-bezier(0.86, 0, 0.07, 1)";motionOptions=E(void 0);computedMotionOptions=c(()=>T(T({},this.ptm("motion")),this.motionOptions()));onClose=new L;onOpen=new L;id=X(he("pn_id_"));_componentStyle=r(y);onKeydown(e){switch(e.code){case"ArrowDown":this.onTabArrowDownKey(e);break;case"ArrowUp":this.onTabArrowUpKey(e);break;case"Home":e.shiftKey||this.onTabHomeKey(e);break;case"End":e.shiftKey||this.onTabEndKey(e);break}}onTabArrowDownKey(e){let o=this.findNextHeaderAction(e.target.parentElement);o?this.changeFocusedTab(o):this.onTabHomeKey(e),e.preventDefault()}onTabArrowUpKey(e){let o=this.findPrevHeaderAction(e.target.parentElement);o?this.changeFocusedTab(o):this.onTabEndKey(e),e.preventDefault()}onTabHomeKey(e){let o=this.findFirstHeaderAction();this.changeFocusedTab(o),e.preventDefault()}changeFocusedTab(e){e&&Y(e)}findNextHeaderAction(e,o=!1){let t=o?e:e.nextElementSibling,a=O(t,'[data-pc-section="accordionheader"]');return a?k(a,"data-p-disabled")?this.findNextHeaderAction(a.parentElement):O(a.parentElement,'[data-pc-section="accordionheader"]'):null}findPrevHeaderAction(e,o=!1){let t=o?e:e.previousElementSibling,a=O(t,'[data-pc-section="accordionheader"]');return a?k(a,"data-p-disabled")?this.findPrevHeaderAction(a.parentElement):O(a.parentElement,'[data-pc-section="accordionheader"]'):null}findFirstHeaderAction(){let e=this.el.nativeElement.firstElementChild;return this.findNextHeaderAction(e,!0)}findLastHeaderAction(){let e=this.el.nativeElement.lastElementChild;return this.findPrevHeaderAction(e,!0)}onTabEndKey(e){let o=this.findLastHeaderAction();this.changeFocusedTab(o),e.preventDefault()}getBlockableElement(){return this.el.nativeElement.children[0]}updateValue(e){let o=this.value();if(this.multiple()){let t=Array.isArray(o)?[...o]:[],a=t.indexOf(e);a!==-1?t.splice(a,1):t.push(e),this.value.set(t)}else o===e?this.value.set(void 0):this.value.set(e)}static \u0275fac=(()=>{let e;return function(t){return(e||(e=f(n)))(t||n)}})();static \u0275cmp=h({type:n,selectors:[["p-accordion"]],hostVars:2,hostBindings:function(o,t){o&1&&G("keydown",function(b){return t.onKeydown(b)}),o&2&&l(t.cn(t.cx("root"),t.styleClass))},inputs:{value:[1,"value"],multiple:[1,"multiple"],styleClass:"styleClass",expandIcon:"expandIcon",collapseIcon:"collapseIcon",selectOnFocus:[1,"selectOnFocus"],transitionOptions:"transitionOptions",motionOptions:[1,"motionOptions"]},outputs:{value:"valueChange",onClose:"onClose",onOpen:"onOpen"},features:[M([y,{provide:Ne,useExisting:n},{provide:w,useExisting:n}]),C([s]),_],ngContentSelectors:R,decls:1,vars:0,template:function(o,t){o&1&&(x(),D(0))},dependencies:[m,j,v],encapsulation:2,changeDetection:0})}return n})();export{Ae as a,Fe as b,vn as c,Pe as d,zn as e,Ln as f,J as g};
