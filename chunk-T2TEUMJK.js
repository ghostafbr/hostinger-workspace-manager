import{$a as $,Aa as q,Ba as u,Ea as G,_a as H,a as Q,c as O,e as R,fb as s,j as V}from"./chunk-B5FRUK7K.js";import{$b as j,Cb as D,Db as N,Hc as P,Lb as g,Mb as S,Nb as E,O as b,Oa as i,Ob as A,P as h,Qb as v,R as C,Rb as _,T as l,Zb as c,_b as F,ab as I,bb as k,eb as x,fb as B,fc as z,gb as r,mb as M,oa as f,vb as a,wb as m,xb as y,yb as w}from"./chunk-PY5EWUYY.js";var J=`
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`;var U=["icon"],W=["*"];function X(t,d){if(t&1&&w(0,"span",4),t&2){let e=g(2);c(e.cx("icon")),a("ngClass",e.icon)("pBind",e.ptm("icon"))}}function Y(t,d){if(t&1&&(D(0),r(1,X,1,4,"span",3),N()),t&2){let e=g();i(),a("ngIf",e.icon)}}function Z(t,d){}function tt(t,d){t&1&&r(0,Z,0,0,"ng-template")}function et(t,d){if(t&1&&(m(0,"span",2),r(1,tt,1,0,null,5),y()),t&2){let e=g();c(e.cx("icon")),a("pBind",e.ptm("icon")),i(),a("ngTemplateOutlet",e.iconTemplate||e._iconTemplate)}}var nt={root:({instance:t})=>["p-tag p-component",{"p-tag-info":t.severity==="info","p-tag-success":t.severity==="success","p-tag-warn":t.severity==="warn","p-tag-danger":t.severity==="danger","p-tag-secondary":t.severity==="secondary","p-tag-contrast":t.severity==="contrast","p-tag-rounded":t.rounded}],icon:"p-tag-icon",label:"p-tag-label"},K=(()=>{class t extends G{name="tag";style=J;classes=nt;static \u0275fac=(()=>{let e;return function(n){return(e||(e=f(t)))(n||t)}})();static \u0275prov=b({token:t,factory:t.\u0275fac})}return t})();var L=new C("TAG_INSTANCE"),ot=(()=>{class t extends ${$pcTag=l(L,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=l(s,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}styleClass;severity;value;icon;rounded;iconTemplate;templates;_iconTemplate;_componentStyle=l(K);onAfterContentInit(){this.templates?.forEach(e=>{switch(e.getType()){case"icon":this._iconTemplate=e.template;break}})}get dataP(){return this.cn({rounded:this.rounded,[this.severity]:this.severity})}static \u0275fac=(()=>{let e;return function(n){return(e||(e=f(t)))(n||t)}})();static \u0275cmp=I({type:t,selectors:[["p-tag"]],contentQueries:function(o,n,T){if(o&1&&A(T,U,4)(T,q,4),o&2){let p;v(p=_())&&(n.iconTemplate=p.first),v(p=_())&&(n.templates=p)}},hostVars:3,hostBindings:function(o,n){o&2&&(M("data-p",n.dataP),c(n.cn(n.cx("root"),n.styleClass)))},inputs:{styleClass:"styleClass",severity:"severity",value:"value",icon:"icon",rounded:[2,"rounded","rounded",P]},features:[z([K,{provide:L,useExisting:t},{provide:H,useExisting:t}]),x([s]),B],ngContentSelectors:W,decls:5,vars:6,consts:[[4,"ngIf"],[3,"class","pBind",4,"ngIf"],[3,"pBind"],[3,"class","ngClass","pBind",4,"ngIf"],[3,"ngClass","pBind"],[4,"ngTemplateOutlet"]],template:function(o,n){o&1&&(S(),E(0),r(1,Y,2,1,"ng-container",0)(2,et,2,4,"span",1),m(3,"span",2),F(4),y()),o&2&&(i(),a("ngIf",!n.iconTemplate&&!n._iconTemplate),i(),a("ngIf",n.iconTemplate||n._iconTemplate),i(),c(n.cx("label")),a("pBind",n.ptm("label")),i(),j(n.value))},dependencies:[V,Q,O,R,u,s],encapsulation:2,changeDetection:0})}return t})(),It=(()=>{class t{static \u0275fac=function(o){return new(o||t)};static \u0275mod=k({type:t});static \u0275inj=h({imports:[ot,u,u]})}return t})();export{ot as a,It as b};
