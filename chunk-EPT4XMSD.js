import{a as re}from"./chunk-DUNBGOMI.js";import{$a as A,Aa as ie,Ba as _,Ca as oe,Ea as N,_a as P,a as ee,c as ne,e as te,fb as p,j as D}from"./chunk-B5FRUK7K.js";import{$b as Y,Cb as z,Db as K,Fb as b,Hc as H,Ka as X,Kb as C,Lb as r,Mb as q,Nb as G,O as x,Oa as c,Ob as U,P as k,Qb as L,R as w,Rb as O,T as d,Vb as J,Y as m,Yb as M,Z as f,Zb as l,_ as Q,_b as W,a as F,ab as T,b as R,bb as E,da as j,eb as S,fb as B,fc as V,gb as h,mb as u,oa as g,sc as Z,vb as a,wb as v,xb as y,yb as $}from"./chunk-PY5EWUYY.js";var ae=`
    .p-skeleton {
        display: block;
        overflow: hidden;
        background: dt('skeleton.background');
        border-radius: dt('skeleton.border.radius');
    }

    .p-skeleton::after {
        content: '';
        animation: p-skeleton-animation 1.2s infinite;
        height: 100%;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(-100%);
        z-index: 1;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0), dt('skeleton.animation.background'), rgba(255, 255, 255, 0));
    }

    [dir='rtl'] .p-skeleton::after {
        animation-name: p-skeleton-animation-rtl;
    }

    .p-skeleton-circle {
        border-radius: 50%;
    }

    .p-skeleton-animation-none::after {
        animation: none;
    }

    @keyframes p-skeleton-animation {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(100%);
        }
    }

    @keyframes p-skeleton-animation-rtl {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(-100%);
        }
    }
`;var _e={root:{position:"relative"}},he={root:({instance:n})=>["p-skeleton p-component",{"p-skeleton-circle":n.shape==="circle","p-skeleton-animation-none":n.animation==="none"}]},se=(()=>{class n extends N{name="skeleton";style=ae;classes=he;inlineStyles=_e;static \u0275fac=(()=>{let e;return function(i){return(e||(e=g(n)))(i||n)}})();static \u0275prov=x({token:n,factory:n.\u0275fac})}return n})();var ce=new w("SKELETON_INSTANCE"),ue=(()=>{class n extends A{$pcSkeleton=d(ce,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=d(p,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}styleClass;shape="rectangle";animation="wave";borderRadius;size;width="100%";height="1rem";_componentStyle=d(se);get containerStyle(){let e=this._componentStyle?.inlineStyles.root,t;return this.$unstyled()||(this.size?t=R(F({},e),{width:this.size,height:this.size,borderRadius:this.borderRadius}):t=R(F({},e),{width:this.width,height:this.height,borderRadius:this.borderRadius})),t}get dataP(){return this.cn({[this.shape]:this.shape})}static \u0275fac=(()=>{let e;return function(i){return(e||(e=g(n)))(i||n)}})();static \u0275cmp=T({type:n,selectors:[["p-skeleton"]],hostVars:6,hostBindings:function(t,i){t&2&&(u("aria-hidden",!0)("data-p",i.dataP),M(i.containerStyle),l(i.cn(i.cx("root"),i.styleClass)))},inputs:{styleClass:"styleClass",shape:"shape",animation:"animation",borderRadius:"borderRadius",size:"size",width:"width",height:"height"},features:[V([se,{provide:ce,useExisting:n},{provide:P,useExisting:n}]),S([p]),B],decls:0,vars:0,template:function(t,i){},dependencies:[D,_],encapsulation:2,changeDetection:0})}return n})(),qe=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=E({type:n});static \u0275inj=k({imports:[ue,_,_]})}return n})();var le=`
    .p-chip {
        display: inline-flex;
        align-items: center;
        background: dt('chip.background');
        color: dt('chip.color');
        border-radius: dt('chip.border.radius');
        padding-block: dt('chip.padding.y');
        padding-inline: dt('chip.padding.x');
        gap: dt('chip.gap');
    }

    .p-chip-icon {
        color: dt('chip.icon.color');
        font-size: dt('chip.icon.font.size');
        width: dt('chip.icon.size');
        height: dt('chip.icon.size');
    }

    .p-chip-image {
        border-radius: 50%;
        width: dt('chip.image.width');
        height: dt('chip.image.height');
        margin-inline-start: calc(-1 * dt('chip.padding.y'));
    }

    .p-chip:has(.p-chip-remove-icon) {
        padding-inline-end: dt('chip.padding.y');
    }

    .p-chip:has(.p-chip-image) {
        padding-block-start: calc(dt('chip.padding.y') / 2);
        padding-block-end: calc(dt('chip.padding.y') / 2);
    }

    .p-chip-remove-icon {
        cursor: pointer;
        font-size: dt('chip.remove.icon.size');
        width: dt('chip.remove.icon.size');
        height: dt('chip.remove.icon.size');
        color: dt('chip.remove.icon.color');
        border-radius: 50%;
        transition:
            outline-color dt('chip.transition.duration'),
            box-shadow dt('chip.transition.duration');
        outline-color: transparent;
    }

    .p-chip-remove-icon:focus-visible {
        box-shadow: dt('chip.remove.icon.focus.ring.shadow');
        outline: dt('chip.remove.icon.focus.ring.width') dt('chip.remove.icon.focus.ring.style') dt('chip.remove.icon.focus.ring.color');
        outline-offset: dt('chip.remove.icon.focus.ring.offset');
    }
`;var ge=["removeicon"],ve=["*"];function ye(n,s){if(n&1){let e=b();v(0,"img",4),C("error",function(i){m(e);let o=r();return f(o.imageError(i))}),y()}if(n&2){let e=r();l(e.cx("image")),a("pBind",e.ptm("image"))("src",e.image,X)("alt",e.alt)}}function be(n,s){if(n&1&&$(0,"span",6),n&2){let e=r(2);l(e.icon),a("pBind",e.ptm("icon"))("ngClass",e.cx("icon"))}}function Ce(n,s){if(n&1&&h(0,be,1,4,"span",5),n&2){let e=r();a("ngIf",e.icon)}}function Ie(n,s){if(n&1&&(v(0,"div",7),W(1),y()),n&2){let e=r();l(e.cx("label")),a("pBind",e.ptm("label")),c(),Y(e.label)}}function xe(n,s){if(n&1){let e=b();v(0,"span",11),C("click",function(i){m(e);let o=r(3);return f(o.close(i))})("keydown",function(i){m(e);let o=r(3);return f(o.onKeydown(i))}),y()}if(n&2){let e=r(3);l(e.removeIcon),a("pBind",e.ptm("removeIcon"))("ngClass",e.cx("removeIcon")),u("tabindex",e.disabled?-1:0)("aria-label",e.removeAriaLabel)}}function ke(n,s){if(n&1){let e=b();Q(),v(0,"svg",12),C("click",function(i){m(e);let o=r(3);return f(o.close(i))})("keydown",function(i){m(e);let o=r(3);return f(o.onKeydown(i))}),y()}if(n&2){let e=r(3);l(e.cx("removeIcon")),a("pBind",e.ptm("removeIcon")),u("tabindex",e.disabled?-1:0)("aria-label",e.removeAriaLabel)}}function we(n,s){if(n&1&&(z(0),h(1,xe,1,6,"span",9)(2,ke,1,5,"svg",10),K()),n&2){let e=r(2);c(),a("ngIf",e.removeIcon),c(),a("ngIf",!e.removeIcon)}}function Te(n,s){}function Ee(n,s){n&1&&h(0,Te,0,0,"ng-template")}function Se(n,s){if(n&1){let e=b();v(0,"span",13),C("click",function(i){m(e);let o=r(2);return f(o.close(i))})("keydown",function(i){m(e);let o=r(2);return f(o.onKeydown(i))}),h(1,Ee,1,0,null,14),y()}if(n&2){let e=r(2);l(e.cx("removeIcon")),a("pBind",e.ptm("removeIcon")),u("tabindex",e.disabled?-1:0)("aria-label",e.removeAriaLabel),c(),a("ngTemplateOutlet",e.removeIconTemplate||e._removeIconTemplate)}}function Be(n,s){if(n&1&&(z(0),h(1,we,3,2,"ng-container",3)(2,Se,2,6,"span",8),K()),n&2){let e=r();c(),a("ngIf",!e.removeIconTemplate&&!e._removeIconTemplate),c(),a("ngIf",e.removeIconTemplate||e._removeIconTemplate)}}var Me={root:({instance:n})=>({display:!n.visible&&"none"})},Ve={root:({instance:n})=>["p-chip p-component",{"p-disabled":n.disabled}],image:"p-chip-image",icon:"p-chip-icon",label:"p-chip-label",removeIcon:"p-chip-remove-icon"},pe=(()=>{class n extends N{name="chip";style=le;classes=Ve;inlineStyles=Me;static \u0275fac=(()=>{let e;return function(i){return(e||(e=g(n)))(i||n)}})();static \u0275prov=x({token:n,factory:n.\u0275fac})}return n})();var de=new w("CHIP_INSTANCE"),De=(()=>{class n extends A{$pcChip=d(de,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=d(p,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}label;icon;image;alt;styleClass;disabled=!1;removable=!1;removeIcon;onRemove=new j;onImageError=new j;visible=!0;get removeAriaLabel(){return this.config.getTranslation(oe.ARIA).removeLabel}get chipProps(){return this._chipProps}set chipProps(e){this._chipProps=e,e&&typeof e=="object"&&Object.entries(e).forEach(([t,i])=>this[`_${t}`]!==i&&(this[`_${t}`]=i))}_chipProps;_componentStyle=d(pe);removeIconTemplate;templates;_removeIconTemplate;onAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"removeicon":this._removeIconTemplate=e.template;break;default:this._removeIconTemplate=e.template;break}})}onChanges(e){if(e.chipProps&&e.chipProps.currentValue){let{currentValue:t}=e.chipProps;t.label!==void 0&&(this.label=t.label),t.icon!==void 0&&(this.icon=t.icon),t.image!==void 0&&(this.image=t.image),t.alt!==void 0&&(this.alt=t.alt),t.styleClass!==void 0&&(this.styleClass=t.styleClass),t.removable!==void 0&&(this.removable=t.removable),t.removeIcon!==void 0&&(this.removeIcon=t.removeIcon)}}close(e){this.visible=!1,this.onRemove.emit(e)}onKeydown(e){(e.key==="Enter"||e.key==="Backspace")&&this.close(e)}imageError(e){this.onImageError.emit(e)}get dataP(){return this.cn({removable:this.removable})}static \u0275fac=(()=>{let e;return function(i){return(e||(e=g(n)))(i||n)}})();static \u0275cmp=T({type:n,selectors:[["p-chip"]],contentQueries:function(t,i,o){if(t&1&&U(o,ge,4)(o,ie,4),t&2){let I;L(I=O())&&(i.removeIconTemplate=I.first),L(I=O())&&(i.templates=I)}},hostVars:6,hostBindings:function(t,i){t&2&&(u("aria-label",i.label)("data-p",i.dataP),M(i.sx("root")),l(i.cn(i.cx("root"),i.styleClass)))},inputs:{label:"label",icon:"icon",image:"image",alt:"alt",styleClass:"styleClass",disabled:[2,"disabled","disabled",H],removable:[2,"removable","removable",H],removeIcon:"removeIcon",chipProps:"chipProps"},outputs:{onRemove:"onRemove",onImageError:"onImageError"},features:[V([pe,{provide:de,useExisting:n},{provide:P,useExisting:n}]),S([p]),B],ngContentSelectors:ve,decls:6,vars:4,consts:[["iconTemplate",""],[3,"pBind","class","src","alt","error",4,"ngIf","ngIfElse"],[3,"pBind","class",4,"ngIf"],[4,"ngIf"],[3,"error","pBind","src","alt"],[3,"pBind","class","ngClass",4,"ngIf"],[3,"pBind","ngClass"],[3,"pBind"],["role","button",3,"pBind","class","click","keydown",4,"ngIf"],["role","button",3,"pBind","class","ngClass","click","keydown",4,"ngIf"],["data-p-icon","times-circle","role","button",3,"pBind","class","click","keydown",4,"ngIf"],["role","button",3,"click","keydown","pBind","ngClass"],["data-p-icon","times-circle","role","button",3,"click","keydown","pBind"],["role","button",3,"click","keydown","pBind"],[4,"ngTemplateOutlet"]],template:function(t,i){if(t&1&&(q(),G(0),h(1,ye,1,5,"img",1)(2,Ce,1,1,"ng-template",null,0,Z)(4,Ie,2,4,"div",2)(5,Be,3,2,"ng-container",3)),t&2){let o=J(3);c(),a("ngIf",i.image)("ngIfElse",o),c(3),a("ngIf",i.label),c(),a("ngIf",i.removable)}},dependencies:[D,ee,ne,te,re,_,p],encapsulation:2,changeDetection:0})}return n})(),un=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=E({type:n});static \u0275inj=k({imports:[De,_,_]})}return n})();export{ue as a,qe as b,De as c,un as d};
