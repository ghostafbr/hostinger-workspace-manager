import{Ma as Q,Na as g,Qa as R,Sa as L,Ta as q,Za as m,_a as v,e as j,g as O,m as w}from"./chunk-WQRABBEY.js";import{Gb as y,Ob as _,P as C,Pa as i,Pb as N,Q as B,Qb as k,Rb as A,S as x,Tb as s,U as u,Ub as c,ac as d,bb as I,cb as M,fb as D,gb as E,hb as p,jc as F,ob as S,pa as h,xb as r,yb as T,zb as b}from"./chunk-XTNRL3Y3.js";var P=`
    .p-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        padding: dt('toolbar.padding');
        background: dt('toolbar.background');
        border: 1px solid dt('toolbar.border.color');
        color: dt('toolbar.color');
        border-radius: dt('toolbar.border.radius');
        gap: dt('toolbar.gap');
    }

    .p-toolbar-start,
    .p-toolbar-center,
    .p-toolbar-end {
        display: flex;
        align-items: center;
    }
`;var $=["start"],z=["end"],G=["center"],J=["*"];function K(e,l){e&1&&y(0)}function U(e,l){if(e&1&&(T(0,"div",1),p(1,K,1,0,"ng-container",2),b()),e&2){let t=_();d(t.cx("start")),r("pBind",t.ptm("start")),i(),r("ngTemplateOutlet",t.startTemplate||t._startTemplate)}}function W(e,l){e&1&&y(0)}function X(e,l){if(e&1&&(T(0,"div",1),p(1,W,1,0,"ng-container",2),b()),e&2){let t=_();d(t.cx("center")),r("pBind",t.ptm("center")),i(),r("ngTemplateOutlet",t.centerTemplate||t._centerTemplate)}}function Y(e,l){e&1&&y(0)}function Z(e,l){if(e&1&&(T(0,"div",1),p(1,Y,1,0,"ng-container",2),b()),e&2){let t=_();d(t.cx("end")),r("pBind",t.ptm("end")),i(),r("ngTemplateOutlet",t.endTemplate||t._endTemplate)}}var ee={root:()=>["p-toolbar p-component"],start:"p-toolbar-start",center:"p-toolbar-center",end:"p-toolbar-end"},V=(()=>{class e extends R{name="toolbar";style=P;classes=ee;static \u0275fac=(()=>{let t;return function(n){return(t||(t=h(e)))(n||e)}})();static \u0275prov=C({token:e,factory:e.\u0275fac})}return e})();var H=new x("TOOLBAR_INSTANCE"),te=(()=>{class e extends q{$pcToolbar=u(H,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=u(m,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}styleClass;ariaLabelledBy;_componentStyle=u(V);getBlockableElement(){return this.el.nativeElement.children[0]}startTemplate;endTemplate;centerTemplate;templates;_startTemplate;_endTemplate;_centerTemplate;onAfterContentInit(){this.templates.forEach(t=>{switch(t.getType()){case"start":case"left":this._startTemplate=t.template;break;case"end":case"right":this._endTemplate=t.template;break;case"center":this._centerTemplate=t.template;break}})}static \u0275fac=(()=>{let t;return function(n){return(t||(t=h(e)))(n||e)}})();static \u0275cmp=I({type:e,selectors:[["p-toolbar"]],contentQueries:function(o,n,f){if(o&1&&A(f,$,4)(f,z,4)(f,G,4)(f,Q,4),o&2){let a;s(a=c())&&(n.startTemplate=a.first),s(a=c())&&(n.endTemplate=a.first),s(a=c())&&(n.centerTemplate=a.first),s(a=c())&&(n.templates=a)}},hostAttrs:["role","toolbar"],hostVars:3,hostBindings:function(o,n){o&2&&(S("aria-labelledby",n.ariaLabelledBy),d(n.cn(n.cx("root"),n.styleClass)))},inputs:{styleClass:"styleClass",ariaLabelledBy:"ariaLabelledBy"},features:[F([V,{provide:H,useExisting:e},{provide:L,useExisting:e}]),D([m]),E],ngContentSelectors:J,decls:4,vars:3,consts:[[3,"class","pBind",4,"ngIf"],[3,"pBind"],[4,"ngTemplateOutlet"]],template:function(o,n){o&1&&(N(),k(0),p(1,U,2,4,"div",0)(2,X,2,4,"div",0)(3,Z,2,4,"div",0)),o&2&&(i(),r("ngIf",n.startTemplate||n._startTemplate),i(),r("ngIf",n.centerTemplate||n._centerTemplate),i(),r("ngIf",n.endTemplate||n._endTemplate))},dependencies:[w,j,O,g,v,m],encapsulation:2,changeDetection:0})}return e})(),he=(()=>{class e{static \u0275fac=function(o){return new(o||e)};static \u0275mod=M({type:e});static \u0275inj=B({imports:[te,g,v,g,v]})}return e})();export{te as a,he as b};
