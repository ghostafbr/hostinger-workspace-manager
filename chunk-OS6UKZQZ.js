import{a as ue,b as ce}from"./chunk-PD4RLLCC.js";import{b as de,c as le}from"./chunk-MR3LIVR4.js";import{a as ae,b as se}from"./chunk-GUUVKBTU.js";import{a as J}from"./chunk-HPQ7OMYE.js";import{Ca as x,Cb as ee,Db as ne,Ea as $,Eb as te,Fb as oe,Hb as re,Ob as ie,Pb as pe,Ya as k,Za as S,db as a,eb as T,i as H,nb as K,ob as Q,u as q,vb as X,wb as F,ya as W,yb as Y,za as l,zb as Z}from"./chunk-M5CBQPDY.js";import{Jb as V,Kb as D,Lb as N,Mb as _,O as b,Oa as s,P as y,R as v,T as i,Vb as z,Xb as U,Yb as f,Zb as h,_ as R,_b as O,ab as m,bb as M,eb as C,ec as I,fb as w,gb as A,ia as B,mb as j,oa as u,pb as P,qb as E,vb as c,wb as d,xb as p,yb as g}from"./chunk-ZVXIGZDY.js";var me=`
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
`;var ke={root:()=>["p-progressspinner"],spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},ge=(()=>{class e extends x{name="progressspinner";style=me;classes=ke;static \u0275fac=(()=>{let n;return function(o){return(n||(n=u(e)))(o||e)}})();static \u0275prov=b({token:e,factory:e.\u0275fac})}return e})();var fe=new v("PROGRESSSPINNER_INSTANCE"),Se=(()=>{class e extends S{$pcProgressSpinner=i(fe,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=i(a,{self:!0});styleClass;strokeWidth="2";fill="none";animationDuration="2s";ariaLabel;onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}_componentStyle=i(ge);static \u0275fac=(()=>{let n;return function(o){return(n||(n=u(e)))(o||e)}})();static \u0275cmp=m({type:e,selectors:[["p-progressSpinner"],["p-progress-spinner"],["p-progressspinner"]],hostVars:5,hostBindings:function(t,o){t&2&&(j("aria-label",o.ariaLabel)("role","progressbar")("aria-busy",!0),f(o.cn(o.cx("root"),o.styleClass)))},inputs:{styleClass:"styleClass",strokeWidth:"strokeWidth",fill:"fill",animationDuration:"animationDuration",ariaLabel:"ariaLabel"},features:[I([ge,{provide:fe,useExisting:e},{provide:k,useExisting:e}]),C([a]),w],decls:2,vars:10,consts:[["viewBox","25 25 50 50",3,"pBind"],["cx","50","cy","50","r","20","stroke-miterlimit","10",3,"pBind"]],template:function(t,o){t&1&&(R(),d(0,"svg",0),g(1,"circle",1),p()),t&2&&(f(o.cx("spin")),z("animation-duration",o.animationDuration),c("pBind",o.ptm("spin")),s(),f(o.cx("circle")),c("pBind",o.ptm("circle")),j("fill",o.fill)("stroke-width",o.strokeWidth))},dependencies:[H,l,a],encapsulation:2,changeDetection:0})}return e})(),be=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275mod=M({type:e});static \u0275inj=y({imports:[Se,l,l]})}return e})();var ye=`
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
`;var Fe=["*"],Pe=`
    ${ye}

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
`,Ee={root:({instance:e})=>["p-inputgroup",{"p-inputgroup-fluid":e.fluid}]},ve=(()=>{class e extends x{name="inputgroup";style=Pe;classes=Ee;static \u0275fac=(()=>{let n;return function(o){return(n||(n=u(e)))(o||e)}})();static \u0275prov=b({token:e,factory:e.\u0275fac})}return e})();var Me=new v("INPUTGROUP_INSTANCE"),De=(()=>{class e extends S{_componentStyle=i(ve);$pcInputGroup=i(Me,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=i(a,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}styleClass;static \u0275fac=(()=>{let n;return function(o){return(n||(n=u(e)))(o||e)}})();static \u0275cmp=m({type:e,selectors:[["p-inputgroup"],["p-inputGroup"],["p-input-group"]],hostVars:2,hostBindings:function(t,o){t&2&&f(o.cn(o.cx("root"),o.styleClass))},inputs:{styleClass:"styleClass"},features:[I([ve,{provide:Me,useExisting:e},{provide:k,useExisting:e}]),C([a]),w],ngContentSelectors:Fe,decls:1,vars:0,template:function(t,o){t&1&&(N(),_(0))},dependencies:[T],encapsulation:2})}return e})(),Ce=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275mod=M({type:e});static \u0275inj=y({imports:[De,l,l]})}return e})();var Ne=["*"],_e={root:"p-inputgroupaddon"},we=(()=>{class e extends x{name="inputgroupaddon";classes=_e;static \u0275fac=(()=>{let n;return function(o){return(n||(n=u(e)))(o||e)}})();static \u0275prov=b({token:e,factory:e.\u0275fac})}return e})(),Ie=new v("INPUTGROUPADDON_INSTANCE"),Te=(()=>{class e extends S{_componentStyle=i(we);$pcInputGroupAddon=i(Ie,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=i(a,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}style;styleClass;get hostStyle(){return this.style}static \u0275fac=(()=>{let n;return function(o){return(n||(n=u(e)))(o||e)}})();static \u0275cmp=m({type:e,selectors:[["p-inputgroup-addon"],["p-inputGroupAddon"]],hostVars:4,hostBindings:function(t,o){t&2&&(U(o.hostStyle),f(o.cn(o.cx("root"),o.styleClass)))},inputs:{style:"style",styleClass:"styleClass"},features:[I([we,{provide:Ie,useExisting:e},{provide:k,useExisting:e}]),C([a]),w],ngContentSelectors:Ne,decls:1,vars:0,template:function(t,o){t&1&&(N(),_(0))},dependencies:[T],encapsulation:2})}return e})(),xe=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275mod=M({type:e});static \u0275inj=y({imports:[Te,l,l]})}return e})();function Be(e,r){e&1&&(d(0,"div",13)(1,"h1",14),h(2,"Hostinger Workspace Manager"),p(),d(3,"p",15),h(4,"Gesti\xF3n de dominios y suscripciones"),p()())}function Ae(e,r){if(e&1&&g(0,"p-message",3),e&2){let n=D();c("text",n.errorMessage())}}function je(e,r){if(e&1&&(d(0,"small",8),h(1),p()),e&2){let n=D();s(),O(n.getFieldError("email"))}}function Oe(e,r){if(e&1&&(d(0,"small",8),h(1),p()),e&2){let n=D();s(),O(n.getFieldError("password"))}}function Ge(e,r){e&1&&(d(0,"div",16)(1,"p",17),g(2,"i",18),h(3," Solo usuarios autorizados pueden acceder a esta aplicaci\xF3n. "),p()())}var L=class e{fb=i(oe);authService=i(J);router=i(q);loginForm=this.fb.group({email:["",[F.required,F.email]],password:["",[F.required,F.minLength(6)]]});isLoading=B(!1);errorMessage=B(null);async onSubmit(){if(this.loginForm.invalid){this.loginForm.markAllAsTouched();return}this.isLoading.set(!0),this.errorMessage.set(null);let{email:r,password:n}=this.loginForm.value;if(!r||!n){this.errorMessage.set("Email y contrase\xF1a son requeridos"),this.isLoading.set(!1);return}try{await this.authService.signIn(r,n),await this.router.navigate(["/dashboard"])}catch(t){this.handleAuthError(t)}finally{this.isLoading.set(!1)}}handleAuthError(r){if(r instanceof $)switch(r.code){case"auth/user-not-found":case"auth/wrong-password":case"auth/invalid-credential":this.errorMessage.set("Email o contrase\xF1a incorrectos. Por favor, verifica tus credenciales.");break;case"auth/user-disabled":this.errorMessage.set("Esta cuenta ha sido deshabilitada. Contacta al administrador.");break;case"auth/too-many-requests":this.errorMessage.set("Demasiados intentos fallidos. Por favor, intenta m\xE1s tarde.");break;case"auth/network-request-failed":this.errorMessage.set("Error de conexi\xF3n. Verifica tu conexi\xF3n a internet.");break;case"auth/invalid-email":this.errorMessage.set("El formato del email no es v\xE1lido.");break;default:this.errorMessage.set("Error al iniciar sesi\xF3n. Por favor, intenta de nuevo."),console.error("Auth error:",r)}else this.errorMessage.set("Error inesperado. Por favor, intenta de nuevo."),console.error("Unexpected error:",r)}hasFieldError(r){let n=this.loginForm.get(r);return!!(n?.invalid&&n?.touched)}getFieldError(r){let n=this.loginForm.get(r);return!n||!n.errors||!n.touched?"":n.errors.required?"Este campo es obligatorio":n.errors.email?"Ingresa un email v\xE1lido":n.errors.minlength?"La contrase\xF1a debe tener al menos 6 caracteres":""}static \u0275fac=function(n){return new(n||e)};static \u0275cmp=m({type:e,selectors:[["app-login"]],decls:18,vars:10,consts:[[1,"login-container"],[1,"login-card-wrapper"],["pTemplate","header"],["severity","error",3,"text"],[1,"login-form",3,"ngSubmit","formGroup"],[1,"field"],["for","email",1,"field-label"],["pInputText","","id","email","formControlName","email","type","email","placeholder","usuario@ejemplo.com","fluid","","autocomplete","email",3,"invalid"],[1,"field-error"],["for","password",1,"field-label"],["formControlName","password","inputId","password","placeholder","Ingresa tu contrase\xF1a","fluid","","autocomplete","current-password",3,"toggleMask","feedback","invalid"],["type","submit","label","Iniciar Sesi\xF3n","icon","pi pi-sign-in","severity","primary","fluid","",3,"loading","disabled"],["pTemplate","footer"],[1,"card-header"],[1,"app-title"],[1,"app-subtitle"],[1,"card-footer"],[1,"footer-note"],[1,"pi","pi-info-circle"]],template:function(n,t){n&1&&(d(0,"div",0)(1,"div",1)(2,"p-card"),A(3,Be,5,0,"ng-template",2),P(4,Ae,1,1,"p-message",3),d(5,"form",4),V("ngSubmit",function(){return t.onSubmit()}),d(6,"div",5)(7,"label",6),h(8,"Email"),p(),g(9,"input",7),P(10,je,2,1,"small",8),p(),d(11,"div",5)(12,"label",9),h(13,"Contrase\xF1a"),p(),g(14,"p-password",10),P(15,Oe,2,1,"small",8),p(),g(16,"p-button",11),p(),A(17,Ge,4,0,"ng-template",12),p()()()),n&2&&(s(4),E(t.errorMessage()?4:-1),s(),c("formGroup",t.loginForm),s(4),c("invalid",t.hasFieldError("email")),s(),E(t.hasFieldError("email")?10:-1),s(4),c("toggleMask",!0)("feedback",!1)("invalid",t.hasFieldError("password")),s(),E(t.hasFieldError("password")?15:-1),s(),c("loading",t.isLoading())("disabled",t.loginForm.invalid||t.isLoading()))},dependencies:[re,ee,X,Y,Z,te,ne,se,ae,W,pe,ie,le,de,Q,K,ce,ue,be,Ce,xe],styles:[".login-container[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#f5f7fa,#e4e8ec);padding:1rem}.login-card-wrapper[_ngcontent-%COMP%]{width:100%;max-width:420px}.card-header[_ngcontent-%COMP%]{text-align:center;padding:2.5rem 2rem 1.5rem;background:#fff;border-bottom:1px solid #f0f0f0}.app-title[_ngcontent-%COMP%]{margin:0;font-size:1.625rem;font-weight:700;letter-spacing:-.5px;color:#1a1a1a}.app-subtitle[_ngcontent-%COMP%]{margin:.625rem 0 0;font-size:.9rem;color:#6b7280;font-weight:400}.login-form[_ngcontent-%COMP%]{padding:2rem}.field[_ngcontent-%COMP%]{margin-bottom:1.25rem}.field[_ngcontent-%COMP%]:last-of-type{margin-bottom:1.75rem}.field-label[_ngcontent-%COMP%]{display:block;margin-bottom:.5rem;font-weight:500;color:#374151;font-size:.875rem}.field-error[_ngcontent-%COMP%]{display:block;margin-top:.375rem;color:#374151;font-size:.8125rem}.card-footer[_ngcontent-%COMP%]{padding:1.25rem 2rem;background-color:#fafafa;text-align:center;border-top:1px solid #f0f0f0}.footer-note[_ngcontent-%COMP%]{margin:0;font-size:.8125rem;color:#6b7280;display:flex;align-items:center;justify-content:center;gap:.5rem}.footer-note[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{font-size:.9375rem;color:#9ca3af}@media(max-width:768px){.login-card-wrapper[_ngcontent-%COMP%]{max-width:100%}.card-header[_ngcontent-%COMP%]{padding:2rem 1.5rem 1.25rem}.app-title[_ngcontent-%COMP%]{font-size:1.5rem}.login-form[_ngcontent-%COMP%]{padding:1.5rem}}"],changeDetection:0})};export{L as default};
