import{a as fe}from"./chunk-WLWLX2GD.js";import{b as ue}from"./chunk-OUNNJ5C5.js";import{$a as H,Ca as le,Fa as pe,Ob as ge,Q as C,Qb as me,R as L,S as I,ab as T,c as ce,e as de,gb as p,hb as F,j as b,ob as he,ra as se,vb as k}from"./chunk-IQOQF2BO.js";import{$ as S,$b as ie,Ab as J,Bb as X,Bc as v,Db as V,Eb as j,Ec as R,Hb as Z,Lb as $,Mb as u,Nb as P,O as y,Ob as N,P as q,Pa as s,Pb as ee,Rb as ne,S as D,Sb as te,U as r,Xb as oe,_b as l,a as x,ac as ae,bb as m,ea as K,fb as w,gb as E,hb as A,hc as O,ja as Q,jc as re,nb as h,pa as _,qb as G,rb as W,wb as d,xb as z,yb as Y,yc as c,zb as M}from"./chunk-GUMEVBBA.js";var ve=class t{expiresAt=v.required();daysUntilExpiration=c(()=>{let i=this.toDate(this.expiresAt());if(!i)return null;let e=new Date,o=i.getTime()-e.getTime();return Math.ceil(o/(1e3*60*60*24))});statusClass=c(()=>{let i=this.daysUntilExpiration();return i===null?"ok":i<0?"expired":i<=7?"critical":i<=30?"warning":"ok"});daysText=c(()=>{let i=this.daysUntilExpiration();return i===null?"?":i<0?"\u26A0":i===0?"HOY":i===1?"1d":i<100?`${i}d`:"99+"});tooltip=c(()=>{let i=this.daysUntilExpiration();return i===null?"Fecha desconocida":i<0?`Venci\xF3 hace ${Math.abs(i)} d\xEDa(s)`:i===0?"\xA1Vence hoy!":i===1?"Vence ma\xF1ana":`Vence en ${i} d\xEDa(s)`});toDate(i){return i?i instanceof Date?i:typeof i=="string"?new Date(i):typeof i=="object"&&"toDate"in i?i.toDate():typeof i=="object"&&"seconds"in i?new Date(i.seconds*1e3):null:null}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=m({type:t,selectors:[["app-expiration-semaphore"]],inputs:{expiresAt:[1,"expiresAt"]},decls:4,vars:4,consts:[[1,"semaphore"],[1,"semaphore-circle",3,"title"],[1,"semaphore-text"]],template:function(e,o){e&1&&(J(0,"div",0)(1,"div",1)(2,"span",2),ie(3),X()()()),e&2&&(l(o.statusClass()),s(),Z("title",o.tooltip()),s(2),ae(o.daysText()))},dependencies:[b],styles:[".semaphore[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center}.semaphore-circle[_ngcontent-%COMP%]{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:.75rem;cursor:help;transition:transform .2s ease}.semaphore-circle[_ngcontent-%COMP%]:hover{transform:scale(1.1)}.semaphore-text[_ngcontent-%COMP%]{color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.3)}.critical[_ngcontent-%COMP%]   .semaphore-circle[_ngcontent-%COMP%]{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 2px 8px #ef444466}.warning[_ngcontent-%COMP%]   .semaphore-circle[_ngcontent-%COMP%]{background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 2px 8px #f59e0b66}.ok[_ngcontent-%COMP%]   .semaphore-circle[_ngcontent-%COMP%]{background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 2px 8px #10b98166}.expired[_ngcontent-%COMP%]   .semaphore-circle[_ngcontent-%COMP%]{background:linear-gradient(135deg,#7f1d1d,#991b1b);box-shadow:0 2px 8px #7f1d1d66;animation:_ngcontent-%COMP%_pulse 2s infinite}@keyframes _ngcontent-%COMP%_pulse{0%,to{opacity:1}50%{opacity:.7}}"],changeDetection:0})};var be=`
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
`;var B=["*"],we=["toggleicon"],Ee=t=>({active:t});function Me(t,i){}function Pe(t,i){t&1&&A(0,Me,0,0,"ng-template")}function Ne(t,i){if(t&1&&A(0,Pe,1,0,null,0),t&2){let e=u();d("ngTemplateOutlet",e.toggleicon)("ngTemplateOutletContext",re(2,Ee,e.active()))}}function Oe(t,i){if(t&1&&M(0,"span",4),t&2){let e=u(3);l(e.cn(e.cx("toggleicon"),e.pcAccordion.collapseIcon)),d("pBind",e.ptm("toggleicon")),h("aria-hidden",!0)}}function Ie(t,i){if(t&1&&(S(),M(0,"svg",5)),t&2){let e=u(3);l(e.cx("toggleicon")),d("pBind",e.ptm("toggleicon")),h("aria-hidden",!0)}}function He(t,i){if(t&1&&(V(0),A(1,Oe,1,4,"span",2)(2,Ie,1,4,"svg",3),j()),t&2){let e=u(2);s(),d("ngIf",e.pcAccordion.collapseIcon),s(),d("ngIf",!e.pcAccordion.collapseIcon)}}function Te(t,i){if(t&1&&M(0,"span",4),t&2){let e=u(3);l(e.cn(e.cx("toggleicon"),e.pcAccordion.expandIcon)),d("pBind",e.ptm("toggleicon")),h("aria-hidden",!0)}}function Fe(t,i){if(t&1&&(S(),M(0,"svg",7)),t&2){let e=u(3);d("pBind",e.ptm("toggleicon")),h("aria-hidden",!0)}}function ke(t,i){if(t&1&&(V(0),A(1,Te,1,4,"span",2)(2,Fe,1,2,"svg",6),j()),t&2){let e=u(2);s(),d("ngIf",e.pcAccordion.expandIcon),s(),d("ngIf",!e.pcAccordion.expandIcon)}}function Be(t,i){if(t&1&&A(0,He,3,2,"ng-container",1)(1,ke,3,2,"ng-container",1),t&2){let e=u();d("ngIf",e.active()),s(),d("ngIf",!e.active())}}var Se=`
${be}

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
`,Ke={root:"p-accordion p-component",panel:({instance:t})=>["p-accordionpanel",{"p-accordionpanel-active":t.active(),"p-disabled":t.disabled()}],header:"p-accordionheader",toggleicon:"p-accordionheader-toggle-icon",contentContainer:"p-accordioncontent",contentWrapper:"p-accordioncontent-wrapper",content:"p-accordioncontent-content"},g=(()=>{class t extends pe{name="accordion";style=Se;classes=Ke;static \u0275fac=(()=>{let e;return function(n){return(e||(e=_(t)))(n||t)}})();static \u0275prov=q({token:t,factory:t.\u0275fac})}return t})();var ye=new D("ACCORDION_PANEL_INSTANCE"),_e=new D("ACCORDION_HEADER_INSTANCE"),Ae=new D("ACCORDION_CONTENT_INSTANCE"),Ce=new D("ACCORDION_INSTANCE"),xe=(()=>{class t extends T{$pcAccordionPanel=r(ye,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=r(p,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}pcAccordion=r(y(()=>U));value=R(void 0);disabled=v(!1,{transform:e=>k(e)});active=c(()=>this.pcAccordion.multiple()?this.valueEquals(this.pcAccordion.value(),this.value()):this.pcAccordion.value()===this.value());valueEquals(e,o){return Array.isArray(e)?e.includes(o):e===o}_componentStyle=r(g);static \u0275fac=(()=>{let e;return function(n){return(e||(e=_(t)))(n||t)}})();static \u0275cmp=m({type:t,selectors:[["p-accordion-panel"],["p-accordionpanel"]],hostVars:4,hostBindings:function(o,n){o&2&&(h("data-p-disabled",n.disabled())("data-p-active",n.active()),l(n.cx("panel")))},inputs:{value:[1,"value"],disabled:[1,"disabled"]},outputs:{value:"valueChange"},features:[O([g,{provide:ye,useExisting:t},{provide:H,useExisting:t}]),w([p]),E],ngContentSelectors:B,decls:1,vars:0,template:function(o,n){o&1&&(P(),N(0))},dependencies:[b,F],encapsulation:2,changeDetection:0})}return t})(),yn=(()=>{class t extends T{$pcAccordionHeader=r(_e,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=r(p,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}pcAccordion=r(y(()=>U));pcAccordionPanel=r(y(()=>xe));id=c(()=>`${this.pcAccordion.id()}_accordionheader_${this.pcAccordionPanel.value()}`);active=c(()=>this.pcAccordionPanel.active());disabled=c(()=>this.pcAccordionPanel.disabled());ariaControls=c(()=>`${this.pcAccordion.id()}_accordioncontent_${this.pcAccordionPanel.value()}`);toggleicon;onClick(e){if(this.disabled())return;let o=this.active();this.changeActiveValue();let n=this.active(),a=this.pcAccordionPanel.value();!o&&n?this.pcAccordion.onOpen.emit({originalEvent:e,index:a}):o&&!n&&this.pcAccordion.onClose.emit({originalEvent:e,index:a})}onFocus(){!this.disabled()&&this.pcAccordion.selectOnFocus()&&this.changeActiveValue()}onKeydown(e){switch(e.code){case"ArrowDown":this.arrowDownKey(e);break;case"ArrowUp":this.arrowUpKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"Enter":case"Space":case"NumpadEnter":this.onEnterKey(e);break;default:break}}_componentStyle=r(g);changeActiveValue(){this.pcAccordion.updateValue(this.pcAccordionPanel.value())}findPanel(e){return e?.closest('[data-pc-name="accordionpanel"]')}findHeader(e){return C(e,'[data-pc-name="accordionheader"]')}findNextPanel(e,o=!1){let n=o?e:e.nextElementSibling;return n?I(n,"data-p-disabled")?this.findNextPanel(n):this.findHeader(n):null}findPrevPanel(e,o=!1){let n=o?e:e.previousElementSibling;return n?I(n,"data-p-disabled")?this.findPrevPanel(n):this.findHeader(n):null}findFirstPanel(){return this.findNextPanel(this.pcAccordion.el.nativeElement.firstElementChild,!0)}findLastPanel(){return this.findPrevPanel(this.pcAccordion.el.nativeElement.lastElementChild,!0)}changeFocusedPanel(e,o){L(o)}arrowDownKey(e){let o=this.findNextPanel(this.findPanel(e.currentTarget));o?this.changeFocusedPanel(e,o):this.onHomeKey(e),e.preventDefault()}arrowUpKey(e){let o=this.findPrevPanel(this.findPanel(e.currentTarget));o?this.changeFocusedPanel(e,o):this.onEndKey(e),e.preventDefault()}onHomeKey(e){let o=this.findFirstPanel();this.changeFocusedPanel(e,o),e.preventDefault()}onEndKey(e){let o=this.findLastPanel();this.changeFocusedPanel(e,o),e.preventDefault()}onEnterKey(e){this.disabled()||this.changeActiveValue(),e.preventDefault()}get dataP(){return this.cn({active:this.active()})}static \u0275fac=(()=>{let e;return function(n){return(e||(e=_(t)))(n||t)}})();static \u0275cmp=m({type:t,selectors:[["p-accordion-header"],["p-accordionheader"]],contentQueries:function(o,n,a){if(o&1&&ee(a,we,5),o&2){let f;ne(f=te())&&(n.toggleicon=f.first)}},hostVars:13,hostBindings:function(o,n){o&1&&$("click",function(f){return n.onClick(f)})("focus",function(){return n.onFocus()})("keydown",function(f){return n.onKeydown(f)}),o&2&&(h("id",n.id())("aria-expanded",n.active())("aria-controls",n.ariaControls())("aria-disabled",n.disabled())("role","button")("tabindex",n.disabled()?"-1":"0")("data-p-active",n.active())("data-p-disabled",n.disabled())("data-p",n.dataP),l(n.cx("header")),oe("user-select","none"))},features:[O([g,{provide:_e,useExisting:t},{provide:H,useExisting:t}]),w([he,p]),E],ngContentSelectors:B,decls:3,vars:1,consts:[[4,"ngTemplateOutlet","ngTemplateOutletContext"],[4,"ngIf"],[3,"class","pBind",4,"ngIf"],["data-p-icon","chevron-up",3,"class","pBind",4,"ngIf"],[3,"pBind"],["data-p-icon","chevron-up",3,"pBind"],["data-p-icon","chevron-down",3,"pBind",4,"ngIf"],["data-p-icon","chevron-down",3,"pBind"]],template:function(o,n){o&1&&(P(),N(0),G(1,Ne,1,4)(2,Be,2,2)),o&2&&(s(),W(n.toggleicon?1:2))},dependencies:[b,ce,de,ue,fe,F,p],encapsulation:2,changeDetection:0})}return t})(),_n=(()=>{class t extends T{$pcAccordionContent=r(Ae,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=r(p,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}pcAccordion=r(y(()=>U));pcAccordionPanel=r(y(()=>xe));active=c(()=>this.pcAccordionPanel.active());ariaLabelledby=c(()=>`${this.pcAccordion.id()}_accordionheader_${this.pcAccordionPanel.value()}`);id=c(()=>`${this.pcAccordion.id()}_accordioncontent_${this.pcAccordionPanel.value()}`);_componentStyle=r(g);ptParams=c(()=>({context:this.active()}));computedMotionOptions=c(()=>x(x({},this.ptm("motion",this.ptParams())),this.pcAccordion.computedMotionOptions()));static \u0275fac=(()=>{let e;return function(n){return(e||(e=_(t)))(n||t)}})();static \u0275cmp=m({type:t,selectors:[["p-accordion-content"],["p-accordioncontent"]],hostVars:6,hostBindings:function(o,n){o&2&&(h("id",n.id())("role","region")("data-p-active",n.active())("aria-labelledby",n.ariaLabelledby()),l(n.cx("contentContainer")))},features:[O([g,{provide:Ae,useExisting:t},{provide:H,useExisting:t}]),w([p]),E],ngContentSelectors:B,decls:4,vars:10,consts:[["name","p-collapsible","hideStrategy","visibility",3,"visible","mountOnEnter","unmountOnLeave","options"],[3,"pBind"]],template:function(o,n){o&1&&(P(),z(0,"p-motion",0)(1,"div",1)(2,"div",1),N(3),Y()()()),o&2&&(d("visible",n.active())("mountOnEnter",!1)("unmountOnLeave",!1)("options",n.computedMotionOptions()),s(),l(n.cx("contentWrapper")),d("pBind",n.ptm("contentWrapper",n.ptParams())),s(),l(n.cx("content")),d("pBind",n.ptm("content",n.ptParams())))},dependencies:[b,F,p,me,ge],encapsulation:2,changeDetection:0})}return t})(),U=(()=>{class t extends T{$pcAccordion=r(Ce,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=r(p,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}value=R(void 0);multiple=v(!1,{transform:e=>k(e)});styleClass;expandIcon;collapseIcon;selectOnFocus=v(!1,{transform:e=>k(e)});transitionOptions="400ms cubic-bezier(0.86, 0, 0.07, 1)";motionOptions=v(void 0);computedMotionOptions=c(()=>x(x({},this.ptm("motion")),this.motionOptions()));onClose=new K;onOpen=new K;id=Q(se("pn_id_"));_componentStyle=r(g);onKeydown(e){switch(e.code){case"ArrowDown":this.onTabArrowDownKey(e);break;case"ArrowUp":this.onTabArrowUpKey(e);break;case"Home":e.shiftKey||this.onTabHomeKey(e);break;case"End":e.shiftKey||this.onTabEndKey(e);break}}onTabArrowDownKey(e){let o=this.findNextHeaderAction(e.target.parentElement);o?this.changeFocusedTab(o):this.onTabHomeKey(e),e.preventDefault()}onTabArrowUpKey(e){let o=this.findPrevHeaderAction(e.target.parentElement);o?this.changeFocusedTab(o):this.onTabEndKey(e),e.preventDefault()}onTabHomeKey(e){let o=this.findFirstHeaderAction();this.changeFocusedTab(o),e.preventDefault()}changeFocusedTab(e){e&&L(e)}findNextHeaderAction(e,o=!1){let n=o?e:e.nextElementSibling,a=C(n,'[data-pc-section="accordionheader"]');return a?I(a,"data-p-disabled")?this.findNextHeaderAction(a.parentElement):C(a.parentElement,'[data-pc-section="accordionheader"]'):null}findPrevHeaderAction(e,o=!1){let n=o?e:e.previousElementSibling,a=C(n,'[data-pc-section="accordionheader"]');return a?I(a,"data-p-disabled")?this.findPrevHeaderAction(a.parentElement):C(a.parentElement,'[data-pc-section="accordionheader"]'):null}findFirstHeaderAction(){let e=this.el.nativeElement.firstElementChild;return this.findNextHeaderAction(e,!0)}findLastHeaderAction(){let e=this.el.nativeElement.lastElementChild;return this.findPrevHeaderAction(e,!0)}onTabEndKey(e){let o=this.findLastHeaderAction();this.changeFocusedTab(o),e.preventDefault()}getBlockableElement(){return this.el.nativeElement.children[0]}updateValue(e){let o=this.value();if(this.multiple()){let n=Array.isArray(o)?[...o]:[],a=n.indexOf(e);a!==-1?n.splice(a,1):n.push(e),this.value.set(n)}else o===e?this.value.set(void 0):this.value.set(e)}static \u0275fac=(()=>{let e;return function(n){return(e||(e=_(t)))(n||t)}})();static \u0275cmp=m({type:t,selectors:[["p-accordion"]],hostVars:2,hostBindings:function(o,n){o&1&&$("keydown",function(f){return n.onKeydown(f)}),o&2&&l(n.cn(n.cx("root"),n.styleClass))},inputs:{value:[1,"value"],multiple:[1,"multiple"],styleClass:"styleClass",expandIcon:"expandIcon",collapseIcon:"collapseIcon",selectOnFocus:[1,"selectOnFocus"],transitionOptions:"transitionOptions",motionOptions:[1,"motionOptions"]},outputs:{value:"valueChange",onClose:"onClose",onOpen:"onOpen"},features:[O([g,{provide:Ce,useExisting:t},{provide:H,useExisting:t}]),w([p]),E],ngContentSelectors:B,decls:1,vars:0,template:function(o,n){o&1&&(P(),N(0))},dependencies:[b,le,F],encapsulation:2,changeDetection:0})}return t})();export{ve as a,xe as b,yn as c,_n as d,U as e};
