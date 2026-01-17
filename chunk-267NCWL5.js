import{b as fe,c as ge}from"./chunk-DUHGVNQK.js";import{b as ve,c as he}from"./chunk-FYGEUYEJ.js";import{h as ce,i as pe}from"./chunk-6BTVTWSQ.js";import{c as Q,d as m,e as Z,f as ee,g as te,j as ie,k as ae,l as ne,p as oe,r as re,s as se,v as le,w as de}from"./chunk-Z4BNMZT3.js";import{b as U}from"./chunk-47X5BFEM.js";import"./chunk-JUILAC2W.js";import{a as me,b as ue}from"./chunk-SPDGIFFF.js";import"./chunk-TOC7PNXQ.js";import"./chunk-JNP63KUK.js";import{Ia as E,Ma as q,Qa as G,Sa as X,Za as w,bb as K,gb as Y,hb as J,x as j,z as $}from"./chunk-WQRABBEY.js";import{Ab as p,Ac as H,Dc as h,Hb as O,Lc as y,Mb as g,Ob as v,P as _,Pa as o,Q as T,S,U as l,Z as M,_ as I,_b as k,ac as L,bb as D,bc as s,cb as z,cc as B,db as W,dc as x,ea as P,fb as A,gb as V,hb as R,jc as b,ma as C,pa as N,rb as u,sb as f,xb as c,yb as n,zb as r}from"./chunk-XTNRL3Y3.js";var ke=`
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`;var Fe=`
    ${ke}

    /* For PrimeNG */
    .p-textarea.ng-invalid.ng-dirty {
        border-color: dt('textarea.invalid.border.color');
    }
    .p-textarea.ng-invalid.ng-dirty::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }
`,_e={root:({instance:e})=>["p-textarea p-component",{"p-filled":e.$filled(),"p-textarea-resizable ":e.autoResize,"p-variant-filled":e.$variant()==="filled","p-textarea-fluid":e.hasFluid,"p-inputfield-sm p-textarea-sm":e.pSize==="small","p-textarea-lg p-inputfield-lg":e.pSize==="large","p-invalid":e.invalid()}]},xe=(()=>{class e extends G{name="textarea";style=Fe;classes=_e;static \u0275fac=(()=>{let t;return function(d){return(t||(t=N(e)))(d||e)}})();static \u0275prov=_({token:e,factory:e.\u0275fac})}return e})();var be=new S("TEXTAREA_INSTANCE"),ye=(()=>{class e extends se{bindDirectiveInstance=l(w,{self:!0});$pcTextarea=l(be,{optional:!0,skipSelf:!0})??void 0;pTextareaPT=h();pTextareaUnstyled=h();autoResize;pSize;variant=h();fluid=h(void 0,{transform:y});invalid=h(void 0,{transform:y});$variant=H(()=>this.variant()||this.config.inputStyle()||this.config.inputVariant());onResize=new P;ngControlSubscription;_componentStyle=l(xe);ngControl=l(Z,{optional:!0,self:!0});pcFluid=l(K,{optional:!0,host:!0,skipSelf:!0});get hasFluid(){return this.fluid()??!!this.pcFluid}constructor(){super(),C(()=>{let t=this.pTextareaPT();t&&this.directivePT.set(t)}),C(()=>{this.pTextareaUnstyled()&&this.directiveUnstyled.set(this.pTextareaUnstyled())})}onInit(){this.ngControl&&(this.ngControlSubscription=this.ngControl.valueChanges.subscribe(()=>{this.updateState()}))}onAfterViewInit(){this.autoResize&&this.resize(),this.cd.detectChanges()}onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"])),this.autoResize&&this.resize(),this.writeModelValue(this.ngControl?.value??this.el.nativeElement.value)}onInput(t){this.writeModelValue(t.target?.value),this.updateState()}resize(t){this.el.nativeElement.style.height="auto",this.el.nativeElement.style.height=this.el.nativeElement.scrollHeight+"px",parseFloat(this.el.nativeElement.style.height)>=parseFloat(this.el.nativeElement.style.maxHeight)?(this.el.nativeElement.style.overflowY="scroll",this.el.nativeElement.style.height=this.el.nativeElement.style.maxHeight):this.el.nativeElement.style.overflow="hidden",this.onResize.emit(t||{})}updateState(){this.autoResize&&this.resize()}onDestroy(){this.ngControlSubscription&&this.ngControlSubscription.unsubscribe()}static \u0275fac=function(i){return new(i||e)};static \u0275dir=W({type:e,selectors:[["","pTextarea",""],["","pInputTextarea",""]],hostVars:2,hostBindings:function(i,d){i&1&&g("input",function(Ce){return d.onInput(Ce)}),i&2&&L(d.cx("root"))},inputs:{pTextareaPT:[1,"pTextareaPT"],pTextareaUnstyled:[1,"pTextareaUnstyled"],autoResize:[2,"autoResize","autoResize",y],pSize:"pSize",variant:[1,"variant"],fluid:[1,"fluid"],invalid:[1,"invalid"]},outputs:{onResize:"onResize"},features:[b([xe,{provide:be,useExisting:e},{provide:X,useExisting:e}]),A([w]),V]})}return e})(),we=(()=>{class e{static \u0275fac=function(i){return new(i||e)};static \u0275mod=z({type:e});static \u0275inj=T({})}return e})();function Se(e,a){if(e&1&&(n(0,"div",17)(1,"h2"),s(2),r()()),e&2){let t=v();o(2),B(t.isEditMode?"Editar Workspace":"Nuevo Workspace")}}function Me(e,a){if(e&1&&(n(0,"small",7),s(1),r()),e&2){let t=v();o(),x(" ",t.getErrorMessage("name")," ")}}function Ie(e,a){e&1&&(n(0,"span",7),s(1,"*"),r())}function Pe(e,a){if(e&1&&(n(0,"small",7),s(1),r()),e&2){let t=v(2);o(),x(" ",t.getErrorMessage("token")," ")}}function Ne(e,a){if(e&1&&(n(0,"div"),p(1,"p-password",18),u(2,Pe,2,1,"small",7),n(3,"small",19),p(4,"i",20),s(5," El token se cifra y almacena de forma segura. Nunca se muestra en la interfaz. "),r()()),e&2){let t=v();o(),k("ng-invalid",t.isFieldInvalid("token"))("ng-dirty",t.isFieldInvalid("token")),c("toggleMask",!0)("feedback",!1),o(),f(t.isFieldInvalid("token")?2:-1)}}function De(e,a){if(e&1){let t=O();n(0,"div")(1,"p-button",21),g("onClick",function(){M(t);let d=v();return I(d.onPasteNewToken())}),r(),n(2,"small",19),p(3,"i",20),s(4," Por seguridad, el token actual no se muestra. Haga clic para pegar uno nuevo. "),r()()}e&2&&(o(),c("outlined",!0))}function ze(e,a){if(e&1&&(n(0,"small",7),s(1),r()),e&2){let t=v();o(),x(" ",t.getErrorMessage("status")," ")}}var F=class e{fb=l(oe);router=l($);route=l(j);workspaceService=l(U);messageService=l(E);workspaceForm;isEditMode=!1;workspaceId=null;isLoading=!1;showTokenField=!1;statusOptions=[{label:"Activo",value:"ACTIVE"},{label:"Token Inv\xE1lido",value:"INVALID_TOKEN"},{label:"L\xEDmite Excedido",value:"RATE_LIMITED"},{label:"Error",value:"ERROR"},{label:"Desactivado",value:"DISABLED"}];ngOnInit(){this.checkEditMode()}initForm(){this.workspaceForm=this.fb.group({name:["",[m.required,m.minLength(3)]],description:[""],token:[""],status:["ACTIVE",m.required]}),this.isEditMode||(this.workspaceForm.get("token")?.setValidators([m.required,m.minLength(10)]),this.showTokenField=!0)}async checkEditMode(){this.workspaceId=this.route.snapshot.paramMap.get("id"),this.isEditMode=!!this.workspaceId,this.initForm(),this.workspaceId&&await this.loadWorkspace(this.workspaceId)}async loadWorkspace(a){try{this.isLoading=!0;let t=await this.workspaceService.getWorkspaceByIdAsync(a);if(!t){this.messageService.add({severity:"error",summary:"Error",detail:"Workspace no encontrado"}),this.router.navigate(["/workspaces"]);return}t&&this.workspaceForm.patchValue({name:t.name,description:t.description||"",status:t.status})}catch{this.messageService.add({severity:"error",summary:"Error",detail:"No se pudo cargar el workspace"}),this.router.navigate(["/workspaces"])}finally{this.isLoading=!1}}async onSubmit(){if(this.workspaceForm.invalid){Object.keys(this.workspaceForm.controls).forEach(a=>{this.workspaceForm.get(a)?.markAsTouched()});return}try{this.isLoading=!0;let a=this.workspaceForm.value;this.isEditMode&&this.workspaceId?(await this.workspaceService.updateWorkspace(this.workspaceId,a),this.messageService.add({severity:"success",summary:"\xC9xito",detail:"Workspace actualizado correctamente"})):(await this.workspaceService.createWorkspace(a),this.messageService.add({severity:"success",summary:"\xC9xito",detail:"Workspace creado correctamente"})),setTimeout(()=>{this.router.navigate(["/workspaces"])},1e3)}catch{this.messageService.add({severity:"error",summary:"Error",detail:this.isEditMode?"No se pudo actualizar el workspace":"No se pudo crear el workspace"})}finally{this.isLoading=!1}}onPasteNewToken(){this.showTokenField=!0,this.workspaceForm.get("token")?.setValidators([m.required,m.minLength(10)]),this.workspaceForm.get("token")?.updateValueAndValidity()}onCancel(){this.router.navigate(["/workspaces"])}getControl(a){return this.workspaceForm.get(a)}isFieldInvalid(a){let t=this.workspaceForm.get(a);return!!(t&&t.invalid&&(t.dirty||t.touched))}getErrorMessage(a){let t=this.workspaceForm.get(a);return t?.hasError("required")?a==="token"?"Debe pegar el token de Hostinger":"Este campo es obligatorio":t?.hasError("minlength")?`M\xEDnimo ${t.errors?.minlength.requiredLength} caracteres`:""}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=D({type:e,selectors:[["app-workspace-form"]],features:[b([E])],decls:34,vars:22,consts:[[1,"workspace-form-container"],[1,"mb-4"],["icon","pi pi-arrow-left","label","Volver",3,"onClick","text"],["pTemplate","header"],[3,"ngSubmit","formGroup"],[1,"field","mb-4"],["for","name",1,"block","mb-2","font-semibold"],[1,"text-red-500"],["id","name","type","text","pInputText","","formControlName","name","placeholder","Ingrese el nombre del workspace",1,"w-full"],["for","description",1,"block","mb-2","font-semibold"],["id","description","pTextarea","","formControlName","description","placeholder","Descripci\xF3n del workspace (opcional)",1,"w-full",3,"rows"],["for","token",1,"block","mb-2","font-semibold"],["for","status",1,"block","mb-2","font-semibold"],["id","status","formControlName","status","optionLabel","label","optionValue","value","placeholder","Seleccione un estado",1,"w-full",3,"options"],[1,"flex","gap-3","justify-content-end","mt-5"],["label","Cancelar","severity","secondary","type","button",3,"onClick","outlined","disabled"],["icon","pi pi-check","type","submit",3,"label","loading","disabled"],[1,"card-header"],["id","token","formControlName","token","placeholder","Pegue aqu\xED su token de Hostinger","inputclass","w-full",1,"w-full",3,"toggleMask","feedback"],[1,"block","mt-2","text-gray-600"],[1,"pi","pi-info-circle"],["label","Pegar nuevo token","icon","pi pi-key","severity","secondary","type","button",3,"onClick","outlined"]],template:function(t,i){t&1&&(n(0,"div",0),p(1,"p-toast"),n(2,"div",1)(3,"p-button",2),g("onClick",function(){return i.onCancel()}),r()(),n(4,"p-card"),R(5,Se,3,1,"ng-template",3),n(6,"form",4),g("ngSubmit",function(){return i.onSubmit()}),n(7,"div",5)(8,"label",6),s(9," Nombre "),n(10,"span",7),s(11,"*"),r()(),p(12,"input",8),u(13,Me,2,1,"small",7),r(),n(14,"div",5)(15,"label",9),s(16," Descripci\xF3n "),r(),p(17,"textarea",10),r(),n(18,"div",5)(19,"label",11),s(20," Token Hostinger "),u(21,Ie,2,0,"span",7),r(),u(22,Ne,6,7,"div"),u(23,De,5,1,"div"),r(),n(24,"div",5)(25,"label",12),s(26," Estado "),n(27,"span",7),s(28,"*"),r()(),p(29,"p-select",13),u(30,ze,2,1,"small",7),r(),n(31,"div",14)(32,"p-button",15),g("onClick",function(){return i.onCancel()}),r(),p(33,"p-button",16),r()()()()),t&2&&(o(3),c("text",!0),o(3),c("formGroup",i.workspaceForm),o(6),k("ng-invalid",i.isFieldInvalid("name"))("ng-dirty",i.isFieldInvalid("name")),o(),f(i.isFieldInvalid("name")?13:-1),o(4),c("rows",4),o(4),f(!i.isEditMode||i.showTokenField?21:-1),o(),f(!i.isEditMode||i.showTokenField?22:-1),o(),f(i.isEditMode&&!i.showTokenField?23:-1),o(6),k("ng-invalid",i.isFieldInvalid("status"))("ng-dirty",i.isFieldInvalid("status")),c("options",i.statusOptions),o(),f(i.isFieldInvalid("status")?30:-1),o(2),c("outlined",!0)("disabled",i.isLoading),o(),c("label",i.isEditMode?"Actualizar":"Crear")("loading",i.isLoading)("disabled",i.workspaceForm.invalid))},dependencies:[re,ie,Q,ee,te,ne,ae,ue,me,q,J,Y,de,le,we,ye,pe,ce,ge,fe,he,ve],styles:[".workspace-form-container[_ngcontent-%COMP%]{padding:2rem;max-width:800px;margin:0 auto}.workspace-form-container[_ngcontent-%COMP%]   .card-header[_ngcontent-%COMP%]{padding:1.5rem}.workspace-form-container[_ngcontent-%COMP%]   .card-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:1.5rem;font-weight:600;color:var(--text-color);margin:0}.workspace-form-container[_ngcontent-%COMP%]   .field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{color:var(--text-color)}.workspace-form-container[_ngcontent-%COMP%]   .field[_ngcontent-%COMP%]   .text-red-500[_ngcontent-%COMP%]{color:var(--gray-700)}"],changeDetection:0})};export{F as default};
