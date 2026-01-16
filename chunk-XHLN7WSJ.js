import{a as me,b as fe}from"./chunk-LZWHF3IE.js";import{b as ce,c as ge}from"./chunk-YHGWYC2K.js";import{a as pe,b as se,d as de}from"./chunk-Q5HFPYVW.js";import"./chunk-NJ5QHTB6.js";import"./chunk-OL6EOTCO.js";import{c as Q,d as E,f as X,g as Z,j as ee,k as te,l as ne,p as re,r as oe,v as ie,w as ae}from"./chunk-5NEP5BWI.js";import{a as le,b as ue}from"./chunk-MO4NRYQI.js";import{a as Y}from"./chunk-S3FWETWA.js";import{Ga as W,Ha as c,Ka as _,Ma as $,fb as k,gb as S,l as U,mb as d,nb as B,wb as J,xb as K,y as H}from"./chunk-72AVHRIS.js";import{$ as G,$b as q,Ab as m,Mb as R,Ob as D,P as y,Pa as s,Pb as N,Q as v,Qb as T,S as x,U as p,Zb as V,ac as h,bb as f,bc as u,cb as M,dc as j,fb as C,gb as w,hb as A,ja as I,jc as P,ob as b,pa as g,rb as F,sb as O,xb as l,yb as i,zb as a}from"./chunk-XTNRL3Y3.js";var he=`
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
`;var Ee={root:()=>["p-progressspinner"],spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},be=(()=>{class e extends _{name="progressspinner";style=he;classes=Ee;static \u0275fac=(()=>{let t;return function(r){return(t||(t=g(e)))(r||e)}})();static \u0275prov=y({token:e,factory:e.\u0275fac})}return e})();var ye=new x("PROGRESSSPINNER_INSTANCE"),Ie=(()=>{class e extends S{$pcProgressSpinner=p(ye,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(d,{self:!0});styleClass;strokeWidth="2";fill="none";animationDuration="2s";ariaLabel;onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}_componentStyle=p(be);static \u0275fac=(()=>{let t;return function(r){return(t||(t=g(e)))(r||e)}})();static \u0275cmp=f({type:e,selectors:[["p-progressSpinner"],["p-progress-spinner"],["p-progressspinner"]],hostVars:5,hostBindings:function(n,r){n&2&&(b("aria-label",r.ariaLabel)("role","progressbar")("aria-busy",!0),h(r.cn(r.cx("root"),r.styleClass)))},inputs:{styleClass:"styleClass",strokeWidth:"strokeWidth",fill:"fill",animationDuration:"animationDuration",ariaLabel:"ariaLabel"},features:[P([be,{provide:ye,useExisting:e},{provide:k,useExisting:e}]),C([d]),w],decls:2,vars:10,consts:[["viewBox","25 25 50 50",3,"pBind"],["cx","50","cy","50","r","20","stroke-miterlimit","10",3,"pBind"]],template:function(n,r){n&1&&(G(),i(0,"svg",0),m(1,"circle",1),a()),n&2&&(h(r.cx("spin")),V("animation-duration",r.animationDuration),l("pBind",r.ptm("spin")),s(),h(r.cx("circle")),l("pBind",r.ptm("circle")),b("fill",r.fill)("stroke-width",r.strokeWidth))},dependencies:[U,c,d],encapsulation:2,changeDetection:0})}return e})(),xe=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=M({type:e});static \u0275inj=v({imports:[Ie,c,c]})}return e})();var Me=`
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
`;var Fe=["*"],Oe=`
    ${Me}

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
`,De={root:({instance:e})=>["p-inputgroup",{"p-inputgroup-fluid":e.fluid}]},Ce=(()=>{class e extends _{name="inputgroup";style=Oe;classes=De;static \u0275fac=(()=>{let t;return function(r){return(t||(t=g(e)))(r||e)}})();static \u0275prov=y({token:e,factory:e.\u0275fac})}return e})();var we=new x("INPUTGROUP_INSTANCE"),Ne=(()=>{class e extends S{_componentStyle=p(Ce);$pcInputGroup=p(we,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(d,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}styleClass;static \u0275fac=(()=>{let t;return function(r){return(t||(t=g(e)))(r||e)}})();static \u0275cmp=f({type:e,selectors:[["p-inputgroup"],["p-inputGroup"],["p-input-group"]],hostVars:2,hostBindings:function(n,r){n&2&&h(r.cn(r.cx("root"),r.styleClass))},inputs:{styleClass:"styleClass"},features:[P([Ce,{provide:we,useExisting:e},{provide:k,useExisting:e}]),C([d]),w],ngContentSelectors:Fe,decls:1,vars:0,template:function(n,r){n&1&&(N(),T(0))},dependencies:[B],encapsulation:2})}return e})(),Pe=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=M({type:e});static \u0275inj=v({imports:[Ne,c,c]})}return e})();var Te=["*"],Be={root:"p-inputgroupaddon"},_e=(()=>{class e extends _{name="inputgroupaddon";classes=Be;static \u0275fac=(()=>{let t;return function(r){return(t||(t=g(e)))(r||e)}})();static \u0275prov=y({token:e,factory:e.\u0275fac})}return e})(),ke=new x("INPUTGROUPADDON_INSTANCE"),Ae=(()=>{class e extends S{_componentStyle=p(_e);$pcInputGroupAddon=p(ke,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(d,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}style;styleClass;get hostStyle(){return this.style}static \u0275fac=(()=>{let t;return function(r){return(t||(t=g(e)))(r||e)}})();static \u0275cmp=f({type:e,selectors:[["p-inputgroup-addon"],["p-inputGroupAddon"]],hostVars:4,hostBindings:function(n,r){n&2&&(q(r.hostStyle),h(r.cn(r.cx("root"),r.styleClass)))},inputs:{style:"style",styleClass:"styleClass"},features:[P([_e,{provide:ke,useExisting:e},{provide:k,useExisting:e}]),C([d]),w],ngContentSelectors:Te,decls:1,vars:0,template:function(n,r){n&1&&(N(),T(0))},dependencies:[B],encapsulation:2})}return e})(),Se=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=M({type:e});static \u0275inj=v({imports:[Ae,c,c]})}return e})();function je(e,o){e&1&&(i(0,"div",17)(1,"div",18)(2,"div",19),m(3,"i",20),a()(),i(4,"h1",21),u(5,"Hostinger Workspace"),a(),i(6,"p",22),u(7,"Manager"),a()())}function Le(e,o){if(e&1&&(i(0,"div",4),m(1,"p-message",23),a()),e&2){let t=D();l("@shake",t.errorState()),s(),l("text",t.errorMessage())}}function ze(e,o){if(e&1&&(i(0,"small",11),u(1),a()),e&2){let t=D();s(),j(" ",t.getFieldError("email")," ")}}function Ge(e,o){if(e&1&&(i(0,"small",14),u(1),a()),e&2){let t=D();s(),j(" ",t.getFieldError("password")," ")}}function Re(e,o){e&1&&(i(0,"div",24)(1,"p",25),m(2,"i",26),u(3," Solo usuarios autorizados pueden acceder a esta aplicaci\xF3n. "),a()())}var z=class e{fb=p(re);authService=p(Y);router=p(H);loginForm=this.fb.group({email:["",[E.required,E.email]],password:["",[E.required,E.minLength(6)]]});isLoading=I(!1);errorMessage=I(null);errorState=I("default");async onSubmit(){if(this.loginForm.invalid){this.loginForm.markAllAsTouched();return}this.isLoading.set(!0),this.errorMessage.set(null);let{email:o,password:t}=this.loginForm.value;if(!o||!t){this.errorMessage.set("Email y contrase\xF1a son requeridos"),this.isLoading.set(!1);return}try{await this.authService.signIn(o,t),await this.router.navigate(["/dashboard"])}catch(n){this.errorState.set("error"),setTimeout(()=>this.errorState.set("default"),500),this.handleAuthError(n)}finally{this.isLoading.set(!1)}}handleAuthError(o){if(o instanceof $)switch(o.code){case"auth/user-not-found":case"auth/wrong-password":case"auth/invalid-credential":this.errorMessage.set("Email o contrase\xF1a incorrectos. Por favor, verifica tus credenciales.");break;case"auth/user-disabled":this.errorMessage.set("Esta cuenta ha sido deshabilitada. Contacta al administrador.");break;case"auth/too-many-requests":this.errorMessage.set("Demasiados intentos fallidos. Por favor, intenta m\xE1s tarde.");break;case"auth/network-request-failed":this.errorMessage.set("Error de conexi\xF3n. Verifica tu conexi\xF3n a internet.");break;case"auth/invalid-email":this.errorMessage.set("El formato del email no es v\xE1lido.");break;default:this.errorMessage.set("Error al iniciar sesi\xF3n. Por favor, intenta de nuevo."),console.error("Auth error:",o)}else this.errorMessage.set("Error inesperado. Por favor, intenta de nuevo."),console.error("Unexpected error:",o)}hasFieldError(o){let t=this.loginForm.get(o);return!!(t?.invalid&&t?.touched)}getFieldError(o){let t=this.loginForm.get(o);return!t||!t.errors||!t.touched?"":t.errors.required?"Este campo es obligatorio":t.errors.email?"Ingresa un email v\xE1lido":t.errors.minlength?"La contrase\xF1a debe tener al menos 6 caracteres":""}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=f({type:e,selectors:[["app-login"]],decls:26,vars:17,consts:[["href","#main-content",1,"skip-link"],["id","main-content","role","main",1,"login-container"],[1,"login-card-wrapper"],["pTemplate","header"],["role","alert","aria-live","assertive"],["aria-labelledby","login-form-title",1,"login-form",3,"ngSubmit","formGroup"],["id","login-form-title",1,"sr-only"],[1,"field"],["for","email",1,"field-label"],["aria-label","requerido",1,"required-indicator"],["pInputText","","id","email","formControlName","email","type","email","placeholder","usuario@ejemplo.com","fluid","","autocomplete","email","aria-required","true",3,"invalid"],["id","email-error","role","alert",1,"field-error","error-message"],["for","password",1,"field-label"],["formControlName","password","inputId","password","placeholder","Ingresa tu contrase\xF1a","fluid","","autocomplete","current-password","aria-required","true",3,"toggleMask","feedback","invalid"],["id","password-error","role","alert",1,"field-error","error-message"],["type","submit","label","Iniciar Sesi\xF3n","icon","pi pi-sign-in","severity","primary","fluid","",1,"hover-lift",3,"loading","disabled"],["pTemplate","footer"],[1,"card-header"],[1,"logo-container"],[1,"logo-icon"],[1,"pi","pi-cloud",2,"font-size","1.5rem"],[1,"app-title"],[1,"app-subtitle"],["severity","error",3,"text"],[1,"card-footer"],[1,"footer-note"],["aria-hidden","true",1,"pi","pi-info-circle"]],template:function(t,n){t&1&&(i(0,"a",0),u(1,"Saltar al contenido principal"),a(),i(2,"div",1)(3,"div",2)(4,"p-card"),A(5,je,8,0,"ng-template",3),F(6,Le,2,2,"div",4),i(7,"form",5),R("ngSubmit",function(){return n.onSubmit()}),i(8,"h2",6),u(9,"Formulario de inicio de sesi\xF3n"),a(),i(10,"div",7)(11,"label",8),u(12," Email "),i(13,"span",9),u(14,"*"),a()(),m(15,"input",10),F(16,ze,2,1,"small",11),a(),i(17,"div",7)(18,"label",12),u(19," Contrase\xF1a "),i(20,"span",9),u(21,"*"),a()(),m(22,"p-password",13),F(23,Ge,2,1,"small",14),a(),m(24,"p-button",15),a(),A(25,Re,4,0,"ng-template",16),a()()()),t&2&&(s(3),l("@fadeIn",void 0),s(),l("@slideUp",void 0),s(2),O(n.errorMessage()?6:-1),s(),l("formGroup",n.loginForm),s(8),l("invalid",n.hasFieldError("email")),b("aria-invalid",n.hasFieldError("email"))("aria-describedby",n.hasFieldError("email")?"email-error":null),s(),O(n.hasFieldError("email")?16:-1),s(6),l("toggleMask",!0)("feedback",!1)("invalid",n.hasFieldError("password")),b("aria-invalid",n.hasFieldError("password"))("aria-describedby",n.hasFieldError("password")?"password-error":null),s(),O(n.hasFieldError("password")?23:-1),s(),l("loading",n.isLoading())("disabled",n.loginForm.invalid||n.isLoading()),b("aria-busy",n.isLoading()))},dependencies:[oe,ee,Q,X,Z,ne,te,ue,le,W,ae,ie,ge,ce,K,J,fe,me,xe,Pe,Se],styles:[`.login-container[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;min-height:100vh;background:radial-gradient(circle at 15% 50%,rgba(226,232,240,.8),transparent 25%),radial-gradient(circle at 85% 30%,rgba(229,231,235,.8),transparent 25%),linear-gradient(135deg,#f9fafb,#f3f4f6);padding:1rem;font-family:Inter,system-ui,-apple-system,sans-serif;overflow:hidden;position:relative}.login-container[_ngcontent-%COMP%]:before{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");pointer-events:none;z-index:0}.login-card-wrapper[_ngcontent-%COMP%]{width:100%;max-width:440px;position:relative;z-index:10}[_nghost-%COMP%]     .p-card{background:#ffffffbf;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.8);box-shadow:0 4px 6px -1px #0000000d,0 10px 15px -3px #0000000d,0 0 0 1px #00000005;border-radius:20px;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease}[_nghost-%COMP%]     .p-card:hover{box-shadow:0 10px 25px -5px #0000000d,0 8px 10px -6px #00000003}[_nghost-%COMP%]     .p-card .p-card-body{padding:0}[_nghost-%COMP%]     .p-card .p-card-content{padding:0}.card-header[_ngcontent-%COMP%]{text-align:center;padding:2rem 2rem .5rem;position:relative;border:none;background:transparent}.logo-container[_ngcontent-%COMP%]{display:flex;justify-content:center;margin-bottom:1rem}.logo-container[_ngcontent-%COMP%]   .logo-icon[_ngcontent-%COMP%]{width:48px;height:48px;background:linear-gradient(135deg,#1f2937,#374151);color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;box-shadow:0 10px 20px -5px #1f29374d;position:relative}.logo-container[_ngcontent-%COMP%]   .logo-icon[_ngcontent-%COMP%]:after{content:"";position:absolute;inset:0;border-radius:12px;background:linear-gradient(135deg,rgba(255,255,255,.4) 0%,transparent 50%);pointer-events:none}.app-title[_ngcontent-%COMP%]{margin:0;font-size:1.5rem;font-weight:800;letter-spacing:-.04em;color:#111827;line-height:1.2}.app-subtitle[_ngcontent-%COMP%]{margin:.25rem 0 0;font-size:.875rem;color:#6b7280;font-weight:500}.login-form[_ngcontent-%COMP%]{padding:1.5rem 2.5rem}.field[_ngcontent-%COMP%]{margin-bottom:1rem}.field-label[_ngcontent-%COMP%]{display:block;margin-bottom:.35rem;font-weight:600;color:#111827;font-size:.875rem;letter-spacing:-.01em}[_nghost-%COMP%]     .p-inputtext{background-color:#fff9;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;font-size:.95rem;color:#111827;transition:all .2s ease;width:100%}[_nghost-%COMP%]     .p-inputtext:enabled:focus{background-color:#fff;border-color:#111827;box-shadow:0 0 0 2px #1f29371a}[_nghost-%COMP%]     .p-inputtext:enabled:hover{border-color:#9ca3af}[_nghost-%COMP%]     .p-inputtext::placeholder{color:#9ca3af}[_nghost-%COMP%]     .p-inputtext.ng-invalid.ng-dirty{border-color:#ef4444}[_nghost-%COMP%]     .p-inputtext.ng-invalid.ng-dirty:focus{box-shadow:0 0 0 2px #ef44441a}[_nghost-%COMP%]     .p-password-input{width:100%}[_nghost-%COMP%]     .p-password{width:100%}.field-error[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.35rem;margin-top:.25rem;color:#ef4444;font-size:.75rem;font-weight:500}.field-error[_ngcontent-%COMP%]:before{content:"\\e90b";font-family:primeicons}[_nghost-%COMP%]     .p-button{border-radius:10px;padding:.875rem;font-weight:600;font-size:.95rem;background:#1f2937;border:1px solid #1f2937;box-shadow:0 4px 6px -1px #0000001a;transition:all .2s}[_nghost-%COMP%]     .p-button:enabled:hover{background:#283547;border-color:#283547;transform:translateY(-1px);box-shadow:0 6px 12px -2px #00000026}[_nghost-%COMP%]     .p-button:enabled:active{transform:translateY(0)}[_nghost-%COMP%]     .p-button.p-disabled{opacity:.7;background:#e5e7eb;border-color:#e5e7eb;color:#9ca3af}.card-footer[_ngcontent-%COMP%]{padding:1rem 2rem;background-color:#f9fafb80;border-top:1px solid rgba(0,0,0,.04);text-align:center}.footer-note[_ngcontent-%COMP%]{margin:0;font-size:.8rem;color:#6b7280;display:flex;align-items:center;justify-content:center;gap:.5rem;opacity:.8}.footer-note[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{font-size:.9rem}@media(max-width:640px){.login-card-wrapper[_ngcontent-%COMP%]{max-width:100%;margin:1rem}.app-title[_ngcontent-%COMP%]{font-size:1.5rem}.login-form[_ngcontent-%COMP%]{padding:1.5rem}}.login-card-wrapper[_ngcontent-%COMP%]{width:100%;max-width:420px}.card-header[_ngcontent-%COMP%]{text-align:center;padding:2.5rem 2rem 1.5rem;background:#fff;border-bottom:1px solid #f0f0f0}.app-title[_ngcontent-%COMP%]{margin:0;font-size:1.625rem;font-weight:700;letter-spacing:-.5px;color:#1a1a1a}.app-subtitle[_ngcontent-%COMP%]{margin:.625rem 0 0;font-size:.9rem;color:#6b7280;font-weight:400}.login-form[_ngcontent-%COMP%]{padding:2rem}.field[_ngcontent-%COMP%]{margin-bottom:1.25rem}.field[_ngcontent-%COMP%]:last-of-type{margin-bottom:1.75rem}.field-label[_ngcontent-%COMP%]{display:block;margin-bottom:.5rem;font-weight:500;color:#374151;font-size:.875rem}.field-error[_ngcontent-%COMP%]{display:block;margin-top:.375rem;color:#374151;font-size:.8125rem}.card-footer[_ngcontent-%COMP%]{padding:1.25rem 2rem;background-color:#fafafa;text-align:center;border-top:1px solid #f0f0f0}.footer-note[_ngcontent-%COMP%]{margin:0;font-size:.8125rem;color:#6b7280;display:flex;align-items:center;justify-content:center;gap:.5rem}.footer-note[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{font-size:.9375rem;color:#9ca3af}@media(max-width:768px){.login-card-wrapper[_ngcontent-%COMP%]{max-width:100%}.card-header[_ngcontent-%COMP%]{padding:2rem 1.5rem 1.25rem}.app-title[_ngcontent-%COMP%]{font-size:1.5rem}.login-form[_ngcontent-%COMP%]{padding:1.5rem}}`],data:{animation:[pe,se,de]},changeDetection:0})};export{z as default};
