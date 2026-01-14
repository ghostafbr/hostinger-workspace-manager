import{a as ge,b as fe}from"./chunk-BYV6SMLC.js";import{b as ce,c as me}from"./chunk-C4GIL7BK.js";import{a as pe,b as se,d as de}from"./chunk-Q5HFPYVW.js";import"./chunk-IRM2UQ26.js";import"./chunk-OL6EOTCO.js";import{a as le,b as ue}from"./chunk-R2VM7XJL.js";import{a as J}from"./chunk-QBMNRZZL.js";import{Ab as X,Bb as E,Ca as W,Da as c,Db as Y,Eb as Z,Ga as k,Hb as ee,Ia as $,Ib as te,Jb as ne,Nb as re,Pb as ie,Wb as oe,Xb as ae,bb as F,cb as x,ib as d,jb as A,k as z,sb as K,tb as Q,x as H}from"./chunk-OPKLNVVY.js";import{$ as R,$b as u,Lb as V,Mb as _,Nb as T,Ob as B,P as y,Pa as s,Q as v,S as M,U as p,Xb as U,Zb as q,_b as h,bb as g,bc as O,cb as C,fb as w,gb as S,hb as j,hc as I,ja as P,nb as b,pa as m,qb as D,rb as N,wb as l,xb as o,yb as a,zb as f}from"./chunk-GUMEVBBA.js";var he=`
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
`;var Ee={root:()=>["p-progressspinner"],spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},be=(()=>{class e extends k{name="progressspinner";style=he;classes=Ee;static \u0275fac=(()=>{let t;return function(r){return(t||(t=m(e)))(r||e)}})();static \u0275prov=y({token:e,factory:e.\u0275fac})}return e})();var ye=new M("PROGRESSSPINNER_INSTANCE"),Pe=(()=>{class e extends x{$pcProgressSpinner=p(ye,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(d,{self:!0});styleClass;strokeWidth="2";fill="none";animationDuration="2s";ariaLabel;onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}_componentStyle=p(be);static \u0275fac=(()=>{let t;return function(r){return(t||(t=m(e)))(r||e)}})();static \u0275cmp=g({type:e,selectors:[["p-progressSpinner"],["p-progress-spinner"],["p-progressspinner"]],hostVars:5,hostBindings:function(n,r){n&2&&(b("aria-label",r.ariaLabel)("role","progressbar")("aria-busy",!0),h(r.cn(r.cx("root"),r.styleClass)))},inputs:{styleClass:"styleClass",strokeWidth:"strokeWidth",fill:"fill",animationDuration:"animationDuration",ariaLabel:"ariaLabel"},features:[I([be,{provide:ye,useExisting:e},{provide:F,useExisting:e}]),w([d]),S],decls:2,vars:10,consts:[["viewBox","25 25 50 50",3,"pBind"],["cx","50","cy","50","r","20","stroke-miterlimit","10",3,"pBind"]],template:function(n,r){n&1&&(R(),o(0,"svg",0),f(1,"circle",1),a()),n&2&&(h(r.cx("spin")),U("animation-duration",r.animationDuration),l("pBind",r.ptm("spin")),s(),h(r.cx("circle")),l("pBind",r.ptm("circle")),b("fill",r.fill)("stroke-width",r.strokeWidth))},dependencies:[z,c,d],encapsulation:2,changeDetection:0})}return e})(),Me=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=C({type:e});static \u0275inj=v({imports:[Pe,c,c]})}return e})();var Ce=`
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
`;var De=["*"],Ne=`
    ${Ce}

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
`,_e={root:({instance:e})=>["p-inputgroup",{"p-inputgroup-fluid":e.fluid}]},we=(()=>{class e extends k{name="inputgroup";style=Ne;classes=_e;static \u0275fac=(()=>{let t;return function(r){return(t||(t=m(e)))(r||e)}})();static \u0275prov=y({token:e,factory:e.\u0275fac})}return e})();var Se=new M("INPUTGROUP_INSTANCE"),Te=(()=>{class e extends x{_componentStyle=p(we);$pcInputGroup=p(Se,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(d,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}styleClass;static \u0275fac=(()=>{let t;return function(r){return(t||(t=m(e)))(r||e)}})();static \u0275cmp=g({type:e,selectors:[["p-inputgroup"],["p-inputGroup"],["p-input-group"]],hostVars:2,hostBindings:function(n,r){n&2&&h(r.cn(r.cx("root"),r.styleClass))},inputs:{styleClass:"styleClass"},features:[I([we,{provide:Se,useExisting:e},{provide:F,useExisting:e}]),w([d]),S],ngContentSelectors:De,decls:1,vars:0,template:function(n,r){n&1&&(T(),B(0))},dependencies:[A],encapsulation:2})}return e})(),Ie=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=C({type:e});static \u0275inj=v({imports:[Te,c,c]})}return e})();var Be=["*"],Ae={root:"p-inputgroupaddon"},ke=(()=>{class e extends k{name="inputgroupaddon";classes=Ae;static \u0275fac=(()=>{let t;return function(r){return(t||(t=m(e)))(r||e)}})();static \u0275prov=y({token:e,factory:e.\u0275fac})}return e})(),Fe=new M("INPUTGROUPADDON_INSTANCE"),je=(()=>{class e extends x{_componentStyle=p(ke);$pcInputGroupAddon=p(Fe,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(d,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}style;styleClass;get hostStyle(){return this.style}static \u0275fac=(()=>{let t;return function(r){return(t||(t=m(e)))(r||e)}})();static \u0275cmp=g({type:e,selectors:[["p-inputgroup-addon"],["p-inputGroupAddon"]],hostVars:4,hostBindings:function(n,r){n&2&&(q(r.hostStyle),h(r.cn(r.cx("root"),r.styleClass)))},inputs:{style:"style",styleClass:"styleClass"},features:[I([ke,{provide:Fe,useExisting:e},{provide:F,useExisting:e}]),w([d]),S],ngContentSelectors:Be,decls:1,vars:0,template:function(n,r){n&1&&(T(),B(0))},dependencies:[A],encapsulation:2})}return e})(),xe=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=C({type:e});static \u0275inj=v({imports:[je,c,c]})}return e})();function Oe(e,i){e&1&&(o(0,"div",17)(1,"h1",18),u(2,"Hostinger Workspace Manager"),a(),o(3,"p",19),u(4,"Gesti\xF3n de dominios y suscripciones"),a()())}function Ge(e,i){if(e&1&&(o(0,"div",4),f(1,"p-message",20),a()),e&2){let t=_();l("@shake",t.errorState()),s(),l("text",t.errorMessage())}}function Le(e,i){if(e&1&&(o(0,"small",11),u(1),a()),e&2){let t=_();s(),O(" ",t.getFieldError("email")," ")}}function Re(e,i){if(e&1&&(o(0,"small",14),u(1),a()),e&2){let t=_();s(),O(" ",t.getFieldError("password")," ")}}function Ve(e,i){e&1&&(o(0,"div",21)(1,"p",22),f(2,"i",23),u(3," Solo usuarios autorizados pueden acceder a esta aplicaci\xF3n. "),a()())}var L=class e{fb=p(re);authService=p(J);router=p(H);loginForm=this.fb.group({email:["",[E.required,E.email]],password:["",[E.required,E.minLength(6)]]});isLoading=P(!1);errorMessage=P(null);errorState=P("default");async onSubmit(){if(this.loginForm.invalid){this.loginForm.markAllAsTouched();return}this.isLoading.set(!0),this.errorMessage.set(null);let{email:i,password:t}=this.loginForm.value;if(!i||!t){this.errorMessage.set("Email y contrase\xF1a son requeridos"),this.isLoading.set(!1);return}try{await this.authService.signIn(i,t),await this.router.navigate(["/dashboard"])}catch(n){this.errorState.set("error"),setTimeout(()=>this.errorState.set("default"),500),this.handleAuthError(n)}finally{this.isLoading.set(!1)}}handleAuthError(i){if(i instanceof $)switch(i.code){case"auth/user-not-found":case"auth/wrong-password":case"auth/invalid-credential":this.errorMessage.set("Email o contrase\xF1a incorrectos. Por favor, verifica tus credenciales.");break;case"auth/user-disabled":this.errorMessage.set("Esta cuenta ha sido deshabilitada. Contacta al administrador.");break;case"auth/too-many-requests":this.errorMessage.set("Demasiados intentos fallidos. Por favor, intenta m\xE1s tarde.");break;case"auth/network-request-failed":this.errorMessage.set("Error de conexi\xF3n. Verifica tu conexi\xF3n a internet.");break;case"auth/invalid-email":this.errorMessage.set("El formato del email no es v\xE1lido.");break;default:this.errorMessage.set("Error al iniciar sesi\xF3n. Por favor, intenta de nuevo."),console.error("Auth error:",i)}else this.errorMessage.set("Error inesperado. Por favor, intenta de nuevo."),console.error("Unexpected error:",i)}hasFieldError(i){let t=this.loginForm.get(i);return!!(t?.invalid&&t?.touched)}getFieldError(i){let t=this.loginForm.get(i);return!t||!t.errors||!t.touched?"":t.errors.required?"Este campo es obligatorio":t.errors.email?"Ingresa un email v\xE1lido":t.errors.minlength?"La contrase\xF1a debe tener al menos 6 caracteres":""}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=g({type:e,selectors:[["app-login"]],decls:26,vars:17,consts:[["href","#main-content",1,"skip-link"],["id","main-content","role","main",1,"login-container"],[1,"login-card-wrapper"],["pTemplate","header"],["role","alert","aria-live","assertive"],["aria-labelledby","login-form-title",1,"login-form",3,"ngSubmit","formGroup"],["id","login-form-title",1,"sr-only"],[1,"field"],["for","email",1,"field-label"],["aria-label","requerido",1,"required-indicator"],["pInputText","","id","email","formControlName","email","type","email","placeholder","usuario@ejemplo.com","fluid","","autocomplete","email","aria-required","true",3,"invalid"],["id","email-error","role","alert",1,"field-error","error-message"],["for","password",1,"field-label"],["formControlName","password","inputId","password","placeholder","Ingresa tu contrase\xF1a","fluid","","autocomplete","current-password","aria-required","true",3,"toggleMask","feedback","invalid"],["id","password-error","role","alert",1,"field-error","error-message"],["type","submit","label","Iniciar Sesi\xF3n","icon","pi pi-sign-in","severity","primary","fluid","",1,"hover-lift",3,"loading","disabled"],["pTemplate","footer"],[1,"card-header"],[1,"app-title"],[1,"app-subtitle"],["severity","error",3,"text"],[1,"card-footer"],[1,"footer-note"],["aria-hidden","true",1,"pi","pi-info-circle"]],template:function(t,n){t&1&&(o(0,"a",0),u(1,"Saltar al contenido principal"),a(),o(2,"div",1)(3,"div",2)(4,"p-card"),j(5,Oe,5,0,"ng-template",3),D(6,Ge,2,2,"div",4),o(7,"form",5),V("ngSubmit",function(){return n.onSubmit()}),o(8,"h2",6),u(9,"Formulario de inicio de sesi\xF3n"),a(),o(10,"div",7)(11,"label",8),u(12," Email "),o(13,"span",9),u(14,"*"),a()(),f(15,"input",10),D(16,Le,2,1,"small",11),a(),o(17,"div",7)(18,"label",12),u(19," Contrase\xF1a "),o(20,"span",9),u(21,"*"),a()(),f(22,"p-password",13),D(23,Re,2,1,"small",14),a(),f(24,"p-button",15),a(),j(25,Ve,4,0,"ng-template",16),a()()()),t&2&&(s(3),l("@fadeIn",void 0),s(),l("@slideUp",void 0),s(2),N(n.errorMessage()?6:-1),s(),l("formGroup",n.loginForm),s(8),l("invalid",n.hasFieldError("email")),b("aria-invalid",n.hasFieldError("email"))("aria-describedby",n.hasFieldError("email")?"email-error":null),s(),N(n.hasFieldError("email")?16:-1),s(6),l("toggleMask",!0)("feedback",!1)("invalid",n.hasFieldError("password")),b("aria-invalid",n.hasFieldError("password"))("aria-describedby",n.hasFieldError("password")?"password-error":null),s(),N(n.hasFieldError("password")?23:-1),s(),l("loading",n.isLoading())("disabled",n.loginForm.invalid||n.isLoading()),b("aria-busy",n.isLoading()))},dependencies:[ie,ee,X,Y,Z,ne,te,ue,le,W,ae,oe,me,ce,Q,K,fe,ge,Me,Ie,xe],styles:[".login-container[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#f5f7fa,#e4e8ec);padding:1rem}.login-card-wrapper[_ngcontent-%COMP%]{width:100%;max-width:420px}.card-header[_ngcontent-%COMP%]{text-align:center;padding:2.5rem 2rem 1.5rem;background:#fff;border-bottom:1px solid #f0f0f0}.app-title[_ngcontent-%COMP%]{margin:0;font-size:1.625rem;font-weight:700;letter-spacing:-.5px;color:#1a1a1a}.app-subtitle[_ngcontent-%COMP%]{margin:.625rem 0 0;font-size:.9rem;color:#6b7280;font-weight:400}.login-form[_ngcontent-%COMP%]{padding:2rem}.field[_ngcontent-%COMP%]{margin-bottom:1.25rem}.field[_ngcontent-%COMP%]:last-of-type{margin-bottom:1.75rem}.field-label[_ngcontent-%COMP%]{display:block;margin-bottom:.5rem;font-weight:500;color:#374151;font-size:.875rem}.field-error[_ngcontent-%COMP%]{display:block;margin-top:.375rem;color:#374151;font-size:.8125rem}.card-footer[_ngcontent-%COMP%]{padding:1.25rem 2rem;background-color:#fafafa;text-align:center;border-top:1px solid #f0f0f0}.footer-note[_ngcontent-%COMP%]{margin:0;font-size:.8125rem;color:#6b7280;display:flex;align-items:center;justify-content:center;gap:.5rem}.footer-note[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{font-size:.9375rem;color:#9ca3af}@media(max-width:768px){.login-card-wrapper[_ngcontent-%COMP%]{max-width:100%}.card-header[_ngcontent-%COMP%]{padding:2rem 1.5rem 1.25rem}.app-title[_ngcontent-%COMP%]{font-size:1.5rem}.login-form[_ngcontent-%COMP%]{padding:1.5rem}}"],data:{animation:[pe,se,de]},changeDetection:0})};export{L as default};
