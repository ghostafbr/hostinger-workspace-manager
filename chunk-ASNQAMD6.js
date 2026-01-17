import{a as ge,b as me}from"./chunk-KQXQCVSM.js";import{b as ue,c as fe}from"./chunk-DUHGVNQK.js";import{a as pe,b as se,d as de}from"./chunk-Q5HFPYVW.js";import"./chunk-46UKYMVD.js";import"./chunk-OL6EOTCO.js";import{c as X,d as I,f as Y,g as Z,j as ee,k as re,l as ne,p as te,r as oe,v as ie,w as ae}from"./chunk-Z4BNMZT3.js";import{a as le,b as ce}from"./chunk-SPDGIFFF.js";import{a as J}from"./chunk-TOC7PNXQ.js";import{a as $}from"./chunk-JNP63KUK.js";import{Ma as W,Na as u,Qa as S,Sa as E,Ta as F,Za as d,_a as O,gb as K,hb as Q,m as q,z as H}from"./chunk-WQRABBEY.js";import{$ as R,$b as V,Ab as g,Mb as z,Ob as N,P as v,Pa as s,Pb as T,Q as y,Qb as B,S as x,U as p,Zb as U,ac as b,bb as m,bc as c,cb as w,dc as j,fb as M,gb as C,hb as A,ja as P,jc as k,ob as h,pa as f,rb as _,sb as D,xb as l,yb as i,zb as a}from"./chunk-XTNRL3Y3.js";var be=`
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
`;var Ie={root:()=>["p-progressspinner"],spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},he=(()=>{class e extends S{name="progressspinner";style=be;classes=Ie;static \u0275fac=(()=>{let r;return function(t){return(r||(r=f(e)))(t||e)}})();static \u0275prov=v({token:e,factory:e.\u0275fac})}return e})();var ve=new x("PROGRESSSPINNER_INSTANCE"),Pe=(()=>{class e extends F{$pcProgressSpinner=p(ve,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(d,{self:!0});styleClass;strokeWidth="2";fill="none";animationDuration="2s";ariaLabel;onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}_componentStyle=p(he);static \u0275fac=(()=>{let r;return function(t){return(r||(r=f(e)))(t||e)}})();static \u0275cmp=m({type:e,selectors:[["p-progressSpinner"],["p-progress-spinner"],["p-progressspinner"]],hostVars:5,hostBindings:function(n,t){n&2&&(h("aria-label",t.ariaLabel)("role","progressbar")("aria-busy",!0),b(t.cn(t.cx("root"),t.styleClass)))},inputs:{styleClass:"styleClass",strokeWidth:"strokeWidth",fill:"fill",animationDuration:"animationDuration",ariaLabel:"ariaLabel"},features:[k([he,{provide:ve,useExisting:e},{provide:E,useExisting:e}]),M([d]),C],decls:2,vars:10,consts:[["viewBox","25 25 50 50",3,"pBind"],["cx","50","cy","50","r","20","stroke-miterlimit","10",3,"pBind"]],template:function(n,t){n&1&&(R(),i(0,"svg",0),g(1,"circle",1),a()),n&2&&(b(t.cx("spin")),U("animation-duration",t.animationDuration),l("pBind",t.ptm("spin")),s(),b(t.cx("circle")),l("pBind",t.ptm("circle")),h("fill",t.fill)("stroke-width",t.strokeWidth))},dependencies:[q,u,d],encapsulation:2,changeDetection:0})}return e})(),xe=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=w({type:e});static \u0275inj=y({imports:[Pe,u,u]})}return e})();var we=`
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
`;var _e=["*"],De=`
    ${we}

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
`,Ne={root:({instance:e})=>["p-inputgroup",{"p-inputgroup-fluid":e.fluid}]},Me=(()=>{class e extends S{name="inputgroup";style=De;classes=Ne;static \u0275fac=(()=>{let r;return function(t){return(r||(r=f(e)))(t||e)}})();static \u0275prov=v({token:e,factory:e.\u0275fac})}return e})();var Ce=new x("INPUTGROUP_INSTANCE"),Te=(()=>{class e extends F{_componentStyle=p(Me);$pcInputGroup=p(Ce,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(d,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}styleClass;static \u0275fac=(()=>{let r;return function(t){return(r||(r=f(e)))(t||e)}})();static \u0275cmp=m({type:e,selectors:[["p-inputgroup"],["p-inputGroup"],["p-input-group"]],hostVars:2,hostBindings:function(n,t){n&2&&b(t.cn(t.cx("root"),t.styleClass))},inputs:{styleClass:"styleClass"},features:[k([Me,{provide:Ce,useExisting:e},{provide:E,useExisting:e}]),M([d]),C],ngContentSelectors:_e,decls:1,vars:0,template:function(n,t){n&1&&(T(),B(0))},dependencies:[O],encapsulation:2})}return e})(),ke=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=w({type:e});static \u0275inj=y({imports:[Te,u,u]})}return e})();var Be=["*"],Oe={root:"p-inputgroupaddon"},Se=(()=>{class e extends S{name="inputgroupaddon";classes=Oe;static \u0275fac=(()=>{let r;return function(t){return(r||(r=f(e)))(t||e)}})();static \u0275prov=v({token:e,factory:e.\u0275fac})}return e})(),Ee=new x("INPUTGROUPADDON_INSTANCE"),Ae=(()=>{class e extends F{_componentStyle=p(Se);$pcInputGroupAddon=p(Ee,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(d,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}style;styleClass;get hostStyle(){return this.style}static \u0275fac=(()=>{let r;return function(t){return(r||(r=f(e)))(t||e)}})();static \u0275cmp=m({type:e,selectors:[["p-inputgroup-addon"],["p-inputGroupAddon"]],hostVars:4,hostBindings:function(n,t){n&2&&(V(t.hostStyle),b(t.cn(t.cx("root"),t.styleClass)))},inputs:{style:"style",styleClass:"styleClass"},features:[k([Se,{provide:Ee,useExisting:e},{provide:E,useExisting:e}]),M([d]),C],ngContentSelectors:Be,decls:1,vars:0,template:function(n,t){n&1&&(T(),B(0))},dependencies:[O],encapsulation:2})}return e})(),Fe=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=w({type:e});static \u0275inj=y({imports:[Ae,u,u]})}return e})();function je(e,o){e&1&&(i(0,"div",17)(1,"div",18)(2,"div",19),g(3,"i",20),a()(),i(4,"h1",21),c(5,"Hostinger Workspace"),a(),i(6,"p",22),c(7,"Manager"),a()())}function Le(e,o){if(e&1&&(i(0,"div",4),g(1,"p-message",23),a()),e&2){let r=N();l("@shake",r.errorState()),s(),l("text",r.errorMessage())}}function Ge(e,o){if(e&1&&(i(0,"small",11),c(1),a()),e&2){let r=N();s(),j(" ",r.getFieldError("email")," ")}}function Re(e,o){if(e&1&&(i(0,"small",14),c(1),a()),e&2){let r=N();s(),j(" ",r.getFieldError("password")," ")}}function ze(e,o){e&1&&(i(0,"div",24)(1,"p",25),g(2,"i",26),c(3," Solo usuarios autorizados pueden acceder a esta aplicaci\xF3n. "),a()())}var G=class e{fb=p(te);authService=p(J);router=p(H);loginForm=this.fb.group({email:["",[I.required,I.email]],password:["",[I.required,I.minLength(6)]]});isLoading=P(!1);errorMessage=P(null);errorState=P("default");async onSubmit(){if(this.loginForm.invalid){this.loginForm.markAllAsTouched();return}this.isLoading.set(!0),this.errorMessage.set(null);let{email:o,password:r}=this.loginForm.value;if(!o||!r){this.errorMessage.set("Email y contrase\xF1a son requeridos"),this.isLoading.set(!1);return}try{await this.authService.signIn(o,r),await this.router.navigate(["/dashboard"])}catch(n){this.errorState.set("error"),setTimeout(()=>this.errorState.set("default"),500),this.handleAuthError(n)}finally{this.isLoading.set(!1)}}handleAuthError(o){if(o instanceof $)switch(o.code){case"auth/user-not-found":case"auth/wrong-password":case"auth/invalid-credential":this.errorMessage.set("Email o contrase\xF1a incorrectos. Por favor, verifica tus credenciales.");break;case"auth/user-disabled":this.errorMessage.set("Esta cuenta ha sido deshabilitada. Contacta al administrador.");break;case"auth/too-many-requests":this.errorMessage.set("Demasiados intentos fallidos. Por favor, intenta m\xE1s tarde.");break;case"auth/network-request-failed":this.errorMessage.set("Error de conexi\xF3n. Verifica tu conexi\xF3n a internet.");break;case"auth/invalid-email":this.errorMessage.set("El formato del email no es v\xE1lido.");break;default:this.errorMessage.set("Error al iniciar sesi\xF3n. Por favor, intenta de nuevo."),console.error("Auth error:",o)}else this.errorMessage.set("Error inesperado. Por favor, intenta de nuevo."),console.error("Unexpected error:",o)}hasFieldError(o){let r=this.loginForm.get(o);return!!(r?.invalid&&r?.touched)}getFieldError(o){let r=this.loginForm.get(o);return!r||!r.errors||!r.touched?"":r.errors.required?"Este campo es obligatorio":r.errors.email?"Ingresa un email v\xE1lido":r.errors.minlength?"La contrase\xF1a debe tener al menos 6 caracteres":""}static \u0275fac=function(r){return new(r||e)};static \u0275cmp=m({type:e,selectors:[["app-login"]],decls:26,vars:17,consts:[["href","#main-content",1,"skip-link"],["id","main-content","role","main",1,"login-container"],[1,"login-card-wrapper"],["pTemplate","header"],["role","alert","aria-live","assertive"],["aria-labelledby","login-form-title",1,"login-form",3,"ngSubmit","formGroup"],["id","login-form-title",1,"sr-only"],[1,"field"],["for","email",1,"field-label"],["aria-label","requerido",1,"required-indicator"],["pInputText","","id","email","formControlName","email","type","email","placeholder","usuario@ejemplo.com","fluid","","autocomplete","email","aria-required","true",3,"invalid"],["id","email-error","role","alert",1,"field-error","error-message"],["for","password",1,"field-label"],["formControlName","password","inputId","password","placeholder","Ingresa tu contrase\xF1a","fluid","","autocomplete","current-password","aria-required","true",3,"toggleMask","feedback","invalid"],["id","password-error","role","alert",1,"field-error","error-message"],["type","submit","label","Iniciar Sesi\xF3n","icon","pi pi-sign-in","severity","primary","fluid","",1,"hover-lift",3,"loading","disabled"],["pTemplate","footer"],[1,"card-header"],[1,"logo-container"],[1,"logo-icon"],[1,"pi","pi-cloud",2,"font-size","1.5rem"],[1,"app-title"],[1,"app-subtitle"],["severity","error",3,"text"],[1,"card-footer"],[1,"footer-note"],["aria-hidden","true",1,"pi","pi-info-circle"]],template:function(r,n){r&1&&(i(0,"a",0),c(1,"Saltar al contenido principal"),a(),i(2,"div",1)(3,"div",2)(4,"p-card"),A(5,je,8,0,"ng-template",3),_(6,Le,2,2,"div",4),i(7,"form",5),z("ngSubmit",function(){return n.onSubmit()}),i(8,"h2",6),c(9,"Formulario de inicio de sesi\xF3n"),a(),i(10,"div",7)(11,"label",8),c(12," Email "),i(13,"span",9),c(14,"*"),a()(),g(15,"input",10),_(16,Ge,2,1,"small",11),a(),i(17,"div",7)(18,"label",12),c(19," Contrase\xF1a "),i(20,"span",9),c(21,"*"),a()(),g(22,"p-password",13),_(23,Re,2,1,"small",14),a(),g(24,"p-button",15),a(),A(25,ze,4,0,"ng-template",16),a()()()),r&2&&(s(3),l("@fadeIn",void 0),s(),l("@slideUp",void 0),s(2),D(n.errorMessage()?6:-1),s(),l("formGroup",n.loginForm),s(8),l("invalid",n.hasFieldError("email")),h("aria-invalid",n.hasFieldError("email"))("aria-describedby",n.hasFieldError("email")?"email-error":null),s(),D(n.hasFieldError("email")?16:-1),s(6),l("toggleMask",!0)("feedback",!1)("invalid",n.hasFieldError("password")),h("aria-invalid",n.hasFieldError("password"))("aria-describedby",n.hasFieldError("password")?"password-error":null),s(),D(n.hasFieldError("password")?23:-1),s(),l("loading",n.isLoading())("disabled",n.loginForm.invalid||n.isLoading()),h("aria-busy",n.isLoading()))},dependencies:[oe,ee,X,Y,Z,ne,re,ce,le,W,ae,ie,fe,ue,Q,K,me,ge,xe,ke,Fe],styles:[`[_ngcontent-%COMP%]:root{--color-brand-900: #111827;--color-brand-800: #1f2937;--color-brand-700: #374151;--color-brand-600: #4b5563;--color-brand-500: #6b7280;--color-brand-400: #9ca3af;--color-brand-300: #d1d5db;--color-brand-200: #e5e7eb;--color-brand-100: #f3f4f6;--color-brand-50: #f9fafb;--color-white: #ffffff;--gray-900: var(--color-brand-900);--gray-800: var(--color-brand-800);--gray-700: var(--color-brand-700);--gray-600: var(--color-brand-600);--gray-500: var(--color-brand-500);--gray-400: var(--color-brand-400);--gray-300: var(--color-brand-300);--gray-200: var(--color-brand-200);--gray-100: var(--color-brand-100);--gray-50: var(--color-brand-50);--primary-color: var(--color-brand-800);--primary-color-text: var(--color-white);--primary-hover: var(--color-brand-700);--primary-500: var(--color-brand-800);--primary-rgb: 31, 41, 55;--primary-500-rgb: 31, 41, 55;--text-main: var(--primary-color);--text-secondary: var(--color-brand-700);--text-color: var(--text-main);--text-color-secondary: var(--text-secondary);--border-color: var(--color-brand-300);--surface-ground: var(--color-brand-50);--surface-card: var(--color-white);--surface-overlay: var(--color-white);--surface-0: #ffffff;--surface-50: var(--color-brand-50);--surface-100: var(--color-brand-100);--surface-200: var(--color-brand-200);--surface-300: var(--color-brand-300);--surface-400: var(--color-brand-400);--surface-500: var(--color-brand-500);--surface-600: var(--color-brand-600);--surface-700: var(--color-brand-700);--surface-800: var(--color-brand-800);--surface-900: var(--color-brand-900);--glass-bg: rgba(255, 255, 255, .6);--glass-border: rgba(255, 255, 255, .6);--glass-blur: 16px;--color-success-bg: #ecfdf5;--color-success-text: #065f46;--color-success-Main: #10b981;--green-50: #ecfdf5;--green-100: #d1fae5;--green-200: #a7f3d0;--green-300: #6ee7b7;--green-400: #34d399;--green-500: #10b981;--green-600: #059669;--green-700: #047857;--green-800: #065f46;--green-900: #064e3b;--color-warning-bg: #fffbeb;--color-warning-text: #92400e;--color-warning-main: #f59e0b;--orange-50: #fff7ed;--orange-100: #ffedd5;--orange-200: #fed7aa;--orange-300: #fdba74;--orange-400: #fb923c;--orange-500: #f97316;--orange-600: #ea580c;--orange-700: #c2410c;--yellow-500: #eab308;--color-danger-bg: #fef2f2;--color-danger-text: #991b1b;--color-danger-main: #ef4444;--red-50: #fef2f2;--red-100: #fee2e2;--red-200: #fecaca;--red-300: #fca5a5;--red-400: #f87171;--red-500: #ef4444;--red-600: #dc2626;--red-700: #b91c1c;--red-800: #991b1b;--red-900: #7f1d1d;--color-info-bg: #eff6ff;--color-info-text: #1e40af;--color-info-main: #3b82f6;--blue-50: #eff6ff;--blue-100: #dbeafe;--blue-200: #bfdbfe;--blue-300: #93c5fd;--blue-400: #60a5fa;--blue-500: #3b82f6;--blue-600: #2563eb;--blue-700: #1d4ed8;--blue-800: #1e40af;--blue-900: #1e3a8a;--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;--font-size-base: 16px;--font-weight-regular: 400;--font-weight-medium: 500;--font-weight-bold: 700;--border-radius-sm: 6px;--border-radius-md: 8px;--border-radius-lg: 12px;--border-radius-xl: 20px;--border-radius-xxl: 24px;--border-radius-round: 999px;--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, .05);--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -1px rgba(0, 0, 0, .06);--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, .1), 0 4px 6px -2px rgba(0, 0, 0, .05);--shadow-card: 0 4px 20px rgba(0, 0, 0, .03);--shadow-card-hover: 0 12px 30px rgba(0, 0, 0, .06);--shadow-floating: 0 8px 32px rgba(0, 0, 0, .03), 0 2px 8px rgba(0, 0, 0, .02)}.login-container[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;min-height:100vh;background:radial-gradient(circle at 15% 50%,rgba(226,232,240,.8),transparent 25%),radial-gradient(circle at 85% 30%,rgba(229,231,235,.8),transparent 25%),linear-gradient(135deg,#f9fafb,#f3f4f6);padding:1rem;font-family:var(--font-family);overflow:hidden;position:relative}.login-container[_ngcontent-%COMP%]:before{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");pointer-events:none;z-index:0}.login-card-wrapper[_ngcontent-%COMP%]{width:100%;max-width:440px;position:relative;z-index:10}[_nghost-%COMP%]     .p-card{background:#ffffffbf;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.8);box-shadow:var(--shadow-xl);border-radius:20px;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease}[_nghost-%COMP%]     .p-card:hover{box-shadow:0 10px 25px -5px #0000000d,0 8px 10px -6px #00000003}[_nghost-%COMP%]     .p-card .p-card-body, [_nghost-%COMP%]     .p-card .p-card-content{padding:0}.card-header[_ngcontent-%COMP%]{text-align:center;padding:2rem 2rem .5rem;position:relative;border:none;background:transparent}.logo-container[_ngcontent-%COMP%]{display:flex;justify-content:center;margin-bottom:1rem}.logo-container[_ngcontent-%COMP%]   .logo-icon[_ngcontent-%COMP%]{width:48px;height:48px;background:linear-gradient(135deg,#1f2937,#374151);color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;box-shadow:0 10px 20px -5px #1f29374d;position:relative}.logo-container[_ngcontent-%COMP%]   .logo-icon[_ngcontent-%COMP%]:after{content:"";position:absolute;inset:0;border-radius:12px;background:linear-gradient(135deg,rgba(255,255,255,.4) 0%,transparent 50%);pointer-events:none}.app-title[_ngcontent-%COMP%]{margin:0;font-size:1.5rem;font-weight:800;letter-spacing:-.04em;color:var(--text-main);line-height:1.2}.app-subtitle[_ngcontent-%COMP%]{margin:.25rem 0 0;font-size:.875rem;color:var(--text-secondary);font-weight:500}.login-form[_ngcontent-%COMP%]{padding:1.5rem 2.5rem}.field[_ngcontent-%COMP%]{margin-bottom:1rem}.field-label[_ngcontent-%COMP%]{display:block;margin-bottom:.35rem;font-weight:600;color:var(--text-main);font-size:.875rem;letter-spacing:-.01em}[_nghost-%COMP%]     .p-inputtext{background-color:#fff9;border:1px solid var(--border-color);border-radius:10px;padding:.75rem 1rem;font-size:.95rem;color:var(--text-main);transition:all .2s ease;width:100%}[_nghost-%COMP%]     .p-inputtext:enabled:focus{background-color:#fff;border-color:var(--text-main);box-shadow:0 0 0 2px #1f29371a}[_nghost-%COMP%]     .p-inputtext:enabled:hover{border-color:#9ca3af}[_nghost-%COMP%]     .p-inputtext::placeholder{color:#9ca3af}.card-footer[_ngcontent-%COMP%]{padding:1rem 2rem;background-color:#f9fafb80;border-top:1px solid rgba(0,0,0,.04);text-align:center}.footer-note[_ngcontent-%COMP%]{margin:0;font-size:.8rem;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;gap:.5rem;opacity:.8}.footer-note[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{font-size:.9rem}`],data:{animation:[pe,se,de]},changeDetection:0})};export{G as default};
