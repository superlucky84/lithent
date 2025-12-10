(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))n(d);new MutationObserver(d=>{for(const s of d)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(d){const s={};return d.integrity&&(s.integrity=d.integrity),d.referrerPolicy&&(s.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?s.credentials="include":d.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(d){if(d.ep)return;d.ep=!0;const s=a(d);fetch(d.href,s)}})();const be=t=>typeof t=="object"&&!("resolve"in t),Le=(t,r)=>be(t)&&t.type===r,$r=(t,r)=>"ctor"in t?t.ctor===(r&&r.ctor):t===(r&&r.ctor),jr=(t,r)=>!!(be(t)&&r&&r.type==="f"&&r.children&&r.children.length===(t.children&&t.children.length)),zr=(t,r)=>!!(be(t)&&r&&r.type==="e"&&r.tag===t.tag&&r.children&&r.children.length===(t.children&&t.children.length)),vt=(t,r)=>!!(be(t)&&r&&r.type===t.type),Jr=(t,r)=>!!(be(t)&&r&&r.type===t.type&&(Se(F((t.children||[])[0]))&&Se(F((r.children||[])[0]))||r.children&&t.children&&r.children.length===t.children.length)),F=t=>t&&t.compProps&&t.compProps.key||t&&t.props&&t.props.key,xe=t=>t&&["f","l"].includes(t),Fe=t=>typeof t=="function"&&!Vt(t)||typeof t=="object"&&"resolve"in t,Vt=t=>typeof t=="function"&&t===_,Vr=t=>be(t)&&!t.type,Se=t=>t!=null,wt=(t,r)=>t==="style"&&typeof r=="object",Wr=(t,r)=>t==="ref"&&typeof r=="object",Xr=(t,r)=>{const a=Object.getOwnPropertyDescriptor(t.constructor.prototype,r);return a&&a.get&&a.set},Gr=t=>Fe(t)?"c":Le(t,"f")?"f":Le(t,"e")?"e":Le(t,"l")?"l":Le(t,"t")?"t":"et",qr={c:$r,l:Jr,t:vt,e:zr,f:jr,et:vt},Te=Symbol.for("lithentWDomSymbol"),Me={value:""},ue={value:null},tt={value:!1},H=new WeakMap,Wt=new WeakSet,Kr=t=>{H.set(t,{vd:{value:null},up:()=>{},upR:[],upS:{value:0},upD:[],upCB:[],mts:[],umts:[],wdCB:[]})},pe=()=>ue.value,Ct=(t,r)=>{const a=H.get(t);return a?a[r]:null},Yr=t=>{ue.value=t},Zr=t=>{ue.value=t,Kr(t)},Qr=t=>{const r=H.get(t);r&&(r.umts.forEach(a=>a()),r.umts=[])},re=t=>t.getParent&&t.getParent(),Ee=Object.entries,Xt=Object.keys,$e=Object.assign,Gt=t=>{const r=pe();if(r){const a=H.get(r);a&&a.umts.push(t)}},je=t=>{const{compKey:r}=t;r&&ea(r),qt(t)},qt=t=>{(t.children||[]).forEach(r=>{r.compKey?je(r):qt(r)})},ea=t=>{Qr(t),H.delete(t)};let rt=[];const ta=t=>{t.compKey&&rt.push(t)},ot=()=>{rt.forEach(t=>ra(t)),rt=[]},ae=t=>{const r=pe();if(r){const a=H.get(r);a&&a.mts.push(t)}},ra=t=>{const{compKey:r}=t;if(r){const a=H.get(r);if(!a)return;const{mts:n,upS:d}=a;ue.value=r,d&&(d.value=0),n&&(a.mts=[],n.forEach(s=>{const l=s();l&&Gt(l)}))}},aa=t=>{const{compKey:r}=t;if(r){const a=H.get(r),n=a&&a.wdCB;ue.value=r,n&&n.length>0&&(a.wdCB=[],n.forEach(d=>{const s=d();s&&typeof s=="function"&&Gt(s)}))}},Mt=(t,r=()=>[])=>{const a=pe();if(!a)return;const n=H.get(a);if(!n)return;const{upD:d,upS:s}=n,l=d[s.value],i=r();if(l&&la(l,i)){const c=t();c&&n.upCB.push(c)}d[s.value]=i,s.value+=1},na=t=>{const{compKey:r}=t;if(r){const a=H.get(r);if(!a)return;const{upCB:n,upS:d}=a;ue.value=r,d&&(d.value=0),t.ctor&&n&&(a.upCB=[],n.forEach(s=>s()))}},la=(t,r)=>t.length?t.some((a,n)=>a!==r[n]):!0,st=()=>new DocumentFragment,Tt=t=>document.createElement(t),De=(t,r,a,n)=>{t.isRoot=!0,r=r||document.body,t.we=r;const d=Je(t,n);return a?(t.ae=a,r.insertBefore(d,a)):r.tagName==="HTML"?r.replaceWith(d):r.appendChild(d),ot(),()=>{const s=H.get(t.compProps||{}),l=s&&s.vd.value||t;l!==t&&je(l),ze(l),da(l)}},ze=t=>{t.props&&t.el&&tr(t.props,t.el),(t.children||[]).forEach(r=>{ze(r)})},da=t=>Kt(t,t.we),it=t=>{t.op&&t.el&&tr(t.op,t.el),Kt(t,Ve(re(t)))},Kt=(t,r)=>{if(r&&t.el){const a=t.el.nodeType;[1,3].includes(a)?r.removeChild(t.el):a===11&&Yt(t),delete t.el}},Yt=(t,r)=>{(t&&t.oc||t&&t.children||[]).forEach(a=>{const n=a.el&&a.el.nodeType;if(n)if([1,3].includes(n)){const d=a.el;d.tagName==="HTML"?d.innerHTML="":d.remove()}else n===11&&Yt(a)})},Zt=t=>{it(t),ct(t)},oa=t=>{if(nt(t),re(t).nr!=="L"){const r=Qt(t);ct(t,r)}},ct=(t,r)=>{r||(r=Je(t));const a=re(t);if(a.type){const n=Ve(a),d=a.type==="l"&&a.nr&&a.nr!=="L"?at(a,re(a)):at(t,a);r&&n&&(t.tag!=="portal"&&(d?n.insertBefore(r,d):n.appendChild(r)),ot())}},Qt=t=>xe(t.type)?(t&&t.children||[]).reduce((r,a)=>{const n=Qt(a);return n&&r.appendChild(n),r},st()):t.el,at=(t,r)=>{const a=r.children||[],n=a.indexOf(t)+1,d=a.slice(n),s=er(d),l=r.type||"";if(s)return s;if(!r.isRoot&&xe(l))return at(r,re(r));if(r.isRoot&&xe(l)&&r.ae)return r.ae},er=t=>t.reduce((r,a)=>{if(r)return r;const{type:n,el:d}=a;if(n&&xe(n)){const s=er(a.children||[]);if(s)return s}return d&&d.nodeType!==11?d:r},void 0),sa=t=>{const r=re(t),a=t.el;if(r.type&&a)if(a.nodeType===11)Zt(t);else{const n=Ve(r),d=Je(t);n&&t.tag!=="portal"&&n.replaceChild(d,a),ot()}},tr=(t,r)=>{Ee(t||{}).forEach(([a,n])=>{a.match(/^on/)&&r.removeEventListener(a.slice(2).toLowerCase(),n)})},nt=t=>{if(t.type==="t"){ca(t);return}if(t.el){const{op:r,props:a}=t;ar(a,t.el,r),delete t.op,t.tag==="input"&&(t.el.value=String(a&&a.value||""))}(t.children||[]).forEach(r=>rr(r)),na(t)},rr=t=>{const{nr:r}=t;r!==void 0&&r!=="N"&&(ia[r](t),delete t.nr,delete t.oc,delete t.op)},ia={A:ct,D:it,R:sa,U:nt,S:Zt,T:oa,L:nt},ca=t=>{t.el&&(t.el.nodeValue=String(t.text))},ar=(t,r,a,n)=>{const d=a||{};Ee(t||{}).forEach(([s,l])=>{if(l===d[s]){delete d[s];return}s==="key"||l===d[s]||s==="portal"&&typeof l=="object"||(s==="innerHTML"&&typeof l=="string"?r.innerHTML=l:wt(s,l)?ha(l,wt(s,d.style)?d.style:{},r):Wr(s,l)?l.value=r:s.match(/^on/)?ga(r,s,l,d[s]):s&&(s!=="type"&&Xr(r,s)?r[s]=l:ma(s==="className"?"class":s,r,l))),delete d[s]}),Xt(d).forEach(s=>r.removeAttribute(s))},ma=(t,r,a)=>Me.value&&t!=="xmlns"?r.setAttributeNS(null,t,a):r.setAttribute(t,a),Je=(t,r)=>{let a;const{type:n,tag:d,text:s,props:l,children:i=[]}=t,c=xe(n);return aa(t),d==="svg"&&(Me.value=String(l&&l.xmlns)),c?a=st():n==="e"&&d?d==="portal"&&l&&l.portal?a=l.portal:a=Me.value?document.createElementNS(Me.value,d):Tt(d):n==="t"&&Se(s)?a=document.createTextNode(String(s)):a=Tt("e"),t.el=a,xa(i,a,r),ar(l,a,null),ta(t),d==="svg"&&(Me.value=""),a},xa=(t,r,a)=>{const n=t.reduce((d,s)=>{if(s.type){const l=Je(s,a);s.tag!=="portal"&&!a&&d.appendChild(l)}return d},st());r&&n.hasChildNodes()&&r.appendChild(n)},ga=(t,r,a,n)=>{const d=r.slice(2).toLowerCase();n!==a&&(n&&t.removeEventListener(d,n),a&&t.addEventListener(d,a))},ha=(t,r,a)=>{const n={...r},d=a instanceof HTMLElement?a:null,s=d==null?void 0:d.style;if(!s)return;const l=s;Ee(t).forEach(([i,c])=>{l[i]=c,delete n[i]}),Ee(n).forEach(([i])=>{l[i]=""})},Ve=t=>{const r=xe(t.type);return t.isRoot&&r?t.we:r?Ve(re(t)):t.el},We=(t,r)=>ba(t,qr[Gr(t)](t,r),r),ba=(t,r,a)=>{const n=wa(t,r,a),d=pa(n,r,a),s=d==="N";return s||(n.children=Ca(n,r,a)),n.nr=d,ua(n,a,d),!s&&a&&(a.il=!0,delete a.children),n},ua=(t,r,a)=>{a!=="A"&&r&&(t.el=r.el),(a==="D"||a==="R"||a==="S")&&(r&&(je(r),ze(r)),t.oc=r&&r.children),t.op=r&&r.props},pa=(t,r,a)=>{if(Vr(t))return"D";if(t.type==="t"&&r&&t.text===(a&&a.text)||t===a)return"N";if(!(a&&a.type))return"A";const n=F(t),d=re(a),s=!t.isRoot&&d&&d.type==="l"&&Se(n);let l=r?s?"T":"U":s?"S":"R";return t.type==="l"&&l==="U"&&a&&ya(t,a)&&(l="L"),l},ya=(t,r)=>{if(!F((t.children||[])[0])||!F((r.children||[])[0]))return!1;const a=[...r&&r.children||[]],n=[...t&&t.children||[]].filter(l=>a.find(i=>F(l)===F(i))),d=a.filter(l=>n.find(i=>F(l)===F(i)));let s=d.length===n.length;return s&&(s=d.every((l,i)=>F(l)===F(n[i]))),s},ka=(t,r)=>{t&&r!==t&&(Xt(t).forEach(a=>delete t[a]),Ee(r||{}).forEach(([a,n])=>t[a]=n))},fa=(t,r)=>{t&&(t.splice(0,t.length),r&&r.forEach(a=>t.push(a)))},va=(t,r)=>{const{compProps:a,compChild:n}=t,{props:d,children:s}=r;return a&&ka(a,d),n&&s&&n!==s&&fa(n,s),t.reRender&&t.reRender()},wa=(t,r,a)=>Fe(t)?r&&a?va(a,t):t.resolve():t,Ca=(t,r,a)=>r&&a?Ta(t,a):Ma(t),Ma=t=>(t.children||[]).map(r=>$e(We(r),{getParent:()=>t})),Ta=(t,r)=>t.type==="l"&&Se(F((t.children||[])[0]))?Sa(t,r):(t.children||[]).map((a,n)=>$e(We(a,(r.children||[])[n]),{getParent:()=>t})),Sa=(t,r)=>{const[a,n]=Ea(t,r);return n.forEach(d=>{je(d),ze(d),it(d)}),a},Ea=(t,r)=>{const a=[...r.children||[]];return[(t.children||[]).map(n=>{const d=Da(n,a),s=We(n,d);return d&&a.splice(a.indexOf(d),1),s.getParent=()=>t,s}),a]},Da=(t,r)=>r.find(a=>F(a)===F(t)),lt=new Map;let dt=!1;const Oa=(t,r)=>{const a=H.get(t);a&&(a.up=()=>{lt.set(t,r),dt||(dt=!0,queueMicrotask(Ra))})},nr=t=>()=>{const r=H.get(t),a=r&&r.up;return a?(a(),!0):!1},Ra=()=>{lt.forEach(t=>{t()}),lt.clear(),dt=!1},Ia=(t,r=()=>[])=>{const a=pe();if(!a)return;const n=H.get(a);n&&(n.upR.push(()=>Mt(t,r)),Mt(t,r))},Pa=()=>{const t=pe();if(!t)return;const r=H.get(t),a=r&&r.upR;a&&a.length&&a.forEach(n=>n())},_=(t,...r)=>({type:"f",[Te]:!0,children:r}),St=(t,r,...a)=>{const n={value:void 0},d=lr(n,a),s=_a(t,r||{},d);return Fe(s)||(n.value=s),s},E=t=>(r,a)=>t,Aa=t=>(r,a)=>(Wt.add(t),t),La=(t,r,a)=>{const n=(d,s)=>{if(!(!d||s.has(d))){if(s.add(d),d.compChild){const l=d.compChild.indexOf(r);l!==-1&&d.compChild.splice(l,1,a)}n(d.getParent?d.getParent():void 0,s)}};n(t,new Set)},Na=(t,r,a,n)=>{if(n.il)return;tt.value=!0;const d=dr(t,r,a),s=We(d,n),{isRoot:l,getParent:i,we:c,ae:p}=n;if(s.getParent=i,!l&&i){const m=i(),g=m&&m.children||[],y=g.indexOf(n);y!==-1&&g.splice(y,1,s),La(m,n,s)}else s.isRoot=!0,s.we=c,s.ae=p;tt.value=!1,rr(s)},_a=(t,r,a)=>{if(Vt(t))return _(r,...a);if(Fe(t)){const n=dr(t,r,a);return tt.value?n:n.resolve()}return{type:"e",[Te]:!0,tag:t,props:r,children:a}},lr=(t,r)=>r.map(a=>$e(Ha(a),{getParent:()=>t.value})),Ha=t=>{if(t==null||t===!1)return{type:null,[Te]:!0};if(Array.isArray(t)){const r={value:void 0},a=lr(r,t),n={type:"l",[Te]:!0,children:a};return r.value=n,n}else if(typeof t=="string"||typeof t=="number")return{type:"t",[Te]:!0,text:t};return t},Ua=(t,r,a)=>(n=r)=>{Zr(n);const d=t(r,a),s=typeof d=="function"?d:()=>()=>d,l=Wt.has(s)?s(r,a):s(nr(n),r,a);return Ba(l,n,t,r,a)},dr=(t,r,a)=>{const n=t,d=a,s=Ua(t,r,d);return{ctor:n,props:r,children:d,resolve:s}},Ba=(t,r,a,n,d)=>{const{wrappedComponentMaker:s,customNode:l}=ja(t,n),i=Fa(s,r,a,n,d);return or(l,r,a,n,d,i),l},Fa=(t,r,a,n,d)=>{const s=()=>$a(t,r,a,n,d,s);return s},$a=(t,r,a,n,d,s)=>{Yr(r),Pa();const l=t(n);return or(l,r,a,n,d,s),l},ja=(t,r)=>{let a=t(r);if(!a.reRender)return{wrappedComponentMaker:t,customNode:a};const n=d=>{const s=t(d),l=_({},s);return s.getParent=()=>l,l};return a=n(r),{wrappedComponentMaker:n,customNode:a}},or=(t,r,a,n,d,s)=>{$e(t,{compProps:n,compChild:d,ctor:a,compKey:r,reRender:s}),Oa(r,()=>Na(a,n,d,t)),Ct(r,"vd")&&(Ct(r,"vd").value=t)},Y=t=>({value:t}),za=()=>{const t=pe();return t?nr(t):()=>!1};function e(t,r,a,n,d,s){const{children:l,...i}=r;if(l!=null){const c=Array.isArray(l)?l:[l];return St(t,{...i,key:a},...c)}return St(t,{...i,key:a})}const A=(t,r)=>{let a=t;return{get value(){return a},get v(){return a},set value(n){a=n,r()},set v(n){a=n,r()}}},Ja=t=>{let r=t;return{get value(){return r()},get v(){return r()},set value(a){throw new Error("You can't change 'computed'")},set v(a){throw new Error("You can't change 'computed'")}}},Va=(t,r=()=>{},a=()=>[])=>{ae(()=>(t(),r)),Ia(()=>(r&&r(),t),a)},Wa={cache:!0};function Xa(t){const r={value:!1},a=!Array.isArray(t)&&typeof t=="object"&&t!==null?t:{value:t},n=new Set,d=[],s=new WeakMap;return(l,i,c)=>{const{cache:p}=Object.assign({},Wa,c||{});if(p&&l&&s.has(l))return s.get(l);const m={},g=new Set;let y={value:null},x=()=>{};return d.push(m),l&&i&&(x=()=>l(y.value),y.value=Et(a,r,n,g,d,x,m),r.value=!0,i(y.value),r.value=!1),y.value||(y.value=Et(a,r,n,g,d),l&&(x=()=>l(y.value),n.add(x))),l&&(qa(x,n,m,g),s.set(l,y.value)),y.value}}function Et(t,r,a,n,d,s,l){return new Proxy(t,{get(i,c){return s&&l&&r.value&&(l[c]??(l[c]=new Set),l[c].has(s)||(l[c].add(s),n.add(c))),i[c]},set(i,c,p){return i[c]===p||(i[c]=p,Ga(a,d,c)),!0}})}function Ga(t,r=[],a){const n=new Set;Ot(t).forEach(d=>n.add(d)),(r||[]).forEach(d=>{const s=d[a]||new Set;Ot(s).forEach(l=>n.add(l)),Dt(n,s)}),Dt(n,t)}function Dt(t,r){t.forEach(a=>{r.delete(a)})}function Ot(t){const r=[];return t.forEach(a=>{a()===!1&&r.push(a)}),r}function qa(t,r,a,n){const d=t();d instanceof AbortSignal&&d.addEventListener("abort",()=>{const s=a||{};r.delete(t),Object.entries(s).forEach(([l,i])=>{i.delete(t),n.delete(l)})})}const Ka={cache:!0};function Ya(t){const r={value:!1},a=!Array.isArray(t)&&typeof t=="object"&&t!==null?t:{value:t},n=new Set,d=[],s=new WeakMap,l=(i,c,p)=>{const{cache:m}=Object.assign({},Ka,p||{});if(m&&i&&s.has(i))return s.get(i);const g={},y=new Set;let x={value:null},O=()=>{};return d.push(g),i&&c&&(O=()=>i(x.value),x.value=Rt(a,r,n,y,d,O,g),r.value=!0,c(x.value),r.value=!1),x.value||(x.value=Rt(a,r,n,y,d),i&&(O=()=>i(x.value),n.add(O))),i&&(Qa(O,n,g,y),s.set(i,x.value)),x.value};return{useStore(i,c){const p=za();return l(p,i,c)},watch(i,c,p){return l(i,c,p)}}}function Rt(t,r,a,n,d,s,l){return new Proxy(t,{get(i,c){return s&&l&&r.value&&(l[c]??(l[c]=new Set),l[c].has(s)||(l[c].add(s),n.add(c))),i[c]},set(i,c,p){return i[c]===p||(i[c]=p,Za(a,d,c)),!0}})}function Za(t,r=[],a){const n=new Set;Pt(t).forEach(d=>n.add(d)),(r||[]).forEach(d=>{const s=d[a]||new Set;Pt(s).forEach(l=>n.add(l)),It(n,s)}),It(n,t)}function It(t,r){t.forEach(a=>{r.delete(a)})}function Pt(t){const r=[];return t.forEach(a=>{a()===!1&&r.push(a)}),r}function Qa(t,r,a,n){const d=t();d instanceof AbortSignal&&d.addEventListener("abort",()=>{const s=a||{};r.delete(t),Object.entries(s).forEach(([l,i])=>{i.delete(t),n.delete(l)})})}const en=()=>{const t=localStorage.getItem("lithent-theme");return t==="light"||t==="dark"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"},Xe=Ya({theme:en(),route:location.pathname||"/guide/introduction",sidebarOpen:!1}),ge=Xe.watch(),sr=t=>{ge.theme=t,localStorage.setItem("lithent-theme",t),t==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")},tn=()=>{sr(ge.theme==="light"?"dark":"light")},v=t=>{ge.route=t,window.history.pushState({},"",t),ge.sidebarOpen=!1,window.scrollTo(0,0)};window.addEventListener("popstate",()=>{ge.route=location.pathname||"/guide/introduction",window.scrollTo(0,0)});sr(ge.theme);const rn=E(t=>{const r=Xe.watch(t);return()=>e("header",{class:"sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1b1b1f]",children:e("div",{class:"mx-auto max-w-[1440px]",children:e("div",{class:"flex h-16",children:[e("div",{class:"w-auto sm:w-48 lg:w-64 flex-shrink-0 flex items-center px-6 md:px-12",children:e("a",{href:"/guide/introduction",onClick:a=>{a.preventDefault(),v("/guide/introduction")},class:"flex items-center gap-3",children:[e("img",{src:"/lithent.png",alt:"Lithent",class:"w-8 h-8"}),e("span",{class:"font-semibold text-xl text-gray-900 dark:text-white",children:"Lithent"})]})}),e("div",{class:"flex-1 w-full min-w-0 px-6 md:px-12",children:e("div",{class:"max-w-full md:max-w-[43rem] flex items-center justify-end h-16",children:[e("nav",{class:"hidden md:flex items-center gap-6",children:[e("a",{href:"/guide/introduction",onClick:a=>{a.preventDefault(),v("/guide/introduction")},class:"text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#42b883] dark:hover:text-[#42b883] transition-colors",children:"Guide"}),e("a",{href:"https://github.com/superlucky84/lithent",target:"_blank",rel:"noopener",class:"text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#42b883] dark:hover:text-[#42b883] transition-colors",children:"GitHub"})]}),e("button",{onClick:tn,class:"hidden sm:inline-flex ml-6 relative items-center h-9 w-16 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#42b883] focus:ring-offset-2 bg-gray-200 dark:bg-gray-700","aria-label":"Toggle dark mode",title:r.theme==="light"?"Switch to dark mode":"Switch to light mode",children:e("span",{class:`inline-block h-7 w-7 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${r.theme==="dark"?"translate-x-8":"translate-x-1"}`,children:e("span",{class:"flex items-center justify-center h-full",children:r.theme==="light"?e("svg",{class:"w-4 h-4 text-gray-600",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"})}):e("svg",{class:"w-4 h-4 text-gray-600",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"})})})})}),e("button",{class:"lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-2 ml-4",onClick:()=>{r.sidebarOpen=!r.sidebarOpen},"aria-label":"Toggle sidebar",children:e("svg",{class:"w-6 h-6 text-gray-600 dark:text-gray-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M4 6h16M4 12h16M4 18h16"})})})]})})]})})})}),At=[{text:"Getting Started",items:[{text:"Introduction",link:"/guide/introduction"},{text:"Quick Start",link:"/guide/quick-start"}]},{text:"Essential Features",items:[{text:"Mounter",link:"/guide/mounter"},{text:"Updater",link:"/guide/updater"},{text:"Props",link:"/guide/props"},{text:"Children",link:"/guide/children"},{text:"Renewer",link:"/guide/renewer"},{text:"Render",link:"/guide/render"},{text:"Portal",link:"/guide/portal"},{text:"Mount Hooks",link:"/guide/mount-hooks"},{text:"Update Hooks",link:"/guide/update-hooks"},{text:"Mount Ready Hooks",link:"/guide/mount-ready-hooks"},{text:"useRenew Hooks",link:"/guide/use-renew-hooks"},{text:"NextTick",link:"/guide/next-tick"}]},{text:"Helper Features",items:[{text:"State",link:"/guide/state"},{text:"Lstate",link:"/guide/lstate"},{text:"Computed",link:"/guide/computed"},{text:"Effect",link:"/guide/effect"},{text:"Store",link:"/guide/store"},{text:"Lstore",link:"/guide/lstore"},{text:"Context",link:"/guide/context"},{text:"LContext",link:"/guide/lcontext"},{text:"CacheUpdate",link:"/guide/cache-update"},{text:"State-Ref",link:"/guide/state-ref"}]},{text:"JSX & Templates",items:[{text:"Vite Plugin",link:"/guide/vite-plugin"},{text:"Manual JSX Setup",link:"/guide/jsx-manual"},{text:"FTags",link:"/guide/ftags"},{text:"HTM Tags",link:"/guide/htm-tags"},{text:"Template Strings",link:"/guide/template-strings"}]},{text:"Examples",items:[{text:"Computed Counter (helper)",link:"/examples/1"},{text:"Shared Store (helper)",link:"/examples/2"},{text:"Render Props (Mouse tracker)",link:"/examples/3"},{text:"Effect Lifecycle (helper)",link:"/examples/4"},{text:"Nested Fragments (Notifications)",link:"/examples/5"},{text:"Key-based Lists (Playlist)",link:"/examples/6"},{text:"innerHTML (Markdown Editor)",link:"/examples/7"},{text:"Select Controls (Character)",link:"/examples/8"},{text:"Input Controls (Business Card)",link:"/examples/9"},{text:"Checkbox & Radio (Pizza Builder)",link:"/examples/10"},{text:"Mixed DOM (Social Timeline)",link:"/examples/12"},{text:"Mixed DOM + Loop (Waitlist)",link:"/examples/13"},{text:"Nested Unmount (Game Inventory)",link:"/examples/14"}]}],Ne=t=>t.replace(/\/+$/,"")||"/",an=E(t=>{const r=Xe.watch(t),a=Object.fromEntries(At.map(l=>[l.text,!0]));let n=r.route;const d=l=>{v(l)},s=l=>{a[l]=!a[l],t()};return()=>{const l=r.route!==n,i=e(_,{children:[r.sidebarOpen&&e("div",{class:"fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden",onClick:()=>{r.sidebarOpen=!1}}),e("aside",{class:`
            fixed lg:sticky top-16 left-0 z-40
            w-64 h-[calc(100vh-4rem)] flex-shrink-0
            bg-white dark:bg-[#1b1b1f]
            border-r border-gray-200 dark:border-gray-800
            overflow-y-auto
            transition-transform duration-300
            ${r.sidebarOpen?"translate-x-0":"-translate-x-full lg:translate-x-0"}
          `,children:e("nav",{class:"pl-6 md:pl-12 pr-3 md:pr-4 py-6",children:At.map(c=>{const p=Ne(r.route);l&&c.items.some(y=>Ne(y.link)===p)&&(a[c.text]=!0);const m=a[c.text];return e("div",{class:"mb-3",children:[e("button",{class:"mb-1 w-full flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider",onClick:()=>s(c.text),children:[e("span",{children:c.text}),e("span",{class:"text-base leading-none",children:m?"▾":"▸"})]}),e("ul",{class:`
                      space-y-0 overflow-hidden transition-all duration-200 ease-in-out
                      ${m?"max-h-[800px] opacity-100":"max-h-0 opacity-0 pointer-events-none"}
                    `,"aria-hidden":!m,children:c.items.map(g=>{const y=Ne(r.route)===Ne(g.link);return e("li",{children:e("a",{href:g.link,onClick:x=>{x.preventDefault(),d(g.link)},class:`
                              block px-2 py-1.5 rounded-md text-sm font-normal transition-colors
                              ${y?"text-[#42b883] bg-[#42b883] bg-opacity-10":"text-gray-700 dark:text-gray-300 hover:text-[#42b883] dark:hover:text-[#42b883] hover:bg-gray-100 dark:hover:bg-gray-800"}
                            `,children:g.text})})})})]})})})})]});return n=r.route,i}});function nn(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function ir(t){return t instanceof Map?t.clear=t.delete=t.set=function(){throw new Error("map is read-only")}:t instanceof Set&&(t.add=t.clear=t.delete=function(){throw new Error("set is read-only")}),Object.freeze(t),Object.getOwnPropertyNames(t).forEach(r=>{const a=t[r],n=typeof a;(n==="object"||n==="function")&&!Object.isFrozen(a)&&ir(a)}),t}class Lt{constructor(r){r.data===void 0&&(r.data={}),this.data=r.data,this.isMatchIgnored=!1}ignoreMatch(){this.isMatchIgnored=!0}}function cr(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")}function te(t,...r){const a=Object.create(null);for(const n in t)a[n]=t[n];return r.forEach(function(n){for(const d in n)a[d]=n[d]}),a}const ln="</span>",Nt=t=>!!t.scope,dn=(t,{prefix:r})=>{if(t.startsWith("language:"))return t.replace("language:","language-");if(t.includes(".")){const a=t.split(".");return[`${r}${a.shift()}`,...a.map((n,d)=>`${n}${"_".repeat(d+1)}`)].join(" ")}return`${r}${t}`};class on{constructor(r,a){this.buffer="",this.classPrefix=a.classPrefix,r.walk(this)}addText(r){this.buffer+=cr(r)}openNode(r){if(!Nt(r))return;const a=dn(r.scope,{prefix:this.classPrefix});this.span(a)}closeNode(r){Nt(r)&&(this.buffer+=ln)}value(){return this.buffer}span(r){this.buffer+=`<span class="${r}">`}}const _t=(t={})=>{const r={children:[]};return Object.assign(r,t),r};class mt{constructor(){this.rootNode=_t(),this.stack=[this.rootNode]}get top(){return this.stack[this.stack.length-1]}get root(){return this.rootNode}add(r){this.top.children.push(r)}openNode(r){const a=_t({scope:r});this.add(a),this.stack.push(a)}closeNode(){if(this.stack.length>1)return this.stack.pop()}closeAllNodes(){for(;this.closeNode(););}toJSON(){return JSON.stringify(this.rootNode,null,4)}walk(r){return this.constructor._walk(r,this.rootNode)}static _walk(r,a){return typeof a=="string"?r.addText(a):a.children&&(r.openNode(a),a.children.forEach(n=>this._walk(r,n)),r.closeNode(a)),r}static _collapse(r){typeof r!="string"&&r.children&&(r.children.every(a=>typeof a=="string")?r.children=[r.children.join("")]:r.children.forEach(a=>{mt._collapse(a)}))}}class sn extends mt{constructor(r){super(),this.options=r}addText(r){r!==""&&this.add(r)}startScope(r){this.openNode(r)}endScope(){this.closeNode()}__addSublanguage(r,a){const n=r.root;a&&(n.scope=`language:${a}`),this.add(n)}toHTML(){return new on(this,this.options).value()}finalize(){return this.closeAllNodes(),!0}}function Oe(t){return t?typeof t=="string"?t:t.source:null}function mr(t){return se("(?=",t,")")}function cn(t){return se("(?:",t,")*")}function mn(t){return se("(?:",t,")?")}function se(...t){return t.map(a=>Oe(a)).join("")}function xn(t){const r=t[t.length-1];return typeof r=="object"&&r.constructor===Object?(t.splice(t.length-1,1),r):{}}function xt(...t){return"("+(xn(t).capture?"":"?:")+t.map(n=>Oe(n)).join("|")+")"}function xr(t){return new RegExp(t.toString()+"|").exec("").length-1}function gn(t,r){const a=t&&t.exec(r);return a&&a.index===0}const hn=/\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;function gt(t,{joinWith:r}){let a=0;return t.map(n=>{a+=1;const d=a;let s=Oe(n),l="";for(;s.length>0;){const i=hn.exec(s);if(!i){l+=s;break}l+=s.substring(0,i.index),s=s.substring(i.index+i[0].length),i[0][0]==="\\"&&i[1]?l+="\\"+String(Number(i[1])+d):(l+=i[0],i[0]==="("&&a++)}return l}).map(n=>`(${n})`).join(r)}const bn=/\b\B/,gr="[a-zA-Z]\\w*",ht="[a-zA-Z_]\\w*",hr="\\b\\d+(\\.\\d+)?",br="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",ur="\\b(0b[01]+)",un="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",pn=(t={})=>{const r=/^#![ ]*\//;return t.binary&&(t.begin=se(r,/.*\b/,t.binary,/\b.*/)),te({scope:"meta",begin:r,end:/$/,relevance:0,"on:begin":(a,n)=>{a.index!==0&&n.ignoreMatch()}},t)},Re={begin:"\\\\[\\s\\S]",relevance:0},yn={scope:"string",begin:"'",end:"'",illegal:"\\n",contains:[Re]},kn={scope:"string",begin:'"',end:'"',illegal:"\\n",contains:[Re]},fn={begin:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},Ge=function(t,r,a={}){const n=te({scope:"comment",begin:t,end:r,contains:[]},a);n.contains.push({scope:"doctag",begin:"[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",end:/(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,excludeBegin:!0,relevance:0});const d=xt("I","a","is","so","us","to","at","if","in","it","on",/[A-Za-z]+['](d|ve|re|ll|t|s|n)/,/[A-Za-z]+[-][a-z]+/,/[A-Za-z][a-z]{2,}/);return n.contains.push({begin:se(/[ ]+/,"(",d,/[.]?[:]?([.][ ]|[ ])/,"){3}")}),n},vn=Ge("//","$"),wn=Ge("/\\*","\\*/"),Cn=Ge("#","$"),Mn={scope:"number",begin:hr,relevance:0},Tn={scope:"number",begin:br,relevance:0},Sn={scope:"number",begin:ur,relevance:0},En={begin:/(?=\/[^/\n]*\/)/,contains:[{scope:"regexp",begin:/\//,end:/\/[gimuy]*/,illegal:/\n/,contains:[Re,{begin:/\[/,end:/\]/,relevance:0,contains:[Re]}]}]},Dn={scope:"title",begin:gr,relevance:0},On={scope:"title",begin:ht,relevance:0},Rn={begin:"\\.\\s*"+ht,relevance:0},In=function(t){return Object.assign(t,{"on:begin":(r,a)=>{a.data._beginMatch=r[1]},"on:end":(r,a)=>{a.data._beginMatch!==r[1]&&a.ignoreMatch()}})};var _e=Object.freeze({__proto__:null,MATCH_NOTHING_RE:bn,IDENT_RE:gr,UNDERSCORE_IDENT_RE:ht,NUMBER_RE:hr,C_NUMBER_RE:br,BINARY_NUMBER_RE:ur,RE_STARTERS_RE:un,SHEBANG:pn,BACKSLASH_ESCAPE:Re,APOS_STRING_MODE:yn,QUOTE_STRING_MODE:kn,PHRASAL_WORDS_MODE:fn,COMMENT:Ge,C_LINE_COMMENT_MODE:vn,C_BLOCK_COMMENT_MODE:wn,HASH_COMMENT_MODE:Cn,NUMBER_MODE:Mn,C_NUMBER_MODE:Tn,BINARY_NUMBER_MODE:Sn,REGEXP_MODE:En,TITLE_MODE:Dn,UNDERSCORE_TITLE_MODE:On,METHOD_GUARD:Rn,END_SAME_AS_BEGIN:In});function Pn(t,r){t.input[t.index-1]==="."&&r.ignoreMatch()}function An(t,r){t.className!==void 0&&(t.scope=t.className,delete t.className)}function Ln(t,r){r&&t.beginKeywords&&(t.begin="\\b("+t.beginKeywords.split(" ").join("|")+")(?!\\.)(?=\\b|\\s)",t.__beforeBegin=Pn,t.keywords=t.keywords||t.beginKeywords,delete t.beginKeywords,t.relevance===void 0&&(t.relevance=0))}function Nn(t,r){Array.isArray(t.illegal)&&(t.illegal=xt(...t.illegal))}function _n(t,r){if(t.match){if(t.begin||t.end)throw new Error("begin & end are not supported with match");t.begin=t.match,delete t.match}}function Hn(t,r){t.relevance===void 0&&(t.relevance=1)}const Un=(t,r)=>{if(!t.beforeMatch)return;if(t.starts)throw new Error("beforeMatch cannot be used with starts");const a=Object.assign({},t);Object.keys(t).forEach(n=>{delete t[n]}),t.keywords=a.keywords,t.begin=se(a.beforeMatch,mr(a.begin)),t.starts={relevance:0,contains:[Object.assign(a,{endsParent:!0})]},t.relevance=0,delete a.beforeMatch},Bn=["of","and","for","in","not","or","if","then","parent","list","value"],Fn="keyword";function pr(t,r,a=Fn){const n=Object.create(null);return typeof t=="string"?d(a,t.split(" ")):Array.isArray(t)?d(a,t):Object.keys(t).forEach(function(s){Object.assign(n,pr(t[s],r,s))}),n;function d(s,l){r&&(l=l.map(i=>i.toLowerCase())),l.forEach(function(i){const c=i.split("|");n[c[0]]=[s,$n(c[0],c[1])]})}}function $n(t,r){return r?Number(r):jn(t)?0:1}function jn(t){return Bn.includes(t.toLowerCase())}const Ht={},oe=t=>{console.error(t)},Ut=(t,...r)=>{console.log(`WARN: ${t}`,...r)},me=(t,r)=>{Ht[`${t}/${r}`]||(console.log(`Deprecated as of ${t}. ${r}`),Ht[`${t}/${r}`]=!0)},Ue=new Error;function yr(t,r,{key:a}){let n=0;const d=t[a],s={},l={};for(let i=1;i<=r.length;i++)l[i+n]=d[i],s[i+n]=!0,n+=xr(r[i-1]);t[a]=l,t[a]._emit=s,t[a]._multi=!0}function zn(t){if(Array.isArray(t.begin)){if(t.skip||t.excludeBegin||t.returnBegin)throw oe("skip, excludeBegin, returnBegin not compatible with beginScope: {}"),Ue;if(typeof t.beginScope!="object"||t.beginScope===null)throw oe("beginScope must be object"),Ue;yr(t,t.begin,{key:"beginScope"}),t.begin=gt(t.begin,{joinWith:""})}}function Jn(t){if(Array.isArray(t.end)){if(t.skip||t.excludeEnd||t.returnEnd)throw oe("skip, excludeEnd, returnEnd not compatible with endScope: {}"),Ue;if(typeof t.endScope!="object"||t.endScope===null)throw oe("endScope must be object"),Ue;yr(t,t.end,{key:"endScope"}),t.end=gt(t.end,{joinWith:""})}}function Vn(t){t.scope&&typeof t.scope=="object"&&t.scope!==null&&(t.beginScope=t.scope,delete t.scope)}function Wn(t){Vn(t),typeof t.beginScope=="string"&&(t.beginScope={_wrap:t.beginScope}),typeof t.endScope=="string"&&(t.endScope={_wrap:t.endScope}),zn(t),Jn(t)}function Xn(t){function r(l,i){return new RegExp(Oe(l),"m"+(t.case_insensitive?"i":"")+(t.unicodeRegex?"u":"")+(i?"g":""))}class a{constructor(){this.matchIndexes={},this.regexes=[],this.matchAt=1,this.position=0}addRule(i,c){c.position=this.position++,this.matchIndexes[this.matchAt]=c,this.regexes.push([c,i]),this.matchAt+=xr(i)+1}compile(){this.regexes.length===0&&(this.exec=()=>null);const i=this.regexes.map(c=>c[1]);this.matcherRe=r(gt(i,{joinWith:"|"}),!0),this.lastIndex=0}exec(i){this.matcherRe.lastIndex=this.lastIndex;const c=this.matcherRe.exec(i);if(!c)return null;const p=c.findIndex((g,y)=>y>0&&g!==void 0),m=this.matchIndexes[p];return c.splice(0,p),Object.assign(c,m)}}class n{constructor(){this.rules=[],this.multiRegexes=[],this.count=0,this.lastIndex=0,this.regexIndex=0}getMatcher(i){if(this.multiRegexes[i])return this.multiRegexes[i];const c=new a;return this.rules.slice(i).forEach(([p,m])=>c.addRule(p,m)),c.compile(),this.multiRegexes[i]=c,c}resumingScanAtSamePosition(){return this.regexIndex!==0}considerAll(){this.regexIndex=0}addRule(i,c){this.rules.push([i,c]),c.type==="begin"&&this.count++}exec(i){const c=this.getMatcher(this.regexIndex);c.lastIndex=this.lastIndex;let p=c.exec(i);if(this.resumingScanAtSamePosition()&&!(p&&p.index===this.lastIndex)){const m=this.getMatcher(0);m.lastIndex=this.lastIndex+1,p=m.exec(i)}return p&&(this.regexIndex+=p.position+1,this.regexIndex===this.count&&this.considerAll()),p}}function d(l){const i=new n;return l.contains.forEach(c=>i.addRule(c.begin,{rule:c,type:"begin"})),l.terminatorEnd&&i.addRule(l.terminatorEnd,{type:"end"}),l.illegal&&i.addRule(l.illegal,{type:"illegal"}),i}function s(l,i){const c=l;if(l.isCompiled)return c;[An,_n,Wn,Un].forEach(m=>m(l,i)),t.compilerExtensions.forEach(m=>m(l,i)),l.__beforeBegin=null,[Ln,Nn,Hn].forEach(m=>m(l,i)),l.isCompiled=!0;let p=null;return typeof l.keywords=="object"&&l.keywords.$pattern&&(l.keywords=Object.assign({},l.keywords),p=l.keywords.$pattern,delete l.keywords.$pattern),p=p||/\w+/,l.keywords&&(l.keywords=pr(l.keywords,t.case_insensitive)),c.keywordPatternRe=r(p,!0),i&&(l.begin||(l.begin=/\B|\b/),c.beginRe=r(c.begin),!l.end&&!l.endsWithParent&&(l.end=/\B|\b/),l.end&&(c.endRe=r(c.end)),c.terminatorEnd=Oe(c.end)||"",l.endsWithParent&&i.terminatorEnd&&(c.terminatorEnd+=(l.end?"|":"")+i.terminatorEnd)),l.illegal&&(c.illegalRe=r(l.illegal)),l.contains||(l.contains=[]),l.contains=[].concat(...l.contains.map(function(m){return Gn(m==="self"?l:m)})),l.contains.forEach(function(m){s(m,c)}),l.starts&&s(l.starts,i),c.matcher=d(c),c}if(t.compilerExtensions||(t.compilerExtensions=[]),t.contains&&t.contains.includes("self"))throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");return t.classNameAliases=te(t.classNameAliases||{}),s(t)}function kr(t){return t?t.endsWithParent||kr(t.starts):!1}function Gn(t){return t.variants&&!t.cachedVariants&&(t.cachedVariants=t.variants.map(function(r){return te(t,{variants:null},r)})),t.cachedVariants?t.cachedVariants:kr(t)?te(t,{starts:t.starts?te(t.starts):null}):Object.isFrozen(t)?te(t):t}var qn="11.8.0";class Kn extends Error{constructor(r,a){super(r),this.name="HTMLInjectionError",this.html=a}}const Ze=cr,Bt=te,Ft=Symbol("nomatch"),Yn=7,fr=function(t){const r=Object.create(null),a=Object.create(null),n=[];let d=!0;const s="Could not find the language '{}', did you forget to load/include a language module?",l={disableAutodetect:!0,name:"Plain text",contains:[]};let i={ignoreUnescapedHTML:!1,throwUnescapedHTML:!1,noHighlightRe:/^(no-?highlight)$/i,languageDetectRe:/\blang(?:uage)?-([\w-]+)\b/i,classPrefix:"hljs-",cssSelector:"pre code",languages:null,__emitter:sn};function c(h){return i.noHighlightRe.test(h)}function p(h){let b=h.className+" ";b+=h.parentNode?h.parentNode.className:"";const f=i.languageDetectRe.exec(b);if(f){const M=z(f[1]);return M||(Ut(s.replace("{}",f[1])),Ut("Falling back to no-highlight mode for this block.",h)),M?f[1]:"no-highlight"}return b.split(/\s+/).find(M=>c(M)||z(M))}function m(h,b,f){let M="",T="";typeof b=="object"?(M=h,f=b.ignoreIllegals,T=b.language):(me("10.7.0","highlight(lang, code, ...args) has been deprecated."),me("10.7.0",`Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`),T=h,M=b),f===void 0&&(f=!0);const R={code:M,language:T};ee("before:highlight",R);const B=R.result?R.result:g(R.language,R.code,f);return B.code=R.code,ee("after:highlight",B),B}function g(h,b,f,M){const T=Object.create(null);function R(u,k){return u.keywords[k]}function B(){if(!w.keywords){P.addText(D);return}let u=0;w.keywordPatternRe.lastIndex=0;let k=w.keywordPatternRe.exec(D),C="";for(;k;){C+=D.substring(u,k.index);const S=K.case_insensitive?k[0].toLowerCase():k[0],L=R(w,S);if(L){const[Q,Br]=L;if(P.addText(C),C="",T[S]=(T[S]||0)+1,T[S]<=Yn&&(Ae+=Br),Q.startsWith("_"))C+=k[0];else{const Fr=K.classNameAliases[Q]||Q;q(k[0],Fr)}}else C+=k[0];u=w.keywordPatternRe.lastIndex,k=w.keywordPatternRe.exec(D)}C+=D.substring(u),P.addText(C)}function Ie(){if(D==="")return;let u=null;if(typeof w.subLanguage=="string"){if(!r[w.subLanguage]){P.addText(D);return}u=g(w.subLanguage,D,!0,ft[w.subLanguage]),ft[w.subLanguage]=u._top}else u=x(D,w.subLanguage.length?w.subLanguage:null);w.relevance>0&&(Ae+=u.relevance),P.__addSublanguage(u._emitter,u.language)}function j(){w.subLanguage!=null?Ie():B(),D=""}function q(u,k){u!==""&&(P.startScope(k),P.addText(u),P.endScope())}function ut(u,k){let C=1;const S=k.length-1;for(;C<=S;){if(!u._emit[C]){C++;continue}const L=K.classNameAliases[u[C]]||u[C],Q=k[C];L?q(Q,L):(D=Q,B(),D=""),C++}}function pt(u,k){return u.scope&&typeof u.scope=="string"&&P.openNode(K.classNameAliases[u.scope]||u.scope),u.beginScope&&(u.beginScope._wrap?(q(D,K.classNameAliases[u.beginScope._wrap]||u.beginScope._wrap),D=""):u.beginScope._multi&&(ut(u.beginScope,k),D="")),w=Object.create(u,{parent:{value:w}}),w}function yt(u,k,C){let S=gn(u.endRe,C);if(S){if(u["on:end"]){const L=new Lt(u);u["on:end"](k,L),L.isMatchIgnored&&(S=!1)}if(S){for(;u.endsParent&&u.parent;)u=u.parent;return u}}if(u.endsWithParent)return yt(u.parent,k,C)}function Lr(u){return w.matcher.regexIndex===0?(D+=u[0],1):(Ye=!0,0)}function Nr(u){const k=u[0],C=u.rule,S=new Lt(C),L=[C.__beforeBegin,C["on:begin"]];for(const Q of L)if(Q&&(Q(u,S),S.isMatchIgnored))return Lr(k);return C.skip?D+=k:(C.excludeBegin&&(D+=k),j(),!C.returnBegin&&!C.excludeBegin&&(D=k)),pt(C,u),C.returnBegin?0:k.length}function _r(u){const k=u[0],C=b.substring(u.index),S=yt(w,u,C);if(!S)return Ft;const L=w;w.endScope&&w.endScope._wrap?(j(),q(k,w.endScope._wrap)):w.endScope&&w.endScope._multi?(j(),ut(w.endScope,u)):L.skip?D+=k:(L.returnEnd||L.excludeEnd||(D+=k),j(),L.excludeEnd&&(D=k));do w.scope&&P.closeNode(),!w.skip&&!w.subLanguage&&(Ae+=w.relevance),w=w.parent;while(w!==S.parent);return S.starts&&pt(S.starts,u),L.returnEnd?0:k.length}function Hr(){const u=[];for(let k=w;k!==K;k=k.parent)k.scope&&u.unshift(k.scope);u.forEach(k=>P.openNode(k))}let Pe={};function kt(u,k){const C=k&&k[0];if(D+=u,C==null)return j(),0;if(Pe.type==="begin"&&k.type==="end"&&Pe.index===k.index&&C===""){if(D+=b.slice(k.index,k.index+1),!d){const S=new Error(`0 width match regex (${h})`);throw S.languageName=h,S.badRule=Pe.rule,S}return 1}if(Pe=k,k.type==="begin")return Nr(k);if(k.type==="illegal"&&!f){const S=new Error('Illegal lexeme "'+C+'" for mode "'+(w.scope||"<unnamed>")+'"');throw S.mode=w,S}else if(k.type==="end"){const S=_r(k);if(S!==Ft)return S}if(k.type==="illegal"&&C==="")return 1;if(Ke>1e5&&Ke>k.index*3)throw new Error("potential infinite loop, way more iterations than matches");return D+=C,C.length}const K=z(h);if(!K)throw oe(s.replace("{}",h)),new Error('Unknown language: "'+h+'"');const Ur=Xn(K);let qe="",w=M||Ur;const ft={},P=new i.__emitter(i);Hr();let D="",Ae=0,de=0,Ke=0,Ye=!1;try{if(K.__emitTokens)K.__emitTokens(b,P);else{for(w.matcher.considerAll();;){Ke++,Ye?Ye=!1:w.matcher.considerAll(),w.matcher.lastIndex=de;const u=w.matcher.exec(b);if(!u)break;const k=b.substring(de,u.index),C=kt(k,u);de=u.index+C}kt(b.substring(de))}return P.finalize(),qe=P.toHTML(),{language:h,value:qe,relevance:Ae,illegal:!1,_emitter:P,_top:w}}catch(u){if(u.message&&u.message.includes("Illegal"))return{language:h,value:Ze(b),illegal:!0,relevance:0,_illegalBy:{message:u.message,index:de,context:b.slice(de-100,de+100),mode:u.mode,resultSoFar:qe},_emitter:P};if(d)return{language:h,value:Ze(b),illegal:!1,relevance:0,errorRaised:u,_emitter:P,_top:w};throw u}}function y(h){const b={value:Ze(h),illegal:!1,relevance:0,_top:l,_emitter:new i.__emitter(i)};return b._emitter.addText(h),b}function x(h,b){b=b||i.languages||Object.keys(r);const f=y(h),M=b.filter(z).filter(ce).map(j=>g(j,h,!1));M.unshift(f);const T=M.sort((j,q)=>{if(j.relevance!==q.relevance)return q.relevance-j.relevance;if(j.language&&q.language){if(z(j.language).supersetOf===q.language)return 1;if(z(q.language).supersetOf===j.language)return-1}return 0}),[R,B]=T,Ie=R;return Ie.secondBest=B,Ie}function O(h,b,f){const M=b&&a[b]||f;h.classList.add("hljs"),h.classList.add(`language-${M}`)}function U(h){let b=null;const f=p(h);if(c(f))return;if(ee("before:highlightElement",{el:h,language:f}),h.children.length>0&&(i.ignoreUnescapedHTML||(console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."),console.warn("https://github.com/highlightjs/highlight.js/wiki/security"),console.warn("The element with unescaped HTML:"),console.warn(h)),i.throwUnescapedHTML))throw new Kn("One of your code blocks includes unescaped HTML.",h.innerHTML);b=h;const M=b.textContent,T=f?m(M,{language:f,ignoreIllegals:!0}):x(M);h.innerHTML=T.value,O(h,f,T.language),h.result={language:T.language,re:T.relevance,relevance:T.relevance},T.secondBest&&(h.secondBest={language:T.secondBest.language,relevance:T.secondBest.relevance}),ee("after:highlightElement",{el:h,result:T,text:M})}function J(h){i=Bt(i,h)}const ye=()=>{G(),me("10.6.0","initHighlighting() deprecated.  Use highlightAll() now.")};function V(){G(),me("10.6.0","initHighlightingOnLoad() deprecated.  Use highlightAll() now.")}let X=!1;function G(){if(document.readyState==="loading"){X=!0;return}document.querySelectorAll(i.cssSelector).forEach(U)}function Z(){X&&G()}typeof window<"u"&&window.addEventListener&&window.addEventListener("DOMContentLoaded",Z,!1);function $(h,b){let f=null;try{f=b(t)}catch(M){if(oe("Language definition for '{}' could not be registered.".replace("{}",h)),d)oe(M);else throw M;f=l}f.name||(f.name=h),r[h]=f,f.rawDefinition=b.bind(null,t),f.aliases&&ie(f.aliases,{languageName:h})}function ke(h){delete r[h];for(const b of Object.keys(a))a[b]===h&&delete a[b]}function ne(){return Object.keys(r)}function z(h){return h=(h||"").toLowerCase(),r[h]||r[a[h]]}function ie(h,{languageName:b}){typeof h=="string"&&(h=[h]),h.forEach(f=>{a[f.toLowerCase()]=b})}function ce(h){const b=z(h);return b&&!b.disableAutodetect}function fe(h){h["before:highlightBlock"]&&!h["before:highlightElement"]&&(h["before:highlightElement"]=b=>{h["before:highlightBlock"](Object.assign({block:b.el},b))}),h["after:highlightBlock"]&&!h["after:highlightElement"]&&(h["after:highlightElement"]=b=>{h["after:highlightBlock"](Object.assign({block:b.el},b))})}function ve(h){fe(h),n.push(h)}function we(h){const b=n.indexOf(h);b!==-1&&n.splice(b,1)}function ee(h,b){const f=h;n.forEach(function(M){M[f]&&M[f](b)})}function le(h){return me("10.7.0","highlightBlock will be removed entirely in v12.0"),me("10.7.0","Please use highlightElement now."),U(h)}Object.assign(t,{highlight:m,highlightAuto:x,highlightAll:G,highlightElement:U,highlightBlock:le,configure:J,initHighlighting:ye,initHighlightingOnLoad:V,registerLanguage:$,unregisterLanguage:ke,listLanguages:ne,getLanguage:z,registerAliases:ie,autoDetection:ce,inherit:Bt,addPlugin:ve,removePlugin:we}),t.debugMode=function(){d=!1},t.safeMode=function(){d=!0},t.versionString=qn,t.regex={concat:se,lookahead:mr,either:xt,optional:mn,anyNumberOfTimes:cn};for(const h in _e)typeof _e[h]=="object"&&ir(_e[h]);return Object.assign(t,_e),t},he=fr({});he.newInstance=()=>fr({});var Zn=he;he.HighlightJS=he;he.default=he;const W=nn(Zn),Be="[A-Za-z$_][0-9A-Za-z$_]*",vr=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends"],wr=["true","false","null","undefined","NaN","Infinity"],Cr=["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],Mr=["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"],Tr=["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],Sr=["arguments","this","super","console","window","document","localStorage","sessionStorage","module","global"],Er=[].concat(Tr,Cr,Mr);function Qn(t){const r=t.regex,a=(b,{after:f})=>{const M="</"+b[0].slice(1);return b.input.indexOf(M,f)!==-1},n=Be,d={begin:"<>",end:"</>"},s=/<[A-Za-z0-9\\._:-]+\s*\/>/,l={begin:/<[A-Za-z0-9\\._:-]+/,end:/\/[A-Za-z0-9\\._:-]+>|\/>/,isTrulyOpeningTag:(b,f)=>{const M=b[0].length+b.index,T=b.input[M];if(T==="<"||T===","){f.ignoreMatch();return}T===">"&&(a(b,{after:M})||f.ignoreMatch());let R;const B=b.input.substring(M);if(R=B.match(/^\s*=/)){f.ignoreMatch();return}if((R=B.match(/^\s+extends\s+/))&&R.index===0){f.ignoreMatch();return}}},i={$pattern:Be,keyword:vr,literal:wr,built_in:Er,"variable.language":Sr},c="[0-9](_?[0-9])*",p=`\\.(${c})`,m="0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",g={className:"number",variants:[{begin:`(\\b(${m})((${p})|\\.)?|(${p}))[eE][+-]?(${c})\\b`},{begin:`\\b(${m})\\b((${p})\\b|\\.)?|(${p})\\b`},{begin:"\\b(0|[1-9](_?[0-9])*)n\\b"},{begin:"\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"},{begin:"\\b0[bB][0-1](_?[0-1])*n?\\b"},{begin:"\\b0[oO][0-7](_?[0-7])*n?\\b"},{begin:"\\b0[0-7]+n?\\b"}],relevance:0},y={className:"subst",begin:"\\$\\{",end:"\\}",keywords:i,contains:[]},x={begin:"html`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,y],subLanguage:"xml"}},O={begin:"css`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,y],subLanguage:"css"}},U={begin:"gql`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,y],subLanguage:"graphql"}},J={className:"string",begin:"`",end:"`",contains:[t.BACKSLASH_ESCAPE,y]},V={className:"comment",variants:[t.COMMENT(/\/\*\*(?!\/)/,"\\*/",{relevance:0,contains:[{begin:"(?=@[A-Za-z]+)",relevance:0,contains:[{className:"doctag",begin:"@[A-Za-z]+"},{className:"type",begin:"\\{",end:"\\}",excludeEnd:!0,excludeBegin:!0,relevance:0},{className:"variable",begin:n+"(?=\\s*(-)|$)",endsParent:!0,relevance:0},{begin:/(?=[^\n])\s/,relevance:0}]}]}),t.C_BLOCK_COMMENT_MODE,t.C_LINE_COMMENT_MODE]},X=[t.APOS_STRING_MODE,t.QUOTE_STRING_MODE,x,O,U,J,{match:/\$\d+/},g];y.contains=X.concat({begin:/\{/,end:/\}/,keywords:i,contains:["self"].concat(X)});const G=[].concat(V,y.contains),Z=G.concat([{begin:/\(/,end:/\)/,keywords:i,contains:["self"].concat(G)}]),$={className:"params",begin:/\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:Z},ke={variants:[{match:[/class/,/\s+/,n,/\s+/,/extends/,/\s+/,r.concat(n,"(",r.concat(/\./,n),")*")],scope:{1:"keyword",3:"title.class",5:"keyword",7:"title.class.inherited"}},{match:[/class/,/\s+/,n],scope:{1:"keyword",3:"title.class"}}]},ne={relevance:0,match:r.either(/\bJSON/,/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),className:"title.class",keywords:{_:[...Cr,...Mr]}},z={label:"use_strict",className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},ie={variants:[{match:[/function/,/\s+/,n,/(?=\s*\()/]},{match:[/function/,/\s*(?=\()/]}],className:{1:"keyword",3:"title.function"},label:"func.def",contains:[$],illegal:/%/},ce={relevance:0,match:/\b[A-Z][A-Z_0-9]+\b/,className:"variable.constant"};function fe(b){return r.concat("(?!",b.join("|"),")")}const ve={match:r.concat(/\b/,fe([...Tr,"super","import"]),n,r.lookahead(/\(/)),className:"title.function",relevance:0},we={begin:r.concat(/\./,r.lookahead(r.concat(n,/(?![0-9A-Za-z$_(])/))),end:n,excludeBegin:!0,keywords:"prototype",className:"property",relevance:0},ee={match:[/get|set/,/\s+/,n,/(?=\()/],className:{1:"keyword",3:"title.function"},contains:[{begin:/\(\)/},$]},le="(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|"+t.UNDERSCORE_IDENT_RE+")\\s*=>",h={match:[/const|var|let/,/\s+/,n,/\s*/,/=\s*/,/(async\s*)?/,r.lookahead(le)],keywords:"async",className:{1:"keyword",3:"title.function"},contains:[$]};return{name:"JavaScript",aliases:["js","jsx","mjs","cjs"],keywords:i,exports:{PARAMS_CONTAINS:Z,CLASS_REFERENCE:ne},illegal:/#(?![$_A-z])/,contains:[t.SHEBANG({label:"shebang",binary:"node",relevance:5}),z,t.APOS_STRING_MODE,t.QUOTE_STRING_MODE,x,O,U,J,V,{match:/\$\d+/},g,ne,{className:"attr",begin:n+r.lookahead(":"),relevance:0},h,{begin:"("+t.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",relevance:0,contains:[V,t.REGEXP_MODE,{className:"function",begin:le,returnBegin:!0,end:"\\s*=>",contains:[{className:"params",variants:[{begin:t.UNDERSCORE_IDENT_RE,relevance:0},{className:null,begin:/\(\s*\)/,skip:!0},{begin:/\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:Z}]}]},{begin:/,/,relevance:0},{match:/\s+/,relevance:0},{variants:[{begin:d.begin,end:d.end},{match:s},{begin:l.begin,"on:begin":l.isTrulyOpeningTag,end:l.end}],subLanguage:"xml",contains:[{begin:l.begin,end:l.end,skip:!0,contains:["self"]}]}]},ie,{beginKeywords:"while if switch catch for"},{begin:"\\b(?!function)"+t.UNDERSCORE_IDENT_RE+"\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",returnBegin:!0,label:"func.def",contains:[$,t.inherit(t.TITLE_MODE,{begin:n,className:"title.function"})]},{match:/\.\.\./,relevance:0},we,{match:"\\$"+n,relevance:0},{match:[/\bconstructor(?=\s*\()/],className:{1:"title.function"},contains:[$]},ve,ce,ke,ee,{match:/\$[(.]/}]}}function bt(t){const r=Qn(t),a=Be,n=["any","void","number","boolean","string","object","never","symbol","bigint","unknown"],d={beginKeywords:"namespace",end:/\{/,excludeEnd:!0,contains:[r.exports.CLASS_REFERENCE]},s={beginKeywords:"interface",end:/\{/,excludeEnd:!0,keywords:{keyword:"interface extends",built_in:n},contains:[r.exports.CLASS_REFERENCE]},l={className:"meta",relevance:10,begin:/^\s*['"]use strict['"]/},i=["type","namespace","interface","public","private","protected","implements","declare","abstract","readonly","enum","override"],c={$pattern:Be,keyword:vr.concat(i),literal:wr,built_in:Er.concat(n),"variable.language":Sr},p={className:"meta",begin:"@"+a},m=(y,x,O)=>{const U=y.contains.findIndex(J=>J.label===x);if(U===-1)throw new Error("can not find mode to replace");y.contains.splice(U,1,O)};Object.assign(r.keywords,c),r.exports.PARAMS_CONTAINS.push(p),r.contains=r.contains.concat([p,d,s]),m(r,"shebang",t.SHEBANG()),m(r,"use_strict",l);const g=r.contains.find(y=>y.label==="func.def");return g.relevance=0,Object.assign(r,{name:"TypeScript",aliases:["ts","tsx","mts","cts"]}),r}const $t="[A-Za-z$_][0-9A-Za-z$_]*",el=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends"],tl=["true","false","null","undefined","NaN","Infinity"],Dr=["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],Or=["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"],Rr=["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],rl=["arguments","this","super","console","window","document","localStorage","sessionStorage","module","global"],al=[].concat(Rr,Dr,Or);function Ir(t){const r=t.regex,a=(b,{after:f})=>{const M="</"+b[0].slice(1);return b.input.indexOf(M,f)!==-1},n=$t,d={begin:"<>",end:"</>"},s=/<[A-Za-z0-9\\._:-]+\s*\/>/,l={begin:/<[A-Za-z0-9\\._:-]+/,end:/\/[A-Za-z0-9\\._:-]+>|\/>/,isTrulyOpeningTag:(b,f)=>{const M=b[0].length+b.index,T=b.input[M];if(T==="<"||T===","){f.ignoreMatch();return}T===">"&&(a(b,{after:M})||f.ignoreMatch());let R;const B=b.input.substring(M);if(R=B.match(/^\s*=/)){f.ignoreMatch();return}if((R=B.match(/^\s+extends\s+/))&&R.index===0){f.ignoreMatch();return}}},i={$pattern:$t,keyword:el,literal:tl,built_in:al,"variable.language":rl},c="[0-9](_?[0-9])*",p=`\\.(${c})`,m="0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",g={className:"number",variants:[{begin:`(\\b(${m})((${p})|\\.)?|(${p}))[eE][+-]?(${c})\\b`},{begin:`\\b(${m})\\b((${p})\\b|\\.)?|(${p})\\b`},{begin:"\\b(0|[1-9](_?[0-9])*)n\\b"},{begin:"\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"},{begin:"\\b0[bB][0-1](_?[0-1])*n?\\b"},{begin:"\\b0[oO][0-7](_?[0-7])*n?\\b"},{begin:"\\b0[0-7]+n?\\b"}],relevance:0},y={className:"subst",begin:"\\$\\{",end:"\\}",keywords:i,contains:[]},x={begin:"html`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,y],subLanguage:"xml"}},O={begin:"css`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,y],subLanguage:"css"}},U={begin:"gql`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,y],subLanguage:"graphql"}},J={className:"string",begin:"`",end:"`",contains:[t.BACKSLASH_ESCAPE,y]},V={className:"comment",variants:[t.COMMENT(/\/\*\*(?!\/)/,"\\*/",{relevance:0,contains:[{begin:"(?=@[A-Za-z]+)",relevance:0,contains:[{className:"doctag",begin:"@[A-Za-z]+"},{className:"type",begin:"\\{",end:"\\}",excludeEnd:!0,excludeBegin:!0,relevance:0},{className:"variable",begin:n+"(?=\\s*(-)|$)",endsParent:!0,relevance:0},{begin:/(?=[^\n])\s/,relevance:0}]}]}),t.C_BLOCK_COMMENT_MODE,t.C_LINE_COMMENT_MODE]},X=[t.APOS_STRING_MODE,t.QUOTE_STRING_MODE,x,O,U,J,{match:/\$\d+/},g];y.contains=X.concat({begin:/\{/,end:/\}/,keywords:i,contains:["self"].concat(X)});const G=[].concat(V,y.contains),Z=G.concat([{begin:/\(/,end:/\)/,keywords:i,contains:["self"].concat(G)}]),$={className:"params",begin:/\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:Z},ke={variants:[{match:[/class/,/\s+/,n,/\s+/,/extends/,/\s+/,r.concat(n,"(",r.concat(/\./,n),")*")],scope:{1:"keyword",3:"title.class",5:"keyword",7:"title.class.inherited"}},{match:[/class/,/\s+/,n],scope:{1:"keyword",3:"title.class"}}]},ne={relevance:0,match:r.either(/\bJSON/,/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),className:"title.class",keywords:{_:[...Dr,...Or]}},z={label:"use_strict",className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},ie={variants:[{match:[/function/,/\s+/,n,/(?=\s*\()/]},{match:[/function/,/\s*(?=\()/]}],className:{1:"keyword",3:"title.function"},label:"func.def",contains:[$],illegal:/%/},ce={relevance:0,match:/\b[A-Z][A-Z_0-9]+\b/,className:"variable.constant"};function fe(b){return r.concat("(?!",b.join("|"),")")}const ve={match:r.concat(/\b/,fe([...Rr,"super","import"]),n,r.lookahead(/\(/)),className:"title.function",relevance:0},we={begin:r.concat(/\./,r.lookahead(r.concat(n,/(?![0-9A-Za-z$_(])/))),end:n,excludeBegin:!0,keywords:"prototype",className:"property",relevance:0},ee={match:[/get|set/,/\s+/,n,/(?=\()/],className:{1:"keyword",3:"title.function"},contains:[{begin:/\(\)/},$]},le="(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|"+t.UNDERSCORE_IDENT_RE+")\\s*=>",h={match:[/const|var|let/,/\s+/,n,/\s*/,/=\s*/,/(async\s*)?/,r.lookahead(le)],keywords:"async",className:{1:"keyword",3:"title.function"},contains:[$]};return{name:"JavaScript",aliases:["js","jsx","mjs","cjs"],keywords:i,exports:{PARAMS_CONTAINS:Z,CLASS_REFERENCE:ne},illegal:/#(?![$_A-z])/,contains:[t.SHEBANG({label:"shebang",binary:"node",relevance:5}),z,t.APOS_STRING_MODE,t.QUOTE_STRING_MODE,x,O,U,J,V,{match:/\$\d+/},g,ne,{className:"attr",begin:n+r.lookahead(":"),relevance:0},h,{begin:"("+t.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",relevance:0,contains:[V,t.REGEXP_MODE,{className:"function",begin:le,returnBegin:!0,end:"\\s*=>",contains:[{className:"params",variants:[{begin:t.UNDERSCORE_IDENT_RE,relevance:0},{className:null,begin:/\(\s*\)/,skip:!0},{begin:/\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:Z}]}]},{begin:/,/,relevance:0},{match:/\s+/,relevance:0},{variants:[{begin:d.begin,end:d.end},{match:s},{begin:l.begin,"on:begin":l.isTrulyOpeningTag,end:l.end}],subLanguage:"xml",contains:[{begin:l.begin,end:l.end,skip:!0,contains:["self"]}]}]},ie,{beginKeywords:"while if switch catch for"},{begin:"\\b(?!function)"+t.UNDERSCORE_IDENT_RE+"\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",returnBegin:!0,label:"func.def",contains:[$,t.inherit(t.TITLE_MODE,{begin:n,className:"title.function"})]},{match:/\.\.\./,relevance:0},we,{match:"\\$"+n,relevance:0},{match:[/\bconstructor(?=\s*\()/],className:{1:"title.function"},contains:[$]},ve,ce,ke,ee,{match:/\$[(.]/}]}}function Pr(t){const r=t.regex,a=r.concat(/[\p{L}_]/u,r.optional(/[\p{L}0-9_.-]*:/u),/[\p{L}0-9_.-]*/u),n=/[\p{L}0-9._:-]+/u,d={className:"symbol",begin:/&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/},s={begin:/\s/,contains:[{className:"keyword",begin:/#?[a-z_][a-z1-9_-]+/,illegal:/\n/}]},l=t.inherit(s,{begin:/\(/,end:/\)/}),i=t.inherit(t.APOS_STRING_MODE,{className:"string"}),c=t.inherit(t.QUOTE_STRING_MODE,{className:"string"}),p={endsWithParent:!0,illegal:/</,relevance:0,contains:[{className:"attr",begin:n,relevance:0},{begin:/=\s*/,relevance:0,contains:[{className:"string",endsParent:!0,variants:[{begin:/"/,end:/"/,contains:[d]},{begin:/'/,end:/'/,contains:[d]},{begin:/[^\s"'=<>`]+/}]}]}]};return{name:"HTML, XML",aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist","wsf","svg"],case_insensitive:!0,unicodeRegex:!0,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,relevance:10,contains:[s,c,i,l,{begin:/\[/,end:/\]/,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,contains:[s,l,c,i]}]}]},t.COMMENT(/<!--/,/-->/,{relevance:10}),{begin:/<!\[CDATA\[/,end:/\]\]>/,relevance:10},d,{className:"meta",end:/\?>/,variants:[{begin:/<\?xml/,relevance:10,contains:[c]},{begin:/<\?[a-z][a-z0-9]+/}]},{className:"tag",begin:/<style(?=\s|>)/,end:/>/,keywords:{name:"style"},contains:[p],starts:{end:/<\/style>/,returnEnd:!0,subLanguage:["css","xml"]}},{className:"tag",begin:/<script(?=\s|>)/,end:/>/,keywords:{name:"script"},contains:[p],starts:{end:/<\/script>/,returnEnd:!0,subLanguage:["javascript","handlebars","xml"]}},{className:"tag",begin:/<>|<\/>/},{className:"tag",begin:r.concat(/</,r.lookahead(r.concat(a,r.either(/\/>/,/>/,/\s/)))),end:/\/?>/,contains:[{className:"name",begin:a,relevance:0,starts:p}]},{className:"tag",begin:r.concat(/<\//,r.lookahead(r.concat(a,/>/))),contains:[{className:"name",begin:a,relevance:0},{begin:/>/,relevance:0,endsParent:!0}]}]}}function nl(t){const r=t.regex,a={},n={begin:/\$\{/,end:/\}/,contains:["self",{begin:/:-/,contains:[a]}]};Object.assign(a,{className:"variable",variants:[{begin:r.concat(/\$[\w\d#@][\w\d_]*/,"(?![\\w\\d])(?![$])")},n]});const d={className:"subst",begin:/\$\(/,end:/\)/,contains:[t.BACKSLASH_ESCAPE]},s={begin:/<<-?\s*(?=\w+)/,starts:{contains:[t.END_SAME_AS_BEGIN({begin:/(\w+)/,end:/(\w+)/,className:"string"})]}},l={className:"string",begin:/"/,end:/"/,contains:[t.BACKSLASH_ESCAPE,a,d]};d.contains.push(l);const i={className:"",begin:/\\"/},c={className:"string",begin:/'/,end:/'/},p={begin:/\$?\(\(/,end:/\)\)/,contains:[{begin:/\d+#[0-9a-f]+/,className:"number"},t.NUMBER_MODE,a]},m=["fish","bash","zsh","sh","csh","ksh","tcsh","dash","scsh"],g=t.SHEBANG({binary:`(${m.join("|")})`,relevance:10}),y={className:"function",begin:/\w[\w\d_]*\s*\(\s*\)\s*\{/,returnBegin:!0,contains:[t.inherit(t.TITLE_MODE,{begin:/\w[\w\d_]*/})],relevance:0},x=["if","then","else","elif","fi","for","while","until","in","do","done","case","esac","function","select"],O=["true","false"],U={match:/(\/[a-z._-]+)+/},J=["break","cd","continue","eval","exec","exit","export","getopts","hash","pwd","readonly","return","shift","test","times","trap","umask","unset"],ye=["alias","bind","builtin","caller","command","declare","echo","enable","help","let","local","logout","mapfile","printf","read","readarray","source","type","typeset","ulimit","unalias"],V=["autoload","bg","bindkey","bye","cap","chdir","clone","comparguments","compcall","compctl","compdescribe","compfiles","compgroups","compquote","comptags","comptry","compvalues","dirs","disable","disown","echotc","echoti","emulate","fc","fg","float","functions","getcap","getln","history","integer","jobs","kill","limit","log","noglob","popd","print","pushd","pushln","rehash","sched","setcap","setopt","stat","suspend","ttyctl","unfunction","unhash","unlimit","unsetopt","vared","wait","whence","where","which","zcompile","zformat","zftp","zle","zmodload","zparseopts","zprof","zpty","zregexparse","zsocket","zstyle","ztcp"],X=["chcon","chgrp","chown","chmod","cp","dd","df","dir","dircolors","ln","ls","mkdir","mkfifo","mknod","mktemp","mv","realpath","rm","rmdir","shred","sync","touch","truncate","vdir","b2sum","base32","base64","cat","cksum","comm","csplit","cut","expand","fmt","fold","head","join","md5sum","nl","numfmt","od","paste","ptx","pr","sha1sum","sha224sum","sha256sum","sha384sum","sha512sum","shuf","sort","split","sum","tac","tail","tr","tsort","unexpand","uniq","wc","arch","basename","chroot","date","dirname","du","echo","env","expr","factor","groups","hostid","id","link","logname","nice","nohup","nproc","pathchk","pinky","printenv","printf","pwd","readlink","runcon","seq","sleep","stat","stdbuf","stty","tee","test","timeout","tty","uname","unlink","uptime","users","who","whoami","yes"];return{name:"Bash",aliases:["sh"],keywords:{$pattern:/\b[a-z][a-z0-9._-]+\b/,keyword:x,literal:O,built_in:[...J,...ye,"set","shopt",...V,...X]},contains:[g,t.SHEBANG(),y,p,t.HASH_COMMENT_MODE,s,U,l,i,c,a]}}function ll(t){const r={className:"attr",begin:/"(\\.|[^\\"\r\n])*"(?=\s*:)/,relevance:1.01},a={match:/[{}[\],:]/,className:"punctuation",relevance:0},n=["true","false","null"],d={scope:"literal",beginKeywords:n.join(" ")};return{name:"JSON",keywords:{literal:n},contains:[r,a,t.QUOTE_STRING_MODE,d,t.C_NUMBER_MODE,t.C_LINE_COMMENT_MODE,t.C_BLOCK_COMMENT_MODE],illegal:"\\S"}}W.registerLanguage("typescript",bt);W.registerLanguage("tsx",bt);W.registerLanguage("javascript",Ir);W.registerLanguage("js",Ir);W.registerLanguage("xml",Pr);W.registerLanguage("html",Pr);W.registerLanguage("jsx",bt);W.registerLanguage("bash",nl);W.registerLanguage("json",ll);const dl=t=>t.includes("lTag`"),ol=t=>t.replace(/lTag`/g,"html`"),sl=t=>t.replace(/html`/g,"lTag`"),o=Aa(()=>{const t=Y(null);return ae(()=>{var l;if(!t.value)return;const r=((l=t.value.className.match(/language-(\w+)/))==null?void 0:l[1])||"typescript";if(r==="bash"){W.highlightElement(t.value),t.value.innerHTML&&(t.value.innerHTML=t.value.innerHTML.replace(/^(\s*)\$(\s)/gm,'$1<span class="bash-prompt">$</span>$2'));return}const a=t.value.textContent||"",n=dl(a),d=n?ol(a):a,s=W.highlight(d,{language:r}).value;t.value.innerHTML=n?sl(s):s}),({code:r,language:a})=>e("pre",{class:"code-block bg-gray-100 dark:bg-[#1e1e1e] p-6 rounded-lg overflow-x-auto mb-6 text-xs md:text-sm border border-gray-200 dark:border-gray-800",children:e("code",{ref:t,class:`language-${a||"typescript"}`,children:r})})}),Ar=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"소개"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent는 작고 예측 가능한 UI를 만들기 위한 경량 JavaScript 라이브러리입니다.",e("br",{}),"불필요한 마법이나 복잡한 API를 걷어내고, 단순하고 예측 가능한 방식으로 동작하는 것을 목표로 합니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"왜 Lithent를 만들었나요?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"가벼운 DOM 조작이 필요한, 용량에 민감한 환경"}),"에서도 부담 없이 사용할 수 있는 라이브러리가 필요했습니다. 기존의 많은 프레임워크들은 강력하지만, 작은 프로젝트나 라이브러리에 포함시키기엔 무겁습니다.",e("br",{}),e("br",{}),"Lithent는 이런 배경에서 탄생했습니다."," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Core만으로도 완전히 동작하는 UI를 만들 수 있습니다"}),". 상태 관리, 반응성 시스템 같은 추가 기능이 필요하다면, 언제든지"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Helper를 확장팩처럼 선택적으로 추가"}),"할 수 있습니다.",e("br",{}),e("br",{}),"필요한 것만 가져다 쓰는 방식으로, 프로젝트 규모와 요구사항에 맞춰 유연하게 확장할 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"어떻게 사용하나요?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent는 크게 두 가지 방식을 제공합니다:"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"수동 제어 기반 (Manual Mode)"}),"과"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"선언형 기반 (Light API Mode)"}),"입니다. 이 두 방식은 한 프로젝트 내에서 자유롭게 혼용할 수 있습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"수동 제어 기반 (Manual Mode)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["상태는 JavaScript 개발자에게 가장 익숙한 패턴인",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"클로저"}),"에 담깁니다. 복잡한 반응성 시스템이나 특별한 문법 없이, 그저 변수를 선언하고 사용하면 됩니다. 상태가 어디에 있는지, 어떻게 변하는지 코드를 읽는 것만으로도 명확하게 파악할 수 있습니다.",e("br",{}),e("br",{}),"이러한 투명하고 자연스러운 흐름 속에서,",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"renew()"}),'는 "이제 화면을 갱신해줘"라고 명시적으로 요청하는 단순한 함수입니다. 상태를 변경한 후 renew()를 호출하면 UI가 업데이트됩니다. 복잡한 의존성 추적도, 예측하기 어려운 자동 렌더링도 없습니다.',e("br",{}),e("br",{}),"클로저라는 친숙한 개념 위에 renew()라는 단순한 API를 더한 것만으로, 언제 무엇이 업데이트되는지 완전히 예측 가능하고 제어 가능한 UI를 만들 수 있습니다. 이것이 Lithent가 추구하는 자연스러움입니다.",e("br",{}),e("br",{}),"별도의 상태 관리 메커니즘이 필요 없기 때문에 라이브러리는 경량을 유지하면서도, 개발자는 JavaScript 본연의 방식으로 코드를 작성할 수 있습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const App = mount((renew, _props) => {
  let count = 0;

  const inc = () => {
    count += 1;
    renew();
  };

  // 반환 함수로 JSX를 감싸는 이유는 클로저로 상태를 캡슐화하기 위함입니다.
  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선언형 기반 (Light API Mode)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"상태 변화가 자동으로 UI에 반영되는 선언형 패턴입니다. 상태 생성을 위한 lstate API는 코어와 느슨하게 결합된 helper를 통해 제공되며, 필요할 때만 가볍게 가져다 사용할 수 있습니다. 상태, 컨텍스트 등 추가 기능이 필요할 때 선택적으로 활용할 수 있습니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const inc = () => {
    count.value += 1;
  };

  // 반환 함수로 JSX를 감싸는 이유는 클로저로 상태를 캡슐화하기 위함입니다.
  return () => (
    <div>
      <p>{count.value}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","상태가 전혀 필요 없는 경우에는 mount나 lmount를 사용하지 않고 일반 함수로 컴포넌트를 작성할 수도 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"점진적 적용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:"Lithent는 다양한 형태의 웹 환경에서 사용 가능합니다:"}),e("ul",{class:"list-disc list-inside space-y-2 mb-6 ml-4 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"빌드 단계없이 정적 HTML을 강화"}),e("li",{children:"싱글 페이지 애플리케이션(SPA)"}),e("li",{children:"서버 사이드 렌더링(SSR)"})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/quick-start",onClick:t=>{t.preventDefault(),v("/guide/quick-start")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"빠르게 시작하기 →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["이제 Lithent에 대한 기본적인 철학을 알았습니다!",e("br",{}),"빠르게 시작하기에서 쉽게 Lithent를 시작하는 방법을 알아봐요."]})]})})]}),il=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"빠르게 시작하기"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4",children:"Lithent 애플리케이션 생성하기"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("p",{class:"text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3",children:"📋 사전 준비사항"}),e("ul",{class:"space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("span",{children:"커맨드 라인 사용에 익숙할 것"})]}),e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("span",{children:[e("strong",{class:"font-medium text-gray-900 dark:text-white",children:"Node.js 18.12"})," ","이상 버전 설치"]})]})]})]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 섹션에서는 로컬 컴퓨터에서 Lithent 애플리케이션을 생성하는 방법을 소개합니다. 생성된 프로젝트는 Vite를 기반으로 한 빌드 환경을 사용합니다."}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"최신 버전의 Node.js가 설치되어 있는지 확인하고, 현재 작업 디렉터리가 프로젝트를 생성하려는 위치인지 확인하세요. 명령줄에서 다음 명령을 실행하세요($ 기호는 입력하지 않습니다):"}),e(o,{language:"bash",code:"$ npx create-lithent@latest"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["이 명령은 공식 Lithent 프로젝트 생성 도구인 create-lithent를 설치하고 실행합니다.",e("br",{}),e("br",{}),"실행하면 프로젝트 이름과 템플릿 유형을 선택할 수 있습니다:"]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("p",{class:"text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3",children:"📦 템플릿 유형"}),e("ul",{class:"space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("div",{children:[e("strong",{class:"font-medium text-gray-900 dark:text-white",children:"SSR (Express)"}),": 서버 사이드 렌더링을 지원하는 Express 기반 템플릿. SEO가 중요하거나 초기 로딩 성능을 최적화하려는 경우에 적합합니다."]})]}),e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("div",{children:[e("strong",{class:"font-medium text-gray-900 dark:text-white",children:"SPA (Vite)"}),": 클라이언트 사이드 렌더링만 사용하는 Vite 기반 템플릿. 빠른 개발 환경과 간단한 배포를 원하는 경우에 적합합니다."]})]})]})]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"프로젝트가 생성되면, 의존성 설치 및 개발 서버 실행을 위한 안내에 따라 진행하세요:"}),e(o,{language:"bash",code:`$ cd <your-project-name>
$ npm install
$ npm run dev`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["이제 첫 번째 Lithent 프로젝트가 실행되고 있을 것입니다!",e("br",{}),"Lithent는 여러 가지 템플릿 스타일을 지원하지만, 기본 애플리케이션은 JSX를 사용하여 생성됩니다.",e("br",{}),e("br",{}),"앱을 프로덕션에 배포할 준비가 되면 다음 명령을 실행하세요:"]}),e(o,{language:"bash",code:"$ npm run build"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 명령은 프로젝트의 ./dist 디렉터리에 프로덕션용 빌드를 생성합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4",children:"CDN에서 Lithent 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"스크립트 태그를 통해 CDN에서 직접 Lithent를 사용할 수 있습니다:"}),e(o,{language:"bash",code:'<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"><\/script>'}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["CDN에서 Lithent를 사용할 때는 빌드 단계가 필요하지 않습니다. 이로 인해 설정이 훨씬 간단해지며, 정적 HTML을 보강하거나 백엔드 프레임워크와 통합할 때 적합합니다.",e("br",{}),e("br",{}),"다만 JSX 문법은 사용할 수 없습니다. 대신 함수형으로 템플릿을 만드는 ftags 방식을 사용하거나 htm을 사용할 수 있습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"아래는 ftags를 사용한 예시입니다."}),e(o,{language:"html",code:`<!DOCTYPE html>
<html>
<head>
  <title>Lithent Counter Example</title>
</head>
<body>
  <div id="root"></div>

  <script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.umd.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js"><\/script>

  <script>
    const { render } = lithent;
    const { lstate } = lithentHelper;
    const { fTags, flMount } = lithentFTags;
    const { div, h1, button } = fTags;

    const Counter = flMount(() => {
      const count = lstate(0);

      const increment = () => {
        count.value++;
      };

      return () =>
        div(
          h1('Count: ' + count.value),
          button({ onClick: increment }, 'Increment')
        );
    });

    render(Counter(), document.getElementById('root'));
  <\/script>
</body>
</html>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["예제에서는 flMount를 사용했지만 fMount를 사용할 수도 있습니다.",e("br",{}),e("br",{}),"fMount를 사용하면 lstate와 같은 확장 기능이 필요하지 않기 때문에 helper 리소스를 별도로 로드하지 않아도 되므로, 더 적은 네트워크 비용으로 사용할 수 있습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["브라우저에서 직접 로드하는 방식으로 사용할 때 ftags가 매우 유용합니다.",e("br",{}),e("br",{}),"ftags 외에도 htm을 이용하여 사용하는 방법이 있습니다. 이 방법은 다른 섹션에서 더 자세히 설명하겠습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4",children:"ES 모듈 빌드 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"ESM으로 빌드된 버전을 사용하면 ES 모듈 문법으로 사용할 수 있습니다. 대부분의 최신 브라우저는 ES 모듈을 기본적으로 지원하므로, 다음과 같이 CDN에서 네이티브 ES 모듈로 Lithent를 사용할 수 있습니다:"}),e(o,{language:"html",code:`<!DOCTYPE html>
<html>
<head>
  <title>Lithent Counter Example (ES Module)</title>
</head>
<body>
  <div id="root"></div>

  <script type="module">
    import { render } from 'https://cdn.jsdelivr.net/npm/lithent/dist/lithent.mjs';
    import { lstate } from 'https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.mjs';
    import { fTags, flMount } from 'https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.mjs';

    const { div, h1, button } = fTags;

    const Counter = flMount(() => {
      const count = lstate(0);

      const increment = () => {
        count.value++;
      };

      return () =>
        div(
          h1('Count: ' + count.value),
          button({ onClick: increment }, 'Increment')
        );
    });

    render(Counter(), document.getElementById('root'));
  <\/script>
</body>
</html>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"보안상의 이유로, ES 모듈은 http:// 또는 https:// 프로토콜에서만 동작합니다. 즉, 브라우저가 웹에서 페이지를 열 때 사용하는 프로토콜입니다. 로컬 컴퓨터에서 ES 모듈을 사용하려면 파일을 직접 열지 말고(file://), 로컬 HTTP 서버를 통해 제공해야 합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/mounter",onClick:t=>{t.preventDefault(),v("/guide/mounter")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Mounter →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Lithent의 핵심 개념인 Mounter에 대해 알아보세요.",e("br",{}),"컴포넌트를 생성하고 초기화하는 방법을 배워봅시다."]})]})})]}),cl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mounter"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mount"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["마운터는 mount 함수의 인자로서 포함되는 함수입니다.",e("br",{}),"컴포넌트가 처음 그려질 때"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"단 한 번 호출"}),"됩니다. 컴포넌트의 상태와 메서드를 정의합니다.",e("br",{}),e("br",{}),"아래 예제는 초기값 0을 갖는 count 라는 상태와, 값을 1씩 증가시키는 increase라는 메서드를 정의되어 있습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const App = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  // Updater
  // jsx를 리턴하는 부분을 함수로 한번 감싸주는 이유는 클로저로 상태를 가두기 위한 방법입니다.
  return () => (
    <div>
      <p>{count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["mount 함수의 첫번째 인자로서 꺼내어 사용할수 있는",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"renew"}),"는 컴포넌트 갱신 함수입니다.",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Renewer"}),"섹션에서 더 자세히 다룹니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"저 마운트 함수는 jsx 표현식이 있는 또 다른 함수를 리턴하고 있는데, 업데이터라고 합니다. 업데이터는 다음 단계에서 더 자세히 다루겠습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent는 네이티브 클로저 기반의 상태관리를 컨셉으로 하기 때문에, 일반적인 변수 정의를 상태값으로 활용하고 renew api를 이용해 갱신하는것이 기본 컨셉입니다.",e("br",{}),e("br",{}),"하지만 보통 상태변경이 즉각적으로 ui에 반영되는 React-like 방식에 익숙하기 때문에 어색할 수 있으며, 상황에따라 renew api를 이용하는 방식이 쓸대없이 불편할 수 있습니다.",e("br",{}),e("br",{}),"mount 대신",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lmount"}),"와",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lstate"}),"를 함께 사용하면 를 사용하면 상태변경이 즉각적으로 ui변경을 트리거 할수 있습니다. 아래 예제를 보면 lstate를 사용하여 상태를 저장하고, lstate의 value 속성이 변경되면 즉각적으로 ui에 반영됩니다."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const App = lmount((_props) => {
  const countRef = lstate(0);

  const increase = () => {
    countRef.value += 1;
  };

  // Updater
  // jsx를 리턴하는 부분을 함수로 한번 감싸주는 이유는 클로저로 상태를 가두기 위한 방법입니다.
  return () => (
    <div>
      <p>{countRef.count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstate 덕분에 renew api의 필요성이 없어졌으므로 renew를 제공하지 않는 lmount를 사용하여 더 간결하게 컴포넌트를 정의하여 사용 가능합니다.",e("br",{}),e("br",{}),"lstate를 사용하므로서 core모듈 외에 별도의 helper 모듈을 추가로 사용해야 하므로 번들사이즈가 약간 늘어날 수 있는 단점이 있지만 유용합니다.",e("br",{}),e("br",{}),"이 모드도 여전히 클로저를 이용한 상태관리인 점은 마찬가지지만 lstate에서 값 변경시 renew 호출을 대신해주므로 사용자는 클로저기반으로 동작한다는 Lithent의 멘탈 모델 인지가 약해지는 단점이 있습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"데이터 가져오기 예시"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["마운터에서 데이터를 가져오는 것은",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"특수한 상황"}),"에 사용되는 패턴입니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"컴포넌트와 생명주기를 함께하는 데이터를 딱 한 번만 가져올 때"}),"유용합니다. 마운터는 컴포넌트가 처음 생성될 때 단 한 번만 실행되므로, 이후 props가 변경되어도 데이터를 다시 가져오지 않습니다.",e("br",{}),e("br",{}),"예를 들어, URL의 ID 파라미터로 특정 상세 페이지에 접근했을 때, 그 ID에 해당하는 데이터를 한 번만 로드하면 되는 경우에 적합합니다. 만약 props 변경에 따라 데이터를 다시 가져와야 한다면, updateCallback이나 effect 같은 다른 방법을 사용해야 합니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"아래는 포켓몬 이름을 props로 받아서, 컴포넌트 마운트 시 단 한 번 API를 호출하는 예제입니다. loading 상태를 통해 로딩 중임을 사용자에게 알리고, 데이터를 가져온 후 화면을 업데이트합니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

type Props = { name: string };

const PokemonDetail = lmount<Props>(({ name }) => {
  const detail = lstate({ img: '', info: '', title: name });
  const loading = lstate(true);

  const loadDetail = async (pokemonName: string) => {
    try {
      loading.value = true;
      const response = await fetch(\`https://pokeapi.co/api/v2/pokemon/\${pokemonName}\`);
      const data = await response.json();

      detail.value = {
        img: data.sprites.other.dream_world.front_default,
        info: \`Types: \${data.types.map(t => t.type.name).join(', ')}\`,
        title: data.name
      };
    } catch (err) {
      console.error('Failed to load Pokemon', err);
      detail.value = { img: '', info: 'Failed to load', title: pokemonName };
    } finally {
      loading.value = false;
    }
  };

  loadDetail(name);

  return () => (
    <div>
      <h2>{detail.value.title}</h2>
      {loading.value ? (
        <p>Loading...</p>
      ) : (
        <div>
          <img src={detail.value.img} alt={detail.value.title} />
          <p>{detail.value.info}</p>
        </div>
      )}
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["loadDetail 함수는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"컴포넌트가 처음 마운트될 때 단 한 번만 실행"}),"됩니다."]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","이후 다른 포켓몬을 보고 싶다면, 이 컴포넌트는 적합하지 않습니다. 버튼 클릭으로 다른 포켓몬 데이터를 가져와야 한다면 마운터가 아닌 이벤트 핸들러에서 처리해야 하고, props가 변경될 때마다 새로운 데이터를 가져와야 한다면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"updateCallback"}),"이나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"effect"}),"를 사용해야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/updater",onClick:t=>{t.preventDefault(),v("/guide/updater")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Updater →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["마운터가 단 한 번 실행된다면, Updater는 상태가 변경될 때마다 호출됩니다.",e("br",{}),"새로운 Virtual DOM을 생성하고 화면을 업데이트하는 Updater의 동작 원리를 알아보세요."]})]})})]}),ml=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Updater"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Updater란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Updater는 마운터가 반환하는 함수입니다. 마운터가 컴포넌트 생성 시"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"단 한 번만 실행"}),"되는 것과 달리, Updater는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"상태가 변경될 때마다 호출"}),"됩니다.",e("br",{}),e("br",{}),"Updater의 역할은 현재 상태를 기반으로"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"새로운 Virtual DOM을 생성"}),"하는 것입니다. Lithent는 이전 Virtual DOM과 새로운 Virtual DOM을 비교(diffing)하여 실제로 변경된 부분만 실제 DOM에 반영합니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const Counter = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew(); // Updater를 다시 호출하여 화면 업데이트
  };

  // 👇 이 함수가 바로 Updater입니다
  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"위 예제에서 화살표 함수로 반환되는 부분이 Updater입니다. renew()가 호출될 때마다 이 함수가 다시 실행되어 새로운 Virtual DOM을 생성합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"클로저를 통한 상태 접근"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Updater는 마운터 내부에서 정의되므로, 클로저를 통해 마운터에서 선언한 모든 변수와 함수에 접근할 수 있습니다. 이것이 Lithent의"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"클로저 기반 상태 관리"}),"의 핵심입니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const TodoList = mount((renew, _props) => {
  // 마운터에서 정의한 상태와 메서드
  const todos = [];
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos.push({ id: Date.now(), text: inputValue });
      inputValue = '';
      renew();
    }
  };

  const removeTodo = (id: number) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index > -1) {
      todos.splice(index, 1);
      renew();
    }
  };

  // Updater는 클로저를 통해 위의 모든 변수/함수에 접근 가능
  return () => (
    <div>
      <input
        value={inputValue}
        onInput={(e) => {
          inputValue = e.target.value;
          renew();
        }}
        placeholder="Add a todo"
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Updater 내부에서 todos, inputValue, addTodo, removeTodo 등 마운터에서 정의한 모든 것을 자유롭게 사용할 수 있습니다. 이는 JavaScript의 클로저 특성을 활용한 것입니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount에서의 Updater"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lmount를 사용할 때도 Updater의 개념은 동일합니다. 차이점은 renew를 명시적으로 호출하지 않아도 lstate 값이 변경될 때 자동으로 Updater가 호출된다는 점입니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const increase = () => {
    count.value += 1; // lstate 값 변경 시 자동으로 Updater 호출
  };

  // 이 함수가 Updater
  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lstate의 value를 변경하면 내부적으로 renew가 자동 호출되어 Updater가 실행됩니다. 결과적으로 새로운 Virtual DOM이 생성되고 화면이 업데이트됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Updater 실행 흐름"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent 컴포넌트의 업데이트 흐름은 다음과 같습니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"상태 변경 (변수 값 변경 또는 lstate.value 변경)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"renew() 호출 (수동 또는 lstate에 의해 자동)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Updater 함수 실행 → 새로운 Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"이전 Virtual DOM과 새로운 Virtual DOM 비교(Diffing)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"변경된 부분만 실제 DOM에 반영(Patching)"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이러한 흐름을 통해 Lithent는 효율적으로 화면을 업데이트합니다. Updater가 매번 전체 Virtual DOM을 반환하지만, 실제 DOM 조작은 변경된 부분에만 이루어지므로 성능이 최적화됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/props",onClick:t=>{t.preventDefault(),v("/guide/props")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Props →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트 간 데이터를 전달하는 Props에 대해 알아보세요.",e("br",{}),"부모 컴포넌트에서 자식 컴포넌트로 데이터와 함수를 전달하는 방법을 배워봅시다."]})]})})]}),xl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Props"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Props란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Props는 부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법입니다.",e("br",{}),e("br",{}),"Props는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"마운터의 두 번째 인자"}),"로 제공되며,"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Updater의 첫 번째 인자"}),"로도 제공됩니다. 컴포넌트의 생명주기 동안 동일한 참조를 유지합니다."]}),e(o,{language:"tsx",code:`import { mount, render } from 'lithent';

type Props = { name: string; age: number };

const UserCard = mount<Props>((renew, props) => {
  // props는 마운터의 두 번째 인자

  return (propsFromUpdater) => (
    // props는 Updater의 첫 번째 인자로도 제공됨
    <div>
      <h2>{props.name}</h2>
      <p>Age: {props.age}</p>
    </div>
  );
});

render(
  <UserCard name="Alice" age={25} />,
  document.getElementById('root')
);`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"TypeScript를 사용할 때는 mount 함수의 제네릭으로 Props 타입을 정의할 수 있습니다. 이를 통해 타입 안정성을 확보할 수 있습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Props 접근 방법과 주의사항"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Props는 컴포넌트의 생명주기 동안 동일한"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"참조(reference)"}),"를 유지합니다. 이는 매우 중요한 특성으로, Props에 접근하는 방식에 따라 다른 결과를 얻을 수 있습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

type Props = { count: number };

const Counter = mount<Props>((renew, props) => {
  // ⚠️ 주의: 마운터에서 구조분해 할당
  const { count: countFromMounter } = props;

  return ({ count: countFromUpdater }) => (
    <>
      {/* ✅ 항상 최신 값 - props 객체를 직접 참조 */}
      <div>count: {props.count}</div>

      {/* ❌ 고정된 값 - 마운터에서 분해한 primitive 값 */}
      <div>count: {countFromMounter} (업데이트 안 됨)</div>

      {/* ✅ 항상 최신 값 - Updater에서 받은 props */}
      <div>count: {countFromUpdater}</div>
    </>
  );
});

const Parent = mount(renew => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <Counter count={count} />
      <button onClick={increase}>Increase</button>
    </>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["위 예제에서 버튼을 클릭하면:",e("br",{}),e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"props.count"})," ","- ✅ 1, 2, 3... 정상적으로 증가",e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"countFromMounter"})," ","- ❌ 0으로 고정 (primitive 값 복사)",e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"countFromUpdater"})," ","- ✅ 1, 2, 3... 정상적으로 증가"]}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 중요:"})," 마운터에서 props를 구조분해 할당하면 그 시점의 값이 ",e("strong",{children:"복사"}),'됩니다. Primitive 타입(number, string, boolean)의 경우 "call by value"로 동작하므로, 이후 props가 업데이트되어도 마운터에서 분해한 변수는 업데이트되지 않습니다.',e("br",{}),e("br",{}),"항상 최신 값을 얻으려면"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"props.속성명"}),"으로 직접 접근하거나, Updater에서 받은 props를 사용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"함수를 Props로 전달하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Props를 통해 데이터뿐만 아니라 함수도 전달할 수 있습니다. 이를 통해 자식 컴포넌트에서 부모 컴포넌트의 상태를 변경할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

type ChildProps = {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

const CounterDisplay = mount<ChildProps>((renew, props) => {
  return () => (
    <div>
      <h2>Count: {props.count}</h2>
      <button onClick={props.onIncrement}>+</button>
      <button onClick={props.onDecrement}>-</button>
    </div>
  );
});

const Parent = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  const decrement = () => {
    count -= 1;
    renew();
  };

  return () => (
    <CounterDisplay
      count={count}
      onIncrement={increment}
      onDecrement={decrement}
    />
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"함수는 참조 타입이므로, props를 통해 전달된 함수는 항상 부모 컴포넌트의 클로저를 유지합니다. 따라서 자식 컴포넌트에서 부모의 상태를 안전하게 변경할 수 있습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"객체와 배열 Props"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"객체나 배열을 props로 전달할 때는 참조가 전달되므로, 마운터에서 구조분해 할당을 해도 객체/배열 내부의 속성은 최신 상태를 유지합니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

type User = { name: string; age: number };
type Props = { user: User };

const UserCard = mount<Props>((renew, props) => {
  // 객체는 참조 타입이므로 구조분해 해도 OK
  const { user } = props;

  return () => (
    <div>
      <h2>{user.name}</h2>
      <p>Age: {user.age}</p>
      {/* props.user로 접근해도 동일한 결과 */}
      <p>Age: {props.user.age}</p>
    </div>
  );
});

const Parent = mount(renew => {
  const user = { name: 'Alice', age: 25 };

  const increaseAge = () => {
    user.age += 1;
    renew();
  };

  return () => (
    <>
      <UserCard user={user} />
      <button onClick={increaseAge}>Increase Age</button>
    </>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"객체나 배열은 참조 타입이므로, 마운터에서 구조분해 할당을 하더라도 그 참조를 복사하는 것입니다. 따라서 객체/배열 내부의 값이 변경되면 정상적으로 업데이트됩니다."}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","객체나 배열을 props로 전달할 때는 불변성(immutability)을 유지하는 것이 좋습니다. 객체의 속성을 직접 변경하는 대신, 새로운 객체를 생성하여 전달하면 예측 가능한 상태 관리가 가능합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount에서의 Props"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lmount를 사용할 때도 Props의 동작 방식은 동일합니다. renew가 없을 뿐, props 접근 방법과 주의사항은 mount와 같습니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

type ChildProps = {
  title: string;
  onClose: () => void;
};

const Modal = lmount<ChildProps>((props) => {
  return () => (
    <div>
      <h2>{props.title}</h2>
      <button onClick={props.onClose}>Close</button>
    </div>
  );
});

const Parent = lmount(() => {
  const isOpen = lstate(false);

  const openModal = () => {
    isOpen.value = true;
  };

  const closeModal = () => {
    isOpen.value = false;
  };

  return () => (
    <>
      <button onClick={openModal}>Open Modal</button>
      {isOpen.value && (
        <Modal title="Hello Modal" onClose={closeModal} />
      )}
    </>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/children",onClick:t=>{t.preventDefault(),v("/guide/children")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core: Children →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트가 감싸는 자식 요소들인 Children에 대해 알아보세요.",e("br",{}),"Lithent에서 children이 props와 별도로 관리되는 방식을 배워봅시다."]})]})})]}),gl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Children"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Children이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Children은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트가 감싸고 있는 자식 요소들"}),"입니다.",e("br",{}),e("br",{}),"Lithent에서는 React와 달리"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"children이 props에 포함되지 않고 별도의 인자로 전달"}),"됩니다. 이는 props와 children을 명확히 분리하여 코드의 의도를 더 명확하게 만드는 Lithent의 설계 철학입니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const Card = mount<{ title: string }>(
  (renew, props, children) => {  // children은 세 번째 인자!
    return () => (
      <div class="card">
        <h2>{props.title}</h2>
        <div class="card-body">
          {children}
        </div>
      </div>
    );
  }
);

// 사용
<Card title="My Card">
  <p>This is the card content</p>
  <button>Click me</button>
</Card>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"React와의 차이점"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent는 children을 props와 별도로 관리함으로써 구조적 명확성을 제공합니다."}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"React"}),e(o,{language:"tsx",code:`// React: children이 props에 포함됨
const Card = ({ title, children }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};`})]}),e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"Lithent"}),e(o,{language:"tsx",code:`// Lithent: children이 별도 인자
const Card = mount(
  (renew, props, children) => {
    return () => (
      <div class="card">
        <h2>{props.title}</h2>
        <div>{children}</div>
      </div>
    );
  }
);`})]})]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 왜 별도 인자로?"})," ","props는 컴포넌트의 설정 데이터이고, children은 컴포넌트가 감싸는 구조입니다. 이 둘을 분리함으로써 각각의 역할이 명확해지고, 타입 안전성도 향상됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"mount에서 children 사용"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const Container = mount<{ width: number }>(
  (renew, props, children) => {
    // children은 WDom[] 타입
    // 마운터 내부에서도 접근 가능
    console.log('Children count:', children.length);

    return () => (
      <div style={{ width: \`\${props.width}px\` }}>
        {children}
      </div>
    );
  }
);

// 사용
<Container width={300}>
  <h1>Title</h1>
  <p>Content</p>
</Container>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"lmount에서 children 사용"}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';

const Container = lmount<{ width: number }>(
  (props, children) => {  // lmount는 renew 없이 props, children만
    return () => (
      <div style={{ width: \`\${props.width}px\` }}>
        {children}
      </div>
    );
  }
);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Mounter vs Updater에서의 children"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["중요한 특징:"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"children은 Mounter에서만 제공되고, Updater에서는 제공되지 않습니다."}),e("br",{}),e("br",{}),"Mounter는 컴포넌트가 처음 마운트될 때 실행되며, 이때 children이 함께 전달됩니다. 하지만 Updater는 props가 변경될 때만 실행되며, children은 이미 Mounter에서 결정되었으므로 다시 전달되지 않습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const Container = mount<{ title: string }>(
  // Mounter: renew, props, children 모두 제공
  (renew, props, children) => {
    console.log('Mounter - children:', children);

    // Updater: props만 제공 (children 없음!)
    return (props) => {
      console.log('Updater - props:', props);
      // children은 Updater에서 접근할 수 없음

      return (
        <div>
          <h1>{props.title}</h1>
          {/* 하지만 JSX에서는 사용 가능 (클로저로 캡처됨) */}
          {children}
        </div>
      );
    };
  }
);`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 클로저 캡처:"})," ","Updater에서 children을 직접 인자로 받지는 않지만, Mounter에서 선언된 children을 클로저를 통해 접근할 수 있습니다. children이 변경되면 부모 컴포넌트의 리렌더링으로 전체 컴포넌트가 다시 평가되므로, Updater만 실행되는 경우(props만 변경)에는 기존 children을 그대로 사용합니다."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"왜 Updater에서 children을 제공하지 않을까?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"1. Updater는 props 변경에만 반응"}),e("br",{}),"Updater는 컴포넌트의 props가 변경될 때만 실행됩니다. children이 변경되는 경우는 부모 컴포넌트가 리렌더링되면서 전체 컴포넌트 트리가 다시 평가되므로, Updater 시점에 children을 전달할 필요가 없습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"2. 클로저를 통한 접근으로 충분"}),e("br",{}),"Mounter에서 받은 children은 클로저를 통해 Updater에서도 자유롭게 접근할 수 있습니다. 별도로 인자를 전달하지 않아도 동일한 children 참조를 사용할 수 있습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"3. 명확한 책임 분리"}),e("br",{}),"Mounter는 컴포넌트의 초기 구조(children 포함)를 설정하고, Updater는 props 데이터 변경에만 집중합니다. 이러한 분리가 각 함수의 역할을 더 명확하게 만듭니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"내부 구조"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent 내부적으로 children은 가상 DOM 구조에서 props와 별도로 관리됩니다."}),e(o,{language:"typescript",code:`// Lithent 내부 구조 (wDom.ts)
export interface WDom {
  type?: string | null;
  tag?: string;
  props?: Props;       // 컴포넌트 props
  children?: WDom[];   // 일반 요소의 children

  compProps?: Props;   // 커스텀 컴포넌트의 props
  compChild?: WDom[];  // 커스텀 컴포넌트의 children (별도 관리!)

  // ...
}

// h 함수 시그니처
export const h = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateWDomChildren  // children은 나머지 인자
) => {
  // ...
};`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 내부 구조:"})," ","Lithent는 일반 요소의 children과 컴포넌트의 children을 구분하여 관리합니다. 컴포넌트의 경우 compProps와 compChild로 별도 저장되어 업데이트 시 효율적으로 처리됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"레이아웃 컴포넌트"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const Layout = mount<{ sidebar: boolean }>(
  (renew, props, children) => {
    return () => (
      <div class="layout">
        {props.sidebar && (
          <aside class="sidebar">
            <nav>Navigation</nav>
          </aside>
        )}
        <main class="content">
          {children}
        </main>
      </div>
    );
  }
);

// 사용
<Layout sidebar={true}>
  <h1>Page Title</h1>
  <p>Page content goes here</p>
</Layout>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"조건부 렌더링"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Accordion = mount<{ title: string }>(
  (renew, props, children) => {
    const isOpen = state(false, renew);

    return () => (
      <div class="accordion">
        <button
          onClick={() => (isOpen.value = !isOpen.value)}
          class="accordion-header"
        >
          {props.title}
          <span>{isOpen.value ? '▼' : '▶'}</span>
        </button>
        {isOpen.value && (
          <div class="accordion-body">
            {children}
          </div>
        )}
      </div>
    );
  }
);

// 사용
<Accordion title="Details">
  <p>This content is hidden by default</p>
  <p>Click the title to reveal it</p>
</Accordion>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Children 조작"}),e(o,{language:"tsx",code:`import { mount, Fragment } from 'lithent';

const List = mount<{ ordered: boolean }>(
  (renew, props, children) => {
    const Tag = props.ordered ? 'ol' : 'ul';

    return () => (
      <Tag>
        {children.map((child, index) => (
          <li key={index}>{child}</li>
        ))}
      </Tag>
    );
  }
);

// 사용
<List ordered={false}>
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</List>
// 결과:
// <ul>
//   <li><span>Item 1</span></li>
//   <li><span>Item 2</span></li>
//   <li><span>Item 3</span></li>
// </ul>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"슬롯 패턴 (Named Children)"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

interface CardSlots {
  header?: JSX.Element;
  footer?: JSX.Element;
}

const Card = mount<CardSlots>(
  (renew, props, children) => {
    return () => (
      <div class="card">
        {props.header && (
          <div class="card-header">
            {props.header}
          </div>
        )}
        <div class="card-body">
          {children}
        </div>
        {props.footer && (
          <div class="card-footer">
            {props.footer}
          </div>
        )}
      </div>
    );
  }
);

// 사용
<Card
  header={<h2>Card Title</h2>}
  footer={<button>Action</button>}
>
  <p>This is the main content</p>
</Card>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Render Props 패턴"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface MouseTrackerProps {
  render: (x: number, y: number) => JSX.Element;
}

const MouseTracker = mount<MouseTrackerProps>(
  (renew, props, children) => {
    const x = state(0, renew);
    const y = state(0, renew);

    const handleMouseMove = (e: MouseEvent) => {
      x.value = e.clientX;
      y.value = e.clientY;
    };

    return () => (
      <div
        onMouseMove={handleMouseMove}
        style={{ height: '100vh' }}
      >
        {props.render(x.value, y.value)}
        {children}
      </div>
    );
  }
);

// 사용
<MouseTracker
  render={(x, y) => (
    <div>
      Mouse position: {x}, {y}
    </div>
  )}
>
  <p>Move your mouse around</p>
</MouseTracker>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Children 타입"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Children은 WDom 배열 타입입니다. TypeScript를 사용할 때 타입을 명시할 수 있습니다."}),e(o,{language:"typescript",code:`import { mount, WDom } from 'lithent';

// children 타입은 WDom[]
const Container = mount<{ title: string }>(
  (renew, props, children: WDom[]) => {
    // children 배열 조작 가능
    const hasChildren = children.length > 0;

    return () => (
      <div>
        <h1>{props.title}</h1>
        {hasChildren ? children : <p>No content</p>}
      </div>
    );
  }
);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ props.children 없음:"})," Lithent에서는 props.children으로 접근할 수 없습니다. 항상 별도의 children 인자를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 인자 순서:"})," mount는 (renew, props, children) 순서이고, lmount는 (props, children) 순서입니다. 순서를 바꾸지 마세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ children은 배열:"})," children은 항상 WDom[] 배열입니다. 단일 child라도 배열 형태로 전달됩니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Updater에서 제공 안 됨:"})," children은 Mounter에서만 인자로 제공되며, Updater에서는 제공되지 않습니다. 하지만 클로저를 통해 Mounter의 children에 접근할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/renewer",onClick:t=>{t.preventDefault(),v("/guide/renewer")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core: Renewer →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Children 개념을 마스터했습니다!",e("br",{}),"이제 컴포넌트를 업데이트하는 Renewer에 대해 알아봅시다."]})]})})]}),hl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Renewer"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"renew()란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["renew()는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트를 업데이트하는 핵심 함수"}),"입니다. mount 함수의 첫 번째 인자로 제공되며, 상태가 변경되었을 때 이 함수를 호출하여 UI를 업데이트합니다.",e("br",{}),e("br",{}),"renew()를 호출하면 Updater 함수가 다시 실행되어 새로운 Virtual DOM이 생성되고, 이전 Virtual DOM과 비교하여 변경된 부분만 실제 DOM에 반영됩니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const Counter = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew(); // 👈 상태 변경 후 renew() 호출
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["renew()를 호출하지 않으면 상태가 변경되어도 화면이 업데이트되지 않습니다. 이것이 Lithent의"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"명시적 업데이트"})," ","철학입니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 renew()를 호출해야 할까?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["renew()는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"상태가 변경되어 화면을 업데이트해야 할 때"})," ","호출합니다. 일반적으로 이벤트 핸들러 내부에서 상태를 변경한 후 호출합니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const TodoList = mount((renew, _props) => {
  const todos = [];
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos.push({ id: Date.now(), text: inputValue });
      inputValue = '';
      renew(); // 배열에 항목 추가 후 renew()
    }
  };

  const removeTodo = (id: number) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index > -1) {
      todos.splice(index, 1);
      renew(); // 배열에서 항목 제거 후 renew()
    }
  };

  const handleInput = (e: Event) => {
    inputValue = (e.target as HTMLInputElement).value;
    renew(); // 입력값 변경 후 renew()
  };

  return () => (
    <div>
      <input value={inputValue} onInput={handleInput} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"위 예제처럼 상태를 변경하는 모든 이벤트 핸들러에서 renew()를 호출하여 화면을 업데이트합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"비동기 작업과 renew()"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"비동기 작업(API 호출, setTimeout 등)의 결과로 상태를 업데이트할 때도 renew()를 호출해야 합니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const UserProfile = mount((renew, _props) => {
  let user = null;
  let loading = true;
  let error = null;

  const fetchUser = async () => {
    try {
      loading = true;
      renew(); // 로딩 시작 시 renew()

      const response = await fetch('/api/user');
      user = await response.json();
      error = null;
    } catch (err) {
      error = err.message;
      user = null;
    } finally {
      loading = false;
      renew(); // 데이터 로드 완료 후 renew()
    }
  };

  fetchUser();

  return () => (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {user && (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"비동기 작업의 각 단계(시작, 성공, 실패)에서 상태가 변경될 때마다 renew()를 호출하여 UI를 업데이트합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"renew()의 동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"renew()가 호출되면 다음과 같은 과정이 진행됩니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"renew() 호출"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"Updater 함수 실행 → 새로운 Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"이전 Virtual DOM과 새로운 Virtual DOM 비교(Diffing)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"변경된 부분만 실제 DOM에 반영(Patching)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"updateCallback 훅 실행 (등록된 경우)"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 과정을 통해 Lithent는 효율적으로 화면을 업데이트합니다. 전체 DOM을 다시 그리는 것이 아니라, 변경된 부분만 업데이트하므로 성능이 최적화됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"renew() 최적화"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"renew()를 불필요하게 자주 호출하면 성능이 저하될 수 있습니다. 다음과 같은 방법으로 최적화할 수 있습니다:"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const OptimizedCounter = mount((renew, _props) => {
  let count = 0;
  let pendingUpdate = false;

  const scheduleUpdate = () => {
    if (!pendingUpdate) {
      pendingUpdate = true;
      // 다음 프레임에서 한 번만 업데이트
      requestAnimationFrame(() => {
        pendingUpdate = false;
        renew();
      });
    }
  };

  const increaseMany = () => {
    // 여러 번 상태를 변경하더라도 renew()는 한 번만 호출
    count += 1;
    count += 1;
    count += 1;
    scheduleUpdate(); // 배칭된 업데이트
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increaseMany}>Increase by 3</button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","대부분의 경우 일반적인 renew() 호출로 충분합니다. 위와 같은 최적화는 매우 빈번하게 업데이트가 발생하는 특수한 경우에만 필요합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount에서는 renew가 필요없다"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lmount와 lstate를 사용하면 renew()를 명시적으로 호출할 필요가 없습니다. lstate의 value가 변경되면 자동으로 renew()가 호출됩니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const increase = () => {
    count.value += 1; // renew() 자동 호출 ✨
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lstate를 사용하면 개발이 편리하지만, renew() 호출 시점을 명시적으로 제어할 수 없다는 trade-off가 있습니다. 프로젝트의 요구사항에 따라 mount와 lmount 중 적합한 방식을 선택하세요."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/render",onClick:t=>{t.preventDefault(),v("/guide/render")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Render →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트를 실제 DOM에 렌더링하는 방법을 알아보세요.",e("br",{}),"render 함수의 사용법과 컴포넌트를 마운트/언마운트하는 방법을 배워봅시다."]})]})})]}),bl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Render"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"render() 함수란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["render() 함수는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트를 실제 DOM에 마운트"}),"하는 함수입니다. Virtual DOM을 실제 DOM으로 변환하여 지정한 컨테이너 요소에 렌더링합니다.",e("br",{}),e("br",{}),"render() 함수는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"destroy 함수를 반환"}),"하여, 나중에 컴포넌트를 언마운트할 수 있습니다."]}),e(o,{language:"tsx",code:`import { render, mount } from 'lithent';

const App = mount((renew) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// 컴포넌트를 #root 요소에 렌더링
const destroy = render(<App />, document.getElementById('root'));

// 나중에 언마운트
// destroy();`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"render() 함수의 첫 번째 인자는 렌더링할 Virtual DOM이고, 두 번째 인자는 컨테이너 요소입니다. 컨테이너를 지정하지 않으면 기본적으로 document.body에 렌더링됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"render() 함수의 시그니처"}),e(o,{language:"tsx",code:`render(
  wDom: VirtualDOM,           // 렌더링할 Virtual DOM
  wrapElement?: HTMLElement,  // 컨테이너 요소 (기본값: document.body)
  afterElement?: HTMLElement  // insertBefore 참조 요소 (선택적)
): () => void                 // destroy 함수 반환`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["render() 함수는 3개의 매개변수를 받습니다:",e("br",{}),e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"wDom"}),": 렌더링할 Virtual DOM (필수)",e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"wrapElement"}),": 컨테이너 요소 (선택적, 기본값: document.body)",e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"afterElement"}),": 특정 요소 앞에 삽입할 때 사용하는 참조 요소 (선택적)"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"가장 일반적인 사용법은 컴포넌트를 특정 DOM 요소에 렌더링하는 것입니다."}),e(o,{language:"tsx",code:`import { render, mount } from 'lithent';

const Greeting = mount(() => {
  return () => <h1>Hello, Lithent!</h1>;
});

// HTML의 #app 요소에 렌더링
render(<Greeting />, document.getElementById('app'));

// 또는 document.querySelector 사용
render(<Greeting />, document.querySelector('.container'));

// 컨테이너를 지정하지 않으면 body에 렌더링
render(<Greeting />);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언마운트하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["render() 함수가 반환하는 destroy 함수를 호출하면 컴포넌트를 DOM에서 제거하고, 등록된 이벤트 리스너를 정리하며, 등록된 cleanup 콜백을 실행합니다.",e("br",{}),e("br",{}),"컴포넌트가 언마운트될 때 정리 작업(타이머 해제, 이벤트 리스너 제거 등)이 필요하다면"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"mountCallback 훅"}),"을 사용합니다. mountCallback에서 cleanup 함수를 반환하면, 컴포넌트가 언마운트될 때 자동으로 실행됩니다."]}),e(o,{language:"tsx",code:`import { render, mount, mountCallback } from 'lithent';

const Timer = mount((renew) => {
  let count = 0;

  // mountCallback으로 마운트 시 작업 등록
  mountCallback(() => {
    // 마운트 시 타이머 시작
    const intervalId = setInterval(() => {
      count += 1;
      renew();
    }, 1000);

    // cleanup 함수 반환 - 언마운트 시 자동 실행
    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {count} seconds</div>;
});

const destroy = render(<Timer />, document.getElementById('root'));

// 5초 후 타이머 컴포넌트 제거
setTimeout(() => {
  destroy(); // 컴포넌트 언마운트 및 cleanup 함수 실행
}, 5000);`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["destroy() 함수를 호출하면:",e("br",{}),e("br",{}),"1. mountCallback이 반환한 cleanup 함수 실행",e("br",{}),"2. 모든 이벤트 리스너 제거",e("br",{}),"3. DOM에서 요소 제거"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"insertBefore로 특정 위치에 삽입하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"세 번째 매개변수인 afterElement를 사용하면 특정 요소 앞에 컴포넌트를 삽입할 수 있습니다."}),e(o,{language:"tsx",code:`import { render, mount } from 'lithent';

const NewItem = mount(() => {
  return () => <li>New Item</li>;
});

// HTML 구조:
// <ul id="list">
//   <li>Item 1</li>
//   <li id="item2">Item 2</li>
//   <li>Item 3</li>
// </ul>

const container = document.getElementById('list');
const referenceElement = document.getElementById('item2');

// Item 2 앞에 New Item 삽입
render(<NewItem />, container, referenceElement);

// 결과:
// <ul id="list">
//   <li>Item 1</li>
//   <li>New Item</li>      ← 여기에 삽입됨
//   <li id="item2">Item 2</li>
//   <li>Item 3</li>
// </ul>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 기능은 동적으로 특정 위치에 컴포넌트를 삽입해야 할 때 유용합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 컴포넌트 렌더링하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"여러 개의 독립적인 컴포넌트를 각각 다른 위치에 렌더링할 수 있습니다."}),e(o,{language:"tsx",code:`import { render, mount } from 'lithent';

const Header = mount(() => {
  return () => <header>Header</header>;
});

const Sidebar = mount(() => {
  return () => <aside>Sidebar</aside>;
});

const Content = mount(() => {
  return () => <main>Content</main>;
});

// 각 컴포넌트를 독립적으로 렌더링
const destroyHeader = render(<Header />, document.getElementById('header'));
const destroySidebar = render(<Sidebar />, document.getElementById('sidebar'));
const destroyContent = render(<Content />, document.getElementById('content'));

// 필요시 개별적으로 언마운트 가능
// destroyHeader();
// destroySidebar();
// destroyContent();`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","대부분의 경우 하나의 루트 컴포넌트만 렌더링하는 것이 권장됩니다. 여러 컴포넌트를 렌더링해야 한다면, 하나의 부모 컴포넌트 안에 자식 컴포넌트로 구성하는 것이 상태 관리와 데이터 흐름 측면에서 유리합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"render()의 동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"render() 함수가 호출되면 다음과 같은 과정이 진행됩니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"Virtual DOM을 실제 DOM 요소로 변환 (wDomToDom)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"컨테이너에 요소 추가 (appendChild 또는 insertBefore)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"mountCallback 훅 실행 (등록된 경우)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"mountReadyCallback 훅 실행 (등록된 경우)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"destroy 함수 반환"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 과정을 통해 Virtual DOM이 실제 브라우저 화면에 표시되고, 라이프사이클 훅이 적절한 순서로 실행됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/portal",onClick:t=>{t.preventDefault(),v("/guide/portal")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Portal →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트를 부모 DOM 계층 외부로 렌더링하는 Portal 기능을 알아보세요.",e("br",{}),"모달, 툴팁 등을 구현할 때 유용한 Portal의 사용법을 배워봅시다."]})]})})]}),ul=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Portal"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Portal이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Portal은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트를 부모 DOM 계층 외부로 렌더링"}),"하는 기능입니다.",e("br",{}),e("br",{}),"일반적으로 컴포넌트는 부모의 DOM 트리 안에 렌더링됩니다. 하지만"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"모달(Modal)"}),"이나"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"툴팁(Tooltip)"}),"처럼 화면 위에 떠 있어야 하는 UI는 부모의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"overflow: hidden"})," ","이나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"z-index"})," ","때문에 가려지거나 잘릴 수 있습니다.",e("br",{}),e("br",{}),"Portal을 사용하면 이런 문제를 해결할 수 있습니다. 컴포넌트의 상태와 생명주기는 부모와 함께 유지하면서도, DOM 상에서는 완전히 다른 위치에 렌더링됩니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"가장 간단한 Portal 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Portal을 사용하는 가장 일반적인 방법은"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"document.body"}),"에 렌더링하는 것입니다. 모달을 예로 들어보겠습니다:"]}),e(o,{language:"tsx",code:`import { mount, portal } from 'lithent';

const Modal = mount<{ onClose: () => void }>(() => {
  return ({ onClose }) => (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Modal Title</h2>
        <p>This modal is rendered outside the parent DOM!</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
});

const App = mount((renew) => {
  let showModal = false;

  const openModal = () => {
    showModal = true;
    renew();
  };

  const closeModal = () => {
    showModal = false;
    renew();
  };

  return () => (
    <div class="app-container" style="overflow: hidden; position: relative;">
      {/* 부모 컨테이너에 overflow: hidden이 있어도 */}
      <h1>My App</h1>
      <button onClick={openModal}>Open Modal</button>

      {/* 모달은 document.body에 렌더링되어 정상 표시됨 */}
      {showModal && portal(
        <Modal onClose={closeModal} />,
        document.body
      )}
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["위 예제에서 App 컴포넌트의 컨테이너에"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"overflow: hidden"}),"이 적용되어 있지만, Modal은 document.body에 렌더링되므로 아무 문제없이 화면 전체를 덮을 수 있습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Portal API"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"portal() 함수는 두 개의 인자를 받습니다:"}),e(o,{language:"tsx",code:`import { portal } from 'lithent';

portal(
  wDom,           // 렌더링할 Virtual DOM
  targetElement   // 대상 HTMLElement (예: document.body)
)`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"wDom"}),": 렌더링할 컴포넌트나 JSX 요소",e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"targetElement"}),": Portal이 렌더링될 실제 DOM 요소"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"HTML에 미리 정의된 컨테이너 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"대규모 앱에서는 HTML에 Portal 전용 컨테이너를 미리 만들어두는 것이 좋습니다. 이렇게 하면 모달, 툴팁 등을 계층적으로 관리할 수 있습니다:"}),e(o,{language:"html",code:`<!-- index.html -->
<!DOCTYPE html>
<html>
<body>
  <div id="root"></div>
  <!-- Portal 전용 컨테이너들 -->
  <div id="modal-root"></div>
  <div id="tooltip-root"></div>
</body>
</html>`}),e(o,{language:"tsx",code:`import { mount, portal } from 'lithent';

const Toast = mount<{ message: string; type: 'success' | 'error' }>(() => {
  return ({ message, type }) => (
    <div class={\`toast toast-\${type}\`}>
      {message}
    </div>
  );
});

const App = mount((renew) => {
  let toastMessage = null;

  const showSuccess = () => {
    toastMessage = { message: 'Success!', type: 'success' };
    renew();

    // 3초 후 자동으로 사라짐
    setTimeout(() => {
      toastMessage = null;
      renew();
    }, 3000);
  };

  return () => (
    <div>
      <button onClick={showSuccess}>Show Toast</button>

      {/* modal-root 컨테이너에 렌더링 */}
      {toastMessage && portal(
        <Toast {...toastMessage} />,
        document.getElementById('modal-root')!
      )}
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["이 방식의 장점:",e("br",{}),e("br",{}),"• 모달, 툴팁 등을 용도별로 분리하여 z-index 관리가 쉬움",e("br",{}),"• CSS 스타일링이 명확해짐",e("br",{}),"• 디버깅 시 DOM 구조 파악이 쉬움"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩된 컴포넌트에서 Portal 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Portal은 깊게 중첩된 컴포넌트에서도 작동합니다. 컴포넌트의 상태와 생명주기는 부모와 함께 유지됩니다:"}),e(o,{language:"tsx",code:`import { mount, portal } from 'lithent';

// 중첩된 자식 컴포넌트
const ConfirmDialog = mount<{ message: string; onConfirm: () => void }>(() => {
  return ({ message, onConfirm }) => (
    <div class="dialog">
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
});

// 중간 컴포넌트
const UserCard = mount<{ name: string }>((renew) => {
  let showDialog = false;

  const deleteUser = () => {
    showDialog = true;
    renew();
  };

  const confirmDelete = () => {
    console.log('User deleted!');
    showDialog = false;
    renew();
  };

  return ({ name }) => (
    <div class="card">
      <h3>{name}</h3>
      <button onClick={deleteUser}>Delete</button>

      {/* 중첩된 컴포넌트에서도 Portal 사용 가능 */}
      {showDialog && portal(
        <ConfirmDialog
          message={\`Delete \${name}?\`}
          onConfirm={confirmDelete}
        />,
        document.body
      )}
    </div>
  );
});

// 부모 컴포넌트
const App = mount(() => {
  return () => (
    <div class="app" style="overflow: hidden;">
      <UserCard name="Alice" />
      <UserCard name="Bob" />
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["이 예제에서 UserCard 컴포넌트는 App의 자식이고, ConfirmDialog는 UserCard의 자식입니다. 하지만 Dialog는 document.body에 렌더링되므로 App의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"overflow: hidden"}),"에 영향받지 않습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Portal의 동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Portal은 내부적으로 다음과 같이 동작합니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"portal(wDom, element)"})," ","호출 시 'portal' 타입의 특수한 Virtual DOM 노드 생성"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"렌더링 시 Portal 노드는 부모 DOM 트리에 추가되지 않고, 지정된 HTMLElement를 컨테이너로 사용"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Portal 내부의 컴포넌트는 부모 컴포넌트와 동일한 상태와 생명주기 공유"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"부모가 renew()를 호출하면 Portal 내부도 함께 업데이트됨"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"부모가 언마운트되면 Portal 내부도 함께 정리됨"})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 이벤트 버블링:"})," Portal로 렌더링된 요소에서 발생한 이벤트는 ",e("strong",{children:"컴포넌트 트리를 따라 버블링"}),"됩니다. DOM 트리와는 무관합니다. 예를 들어, Modal 내부의 클릭 이벤트가 부모 컴포넌트로 전파될 수 있으므로"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"e.stopPropagation()"}),"을 사용해야 할 수 있습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ CSS 스타일:"})," Portal로 렌더링된 요소는 대상 위치의 CSS를 상속받습니다. 부모 컴포넌트의 스타일은 상속되지 않으므로, Portal 컴포넌트는 독립적인 스타일을 가져야 합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 서버 사이드 렌더링:"})," Portal은 브라우저 환경에서만 동작합니다. SSR 환경에서는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"typeof window !== 'undefined'"})," ","체크가 필요할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/mount-hooks",onClick:t=>{t.preventDefault(),v("/guide/mount-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Mount Hooks →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트의 마운트 시점에 실행되는 mountCallback과 mountReadyCallback 훅에 대해 알아보세요.",e("br",{}),"컴포넌트 생명주기를 제어하는 방법을 배워봅시다."]})]})})]}),pl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mount Hooks"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountCallback이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["mountCallback은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트가 DOM에 마운트된 후 실행되는 훅"}),"입니다. 마운터 내부에서 호출하며, 컴포넌트가 화면에 표시된 직후에 실행됩니다.",e("br",{}),e("br",{}),"mountCallback의 주요 용도:",e("br",{}),e("br",{}),"• 타이머 설정 (setTimeout, setInterval)",e("br",{}),"• DOM 이벤트 리스너 등록",e("br",{}),"• 외부 라이브러리 초기화",e("br",{}),"• 데이터 구독 (subscription)",e("br",{}),"• 초기 데이터 로딩",e("br",{}),e("br",{}),"그리고"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"cleanup 함수를 반환"}),"하면, 컴포넌트가 언마운트될 때 자동으로 정리 작업을 수행합니다."]}),e(o,{language:"tsx",code:`import { mount, mountCallback } from 'lithent';

const Timer = mount((renew) => {
  let seconds = 0;

  mountCallback(() => {
    // 마운트 후 실행: 타이머 시작
    const intervalId = setInterval(() => {
      seconds += 1;
      renew();
    }, 1000);

    // cleanup 함수 반환: 언마운트 시 타이머 정리
    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {seconds}s</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"DOM 요소에 접근하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"mountCallback은 DOM이 생성된 후에 실행되므로, ref로 DOM 요소에 안전하게 접근할 수 있습니다. 이는 외부 라이브러리를 초기화하거나 DOM 이벤트 리스너를 등록할 때 유용합니다."}),e(o,{language:"tsx",code:`import { mount, mountCallback, ref } from 'lithent';

const Chart = mount(() => {
  const canvasRef = ref<HTMLCanvasElement>(null);

  mountCallback(() => {
    // 이 시점에 canvasRef.value는 실제 DOM 요소
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d');

      // 차트 라이브러리 초기화 (예: Chart.js)
      const chart = new ChartLibrary(ctx, {
        type: 'line',
        data: { /* ... */ }
      });

      // cleanup: 차트 인스턴스 정리
      return () => {
        chart.destroy();
      };
    }
  });

  return () => <canvas ref={canvasRef} width="400" height="300" />;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"이벤트 리스너 등록하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"window나 document 같은 전역 객체에 이벤트 리스너를 등록할 때 mountCallback을 사용합니다. cleanup 함수에서 리스너를 제거하면 메모리 누수를 방지할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount, mountCallback } from 'lithent';

const WindowSize = mount((renew) => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  mountCallback(() => {
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renew();
    };

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // cleanup: 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return () => (
    <div>
      Window size: {width} x {height}
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"데이터 구독하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"WebSocket 연결, 이벤트 스트림, 또는 상태 관리 라이브러리 구독 등에도 mountCallback을 사용합니다."}),e(o,{language:"tsx",code:`import { mount, mountCallback } from 'lithent';

const LiveData = mount((renew) => {
  let data = null;
  let status = 'connecting';

  mountCallback(() => {
    // WebSocket 연결
    const ws = new WebSocket('wss://example.com/live');

    ws.onopen = () => {
      status = 'connected';
      renew();
    };

    ws.onmessage = (event) => {
      data = JSON.parse(event.data);
      renew();
    };

    ws.onerror = () => {
      status = 'error';
      renew();
    };

    // cleanup: WebSocket 연결 종료
    return () => {
      ws.close();
    };
  });

  return () => (
    <div>
      <p>Status: {status}</p>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 mountCallback 등록하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"하나의 컴포넌트에서 여러 개의 mountCallback을 등록할 수 있습니다. 각각의 mountCallback은 독립적으로 동작하며, 등록된 순서대로 실행됩니다."}),e(o,{language:"tsx",code:`import { mount, mountCallback } from 'lithent';

const MultipleCallbacks = mount((renew) => {
  let mousePos = { x: 0, y: 0 };
  let time = new Date();

  // 첫 번째 mountCallback: 마우스 이동 추적
  mountCallback(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };
      renew();
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  });

  // 두 번째 mountCallback: 시간 업데이트
  mountCallback(() => {
    const intervalId = setInterval(() => {
      time = new Date();
      renew();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  // 세 번째 mountCallback: 초기 로그
  mountCallback(() => {
    console.log('Component mounted!');

    return () => {
      console.log('Component unmounted!');
    };
  });

  return () => (
    <div>
      <p>Mouse: ({mousePos.x}, {mousePos.y})</p>
      <p>Time: {time.toLocaleTimeString()}</p>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"각 mountCallback은 독립적인 cleanup 함수를 가질 수 있어서, 관련된 설정과 정리 작업을 함께 묶어두면 코드가 깔끔해집니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountReadyCallback과의 차이"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent는 두 가지 마운트 관련 훅을 제공합니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ul",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountCallback"}),": ",e("strong",{children:"DOM 마운트 후"})," 실행. DOM 요소에 접근 가능하며, 가장 일반적으로 사용됨."]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountReadyCallback"}),": ",e("strong",{children:"Virtual DOM 생성 직후, DOM 마운트 전"})," 실행. DOM에 접근할 수 없지만, 더 빠른 시점에 실행됨."]})]})]})}),e(o,{language:"tsx",code:`import { mount, mountCallback, mountReadyCallback, ref } from 'lithent';

const Example = mount(() => {
  const divRef = ref<HTMLDivElement>(null);

  mountReadyCallback(() => {
    console.log('1. Virtual DOM created');
    console.log('divRef.value:', divRef.value); // null (아직 DOM 없음)
  });

  mountCallback(() => {
    console.log('2. DOM mounted');
    console.log('divRef.value:', divRef.value); // HTMLDivElement (DOM 존재)
  });

  return () => <div ref={divRef}>Hello</div>;
});

// 실행 순서:
// 1. Virtual DOM created
// divRef.value: null
// 2. DOM mounted
// divRef.value: <div>Hello</div>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["대부분의 경우"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountCallback"}),"만 사용하면 충분합니다. mountReadyCallback은 특수한 경우에만 사용합니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"mountCallback의 실행 흐름:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"마운터 실행 시 mountCallback 호출로 콜백 함수 등록 (아직 실행 안 됨)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"Virtual DOM을 실제 DOM으로 변환"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"DOM을 화면에 렌더링"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"등록된 mountCallback 함수들을 순서대로 실행 (이제 DOM 접근 가능)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"cleanup 함수가 반환되면 unmount 시점까지 보관"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"6."}),e("span",{children:"컴포넌트 언마운트 시 cleanup 함수들을 역순으로 실행하여 정리"})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ cleanup은 선택적:"})," cleanup 함수를 반환하지 않아도 됩니다. 정리 작업이 필요 없다면 아무것도 반환하지 마세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," mountCallback은 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 비동기 함수 주의:"})," mountCallback에 async 함수를 전달하면 cleanup 함수를 제대로 등록할 수 없습니다. 비동기 작업이 필요하다면 내부에서 처리하세요.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:`// ❌ 잘못된 사용
mountCallback(async () => {
  await fetchData();
  return () => cleanup(); // async 함수는 Promise를 반환하므로 작동 안 함
});

// ✅ 올바른 사용
mountCallback(() => {
  fetchData().then(data => { /* ... */ });
  return () => cleanup();
});`})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/update-hooks",onClick:t=>{t.preventDefault(),v("/guide/update-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Update Hooks →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트가 업데이트될 때 실행되는 updateCallback 훅에 대해 알아보세요.",e("br",{}),"상태 변경 후 추가 작업을 수행하는 방법을 배워봅시다."]})]})})]}),yl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Update Hooks"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"updateCallback이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["updateCallback은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트가 업데이트될 때 실행되는 훅"}),"입니다. 중요한 점은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"두 단계로 동작"}),"한다는 것입니다:",e("br",{}),e("br",{}),"1."," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"updateCallback 함수 자체"}),": dependencies가 변경되었을 때 ",e("strong",{children:"업데이트 전에"})," 실행",e("br",{}),"2."," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"반환하는 함수"}),": ",e("strong",{children:"DOM 업데이트 후에"})," 실행",e("br",{}),e("br",{}),"updateCallback의 주요 용도:",e("br",{}),e("br",{}),"• 업데이트 전 준비 작업 (데이터 가져오기, 계산 등)",e("br",{}),"• DOM 업데이트 후 작업 (스크롤 조정, 애니메이션 등)",e("br",{}),"• 외부 라이브러리와 동기화",e("br",{}),"• 특정 값 변경 감지 및 부수 효과 실행"]}),e(o,{language:"tsx",code:`import { mount, updateCallback } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  updateCallback(() => {
    console.log('1. 업데이트 전: Count is', count);

    // 반환하는 함수는 DOM 업데이트 후 실행
    return () => {
      console.log('2. 업데이트 후: DOM updated with count', count);
    };
  });

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// 버튼 클릭 시 출력 순서:
// 1. 업데이트 전: Count is 1
// (DOM 업데이트)
// 2. 업데이트 후: DOM updated with count 1`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"dependencies로 실행 조건 지정하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["updateCallback의 두 번째 인자로"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"dependencies 함수"}),"를 전달하면, 지정한 값이 변경되었을 때만 실행됩니다. 이는 불필요한 실행을 방지하여 성능을 최적화합니다."]}),e(o,{language:"tsx",code:`import { mount, updateCallback } from 'lithent';

const UserProfile = mount((renew) => {
  let userId = 1;
  let theme = 'light';

  const changeUser = () => {
    userId += 1;
    renew();
  };

  const toggleTheme = () => {
    theme = theme === 'light' ? 'dark' : 'light';
    renew();
  };

  // userId가 변경될 때만 실행
  updateCallback(() => {
    console.log('User changed! Loading new data for user:', userId);
    // API 호출 등 부수 효과 실행
  }, () => [userId]); // dependencies: userId만 감시

  // theme가 변경될 때만 실행
  updateCallback(() => {
    console.log('Theme changed to:', theme);
    document.body.className = theme;
  }, () => [theme]); // dependencies: theme만 감시

  return () => (
    <div>
      <p>User ID: {userId}</p>
      <p>Theme: {theme}</p>
      <button onClick={changeUser}>Change User</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:'위 예제에서 "Change User"를 클릭하면 userId 관련 updateCallback만 실행되고, "Toggle Theme"를 클릭하면 theme 관련 updateCallback만 실행됩니다.'}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"반환 함수: DOM 업데이트 후 작업"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["updateCallback이 반환하는 함수는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"DOM 업데이트 후"}),"에 실행됩니다. 이는 업데이트된 DOM에 접근하거나 외부 라이브러리를 동기화할 때 유용합니다."]}),e(o,{language:"tsx",code:`import { mount, updateCallback, ref } from 'lithent';

const AnimatedBox = mount((renew) => {
  const boxRef = ref<HTMLDivElement>(null);
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  updateCallback(() => {
    console.log('업데이트 시작, count:', count);

    // 반환 함수: DOM 업데이트 후 실행
    return () => {
      if (boxRef.value) {
        // 업데이트된 DOM 요소에 애니메이션 적용
        boxRef.value.classList.add('flash');
        setTimeout(() => {
          boxRef.value?.classList.remove('flash');
        }, 300);
        console.log('DOM 업데이트 완료, 애니메이션 실행');
      }
    };
  }, () => [count]);

  return () => (
    <div>
      <div ref={boxRef}>Count: {count}</div>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 예제는 count가 변경될 때마다 DOM 업데이트 후 애니메이션을 트리거합니다. 반환 함수가 실행되는 시점에는 이미 DOM이 업데이트되어 있으므로, boxRef.value로 최신 DOM 요소에 안전하게 접근할 수 있습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제: 채팅 스크롤 자동 조정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"반환 함수는 DOM 업데이트 후 실행되므로, 새로운 DOM 요소에 접근할 수 있습니다. 채팅 메시지가 추가될 때 스크롤을 자동으로 맨 아래로 이동하는 예제입니다."}),e(o,{language:"tsx",code:`import { mount, updateCallback, ref } from 'lithent';

const ChatMessages = mount((renew) => {
  const messages = [];
  const containerRef = ref<HTMLDivElement>(null);

  const addMessage = (text: string) => {
    messages.push({ id: Date.now(), text });
    renew();
  };

  // messages가 변경될 때마다 실행
  updateCallback(() => {
    console.log('메시지 개수:', messages.length);

    // 반환 함수: DOM 업데이트 후 스크롤 조정
    return () => {
      if (containerRef.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight;
        console.log('스크롤 위치 조정 완료');
      }
    };
  }, () => [messages.length]);

  return () => (
    <div>
      <div ref={containerRef} style="height: 300px; overflow-y: auto;">
        {messages.map(msg => (
          <div key={msg.id}>{msg.text}</div>
        ))}
      </div>
      <button onClick={() => addMessage('New message')}>
        Add Message
      </button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제: 외부 라이브러리 동기화"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent의 상태가 변경될 때 외부 차트 라이브러리를 동기화하는 예제입니다. 업데이트 전에 데이터를 준비하고, DOM 업데이트 후 차트를 갱신합니다."}),e(o,{language:"tsx",code:`import { mount, updateCallback, ref } from 'lithent';

const DataChart = mount((renew) => {
  const canvasRef = ref<HTMLCanvasElement>(null);
  const data = [10, 20, 30, 40, 50];
  let chart = null;

  const addData = () => {
    data.push(Math.floor(Math.random() * 100));
    renew();
  };

  updateCallback(() => {
    console.log('데이터 준비:', data.length, 'points');

    // 반환 함수: DOM 업데이트 후 차트 동기화
    return () => {
      if (!canvasRef.value) return;

      if (!chart) {
        // 첫 실행: 차트 생성
        chart = new ChartLibrary(canvasRef.value, {
          type: 'line',
          data: { values: data }
        });
        console.log('차트 생성 완료');
      } else {
        // 이후 실행: 차트 데이터 갱신
        chart.updateData({ values: data });
        console.log('차트 업데이트 완료');
      }
    };
  }, () => [data.length]);

  return () => (
    <div>
      <canvas ref={canvasRef} />
      <button onClick={addData}>Add Data Point</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 updateCallback 등록하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"하나의 컴포넌트에서 여러 개의 updateCallback을 등록할 수 있습니다. 각각 다른 dependencies를 가질 수 있어서, 관련된 로직을 분리하여 관리할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount, updateCallback } from 'lithent';

const Dashboard = mount((renew) => {
  let activeTab = 'overview';
  let dataRefreshCount = 0;
  let lastUpdate = new Date();

  const switchTab = (tab: string) => {
    activeTab = tab;
    renew();
  };

  const refreshData = () => {
    dataRefreshCount += 1;
    lastUpdate = new Date();
    renew();
  };

  // 1. activeTab 변경 시 로깅
  updateCallback(() => {
    console.log('Tab switched to:', activeTab);
    // 분석 전송
  }, () => [activeTab]);

  // 2. 데이터 갱신 시 알림 표시
  updateCallback(() => {
    if (dataRefreshCount > 0) {
      console.log('Data refreshed at:', lastUpdate);
      // 토스트 알림 표시
    }
  }, () => [dataRefreshCount]);

  // 3. 모든 업데이트 시 실행 (dependencies 없음)
  updateCallback(() => {
    console.log('Component updated');
  });

  return () => (
    <div>
      <button onClick={() => switchTab('overview')}>Overview</button>
      <button onClick={() => switchTab('details')}>Details</button>
      <button onClick={refreshData}>Refresh Data</button>
      <div>Active: {activeTab}</div>
      <div>Refresh count: {dataRefreshCount}</div>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"의존성 배열 동작"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["dependencies는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"배열을 반환하는 함수"}),"여야 합니다. 이 함수가 반환하는 배열의 값이 변경되었을 때만 updateCallback이 실행됩니다.",e("br",{}),e("br",{}),"Lithent는 클로저 기반으로 동작하므로, updateCallback 내부에서 외부 변수를 자유롭게 참조할 수 있습니다. 의존성 배열은 React와 달리 모든 외부 값을 포함할 필요가 없으며, 단순히 콜백을 재실행할 시점을 결정하는 조건으로만 사용됩니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 왜 함수로 설계되었나요?"}),e("br",{}),e("br",{}),"Lithent는 ",e("strong",{class:"font-semibold",children:"클로저 기반 상태 관리"}),"를 사용합니다. 컴포넌트의 상태(userId, status 등)는 클로저 변수로 존재하며, 매 업데이트 시점마다 변경 여부를 확인하려면"," ",e("strong",{class:"font-semibold",children:"그 시점의 최신 값"}),"을 읽어야 합니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"() => [userId, status]"}),"처럼 함수로 설계하면, 의존성을 확인할 때마다 이 함수를 호출하여"," ",e("strong",{class:"font-semibold",children:"항상 최신 클로저 값"}),"을 가져올 수 있습니다. 함수 호출 시점에 userId와 status의 현재 값을 읽어 배열로 반환하므로, 이전 값과 비교하여 변경 여부를 정확히 감지할 수 있습니다."]})}),e(o,{language:"tsx",code:`import { mount, updateCallback } from 'lithent';

const UserProfile = mount<{ userId: number }>((renew, props) => {
  // 클로저 변수로 상태 관리
  let userName = 'John';
  let userAge = 25;

  updateCallback(() => {
    console.log('User or age changed!');
  }, () => [userName, userAge]);
  // ☝️ 함수를 호출하여 [userName, userAge]를 반환
  //    매 업데이트 시점의 최신 값으로 배열 생성

  const updateName = () => {
    userName = 'Jane';
    renew();
    // renew 호출 → 업데이트 시작
    // → () => [userName, userAge] 함수 실행
    // → ['Jane', 25] 반환
    // → 이전 값 ['John', 25]와 비교
    // → 변경 감지! updateCallback 실행
  };

  return () => (
    <div>
      <h1>User: {userName}</h1>
      <p>Age: {userAge}</p>
      <button onClick={updateName}>Change Name</button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ",'React의 useEffect와 달리, Lithent의 updateCallback은 클로저를 통해 항상 최신 값을 참조합니다. 의존성 배열은 단순히 "언제 재실행할지"만 결정합니다.']})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountCallback vs updateCallback"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"두 훅의 차이를 명확히 이해하는 것이 중요합니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ul",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountCallback"}),": 컴포넌트가 ",e("strong",{children:"처음 마운트될 때 단 한 번"})," 실행. 초기화 작업에 적합."]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"updateCallback"}),": 컴포넌트가 ",e("strong",{children:"업데이트될 때마다"})," 실행. 상태 변경에 대한 부수 효과에 적합."]})]})]})}),e(o,{language:"tsx",code:`import { mount, mountCallback, updateCallback } from 'lithent';

const Example = mount((renew) => {
  let count = 0;

  // 마운트 시 단 한 번 실행
  mountCallback(() => {
    console.log('1. mountCallback 실행');

    return () => {
      console.log('Unmounted!');
    };
  });

  // 매 업데이트마다 실행 (마운트 시에도 실행됨)
  updateCallback(() => {
    console.log('2. updateCallback 실행 (업데이트 전)');

    return () => {
      console.log('3. updateCallback 반환 함수 (DOM 업데이트 후)');
    };
  });

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// 마운트 시:
// 1. mountCallback 실행
// 2. updateCallback 실행 (업데이트 전)
// (DOM 마운트)
// 3. updateCallback 반환 함수 (DOM 업데이트 후)

// 버튼 클릭 시:
// 2. updateCallback 실행 (업데이트 전)
// (DOM 업데이트)
// 3. updateCallback 반환 함수 (DOM 업데이트 후)`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"updateCallback의 실행 흐름:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"마운터 실행 시 updateCallback 호출로 콜백 함수 등록"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"renew() 호출로 Updater 실행 → 새로운 Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"등록된 updateCallback들의 dependencies 확인"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:["dependencies가 변경된 경우, effectAction ",e("strong",{children:"즉시 실행"})]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"effectAction이 반환하는 함수를 큐(upCB)에 저장"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"6."}),e("span",{children:"Virtual DOM 비교 및 실제 DOM 업데이트"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"7."}),e("span",{children:"큐에 저장된 반환 함수들을 순서대로 실행 (DOM 업데이트 후)"})]})]})}),e(o,{language:"tsx",code:`// 실행 흐름 예시
updateCallback(() => {
  console.log('A. dependencies 변경 감지됨 - 즉시 실행');

  return () => {
    console.log('B. DOM 업데이트 후 실행');
  };
}, () => [someValue]);

// renew() 호출 시:
// 1. Updater 실행 (Virtual DOM 생성)
// 2. dependencies 확인
// 3. "A. dependencies 변경 감지됨 - 즉시 실행" 출력
// 4. 반환 함수 큐에 저장
// 5. DOM 업데이트
// 6. "B. DOM 업데이트 후 실행" 출력`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 두 단계 실행 이해하기:"})," ","updateCallback 자체는 dependencies 변경 시 즉시 실행되고, 반환 함수는 DOM 업데이트 후 실행됩니다. 이 차이를 정확히 이해해야 합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ dependencies는 함수로 전달:"})," ","dependencies는 배열이 아닌 ",e("strong",{children:"배열을 반환하는 함수"}),'로 전달해야 합니다. Lithent의 클로저 기반 상태 관리 방식 때문입니다. 자세한 내용은 위의 "의존성 배열 동작" 섹션을 참고하세요.',e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 무한 루프 주의:"})," 반환 함수에서 renew()를 호출하면 무한 루프가 발생할 수 있습니다. 조건부로 renew()를 호출하거나 dependencies를 잘 설정하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," updateCallback은 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 첫 렌더링에도 실행:"})," updateCallback은 마운트 시점에도 실행됩니다. 마운트 이후 업데이트만 감지하려면 별도의 플래그를 사용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/mount-ready-hooks",onClick:t=>{t.preventDefault(),v("/guide/mount-ready-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Mount Ready Hooks →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Virtual DOM 생성 직후 실행되는 mountReadyCallback 훅에 대해 알아보세요.",e("br",{}),"DOM 마운트 전에 실행해야 하는 작업을 처리하는 방법을 배워봅시다."]})]})})]}),kl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mount Ready Hooks"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountReadyCallback이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["mountReadyCallback은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Virtual DOM이 생성된 직후, 실제 DOM에 마운트되기 전에 실행되는 훅"}),"입니다.",e("br",{}),e("br",{}),"mountCallback보다"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"더 빠른 시점"}),"에 실행되므로, DOM이 필요 없는 초기화 작업에 적합합니다. 하지만 이 시점에는 아직 실제 DOM이 생성되지 않았으므로,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"ref.value는 null"}),"입니다."]}),e(o,{language:"tsx",code:`import { mount, mountReadyCallback } from 'lithent';

const Component = mount((renew) => {
  let isInitialized = false;

  mountReadyCallback(() => {
    console.log('Virtual DOM 생성됨 (DOM은 아직 없음)');
    isInitialized = true;

    // cleanup 함수: 언마운트 시 실행
    return () => {
      console.log('Component unmounted');
    };
  });

  return () => <div>{isInitialized ? 'Initialized' : 'Not ready'}</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountCallback vs mountReadyCallback"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"두 훅의 차이를 정확히 이해하는 것이 중요합니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ul",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountReadyCallback"}),": Virtual DOM 생성 직후 실행. ",e("strong",{children:"DOM 접근 불가"}),". 더 빠른 초기화."]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountCallback"}),": 실제 DOM 마운트 후 실행. ",e("strong",{children:"DOM 접근 가능"}),". 가장 일반적으로 사용."]})]})]})}),e(o,{language:"tsx",code:`import { mount, mountReadyCallback, mountCallback, ref } from 'lithent';

const Example = mount(() => {
  const divRef = ref<HTMLDivElement>(null);

  mountReadyCallback(() => {
    console.log('1. mountReadyCallback 실행');
    console.log('   divRef.value:', divRef.value); // null
  });

  mountCallback(() => {
    console.log('2. mountCallback 실행');
    console.log('   divRef.value:', divRef.value); // <div>Hello</div>
  });

  return () => <div ref={divRef}>Hello</div>;
});

// 실행 순서:
// 1. mountReadyCallback 실행
//    divRef.value: null
// (DOM 생성 및 마운트)
// 2. mountCallback 실행
//    divRef.value: <div>Hello</div>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["mountReadyCallback은 특수한 경우에만 사용됩니다. 대부분의 경우 mountCallback으로 충분합니다.",e("br",{}),e("br",{}),"mountReadyCallback이 적합한 경우:",e("br",{}),e("br",{}),"• DOM이 필요 없는 데이터 초기화",e("br",{}),"• 상태 관리 구독 (store subscription)",e("br",{}),"• 로깅 및 분석 초기화",e("br",{}),"• 가능한 한 빠른 시점의 초기화가 필요한 경우",e("br",{}),e("br",{}),"mountCallback이 적합한 경우:",e("br",{}),e("br",{}),"• DOM 요소 접근이 필요한 경우 (대부분의 경우)",e("br",{}),"• 외부 라이브러리 초기화 (차트, 에디터 등)",e("br",{}),"• DOM 이벤트 리스너 등록",e("br",{}),"• 타이머 설정"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"데이터 초기화 예제"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"DOM이 필요 없는 데이터 초기화는 mountReadyCallback을 사용하여 더 빠르게 수행할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount, mountReadyCallback } from 'lithent';

const DataLoader = mount((renew) => {
  let data = null;
  let loading = true;

  mountReadyCallback(() => {
    console.log('데이터 로딩 시작 (DOM 생성 전)');

    // 비동기 데이터 로딩
    fetch('/api/initial-data')
      .then(res => res.json())
      .then(result => {
        data = result;
        loading = false;
        renew();
        console.log('데이터 로딩 완료');
      });

    // cleanup: 언마운트 시 진행 중인 요청 취소 등
    return () => {
      console.log('Component unmounting');
    };
  });

  return () => (
    <div>
      {loading ? <p>Loading...</p> : <p>Data: {JSON.stringify(data)}</p>}
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 예제는 DOM이 생성되기 전에 데이터 로딩을 시작하여, 초기 렌더링 성능을 개선할 수 있습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"상태 관리 구독 예제"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"전역 상태 관리 스토어 구독은 DOM과 무관하므로 mountReadyCallback을 사용할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount, mountReadyCallback } from 'lithent';
import { globalStore } from './store';

const StoreSubscriber = mount((renew) => {
  let storeData = globalStore.getState();

  mountReadyCallback(() => {
    console.log('스토어 구독 시작');

    // 스토어 구독
    const unsubscribe = globalStore.subscribe((newState) => {
      storeData = newState;
      renew();
    });

    // cleanup: 언마운트 시 구독 해제
    return () => {
      console.log('스토어 구독 해제');
      unsubscribe();
    };
  });

  return () => (
    <div>
      <p>User: {storeData.user.name}</p>
      <p>Theme: {storeData.theme}</p>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 mountReadyCallback 등록하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"mountCallback과 마찬가지로, 여러 개의 mountReadyCallback을 등록할 수 있습니다. 각각 독립적인 cleanup 함수를 가질 수 있습니다."}),e(o,{language:"tsx",code:`import { mount, mountReadyCallback } from 'lithent';

const MultipleReady = mount((renew) => {
  let analyticsReady = false;
  let dataReady = false;

  // 첫 번째 mountReadyCallback: 분석 초기화
  mountReadyCallback(() => {
    console.log('Analytics 초기화');
    analytics.init();
    analyticsReady = true;

    return () => {
      analytics.cleanup();
    };
  });

  // 두 번째 mountReadyCallback: 데이터 프리페치
  mountReadyCallback(() => {
    console.log('데이터 프리페치 시작');
    prefetchData();
    dataReady = true;

    return () => {
      cancelPrefetch();
    };
  });

  return () => (
    <div>
      <p>Analytics: {analyticsReady ? 'Ready' : 'Loading'}</p>
      <p>Data: {dataReady ? 'Ready' : 'Loading'}</p>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"mountReadyCallback의 실행 흐름:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"마운터 실행 시 mountReadyCallback 호출로 콜백 함수 등록 (아직 실행 안 됨)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"Updater 실행 → Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Virtual DOM 생성 직후, 등록된 mountReadyCallback 함수들을 순서대로 실행"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"cleanup 함수가 반환되면 unmount 시점까지 보관"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"Virtual DOM을 실제 DOM으로 변환"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"6."}),e("span",{children:"DOM을 화면에 렌더링"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"7."}),e("span",{children:"mountCallback 함수들 실행 (이제 DOM 접근 가능)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"8."}),e("span",{children:"컴포넌트 언마운트 시 cleanup 함수들을 역순으로 실행하여 정리"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"mountReadyCallback은 3단계에서 실행되고, mountCallback은 7단계에서 실행됩니다. 이 차이가 두 훅의 핵심입니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"전체 생명주기 흐름"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"모든 훅의 실행 순서를 종합하면 다음과 같습니다:"}),e(o,{language:"tsx",code:`import { mount, mountReadyCallback, mountCallback, updateCallback } from 'lithent';

const FullLifecycle = mount((renew) => {
  let count = 0;

  mountReadyCallback(() => {
    console.log('1. mountReadyCallback (Virtual DOM 생성 직후)');

    return () => {
      console.log('Cleanup: mountReadyCallback');
    };
  });

  mountCallback(() => {
    console.log('2. mountCallback (DOM 마운트 후)');

    return () => {
      console.log('Cleanup: mountCallback');
    };
  });

  updateCallback(() => {
    console.log('3. updateCallback (업데이트 전)');

    return () => {
      console.log('4. updateCallback 반환 함수 (DOM 업데이트 후)');
    };
  });

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// 마운트 시:
// 1. mountReadyCallback (Virtual DOM 생성 직후)
// 2. mountCallback (DOM 마운트 후)
// 3. updateCallback (업데이트 전)
// 4. updateCallback 반환 함수 (DOM 업데이트 후)

// 버튼 클릭 시:
// 3. updateCallback (업데이트 전)
// (DOM 업데이트)
// 4. updateCallback 반환 함수 (DOM 업데이트 후)

// 언마운트 시:
// Cleanup: updateCallback
// Cleanup: mountCallback
// Cleanup: mountReadyCallback`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ DOM 접근 불가:"})," mountReadyCallback 실행 시점에는 아직 DOM이 생성되지 않았습니다. ref.value는 항상 null입니다. DOM이 필요하다면 mountCallback을 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 대부분 불필요:"})," 대부분의 경우 mountCallback으로 충분합니다. mountReadyCallback은 정말 빠른 초기화가 필요하거나 DOM이 절대 필요 없는 경우에만 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ cleanup은 선택적:"})," cleanup 함수를 반환하지 않아도 됩니다. 정리 작업이 필요 없다면 아무것도 반환하지 마세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," ","mountReadyCallback은 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"요약: 어떤 훅을 사용해야 할까?"}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장 사용법:"}),e("br",{}),e("br",{}),e("strong",{children:"99%의 경우 → mountCallback 사용"}),e("br",{}),"DOM 접근이 필요하거나, 일반적인 초기화 작업에 사용하세요.",e("br",{}),e("br",{}),e("strong",{children:"DOM 없이 최대한 빨리 초기화 → mountReadyCallback 사용"}),e("br",{}),"데이터 프리페치, 스토어 구독, 분석 초기화 등 특수한 경우에만 사용하세요.",e("br",{}),e("br",{}),e("strong",{children:"매 업데이트마다 작업 → updateCallback 사용"}),e("br",{}),"상태 변경 시마다 부수 효과가 필요한 경우 사용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/use-renew-hooks",onClick:t=>{t.preventDefault(),v("/guide/use-renew-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: useRenew Hook →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["lmount 컴포넌트에서 renew 함수를 가져오는 useRenew 훅에 대해 알아보세요.",e("br",{}),"클로저 변수와 함께 수동 업데이트가 필요한 경우 사용하는 방법을 배워봅시다."]})]})})]}),fl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"useRenew Hook"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"useRenew란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["useRenew는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lmount 컴포넌트 내에서 renew 함수를 가져오는 훅"}),"입니다.",e("br",{}),e("br",{}),"lmount는 일반적으로 lstate와 같은 반응형 헬퍼와 함께 사용되어 자동으로 UI가 업데이트됩니다. 하지만 클로저 변수를 사용하면서 수동으로 업데이트를 트리거해야 하는 특별한 경우에 useRenew를 사용할 수 있습니다."]}),e(o,{language:"tsx",code:`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count += 1;
    renew(); // 수동으로 업데이트 트리거
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["useRenew는 다음과 같은 특별한 상황에서 유용합니다:",e("br",{}),e("br",{}),"• lmount 컴포넌트에서 클로저 변수를 사용할 때",e("br",{}),"• lstate를 사용하지 않고 단순한 값을 관리할 때",e("br",{}),"• 외부 라이브러리와의 통합에서 수동 업데이트가 필요할 때",e("br",{}),e("br",{}),"하지만 대부분의 경우"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"lstate를 사용하는 것이 더 권장"}),"됩니다. lstate를 사용하면 자동으로 업데이트되므로 renew를 명시적으로 호출할 필요가 없습니다.",e("br",{}),e("br",{}),"또한 클로저 변수와 함께 renew가 필요하다면,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"lmount + useRenew보다는 그냥 mount를 사용하는 것이 더 효과적"}),"입니다. mount는 renew를 매개변수로 직접 제공하므로 더 간결하고 직관적입니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"useRenew vs lstate 비교"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"같은 기능을 useRenew와 lstate로 구현한 예시를 비교해봅시다:"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"useRenew 사용 (수동 업데이트)"}),e(o,{language:"tsx",code:`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count += 1;
    renew(); // 명시적으로 renew 호출 필요
  };

  return () => <div>Count: {count}</div>;
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"lstate 사용 (자동 업데이트) - 권장"}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);

  const increment = () => {
    count.value += 1; // 자동으로 업데이트됨
  };

  return () => <div>Count: {count.value}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장사항:"})," ","lmount를 사용한다면 lstate를 함께 사용하는 것이 더 간결하고 직관적입니다. useRenew는 특별한 경우에만 사용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"외부 라이브러리 통합"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"외부 라이브러리의 이벤트를 받아서 UI를 업데이트해야 할 때 useRenew가 유용할 수 있습니다."}),e(o,{language:"tsx",code:`import { lmount, useRenew, mountCallback } from 'lithent';

const ExternalLibComponent = lmount(() => {
  let data = null;
  const renew = useRenew();

  mountCallback(() => {
    // 외부 라이브러리 초기화
    const library = initExternalLibrary();

    // 외부 라이브러리의 이벤트 리스너
    library.on('data', (newData) => {
      data = newData;
      renew(); // 데이터 변경 시 업데이트
    });

    // cleanup: 언마운트 시 리스너 제거
    return () => {
      library.off('data');
    };
  });

  return () => (
    <div>
      {data ? <p>Data: {JSON.stringify(data)}</p> : <p>Loading...</p>}
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"타이머 예제"}),e(o,{language:"tsx",code:`import { lmount, useRenew, mountCallback } from 'lithent';

const Timer = lmount(() => {
  let seconds = 0;
  const renew = useRenew();

  mountCallback(() => {
    const intervalId = setInterval(() => {
      seconds += 1;
      renew();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {seconds} seconds</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mount vs lmount + useRenew"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lmount에서 useRenew를 사용하는 것과 mount를 사용하는 것은 거의 동일합니다. 차이점은 renew 함수를 어떻게 받느냐입니다."}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"mount (renew 매개변수로 받음)"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const inc = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`})]}),e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"lmount + useRenew (훅으로 받음)"}),e(o,{language:"tsx",code:`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const inc = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`})]})]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","두 방식 모두 동일하게 동작합니다. 클로저 변수를 사용한다면 mount를 사용하는 것이 더 일반적이고, lmount는 lstate 같은 반응형 헬퍼와 함께 사용하는 것이 권장됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ lmount에서만 사용:"})," useRenew는 lmount 컴포넌트 내에서만 사용할 수 있습니다. mount 컴포넌트에서는 매개변수로 renew를 직접 받으므로 useRenew가 필요 없습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ lstate 사용 권장:"})," lmount를 사용한다면 대부분의 경우 lstate를 사용하는 것이 더 직관적입니다. useRenew는 특별한 경우에만 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," useRenew는 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/state",onClick:t=>{t.preventDefault(),v("/guide/state")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: State →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Core 기능 학습을 완료했습니다!",e("br",{}),"이제 Helper 기능을 알아봅시다. State 헬퍼부터 시작해보세요."]})]})})]}),vl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"State"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"state란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["state는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"mount 컴포넌트에서 사용하는 반응형 상태 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"state의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 함수를 명시적으로 인자를 통해 위임"}),"한다는 점입니다. 이것이 lstate와의 근본적인 차이이며, mount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다.",e("br",{}),e("br",{}),"클로저 변수는 값을 변경한 후 renew()를 직접 호출해야 하지만, state를 사용하면 renew를 한 번 위임한 후 값이 변경될 때마다 자동으로 renew()가 호출되어 UI가 업데이트됩니다. mount의 명시적 제어와 자동 업데이트의 편리함을 함께 누릴 수 있습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew);

  const increment = () => {
    count.value += 1; // 자동으로 renew() 호출
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["state는 초기값과 renew 함수를 인자로 받습니다. 반환된 객체의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"value"})," ","프로퍼티를 통해 값을 읽고 쓸 수 있습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const App = mount((renew) => {
  // state 생성: state(초기값, renew 함수)
  const count = state(0, renew);
  const message = state('Hello', renew);

  const increment = () => {
    count.value += 1; // setter - 자동으로 renew() 호출
  };

  const updateMessage = () => {
    message.value = 'World'; // setter - 자동으로 renew() 호출
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <p>Message: {message.value}</p>
      <button onClick={increment}>+1</button>
      <button onClick={updateMessage}>Change Message</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"클로저 변수 vs state 비교"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["클로저 변수와 state의 차이를 비교해봅시다. state는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 명시적으로 위임하는 방식"}),"으로, mount 컴포넌트의 철학과 완벽하게 일치합니다:"]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"클로저 변수 (수동 renew 호출)"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew(); // 명시적으로 renew 호출 필요
  };

  return () => <div>Count: {count}</div>;
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"state 헬퍼 (자동 renew 호출)"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew);

  const increment = () => {
    count.value += 1; // 자동으로 renew 호출됨
  };

  return () => <div>Count: {count.value}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 선택 기준:"})," ",e("strong",{class:"font-medium text-gray-700 dark:text-gray-300",children:"state는 mount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다."})," ","간단한 값이라면 state를 사용하는 것이 편리하며, renew를 명시적으로 위임하여 제어권을 명확히 할 수 있습니다. 복잡한 객체나 배열을 다룬다면 클로저 변수를 사용하고 필요할 때만 renew()를 호출하는 것이 더 효율적일 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 state 사용"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Form = mount((renew) => {
  const name = state('', renew);
  const email = state('', renew);
  const age = state(0, renew);

  const handleSubmit = () => {
    console.log({
      name: name.value,
      email: email.value,
      age: age.value,
    });
  };

  return () => (
    <form onSubmit={(e: Event) => e.preventDefault()}>
      <input
        type="text"
        value={name.value}
        onInput={(e: Event) => {
          name.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="Name"
      />
      <input
        type="email"
        value={email.value}
        onInput={(e: Event) => {
          email.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="Email"
      />
      <input
        type="number"
        value={age.value}
        onInput={(e: Event) => {
          age.value = parseInt((e.target as HTMLInputElement).value, 10);
        }}
        placeholder="Age"
      />
      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"토글 상태 관리"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Accordion = mount((renew) => {
  const isOpen = state(false, renew);

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  return () => (
    <div>
      <button onClick={toggle}>
        {isOpen.value ? 'Close' : 'Open'} Accordion
      </button>
      {isOpen.value && (
        <div class="content">
          <p>This is the accordion content!</p>
        </div>
      )}
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"카운터 그룹"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const CounterGroup = mount((renew) => {
  const countA = state(0, renew);
  const countB = state(0, renew);
  const countC = state(0, renew);

  return () => (
    <div>
      <div>
        <p>Counter A: {countA.value}</p>
        <button onClick={() => countA.value += 1}>+</button>
        <button onClick={() => countA.value -= 1}>-</button>
      </div>
      <div>
        <p>Counter B: {countB.value}</p>
        <button onClick={() => countB.value += 1}>+</button>
        <button onClick={() => countB.value -= 1}>-</button>
      </div>
      <div>
        <p>Counter C: {countC.value}</p>
        <button onClick={() => countC.value += 1}>+</button>
        <button onClick={() => countC.value -= 1}>-</button>
      </div>
      <div>
        <p>Total: {countA.value + countB.value + countC.value}</p>
      </div>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"객체와 배열 다루기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"state는 원시 값뿐만 아니라 객체나 배열도 저장할 수 있습니다. 하지만 객체나 배열의 경우, 새로운 참조를 할당해야 변경이 감지됩니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const TodoList = mount((renew) => {
  const todos = state<string[]>([], renew);

  const addTodo = (text: string) => {
    // 새로운 배열을 생성해야 변경 감지됨
    todos.value = [...todos.value, text];
  };

  const removeTodo = (index: number) => {
    // 새로운 배열을 생성
    todos.value = todos.value.filter((_, i) => i !== index);
  };

  return () => (
    <div>
      <button onClick={() => addTodo('New Todo')}>Add Todo</button>
      <ul>
        {todos.value.map((todo, index) => (
          <li>
            {todo}
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 주의:"})," 객체나 배열의 내부를 직접 변경하면 UI가 업데이트되지 않습니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm",children:"todos.value.push('new') // ❌ 동작하지 않음"}),e("br",{}),e("code",{class:"px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm",children:"todos.value = [...todos.value, 'new'] // ✅ 새 참조로 할당"})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ mount와 함께 사용:"})," state는 mount 컴포넌트에서 사용하는 것이 자연스럽고 올바른 방식입니다. lmount에서는 lstate를 사용하세요. state는 renew를 명시적으로 인자를 통해 위임하는 방식이며, 이것이 lstate와의 근본적인 차이입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ renew 명시적 위임:"})," state는 두 번째 인자로 renew 함수를 반드시 전달해야 합니다. 이는 제어권을 명확히 위임하는 mount의 철학을 따릅니다. renew를 전달하지 않으면 값이 변경되어도 UI가 업데이트되지 않습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," state는 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/lstate",onClick:t=>{t.preventDefault(),v("/guide/lstate")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Lstate →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["lmount에서 사용하는 반응형 상태 관리인 lstate에 대해 알아보세요.",e("br",{}),"state와 유사하지만 renew를 자동으로 처리하는 방법을 배워봅시다."]})]})})]}),wl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Lstate"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lstate란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstate는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lmount 컴포넌트에서 사용하는 반응형 상태 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"lstate의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 자동으로 처리"}),"한다는 점입니다. state와 달리 renew를 인자로 전달할 필요가 없으며, 내부적으로 useRenew 훅을 사용하여 자동으로 renew를 가져옵니다. 이것이 state와의 근본적인 차이이며, lmount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다.",e("br",{}),e("br",{}),"값이 변경될 때마다 자동으로 renew()가 호출되어 UI가 업데이트되므로, 선언형 패턴에 최적화되어 있습니다."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0); // renew 인자 불필요

  const increment = () => {
    count.value += 1; // 자동으로 renew() 호출
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstate는 초기값만 인자로 받습니다. renew는 내부적으로 자동 처리됩니다. 반환된 객체의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"value"})," ","프로퍼티를 통해 값을 읽고 쓸 수 있습니다."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const App = lmount(() => {
  // lstate 생성: lstate(초기값) - renew 불필요!
  const count = lstate(0);
  const message = lstate('Hello');

  const increment = () => {
    count.value += 1; // setter - 자동으로 renew() 호출
  };

  const updateMessage = () => {
    message.value = 'World'; // setter - 자동으로 renew() 호출
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <p>Message: {message.value}</p>
      <button onClick={increment}>+1</button>
      <button onClick={updateMessage}>Change Message</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"state vs lstate 비교"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["state와 lstate의 차이를 비교해봅시다. 핵심 차이는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 어떻게 처리하는가"}),"입니다:"]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"state (mount + 명시적 renew 위임)"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew); // renew 명시적 전달

  const increment = () => {
    count.value += 1;
  };

  return () => <div>Count: {count.value}</div>;
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"lstate (lmount + 자동 renew 처리)"}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0); // renew 자동 처리

  const increment = () => {
    count.value += 1;
  };

  return () => <div>Count: {count.value}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 선택 기준:"})," ",e("strong",{class:"font-medium text-gray-700 dark:text-gray-300",children:"lstate는 lmount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다."})," ","lstate는 renew를 자동으로 처리하여 선언형 패턴에 최적화되어 있으며, state는 renew를 명시적으로 위임하여 수동 제어에 최적화되어 있습니다. mount를 사용한다면 state를, lmount를 사용한다면 lstate를 선택하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 lstate 사용"}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Form = lmount(() => {
  const name = lstate('');
  const email = lstate('');
  const age = lstate(0);

  const handleSubmit = () => {
    console.log({
      name: name.value,
      email: email.value,
      age: age.value,
    });
  };

  return () => (
    <form onSubmit={(e: Event) => e.preventDefault()}>
      <input
        type="text"
        value={name.value}
        onInput={(e: Event) => {
          name.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="Name"
      />
      <input
        type="email"
        value={email.value}
        onInput={(e: Event) => {
          email.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="Email"
      />
      <input
        type="number"
        value={age.value}
        onInput={(e: Event) => {
          age.value = parseInt((e.target as HTMLInputElement).value, 10);
        }}
        placeholder="Age"
      />
      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"토글 상태 관리"}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Accordion = lmount(() => {
  const isOpen = lstate(false);

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  return () => (
    <div>
      <button onClick={toggle}>
        {isOpen.value ? 'Close' : 'Open'} Accordion
      </button>
      {isOpen.value && (
        <div class="content">
          <p>This is the accordion content!</p>
        </div>
      )}
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"탭 컴포넌트"}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Tabs = lmount(() => {
  const activeTab = lstate('tab1');

  return () => (
    <div>
      <div class="tab-buttons">
        <button
          onClick={() => activeTab.value = 'tab1'}
          class={activeTab.value === 'tab1' ? 'active' : ''}
        >
          Tab 1
        </button>
        <button
          onClick={() => activeTab.value = 'tab2'}
          class={activeTab.value === 'tab2' ? 'active' : ''}
        >
          Tab 2
        </button>
        <button
          onClick={() => activeTab.value = 'tab3'}
          class={activeTab.value === 'tab3' ? 'active' : ''}
        >
          Tab 3
        </button>
      </div>
      <div class="tab-content">
        {activeTab.value === 'tab1' && <div>Content 1</div>}
        {activeTab.value === 'tab2' && <div>Content 2</div>}
        {activeTab.value === 'tab3' && <div>Content 3</div>}
      </div>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"객체와 배열 다루기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lstate는 원시 값뿐만 아니라 객체나 배열도 저장할 수 있습니다. 하지만 객체나 배열의 경우, 새로운 참조를 할당해야 변경이 감지됩니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const TodoList = lmount(() => {
  const todos = lstate<string[]>([]);

  const addTodo = (text: string) => {
    // 새로운 배열을 생성해야 변경 감지됨
    todos.value = [...todos.value, text];
  };

  const removeTodo = (index: number) => {
    // 새로운 배열을 생성
    todos.value = todos.value.filter((_, i) => i !== index);
  };

  return () => (
    <div>
      <button onClick={() => addTodo('New Todo')}>Add Todo</button>
      <ul>
        {todos.value.map((todo, index) => (
          <li>
            {todo}
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 주의:"})," 객체나 배열의 내부를 직접 변경하면 UI가 업데이트되지 않습니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm",children:"todos.value.push('new') // ❌ 동작하지 않음"}),e("br",{}),e("code",{class:"px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm",children:"todos.value = [...todos.value, 'new'] // ✅ 새 참조로 할당"})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"복잡한 상태 관리 예제"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"여러 개의 lstate를 조합하여 복잡한 상태를 관리할 수 있습니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp = lmount(() => {
  const todos = lstate<Todo[]>([]);
  const filter = lstate<'all' | 'active' | 'completed'>('all');
  const inputValue = lstate('');

  const addTodo = () => {
    if (!inputValue.value.trim()) return;

    todos.value = [
      ...todos.value,
      {
        id: Date.now(),
        text: inputValue.value,
        completed: false,
      },
    ];
    inputValue.value = '';
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter(todo => todo.id !== id);
  };

  const getFilteredTodos = () => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(todo => !todo.completed);
      case 'completed':
        return todos.value.filter(todo => todo.completed);
      default:
        return todos.value;
    }
  };

  return () => (
    <div>
      <input
        type="text"
        value={inputValue.value}
        onInput={(e: Event) => {
          inputValue.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="What needs to be done?"
      />
      <button onClick={addTodo}>Add</button>

      <div>
        <button onClick={() => filter.value = 'all'}>All</button>
        <button onClick={() => filter.value = 'active'}>Active</button>
        <button onClick={() => filter.value = 'completed'}>Completed</button>
      </div>

      <ul>
        {getFilteredTodos().map(todo => (
          <li>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ lmount와 함께 사용:"})," lstate는 lmount 컴포넌트에서 사용하는 것이 자연스럽고 올바른 방식입니다. mount에서는 state를 사용하세요. lstate는 renew를 자동으로 처리하는 방식이며, 이것이 state와의 근본적인 차이입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ renew 자동 처리:"})," lstate는 내부적으로 useRenew를 사용하여 renew를 자동으로 가져옵니다. 따라서 renew를 인자로 전달할 필요가 없으며, 이는 선언형 패턴에 최적화된 설계입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," lstate는 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/computed",onClick:t=>{t.preventDefault(),v("/guide/computed")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Computed →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["다른 상태로부터 파생된 값을 계산하는 computed에 대해 알아보세요.",e("br",{}),"읽기 전용 파생 값을 만드는 방법을 배워봅시다."]})]})})]}),Cl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Computed Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Computed란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["computed는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"다른 값으로부터 파생된 값을 계산하는 읽기 전용 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"computed는 함수를 인자로 받아, 해당 함수가 반환하는 값을 읽기 전용으로 제공합니다. 값에 접근할 때마다 함수가 다시 실행되므로, 항상 최신 상태를 반영하는 파생 값을 얻을 수 있습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const PriceCalculator = mount(renew => {
  const price = state(100, renew);
  const quantity = state(1, renew);

  // 총 가격을 계산하는 computed
  const total = computed(() => price.value * quantity.value);

  return () => (
    <div>
      <p>가격: {price.value}원</p>
      <p>수량: {quantity.value}개</p>
      <p>총액: {total.value}원</p>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"핵심 특징"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["computed의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"읽기 전용이며, 접근할 때마다 함수를 실행"}),"한다는 점입니다.",e("br",{}),e("br",{}),"• ",e("strong",{children:"읽기 전용"}),": computed 값을 직접 변경하려고 하면 에러가 발생합니다.",e("br",{}),"• ",e("strong",{children:"즉시 평가 (Lazy Evaluation)"}),": 값에 접근할 때마다 함수가 실행됩니다.",e("br",{}),"• ",e("strong",{children:"항상 최신 값"}),": 의존하는 상태가 변경되면 다음 접근 시 새로운 값을 반환합니다.",e("br",{}),"• ",e("strong",{children:"mount와 lmount 모두 사용 가능"}),": renew를 필요로 하지 않기 때문에 mount, lmount 어디서든 자유롭게 사용할 수 있습니다."]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","computed는 의존성을 자동으로 추적하지 않습니다. Vue나 React의 computed 속성과 달리, 단순히 함수를 래핑하여 접근할 때마다 실행하는 편리한 헬퍼입니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"단순 계산"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const Counter = mount(renew => {
  const count = state(0, renew);

  // 두 배 값을 계산
  const doubled = computed(() => count.value * 2);

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <p>Doubled: {doubled.value}</p>
      <button onClick={() => (count.value += 1)}>Increment</button>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"여러 값 조합"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const UserProfile = mount(renew => {
  const firstName = state('John', renew);
  const lastName = state('Doe', renew);

  // 여러 값을 조합하여 계산
  const fullName = computed(() => \`\${firstName.value} \${lastName.value}\`);

  return () => (
    <div>
      <input
        value={firstName.value}
        onInput={(e) => (firstName.value = e.target.value)}
        placeholder="First Name"
      />
      <input
        value={lastName.value}
        onInput={(e) => (lastName.value = e.target.value)}
        placeholder="Last Name"
      />
      <p>Full Name: {fullName.value}</p>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"장바구니 계산"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const ShoppingCart = mount(renew => {
  const items = state([
    { name: 'Apple', price: 1000, quantity: 2 },
    { name: 'Banana', price: 500, quantity: 3 },
  ], renew);

  // 총 가격 계산
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // 총 수량 계산
  const totalQuantity = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const addItem = () => {
    items.value = [
      ...items.value,
      { name: 'Orange', price: 800, quantity: 1 },
    ];
  };

  return () => (
    <div>
      <h3>장바구니</h3>
      {items.value.map((item, i) => (
        <div key={i}>
          {item.name} - {item.price}원 x {item.quantity}개
        </div>
      ))}
      <hr />
      <p>총 상품 수: {totalQuantity.value}개</p>
      <p>총 가격: {totalPrice.value}원</p>
      <button onClick={addItem}>상품 추가</button>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"필터링 및 정렬"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const TodoList = mount(renew => {
  const todos = state([
    { id: 1, text: 'Learn Lithent', completed: false },
    { id: 2, text: 'Build App', completed: false },
    { id: 3, text: 'Deploy', completed: false },
  ], renew);

  const filter = state<'all' | 'active' | 'completed'>('all', renew);

  // 필터링된 할 일 목록
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(t => !t.completed);
      case 'completed':
        return todos.value.filter(t => t.completed);
      default:
        return todos.value;
    }
  });

  // 완료된 할 일 개수
  const completedCount = computed(() =>
    todos.value.filter(t => t.completed).length
  );

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
  };

  return () => (
    <div>
      <h3>할 일 목록</h3>

      {/* 필터 버튼 */}
      <div>
        <button onClick={() => (filter.value = 'all')}>전체</button>
        <button onClick={() => (filter.value = 'active')}>진행중</button>
        <button onClick={() => (filter.value = 'completed')}>완료</button>
      </div>

      {/* 필터링된 목록 */}
      {filteredTodos.value.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span style={{
            textDecoration: todo.completed ? 'line-through' : 'none'
          }}>
            {todo.text}
          </span>
        </div>
      ))}

      <p>완료: {completedCount.value} / {todos.value.length}</p>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"동적 클래스명 생성"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const ThemeButton = mount(renew => {
  const theme = state<'light' | 'dark'>('light', renew);
  const isActive = state(false, renew);

  // 여러 조건에 따른 클래스명 생성
  const buttonClass = computed(() => {
    const classes = ['btn'];

    if (theme.value === 'dark') {
      classes.push('btn-dark');
    } else {
      classes.push('btn-light');
    }

    if (isActive.value) {
      classes.push('active');
    }

    return classes.join(' ');
  });

  return () => (
    <div>
      <button
        class={buttonClass.value}
        onClick={() => (isActive.value = !isActive.value)}
      >
        Click Me
      </button>
      <button onClick={() => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
      }}>
        Toggle Theme
      </button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"읽기 전용 특성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"computed는 읽기 전용입니다. 값을 직접 변경하려고 하면 에러가 발생합니다."}),e(o,{language:"tsx",code:`const doubled = computed(() => count.value * 2);

// ❌ 에러 발생!
doubled.value = 10;  // Error: You can't change 'computed'

// ✅ 올바른 방법: 원본 값을 변경
count.value = 5;  // doubled는 자동으로 10이 됨`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 읽기 전용:"})," computed 값은 파생 값이므로 직접 변경할 수 없습니다. 원본 상태를 변경하면 computed 값도 자동으로 업데이트됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mount와 lmount 모두 사용 가능"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["computed는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 함수를 필요로 하지 않는 읽기 전용 헬퍼"}),"이므로, mount와 lmount 어디서든 자유롭게 사용할 수 있습니다.",e("br",{}),e("br",{}),"이것이 state/lstate와의 차이점입니다. state는 renew를 명시적으로 전달받고, lstate는 useRenew로 자동 처리하지만, computed는 renew 자체가 필요 없으므로 lcomputed라는 별도 버전이 존재하지 않습니다."]}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"mount에서 사용"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const App = mount(renew => {
  const count = state(0, renew);
  const doubled = computed(
    () => count.value * 2
  );

  return () => (
    <div>{doubled.value}</div>
  );
});`})]}),e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"lmount에서 사용"}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate, computed } from 'lithent/helper';

const App = lmount(() => {
  const count = lstate(0);
  const doubled = computed(
    () => count.value * 2
  );

  return () => (
    <div>{doubled.value}</div>
  );
});`})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 즉시 평가:"})," computed는 값에 접근할 때마다 함수를 실행합니다. 계산 비용이 큰 작업의 경우 주의가 필요합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 의존성 추적 없음:"})," Vue나 React와 달리 의존성을 자동으로 추적하지 않습니다. 단순히 함수를 래핑한 헬퍼입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 부수 효과 금지:"})," computed 함수 내에서 상태를 변경하거나 부수 효과를 일으키지 마세요. 순수 함수여야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/effect",onClick:t=>{t.preventDefault(),v("/guide/effect")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Effect →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["파생 값 계산을 마스터했습니다!",e("br",{}),"이제 부수 효과를 관리하는 Effect 헬퍼를 알아봅시다."]})]})})]}),Ml=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Effect Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"effect란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["effect는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"부수 효과(Side Effect)를 관리하는 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"컴포넌트의 마운트, 업데이트, 언마운트 시점에 특정 작업을 실행하고, 필요한 경우 클린업(정리)할 수 있습니다. 내부적으로 mountCallback과 updateCallback을 사용하여 구현되어 있습니다.",e("br",{}),e("br",{}),"API 호출, DOM 이벤트 리스너 등록, 타이머 설정 등의 부수 효과를 선언적으로 관리할 수 있습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const Timer = mount(renew => {
  const seconds = state(0, renew);

  let intervalId: number;

  effect(
    () => {
      // 마운트/업데이트 시 실행
      intervalId = setInterval(() => {
        seconds.value += 1;
      }, 1000);
    },
    () => {
      // 클린업
      clearInterval(intervalId);
    },
    () => [] // dependencies (빈 배열 = 마운트 시에만 실행)
  );

  return () => <div>Seconds: {seconds.value}</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["effect는 세 가지 인자를 받습니다:",e("br",{}),e("br",{}),"• ",e("strong",{children:"forward"}),": 부수 효과를 실행하는 함수",e("br",{}),"• ",e("strong",{children:"backward"}),": 클린업 함수 (선택적)",e("br",{}),"• ",e("strong",{children:"dependencies"}),": 의존성 배열을 반환하는 함수 (선택적, 기본값은 빈 배열)"]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { effect } from 'lithent/helper';

const App = mount(renew => {
  effect(
    // forward: 부수 효과 실행
    () => {
      console.log('Effect executed');
    },
    // backward: 클린업 함수 (선택적)
    () => {
      console.log('Cleanup');
    },
    // dependencies: 의존성 배열 반환 함수 (선택적)
    () => []
  );

  return () => <div>Hello</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"핵심 특징"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"1. mount와 lmount 모두 사용 가능"}),e("br",{}),"effect는 renew를 필요로 하지 않으므로 mount, lmount 어디서든 사용할 수 있습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"2. 의존성 기반 실행"}),e("br",{}),"dependencies 배열의 값이 변경되었을 때만 effect가 재실행됩니다. 빈 배열을 전달하면 마운트 시에만 실행됩니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"3. 자동 클린업"}),e("br",{}),"backward 클린업 함수는 컴포넌트 언마운트 시 또는 다음 업데이트 전에 자동으로 실행됩니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"타이머 구현"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const Timer = mount(renew => {
  const seconds = state(0, renew);
  const isRunning = state(true, renew);
  let intervalId: number;

  effect(
    () => {
      if (!isRunning.value) return;

      intervalId = setInterval(() => {
        seconds.value += 1;
      }, 1000);
    },
    () => {
      // 클린업: 인터벌 제거
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
    () => [isRunning.value] // isRunning이 변경될 때마다 재실행
  );

  return () => (
    <div>
      <p>Seconds: {seconds.value}</p>
      <button onClick={() => (isRunning.value = !isRunning.value)}>
        {isRunning.value ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"DOM 이벤트 리스너"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const WindowSize = mount(renew => {
  const width = state(window.innerWidth, renew);
  const height = state(window.innerHeight, renew);

  const handleResize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  effect(
    () => {
      window.addEventListener('resize', handleResize);
    },
    () => {
      // 클린업: 이벤트 리스너 제거
      window.removeEventListener('resize', handleResize);
    },
    () => [] // 마운트 시에만 실행
  );

  return () => (
    <div>
      Window size: {width.value} x {height.value}
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"API 데이터 가져오기"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const UserProfile = mount<{ userId: number }>((renew, props) => {
  const user = state<any>(null, renew);
  const loading = state(true, renew);
  const error = state<Error | null>(null, renew);
  let cancelled = false;

  effect(
    () => {
      cancelled = false;

      const fetchUser = async () => {
        loading.value = true;
        error.value = null;

        try {
          const response = await fetch(\`/api/users/\${props.userId}\`);
          const data = await response.json();

          if (!cancelled) {
            user.value = data;
          }
        } catch (err) {
          if (!cancelled) {
            error.value = err as Error;
          }
        } finally {
          if (!cancelled) {
            loading.value = false;
          }
        }
      };

      fetchUser();
    },
    () => {
      // 클린업: API 요청 취소 플래그 설정
      cancelled = true;
    },
    () => [props.userId] // userId가 변경될 때마다 재실행
  );

  return () => (
    <div>
      {loading.value && <p>Loading...</p>}
      {error.value && <p>Error: {error.value.message}</p>}
      {user.value && (
        <div>
          <h2>{user.value.name}</h2>
          <p>{user.value.email}</p>
        </div>
      )}
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"로컬 스토리지 동기화"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const ThemeToggle = mount(renew => {
  const theme = state<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    renew
  );

  // 테마 변경 시 로컬 스토리지에 저장
  effect(
    () => {
      localStorage.setItem('theme', theme.value);
      document.body.className = theme.value;
    },
    undefined,
    () => [theme.value]
  );

  return () => (
    <div>
      <p>Current theme: {theme.value}</p>
      <button
        onClick={() => {
          theme.value = theme.value === 'light' ? 'dark' : 'light';
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"의존성 배열 동작"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["dependencies는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"배열을 반환하는 함수"}),"여야 합니다. 이 함수가 반환하는 배열의 값이 변경되었을 때만 effect가 재실행됩니다.",e("br",{}),e("br",{}),"Lithent는 클로저 기반으로 동작하므로, effect 내부에서 외부 변수를 자유롭게 참조할 수 있습니다. 의존성 배열은 React와 달리 모든 외부 값을 포함할 필요가 없으며, 단순히 effect를 재실행할 시점을 결정하는 조건으로만 사용됩니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 왜 함수로 설계되었나요?"}),e("br",{}),e("br",{}),"Lithent는 ",e("strong",{class:"font-semibold",children:"클로저 기반 상태 관리"}),"를 사용합니다. 컴포넌트의 상태(count, isRunning 등)는 클로저 변수로 존재하며, 매 업데이트 시점마다 변경 여부를 확인하려면"," ",e("strong",{class:"font-semibold",children:"그 시점의 최신 값"}),"을 읽어야 합니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"() => [count, isRunning]"}),"처럼 함수로 설계하면, 의존성을 확인할 때마다 이 함수를 호출하여"," ",e("strong",{class:"font-semibold",children:"항상 최신 클로저 값"}),"을 가져올 수 있습니다. 함수 호출 시점에 count와 isRunning의 현재 값을 읽어 배열로 반환하므로, 이전 값과 비교하여 변경 여부를 정확히 감지할 수 있습니다."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"빈 배열: 마운트 시에만 실행"}),e(o,{language:"tsx",code:`effect(
  () => {
    console.log('Only once on mount');
  },
  undefined,
  () => [] // 빈 배열 = 마운트 시에만 실행
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"특정 값 의존: 값 변경 시마다 실행"}),e(o,{language:"tsx",code:`const count = state(0, renew);

effect(
  () => {
    console.log('Count changed:', count.value);
  },
  undefined,
  () => [count.value] // count.value가 변경될 때마다 실행
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"여러 값 의존"}),e(o,{language:"tsx",code:`const count = state(0, renew);
const message = state('', renew);

effect(
  () => {
    console.log('Count or message changed');
  },
  undefined,
  () => [count.value, message.value] // 둘 중 하나라도 변경되면 실행
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"클로저 안전성 (React와의 차이점)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent는 클로저 기반으로 동작하므로, 의존성 배열에 포함하지 않은 값도 안전하게 참조할 수 있습니다."}),e(o,{language:"tsx",code:`const count = state(0, renew);
const multiplier = state(2, renew);

effect(
  () => {
    // multiplier는 의존성 배열에 없지만 안전하게 참조 가능
    console.log('Result:', count.value * multiplier.value);
  },
  undefined,
  () => [count.value] // count 변경 시에만 재실행
);

// count가 변경되면 effect 재실행 (최신 multiplier 값 사용)
// multiplier가 변경되어도 effect는 재실행되지 않음`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ",'React의 useEffect와 달리, Lithent의 effect는 클로저를 통해 항상 최신 값을 참조합니다. 의존성 배열은 단순히 "언제 재실행할지"만 결정합니다.']})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mount vs lmount에서 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"effect는 renew를 필요로 하지 않으므로 mount와 lmount 모두에서 동일하게 사용할 수 있습니다."}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"mount에서 사용"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const App = mount(renew => {
  const count = state(0, renew);

  effect(
    () => {
      console.log('Count:', count.value);
    },
    () => {
      console.log('Cleanup');
    },
    () => [count.value]
  );

  return () => (
    <div>{count.value}</div>
  );
});`})]}),e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"lmount에서 사용"}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate, effect } from 'lithent/helper';

const App = lmount(() => {
  const count = lstate(0);

  effect(
    () => {
      console.log('Count:', count.value);
    },
    () => {
      console.log('Cleanup');
    },
    () => [count.value]
  );

  return () => (
    <div>{count.value}</div>
  );
});`})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," effect는 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 클린업 필수:"})," 타이머, 이벤트 리스너, 구독 등을 설정한 경우 반드시 클린업 함수에서 정리해야 메모리 누수를 방지할 수 있습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 의존성은 함수로 전달:"})," dependencies는 배열이 아닌 ",e("strong",{children:"배열을 반환하는 함수"}),'여야 합니다. Lithent의 클로저 기반 상태 관리 방식 때문입니다. 자세한 내용은 위의 "의존성 배열 동작" 섹션을 참고하세요.',e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 비동기 처리:"})," async/await를 사용할 경우, forward 함수를 async로 만들지 말고 내부에서 async 함수를 호출하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/store",onClick:t=>{t.preventDefault(),v("/guide/store")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Store →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["전역 상태 관리를 위한 Store 헬퍼에 대해 알아보세요.",e("br",{}),"여러 컴포넌트 간 상태를 공유하는 방법을 배워봅시다."]})]})})]}),Tl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Store Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"store란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["store는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"전역 상태를 관리하는 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"store의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 함수를 명시적으로 인자를 통해 위임"}),"한다는 점입니다. 이것이 lstore와의 근본적인 차이이며, mount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다.",e("br",{}),e("br",{}),"여러 컴포넌트에서 동일한 상태를 공유할 수 있으며, 상태가 변경되면 구독한 모든 컴포넌트가 자동으로 업데이트됩니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 1. store 생성 (전역)
const userStore = store({
  name: 'John',
  age: 25,
});

// 2. 컴포넌트에서 사용
const UserProfile = mount(renew => {
  const user = userStore(renew);  // renew 명시적 전달

  return () => (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <button onClick={() => user.age++}>Increase Age</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["store는 2단계로 사용합니다:",e("br",{}),e("br",{}),e("strong",{children:"1단계: store 생성"})," - 초기값으로 store 생성 함수를 만듭니다.",e("br",{}),e("strong",{children:"2단계: 구독"})," - 컴포넌트에서 renew를 전달하여 구독합니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 1단계: store 생성 (컴포넌트 외부)
const counterStore = store({ count: 0 });

// 2단계: 컴포넌트에서 구독
const Counter = mount(renew => {
  const counter = counterStore(renew);

  return () => (
    <div>
      <p>Count: {counter.count}</p>
      <button onClick={() => counter.count++}>+</button>
    </div>
  );
});

// 다른 컴포넌트에서도 동일한 store 공유
const CounterDisplay = mount(renew => {
  const counter = counterStore(renew);

  return () => <div>Current: {counter.count}</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"핵심 특징"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"1. mount와 함께 사용"}),e("br",{}),"store는 renew를 명시적으로 인자로 받으므로, mount 컴포넌트에서 사용하는 것이 자연스럽습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"2. 전역 상태 공유"}),e("br",{}),"컴포넌트 외부에서 store를 생성하면 여러 컴포넌트가 동일한 상태를 공유할 수 있습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"3. 반응형 Proxy"}),e("br",{}),"store는 JavaScript Proxy를 사용하여 반응성을 구현합니다. 속성을 직접 변경하면 자동으로 구독자들이 업데이트됩니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"4. 선택적 구독 (watch)"}),e("br",{}),"두 번째 인자로 observer 함수를 전달하면 특정 속성만 감시할 수 있습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"원시값 vs 객체"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"객체 저장 (권장)"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 객체로 저장 - 속성에 직접 접근
const userStore = store({
  name: 'John',
  age: 25,
});

const UserComponent = mount(renew => {
  const user = userStore(renew);

  console.log(user.name);  // 'John'
  user.age = 26;  // 직접 변경

  return () => <div>{user.name}, {user.age}</div>;
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"원시값 저장"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 원시값은 .value로 래핑됨
const countStore = store(0);

const Counter = mount(renew => {
  const count = countStore(renew);

  console.log(count.value);  // 0
  count.value = 1;  // .value를 통해 접근

  return () => <div>{count.value}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장:"})," ","원시값보다는 객체 형태로 저장하는 것이 더 직관적입니다. 여러 관련된 상태를 하나의 객체로 묶으면 관리가 편리합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선택적 구독 (watch)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"두 번째 인자로 observer 함수를 전달하면 특정 속성만 감시할 수 있습니다. observer 함수 내에서 접근한 속성만 감시 대상이 됩니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({
  user: 'John',
  count: 0,
  theme: 'light',
});

const UserDisplay = mount(renew => {
  // user만 감시 (count, theme 변경 시 리렌더링 안 됨)
  const app = appStore(
    renew,
    (store) => [store.user]  // observer: user만 접근
  );

  return () => (
    <div>
      <p>User: {app.user}</p>
      <p>Count: {app.count}</p>  {/* count 변경해도 리렌더링 안 됨 */}
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 성능 최적화:"})," ","observer를 사용하면 불필요한 리렌더링을 방지할 수 있습니다. 큰 store를 사용할 때 특정 속성만 감시하면 성능이 향상됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"사용자 인증 상태"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 전역 인증 store
const authStore = store<{
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
}>({
  isAuthenticated: false,
  user: null,
});

// 로그인 함수
export const login = (name: string, email: string) => {
  const auth = authStore();  // renew 없이 접근 (구독 안 함)
  auth.isAuthenticated = true;
  auth.user = { name, email };
};

// 로그아웃 함수
export const logout = () => {
  const auth = authStore();
  auth.isAuthenticated = false;
  auth.user = null;
};

// 헤더 컴포넌트
const Header = mount(renew => {
  const auth = authStore(renew);

  return () => (
    <header>
      {auth.isAuthenticated ? (
        <div>
          <span>Welcome, {auth.user?.name}!</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('John', 'john@example.com')}>
          Login
        </button>
      )}
    </header>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"쇼핑 카트"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// 카트 store
const cartStore = store<{
  items: CartItem[];
  total: number;
}>({
  items: [],
  total: 0,
});

// 카트 액션
export const addToCart = (item: CartItem) => {
  const cart = cartStore();
  cart.items = [...cart.items, item];
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
};

export const removeFromCart = (id: number) => {
  const cart = cartStore();
  cart.items = cart.items.filter(item => item.id !== id);
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
};

// 카트 디스플레이
const CartDisplay = mount(renew => {
  const cart = cartStore(renew);

  return () => (
    <div class="cart">
      <h2>Shopping Cart</h2>
      {cart.items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>{item.price}원 x {item.quantity}</span>
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      <div class="total">Total: {cart.total}원</div>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"테마 관리"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const themeStore = store<{
  mode: 'light' | 'dark';
  primaryColor: string;
}>({
  mode: 'light',
  primaryColor: '#42b883',
});

export const toggleTheme = () => {
  const theme = themeStore();
  theme.mode = theme.mode === 'light' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark');
};

export const setPrimaryColor = (color: string) => {
  const theme = themeStore();
  theme.primaryColor = color;
  document.documentElement.style.setProperty('--primary-color', color);
};

const ThemeToggle = mount(renew => {
  const theme = themeStore(renew);

  return () => (
    <div>
      <button onClick={toggleTheme}>
        Current: {theme.mode}
      </button>
      <input
        type="color"
        value={theme.primaryColor}
        onInput={(e: Event) => {
          setPrimaryColor((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"구독 없이 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"renew를 전달하지 않으면 구독 없이 store에 접근할 수 있습니다. 주로 유틸리티 함수나 이벤트 핸들러에서 사용합니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const counterStore = store({ count: 0 });

// 컴포넌트 외부: 구독 없이 접근 (리렌더링 트리거 안 됨)
const increment = () => {
  const counter = counterStore();  // renew 없음
  counter.count++;
};

// 컴포넌트 내부: 구독하여 리렌더링 받기
const Counter = mount(renew => {
  const counter = counterStore(renew);  // renew 전달로 구독

  return () => (
    <div>
      <p>{counter.count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"캐싱"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["store는 기본적으로 동일한 renew 함수에 대해 동일한 proxy 객체를 반환합니다(캐싱). 이를 비활성화하려면 세 번째 인자에"," ",e("code",{children:"cache: false"}),"를 전달하세요."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const counterStore = store({ count: 0 });

const Counter = mount(renew => {
  // 기본 동작: 캐싱됨 (동일한 renew에 대해 같은 인스턴스 반환)
  const counter1 = counterStore(renew);
  const counter2 = counterStore(renew);
  console.log(counter1 === counter2);  // true

  // 캐싱 비활성화 (매번 새로운 인스턴스 반환)
  const counter3 = counterStore(renew, null, { cache: false });
  console.log(counter1 === counter3);  // false

  return () => <div>{counter1.count}</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 객체 반응성 (중요!)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"store는 1depth까지만 반응성을 제공합니다."})," ","중첩된 객체의 속성을 변경해도 반응성이 동작하지 않습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({
  user: {
    name: 'John',
    age: 25,
  },
  settings: {
    theme: 'light',
  },
});

const App = mount(renew => {
  const app = appStore(renew);

  // ✅ 1depth 변경 - 반응성 동작함
  app.user = { name: 'Jane', age: 30 };

  // ❌ 2depth 변경 - 반응성 동작 안 함!
  app.user.name = 'Jane';  // 변경되지만 리렌더링 안 됨
  app.settings.theme = 'dark';  // 변경되지만 리렌더링 안 됨

  // ✅ 해결방법: 객체 전체를 교체
  app.user = { ...app.user, name: 'Jane' };
  app.settings = { ...app.settings, theme: 'dark' };

  return () => <div>{app.user.name}</div>;
});`}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"🚨 중요:"})," store는 shallow reactivity만 제공합니다. 중첩 객체의 속성을 직접 변경하면 UI가 업데이트되지 않습니다. 항상 1depth 속성 전체를 새로운 객체로 교체하세요."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"중첩 객체 다루기 패턴"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({
  user: {
    profile: {
      name: 'John',
      email: 'john@example.com',
    },
    preferences: {
      theme: 'light',
      language: 'en',
    },
  },
});

const App = mount(renew => {
  const app = appStore(renew);

  const updateName = (newName: string) => {
    // ❌ 잘못된 방법 - 반응성 동작 안 함
    // app.user.profile.name = newName;

    // ✅ 올바른 방법 1: spread operator 사용
    app.user = {
      ...app.user,
      profile: {
        ...app.user.profile,
        name: newName,
      },
    };
  };

  const updateTheme = (newTheme: string) => {
    // ✅ 올바른 방법 2: 새 객체 생성
    app.user = {
      ...app.user,
      preferences: {
        ...app.user.preferences,
        theme: newTheme,
      },
    };
  };

  return () => (
    <div>
      <p>Name: {app.user.profile.name}</p>
      <p>Theme: {app.user.preferences.theme}</p>
      <button onClick={() => updateName('Jane')}>Change Name</button>
      <button onClick={() => updateTheme('dark')}>Change Theme</button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장 구조:"})," ","중첩 객체 사용을 최소화하고, 가능하면 flat한 구조로 store를 설계하는 것이 좋습니다. 깊은 중첩이 필요하다면 각 depth마다 별도의 속성으로 분리하세요."]})}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💎 Deep Reactivity:"})," 중첩 객체에 대한 세밀한 반응성이 필요하다면"," ",e("a",{href:"/guide/state-ref",onClick:t=>{t.preventDefault(),v("/guide/state-ref")},class:"underline hover:no-underline font-medium",children:"state-ref"})," ","라이브러리를 사용하는 것을 권장합니다. 자세한 내용은 state-ref 페이지를 참고하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Cache 옵션"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["store는 기본적으로 컴포넌트별로 store 접근을 캐싱합니다. 캐시를 비활성화하려면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"{ cache: false }"})," ","옵션을 전달하세요."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({ count: 0 });

const Component = mount(renew => {
  // 캐시 비활성화
  const app = appStore(renew, null, { cache: false });

  return () => <div>Count: {app.count}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","일반적으로 캐시를 활성화(기본값)하는 것이 좋습니다. 캐시를 비활성화하면 동일한 컴포넌트 인스턴스에서 store()를 여러 번 호출할 때마다 새로운 구독이 생성됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ mount와 함께 사용:"})," store는 renew를 명시적으로 인자를 통해 위임하는 방식이므로, mount 컴포넌트에서 사용하는 것이 자연스럽고 올바른 방식입니다. lmount에서는 lstore를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 컴포넌트 외부에서 생성:"})," store는 컴포넌트 외부에서 생성하여 전역으로 공유해야 합니다. 컴포넌트 내부에서 생성하면 매번 새로운 store가 만들어집니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 1depth만 반응성:"})," store는 shallow reactivity만 제공합니다. 중첩 객체의 속성을 직접 변경하면 UI가 업데이트되지 않습니다. 1depth 속성 전체를 교체하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 배열 변경:"})," 배열의 경우 push, pop 등의 메서드를 사용하면 반응성이 동작하지 않습니다. 새로운 배열을 할당하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/lstore",onClick:t=>{t.preventDefault(),v("/guide/lstore")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Lstore →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["lmount에서 사용하는 전역 상태 관리인 lstore에 대해 알아보세요.",e("br",{}),"store와 유사하지만 renew를 자동으로 처리하는 방법을 배워봅시다."]})]})})]}),Sl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Lstore Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lstore란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstore는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"전역 상태를 관리하는 헬퍼"}),"로, store의 lmount 전용 버전입니다.",e("br",{}),e("br",{}),"lstore의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"useStore() 메서드가 내부적으로 useRenew()를 자동 호출"}),"하여, 수동으로 renew를 전달할 필요가 없다는 점입니다.",e("br",{}),e("br",{}),"여러 컴포넌트에서 동일한 상태를 공유할 수 있으며, 상태가 변경되면 구독한 모든 컴포넌트가 자동으로 업데이트됩니다."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

// 1. lstore 생성 (전역)
const userStore = lstore({
  name: 'John',
  age: 25,
});

// 2. lmount 컴포넌트에서 사용
const UserProfile = lmount(() => {
  const user = userStore.useStore();  // 자동으로 useRenew() 호출

  return () => (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
    </div>
  );
});

// 3. 다른 컴포넌트에서 공유
const UserEditor = lmount(() => {
  const user = userStore.useStore();  // 동일한 store 공유

  const updateAge = () => {
    user.age += 1;  // 변경 시 모든 구독 컴포넌트 업데이트
  };

  return () => (
    <div>
      <button onClick={updateAge}>Increase Age</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"useStore() vs watch()"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lstore는 두 가지 메서드를 제공합니다:"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"useStore() - lmount 전용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:"내부적으로 useRenew()를 호출하여 자동으로 구독합니다. renew를 수동으로 전달할 필요가 없습니다."})]}),e("div",{class:"border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"watch() - mount 호환"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:"수동으로 renew를 전달합니다. store의 일반 호출 방식과 동일하게 동작합니다."})]})]}),e(o,{language:"tsx",code:`import { lmount, mount } from 'lithent';
import { lstore } from 'lithent/helper';

const counterStore = lstore({ count: 0 });

// ✅ lmount에서 useStore() 사용
const LmountCounter = lmount(() => {
  const state = counterStore.useStore();  // 자동 renew

  return () => <div>Count: {state.count}</div>;
});

// ✅ mount에서 watch() 사용
const MountCounter = mount(renew => {
  const state = counterStore.watch(renew);  // 수동 renew

  return () => <div>Count: {state.count}</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선택적 구독 (Observer)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"makeObserver를 사용하면 특정 필드의 변경에만 반응할 수 있습니다. 성능 최적화에 유용합니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({
  user: { name: 'John', age: 25 },
  theme: 'light',
  count: 0,
});

// user만 구독
const UserDisplay = lmount(() => {
  const app = appStore.useStore(
    store => [store.user]  // user 필드만 관찰
  );

  // count가 변경되어도 이 컴포넌트는 리렌더링 안 됨
  return () => (
    <div>
      <p>User: {app.user.name}</p>
    </div>
  );
});

// theme만 구독
const ThemeToggle = lmount(() => {
  const app = appStore.useStore(
    store => [store.theme]  // theme 필드만 관찰
  );

  const toggleTheme = () => {
    app.theme = app.theme === 'light' ? 'dark' : 'light';
  };

  return () => (
    <button onClick={toggleTheme}>
      Current: {app.theme}
    </button>
  );
});

// 여러 필드 구독
const MultiFieldWatch = lmount(() => {
  const app = appStore.useStore(
    store => [store.user, store.theme]  // 두 필드 관찰
  );

  // count 변경 시에는 리렌더링 안 됨
  return () => (
    <div>
      <p>{app.user.name}</p>
      <p>Theme: {app.theme}</p>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","makeObserver를 생략하면 store의 모든 필드 변경에 반응합니다. 큰 store에서는 성능 저하가 발생할 수 있으므로, 필요한 필드만 선택적으로 구독하는 것이 좋습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 객체 반응성 (중요!)"}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 주의:"})," lstore는 store와 동일하게"," ",e("strong",{children:"1depth(루트 레벨)의 속성에 대해서만 반응성을 제공"}),"합니다.",e("br",{}),e("br",{}),"중첩된 객체의 속성을 직접 변경하면 반응성이 동작하지 않습니다."]})}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({
  user: {
    profile: {
      name: 'John',
      email: 'john@example.com',
    },
  },
  count: 0,
});

const App = lmount(() => {
  const app = appStore.useStore();

  const tryUpdateName = () => {
    // ❌ 2depth 변경 - 반응성 동작 안 함!
    app.user.profile.name = 'Jane';
    // 값은 변경되지만 리렌더링이 발생하지 않음
  };

  const correctUpdateName = () => {
    // ✅ 1depth 객체를 교체 - 반응성 동작함!
    app.user = {
      ...app.user,
      profile: {
        ...app.user.profile,
        name: 'Jane',
      },
    };
    // 새로운 객체로 교체되므로 리렌더링 발생
  };

  return () => (
    <div>
      <p>Name: {app.user.profile.name}</p>
      <button onClick={tryUpdateName}>직접 변경 (동작 안 함)</button>
      <button onClick={correctUpdateName}>객체 교체 (동작함)</button>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"중첩 객체 다루기 패턴"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["중첩 객체를 업데이트할 때는 항상"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"1depth 속성을 새로운 객체로 교체"}),"해야 합니다. 스프레드 연산자를 활용하면 편리합니다."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const dataStore = lstore({
  settings: {
    display: {
      theme: 'light',
      fontSize: 14,
    },
    privacy: {
      public: true,
    },
  },
});

const Settings = lmount(() => {
  const data = dataStore.useStore();

  const changeTheme = () => {
    // ✅ 올바른 방법: spread로 새 객체 생성
    data.settings = {
      ...data.settings,
      display: {
        ...data.settings.display,
        theme: 'dark',
      },
    };
  };

  const changeFontSize = () => {
    // ✅ 헬퍼 함수를 만들어 사용하면 더 깔끔
    updateNestedProperty(
      data,
      ['settings', 'display', 'fontSize'],
      16
    );
  };

  return () => (
    <div>
      <p>Theme: {data.settings.display.theme}</p>
      <p>Font Size: {data.settings.display.fontSize}</p>
      <button onClick={changeTheme}>Change Theme</button>
      <button onClick={changeFontSize}>Change Font Size</button>
    </div>
  );
});

// 중첩 속성 업데이트 헬퍼 함수
function updateNestedProperty(store: any, path: string[], value: any) {
  const [first, ...rest] = path;

  if (rest.length === 0) {
    store[first] = value;
  } else {
    store[first] = { ...store[first] };
    let current = store[first];

    for (let i = 0; i < rest.length - 1; i++) {
      current[rest[i]] = { ...current[rest[i]] };
      current = current[rest[i]];
    }

    current[rest[rest.length - 1]] = value;
  }
}`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💎 Deep Reactivity:"})," 중첩 객체에 대한 세밀한 반응성이 필요하다면"," ",e("a",{href:"/guide/state-ref",onClick:t=>{t.preventDefault(),v("/guide/state-ref")},class:"underline hover:no-underline font-medium",children:"state-ref"})," ","라이브러리를 사용하는 것을 권장합니다. 자세한 내용은 state-ref 페이지를 참고하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Primitive 값 저장"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstore는 객체뿐만 아니라 primitive 값(number, string, boolean)도 저장할 수 있습니다. primitive 값을 저장하면 자동으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"{ value: ... }"})," ","형태로 래핑됩니다."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

// primitive 값으로 저장
const countStore = lstore(0);

const Counter = lmount(() => {
  const count = countStore.useStore();

  const increment = () => {
    count.value += 1;  // .value를 통해 접근
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","대부분의 경우 객체 형태로 store를 정의하는 것이 좋습니다. 여러 관련된 상태를 하나의 store에 그룹화할 수 있고, 타입 추론도 더 명확합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lstore vs store 비교"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"lstore"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"store"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"대상 컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"lmount (useStore)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"renew 전달"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동 (useRenew 호출)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"수동 (인자로 전달)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 방식"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"store.useStore()"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"store(renew)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"반응성 depth"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"1depth (얕은 반응성)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"1depth (얕은 반응성)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"선택적 구독"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원 (makeObserver)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원 (makeObserver)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount 호환성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"watch() 메서드로 가능"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"기본 방식"})]})]})]})}),e(o,{language:"tsx",code:`import { mount, lmount } from 'lithent';
import { store, lstore } from 'lithent/helper';

// store - mount에서 사용
const userStore = store({ name: 'John' });

const MountComponent = mount(renew => {
  const user = userStore(renew);  // renew 수동 전달
  return () => <div>{user.name}</div>;
});

// lstore - lmount에서 사용
const userLstore = lstore({ name: 'John' });

const LmountComponent = lmount(() => {
  const user = userLstore.useStore();  // 자동 renew
  return () => <div>{user.name}</div>;
});

// lstore의 watch() - mount에서도 사용 가능
const MountWithLstore = mount(renew => {
  const user = userLstore.watch(renew);  // 수동 renew
  return () => <div>{user.name}</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Cache 옵션"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstore는 기본적으로 컴포넌트별로 store 접근을 캐싱합니다. 캐시를 비활성화하려면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"{ cache: false }"})," ","옵션을 전달하세요."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({ count: 0 });

const Component = lmount(() => {
  // 캐시 비활성화
  const app = appStore.useStore(null, { cache: false });

  return () => <div>Count: {app.count}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","일반적으로 캐시를 활성화(기본값)하는 것이 좋습니다. 캐시를 비활성화하면 동일한 컴포넌트 인스턴스에서 useStore()를 여러 번 호출할 때마다 새로운 구독이 생성됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),v("/guide/context")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Context →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트 트리에서 데이터를 공유하는 Context API에 대해 알아보세요.",e("br",{}),"props drilling 없이 깊은 컴포넌트 계층에 데이터를 전달하는 방법을 배워봅시다."]})]})})]}),El=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"State-Ref"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"state-ref란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("a",{href:"https://github.com/superlucky84/state-ref",target:"_blank",rel:"noopener noreferrer",class:"text-[#42b883] hover:underline font-medium",children:"state-ref"}),"는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"중첩 객체에 대한 깊은 반응성(deep reactivity)"}),"을 제공하는 외부 라이브러리입니다.",e("br",{}),e("br",{}),"모든 depth의 중첩 객체와 배열에 대해 반응성을 제공하여, 복잡한 데이터 구조에서도 편리하게 상태를 관리할 수 있습니다.",e("br",{}),e("br",{}),"Lithent와 함께 사용하도록 최적화되어 있으며, 복잡한 중첩 구조를 다루는 경우 매우 유용합니다."]}),e("div",{class:"border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:[e("span",{class:"font-medium",children:"📦 설치:"}),e("br",{}),e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"npm install state-ref"})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["state-ref는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"createStore"})," ","함수를 사용하여 store를 생성합니다. 생성된 store는 renew 함수를 전달받아 컴포넌트와 연결됩니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { createStore } from 'state-ref';

// 타입 정의
type Info = {
  age: number;
  house: { color: string; floor: number }[]
};

type People = {
  john: Info;
  brown: Info;
  sara: Info
};

// store 생성
const peopleStore = createStore<People>({
  john: {
    age: 20,
    house: [
      { color: 'red', floor: 5 },
      { color: 'blue', floor: 3 },
    ],
  },
  brown: {
    age: 26,
    house: [{ color: 'green', floor: 5 }]
  },
  sara: {
    age: 26,
    house: [{ color: 'yellow', floor: 5 }]
  },
});

// 컴포넌트에서 사용
const Component = mount(renew => {
  const peopleRef = peopleStore(renew);

  const changeAge = () => {
    // ✅ 깊은 중첩 속성도 직접 변경 가능!
    peopleRef.john.age.value += 1;
  };

  return () => (
    <div>
      <p>John's age: {peopleRef.john.age.value}</p>
      <button onClick={changeAge}>Increase Age</button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 .value 접근:"})," state-ref의 모든 속성은"," ",e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:".value"}),"를 통해 접근하고 변경합니다. 이는 Proxy를 통한 반응성 추적을 위한 것입니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 객체 반응성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"state-ref의 가장 큰 장점은 깊은 중첩 구조에서도 반응성이 동작한다는 것입니다. 모든 depth의 속성에 대해 .value를 통한 직접 변경이 가능합니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { createStore } from 'state-ref';

// 깊은 중첩 구조의 store 생성
const appStore = createStore({
  user: {
    profile: {
      name: 'John',
      age: 25,
      address: {
        city: 'Seoul',
        country: 'Korea'
      }
    },
    settings: {
      theme: 'light',
      notifications: true
    }
  },
});

const UserProfile = mount(renew => {
  const app = appStore(renew);

  const changeName = () => {
    // ✅ 3depth 중첩 속성 직접 변경 - 반응성 동작함!
    app.user.profile.name.value = 'Jane';
  };

  const changeCity = () => {
    // ✅ 4depth 중첩 속성 직접 변경 - 반응성 동작함!
    app.user.profile.address.city.value = 'Busan';
  };

  const toggleTheme = () => {
    // ✅ 다른 경로의 중첩 속성도 동일하게 동작
    app.user.settings.theme.value =
      app.user.settings.theme.value === 'light' ? 'dark' : 'light';
  };

  return () => (
    <div>
      <h2>Profile</h2>
      <p>Name: {app.user.profile.name.value}</p>
      <p>Age: {app.user.profile.age.value}</p>
      <p>City: {app.user.profile.address.city.value}</p>
      <p>Theme: {app.user.settings.theme.value}</p>

      <button onClick={changeName}>Change Name</button>
      <button onClick={changeCity}>Change City</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"배열 반응성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"state-ref에서 배열을 다룰 때는 프록시 setter가 호출되도록 인덱스를 통한 직접 할당을 사용해야 합니다. 배열 내부 객체의 속성 변경은 .value를 통해 감지됩니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { createStore } from 'state-ref';

type Todo = { id: number; text: string; done: boolean };

const todoStore = createStore<{ todos: Todo[] }>({
  todos: [
    { id: 1, text: 'Learn Lithent', done: false },
    { id: 2, text: 'Build App', done: false },
  ],
});

const TodoList = mount(renew => {
  const store = todoStore(renew);

  const addTodo = () => {
    // ✅ 인덱스를 통한 직접 할당 - 반응성 동작함
    const newTodo = {
      id: Date.now(),
      text: 'New Todo',
      done: false,
    };
    store.todos.value[store.todos.value.length] = newTodo;
  };

  const toggleTodo = (index: number) => {
    // ✅ 배열 내부 객체 속성 변경 - 반응성 동작함
    const todo = store.todos.value[index];
    todo.done.value = !todo.done.value;
  };

  const removeTodo = (index: number) => {
    // ✅ 인덱스를 통한 삭제 - filter로 새 배열 생성
    store.todos.value = store.todos.value.filter((_, i) => i !== index);
  };

  return () => (
    <div>
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {store.todos.value.map((todo, index) => (
          <li>
            <span style={{
              textDecoration: todo.done.value ? 'line-through' : 'none'
            }}>
              {todo.text.value}
            </span>
            <button onClick={() => toggleTodo(index)}>Toggle</button>
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ state-ref가 유용한 경우"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 깊은 중첩 구조의 복잡한 데이터 (예: 폼 데이터, 설정 객체, API 응답)"}),e("li",{children:"• 배열 내부 객체의 속성을 자주 변경하는 경우"}),e("li",{children:"• 여러 depth의 속성을 동시에 업데이트해야 하는 경우"}),e("li",{children:"• 트리 구조나 그래프 같은 재귀적 데이터 구조"}),e("li",{children:"• 복잡한 상태 관리가 필요한 대시보드나 폼"})]})]}),e("h3",{class:"text-xl font-medium text-gray-900 dark:text-white mb-4",children:"실제 사용 예시"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"다음과 같은 실제 시나리오에서 state-ref가 특히 유용합니다:"}),e("ul",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-3 mb-6 list-disc list-inside",children:[e("li",{children:[e("strong",{class:"font-semibold",children:"다단계 폼:"})," 여러 섹션으로 나뉜 폼에서 각 필드를 개별적으로 업데이트"]}),e("li",{children:[e("strong",{class:"font-semibold",children:"설정 패널:"})," 다양한 카테고리와 하위 설정을 가진 애플리케이션 설정"]}),e("li",{children:[e("strong",{class:"font-semibold",children:"채팅 애플리케이션:"})," 사용자, 메시지, 채널이 중첩된 구조"]}),e("li",{children:[e("strong",{class:"font-semibold",children:"대시보드:"})," 위젯, 차트, 필터가 복잡하게 구성된 데이터 시각화"]}),e("li",{children:[e("strong",{class:"font-semibold",children:"파일 탐색기:"})," 폴더와 파일이 트리 구조로 구성된 인터페이스"]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ .value 필수:"})," state-ref의 모든 속성은"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:".value"}),"를 통해 접근해야 합니다. 이를 생략하면 Proxy 객체가 반환되어 예상과 다른 동작이 발생할 수 있습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 배열 메서드 주의:"})," push, pop, splice 같은 배열 메서드를 직접 호출하면 프록시 setter가 트리거되지 않아 반응성이 동작하지 않습니다. 대신 인덱스를 통한 직접 할당"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"arr.value[0] = item"})," ","또는 전체 배열 교체"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"arr.value = [...]"}),"를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ mount 권장:"})," state-ref는 renew를 명시적으로 전달하는 방식이므로"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"mount"}),"와 함께 사용하는 것이 자연스럽습니다. lmount에서 사용하려면 useRenew()를 직접 호출해야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"더 알아보기"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"https://github.com/superlucky84/state-ref",target:"_blank",rel:"noopener noreferrer",class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"GitHub Repository →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"state-ref의 전체 API 문서와 더 많은 예제를 확인하세요."})]}),e("a",{href:"/guide/store",onClick:t=>{t.preventDefault(),v("/guide/store")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"← Store Helper"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"Lithent 내장 store의 사용법을 다시 확인하세요."})]})]})]}),Dl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Context Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Context는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트 트리에서 데이터를 공유"}),"하는 헬퍼입니다.",e("br",{}),e("br",{}),"Props drilling 없이 깊은 계층의 컴포넌트에 데이터를 전달할 수 있으며,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 명시적으로 전달"}),"하는 방식으로 동작합니다. 따라서 mount 컴포넌트와 함께 사용하는 것이 자연스럽습니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

// 1. Context 생성
type AppContext = {
  user: string;
  theme: string;
};

const appContext = createContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

// 2. Provider 컴포넌트 (데이터 제공)
const App = mount(renew => {
  // renew 없이 생성 (권장)
  const userState = contextState('John');
  const themeState = contextState('light');

  return () => (
    <Provider user={userState} theme={themeState}>
      <Header />
      <Main />
    </Provider>
  );
});

// 3. Consumer 컴포넌트 (데이터 사용 및 변경)
const Header = mount(renew => {
  // Consumer에서 renew로 구독
  const ctx = useContext(appContext, renew);

  const changeUser = () => {
    // Consumer에서 값 변경
    ctx.user.value = 'Jane';
  };

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
      <p>Theme: {ctx.theme.value}</p>
      <button onClick={changeUser}>Change User</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"1. Context 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"createContext"}),"로 Context를 생성합니다. 타입 인자로 Context가 관리할 데이터 구조를 정의합니다."]}),e(o,{language:"tsx",code:`import { createContext } from 'lithent/helper';

// Context 타입 정의
type UserContext = {
  name: string;
  age: number;
};

// Context 생성
const userContext = createContext<UserContext>();

// 구조분해로 필요한 것들 추출
const { Provider, contextState, useContext } = userContext;`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"2. contextState로 상태 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Provider에 전달할 상태를"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"로 생성합니다. 초기값을 인자로 전달합니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"일반적으로 renew를 전달하지 않습니다."})," ","Provider는 초기값을 제공하는 역할만 하고, Consumer에서 값을 구독하고 변경합니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const App = mount(renew => {
  // contextState로 상태 생성 (renew 없이)
  const nameState = contextState('John');
  const ageState = contextState(25);

  // Provider에 전달할 준비 완료
  return () => (
    <Provider name={nameState} age={ageState}>
      <Content />
    </Provider>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"3. Provider로 Context 제공"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Provider 컴포넌트로 하위 컴포넌트들에게 Context를 제공합니다. Context 타입에 정의된 키들을 props로 전달합니다."}),e(o,{language:"tsx",code:`const App = mount(renew => {
  // renew 없이 생성 (권장)
  const nameState = contextState('John');
  const ageState = contextState(25);

  const updateName = () => {
    // 값 변경은 가능하지만, Provider는 리렌더링 안 됨
    nameState.value = 'Jane';
    // Consumer들은 이 변경사항을 받아서 리렌더링됨
  };

  return () => (
    <div>
      <Provider name={nameState} age={ageState}>
        {/* Provider 내부의 모든 컴포넌트가 Context 사용 가능 */}
        <Header />
        <Content />
        <Footer />
      </Provider>

      {/* Provider 외부에서 상태 변경 가능 */}
      <button onClick={updateName}>Change Name</button>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"4. useContext로 Context 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["하위 컴포넌트에서"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useContext"}),"로 Context를 사용합니다. renew를 전달하여 Context 변경 시 리렌더링되도록 합니다."]}),e(o,{language:"tsx",code:`const Header = mount(renew => {
  // useContext로 Context 접근
  const ctx = useContext(userContext, renew);

  const changeName = () => {
    // Consumer에서 값 변경 가능
    ctx.name.value = 'Alice';
  };

  return () => (
    <div>
      <p>Name: {ctx.name.value}</p>
      <p>Age: {ctx.age.value}</p>
      <button onClick={changeName}>Change Name</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선택적 구독"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"useContext의 세 번째 인자로 구독할 키를 지정할 수 있습니다. 특정 필드의 변경에만 반응하도록 최적화할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type AppContext = {
  user: string;
  theme: string;
  count: number;
};

const appContext = createContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

const App = mount(renew => {
  // renew 없이 생성
  const userState = contextState('John');
  const themeState = contextState('light');
  const countState = contextState(0);

  return () => (
    <Provider user={userState} theme={themeState} count={countState}>
      <FullSubscribe />
      <UserOnly />
      <ThemeAndCount />
    </Provider>
  );
});

// 모든 키 구독 (기본값)
const FullSubscribe = mount(renew => {
  const ctx = useContext(appContext, renew);
  // user, theme, count 중 하나라도 변경되면 리렌더링

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
      <p>Theme: {ctx.theme.value}</p>
      <p>Count: {ctx.count.value}</p>
    </div>
  );
});

// user만 구독
const UserOnly = mount(renew => {
  const ctx = useContext(appContext, renew, ['user']);
  // user만 변경될 때만 리렌더링 (성능 최적화)

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
    </div>
  );
});

// theme과 count만 구독
const ThemeAndCount = mount(renew => {
  const ctx = useContext(appContext, renew, ['theme', 'count']);
  // theme 또는 count 변경 시에만 리렌더링

  return () => (
    <div>
      <p>Theme: {ctx.theme.value}</p>
      <p>Count: {ctx.count.value}</p>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 성능 최적화:"})," ","여러 필드를 가진 큰 Context에서는 선택적 구독을 사용하는 것이 좋습니다. 필요한 필드만 구독하면 불필요한 리렌더링을 방지할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context 값 변경"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["기본적으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"로 생성한 상태는 Provider와 Consumer 어디서든 값을 변경할 수 있습니다.",e("br",{}),e("br",{}),"하지만"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 없이 생성하면 Consumer에서만 구독"}),"되므로, Provider에서 값을 변경해도 Provider 자체는 리렌더링되지 않습니다. 실질적으로는 단방향처럼 동작합니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type CounterContext = {
  count: number;
};

const counterContext = createContext<CounterContext>();
const { Provider, contextState, useContext } = counterContext;

const App = mount(renew => {
  // ⚠️ renew 없이 생성 - Provider는 구독하지 않음
  const countState = contextState(0);

  const incrementFromProvider = () => {
    // ⚠️ 값은 변경되지만 Provider는 리렌더링 안 됨
    countState.value += 1;
    // Consumer는 이 변경사항을 받아서 리렌더링됨
  };

  return () => (
    <div>
      <Provider count={countState}>
        <Counter />
      </Provider>

      {/* Provider에서 변경 */}
      <button onClick={incrementFromProvider}>
        Increment from Provider
      </button>

      {/* ⚠️ Provider는 리렌더링 안 되므로 이 값은 갱신 안 됨 */}
      <p>Provider count: {countState.value}</p>
    </div>
  );
});

const Counter = mount(renew => {
  // ✅ Consumer는 renew로 구독함
  const ctx = useContext(counterContext, renew);

  const incrementFromConsumer = () => {
    // ✅ Consumer에서 값 변경 - Consumer만 리렌더링
    ctx.count.value += 1;
  };

  return () => (
    <div>
      {/* ✅ Consumer는 변경사항을 항상 반영 */}
      <p>Consumer count: {ctx.count.value}</p>
      <button onClick={incrementFromConsumer}>
        Increment from Consumer
      </button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 권장 패턴:"})," 일반적으로"," ",e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"contextState"}),"는 renew 없이 생성하고, Consumer에서만 값을 읽고 변경하는 것이 좋습니다. Provider는 초기값만 제공하는 역할로 사용하세요."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"양방향 동기화 (권장하지 않음)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"의 두 번째 인자로 renew를 전달하면 진짜 양방향 동기화가 가능하지만,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"권장하지 않습니다."})]}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 양방향 동기화 문제:"}),e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"contextState(initialValue, renew)"}),e("br",{}),e("br",{}),"위처럼 renew를 전달하면 Provider에서 값 변경 시 Provider가 리렌더링되어 양방향 동기화가 가능합니다. 하지만"," ",e("strong",{class:"font-semibold",children:"Provider 하위 트리 전체가 리렌더링"}),"되는 부작용이 발생합니다.",e("br",{}),e("br",{}),"Consumer는 선택적 구독으로 필요한 컴포넌트만 리렌더링하지만, Provider에 renew를 전달하면 모든 하위 컴포넌트가 영향을 받아 성능 문제가 발생할 수 있습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold",children:"권장: renew를 전달하지 말고 Consumer에서만 값을 관리하세요."})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 Provider"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Provider는 중첩될 수 있으며, Consumer는 가장 가까운 상위 Provider를 사용합니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type ThemeContext = {
  color: string;
};

const themeContext = createContext<ThemeContext>();
const { Provider, contextState, useContext } = themeContext;

const App = mount(renew => {
  // renew 없이 생성
  const blueTheme = contextState('blue');
  const redTheme = contextState('red');

  return () => (
    <Provider color={blueTheme}>
      <Child /> {/* blue 사용 */}

      {/* 중첩 Provider */}
      <Provider color={redTheme}>
        <Child /> {/* red 사용 (가까운 Provider) */}
      </Provider>
    </Provider>
  );
});

const Child = mount(renew => {
  const ctx = useContext(themeContext, renew);

  return () => (
    <div style={{ color: ctx.color.value }}>
      Theme: {ctx.color.value}
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 Context 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"하나의 컴포넌트에서 여러 Context를 동시에 사용할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

// 여러 Context 정의
type UserContext = { name: string };
type ThemeContext = { mode: string };

const userContext = createContext<UserContext>();
const themeContext = createContext<ThemeContext>();

const App = mount(renew => {
  // renew 없이 생성
  const userName = userContext.contextState('John');
  const themeMode = themeContext.contextState('dark');

  return () => (
    <userContext.Provider name={userName}>
      <themeContext.Provider mode={themeMode}>
        <Content />
      </themeContext.Provider>
    </userContext.Provider>
  );
});

const Content = mount(renew => {
  // 여러 Context 동시 사용
  const user = userContext.useContext(userContext, renew);
  const theme = themeContext.useContext(themeContext, renew);

  return () => (
    <div>
      <p>User: {user.name.value}</p>
      <p>Theme: {theme.mode.value}</p>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context vs Store 비교"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"Context"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"Store"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"범위"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Provider 하위 컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"전역 (모든 컴포넌트)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"중첩"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"가능 (Provider 중첩)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"불가능 (전역 단일)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 케이스"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"특정 트리 내 공유"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"앱 전역 상태"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Props drilling"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"해결함"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"해결함"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"선택적 구독"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원 (subscribeKeys)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원 (makeObserver)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"대상 컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount"})]})]})]})}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ Context 사용 권장"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 특정 컴포넌트 트리 내에서만 공유되는 데이터"}),e("li",{children:"• 같은 타입의 Context를 여러 곳에서 독립적으로 사용"}),e("li",{children:"• UI 테마, 언어 설정 등 트리별로 다를 수 있는 설정"}),e("li",{children:"• Props drilling을 피하고 싶을 때"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-blue-900 dark:text-blue-100 mb-2",children:"✅ Store 사용 권장"}),e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2",children:[e("li",{children:"• 앱 전역에서 공유되는 상태"}),e("li",{children:"• 사용자 인증 정보, 전역 설정 등"}),e("li",{children:"• 컴포넌트 트리와 무관하게 접근해야 하는 데이터"}),e("li",{children:"• 더 단순한 API를 원할 때"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ mount 전용:"})," Context는 renew를 명시적으로 전달하는 방식이므로"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"mount"})," ","컴포넌트에서 사용해야 합니다. lmount에서는"," ",e("a",{href:"/guide/lcontext",onClick:t=>{t.preventDefault(),v("/guide/lcontext")},class:"underline hover:no-underline font-medium",children:"lcontext"}),"를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Provider 필수:"})," useContext를 사용하려면 상위에 Provider가 반드시 있어야 합니다. Provider가 없으면 Context를 찾을 수 없습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ .value 접근:"})," contextState로 생성한 상태는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:".value"}),"를 통해 접근하고 변경해야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/lcontext",onClick:t=>{t.preventDefault(),v("/guide/lcontext")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: LContext →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["lmount 컴포넌트에서 사용하는 LContext에 대해 알아보세요.",e("br",{}),"자동 renew 관리로 더 간편한 Context 사용 방법을 배워봅시다."]})]})})]}),Ol=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"LContext Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"LContext란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["LContext는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lmount 컴포넌트 전용 Context"}),"입니다.",e("br",{}),e("br",{}),e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),v("/guide/context")},class:"text-[#42b883] hover:underline font-medium",children:"Context"}),"와 달리"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 자동으로 관리"}),"하며, lmount의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useRenew()"})," ","훅을 내부적으로 사용합니다. 따라서 lmount 컴포넌트에서 더 간편하게 Context를 사용할 수 있습니다."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

// 1. LContext 생성
type AppContext = {
  user: string;
  theme: string;
};

const appContext = createLContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

// 2. Provider 컴포넌트
const App = lmount((props, children) => {
  const userState = contextState('John');
  const themeState = contextState('light');

  return () => (
    <Provider user={userState} theme={themeState}>
      <Header />
      <Main />
    </Provider>
  );
});

// 3. Consumer 컴포넌트 (자동 renew 관리)
const Header = lmount((props, children) => {
  // renew 전달 불필요 - useRenew()로 자동 관리
  const ctx = useContext(appContext);

  const changeUser = () => {
    ctx.user.value = 'Jane';
  };

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
      <p>Theme: {ctx.theme.value}</p>
      <button onClick={changeUser}>Change User</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"1. LContext 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"createLContext"}),"로 LContext를 생성합니다. 타입 인자로 Context가 관리할 데이터 구조를 정의합니다."]}),e(o,{language:"tsx",code:`import { createLContext } from 'lithent/helper';

// LContext 타입 정의
type UserContext = {
  name: string;
  age: number;
};

// LContext 생성
const userContext = createLContext<UserContext>();

// 구조분해로 필요한 것들 추출
const { Provider, contextState, useContext } = userContext;`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"2. contextState로 상태 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Provider에 전달할 상태를"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"로 생성합니다. 초기값을 인자로 전달합니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Context와 달리 renew 파라미터가 없습니다."})," ","Consumer에서 useContext를 호출할 때 자동으로 renew가 연결됩니다."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';

const App = lmount((props, children) => {
  // contextState로 상태 생성 (renew 없음)
  const nameState = contextState('John');
  const ageState = contextState(25);

  // Provider에 전달할 준비 완료
  return () => (
    <Provider name={nameState} age={ageState}>
      <Content />
    </Provider>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"3. Provider로 Context 제공"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Provider 컴포넌트로 하위 컴포넌트들에게 Context를 제공합니다. Context 타입에 정의된 키들을 props로 전달합니다."}),e(o,{language:"tsx",code:`const App = lmount((props, children) => {
  const nameState = contextState('John');
  const ageState = contextState(25);

  const updateName = () => {
    // Provider에서 값 변경 가능
    nameState.value = 'Jane';
    // Consumer들이 자동으로 리렌더링됨
  };

  return () => (
    <div>
      <Provider name={nameState} age={ageState}>
        {/* Provider 내부의 모든 컴포넌트가 Context 사용 가능 */}
        <Header />
        <Content />
        <Footer />
      </Provider>

      {/* Provider 외부에서 상태 변경 */}
      <button onClick={updateName}>Change Name</button>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"4. useContext로 Context 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["하위 컴포넌트에서"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useContext"}),"로 Context를 사용합니다."," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 전달하지 않습니다"})," ","- 내부적으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useRenew()"}),"를 자동으로 호출하여 리렌더링을 관리합니다."]}),e(o,{language:"tsx",code:`const Header = lmount((props, children) => {
  // renew 전달 불필요 - 자동으로 관리됨
  const ctx = useContext(userContext);

  const changeName = () => {
    // Consumer에서 값 변경
    ctx.name.value = 'Alice';
  };

  return () => (
    <div>
      <p>Name: {ctx.name.value}</p>
      <p>Age: {ctx.age.value}</p>
      <button onClick={changeName}>Change Name</button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 자동 renew 관리:"})," LContext는 lmount의"," ",e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"useRenew()"})," ","훅을 사용하여 renew를 자동으로 관리합니다. 따라서 Context보다 더 간편하게 사용할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선택적 구독"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"useContext의 두 번째 인자로 구독할 키를 지정할 수 있습니다. 특정 필드의 변경에만 반응하도록 최적화할 수 있습니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

type AppContext = {
  user: string;
  theme: string;
  count: number;
};

const appContext = createLContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

const App = lmount((props, children) => {
  const userState = contextState('John');
  const themeState = contextState('light');
  const countState = contextState(0);

  return () => (
    <Provider user={userState} theme={themeState} count={countState}>
      <FullSubscribe />
      <UserOnly />
      <ThemeAndCount />
    </Provider>
  );
});

// 모든 키 구독 (기본값)
const FullSubscribe = lmount((props, children) => {
  const ctx = useContext(appContext);
  // user, theme, count 중 하나라도 변경되면 리렌더링

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
      <p>Theme: {ctx.theme.value}</p>
      <p>Count: {ctx.count.value}</p>
    </div>
  );
});

// user만 구독
const UserOnly = lmount((props, children) => {
  const ctx = useContext(appContext, ['user']);
  // user만 변경될 때만 리렌더링 (성능 최적화)

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
    </div>
  );
});

// theme과 count만 구독
const ThemeAndCount = lmount((props, children) => {
  const ctx = useContext(appContext, ['theme', 'count']);
  // theme 또는 count 변경 시에만 리렌더링

  return () => (
    <div>
      <p>Theme: {ctx.theme.value}</p>
      <p>Count: {ctx.count.value}</p>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 성능 최적화:"})," ","여러 필드를 가진 큰 Context에서는 선택적 구독을 사용하는 것이 좋습니다. 필요한 필드만 구독하면 불필요한 리렌더링을 방지할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context 값 변경"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["LContext의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"는 renew 파라미터를 받지 않습니다. 따라서"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Provider는 Context 값 변경을 구독하지 않습니다."}),e("br",{}),e("br",{}),"Provider에서 값을 변경하면 Consumer들은 업데이트되지만, Provider 자체는 리렌더링되지 않습니다. 실질적으로는 단방향처럼 동작합니다."]}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

type CounterContext = {
  count: number;
};

const counterContext = createLContext<CounterContext>();
const { Provider, contextState, useContext } = counterContext;

const App = lmount((props, children) => {
  // contextState는 renew를 받지 않음 - Provider는 구독하지 않음
  const countState = contextState(0);

  const incrementFromProvider = () => {
    // ⚠️ 값은 변경되지만 Provider는 리렌더링 안 됨
    countState.value += 1;
    // Consumer는 이 변경사항을 받아서 리렌더링됨
  };

  return () => (
    <div>
      <Provider count={countState}>
        <Counter />
      </Provider>

      {/* Provider에서 변경 */}
      <button onClick={incrementFromProvider}>
        Increment from Provider
      </button>

      {/* ⚠️ Provider는 리렌더링 안 되므로 이 값은 갱신 안 됨 */}
      <p>Provider count: {countState.value}</p>
    </div>
  );
});

const Counter = lmount((props, children) => {
  // Consumer는 useRenew()로 자동 구독
  const ctx = useContext(counterContext);

  const incrementFromConsumer = () => {
    // ✅ Consumer에서 값 변경 - Consumer만 리렌더링
    ctx.count.value += 1;
  };

  return () => (
    <div>
      {/* ✅ Consumer는 변경사항을 항상 반영 */}
      <p>Consumer count: {ctx.count.value}</p>
      <button onClick={incrementFromConsumer}>
        Increment from Consumer
      </button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 권장 패턴:"})," Provider는 초기값만 제공하는 역할로 사용하고, Consumer에서만 값을 읽고 변경하는 것이 좋습니다. 이는"," ",e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),v("/guide/context")},class:"underline hover:no-underline font-medium",children:"Context"}),"와 동일한 패턴입니다."]})}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 양방향 동기화 불가:"})," LContext의"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"contextState"}),"는 renew 파라미터를 받지 않으므로, Provider에서 양방향 동기화를 구현할 수 없습니다.",e("br",{}),e("br",{}),"만약 Provider에서도 Context 값 변경에 반응해야 한다면, 일반적으로"," ",e("strong",{class:"font-semibold",children:"권장하지 않지만"})," ",e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),v("/guide/context")},class:"underline hover:no-underline font-medium",children:"Context"}),"를 사용하고"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"contextState(value, renew)"}),"로 renew를 전달할 수 있습니다. 하지만 이 경우 Provider 하위 트리 전체가 리렌더링되는 성능 문제가 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 Provider"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Provider는 중첩될 수 있으며, Consumer는 가장 가까운 상위 Provider를 사용합니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

type ThemeContext = {
  color: string;
};

const themeContext = createLContext<ThemeContext>();
const { Provider, contextState, useContext } = themeContext;

const App = lmount((props, children) => {
  const blueTheme = contextState('blue');
  const redTheme = contextState('red');

  return () => (
    <Provider color={blueTheme}>
      <Child /> {/* blue 사용 */}

      {/* 중첩 Provider */}
      <Provider color={redTheme}>
        <Child /> {/* red 사용 (가까운 Provider) */}
      </Provider>
    </Provider>
  );
});

const Child = lmount((props, children) => {
  const ctx = useContext(themeContext);

  return () => (
    <div style={{ color: ctx.color.value }}>
      Theme: {ctx.color.value}
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 Context 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"하나의 컴포넌트에서 여러 Context를 동시에 사용할 수 있습니다."}),e(o,{language:"tsx",code:`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

// 여러 LContext 정의
type UserContext = { name: string };
type ThemeContext = { mode: string };

const userContext = createLContext<UserContext>();
const themeContext = createLContext<ThemeContext>();

const App = lmount((props, children) => {
  const userName = userContext.contextState('John');
  const themeMode = themeContext.contextState('dark');

  return () => (
    <userContext.Provider name={userName}>
      <themeContext.Provider mode={themeMode}>
        <Content />
      </themeContext.Provider>
    </userContext.Provider>
  );
});

const Content = lmount((props, children) => {
  // 여러 Context 동시 사용
  const user = userContext.useContext(userContext);
  const theme = themeContext.useContext(themeContext);

  return () => (
    <div>
      <p>User: {user.name.value}</p>
      <p>Theme: {theme.mode.value}</p>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context vs LContext 비교"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"Context"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"LContext"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"대상 컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"lmount"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"renew 관리"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"수동 (renew 전달)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동 (useRenew 사용)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"contextState"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"contextState(value, renew?)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"contextState(value)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"useContext"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"useContext(ctx, renew, keys?)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"useContext(ctx, keys?)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Provider 구독"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"renew 전달 시 (비권장)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"불가 (renew 없음)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"선택적 구독"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 편의성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"보통 (명시적 관리)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"높음 (자동 관리)"})]})]})]})}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ LContext 사용 권장"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• lmount 컴포넌트를 사용하는 경우"}),e("li",{children:"• renew를 자동으로 관리하고 싶을 때"}),e("li",{children:"• Consumer에서만 Context 값을 변경하는 단방향 패턴"}),e("li",{children:"• 더 간편한 API를 원할 때"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-blue-900 dark:text-blue-100 mb-2",children:"✅ Context 사용 권장"}),e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2",children:[e("li",{children:"• mount 컴포넌트를 사용하는 경우"}),e("li",{children:"• renew를 명시적으로 관리하고 싶을 때"}),e("li",{children:"• Provider는 초기값만 제공하는 단방향 패턴을 원할 때"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ lmount 전용:"})," LContext는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"lmount"})," ","컴포넌트 전용입니다. mount 컴포넌트에서는"," ",e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),v("/guide/context")},class:"underline hover:no-underline font-medium",children:"Context"}),"를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Provider 필수:"})," useContext를 사용하려면 상위에 Provider가 반드시 있어야 합니다. Provider가 없으면 Context를 찾을 수 없습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ .value 접근:"})," contextState로 생성한 상태는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:".value"}),"를 통해 접근하고 변경해야 합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ useRenew 의존성:"})," LContext는 내부적으로"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"useRenew()"}),"를 사용하므로, lmount의 Hook 규칙을 따라야 합니다. useContext는 조건문 안에서 호출하지 마세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),v("/guide/context")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"← Helper: Context"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["mount 컴포넌트에서 사용하는 Context에 대해 알아보세요.",e("br",{}),"명시적 renew 관리 방식을 배워봅시다."]})]}),e("a",{href:"/guide/store",onClick:t=>{t.preventDefault(),v("/guide/store")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Store →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"전역 상태 관리를 위한 Store Helper에 대해 알아보세요."})]})]})]}),Rl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"CacheUpdate Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"CacheUpdate란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["CacheUpdate는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트의 렌더링 결과를 캐싱"}),"하는 헬퍼입니다.",e("br",{}),e("br",{}),"의존성 배열이 변경되지 않으면 이전에 생성한 Virtual DOM을 재사용하여"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"불필요한 리렌더링을 방지"}),"합니다. React의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useMemo"}),"나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"React.memo"}),"와 유사한 개념입니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 성능 최적화:"})," cacheUpdate는 렌더링 최적화를 위한 도구입니다. 모든 컴포넌트에 사용할 필요는 없으며, 성능 병목이 발생하는 컴포넌트에만 선택적으로 적용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["cacheUpdate는 두 개의 인자를 받습니다:",e("br",{}),e("br",{}),"1."," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"checkFunction"}),": 의존성 배열을 반환하는 함수",e("br",{}),"2."," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"updater"}),": Virtual DOM을 반환하는 렌더 함수",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"중요:"})," ","checkFunction은 배열을 직접 전달하는 것이 아니라"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"배열을 반환하는 함수"}),"입니다. 이는 Lithent의 클로저 기반 상태 관리 방식 때문에 매 렌더링마다 최신 값을 읽기 위함입니다."]}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const Counter = mount(renew => {
  let count = 0;
  let otherValue = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  const changeOther = () => {
    otherValue += 1;
    renew();
  };

  // cacheUpdate로 렌더링 결과 캐싱
  return cacheUpdate(
    // 1. checkFunction: 의존성 배열 반환
    () => [count],

    // 2. updater: 렌더 함수
    (props) => (
      <div>
        <p>Count: {count}</p>
        <p>Other: {otherValue}</p>
        <button onClick={increment}>Increment Count</button>
        <button onClick={changeOther}>Change Other</button>
      </div>
    )
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 동작 방식:"})," ","위 예제에서"," ",e("code",{class:"px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm",children:"changeOther"}),"를 클릭해도"," ",e("code",{class:"px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm",children:"count"}),"가 변경되지 않았으므로 렌더링이 발생하지 않습니다. 화면에 표시된"," ",e("code",{class:"px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm",children:"otherValue"}),"는 업데이트되지 않습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"의존성 배열"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["checkFunction은 배열을 반환해야 하며, 이 배열의 각 요소는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"참조 비교(===)"}),"로 이전 값과 비교됩니다. 모든 요소가 같으면 캐시된 렌더링 결과를 재사용합니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 왜 함수로 설계되었나요?"}),e("br",{}),e("br",{}),"Lithent는 ",e("strong",{class:"font-semibold",children:"클로저 기반 상태 관리"}),"를 사용합니다. 컴포넌트의 상태(count, name 등)는 클로저 변수로 존재하며, 매 렌더링 시점마다 변경 여부를 확인하려면"," ",e("strong",{class:"font-semibold",children:"그 시점의 최신 값"}),"을 읽어야 합니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"() => [count, name]"}),"처럼 함수로 설계하면, 의존성을 확인할 때마다 이 함수를 호출하여"," ",e("strong",{class:"font-semibold",children:"항상 최신 클로저 값"}),"을 가져올 수 있습니다. 함수 호출 시점에 count와 name의 현재 값을 읽어 배열로 반환하므로, 이전 값과 비교하여 변경 여부를 정확히 감지할 수 있습니다."]})}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const UserProfile = mount<{ userId: number }>(renew => {
  // 클로저 변수로 상태 관리
  let userName = 'John';
  let userAge = 25;
  let settings = { theme: 'light' };

  return cacheUpdate(
    () => [userName, userAge],
    // ☝️ 렌더링 시점마다 함수를 호출하여 최신 값으로 배열 생성
    //    이전 값과 비교하여 변경 여부 감지

    (props) => (
      <div>
        <h1>User: {userName}</h1>
        <p>Age: {userAge}</p>
        <p>Theme: {settings.theme}</p>
        <p>User ID: {props.userId}</p>
      </div>
    )
  );
});

// userName이나 userAge가 변경되면 리렌더링
// settings.theme이 변경되어도 리렌더링 안 됨 (의존성이 아님)
// props.userId가 변경되면? updater 함수가 props를 받으므로 자동으로 반영됨`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 참조 비교:"})," 의존성 배열은 참조 비교를 사용합니다. 객체나 배열을 의존성으로 사용할 때는 주의하세요. 내용이 같아도 참조가 다르면 다른 값으로 인식됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실제 사용 예시"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"1. 리스트 아이템 최적화"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"리스트의 각 아이템을 최적화하여, 다른 아이템이 변경되어도 영향을 받지 않도록 할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

type TodoItem = {
  id: number;
  text: string;
  done: boolean;
};

const TodoListItem = mount<TodoItem>(renew => {
  return cacheUpdate(
    // props의 모든 값을 의존성으로 지정
    (props) => [props.id, props.text, props.done],

    (props) => (
      <li>
        <input
          type="checkbox"
          checked={props.done}
          onChange={() => {
            // 부모 컴포넌트에서 처리
          }}
        />
        <span style={{ textDecoration: props.done ? 'line-through' : 'none' }}>
          {props.text}
        </span>
      </li>
    )
  );
});

const TodoList = mount(renew => {
  let todos: TodoItem[] = [
    { id: 1, text: 'Learn Lithent', done: false },
    { id: 2, text: 'Build App', done: false },
  ];

  return () => (
    <ul>
      {todos.map(todo => (
        <TodoListItem key={todo.id} {...todo} />
      ))}
    </ul>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"2. 복잡한 계산 결과 캐싱"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"비용이 큰 계산의 결과를 캐싱하여 불필요한 재계산을 방지할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const ExpensiveComponent = mount(renew => {
  let searchQuery = '';
  let filterOption = 'all';
  let sortOption = 'name';

  const updateSearch = (query: string) => {
    searchQuery = query;
    renew();
  };

  return cacheUpdate(
    // searchQuery만 의존성으로 지정
    // filterOption, sortOption 변경 시에는 리렌더링 안 함
    () => [searchQuery],

    () => {
      // 비용이 큰 계산
      const filteredResults = performExpensiveSearch(searchQuery);

      return (
        <div>
          <input
            type="text"
            value={searchQuery}
            onInput={(e: Event) => {
              updateSearch((e.target as HTMLInputElement).value);
            }}
          />
          <div>Results: {filteredResults.length}</div>
        </div>
      );
    }
  );
});

function performExpensiveSearch(query: string) {
  // 비용이 큰 검색 로직
  console.log('Performing expensive search...');
  return [];
}`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"3. 부분 업데이트 최적화"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"컴포넌트의 일부만 의존성으로 지정하여, 나머지 상태 변경 시 렌더링을 건너뛸 수 있습니다."}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const Dashboard = mount(renew => {
  let importantData = 'Critical Info';
  let lessImportantData = 'Extra Info';
  let debugInfo = 'Debug Data';

  const updateImportant = () => {
    importantData = 'Updated Critical Info';
    renew();
  };

  const updateDebug = () => {
    debugInfo = \`Debug \${Date.now()}\`;
    renew(); // renew 호출해도 리렌더링 안 됨!
  };

  return cacheUpdate(
    // importantData만 의존성으로 지정
    () => [importantData],

    () => (
      <div>
        <h1>Dashboard</h1>
        <p>Important: {importantData}</p>
        <p>Less Important: {lessImportantData}</p>
        <p>Debug: {debugInfo}</p>
        <button onClick={updateImportant}>Update Important</button>
        <button onClick={updateDebug}>Update Debug (no render)</button>
      </div>
    )
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"cacheUpdate vs Computed 비교"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"cacheUpdate"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"computed"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"목적"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"렌더링 결과 캐싱"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"계산 결과 캐싱"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"반환값"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Virtual DOM (렌더 함수)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"계산된 값"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 위치"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount의 return 문"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mounter 함수 내부"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"의존성 지정"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"명시적 (checkFunction)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동 추적 (state 접근)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"renew 필요"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"필요 (수동)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"적용 대상"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount, lmount"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount (state와 함께)"})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 참조 비교:"})," 의존성 배열의 각 요소는"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"==="}),"로 비교됩니다. 객체나 배열을 의존성으로 사용하면, 내용이 같아도 참조가 다르면 매번 리렌더링됩니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 의존성 누락:"})," updater 함수에서 사용하는 모든 변수를 의존성 배열에 포함해야 합니다. 누락하면 화면이 최신 상태를 반영하지 못합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 과도한 사용 주의:"})," 모든 컴포넌트에 cacheUpdate를 사용할 필요는 없습니다. 실제로 성능 문제가 있는 부분에만 적용하세요. 불필요하게 사용하면 오히려 코드가 복잡해집니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ renew 호출:"})," 의존성이 변경되지 않으면 renew를 호출해도 리렌더링이 발생하지 않습니다. 이는 의도된 동작이지만, 예상과 다를 수 있으니 주의하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ cacheUpdate 사용 권장"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 렌더링 비용이 큰 컴포넌트 (복잡한 리스트, 차트 등)"}),e("li",{children:"• 일부 상태만 화면에 영향을 주는 경우"}),e("li",{children:"• 리스트의 각 아이템을 독립적으로 최적화하고 싶을 때"}),e("li",{children:"• Props가 자주 변경되지만 특정 props만 렌더링에 영향을 줄 때"})]})]}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2",children:"⚠️ cacheUpdate 사용 불필요"}),e("ul",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed space-y-2",children:[e("li",{children:"• 단순한 컴포넌트 (렌더링 비용이 작음)"}),e("li",{children:"• 모든 상태 변경이 화면에 반영되어야 하는 경우"}),e("li",{children:"• 성능 문제가 실제로 발생하지 않는 경우"}),e("li",{children:"• 코드 복잡도를 낮추는 것이 더 중요한 경우"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/guide/computed",onClick:t=>{t.preventDefault(),v("/guide/computed")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"← Helper: Computed"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"자동으로 의존성을 추적하는 Computed에 대해 알아보세요."})]}),e("a",{href:"/guide/next-tick",onClick:t=>{t.preventDefault(),v("/guide/next-tick")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: NextTick →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"렌더링 타이밍을 제어하는 NextTickRender에 대해 알아보세요."})]})]})]}),Il=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"nextTick"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"nextTick이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["nextTick은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"현재 실행 컨텍스트가 끝난 후 다음 마이크로태스크 큐에서 실행되도록 보장하는 함수"}),"입니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"Promise.resolve()"}),"를 반환하는 간단한 API로,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"DOM 업데이트가 완료된 후"}),"에 특정 작업을 수행해야 할 때 유용합니다.",e("br",{}),e("br",{}),"renew()를 호출하면 Virtual DOM이 생성되고 실제 DOM이 업데이트됩니다. 이 과정은 동기적으로 실행되지만, nextTick을 사용하면 DOM 업데이트가 완전히 끝난 후의 시점을 보장받을 수 있습니다."]}),e(o,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

const Counter = mount((renew) => {
  const divRef = ref<HTMLDivElement>(null);
  let count = 0;

  const increase = async () => {
    count += 1;
    renew(); // DOM 업데이트 시작

    // nextTick을 사용하여 DOM 업데이트 완료 대기
    await nextTick();

    // 여기서는 DOM이 업데이트된 상태가 보장됨
    if (divRef.value) {
      console.log('Updated text:', divRef.value.textContent);
      // "Count: 1" 출력됨
    }
  };

  return () => (
    <div>
      <div ref={divRef}>Count: {count}</div>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["nextTick은 Promise를 반환하므로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"await"}),"키워드와 함께 사용하거나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:".then()"}),"으로 체이닝할 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"await 사용"}),e(o,{language:"tsx",code:`import { mount, nextTick } from 'lithent';

const App = mount((renew) => {
  let message = 'Hello';

  const update = async () => {
    message = 'Updated!';
    renew();

    await nextTick();
    console.log('DOM updated:', message);
  };

  return () => <div>{message}</div>;
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:".then() 사용"}),e(o,{language:"tsx",code:`import { mount, nextTick } from 'lithent';

const App = mount((renew) => {
  let message = 'Hello';

  const update = () => {
    message = 'Updated!';
    renew();

    nextTick().then(() => {
      console.log('DOM updated:', message);
    });
  };

  return () => <div>{message}</div>;
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"DOM 요소 측정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"업데이트된 DOM 요소의 크기나 위치를 측정해야 할 때 nextTick을 사용할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

const DynamicContent = mount((renew) => {
  const contentRef = ref<HTMLDivElement>(null);
  let items: string[] = ['Item 1'];

  const addItem = async () => {
    items.push(\`Item \${items.length + 1}\`);
    renew();

    // DOM 업데이트 완료 대기
    await nextTick();

    // 업데이트된 높이 측정
    if (contentRef.value) {
      const height = contentRef.value.offsetHeight;
      console.log('New height:', height);
    }
  };

  return () => (
    <div>
      <div ref={contentRef}>
        {items.map(item => (
          <div key={item}>{item}</div>
        ))}
      </div>
      <button onClick={addItem}>Add Item</button>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"포커스 설정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"새로 추가된 입력 필드에 자동으로 포커스를 설정할 때 유용합니다."}),e(o,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

const DynamicForm = mount((renew) => {
  const inputRef = ref<HTMLInputElement>(null);
  let showInput = false;

  const addInput = async () => {
    showInput = true;
    renew();

    // DOM에 input이 추가될 때까지 대기
    await nextTick();

    // 새로 추가된 input에 포커스
    inputRef.value?.focus();
  };

  return () => (
    <div>
      {showInput && <input ref={inputRef} type="text" placeholder="Enter text" />}
      <button onClick={addInput}>Add Input</button>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"스크롤 위치 조정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"채팅 메시지를 추가한 후 스크롤을 맨 아래로 이동할 때 사용할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

const ChatWindow = mount((renew) => {
  const containerRef = ref<HTMLDivElement>(null);
  const messages: string[] = ['Hello!'];

  const addMessage = async (text: string) => {
    messages.push(text);
    renew();

    // 새 메시지가 DOM에 렌더링될 때까지 대기
    await nextTick();

    // 스크롤을 맨 아래로 이동
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    }
  };

  return () => (
    <div>
      <div
        ref={containerRef}
        style="height: 300px; overflow-y: auto; border: 1px solid #ccc;"
      >
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <button onClick={() => addMessage('New message!')}>
        Add Message
      </button>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"애니메이션 트리거"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"DOM이 업데이트된 후 CSS 애니메이션이나 트랜지션을 트리거할 때 사용합니다."}),e(o,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

const AnimatedList = mount((renew) => {
  const newItemRef = ref<HTMLDivElement>(null);
  const items: string[] = ['Item 1', 'Item 2'];

  const addItem = async () => {
    items.push(\`Item \${items.length + 1}\`);
    renew();

    // 새 아이템이 DOM에 추가될 때까지 대기
    await nextTick();

    // 애니메이션 클래스 추가
    if (newItemRef.value) {
      newItemRef.value.classList.add('fade-in');
    }
  };

  return () => (
    <div>
      {items.map((item, i) => (
        <div
          key={item}
          ref={i === items.length - 1 ? newItemRef : null}
          class="item"
        >
          {item}
        </div>
      ))}
      <button onClick={addItem}>Add Item</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"테스트에서 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"nextTick은 테스트 코드에서도 매우 유용합니다. DOM 업데이트를 기다린 후 검증할 때 사용할 수 있습니다."}),e(o,{language:"tsx",code:`import { mount, render, nextTick } from 'lithent';
import { expect, test } from 'vitest';

test('counter updates correctly', async () => {
  const Counter = mount((renew) => {
    let count = 0;

    const increase = () => {
      count += 1;
      renew();
    };

    return () => (
      <div>
        <span id="count">{count}</span>
        <button onClick={increase}>Increase</button>
      </div>
    );
  });

  const container = document.createElement('div');
  render(<Counter />, container);

  // 초기 상태 확인
  expect(container.querySelector('#count')?.textContent).toBe('0');

  // 버튼 클릭
  container.querySelector('button')?.click();

  // DOM 업데이트 대기
  await nextTick();

  // 업데이트된 상태 확인
  expect(container.querySelector('#count')?.textContent).toBe('1');
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["nextTick은 내부적으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"Promise.resolve()"}),"를 반환합니다:"]}),e(o,{language:"tsx",code:"export const nextTick = () => Promise.resolve();"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["JavaScript의 이벤트 루프에서 Promise는 마이크로태스크 큐에 추가됩니다. 현재 실행 중인 모든 동기 코드와 DOM 업데이트가 완료된 후, 마이크로태스크 큐의 작업들이 실행됩니다.",e("br",{}),e("br",{}),"실행 순서:"]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"renew() 호출 → Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"Diff 알고리즘 실행 → 변경사항 계산"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"실제 DOM 업데이트 (동기 작업)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"현재 콜 스택의 나머지 코드 실행"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"마이크로태스크 큐 실행 (nextTick의 콜백이 여기서 실행됨)"})]})]})}),e(o,{language:"tsx",code:`const update = async () => {
  console.log('1. Before renew');

  count += 1;
  renew();
  // DOM 업데이트는 동기적으로 완료됨

  console.log('2. After renew');

  await nextTick();
  // 마이크로태스크 큐가 처리될 때까지 대기

  console.log('3. After nextTick');
  // 여기서는 모든 DOM 업데이트와 브라우저 렌더링이 완료됨
};

// 출력 순서:
// 1. Before renew
// 2. After renew
// 3. After nextTick`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"updateCallback과의 차이"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"nextTick과 updateCallback의 반환 함수는 비슷해 보이지만 사용 목적이 다릅니다:"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"nextTick"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"updateCallback 반환 함수"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 위치"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"어디서든 (이벤트 핸들러, 함수 내부 등)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"마운터에서만 등록"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"실행 시점"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"명시적으로 호출한 시점"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"매 업데이트마다 자동 실행"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"의존성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"없음"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"의존성 배열 기반"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"용도"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"일회성 DOM 업데이트 대기"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"반복적인 업데이트 후 작업"})]})]})]})}),e(o,{language:"tsx",code:`import { mount, nextTick, updateCallback } from 'lithent';

const Example = mount((renew) => {
  let count = 0;

  // updateCallback: 매 업데이트마다 자동 실행
  updateCallback(() => {
    console.log('Before update');

    return () => {
      console.log('After update (automatic)');
    };
  });

  // nextTick: 필요할 때만 명시적으로 호출
  const increase = async () => {
    count += 1;
    renew();

    await nextTick();
    console.log('After update (manual)');
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 동기적 DOM 업데이트:"})," Lithent의 renew()는 DOM을 동기적으로 업데이트합니다. nextTick이 필요한 이유는 브라우저 렌더링이 완료될 때까지 기다리기 위함이 아니라, 마이크로태스크 큐를 활용하여 현재 실행 컨텍스트 이후를 보장받기 위함입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 과도한 사용 지양:"})," 대부분의 경우 updateCallback의 반환 함수로 충분합니다. nextTick은 일회성 작업이나 이벤트 핸들러 내부에서 필요할 때만 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 브라우저 렌더링:"})," nextTick은 마이크로태스크 큐까지만 보장합니다. 브라우저의 실제 화면 렌더링(paint)을 기다려야 한다면 requestAnimationFrame을 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 에러 처리:"})," nextTick이 반환하는 Promise는 항상 resolve됩니다. try-catch로 감쌀 필요는 없지만, nextTick 이후의 코드에서 발생하는 에러는 적절히 처리해야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ nextTick 사용 권장"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 이벤트 핸들러에서 DOM 업데이트 후 작업이 필요할 때"}),e("li",{children:"• 새로 추가된 요소에 포커스를 설정하거나 측정할 때"}),e("li",{children:"• 테스트 코드에서 DOM 업데이트를 기다릴 때"}),e("li",{children:"• 일회성으로 업데이트 완료를 기다려야 할 때"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-blue-900 dark:text-blue-100 mb-2",children:"💡 updateCallback 사용 권장"}),e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2",children:[e("li",{children:"• 매 업데이트마다 반복적으로 실행해야 하는 작업"}),e("li",{children:"• 특정 의존성이 변경될 때만 실행하고 싶을 때"}),e("li",{children:"• 컴포넌트 생명주기에 맞춘 작업"}),e("li",{children:"• 외부 라이브러리와의 지속적인 동기화"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/mount-hooks",onClick:t=>{t.preventDefault(),v("/guide/mount-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Mount Hooks →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트 마운트 시점에 실행되는 mountCallback 훅에 대해 알아보세요.",e("br",{}),"초기화 작업과 클린업 처리 방법을 배워봅시다."]})]})})]}),Pl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Vite Plugin"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"@lithent/lithent-vite란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@lithent/lithent-vite"}),"는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Lithent를 위한 공식 Vite 플러그인"}),"입니다.",e("br",{}),e("br",{}),"개발 중 Hot Module Replacement(HMR)를 활성화하여 컴포넌트 상태를 잃지 않고 즉시 변경사항을 확인할 수 있습니다. 플러그인이 자동으로 HMR 경계를 주입하여 원활한 개발 경험을 제공합니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주요 기능"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ul",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Hot Module Replacement"}),": 개발 중 즉각적인 업데이트"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"자동 HMR 경계"}),": mount 컴포넌트를 자동으로 래핑"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"마커 지원"}),": 주석으로 명시적 HMR 경계 제어"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"타입 안전"}),": 완전한 TypeScript 지원"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"제로 설정"}),": 합리적인 기본값으로 즉시 작동"]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"설치"}),e(o,{language:"bash",code:`npm install @lithent/lithent-vite
# or
pnpm add @lithent/lithent-vite
# or
yarn add @lithent/lithent-vite`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"📦 Peer Dependencies:"}),e("br",{}),"• lithent: 1.x",e("br",{}),"• vite: 5.x"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 설정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"vite.config.js"})," ","또는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"vite.config.ts"}),"에 플러그인을 추가합니다:"]}),e(o,{language:"typescript",code:`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin(),
  ],
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이것으로 끝입니다! 플러그인이 자동으로 Lithent 컴포넌트에 HMR을 활성화합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"옵션 설정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"플러그인 동작을 커스터마이징할 수 있습니다:"}),e(o,{language:"typescript",code:`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin({
      // 특정 파일 패턴 포함 (기본값: [/\\.([cm]?[tj]sx?)$/])
      include: /\\.tsx?$/,

      // 커스텀 HMR 경계 마커 (기본값: '/* lithent:hmr-boundary */')
      boundaryMarker: '/* lithent:hmr-boundary */',

      // 커스텀 import 지정자
      createBoundaryImport: 'lithent/devHelper',
      tagFunctionImport: 'lithent',

      // 프로덕션에서 devtools 활성화 (기본값: false)
      devtoolsInProd: false,

      // JSX import source (기본값: 'lithent')
      jsxImportSource: 'lithent',

      // HMR 변환 이전에 lithent-template-vite 사용
      template: {
        extensions: ['.ltsx'],
      },
    }),
  ],
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"주요 옵션"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"타입"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"기본값"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"include"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"RegExp | RegExp[]"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"/\\.([cm]?[tj]sx?)$/"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"변환할 파일 패턴"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"boundaryMarker"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"string"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"'/* lithent:hmr-boundary */'"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"HMR 경계 마커 문자열"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"jsxImportSource"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"string"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"'lithent'"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동 JSX 변환 소스"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"devtoolsInProd"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"boolean"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"false"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"프로덕션 devtools 활성화"})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"동작 원리"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"자동 HMR 경계"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["플러그인은 자동으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"mount"}),"를 사용하는 컴포넌트를 래핑합니다:"]}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"변환 전:"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4",children:"변환 후:"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';
import { createHmrBoundary } from 'lithent/devHelper';

const App = createHmrBoundary(
  mount((renew, props) => {
    return () => <div>Hello World</div>;
  }),
  import.meta.hot,
  'App'
);

export default App;`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"createHmrBoundary"}),"는 컴포넌트를 감싸서 HMR 업데이트 시 상태를 적절히 처리합니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"명시적 HMR 경계"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"마커 주석을 사용하여 세밀한 제어가 가능합니다:"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"/* lithent:hmr-boundary default */"})," ","주석은 해당 파일의 default export에 명시적으로 HMR 경계를 추가합니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"상태 보존 (모듈 단위 HMR)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"네이티브 클로저 기반 상태 관리"}),"를 사용하므로, HMR이"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"모듈(파일) 단위"}),"로 동작합니다:"]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-3",children:[e("li",{children:[e("strong",{children:"🔄 수정한 모듈:"})," 코드를 수정한 파일(모듈) 전체의 클로저 상태가 리셋됩니다",e("br",{}),e("span",{class:"text-xs opacity-80",children:"→ 해당 파일의 모든 컴포넌트와 변수가 재생성되어 초기화됨"})]}),e("li",{children:[e("strong",{children:"✅ 수정하지 않은 모듈:"})," 다른 파일의 컴포넌트 상태는 모두 유지됩니다",e("br",{}),e("span",{class:"text-xs opacity-80",children:"→ 부모/자식/형제 컴포넌트가 다른 파일에 있다면 영향받지 않음"})]})]})}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("strong",{children:"⚠️ 중요:"})," HMR은 파일(모듈) 단위로 동작합니다. 한 파일에 여러 컴포넌트가 있다면 그 중 하나만 수정해도 파일 전체가 교체되므로 모든 컴포넌트의 상태가 리셋됩니다.",e("br",{}),e("br",{}),e("strong",{children:"⚠️ 외부 상태도 모듈 단위:"})," lithent/helper의 state 또는 store로 만들어진 외부 상태라도, 그 상태를 생성한 모듈이 HMR로 교체되면 해당 상태도 함께 초기화됩니다. 상태가 정의된 모듈의 클로저 컨텍스트가 재생성되기 때문입니다."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"React HMR과의 차이점"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["React는 컴포넌트 상태를 React의 상태 시스템에 저장하므로 HMR 시 보존이 가능하지만, Lithent는 클로저 자체에 상태를 저장하므로 모듈이 재로드되면 해당 모듈의 클로저가 재생성되어 상태도 리셋됩니다.",e("br",{}),e("br",{}),"이는 Lithent의"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"네이티브 JavaScript 클로저 기반 설계"}),"에서 비롯된 자연스러운 동작입니다. 개발 중 수정한 파일의 상태를 항상 초기화하여 깨끗한 상태에서 테스트할 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"실제 동작 예시"}),e(o,{language:"tsx",code:`// ParentComponent.tsx (파일 A)
import { mount } from 'lithent';

const Parent = mount((renew) => {
  let parentCount = 0; // 클로저 변수

  return () => (
    <div>
      <p>Parent Count: {parentCount}</p>
      <button onClick={() => { parentCount++; renew(); }}>
        Increment Parent
      </button>
      <Child />
    </div>
  );
});

// ChildComponent.tsx (파일 B)
import { mount } from 'lithent';

const Child = mount((renew) => {
  let childCount = 0; // 클로저 변수

  return () => (
    <div>
      <p>Child Count: {childCount}</p>
      <button onClick={() => {
        childCount++;
        renew();
      }}>
        Increment Child
      </button>
    </div>
  );
});

// HMR 시나리오:
// 1. ChildComponent.tsx (파일 B)를 수정한 경우:
//    - childCount: 리셋됨 (파일 B 전체 재로드)
//    - parentCount: 유지됨 (파일 A는 수정 안 함)

// 2. ParentComponent.tsx (파일 A)를 수정한 경우:
//    - parentCount: 리셋됨 (파일 A 전체 재로드)
//    - childCount: 유지됨 (파일 B는 수정 안 함)

// 3. 한 파일에 Parent와 Child가 함께 있는 경우:
//    - 둘 중 하나만 수정해도 파일 전체가 재로드되어
//    - parentCount, childCount 모두 리셋됨`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 개발 팁:"})," ","컴포넌트를 별도 파일로 분리하면, 한 컴포넌트를 수정할 때 다른 컴포넌트의 상태가 유지됩니다. 이는 개발 중 더 나은 HMR 경험을 제공합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"SSR 설정 (Express/Node.js)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Vite 미들웨어와 함께 서버 사이드 렌더링을 사용하는 경우:"}),e(o,{language:"javascript",code:`import express from 'express';
import { createServer as createViteServer } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

const app = express();

const vite = await createViteServer({
  plugins: [
    lithentVitePlugin(),
  ],
  server: { middlewareMode: 'ssr', hmr: true },
});

app.use(vite.middlewares);

// 서버 렌더링 라우트 추가
app.get('*', async (req, res) => {
  // SSR 로직...
});

app.listen(3000);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"문제 해결"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"HMR이 작동하지 않을 때"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("ol",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed space-y-2",children:[e("li",{children:"1. 플러그인이 다른 변환 플러그인보다 먼저 로드되는지 확인하세요"}),e("li",{children:"2. 파일이 include 패턴과 일치하는지 확인하세요"}),e("li",{children:"3. import.meta.hot이 사용 가능한지 확인하세요 (개발 모드에만 존재)"})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"TypeScript 에러"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"tsconfig.json"}),"에 Vite 클라이언트 타입을 추가하세요:"]}),e(o,{language:"json",code:`{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"관련 패키지"}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("ul",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed space-y-2",children:[e("li",{children:[e("strong",{class:"text-gray-700 dark:text-gray-300",children:"@lithent/hmr-parser"})," ","- 핵심 HMR 변환 로직"]}),e("li",{children:[e("strong",{class:"text-gray-700 dark:text-gray-300",children:"lithent"})," - Lithent 코어 라이브러리"]}),e("li",{children:[e("strong",{class:"text-gray-700 dark:text-gray-300",children:"lithent/devHelper"})," ","- 브라우저 사이드 HMR 런타임"]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/jsx-manual",onClick:t=>{t.preventDefault(),v("/guide/jsx-manual")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"JSX & Templates: Manual JSX Setup →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Vite 플러그인 없이 수동으로 JSX를 설정하는 방법을 알아보세요.",e("br",{}),"TypeScript와 Babel 설정 방법을 배워봅시다."]})]})})]}),Al=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Manual JSX Setup"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"개요"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Vite 플러그인을 사용하지 않고 직접 JSX를 설정하는 방법을 안내합니다.",e("br",{}),e("br",{}),"TypeScript, Babel, Vite(esbuild) 등 다양한 도구에서 Lithent의 JSX를 사용할 수 있도록 설정할 수 있습니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 언제 Manual Setup이 필요한가요?"}),e("br",{}),e("br",{}),"• Vite를 사용하지 않는 프로젝트",e("br",{}),"• Babel 기반 빌드 시스템 (Create React App, Next.js 등)",e("br",{}),"• TypeScript만으로 빌드하는 환경",e("br",{}),"• 커스텀 빌드 파이프라인"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"JSX 변환 방식"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"JSX는 JavaScript의 확장 문법으로, 브라우저가 직접 이해할 수 없습니다. 따라서 빌드 도구가 JSX를 일반 JavaScript로 변환해야 합니다."}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"Classic Transform (전통적 변환)"}),e(o,{language:"tsx",code:`// JSX 코드
const element = <div className="box">Hello</div>;

// 변환 후 (Classic)
import { h } from 'lithent';
const element = h('div', { className: 'box' }, 'Hello');`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Classic 방식은"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"h"})," ","함수를 명시적으로 호출합니다. React의 React.createElement와 동일한 패턴입니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Automatic Transform (자동 변환)"}),e(o,{language:"tsx",code:`// JSX 코드
const element = <div className="box">Hello</div>;

// 변환 후 (Automatic)
import { jsx as _jsx } from 'lithent/jsx-runtime';
const element = _jsx('div', { className: 'box', children: 'Hello' });`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Automatic 방식은 JSX runtime을 자동으로 import하며, 파일 상단에"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"import { h }"}),"를 작성할 필요가 없습니다."]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장 사항:"})," ","TypeScript 4.1.1 이상을 사용한다면"," ",e("strong",{class:"text-gray-700 dark:text-gray-300",children:"Automatic Transform"}),"을 권장합니다. 코드가 더 깔끔하고 import 문을 자동으로 처리합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"TypeScript 설정"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"방법 1: Automatic Transform (권장)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"TypeScript 4.1.1 이상에서 사용 가능한 자동 JSX 변환 방식입니다."}),e(o,{language:"json",code:`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'jsx: "react-jsx"'})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["새로운 JSX 변환 방식 활성화. JSX를 자동으로 ",e("code",{children:"_jsx()"})," ","함수 호출로 변환"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxImportSource"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX runtime을 가져올 패키지 지정. ",e("code",{children:"lithent/jsx-runtime"}),"에서 자동으로 import"]})]})]})]})}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"장점"}),e("ul",{class:"space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:["매 파일마다"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"import { h, Fragment } from 'lithent'"})," ","작성 불필요"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:"더 작은 번들 크기 (사용되는 함수만 import)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:"최신 React 생태계와 호환"})]})]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"방법 2: Classic Transform"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"전통적인 JSX 변환 방식입니다. 모든 TypeScript 버전에서 사용 가능합니다."}),e(o,{language:"json",code:`{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'jsx: "react"'})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Classic JSX 변환 활성화. JSX를 factory 함수 호출로 변환"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFactory"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX 요소를 변환할 함수 이름. Lithent는 ",e("code",{children:"h"})," 함수 사용"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFragmentFactory"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["Fragment 요소를 변환할 함수 이름. Lithent는 ",e("code",{children:"Fragment"})," ","사용"]})]})]})]})}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"사용 예시"}),e(o,{language:"tsx",code:`import { h, Fragment, mount } from 'lithent';

const App = mount((renew) => {
  return () => (
    <Fragment>
      <div>Hello</div>
      <div>World</div>
    </Fragment>
  );
});`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("strong",{children:"⚠️ 주의:"})," Classic Transform 사용 시 매 파일마다"," ",e("code",{class:"px-2 py-1 bg-yellow-700 dark:bg-yellow-600 rounded text-sm",children:"import { h, Fragment }"}),"를 작성해야 합니다. 작성하지 않으면"," ",e("code",{class:"px-2 py-1 bg-yellow-700 dark:bg-yellow-600 rounded text-sm",children:"h is not defined"})," ","에러가 발생합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Babel 설정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Babel을 사용하는 프로젝트에서 Lithent JSX를 설정하는 방법입니다."}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"Classic Transform"}),e(o,{language:"json",code:`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "h",
        "pragmaFrag": "Fragment"
      }
    ]
  ]
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"pragma"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX 요소를 생성할 함수 이름. 기본값은"," ",e("code",{children:"React.createElement"}),", Lithent는 ",e("code",{children:"h"})]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"pragmaFrag"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["Fragment 컴포넌트 이름. 기본값은 ",e("code",{children:"React.Fragment"}),", Lithent는 ",e("code",{children:"Fragment"})]})]})]})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Automatic Transform"}),e(o,{language:"json",code:`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic",
        "importSource": "lithent"
      }
    ]
  ]
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'runtime: "automatic"'})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"새로운 JSX 변환 활성화. JSX runtime을 자동으로 import"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"importSource"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX runtime 패키지 지정. ",e("code",{children:"lithent/jsx-runtime"}),"에서 import"]})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Vite 설정 (esbuild)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Vite 플러그인 없이 esbuild의 JSX 설정만 사용하는 방법입니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"주의:"})," ","이 방식은 HMR을 지원하지 않습니다. HMR이 필요하다면"," ",e("a",{href:"/guide/vite-plugin",onClick:t=>{t.preventDefault(),v("/guide/vite-plugin")},class:"text-[#42b883] hover:underline",children:"@lithent/lithent-vite"})," ","플러그인을 사용하세요."]}),e(o,{language:"typescript",code:`import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
});`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFactory"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["esbuild의 JSX factory 함수. ",e("code",{children:"<div />"}),"를"," ",e("code",{children:"h('div')"}),"로 변환"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFragment"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["esbuild의 Fragment 컴포넌트. ",e("code",{children:"<></>"}),"를"," ",e("code",{children:"Fragment"}),"로 변환"]})]})]})]})}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","esbuild는 현재 Automatic Transform을 지원하지 않습니다. Classic Transform만 사용 가능합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"TypeScript + Babel 조합"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["TypeScript로 타입 체크만 하고, Babel로 실제 변환을 수행하는 설정입니다.",e("br",{}),"Next.js, Create React App 등에서 주로 사용하는 패턴입니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"tsconfig.json"}),e(o,{language:"json",code:`{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'jsx: "preserve"'})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JSX 구문을 그대로 유지하고 변환하지 않음. Babel이 나중에 변환"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFactory"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["타입 체크용. TypeScript가 ",e("code",{children:"h"}),"가 유효한 factory임을 인식"]})]})]})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:".babelrc"}),e(o,{language:"json",code:`{
  "presets": [
    "@babel/env",
    ["@babel/typescript", { "jsxPragma": "h" }]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "h",
        "pragmaFrag": "Fragment"
      }
    ]
  ]
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설정"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@babel/typescript"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["TypeScript 파일 처리. ",e("code",{children:'jsxPragma: "h"'}),"로 factory 지정"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@babel/transform-react-jsx"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX를 JavaScript로 변환. ",e("code",{children:"pragma"}),"와"," ",e("code",{children:"pragmaFrag"})," 설정"]})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"문제 해결"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:'"h is not defined" 에러'}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("strong",{children:"원인:"})," Classic Transform 사용 시"," ",e("code",{class:"px-2 py-1 bg-red-700 dark:bg-red-600 rounded text-sm",children:"h"})," ","함수를 import하지 않았습니다."]})}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"해결 방법 1: h 함수 import"}),e(o,{language:"tsx",code:`import { h, Fragment } from 'lithent';

const App = () => <div>Hello</div>;`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"해결 방법 2: Automatic Transform 사용"}),e(o,{language:"json",code:`// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}

// 이제 import 없이 사용 가능
const App = () => <div>Hello</div>;`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"TypeScript 타입 에러"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("strong",{children:"증상:"}),` JSX 요소에 빨간 밑줄이 생기고 "JSX element implicitly has type 'any'" 에러가 발생합니다.`]})}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"해결 방법: 타입 정의 추가"}),e(o,{language:"typescript",code:`// src/jsx.d.ts 파일 생성
import 'lithent';

declare module 'lithent' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"또는 tsconfig.json에 lithent 타입을 포함:"}),e(o,{language:"json",code:`{
  "compilerOptions": {
    "types": ["lithent"]
  }
}`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"권장 설정 요약"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-4",children:"현대적인 TypeScript 프로젝트"}),e(o,{language:"json",code:`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}`})]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-4",children:"Vite 프로젝트 (HMR 필요)"}),e(o,{language:"typescript",code:`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [lithentVitePlugin()],
});`})]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-4",children:"Babel 프로젝트"}),e(o,{language:"json",code:`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic",
        "importSource": "lithent"
      }
    ]
  ]
}`})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/ftags",onClick:t=>{t.preventDefault(),v("/guide/ftags")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"JSX & Templates: FTags →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["JSX 없이 함수형 API로 컴포넌트를 작성하는 FTags를 알아보세요.",e("br",{}),"빌드 도구 설정 없이 즉시 사용 가능합니다."]})]})})]}),Ll=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"FTags"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"개요"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/ftags"}),"는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"JSX 없이 순수 JavaScript/TypeScript 함수로 UI를 작성"}),"할 수 있는 함수형 API입니다.",e("br",{}),e("br",{}),"빌드 도구 설정 없이 즉시 사용 가능하며, TypeScript에서 완전한 타입 안전성을 제공합니다."]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"주요 장점"}),e("ul",{class:"space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"제로 설정:"})," ","Babel, TypeScript, Vite 설정 불필요"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"타입 안전:"})," ","완전한 TypeScript 타입 추론"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"유연한 문법:"})," ","Props 생략 가능한 직관적 API"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"CDN 친화적:"})," ","빌드 도구 없이 브라우저에서 직접 사용 가능"]})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"설치"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"NPM"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent를 설치하면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/ftags"}),"를 바로 사용할 수 있습니다. 별도의 설치가 필요하지 않습니다."]}),e(o,{language:"bash",code:`npm install lithent
# or
pnpm add lithent`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"CDN (UMD)"}),e(o,{language:"html",code:`<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js
"><\/script>

<script>
  const { render } = lithent;
  const { fTags, fMount, fFragment } = lithentFTags;

  // 사용 가능
<\/script>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"fTags - HTML 요소 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"fTags"}),"는 Proxy 기반으로 모든 HTML 태그를 동적으로 생성합니다. 구조 분해 할당으로 필요한 태그만 가져올 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e(o,{language:"typescript",code:`import { render } from 'lithent';
import { fTags } from 'lithent/ftags';

// 필요한 태그만 구조 분해
const { div, p, span, button, input } = fTags;

// 텍스트만 포함
const element1 = div('Hello World');

// Props와 텍스트
const element2 = div({ className: 'container' }, 'Content');

// 중첩 요소
const element3 = div(
  { className: 'card' },
  p('Title'),
  p('Description')
);

render(element3, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Props 생략 가능"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["FTags의 핵심 기능 중 하나는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Props 자동 감지"}),"입니다. 첫 번째 인자가 일반 객체(props)인지 children인지 자동으로 판단합니다."]}),e(o,{language:"typescript",code:`const { div, span } = fTags;

// Props 없이 children만
div('텍스트만');
div(span('중첩 요소'));

// Props와 children
div({ id: 'app' }, '텍스트');
div({ className: 'box' }, span('중첩'));

// Props만 (children 없음)
input({ type: 'text', placeholder: '입력...' });

// 모두 없음
div();`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 동작 원리:"}),e("br",{}),e("br",{}),"FTags는 내부적으로"," ",e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"isPropType()"})," ","함수를 사용하여 첫 번째 인자를 검사합니다:",e("br",{}),e("br",{}),"• 일반 객체(Plain Object)이고 Virtual DOM이 아니면 → Props로 처리",e("br",{}),"• 문자열, 숫자, Virtual DOM 등이면 → Children으로 처리"]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Props 속성"}),e(o,{language:"typescript",code:`const { div, button, input, a } = fTags;

// 클래스와 스타일
div(
  {
    className: 'container',
    style: { padding: '20px', backgroundColor: '#f0f0f0' }
  },
  'Styled Content'
);

// 이벤트 핸들러
button(
  {
    onClick: () => console.log('Clicked!'),
    disabled: false
  },
  'Click Me'
);

// HTML 속성
input({
  type: 'email',
  placeholder: 'your@email.com',
  required: true,
  value: ''
});

// 링크와 기타 속성
a({ href: 'https://example.com', target: '_blank' }, 'Visit Site');`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"복잡한 중첩 구조"}),e(o,{language:"typescript",code:`const { section, div, h1, p, ul, li, strong } = fTags;

const page = section(
  { className: 'page' },

  h1('Welcome to FTags'),

  p(
    'This is a ',
    strong({ style: { color: 'red' } }, 'powerful'),
    ' functional API for building UIs.'
  ),

  ul(
    li('Zero configuration'),
    li('Type safe'),
    li('Props optional')
  ),

  div(
    { className: 'footer' },
    p('© 2024 Lithent')
  )
);

render(page, document.getElementById('root'));`}),e("div",{class:"border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-emerald-800 dark:text-emerald-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 마운터 없이도 OK:"})," fTags로 만든 결과는 바로 render에 넘겨 사용할 수 있습니다. 컴포넌트 추상화가 필요할 때만 fMount/flMount를 쓰고, 단순 정적/동적 트리를 만들 때는 위 예시처럼 바로 render를 호출하면 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"fFragment - Fragment 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"fFragment"}),"는 여러 요소를 감싸는 wrapper 없이 그룹화합니다. JSX의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<></>"}),"와 동일합니다."]}),e(o,{language:"typescript",code:`import { fTags, fFragment } from 'lithent/ㅏftags';

const { div, p, span } = fTags;

// Fragment로 여러 요소 그룹화
const content = fFragment(
  p('First paragraph'),
  p('Second paragraph'),
  span('Inline text')
);

// 컴포넌트에서 Fragment 반환
const MultiElement = fMount(() => {
  return () => fFragment(
    div('Element 1'),
    div('Element 2'),
    div('Element 3')
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 사용 사례:"}),e("br",{}),e("br",{}),"• 컴포넌트에서 여러 최상위 요소 반환",e("br",{}),"• 테이블의 여러 행 그룹화 (tr 여러 개)",e("br",{}),"• 불필요한 div wrapper 제거"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"fMount - 컴포넌트 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"fMount"}),"는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"mount"})," ","스타일의 컴포넌트 함수를 JSX 없이 바로 사용할 수 있게 합니다."," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mount나 lmount로 한 번 더 감싸지 말고"}),", renew 인자를 받는 원본 컴포넌트를 그대로 전달하세요."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 컴포넌트"}),e(o,{language:"typescript",code:`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, button } = fTags;

// fMount로 컴포넌트 생성
const Counter = fMount((renew) => {
  let count = 0;

  const increment = () => {
    count++;
    renew();
  };

  return () => div(
    { className: 'counter' },
    div(\`Count: \${count}\`),
    button({ onClick: increment }, 'Increment')
  );
});

// 사용
render(Counter(), document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Props가 있는 컴포넌트"}),e(o,{language:"typescript",code:`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, p } = fTags;

// Props 타입 정의
interface GreetingProps {
  name: string;
  age?: number;
}

// fMount로 바로 생성
const Greeting = fMount<GreetingProps>((_renew, props) => {
  return () =>
    div(
      { className: 'greeting' },
      p(\`Hello, \${props.name}!\`),
      props.age && p(\`Age: \${props.age}\`)
    );
});

// Props와 함께 사용
render(
  Greeting({ name: 'John', age: 30 }),
  document.getElementById('root')
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Children이 있는 컴포넌트"}),e(o,{language:"typescript",code:`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, p } = fTags;

// Children을 받는 컴포넌트
const Card = fMount((_renew, _props, children) => {
  return () =>
    div(
      { className: 'card' },
      div({ className: 'card-content' }, ...children)
    );
});

// Children과 함께 사용
render(
  Card(
    p('This is card content'),
    p('Multiple children supported')
  ),
  document.getElementById('root')
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Props와 Children 함께 사용"}),e(o,{language:"typescript",code:`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, h2, p } = fTags;

interface CardProps {
  title: string;
  bordered?: boolean;
}

const Card = fMount<CardProps>((_renew, props, children) => {
  return () =>
    div(
      {
        className: 'card',
        style: props.bordered ? { border: '1px solid #ccc' } : {}
      },
      h2(props.title),
      div({ className: 'card-body' }, ...children)
    );
});

// Props와 Children 모두 전달
render(
  Card(
    { title: 'My Card', bordered: true },
    p('Card content here'),
    p('More content')
  ),
  document.getElementById('root')
);`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 Props 생략 가능:"}),e("br",{}),e("br",{}),"FMount도 fTags처럼 Props를 생략할 수 있습니다:",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"Card() // Props, Children 모두 없음"}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"Card(p('Text')) // Props 없이 Children만"}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"Card({ title: 'Hi' }) // Props만"}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"Card({ title: 'Hi' }, p('Text')) // Props와 Children"})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"flMount - Light API 컴포넌트"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"flMount"}),"는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lmount"}),"(Light API) 스타일 컴포넌트를 JSX 없이 함수 형태로 사용할 수 있게 합니다. lmount로 한 번 더 감쌀 필요 없이, renew가 없는 Light API 컴포넌트를 바로 전달하세요. 상태 갱신이 필요하면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useRenew"}),"나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lstate"}),"를 사용해 다시 그리면 됩니다."]}),e(o,{language:"typescript",code:`import { render, useRenew } from 'lithent';
import { flMount, fTags } from 'lithent/ftags';

const { div, button } = fTags;

// renew 파라미터 없이 작성하는 Light API 컴포넌트
const Counter = flMount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count++;
    renew();
  };

  return () =>
    div(
      div(\`Count: \${count}\`),
      button({ onClick: increment }, 'Increment')
    );
});

render(Counter(), document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"lstate와 함께 사용 (권장)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"flMount"}),"는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lstate"}),"(lithent/helper)와 함께 사용하면 더욱 강력합니다. renew 없이 자동으로 상태가 추적되고 업데이트됩니다."]}),e(o,{language:"typescript",code:`import { render } from 'lithent';
import { lstate } from 'lithent/helper';
import { flMount, fTags } from 'lithent/ftags';

const { div, button } = fTags;

// 간단한 Counter
const Counter = flMount(() => {
  const count = lstate(0);

  return () =>
    div(
      { className: 'counter' },
      div(\`Count: \${count.value}\`),
      button(
        { onClick: () => count.value++ },
        'Increment'
      ),
      button(
        { onClick: () => count.value-- },
        'Decrement'
      )
    );
});

render(Counter(), document.getElementById('root'));`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"복잡한 예제: Todo 앱 (lstate 사용)"}),e(o,{language:"typescript",code:`import { render } from 'lithent';
import { lstate } from 'lithent/helper';
import { flMount, fTags } from 'lithent/ftags';

const { div, input, button, ul, li } = fTags;

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp = flMount(() => {
  const todos = lstate<TodoItem[]>([]);
  const inputValue = lstate('');
  const nextId = lstate(1);

  const addTodo = () => {
    if (inputValue.value.trim()) {
      todos.value = [
        ...todos.value,
        { id: nextId.value++, text: inputValue.value, completed: false }
      ];
      inputValue.value = '';
    }
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter(todo => todo.id !== id);
  };

  return () => div(
    { className: 'todo-app' },

    div(
      { className: 'input-group' },
      input({
        type: 'text',
        value: inputValue.value,
        onInput: (e: Event) => {
          inputValue.value = (e.target as HTMLInputElement).value;
        },
        placeholder: 'Enter todo...'
      }),
      button({ onClick: addTodo }, 'Add')
    ),

    ul(
      { className: 'todo-list' },
      ...todos.value.map(todo =>
        li(
          {
            key: todo.id,
            style: {
              textDecoration: todo.completed ? 'line-through' : 'none',
              opacity: todo.completed ? 0.6 : 1
            }
          },
          div(
            { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
            input({
              type: 'checkbox',
              checked: todo.completed,
              onChange: () => toggleTodo(todo.id)
            }),
            div(todo.text),
            button(
              { onClick: () => removeTodo(todo.id) },
              'Delete'
            )
          )
        )
      )
    ),

    div(\`Total: \${todos.value.length} | Completed: \${todos.value.filter(t => t.completed).length}\`)
  );
});

render(TodoApp(), document.getElementById('root'));`}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h4",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"💡 flMount + lstate의 장점"}),e("ul",{class:"space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 불필요:"})," ","상태가 자동으로 추적되고 업데이트됨"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"간결한 코드:"})," ","lstate가 상태 변경을 감지하여 자동 렌더링"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"함수형 스타일:"})," ","JSX 없이도 깔끔한 함수형 컴포넌트 작성"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"빌드 도구 불필요:"})," ","CDN으로도 즉시 사용 가능"]})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"Todo 앱"}),e(o,{language:"typescript",code:`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, input, button, ul, li } = fTags;

interface TodoItem {
  id: number;
  text: string;
}

const TodoApp = fMount((renew) => {
  let todos: TodoItem[] = [];
  let nextId = 1;
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos = [...todos, { id: nextId++, text: inputValue }];
      inputValue = '';
      renew();
    }
  };

  const removeTodo = (id: number) => {
    todos = todos.filter(todo => todo.id !== id);
    renew();
  };

  return () => div(
    { className: 'todo-app' },

    div(
      { className: 'input-group' },
      input({
        type: 'text',
        value: inputValue,
        onInput: (e: Event) => {
          inputValue = (e.target as HTMLInputElement).value;
          renew();
        },
        placeholder: 'Enter todo...'
      }),
      button({ onClick: addTodo }, 'Add')
    ),

    ul(
      { className: 'todo-list' },
      ...todos.map(todo =>
        li(
          { key: todo.id },
          todo.text,
          button(
            {
              onClick: () => removeTodo(todo.id),
              style: { marginLeft: '10px' }
            },
            'Delete'
          )
        )
      )
    )
  );
});

render(TodoApp(), document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"재사용 가능한 컴포넌트 조합"}),e(o,{language:"typescript",code:`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, button, p } = fTags;

// Button 컴포넌트
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

const CustomButton = fMount<ButtonProps>((_renew, props, children) => {
  const styles = {
    primary: { backgroundColor: '#007bff', color: 'white' },
    secondary: { backgroundColor: '#6c757d', color: 'white' }
  };

  return () =>
    button(
      {
        style: {
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          ...styles[props.variant || 'primary']
        },
        onClick: props.onClick
      },
      ...children
    );
});

// Card 컴포넌트
interface CardProps {
  title: string;
}

const Card = fMount<CardProps>((_renew, props, children) => {
  return () =>
    div(
      {
        style: {
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          margin: '10px 0'
        }
      },
      p({ style: { fontSize: '20px', fontWeight: 'bold' } }, props.title),
      div(...children)
    );
});

// App에서 조합
const App = fMount(() => {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return () =>
    div(
      Card(
        { title: 'Welcome' },
        p('This is a reusable card component.'),
        CustomButton(
          { variant: 'primary', onClick: handleClick },
          'Click Me'
        ),
        CustomButton(
          { variant: 'secondary', onClick: handleClick },
          'Secondary'
        )
      )
    );
});

render(App(), document.getElementById('root'));`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"JSX vs FTags 비교"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",children:[e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"JSX 방식"}),e(o,{language:"tsx",code:`import { mount } from 'lithent';

const App = mount((renew) => {
  let count = 0;

  return () => (
    <div className="app">
      <h1>Count: {count}</h1>
      <button
        onClick={() => {
          count++;
          renew();
        }}
      >
        Increment
      </button>
    </div>
  );
});`})]}),e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"FTags 방식"}),e(o,{language:"typescript",code:`import { mount } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, h1, button } = fTags;

const App = mount(renew => {
  let count = 0;

  return () =>
    div(
      { className: 'app' },
      h1(\`Count: \${count}\`),
      button(
        {
          onClick: () => {
            count++;
            renew();
          },
        },
        'Increment'
      )
    );
});
          `})]})]}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특징"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"JSX"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"FTags"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"빌드 설정"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Babel/TypeScript 설정 필요"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"설정 불필요"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"CDN 사용"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"불가능 (빌드 필요)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"즉시 사용 가능"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"가독성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"HTML과 유사 (직관적)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"함수 호출 형태"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"타입 안전성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"완전 지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"완전 지원"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"학습 곡선"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"HTML 지식 활용"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JavaScript 함수 호출"})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 FTags를 사용할까?"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-green-900 dark:text-green-100 mb-2",children:"✓ FTags가 적합한 경우"}),e("ul",{class:"space-y-2 text-sm md:text-base text-green-800 dark:text-green-200",children:[e("li",{children:"• 빌드 도구 설정을 피하고 싶을 때"}),e("li",{children:"• CDN으로 즉시 프로토타입을 만들 때"}),e("li",{children:"• 순수 JavaScript/TypeScript로 작업하고 싶을 때"}),e("li",{children:"• 작은 위젯이나 라이브러리를 만들 때"}),e("li",{children:"• JSX 설정이 어려운 환경 (일부 레거시 프로젝트)"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"ℹ️ JSX가 더 나은 경우"}),e("ul",{class:"space-y-2 text-sm md:text-base text-blue-800 dark:text-blue-200",children:[e("li",{children:"• 대규모 애플리케이션 개발"}),e("li",{children:"• 팀이 JSX에 익숙할 때"}),e("li",{children:"• 복잡한 UI 구조 (JSX가 더 읽기 쉬움)"}),e("li",{children:"• 이미 빌드 환경이 구축된 프로젝트"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"TypeScript 타입 정의"}),e(o,{language:"typescript",code:`import type { Props, WDom, MiddleStateWDom } from 'lithent';

// fTags 타입
type FFunction = (...param: (Props | MiddleStateWDom)[]) => WDom;
type FTags = {
  [tagName: string]: FFunction;
};

// fFragment 타입
const fFragment: (...children: MiddleStateWDom[]) => WDom;

// fMount 타입
const fMount: <T>(
  component: Component<T>
) => (
  ...param: unknown extends T
    ? (Props | MiddleStateWDom)[]
    : [T, ...MiddleStateWDom[]]
) => WDom;

// flMount 타입
const flMount: <T>(
  component: LComponent<T>
) => (
  ...param: unknown extends T
    ? (Props | MiddleStateWDom)[]
    : [T, ...MiddleStateWDom[]]
) => WDom;`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/htm-tags",onClick:t=>{t.preventDefault(),v("/guide/htm-tags")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"JSX & Templates: HTM Tags →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Template literal 기반의 HTM(Hyperscript Tagged Markup)을 알아보세요.",e("br",{}),"HTML과 유사한 문법으로 빌드 도구 없이 사용 가능합니다."]})]})})]}),Nl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"HTM Tags"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"HTM이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("a",{href:"https://github.com/developit/htm",target:"_blank",rel:"noopener noreferrer",class:"text-[#42b883] hover:underline font-medium",children:"HTM (Hyperscript Tagged Markup)"}),"은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"JSX-like 문법을 순수 JavaScript로 사용"}),"할 수 있게 해주는 라이브러리입니다.",e("br",{}),e("br",{}),"트랜스파일러 없이 브라우저에서 직접 JSX와 유사한 문법을 사용할 수 있으며, 매우 작은 크기(약 600 bytes)를 자랑합니다.",e("br",{}),e("br",{}),"Lithent는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"})," ","패키지를 통해 HTM을 Lithent의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"h"})," ","함수에 바인딩하여 제공합니다."]}),e("div",{class:"border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:[e("span",{class:"font-medium",children:"✨ 주요 특징:"}),e("br",{}),e("br",{}),"• 트랜스파일러 불필요 - 순수 JavaScript",e("br",{}),"• 매우 작은 크기 - 약 600 bytes",e("br",{}),"• JSX와 유사한 문법",e("br",{}),"• ES6 Tagged Templates 사용",e("br",{}),"• 모든 모던 브라우저 지원"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"설치 및 기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"설치"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent를 설치하면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"}),"를 바로 사용할 수 있습니다. 별도의 설치가 필요하지 않습니다."]}),e(o,{language:"bash",code:"npm install lithent"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"CDN 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"빌드 툴 없이 브라우저에서 직접 사용하고 싶다면 CDN을 통해 import할 수 있습니다. ES modules를 사용하여 HTM과 Lithent를 함께 사용할 수 있습니다."}),e(o,{language:"html",code:`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lithent + HTM CDN Example</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
    }
    .counter {
      text-align: center;
    }
    button {
      font-size: 18px;
      padding: 10px 20px;
      margin: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- CDN에서 Lithent와 lithentTag 로드 -->
  <script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/tag/dist/lithentTag.umd.js"><\/script>

  <script>
    // 전역 변수에서 필요한 것들 가져오기
    const { h, Fragment, mount, render } = lithent;
    const { lTag } = lithentTag;

    // 카운터 컴포넌트
    const Counter = mount(renew => {
      let count = 0;

      const increment = () => {
        count += 1;
        renew();
      };

      const decrement = () => {
        count -= 1;
        renew();
      };

      return () => lTag\`
        <div class="counter">
          <h1>Counter: \${count}</h1>
          <button onClick=\${increment}>+1</button>
          <button onClick=\${decrement}>-1</button>
        </div>
      \`;
    });

    // 렌더링
    render(lTag\`<\${Counter} />\`, document.getElementById('root'));
  <\/script>
</body>
</html>`}),e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"✨ CDN 장점:"})," 위 HTML 파일을 그대로 저장하고 브라우저에서 열면 바로 동작합니다. 빌드 설정이나 번들러가 전혀 필요하지 않습니다!",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"📦 추가 패키지:"})," Helper 기능도 사용하려면"," ",e("code",{class:"px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm",children:"lithent@2/helper/dist/lithentHelper.umd.js"}),"를 추가로 로드하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"🔖 버전 지정:"})," 특정 버전을 사용하려면"," ",e("code",{class:"px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm",children:"lithent@1.20.2"})," ","처럼 버전을 명시할 수 있습니다."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"기본 사용 (npm)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"}),"에서"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lTag"}),"를 import하면 바로 사용할 수 있습니다."]}),e(o,{language:"javascript",code:`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

const App = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  return () => lTag\`
    <div>
      <h1>Counter: \${count}</h1>
      <button onClick=\${increment}>Increment</button>
    </div>
  \`;
});

render(lTag\`<\${App} />\`, document.getElementById('root'));`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 Tagged Templates:"})," HTM은 ES6 Tagged Templates를 사용합니다."," ",e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"lTag`...`"})," ","형태로 사용하며, 백틱(`) 안에 HTML-like 마크업을 작성합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"JSX와의 차이점"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"HTM은 JSX와 매우 유사하지만 몇 가지 차이점이 있습니다:"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"JSX"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"HTM"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"트랜스파일러"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"필요 (Babel 등)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"불필요 (순수 JS)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"<Foo />"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"<${Foo} />"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Spread Props"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"<div {...props}>"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"<div ...${props}>"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"종료 태그"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"</Foo>"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["<//>"," (간단 종료)"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"HTML 따옴표"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"필수"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"선택 (class=foo)"})]})]})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"예제 비교"}),e(o,{language:"javascript",code:`// JSX
<MyComponent name="John" age={25} />

// HTM
lTag\`<\${MyComponent} name="John" age=\${25} />\`

// JSX - Spread props
<div {...props}>content</div>

// HTM - Spread props
lTag\`<div ...\${props}>content</div>\`

// JSX - 종료 태그
<MyComponent>
  <h1>Title</h1>
</MyComponent>

// HTM - 간단 종료
lTag\`<\${MyComponent}>
  <h1>Title</h1>
<//>\``}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"카운터 애플리케이션"}),e(o,{language:"javascript",code:`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

const Counter = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  const decrement = () => {
    count -= 1;
    renew();
  };

  return () => lTag\`
    <div class="counter">
      <h1>Count: \${count}</h1>
      <button onClick=\${increment}>+</button>
      <button onClick=\${decrement}>-</button>
    </div>
  \`;
});

render(lTag\`<\${Counter} />\`, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Todo 리스트"}),e(o,{language:"javascript",code:`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

const TodoApp = mount(renew => {
  let todos = ['Learn Lithent', 'Build App'];
  let input = '';

  const addTodo = () => {
    if (input.trim()) {
      todos = [...todos, input];
      input = '';
      renew();
    }
  };

  const removeTodo = (index) => {
    todos = todos.filter((_, i) => i !== index);
    renew();
  };

  return () => lTag\`
    <div class="todo-app">
      <h1>Todo List</h1>

      <div class="input-section">
        <input
          type="text"
          value=\${input}
          onInput=\${(e) => { input = e.target.value; }}
          placeholder="Add new todo..."
        />
        <button onClick=\${addTodo}>Add</button>
      </div>

      <ul class="todo-list">
        \${todos.map((todo, index) => lTag\`
          <li key=\${index}>
            <span>\${todo}</span>
            <button onClick=\${() => removeTodo(index)}>Delete</button>
          </li>
        \`)}
      </ul>
    </div>
  \`;
});

render(lTag\`<\${TodoApp} />\`, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"컴포넌트 구성"}),e(o,{language:"javascript",code:`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

// Header 컴포넌트
const Header = mount((renew, props) => {
  return () => lTag\`
    <header>
      <h1>\${props.title}</h1>
      <p>\${props.subtitle}</p>
    </header>
  \`;
});

// Footer 컴포넌트
const Footer = mount((renew, props) => {
  return () => lTag\`
    <footer ...\${props}>
      <p>© 2024 My App</p>
    </footer>
  \`;
});

// Main 컴포넌트
const Main = mount(renew => {
  return () => lTag\`
    <main>
      <p>Main content here</p>
    </main>
  \`;
});

// App 컴포넌트
const App = mount(renew => {
  return () => lTag\`
    <div class="app">
      <\${Header}
        title="My Application"
        subtitle="Built with Lithent & HTM"
      />
      <\${Main} />
      <\${Footer} class="footer" />
    </div>
  \`;
});

render(lTag\`<\${App} />\`, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Fragment 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["HTM은 자동으로 여러 루트 요소를 Fragment로 처리합니다. JSX처럼"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<></>"}),"를 명시할 필요가 없습니다."]}),e(o,{language:"javascript",code:`import { mount, render, Fragment } from 'lithent';
import { lTag } from 'lithent/tag';

const MultipleElements = mount(renew => {
  return () => lTag\`
    <h1>First Element</h1>
    <p>Second Element</p>
    <div>Third Element</div>
  \`;
});

// Fragment를 명시적으로 사용할 수도 있습니다
const ExplicitFragment = mount(renew => {
  return () => lTag\`
    <\${Fragment}>
      <h1>First Element</h1>
      <p>Second Element</p>
    <//>
  \`;
});

// 조건부 렌더링에서 Fragment 유용
const ConditionalContent = mount(renew => {
  let showDetails = true;

  const toggleDetails = () => {
    showDetails = !showDetails;
    renew();
  };

  return () => lTag\`
    <div>
      <h1>Title</h1>
      \${showDetails && lTag\`
        <\${Fragment}>
          <p>Detail 1</p>
          <p>Detail 2</p>
          <p>Detail 3</p>
        <//>
      \`}
      <button onClick=\${toggleDetails}>
        \${showDetails ? 'Hide' : 'Show'} Details
      </button>
    </div>
  \`;
});

render(lTag\`<\${ConditionalContent} />\`, document.getElementById('root'));`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Fragment:"})," ","HTM은 자동으로 여러 루트 요소를 배열로 반환하므로, 대부분의 경우 Fragment를 명시하지 않아도 됩니다. 하지만 조건부 렌더링이나 의미를 명확히 하고 싶을 때는 Fragment를 명시적으로 사용할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"직접 바인딩하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"}),"를 사용하지 않고 직접 HTM을 바인딩할 수도 있습니다."]}),e(o,{language:"javascript",code:`import { h, mount, render } from 'lithent';
import htm from 'htm';

// Lithent의 h 함수에 직접 바인딩
const html = htm.bind(h);

const App = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  return () => html\`
    <div>
      <h1>Count: \${count}</h1>
      <button onClick=\${increment}>+</button>
    </div>
  \`;
});

render(html\`<\${App} />\`, document.getElementById('root'));`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"}),"의 lTag는 내부적으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"htm.bind(h)"}),"를 수행한 것입니다. 직접 바인딩하는 것과 동일하게 동작합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"HTM vs JSX 선택하기"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ HTM을 사용하면 좋은 경우"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 빌드 툴 없이 브라우저에서 직접 개발하고 싶을 때"}),e("li",{children:"• 프로토타입이나 간단한 프로젝트"}),e("li",{children:"• CDN에서 직접 import하여 사용하고 싶을 때"}),e("li",{children:"• 빌드 설정이 복잡한 환경을 피하고 싶을 때"}),e("li",{children:"• 번들 크기를 최소화하고 싶을 때"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-blue-900 dark:text-blue-100 mb-2",children:"✅ JSX를 사용하면 좋은 경우"}),e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2",children:[e("li",{children:"• 대규모 프로젝트"}),e("li",{children:"• TypeScript를 사용하고 완전한 타입 체킹을 원할 때"}),e("li",{children:"• IDE의 자동완성과 문법 검사를 최대한 활용하고 싶을 때"}),e("li",{children:"• 빌드 시간에 최적화를 원할 때"}),e("li",{children:"• 팀에서 JSX에 익숙한 경우"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 컴포넌트 참조:"})," HTM에서 컴포넌트를 사용할 때는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"<${Component} />"})," ","형태로 달러 기호와 중괄호를 사용해야 합니다. JSX처럼"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"<Component />"}),"를 사용하면 동작하지 않습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 백틱 사용:"})," HTM은 ES6 Tagged Templates를 사용하므로 반드시 백틱(`)을 사용해야 합니다. 일반 따옴표나 큰따옴표는 사용할 수 없습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 런타임 파싱:"})," HTM은 런타임에 템플릿을 파싱합니다. JSX는 빌드 타임에 컴파일되므로 런타임 성능은 JSX가 더 우수합니다. 하지만 HTM도 충분히 빠르며, 템플릿 캐싱을 통해 성능을 최적화합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"더 알아보기"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"https://github.com/developit/htm",target:"_blank",rel:"noopener noreferrer",class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"HTM GitHub Repository →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"HTM의 공식 문서와 더 많은 예제를 확인하세요."})]}),e("a",{href:"/guide/ftags",onClick:t=>{t.preventDefault(),v("/guide/ftags")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"FTags →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"Lithent의 또 다른 JSX 대안인 FTags를 알아보세요."})]})]})]}),_l=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Template Strings"}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium text-red-900 dark:text-red-100",children:"⚠️ 실험적 기능 (Experimental)"}),e("br",{}),e("br",{}),"Lithent Template Strings는 현재"," ",e("strong",{children:"실험적(Experimental) 단계"}),"입니다:",e("br",{}),e("br",{}),"• ",e("strong",{children:"프로덕션 테스트 미완료:"})," 실제 운영 환경에서 충분히 검증되지 않았습니다",e("br",{}),"• ",e("strong",{children:"API 변경 가능:"})," 향후 문법이나 동작이 변경될 수 있습니다",e("br",{}),"• ",e("strong",{children:"에디터 지원 부족:"})," VSCode 등 에디터에서 문법 하이라이팅, 자동완성, 린트 플러그인이 아직 제공되지 않습니다",e("br",{}),e("br",{}),"프로덕션 프로젝트에서는"," ",e("a",{href:"/guide/jsx-manual",onClick:t=>{t.preventDefault(),v("/guide/jsx-manual")},class:"text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300",children:"JSX"}),","," ",e("a",{href:"/guide/ftags",onClick:t=>{t.preventDefault(),v("/guide/ftags")},class:"text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300",children:"FTags"}),", 또는"," ",e("a",{href:"/guide/htm-tags",onClick:t=>{t.preventDefault(),v("/guide/htm-tags")},class:"text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300",children:"HTM Tags"}),"를 권장합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"개요"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent Template Strings는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"JSX-like 문법을 순수 JavaScript h() 호출로 변환"}),"하는 템플릿 시스템입니다.",e("br",{}),e("br",{}),"JSX와 유사한 직관적인 문법을 제공하면서도 JSX transform에 의존하지 않으며, 강력한 지시자(directives)를 통해 조건부 렌더링과 리스트 렌더링을 선언적으로 작성할 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"왜 Template Strings인가?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"JSX는 강력하지만, 태그와 태그 사이에서 조건문이나 반복문을 처리할 때 JavaScript 문법이 난발되어 가독성이 떨어지는 문제가 있습니다:"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"❌ JSX의 가독성 문제"}),e(o,{language:"tsx",code:`// 조건문과 반복문이 중첩되면 복잡해짐
<div>
  {isLoading ? (
    <Spinner />
  ) : error ? (
    <Error message={error} />
  ) : (
    <div>
      {items.length > 0 ? (
        items.map(item => (
          <div key={item.id}>
            {item.active && (
              <Badge>Active</Badge>
            )}
            <span>{item.name}</span>
          </div>
        ))
      ) : (
        <Empty />
      )}
    </div>
  )}
</div>`})]}),e("div",{children:[e("h4",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"✅ Template의 명확한 의도"}),e(o,{language:"typescript",code:`// 지시자로 의도가 명확함
<div>
  <Spinner l-if={isLoading} />
  <Error l-else-if={error} message={error} />
  <div l-else>
    <div l-for={item in items}>
      <Badge l-if={item.active}>Active</Badge>
      <span>{item.name}</span>
    </div>
    <Empty l-if={items.length === 0} />
  </div>
</div>`})]})]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:[e("span",{class:"font-medium text-gray-900 dark:text-white",children:"💡 핵심 개선:"}),e("br",{}),e("br",{}),"Template Strings는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"l-if"}),","," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"l-for"})," ","같은 지시자를 통해 조건부 렌더링과 리스트 렌더링을"," ",e("strong",{children:"선언적이고 가독성 높게"})," 작성할 수 있습니다. 중첩된 JavaScript 표현식과 삼항 연산자 대신, HTML 속성처럼 자연스럽게 의도를 표현할 수 있습니다."]})}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"주요 특징"}),e("ul",{class:"space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"JSX-like 문법:"})," ","HTML과 유사한 직관적인 마크업"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"강력한 지시자:"})," ","l-if, l-for 등 선언적 제어 구조"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"소스맵 지원:"})," ","디버깅 시 원본 템플릿 위치 추적"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Vite 통합:"})," ","HMR 지원 및 빠른 개발 환경"]})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"설치 및 설정"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"lithentVite 플러그인 설치"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Template Strings 기능은"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@lithent/lithent-vite"})," ","플러그인의 template 옵션을 통해 사용합니다:"]}),e(o,{language:"bash",code:`npm install -D @lithent/lithent-vite
# or
pnpm add -D @lithent/lithent-vite`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Vite 설정"}),e(o,{language:"typescript",code:`// vite.config.ts
import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin({
      // template 옵션으로 템플릿 기능 활성화
      template: {
        // 기본값: ['.ljsx', '.ltsx']
        extensions: ['.ltsx', '.ljsx'],
      },
    }),
  ],
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6 mt-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"template"})," ","옵션을 설정하면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:".ltsx"})," ","및"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:".ljsx"})," ","파일이 자동으로 변환되며, HMR(Hot Module Replacement) 기능도 함께 활성화됩니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 간편한 설정:"}),e("br",{}),e("br",{}),"템플릿 기능만 필요하고 기본 설정을 사용한다면"," ",e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"template: true"}),"로 간단히 활성화할 수 있습니다:",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"lithentVitePlugin({ template: true })"})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"HMR 없이 템플릿만 사용 (권장하지 않음)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["특별한 이유로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@lithent/lithent-template-vite"}),"를 직접 사용해야 한다면:"]}),e(o,{language:"typescript",code:`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      extensions: ['.ltsx', '.ljsx'],
    }),
  ],
});`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 권장:"})," 대부분의 경우"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"@lithent/lithent-vite"}),"의 template 옵션을 사용하는 것이 더 편리합니다. HMR 기능도 함께 제공되며, 설정도 더 간단합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"템플릿 문법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 요소"}),e(o,{language:"typescript",code:`// src/App.ltsx
import { render } from 'lithent';

const App = () => (
  <div class="container">
    <h1>Hello Lithent</h1>
    <p>This is a template string</p>
  </div>
);

render(<App />, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"텍스트 보간"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["중괄호"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"{}"}),"를 사용하여 JavaScript 표현식을 삽입할 수 있습니다:"]}),e(o,{language:"typescript",code:`const Greeting = () => {
  const name = 'John';
  const count = 5;

  return (
    <div>
      <p>Hello {name}!</p>
      <p>You have {count} notifications</p>
      <p>Total: {count + 10}</p>
    </div>
  );
};`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"동적 속성"}),e(o,{language:"typescript",code:`const DynamicProps = () => {
  const className = 'active';
  const isDisabled = false;
  const handleClick = () => console.log('Clicked');

  return (
    <div>
      <div class={className}>Dynamic class</div>
      <button disabled={isDisabled} onClick={handleClick}>
        Click Me
      </button>
      <input type="text" value={inputValue} />
    </div>
  );
};`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Fragment"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"여러 요소를 wrapper 없이 그룹화할 수 있습니다:"}),e(o,{language:"typescript",code:`const MultipleElements = () => (
  <>
    <h1>Title</h1>
    <p>Description</p>
    <div>Content</div>
  </>
);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"지시자 (Directives)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent 템플릿은"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"l-"})," ","접두사를 사용하는 강력한 지시자를 제공합니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"l-if / l-else-if / l-else"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"조건부 렌더링을 선언적으로 작성할 수 있습니다:"}),e(o,{language:"typescript",code:`const ConditionalRendering = () => {
  const status = 'loading'; // 'loading' | 'error' | 'success'

  return (
    <div>
      <div l-if={status === 'loading'}>
        Loading...
      </div>
      <div l-else-if={status === 'error'}>
        Error occurred!
      </div>
      <div l-else>
        Content loaded successfully!
      </div>
    </div>
  );
};`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 규칙:"}),e("br",{}),e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"l-else-if"}),"와"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"l-else"}),"는 반드시"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"l-if"}),"나"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"l-else-if"})," ","바로 다음에 와야 합니다",e("br",{}),"• 표현식은 항상"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"{}"})," ","안에 작성합니다"]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"l-for"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"리스트를 반복 렌더링합니다:"}),e(o,{language:"typescript",code:`const TodoList = () => {
  const todos = [
    { id: 1, text: 'Learn Lithent' },
    { id: 2, text: 'Build App' },
    { id: 3, text: 'Deploy' },
  ];

  return (
    <ul class="todo-list">
      {/* 기본 형태: item in list */}
      <li l-for={todo in todos}>
        {todo.text}
      </li>
    </ul>
  );
};`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"인덱스 사용"}),e(o,{language:"typescript",code:`const NumberedList = () => {
  const items = ['Apple', 'Banana', 'Cherry'];

  return (
    <ul>
      {/* (item, index) in list */}
      <li l-for={(item, index) in items}>
        {index + 1}. {item}
      </li>
    </ul>
  );
};`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"복잡한 예제"}),e(o,{language:"typescript",code:`const TodoApp = () => {
  const todos = [
    { id: 1, text: 'Task 1', done: false },
    { id: 2, text: 'Task 2', done: true },
  ];

  return (
    <div class="todo-app">
      <h2>Todos ({todos.length})</h2>

      <div l-for={(todo, index) in todos} class="todo-item">
        <input type="checkbox" checked={todo.done} />
        <span>{index + 1}. {todo.text}</span>
        <span l-if={todo.done} class="badge">Done</span>
      </div>

      <p l-if={todos.length === 0}>No todos yet!</p>
    </div>
  );
};`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 l-for 문법:"}),e("br",{}),e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"l-for={item in list}"})," ","- 각 요소만",e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"l-for={(item, index) in list}"})," ","- 요소와 인덱스",e("br",{}),"• list는 배열, 객체 등 반복 가능한 모든 값"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"컴포넌트 사용"}),e(o,{language:"typescript",code:`// Button.ltsx
import { mount } from 'lithent';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

export const Button = mount<ButtonProps>((renew, props) => {
  return () => (
    <button class="btn" onClick={props.onClick}>
      {props.text}
    </button>
  );
});

// App.ltsx
import { Button } from './Button.ltsx';

const App = () => {
  const handleClick = () => {
    console.log('Clicked!');
  };

  return (
    <div class="app">
      <h1>My App</h1>
      <Button text="Click Me" onClick={handleClick} />
    </div>
  );
};`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"완전한 Todo 앱"}),e(o,{language:"typescript",code:`// TodoApp.ltsx
import { mount } from 'lithent';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export const TodoApp = mount(renew => {
  let todos: Todo[] = [];
  let input = '';
  let nextId = 1;

  const addTodo = () => {
    if (input.trim()) {
      todos = [...todos, { id: nextId++, text: input, completed: false }];
      input = '';
      renew();
    }
  };

  const toggleTodo = (id: number) => {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    renew();
  };

  const removeTodo = (id: number) => {
    todos = todos.filter(todo => todo.id !== id);
    renew();
  };

  return () => (
    <div class="todo-app">
      <h1>My Todos</h1>

      <div class="input-section">
        <input
          type="text"
          value={input}
          onInput={(e) => {
            input = (e.target as HTMLInputElement).value;
            renew();
          }}
          placeholder="Add new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div l-if={todos.length > 0} class="todo-list">
        <div l-for={(todo, index) in todos} class="todo-item">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span class={todo.completed ? 'completed' : ''}>
            {index + 1}. {todo.text}
          </span>
          <button onClick={() => removeTodo(todo.id)}>Delete</button>
        </div>
      </div>

      <p l-else class="empty-message">
        No todos yet. Add one above!
      </p>

      <div class="stats">
        Total: {todos.length} |
        Completed: {todos.filter(t => t.completed).length}
      </div>
    </div>
  );
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"사용자 프로필 카드"}),e(o,{language:"typescript",code:`// ProfileCard.ltsx
import { mount } from 'lithent';

interface User {
  name: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
}

interface ProfileCardProps {
  user: User;
}

export const ProfileCard = mount<ProfileCardProps>((renew, props) => {
  return () => (
    <div class="profile-card">
      <div l-if={props.user.avatar} class="avatar">
        <img src={props.user.avatar} alt={props.user.name} />
        <span l-if={props.user.isOnline} class="online-badge">●</span>
      </div>
      <div l-else class="avatar-placeholder">
        {props.user.name[0]}
      </div>

      <h3>{props.user.name}</h3>

      <p l-if={props.user.bio} class="bio">
        {props.user.bio}
      </p>

      <div class="status">
        <span l-if={props.user.isOnline}>Online</span>
        <span l-else>Offline</span>
      </div>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"컴파일 결과"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"템플릿이 어떻게 변환되는지 확인해보세요:"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",children:[e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"템플릿 (입력)"}),e(o,{language:"typescript",code:`<div class="todo-list">
  <h2>Todos ({todos.length})</h2>
  <ul>
    <li l-for={(todo, index) in todos}>
      <span>{index + 1}.</span>
      <span>{todo.text}</span>
    </li>
  </ul>
</div>`})]}),e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"JavaScript (출력)"}),e(o,{language:"javascript",code:`h('div', { class: 'todo-list' },
  h('h2', null, 'Todos (', todos.length, ')'),
  h('ul', null,
    (todos).map((todo, index) =>
      h('li', null,
        h('span', null, index + 1, '.'),
        h('span', null, todo.text)
      )
    )
  )
)`})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"템플릿 vs JSX vs 기타"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특징"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"Template Strings"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"JSX"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"HTM Tags"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"문법"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JSX-like"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JSX"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Tagged Template"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"지시자"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"l-if, l-for 지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JavaScript 표현식"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JavaScript 표현식"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"빌드 설정"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Vite 플러그인"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Babel/TypeScript"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"설정 불필요"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"파일 확장자"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:".ltsx, .ljsx"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:".tsx, .jsx"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:".ts, .js"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"소스맵"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"완벽 지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"완벽 지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"N/A (런타임)"})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 템플릿을 사용할까?"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-green-900 dark:text-green-100 mb-2",children:"✅ 템플릿이 적합한 경우"}),e("ul",{class:"space-y-2 text-sm md:text-base text-green-800 dark:text-green-200",children:[e("li",{children:"• 선언적 조건부 렌더링이 많은 경우 (l-if)"}),e("li",{children:"• 복잡한 리스트 렌더링 (l-for)"}),e("li",{children:"• HTML-like 문법을 선호하는 경우"}),e("li",{children:"• JSX transform 없이 JSX 스타일을 원할 때"}),e("li",{children:"• 소스맵 지원이 중요한 프로젝트"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"ℹ️ JSX가 더 나은 경우"}),e("ul",{class:"space-y-2 text-sm md:text-base text-blue-800 dark:text-blue-200",children:[e("li",{children:"• 이미 JSX 환경이 구축된 프로젝트"}),e("li",{children:"• React에서 마이그레이션하는 경우"}),e("li",{children:"• 팀이 JSX에 익숙한 경우"}),e("li",{children:"• 복잡한 JavaScript 로직이 많은 경우"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"고급 옵션"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"커스텀 확장자"}),e(o,{language:"typescript",code:`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      // 커스텀 확장자 추가
      extensions: ['.ltsx', '.ljsx', '.custom'],

      // 확장자별 로더 지정
      extensionLoaders: {
        '.custom': 'ts',
      },
    }),
  ],
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"필터 패턴"}),e(o,{language:"typescript",code:`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      // 특정 파일만 처리
      include: [/\\.ltsx$/, /src\\/templates\\/.*\\.ts$/],
    }),
  ],
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/guide/vite-plugin",onClick:t=>{t.preventDefault(),v("/guide/vite-plugin")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Vite Plugin →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"Lithent Vite 플러그인의 HMR 기능과 설정 옵션을 알아보세요."})]}),e("a",{href:"/guide/htm-tags",onClick:t=>{t.preventDefault(),v("/guide/htm-tags")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"HTM Tags →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"빌드 도구 없이 사용 가능한 HTM 템플릿 문법을 알아보세요."})]})]})]}),Hl=`import { mount, render } from 'lithent';
import { state, computed } from 'lithent/helper';

const Counter = mount(renew => {
  const count = state<number>(1, renew);
  const sum = computed(() =>
    [1, 3, 5, 7, 9].reduce((acc, n) => acc + n * count.v, 0)
  );

  const increment = () => {
    count.v += 1;
  };

  return () => (
    <div class="card">
      <p>computed: {sum.v}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
});

render(<Counter />, document.getElementById('root'));
`,Ul=E(t=>{const r=A(1,t),a=Ja(()=>[1,3,5,7,9].reduce((d,s)=>d+s*r.v,0)),n=()=>{r.v+=1};return()=>e("div",{class:"flex flex-col gap-3",children:[e("div",{class:"flex items-center gap-3",children:[e("button",{type:"button",onClick:n,class:"px-3 py-2 rounded-md text-sm font-medium text-white bg-[#42b883] hover:bg-[#36996b] transition-colors",children:"+1"}),e("span",{class:"text-sm text-gray-800 dark:text-gray-200",children:["computed: ",e("strong",{class:"text-[#42b883]",children:a.v})]})]}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"1,3,5,7,9의 합을 count 배로 계산합니다."})]})}),Bl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Computed Helper"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"computed"}),"훅으로 의존값이 바뀔 때만 재계산되는 값을 사용하는 예제입니다. 코드와 실행 결과를 함께 확인해 보세요."]}),e(o,{language:"typescript",code:Hl}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Ul,{})]})})]}),Fl=Xa({text:"여러 컴포넌트가 이 텍스트를 공유합니다"}),jt=E(t=>{const r=Fl(t,n=>[n.text]),a=n=>{r.text=n.target.value};return()=>e("textarea",{onInput:a,value:r.text,class:"w-full h-32 px-4 py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none",placeholder:"여기에 텍스트를 입력하세요..."})}),$l=E(()=>{const t=Y(null),r=Y(null);return ae(()=>{t.value&&De(e(jt,{}),t.value),r.value&&De(e(jt,{}),r.value)}),()=>e("div",{class:"space-y-6",children:[e("div",{class:"bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200",children:"💡 두 개의 textarea가 동일한 store를 공유합니다. 한 쪽에서 텍스트를 수정하면 다른 쪽도 자동으로 업데이트됩니다."})}),e("div",{class:"grid md:grid-cols-2 gap-6",children:[e("div",{class:"space-y-2",children:[e("div",{class:"flex items-center gap-2",children:[e("div",{class:"w-2 h-2 bg-blue-500 rounded-full"}),e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300",children:"Writer 컴포넌트 #1"})]}),e("div",{ref:t})]}),e("div",{class:"space-y-2",children:[e("div",{class:"flex items-center gap-2",children:[e("div",{class:"w-2 h-2 bg-green-500 rounded-full"}),e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300",children:"Writer 컴포넌트 #2"})]}),e("div",{ref:r})]})]}),e("div",{class:"bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"📌 핵심 개념"}),e("ul",{class:"space-y-1 text-sm text-gray-600 dark:text-gray-400",children:[e("li",{children:["•"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"store()"}),"로 공유 상태 생성"]}),e("li",{children:["• 각 컴포넌트에서"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"assignSharedStore(renew)"}),"로 구독"]}),e("li",{children:"• 한 곳에서 값 변경 시 모든 구독자가 자동 업데이트"})]})]})]})}),jl=`import { mount, render } from 'lithent';
import { store } from 'lithent/helper';

const assignSharedStore = store<{ text: string; count: number }>({
  text: 'sharedText',
  count: 3,
});

const Writer = mount(renew => {
  const shared = assignSharedStore(renew, s => [s.text]);
  const onInput = (e: InputEvent) => {
    shared.text = (e.target as HTMLTextAreaElement).value;
  };
  return () => <textarea onInput={onInput} value={shared.text} />;
});

render(<Writer />, document.getElementById('slot-1'));
render(<Writer />, document.getElementById('slot-2'));
`,zl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Store Helper"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"store"}),"훅으로 여러 컴포넌트가 값을 공유하는 방법을 보여주는 예제입니다. 아래에서 코드와 라이브 데모를 함께 확인하세요."]}),e(o,{language:"typescript",code:jl}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e($l,{})]})})]}),Qe=E(t=>{const r=A({x:0,y:0},t),a=Y(null),n=d=>{if(a.value){const s=a.value.getBoundingClientRect();r.v={x:d.clientX-s.left,y:d.clientY-s.top}}};return({render:d})=>e("div",{ref:a,onMouseMove:n,class:"relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-crosshair",children:d(r.v)})}),Jl=({emoji:t,pos:r})=>e("div",{class:"absolute text-4xl pointer-events-none transition-transform duration-100",style:{left:`${r.x}px`,top:`${r.y}px`,transform:"translate(-50%, -50%)"},children:t}),Vl=E(t=>({pos:r})=>e("div",{class:"absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700",children:e("div",{class:"text-sm font-mono space-y-1",children:[e("div",{class:"text-gray-600 dark:text-gray-400",children:["X:"," ",e("span",{class:"font-bold text-blue-600 dark:text-blue-400",children:Math.round(r.x)})]}),e("div",{class:"text-gray-600 dark:text-gray-400",children:["Y:"," ",e("span",{class:"font-bold text-purple-600 dark:text-purple-400",children:Math.round(r.y)})]})]})})),Wl=E(t=>({pos:r})=>{const a=(r.x+r.y)%360;return e("div",{class:"absolute inset-0 opacity-20 transition-all duration-300",style:{background:`radial-gradient(circle at ${r.x}px ${r.y}px, hsl(${a}, 70%, 60%), transparent 50%)`}})}),Xl=E(t=>{const r=A("colorful",t),a=[{id:"emoji",label:"🐱 이모지 팔로워",color:"blue"},{id:"coords",label:"📍 좌표 표시",color:"green"},{id:"colorful",label:"🎨 컬러풀 배경",color:"purple"}];return()=>e("div",{class:"space-y-6",children:[e("div",{class:"bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4",children:e("p",{class:"text-sm md:text-base text-orange-800 dark:text-orange-200",children:["💡 ",e("strong",{children:"Render Prop 패턴"}),": 컴포넌트가 렌더링 로직을 함수로 받아서 실행합니다. 이 예제에서 MouseTracker는 마우스 위치를 추적하고, render prop으로 받은 함수에 데이터를 전달합니다."]})}),e("div",{class:"flex gap-2 flex-wrap",children:a.map(n=>e("button",{onClick:()=>r.v=n.id,class:`px-4 py-2 rounded-lg text-sm font-medium transition-all ${r.v===n.id?`bg-${n.color}-600 text-white shadow-lg scale-105`:"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`,children:n.label}))}),r.v==="emoji"&&e(Qe,{render:n=>e(_,{children:[e("div",{class:"absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm pointer-events-none",children:"마우스를 움직여보세요!"}),e(Jl,{emoji:"🐱",pos:n})]})}),r.v==="coords"&&e(Qe,{render:n=>e(_,{children:[e("div",{class:"absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm pointer-events-none",children:"마우스를 움직여 좌표를 확인하세요"}),e(Vl,{pos:n}),e("div",{class:"absolute w-2 h-2 bg-red-500 rounded-full pointer-events-none",style:{left:`${n.x}px`,top:`${n.y}px`,transform:"translate(-50%, -50%)"}})]})}),r.v==="colorful"&&e(Qe,{render:n=>e(_,{children:[e(Wl,{pos:n}),e("div",{class:"absolute inset-0 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm pointer-events-none z-10",children:"마우스를 움직여 색상을 변경하세요"})]})}),e("div",{class:"bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"📌 핵심 개념"}),e("ul",{class:"space-y-1 text-sm text-gray-600 dark:text-gray-400",children:[e("li",{children:["•"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"render"})," ","prop을 함수로 받아서 데이터 전달"]}),e("li",{children:"• MouseTracker가 마우스 위치 추적 로직을 캡슐화"}),e("li",{children:"• 렌더링 로직은 외부에서 자유롭게 구현 가능"}),e("li",{children:"• 재사용성과 유연성이 뛰어난 컴포넌트 디자인 패턴"})]})]})]})}),Gl=`import { mount, ref } from 'lithent';
import { state } from 'lithent/helper';

const MouseTracker = mount((renew) => {
  const pos = state({ x: 0, y: 0 }, renew);
  const refEl = ref<HTMLDivElement | null>(null);
  const onMove = (e: MouseEvent) => {
    if (refEl.value) {
      pos.v = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };
  return ({ render }) => (
    <div ref={refEl} onMouseMove={onMove} class="tracker">
      {render(pos.v)}
    </div>
  );
});

// render prop에 맞춰 원하는 뷰를 렌더링
<MouseTracker
  render={pos => (
    <div style={{ left: pos.x, top: pos.y }}>🎨</div>
  )}
/>;
`,ql=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Render Props (Mouse tracker)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["마우스 위치를 추적하는 로직을 ",e("strong",{children:"render prop"}),"으로 노출해 원하는 뷰를 그릴 수 있는 예제입니다. 기본 데모는 컬러풀 배경이며, 이모지 팔로워·좌표 표시 뷰로 전환할 수도 있습니다."]}),e(o,{language:"typescript",code:Gl}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Xl,{})]})})]}),Kl=`import { mount, render, ref } from 'lithent';
import { state, effect } from 'lithent/helper';

const Children = mount((renew) => {
  const count = state<number>(0, renew);
  const change = () => {
    count.v += 1;
  };

  effect(
    () => console.log('INJECT'),
    () => console.log('CLEAN UP'),
    () => [count.v]
  );

  return () => (
    <>
      <button onClick={change} type="button">
        increase
      </button>
      <span>count: {count.v}</span>
    </>
  );
});

const Parent = mount(renew => {
  let mountState = true;
  const toggleMount = () => {
    mountState = !mountState;
    renew();
  };

  return () => (
    <>
      <button onClick={toggleMount} type="button">
        toggleMount
      </button>
      {mountState ? <Children /> : null}
    </>
  );
});

render(<Parent />, document.getElementById('root'));
`,Yl=E((t,r)=>{const a=A(0,t),n=()=>{a.v+=1};let d=!1;const s=i=>{requestAnimationFrame(()=>{requestAnimationFrame(()=>{const c=i.parentElement;c&&(c.scrollTop=c.scrollHeight)})})},l=i=>{i.innerHTML=i.innerHTML.replace(/text-green-400/g,"text-gray-500").replace(/text-orange-400/g,"text-gray-500")};return Va(()=>{const i=r.logEl.value;d||l(i),d=!1,i.innerHTML+='<span class="text-green-400">INJECT</span><br>',i.innerHTML+='<div class="my-2 border-t border-gray-500 opacity-30"></div>',s(i)},()=>{const i=r.logEl.value;l(i),d=!0,setTimeout(()=>{d=!1},0),i.innerHTML+='<span class="text-orange-400">CLEAN_UP</span><br>',i.innerHTML+='<div class="my-2 border-t border-gray-500 opacity-30"></div>',s(i)},()=>[a.v]),()=>e("div",{class:"flex items-center gap-3",children:[e("button",{onClick:n,type:"button",class:"px-3 py-2 rounded-md text-sm font-medium text-white bg-[#42b883] hover:bg-[#36996b] transition-colors",children:"increase"}),e("span",{class:"text-sm text-gray-800 dark:text-gray-200",children:["count: ",e("strong",{class:"text-[#42b883]",children:a.v})]})]})}),Zl=E(t=>{let r=Y(null),a=!0;const n=()=>{a=!a,t()};return()=>e("div",{class:"flex flex-col gap-3",children:[e("div",{class:"rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-3 h-40 overflow-y-auto text-xs font-mono",children:e("div",{ref:r,class:"text-gray-700 dark:text-gray-300"})}),e("div",{class:"flex items-center gap-3 min-h-[70px]",children:[e("button",{onClick:n,type:"button",class:"px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:a?"Unmount Child":"Mount Child"}),a?e(Yl,{logEl:r}):null]}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"count 변경 시 CLEAN_UP → INJECT가 실행되고, 컴포넌트 unmount 시 CLEAN_UP만 실행됩니다."})]})}),Ql=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Effect Helper"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"effect"}),"훅으로 컴포넌트 생명주기에 따른 사이드 이펙트를 관리하는 예제입니다. 첫 번째 인자는 mount/update 후 실행되는 액션, 두 번째 인자는 unmount/update 전 실행되는 cleanup 함수입니다."]}),e(o,{language:"typescript",code:Kl}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Zl,{})]})})]}),He=E((t,r)=>{const a=d=>{switch(d){case"like":return"❤️";case"comment":return"💬";case"follow":return"👤";case"system":return"🔔";default:return"📌"}},n=d=>{switch(d){case"like":return"bg-pink-500";case"comment":return"bg-blue-500";case"follow":return"bg-purple-500";case"system":return"bg-gray-500";default:return"bg-gray-400"}};return()=>{const d=r.notification;return e("div",{class:`flex items-start gap-3 p-3 rounded-lg transition-all ${d.read?"bg-gray-50 dark:bg-gray-800/50":"bg-white dark:bg-gray-800 border border-[#42b883]/20"}`,children:[e("div",{class:`flex-shrink-0 w-10 h-10 rounded-full ${n(d.type)} flex items-center justify-center text-lg`,children:a(d.type)}),e("div",{class:"flex-1 min-w-0",children:[e("p",{class:"text-sm text-gray-900 dark:text-gray-100",children:[d.user&&e("strong",{children:d.user})," ",d.content]}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400 mt-1",children:d.time})]}),e("button",{onClick:r.onToggleRead,class:`flex-shrink-0 w-3 h-3 rounded-full border-2 transition-colors ${d.read?"border-gray-300 dark:border-gray-600":"border-[#42b883] bg-[#42b883]"}`,title:d.read?"Mark as unread":"Mark as read"})]})}}),ed=E(t=>{const r=A([{id:1,type:"like",user:"Sarah",content:"liked your post",time:"2 min ago",read:!1},{id:2,type:"comment",user:"John",content:'commented: "Great work!"',time:"5 min ago",read:!1},{id:3,type:"like",user:"Mike",content:"liked your comment",time:"10 min ago",read:!0},{id:4,type:"follow",user:"Emma",content:"started following you",time:"15 min ago",read:!1},{id:5,type:"comment",user:"Alex",content:"replied to your comment",time:"20 min ago",read:!0},{id:6,type:"system",content:"Your profile was viewed 25 times this week",time:"1 hour ago",read:!0},{id:7,type:"follow",user:"Lisa",content:"started following you",time:"2 hours ago",read:!0}],t),a=A({like:!0,comment:!0,follow:!0,system:!0},t),n=l=>{a.v={...a.v,[l]:!a.v[l]}},d=l=>{r.v=r.v.map(i=>i.id===l?{...i,read:!i.read}:i)},s=()=>{r.v=r.v.map(l=>({...l,read:!0}))};return()=>{const l=r.v.filter(g=>g.type==="like"),i=r.v.filter(g=>g.type==="comment"),c=r.v.filter(g=>g.type==="follow"),p=r.v.filter(g=>g.type==="system"),m=r.v.filter(g=>!g.read).length;return e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"flex items-center justify-between mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white",children:["Notifications",m>0&&e("span",{class:"ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-[#42b883] text-white",children:m})]}),m>0&&e("button",{onClick:s,class:"text-xs text-[#42b883] hover:text-[#36996b] font-medium transition-colors",children:"Mark all as read"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>n("like"),class:`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${a.v.like?"bg-pink-500 text-white":"bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`,children:["❤️ Likes (",l.length,")"]}),e("button",{onClick:()=>n("comment"),class:`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${a.v.comment?"bg-blue-500 text-white":"bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`,children:["💬 Comments (",i.length,")"]}),e("button",{onClick:()=>n("follow"),class:`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${a.v.follow?"bg-purple-500 text-white":"bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`,children:["👤 Follows (",c.length,")"]}),e("button",{onClick:()=>n("system"),class:`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${a.v.system?"bg-gray-500 text-white":"bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`,children:["🔔 System (",p.length,")"]})]}),e("div",{class:"space-y-2 max-h-96 overflow-y-auto",children:[e(_,{children:[a.v.like&&e(_,{children:l.map(g=>e(He,{notification:g,onToggleRead:()=>d(g.id)}))}),a.v.comment&&e(_,{children:i.map(g=>e(He,{notification:g,onToggleRead:()=>d(g.id)}))}),e(_,{children:[a.v.follow&&e(_,{children:c.map(g=>e(He,{notification:g,onToggleRead:()=>d(g.id)}))}),a.v.system&&e(_,{children:p.map(g=>e(He,{notification:g,onToggleRead:()=>d(g.id)}))})]})]}),!a.v.like&&!a.v.comment&&!a.v.follow&&!a.v.system&&e("div",{class:"text-center py-8 text-gray-500 dark:text-gray-400",children:e("p",{class:"text-sm",children:"No filters selected"})})]}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400 mt-4",children:"이 예제는 중첩된 Fragment를 사용하여 알림 타입별로 그룹화합니다. 필터를 토글하면 Fragment 단위로 DOM이 추가/제거됩니다."})]})}}),td=`import { mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'system';
  user?: string;
  content: string;
  time: string;
  read: boolean;
}

const NotificationCenter = mount(r => {
  const notifications = state<Notification[]>([...], r);
  const filters = state({
    like: true,
    comment: true,
    follow: true,
    system: true,
  }, r);

  const toggleFilter = (type) => {
    filters.v = { ...filters.v, [type]: !filters.v[type] };
  };

  return () => {
    const likes = notifications.v.filter(n => n.type === 'like');
    const comments = notifications.v.filter(n => n.type === 'comment');
    const follows = notifications.v.filter(n => n.type === 'follow');
    const systems = notifications.v.filter(n => n.type === 'system');

    return (
      <>
        {/* 중첩된 Fragment 구조 */}
        <Fragment>
          {/* Likes Fragment Group */}
          {filters.v.like && (
            <Fragment>
              {likes.map(n => <NotificationItem notification={n} />)}
            </Fragment>
          )}

          {/* Comments Fragment Group */}
          {filters.v.comment && (
            <Fragment>
              {comments.map(n => <NotificationItem notification={n} />)}
            </Fragment>
          )}

          {/* 더 깊게 중첩된 Fragment */}
          <Fragment>
            {filters.v.follow && (
              <Fragment>
                {follows.map(n => <NotificationItem notification={n} />)}
              </Fragment>
            )}

            {filters.v.system && (
              <Fragment>
                {systems.map(n => <NotificationItem notification={n} />)}
              </Fragment>
            )}
          </Fragment>
        </Fragment>
      </>
    );
  };
});
`,rd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Nested Fragments (Notification Center)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["중첩된"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"Fragment"}),"를 사용하여 알림 센터를 구현한 예제입니다. 각 알림 타입(좋아요, 댓글, 팔로우, 시스템)을 Fragment로 그룹화하고, 필터 버튼으로 특정 타입의 알림들을 토글할 수 있습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent의 가상 돔 엔진이 복잡하게 중첩된 Fragment 구조를 정확하게 처리하고 효율적으로 업데이트하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"필터를 변경하면 Fragment 단위로 DOM이 추가/제거되며, 여러 단계로 중첩된 구조에서도 올바르게 diff 알고리즘이 작동합니다."}),e(o,{language:"typescript",code:td}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(ed,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Fragment 중첩 구조의 장점"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"논리적 그룹화"}),": 관련된 요소들을 Fragment로 묶어 구조를 명확하게 표현"]}),e("li",{children:[e("strong",{children:"효율적인 업데이트"}),": 필터 변경 시 해당 Fragment 그룹만 추가/제거"]}),e("li",{children:[e("strong",{children:"깨끗한 DOM"}),": Fragment는 실제 DOM 노드를 생성하지 않아 불필요한 래퍼 요소가 없음"]}),e("li",{children:[e("strong",{children:"유연한 구조"}),": 여러 단계로 중첩하여 복잡한 조건부 렌더링 구현 가능"]})]})]})]}),ad=E((t,r)=>{const a=n=>{switch(n){case"pop":return"🎵";case"rock":return"🎸";case"jazz":return"🎷";case"hiphop":return"🎤";default:return"🎵"}};return()=>{const n=r.song;return e("div",{class:`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${n.color} bg-white dark:bg-gray-800 hover:shadow-md`,children:[e("div",{class:"text-3xl",children:a(n.genre)}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2",children:[e("h4",{class:"text-sm font-semibold text-gray-900 dark:text-gray-100 truncate",children:n.title}),e("span",{class:"text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",children:["ID: ",n.id]})]}),e("p",{class:"text-xs text-gray-600 dark:text-gray-400",children:[n.artist," • ",n.duration]})]}),e("div",{class:"flex items-center gap-2",children:[e("div",{class:"text-center px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30",children:[e("div",{class:"text-xs text-purple-600 dark:text-purple-400 font-semibold",children:n.plays}),e("div",{class:"text-xs text-purple-500 dark:text-purple-500",children:"plays"})]}),e("button",{onClick:r.onPlay,class:"w-8 h-8 flex items-center justify-center rounded-full bg-[#42b883] hover:bg-[#36996b] text-white transition-colors",title:"Play",children:"▶"}),e("button",{onClick:r.onRemove,class:"w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors text-xs",title:"Remove",children:"✕"})]})]})}}),nd=E(t=>{const r=A([{id:1,title:"Summer Vibes",artist:"The Waves",genre:"pop",duration:"3:24",plays:0,color:"border-pink-300"},{id:2,title:"Electric Dreams",artist:"Neon Knights",genre:"rock",duration:"4:15",plays:0,color:"border-red-300"},{id:3,title:"Midnight Jazz",artist:"Smooth Trio",genre:"jazz",duration:"5:02",plays:0,color:"border-blue-300"},{id:4,title:"Street Flow",artist:"MC Rhythm",genre:"hiphop",duration:"3:45",plays:0,color:"border-purple-300"},{id:5,title:"Ocean Waves",artist:"Chill Beats",genre:"pop",duration:"3:58",plays:0,color:"border-teal-300"}],t);let a=6;const n=m=>{r.v=r.v.map(g=>g.id===m?{...g,plays:g.plays+1}:g)},d=m=>{r.v=r.v.filter(g=>g.id!==m)},s=()=>{const m=[...r.v];for(let g=m.length-1;g>0;g--){const y=Math.floor(Math.random()*(g+1));[m[g],m[y]]=[m[y],m[g]]}r.v=m},l=()=>{r.v=[...r.v].sort((m,g)=>m.title.localeCompare(g.title))},i=()=>{r.v=[...r.v].sort((m,g)=>g.plays-m.plays)},c=()=>{const m=["Starlight","Thunder Road","Golden Hour","Neon Lights","Blue Moon"],g=["Dream Band","Solo Star","The Legends","New Wave","Classic Crew"],y=["pop","rock","jazz","hiphop"],x=["border-pink-300","border-red-300","border-blue-300","border-purple-300","border-teal-300","border-orange-300","border-green-300"],O={id:a++,title:m[Math.floor(Math.random()*m.length)],artist:g[Math.floor(Math.random()*g.length)],genre:y[Math.floor(Math.random()*y.length)],duration:`${Math.floor(Math.random()*3+2)}:${Math.floor(Math.random()*60).toString().padStart(2,"0")}`,plays:0,color:x[Math.floor(Math.random()*x.length)]};r.v=[...r.v,O]},p=()=>{r.v=[...r.v].reverse()};return()=>e("div",{class:"w-full max-w-3xl mx-auto",children:[e("div",{class:"flex items-center justify-between mb-4",children:e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white",children:"🎧 My Playlist"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:[r.v.length," songs • Total plays:"," ",r.v.reduce((m,g)=>m+g.plays,0)]})]})}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:c,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#42b883] hover:bg-[#36996b] transition-colors",children:"➕ Add Song"}),e("button",{onClick:s,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",children:"🔀 Shuffle"}),e("button",{onClick:p,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:"🔄 Reverse"}),e("button",{onClick:l,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"🔤 Sort by Title"}),e("button",{onClick:i,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"📊 Sort by Plays"})]}),e("div",{class:"space-y-2 max-h-96 overflow-y-auto",children:r.v.length===0?e("div",{class:"text-center py-8 text-gray-500 dark:text-gray-400",children:[e("p",{class:"text-sm",children:"Your playlist is empty"}),e("p",{class:"text-xs mt-1",children:'Click "Add Song" to get started'})]}):r.v.map(m=>e(ad,{song:m,onPlay:()=>n(m.id),onRemove:()=>d(m.id)},m.id))}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"Key 동작 확인:"})," 노래를 재생하여 plays 카운터를 증가시킨 후 Shuffle이나 Sort를 해보세요. 각 노래의 ID와 plays 카운터가 유지되는 것을 확인할 수 있습니다. 이는 key prop 덕분에 Lithent가 동일한 요소를 정확하게 추적하고 있기 때문입니다."]})})]})}),ld=`import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface Song {
  id: number;
  title: string;
  artist: string;
  plays: number;
}

const Playlist = mount(r => {
  const songs = state<Song[]>([
    { id: 1, title: 'Summer Vibes', artist: 'The Waves', plays: 0 },
    { id: 2, title: 'Electric Dreams', artist: 'Neon Knights', plays: 0 },
    { id: 3, title: 'Midnight Jazz', artist: 'Smooth Trio', plays: 0 },
  ], r);

  const playSong = (id: number) => {
    songs.v = songs.v.map(s =>
      s.id === id ? { ...s, plays: s.plays + 1 } : s
    );
  };

  const shufflePlaylist = () => {
    const shuffled = [...songs.v];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    songs.v = shuffled;
  };

  const sortByPlays = () => {
    songs.v = [...songs.v].sort((a, b) => b.plays - a.plays);
  };

  return () => (
    <>
      <button onClick={shufflePlaylist}>🔀 Shuffle</button>
      <button onClick={sortByPlays}>📊 Sort by Plays</button>

      {songs.v.map(song => (
        <div key={song.id}>
          <h4>{song.title} by {song.artist}</h4>
          <p>Plays: {song.plays}</p>
          <button onClick={() => playSong(song.id)}>▶ Play</button>
        </div>
      ))}
    </>
  );
});
`,dd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Key-based List Updates (Playlist Manager)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["리스트를 렌더링할 때"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"key"})," ","prop을 사용하여 각 아이템을 고유하게 식별하는 음악 플레이리스트 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent의 가상 돔 엔진이 key를 기반으로 리스트 아이템을 정확하게 추적하고, 순서가 변경되거나 아이템이 추가/삭제될 때 효율적으로 DOM을 업데이트하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"각 노래의 재생 횟수(plays)를 증가시킨 후 Shuffle이나 Sort를 실행해보세요. key 덕분에 각 노래의 ID와 내부 상태가 유지되는 것을 확인할 수 있습니다."}),e(o,{language:"typescript",code:ld}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(nd,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Key 사용의 중요성"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"요소 식별"}),": key를 통해 Lithent는 리스트의 각 아이템을 고유하게 식별"]}),e("li",{children:[e("strong",{children:"효율적인 업데이트"}),": 순서 변경 시 DOM 노드를 재사용하여 불필요한 재생성 방지"]}),e("li",{children:[e("strong",{children:"상태 보존"}),": 아이템의 위치가 바뀌어도 내부 상태(plays 카운터)가 유지됨"]}),e("li",{children:[e("strong",{children:"정확한 diff"}),": key 기반으로 어떤 아이템이 추가/삭제/이동되었는지 정확히 판단"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"여러 노래의 재생 버튼(▶)을 클릭하여 plays 카운터를 증가시킵니다"}),e("li",{children:"🔀 Shuffle 버튼을 클릭하여 순서를 섞어봅니다"}),e("li",{children:"각 노래의 ID와 plays 카운터가 그대로 유지되는지 확인합니다"}),e("li",{children:"📊 Sort by Plays로 정렬해도 상태가 유지되는 것을 확인합니다"}),e("li",{children:"➕ Add Song으로 새 노래를 추가하고 ✕ 버튼으로 노래를 삭제해봅니다"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",children:[e("h3",{class:"text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2",children:"⚠️ Key가 없다면?"}),e("p",{class:"text-sm text-yellow-700 dark:text-yellow-300",children:"key를 사용하지 않으면 Lithent는 리스트 아이템을 인덱스 기반으로 매칭합니다. 이 경우 순서가 변경되면 잘못된 DOM 노드에 데이터가 적용되어 plays 카운터가 다른 노래로 이동하거나, 불필요한 DOM 재생성이 발생할 수 있습니다."})]})]}),od=t=>{let r=t;return r=r.replace(/^### (.*$)/gim,'<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>'),r=r.replace(/^## (.*$)/gim,'<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h2>'),r=r.replace(/^# (.*$)/gim,'<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">$1</h1>'),r=r.replace(/^\* (.*$)/gim,'<li class="ml-4 text-gray-700 dark:text-gray-300">$1</li>'),r=r.replace(/(<li class="ml-4.*<\/li>)/s,'<ul class="list-disc list-inside mb-2">$1</ul>'),r=r.replace(/^\d+\. (.*$)/gim,'<li class="ml-4 text-gray-700 dark:text-gray-300">$1</li>'),r=r.replace(/\*\*(.*?)\*\*/g,'<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>'),r=r.replace(/\*([^\s*][^*]*?)\*/g,'<em class="italic text-gray-700 dark:text-gray-300">$1</em>'),r=r.replace(/`(.*?)`/g,'<code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono text-pink-600 dark:text-pink-400">$1</code>'),r=r.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">$1</a>'),r=r.replace(/^> (.*$)/gim,'<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>'),r=r.replace(/^---$/gim,'<hr class="my-4 border-gray-300 dark:border-gray-600" />'),r=r.replace(/\n\n/g,'</p><p class="mb-2 text-gray-700 dark:text-gray-300">'),r=r.replace(/\n/g,"<br/>"),r='<p class="mb-2 text-gray-700 dark:text-gray-300">'+r+"</p>",r},zt={welcome:`# Welcome to Markdown Editor 👋

This is a **live markdown editor** powered by Lithent's \`innerHTML\` feature!

## Features
* Real-time preview
* Simple and fast
* Syntax highlighting

Try editing this text or click a template below!`,article:`# How to Build a Virtual DOM

## Introduction
Virtual DOM is a **programming concept** where a virtual representation of the UI is kept in memory.

## Key Benefits
1. Efficient updates
2. Better performance
3. Declarative code

> "The best code is no code at all." - Someone wise

---

Learn more at [Lithent Docs](https://lithent.com)`,todo:`# My Todo List 📝

## Today's Tasks
* Review pull requests
* Write documentation
* Fix **critical** bugs
* Deploy to \`production\`

## Tomorrow
1. Team meeting at 10am
2. Code review session
3. Plan next sprint

> Don't forget to take breaks! ☕`,code:`# Code Example

You can use inline code like \`const x = 10\` or reference functions like \`useState()\`.

## Best Practices
* Write **clean code**
* Add proper *comments*
* Use meaningful variable names

### Links
Check out [MDN Web Docs](https://developer.mozilla.org) for reference.`},sd=E(t=>{const r=A(zt.welcome,t),a=d=>{r.v=zt[d]},n=d=>{r.v=d.target.value};return()=>{const d=od(r.v),s=r.v.trim().split(/\s+/).length,l=r.v.length;return e("div",{class:"w-full max-w-5xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"📝 Markdown Editor"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"Edit markdown on the left, see live HTML preview on the right"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>a("welcome"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",children:"👋 Welcome"}),e("button",{onClick:()=>a("article"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:"📰 Article"}),e("button",{onClick:()=>a("todo"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors",children:"✅ Todo"}),e("button",{onClick:()=>a("code"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors",children:"💻 Code"}),e("div",{class:"flex-1"}),e("div",{class:"text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3",children:[e("span",{children:[s," words"]}),e("span",{children:"•"}),e("span",{children:[l," characters"]})]})]}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e("div",{class:"flex flex-col",children:[e("div",{class:"mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300",children:"Markdown Input"}),e("textarea",{value:r.v,onInput:n,class:"flex-1 min-h-[400px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#42b883]",placeholder:"Type your markdown here..."})]}),e("div",{class:"flex flex-col",children:[e("div",{class:"mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300",children:"HTML Preview (using innerHTML)"}),e("div",{class:"flex-1 min-h-[400px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 overflow-auto",children:e("div",{innerHTML:d,class:"text-gray-700 dark:text-gray-300"})})]})]}),e("div",{class:"mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2",children:"💡 Supported Markdown Syntax"}),e("div",{class:"grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-700 dark:text-blue-300",children:[e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"# Heading"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"**bold**"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"*italic*"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"`code`"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"[link](url)"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"* list"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"1. ordered"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"> quote"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"---"})})]})]})]})}}),id=`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const MarkdownEditor = mount(r => {
  const markdown = state('# Hello World\\n\\nThis is **bold** text.', r);

  const markdownToHtml = (md: string): string => {
    let html = md;
    // Convert markdown to HTML
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    html = html.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
    return html;
  };

  return () => {
    const html = markdownToHtml(markdown.v);

    return (
      <>
        <textarea
          value={markdown.v}
          onInput={(e) => {
            markdown.v = (e.target as HTMLTextAreaElement).value;
          }}
        />
        {/* Using innerHTML to render converted HTML */}
        <div innerHTML={html} />
      </>
    );
  };
});
`,cd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"innerHTML Property (Markdown Editor)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"innerHTML"})," ","prop을 사용하여 HTML 문자열을 직접 DOM에 삽입하는 실시간 마크다운 에디터 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent가 innerHTML을 통해 동적으로 생성된 HTML 문자열을 효율적으로 DOM에 렌더링하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"마크다운 문법으로 텍스트를 입력하면 실시간으로 HTML로 변환되어 미리보기에 표시됩니다. 템플릿 버튼을 클릭하거나 직접 마크다운을 작성해보세요!"}),e(o,{language:"typescript",code:id}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(sd,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"innerHTML 사용 시나리오"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"외부 HTML 삽입"}),": API나 CMS에서 받은 HTML 콘텐츠를 렌더링"]}),e("li",{children:[e("strong",{children:"마크다운 변환"}),": 마크다운을 HTML로 변환하여 표시"]}),e("li",{children:[e("strong",{children:"Syntax Highlighting"}),": 코드 하이라이터 라이브러리 결과물 렌더링"]}),e("li",{children:[e("strong",{children:"Rich Text"}),": WYSIWYG 에디터에서 생성된 HTML 표시"]}),e("li",{children:[e("strong",{children:"SVG/Chart"}),": 문자열로 생성된 SVG나 차트 삽입"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"주요 기능"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"실시간 변환"}),": 타이핑할 때마다 즉시 HTML로 변환되어 미리보기 갱신"]}),e("li",{children:[e("strong",{children:"다양한 문법 지원"}),": 헤딩, 볼드, 이탤릭, 코드, 링크, 리스트, 인용문 등"]}),e("li",{children:[e("strong",{children:"템플릿 시스템"}),": 4가지 샘플 템플릿으로 빠른 시작"]}),e("li",{children:[e("strong",{children:"통계 표시"}),": 단어 수와 글자 수를 실시간으로 계산"]}),e("li",{children:[e("strong",{children:"양방향 에디터"}),": 입력과 미리보기를 나란히 배치하여 직관적인 UX 제공"]})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",children:[e("h3",{class:"text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2",children:"⚠️ innerHTML 사용 시 주의사항"}),e("ul",{class:"list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300",children:[e("li",{children:[e("strong",{children:"XSS 공격 위험"}),": 사용자 입력을 그대로 innerHTML에 넣으면 보안 위험이 있습니다. 반드시 입력을 검증하거나 sanitize 해야 합니다."]}),e("li",{children:[e("strong",{children:"이벤트 리스너 손실"}),": innerHTML로 삽입된 요소에는 이벤트 리스너가 자동으로 연결되지 않습니다."]}),e("li",{children:[e("strong",{children:"성능 고려"}),": 큰 HTML 문자열을 자주 업데이트하면 성능에 영향을 줄 수 있습니다."]})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-800 dark:text-green-200 mb-2",children:"✅ 안전한 사용 방법"}),e("p",{class:"text-sm text-green-700 dark:text-green-300 mb-2",children:"이 예제처럼 신뢰할 수 있는 소스(자체 마크다운 파서)에서 생성된 HTML만 사용하거나, DOMPurify 같은 라이브러리로 sanitize 한 후 사용하세요. 외부에서 받은 HTML을 그대로 사용하는 것은 절대 피해야 합니다."}),e("p",{class:"text-xs text-green-600 dark:text-green-400 italic",children:["💡 참고: 이 예제의 마크다운 파서는 데모를 위해 급조한 것이라 정규식 버그가 숨어있을 수 있습니다 😅 프로덕션에서는"," ",e("code",{class:"px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs",children:"marked"}),"나"," ",e("code",{class:"px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs",children:"markdown-it"})," ","같은 검증된 라이브러리를 사용하세요. 정규식은 항상 우리를 배신합니다."]})]})]}),I={face:[{value:"😊",label:"😊 Happy"},{value:"😎",label:"😎 Cool"},{value:"🤓",label:"🤓 Nerdy"},{value:"😴",label:"😴 Sleepy"},{value:"🤠",label:"🤠 Cowboy"},{value:"🥳",label:"🥳 Party"},{value:"😇",label:"😇 Angel"},{value:"🤡",label:"🤡 Clown"}],hair:[{value:"🦰",label:"🦰 Red Hair"},{value:"🦱",label:"🦱 Curly"},{value:"🦲",label:"🦲 Bald"},{value:"🦳",label:"🦳 White"},{value:"💇",label:"💇 Haircut"},{value:"👨‍🦰",label:"👨‍🦰 Short Red"},{value:"👩‍🦱",label:"👩‍🦱 Curly Long"},{value:"🧔",label:"🧔 Beard"}],eyes:[{value:"👀",label:"👀 Normal"},{value:"👁️",label:"👁️ Single"},{value:"🕶️",label:"🕶️ Sunglasses"},{value:"👓",label:"👓 Glasses"},{value:"🥽",label:"🥽 Goggles"},{value:"😵‍💫",label:"😵‍💫 Dizzy"},{value:"🤩",label:"🤩 Star Eyes"},{value:"😍",label:"😍 Heart Eyes"}],outfit:[{value:"👔",label:"👔 Formal"},{value:"👕",label:"👕 T-Shirt"},{value:"👗",label:"👗 Dress"},{value:"👘",label:"👘 Kimono"},{value:"🦺",label:"🦺 Safety Vest"},{value:"🥼",label:"🥼 Lab Coat"},{value:"🎽",label:"🎽 Athletic"},{value:"👚",label:"👚 Blouse"}],accessory:[{value:"🎩",label:"🎩 Top Hat"},{value:"👑",label:"👑 Crown"},{value:"🎓",label:"🎓 Grad Cap"},{value:"⛑️",label:"⛑️ Helmet"},{value:"🧢",label:"🧢 Baseball Cap"},{value:"💍",label:"💍 Ring"},{value:"🎀",label:"🎀 Ribbon"},{value:"🎭",label:"🎭 Theater Mask"}],background:[{value:"bg-gradient-to-br from-blue-400 to-blue-600",label:"🌊 Ocean"},{value:"bg-gradient-to-br from-green-400 to-green-600",label:"🌲 Forest"},{value:"bg-gradient-to-br from-yellow-400 to-orange-500",label:"🌅 Sunset"},{value:"bg-gradient-to-br from-purple-400 to-pink-500",label:"🌸 Fantasy"},{value:"bg-gradient-to-br from-gray-700 to-gray-900",label:"🌃 Night"},{value:"bg-gradient-to-br from-red-400 to-red-600",label:"🔥 Fire"},{value:"bg-gradient-to-br from-cyan-300 to-blue-400",label:"❄️ Ice"},{value:"bg-gradient-to-br from-yellow-200 to-yellow-400",label:"☀️ Sunny"}]},md={developer:{face:"🤓",hair:"🦲",eyes:"👓",outfit:"👕",accessory:"💻",background:"bg-gradient-to-br from-gray-700 to-gray-900"},pirate:{face:"😎",hair:"🧔",eyes:"🕶️",outfit:"🦺",accessory:"🎩",background:"bg-gradient-to-br from-blue-400 to-blue-600"},royalty:{face:"😇",hair:"👨‍🦰",eyes:"👀",outfit:"👗",accessory:"👑",background:"bg-gradient-to-br from-purple-400 to-pink-500"},athlete:{face:"🥳",hair:"🦱",eyes:"😍",outfit:"🎽",accessory:"🧢",background:"bg-gradient-to-br from-green-400 to-green-600"}},xd=E(t=>{const r=A({face:"😊",hair:"🦰",eyes:"👀",outfit:"👔",accessory:"🎩",background:"bg-gradient-to-br from-blue-400 to-blue-600"},t),a=(l,i)=>{r.v={...r.v,[l]:i}},n=l=>{r.v={...md[l]}},d=()=>{r.v={face:I.face[Math.floor(Math.random()*I.face.length)].value,hair:I.hair[Math.floor(Math.random()*I.hair.length)].value,eyes:I.eyes[Math.floor(Math.random()*I.eyes.length)].value,outfit:I.outfit[Math.floor(Math.random()*I.outfit.length)].value,accessory:I.accessory[Math.floor(Math.random()*I.accessory.length)].value,background:I.background[Math.floor(Math.random()*I.background.length)].value}},s=()=>{const l=JSON.stringify(r.v,null,2);navigator.clipboard.writeText(l),alert("캐릭터 데이터가 클립보드에 복사되었습니다!")};return()=>e("div",{class:"w-full max-w-4xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"🎨 Character Creator"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"Create your unique character using select controls"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>n("developer"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-800 transition-colors",children:"💻 Developer"}),e("button",{onClick:()=>n("pirate"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:"🏴‍☠️ Pirate"}),e("button",{onClick:()=>n("royalty"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",children:"👑 Royalty"}),e("button",{onClick:()=>n("athlete"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors",children:"🏃 Athlete"}),e("button",{onClick:d,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors",children:"🎲 Randomize"}),e("button",{onClick:s,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"📋 Export"})]}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e("div",{class:"order-2 md:order-1",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Your Character"}),e("div",{class:`relative rounded-2xl ${r.v.background} p-8 min-h-[300px] flex items-center justify-center shadow-lg`,children:e("div",{class:"text-center",children:[e("div",{class:"text-8xl mb-4",children:r.v.face}),e("div",{class:"flex justify-center gap-4 text-5xl mb-4",children:[e("span",{children:r.v.hair}),e("span",{children:r.v.eyes})]}),e("div",{class:"flex justify-center gap-4 text-5xl",children:[e("span",{children:r.v.outfit}),e("span",{children:r.v.accessory})]})]})}),e("div",{class:"mt-3 text-xs text-gray-500 dark:text-gray-400 text-center",children:"💡 Select controls update character in real-time"})]}),e("div",{class:"order-1 md:order-2 space-y-3",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Customize"}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Face"}),e("select",{value:r.v.face,onChange:l=>a("face",l.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:I.face.map(l=>e("option",{value:l.value,selected:r.v.face===l.value,children:l.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Hair Style"}),e("select",{value:r.v.hair,onChange:l=>a("hair",l.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:I.hair.map(l=>e("option",{value:l.value,selected:r.v.hair===l.value,children:l.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Eyes / Eyewear"}),e("select",{value:r.v.eyes,onChange:l=>a("eyes",l.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:I.eyes.map(l=>e("option",{value:l.value,selected:r.v.eyes===l.value,children:l.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Outfit"}),e("select",{value:r.v.outfit,onChange:l=>a("outfit",l.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:I.outfit.map(l=>e("option",{value:l.value,selected:r.v.outfit===l.value,children:l.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Accessory"}),e("select",{value:r.v.accessory,onChange:l=>a("accessory",l.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:I.accessory.map(l=>e("option",{value:l.value,selected:r.v.accessory===l.value,children:l.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Background"}),e("select",{value:r.v.background,onChange:l=>a("background",l.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:I.background.map(l=>e("option",{value:l.value,selected:r.v.background===l.value,children:l.label}))})]})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"Select 동작 확인:"})," 각 드롭다운에서 옵션을 선택하면 onChange 이벤트가 발생하고, Lithent가 변경된 값을 감지하여 캐릭터 프리뷰를 즉시 업데이트합니다. selected 속성이 올바르게 동기화되는지 확인해보세요!"]})})]})}),gd=`import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface Character {
  face: string;
  hair: string;
  eyes: string;
  outfit: string;
}

const CharacterCreator = mount(r => {
  const character = state<Character>({
    face: '😊',
    hair: '🦰',
    eyes: '👀',
    outfit: '👔',
  }, r);

  const updateCharacter = (key: keyof Character, value: string) => {
    character.v = { ...character.v, [key]: value };
  };

  return () => (
    <>
      {/* Character Preview */}
      <div class="preview">
        <div>{character.v.face}</div>
        <div>{character.v.hair} {character.v.eyes}</div>
        <div>{character.v.outfit}</div>
      </div>

      {/* Select Controls */}
      <select
        value={character.v.face}
        onChange={(e) => updateCharacter('face', e.target.value)}
      >
        <option value="😊" selected={character.v.face === '😊'}>Happy</option>
        <option value="😎" selected={character.v.face === '😎'}>Cool</option>
        <option value="🤓" selected={character.v.face === '🤓'}>Nerdy</option>
      </select>

      <select
        value={character.v.hair}
        onChange={(e) => updateCharacter('hair', e.target.value)}
      >
        <option value="🦰" selected={character.v.hair === '🦰'}>Red Hair</option>
        <option value="🦱" selected={character.v.hair === '🦱'}>Curly</option>
        <option value="🦲" selected={character.v.hair === '🦲'}>Bald</option>
      </select>
    </>
  );
});
`,hd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Select Controls (Character Creator)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<select>"})," ","요소와"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"selected"})," ","속성이 올바르게 동작하는지 보여주는 이모지 기반 캐릭터 크리에이터 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent가 select 요소의 onChange 이벤트를 처리하고, selected 속성을 통해 현재 선택된 옵션을 정확하게 동기화하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"각 드롭다운에서 옵션을 선택하면 캐릭터가 실시간으로 변경됩니다. Preset 버튼이나 Randomize 기능으로 다양한 조합을 시도해보세요!"}),e(o,{language:"typescript",code:gd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(xd,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Select 요소의 핵심 동작"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"onChange 이벤트"}),": 사용자가 옵션을 선택하면 이벤트 핸들러가 즉시 실행됩니다"]}),e("li",{children:[e("strong",{children:"selected 속성"}),": 현재 상태값과 옵션의 value를 비교하여 selected 속성을 동적으로 설정"]}),e("li",{children:[e("strong",{children:"양방향 바인딩"}),": value prop으로 현재 선택값을 설정하고, onChange로 변경사항을 감지"]}),e("li",{children:[e("strong",{children:"상태 동기화"}),": Preset이나 Randomize처럼 프로그래밍 방식으로 상태를 변경해도 select가 올바르게 업데이트됨"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"주요 기능"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"다양한 커스터마이징 옵션"}),": 얼굴, 헤어, 눈, 옷, 악세사리, 배경을 각각 선택"]}),e("li",{children:[e("strong",{children:"Preset 시스템"}),": Developer, Pirate, Royalty, Athlete 프리셋 제공"]}),e("li",{children:[e("strong",{children:"Randomize 기능"}),": 랜덤하게 캐릭터 생성"]}),e("li",{children:[e("strong",{children:"Export 기능"}),": 캐릭터 데이터를 JSON으로 클립보드에 복사"]}),e("li",{children:[e("strong",{children:"실시간 프리뷰"}),": Select 변경 시 즉시 캐릭터 모습이 업데이트"]}),e("li",{children:[e("strong",{children:"그라디언트 배경"}),": Tailwind CSS 그라디언트로 다양한 분위기 연출"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"각 드롭다운에서 다양한 옵션을 선택하여 캐릭터가 즉시 변경되는지 확인"}),e("li",{children:"Preset 버튼을 클릭하여 모든 select가 한 번에 업데이트되는지 확인"}),e("li",{children:"Randomize로 무작위 조합 생성 후 각 select의 선택값이 올바른지 확인"}),e("li",{children:"같은 드롭다운을 여러 번 변경하여 selected 속성이 정확히 동기화되는지 확인"}),e("li",{children:"Export 버튼으로 현재 상태를 JSON으로 내보낼 수 있는지 테스트"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎨 왜 이모지 캐릭터인가?"}),e("p",{class:"text-sm text-purple-700 dark:text-purple-300 mb-2",children:"단순한 숫자나 텍스트 select 예제는 지루할 수 있습니다. 이모지를 사용하면 select의 동작을 테스트하면서도 시각적으로 즐거운 경험을 제공할 수 있습니다."}),e("p",{class:"text-xs text-purple-600 dark:text-purple-400 italic",children:"💡 참고: 실제 게임이나 앱의 아바타 시스템도 비슷한 방식으로 동작합니다. Select 대신 버튼이나 이미지 선택기를 사용할 수도 있지만, 핵심 로직은 동일합니다!"})]})]}),bd={modern:{gradient:"bg-gradient-to-br from-blue-500 to-purple-600",text:"text-white",accent:"text-blue-100"},classic:{gradient:"bg-gradient-to-br from-gray-800 to-gray-900",text:"text-white",accent:"text-gray-300"},minimal:{gradient:"bg-white dark:bg-gray-100",text:"text-gray-900",accent:"text-gray-600"},vibrant:{gradient:"bg-gradient-to-br from-pink-500 to-orange-500",text:"text-white",accent:"text-pink-100"}},ud={developer:{name:"Alex Johnson",title:"Full Stack Developer",company:"TechCorp Inc.",email:"alex@techcorp.com",phone:"+1 (555) 123-4567",website:"alexjohnson.dev",bio:"Passionate about building scalable web applications with modern technologies.",theme:"modern"},designer:{name:"Sarah Lee",title:"Creative Director",company:"Design Studio",email:"sarah@designstudio.io",phone:"+1 (555) 234-5678",website:"sarahlee.design",bio:"Creating beautiful and intuitive user experiences.",theme:"vibrant"},entrepreneur:{name:"Michael Chen",title:"CEO & Founder",company:"StartupXYZ",email:"michael@startupxyz.com",phone:"+1 (555) 345-6789",website:"startupxyz.com",bio:"Building the future of technology, one startup at a time.",theme:"classic"}},pd=E(t=>{const r=A({name:"Your Name",title:"Your Title",company:"Your Company",email:"email@example.com",phone:"+1 (555) 000-0000",website:"yourwebsite.com",bio:"Write a short bio about yourself...",theme:"modern"},t),a=(l,i)=>{r.v={...r.v,[l]:i}},n=l=>{r.v={...ud[l]}},d=()=>{r.v={name:"",title:"",company:"",email:"",phone:"",website:"",bio:"",theme:"modern"}},s=()=>{const l=JSON.stringify(r.v,null,2);navigator.clipboard.writeText(l),alert("명함 데이터가 클립보드에 복사되었습니다!")};return()=>{const l=bd[r.v.theme];return e("div",{class:"w-full max-w-5xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"💼 Business Card Generator"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"Create your digital business card with live preview"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>n("developer"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:"👨‍💻 Developer"}),e("button",{onClick:()=>n("designer"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors",children:"🎨 Designer"}),e("button",{onClick:()=>n("entrepreneur"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-800 transition-colors",children:"🚀 Entrepreneur"}),e("button",{onClick:d,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors",children:"🔄 Reset"}),e("button",{onClick:s,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"📋 Export"})]}),e("div",{class:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e("div",{class:"order-2 lg:order-1",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Card Preview"}),e("div",{class:"aspect-[1.6/1] max-w-md mx-auto",children:e("div",{class:`w-full h-full rounded-2xl shadow-2xl p-8 flex flex-col justify-between ${l.gradient}`,children:[e("div",{children:[e("h2",{class:`text-2xl font-bold mb-1 ${l.text} truncate`,children:r.v.name||"Your Name"}),e("p",{class:`text-sm ${l.accent} truncate`,children:r.v.title||"Your Title"}),e("p",{class:`text-sm font-medium ${l.text} truncate`,children:r.v.company||"Your Company"})]}),e("div",{class:`text-xs ${l.accent} space-y-1`,children:[e("p",{class:"truncate",children:["📧 ",r.v.email||"email@example.com"]}),e("p",{class:"truncate",children:["📱 ",r.v.phone||"+1 (555) 000-0000"]}),e("p",{class:"truncate",children:["🌐 ",r.v.website||"yourwebsite.com"]})]}),e("div",{class:`text-xs ${l.text} opacity-90 line-clamp-2`,children:r.v.bio||"Write a short bio..."})]})}),e("div",{class:"mt-3 text-xs text-gray-500 dark:text-gray-400 text-center",children:"💡 Input fields update the card in real-time"})]}),e("div",{class:"order-1 lg:order-2 space-y-3",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Card Information"}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Full Name"}),e("input",{type:"text",value:r.v.name,onInput:i=>a("name",i.target.value),placeholder:"Enter your name",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Job Title"}),e("input",{type:"text",value:r.v.title,onInput:i=>a("title",i.target.value),placeholder:"Enter your job title",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Company"}),e("input",{type:"text",value:r.v.company,onInput:i=>a("company",i.target.value),placeholder:"Enter your company name",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Email"}),e("input",{type:"email",value:r.v.email,onInput:i=>a("email",i.target.value),placeholder:"your@email.com",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Phone"}),e("input",{type:"tel",value:r.v.phone,onInput:i=>a("phone",i.target.value),placeholder:"+1 (555) 000-0000",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Website"}),e("input",{type:"url",value:r.v.website,onInput:i=>a("website",i.target.value),placeholder:"yourwebsite.com",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Bio (Short Description)"}),e("textarea",{value:r.v.bio,onInput:i=>a("bio",i.target.value),placeholder:"Write a short bio...",rows:3,class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883] resize-none"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Card Theme"}),e("div",{class:"grid grid-cols-2 gap-2",children:[e("button",{onClick:()=>a("theme","modern"),class:`px-3 py-2 rounded-lg text-xs font-medium transition-all ${r.v.theme==="modern"?"bg-blue-600 text-white ring-2 ring-blue-400":"bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`,children:"Modern"}),e("button",{onClick:()=>a("theme","classic"),class:`px-3 py-2 rounded-lg text-xs font-medium transition-all ${r.v.theme==="classic"?"bg-gray-800 text-white ring-2 ring-gray-600":"bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`,children:"Classic"}),e("button",{onClick:()=>a("theme","minimal"),class:`px-3 py-2 rounded-lg text-xs font-medium transition-all ${r.v.theme==="minimal"?"bg-white text-gray-900 ring-2 ring-gray-400":"bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`,children:"Minimal"}),e("button",{onClick:()=>a("theme","vibrant"),class:`px-3 py-2 rounded-lg text-xs font-medium transition-all ${r.v.theme==="vibrant"?"bg-pink-600 text-white ring-2 ring-pink-400":"bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`,children:"Vibrant"})]})]})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"Input 동작 확인:"})," 각 input 필드에 텍스트를 입력하면 onInput 이벤트가 발생하고, Lithent가 변경된 값을 감지하여 명함 프리뷰를 실시간으로 업데이트합니다. value 속성을 통해 양방향 바인딩이 올바르게 동작하는지 확인해보세요!"]})})]})}}),yd=`import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface BusinessCard {
  name: string;
  title: string;
  company: string;
  email: string;
}

const CardGenerator = mount(r => {
  const card = state<BusinessCard>({
    name: 'Your Name',
    title: 'Your Title',
    company: 'Your Company',
    email: 'email@example.com',
  }, r);

  const updateField = (field: keyof BusinessCard, value: string) => {
    card.v = { ...card.v, [field]: value };
  };

  return () => (
    <>
      {/* Card Preview */}
      <div class="card-preview">
        <h2>{card.v.name}</h2>
        <p>{card.v.title}</p>
        <p>{card.v.company}</p>
        <p>{card.v.email}</p>
      </div>

      {/* Input Fields */}
      <input
        type="text"
        value={card.v.name}
        onInput={(e) => updateField('name', e.target.value)}
        placeholder="Enter your name"
      />

      <input
        type="email"
        value={card.v.email}
        onInput={(e) => updateField('email', e.target.value)}
        placeholder="your@email.com"
      />
    </>
  );
});
`,kd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Input Controls (Business Card Generator)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<input>"})," ","요소와"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<textarea>"})," ","요소가 올바르게 동작하는지 보여주는 실시간 명함 생성기 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent가 input/textarea 요소의 onInput 이벤트를 처리하고, value 속성을 통해 양방향 바인딩을 정확하게 구현하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"각 input 필드에 텍스트를 입력하면 명함 프리뷰가 실시간으로 업데이트됩니다. Template 버튼으로 샘플 데이터를 불러오거나 직접 입력해보세요!"}),e(o,{language:"typescript",code:yd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(pd,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Input 요소의 핵심 동작"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"onInput 이벤트"}),": 사용자가 타이핑할 때마다 이벤트 핸들러가 즉시 실행됩니다"]}),e("li",{children:[e("strong",{children:"value 바인딩"}),": value prop으로 현재 입력값을 설정하여 양방향 바인딩 구현"]}),e("li",{children:[e("strong",{children:"다양한 input 타입"}),": text, email, tel, url 등 다양한 타입의 input 지원"]}),e("li",{children:[e("strong",{children:"textarea 지원"}),": 여러 줄 텍스트 입력도 동일한 방식으로 동작"]}),e("li",{children:[e("strong",{children:"실시간 동기화"}),": Template 로드 시 모든 input 필드가 즉시 업데이트됨"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"주요 기능"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"7가지 입력 필드"}),": Name, Title, Company, Email, Phone, Website, Bio"]}),e("li",{children:[e("strong",{children:"Template 시스템"}),": Developer, Designer, Entrepreneur 프리셋"]}),e("li",{children:[e("strong",{children:"4가지 테마"}),": Modern, Classic, Minimal, Vibrant 스타일"]}),e("li",{children:[e("strong",{children:"실시간 프리뷰"}),": 명함 카드가 입력과 동시에 업데이트"]}),e("li",{children:[e("strong",{children:"Reset 기능"}),": 모든 필드를 한 번에 초기화"]}),e("li",{children:[e("strong",{children:"Export 기능"}),": 명함 데이터를 JSON으로 내보내기"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"각 input 필드에 텍스트를 입력하여 실시간 업데이트 확인"}),e("li",{children:"Template 버튼으로 모든 필드가 한 번에 채워지는지 확인"}),e("li",{children:"Email이나 Phone 같은 특수 input type이 올바르게 동작하는지 확인"}),e("li",{children:"Textarea에 여러 줄 텍스트를 입력하여 line-clamp 동작 확인"}),e("li",{children:"Theme 버튼으로 명함 스타일이 즉시 변경되는지 확인"}),e("li",{children:"Reset 후 모든 input 필드가 초기화되는지 확인"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-800 dark:text-green-200 mb-2",children:"💼 실용적인 예제"}),e("p",{class:"text-sm text-green-700 dark:text-green-300 mb-2",children:"이 명함 생성기는 단순한 데모를 넘어 실제로 사용 가능한 도구입니다. 네트워킹 이벤트에서 디지털 명함으로 사용하거나, 이메일 서명에 넣을 프로필 카드로 활용할 수 있습니다."}),e("p",{class:"text-xs text-green-600 dark:text-green-400 italic",children:"💡 참고: 실제 서비스에서는 입력값 검증(이메일 형식, 전화번호 형식 등)과 sanitization을 추가하는 것이 좋습니다. 또한 명함 디자인을 이미지나 PDF로 내보내는 기능도 구현할 수 있습니다!"})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 Input vs onChange vs onInput"}),e("p",{class:"text-sm text-purple-700 dark:text-purple-300",children:["Lithent는"," ",e("code",{class:"px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs",children:"onInput"}),"이벤트를 권장합니다."," ",e("code",{class:"px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs",children:"onChange"}),"는 포커스를 잃었을 때만 발생하지만,"," ",e("code",{class:"px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs",children:"onInput"}),"은 타이핑할 때마다 즉시 발생하여 더 반응적인 UI를 만들 수 있습니다."]})]})]}),Ce=[{id:"pepperoni",name:"Pepperoni",emoji:"🍕",price:2.5,calories:140,category:"meat"},{id:"sausage",name:"Sausage",emoji:"🌭",price:2.5,calories:130,category:"meat"},{id:"bacon",name:"Bacon",emoji:"🥓",price:3,calories:150,category:"meat"},{id:"ham",name:"Ham",emoji:"🍖",price:2.5,calories:110,category:"meat"},{id:"chicken",name:"Chicken",emoji:"🍗",price:3,calories:120,category:"meat"},{id:"mushroom",name:"Mushroom",emoji:"🍄",price:1.5,calories:20,category:"veggie"},{id:"olive",name:"Olive",emoji:"🫒",price:1.5,calories:30,category:"veggie"},{id:"pepper",name:"Bell Pepper",emoji:"🫑",price:1.5,calories:25,category:"veggie"},{id:"onion",name:"Onion",emoji:"🧅",price:1,calories:15,category:"veggie"},{id:"tomato",name:"Tomato",emoji:"🍅",price:1.5,calories:20,category:"veggie"},{id:"pineapple",name:"Pineapple",emoji:"🍍",price:2,calories:40,category:"veggie"},{id:"mozzarella",name:"Extra Mozzarella",emoji:"🧀",price:2,calories:80,category:"cheese"},{id:"cheddar",name:"Cheddar",emoji:"🧀",price:2,calories:90,category:"cheese"},{id:"parmesan",name:"Parmesan",emoji:"🧀",price:2.5,calories:85,category:"cheese"},{id:"basil",name:"Fresh Basil",emoji:"🌿",price:1,calories:5,category:"sauce"},{id:"garlic",name:"Garlic",emoji:"🧄",price:1,calories:10,category:"sauce"},{id:"hotpepper",name:"Hot Pepper",emoji:"🌶️",price:1.5,calories:15,category:"sauce"}],fd={pepperoni:["pepperoni","mozzarella"],veggie:["mushroom","olive","pepper","onion","tomato","mozzarella"],meatLovers:["pepperoni","sausage","bacon","ham","mozzarella"],hawaiian:["ham","pineapple","mozzarella"],supreme:["pepperoni","sausage","mushroom","olive","pepper","onion","mozzarella"]},vd=E(t=>{const r=A(["pepperoni","mozzarella"],t),a=A("medium",t),n=A("regular",t),d={small:8.99,medium:12.99,large:16.99},s=c=>{r.v.includes(c)?r.v=r.v.filter(p=>p!==c):r.v=[...r.v,c]},l=c=>{r.v=[...fd[c]]},i=()=>{r.v=[]};return()=>{const c=Ce.filter(x=>r.v.includes(x.id)),p=c.reduce((x,O)=>x+O.price,0),m=d[a.v]+p,g=c.reduce((x,O)=>x+O.calories,0)+200,y={meat:Ce.filter(x=>x.category==="meat"),veggie:Ce.filter(x=>x.category==="veggie"),cheese:Ce.filter(x=>x.category==="cheese"),sauce:Ce.filter(x=>x.category==="sauce")};return e("div",{class:"w-full max-w-6xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"🍕 Pizza Builder"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"Build your perfect pizza with checkboxes and radio buttons"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>l("pepperoni"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors",children:"🍕 Pepperoni"}),e("button",{onClick:()=>l("veggie"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors",children:"🥗 Veggie"}),e("button",{onClick:()=>l("meatLovers"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-700 hover:bg-orange-800 transition-colors",children:"🥩 Meat Lovers"}),e("button",{onClick:()=>l("hawaiian"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors",children:"🏝️ Hawaiian"}),e("button",{onClick:()=>l("supreme"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",children:"👑 Supreme"}),e("button",{onClick:i,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"🗑️ Clear All"})]}),e("div",{class:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e("div",{class:"order-2 lg:order-1 space-y-4",children:[e("div",{children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Your Pizza"}),e("div",{class:"bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900 dark:to-orange-900 rounded-full aspect-square p-8 flex items-center justify-center shadow-2xl",children:e("div",{class:"text-center",children:[e("div",{class:"text-6xl mb-2",children:"🍕"}),e("div",{class:"flex flex-wrap justify-center gap-1 max-w-xs",children:c.map(x=>e("span",{class:"text-2xl",title:x.name,children:x.emoji}))}),e("div",{class:"mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200",children:[a.v.charAt(0).toUpperCase()+a.v.slice(1)," ·"," ",n.v.charAt(0).toUpperCase()+n.v.slice(1)," Crust"]})]})})]}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Order Summary"}),e("div",{class:"space-y-2 text-sm",children:[e("div",{class:"flex justify-between text-gray-600 dark:text-gray-400",children:[e("span",{children:[a.v.charAt(0).toUpperCase()+a.v.slice(1)," Pizza (",n.v," crust)"]}),e("span",{children:["$",d[a.v].toFixed(2)]})]}),c.length>0&&e("div",{class:"text-gray-600 dark:text-gray-400",children:[e("div",{class:"font-medium mb-1",children:"Toppings:"}),c.map(x=>e("div",{class:"flex justify-between pl-3",children:[e("span",{children:[x.emoji," ",x.name]}),e("span",{children:["$",x.price.toFixed(2)]})]}))]}),e("div",{class:"border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-gray-900 dark:text-white text-base",children:[e("span",{children:"Total"}),e("span",{children:["$",m.toFixed(2)]})]})]}),e("div",{class:"mt-4 pt-4 border-t border-gray-300 dark:border-gray-600",children:e("div",{class:"text-xs text-gray-600 dark:text-gray-400 space-y-1",children:[e("div",{class:"font-semibold mb-1",children:"Nutrition Info (approx.)"}),e("div",{children:["🔥 Calories: ~",g]}),e("div",{children:["🧈 Toppings: ",c.length]})]})})]})]}),e("div",{class:"order-1 lg:order-2 space-y-4",children:[e("div",{children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Size"}),e("div",{class:"flex gap-3",children:[e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"size",value:"small",checked:a.v==="small",onChange:x=>{a.v=x.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Small ($8.99)"})]}),e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"size",value:"medium",checked:a.v==="medium",onChange:x=>{a.v=x.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Medium ($12.99)"})]}),e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"size",value:"large",checked:a.v==="large",onChange:x=>{a.v=x.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Large ($16.99)"})]})]})]}),e("div",{children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Crust"}),e("div",{class:"flex gap-3",children:[e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"crust",value:"thin",checked:n.v==="thin",onChange:x=>{n.v=x.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Thin"})]}),e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"crust",value:"regular",checked:n.v==="regular",onChange:x=>{n.v=x.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Regular"})]}),e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"crust",value:"thick",checked:n.v==="thick",onChange:x=>{n.v=x.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Thick"})]})]})]}),e("div",{children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Toppings"}),e("div",{class:"mb-3",children:[e("div",{class:"text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1",children:"🥩 Meat"}),e("div",{class:"grid grid-cols-2 gap-2",children:y.meat.map(x=>e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"checkbox",value:x.id,checked:r.v.includes(x.id),onChange:()=>s(x.id),class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:[x.emoji," ",x.name," ",e("span",{class:"text-xs text-gray-500",children:["(+$",x.price,")"]})]})]}))})]}),e("div",{class:"mb-3",children:[e("div",{class:"text-xs font-semibold text-green-600 dark:text-green-400 mb-1",children:"🥗 Vegetables"}),e("div",{class:"grid grid-cols-2 gap-2",children:y.veggie.map(x=>e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"checkbox",value:x.id,checked:r.v.includes(x.id),onChange:()=>s(x.id),class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:[x.emoji," ",x.name," ",e("span",{class:"text-xs text-gray-500",children:["(+$",x.price,")"]})]})]}))})]}),e("div",{class:"mb-3",children:[e("div",{class:"text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1",children:"🧀 Cheese"}),e("div",{class:"grid grid-cols-2 gap-2",children:y.cheese.map(x=>e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"checkbox",value:x.id,checked:r.v.includes(x.id),onChange:()=>s(x.id),class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:[x.emoji," ",x.name," ",e("span",{class:"text-xs text-gray-500",children:["(+$",x.price,")"]})]})]}))})]}),e("div",{children:[e("div",{class:"text-xs font-semibold text-red-600 dark:text-red-400 mb-1",children:"🌶️ Extras"}),e("div",{class:"grid grid-cols-2 gap-2",children:y.sauce.map(x=>e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"checkbox",value:x.id,checked:r.v.includes(x.id),onChange:()=>s(x.id),class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:[x.emoji," ",x.name," ",e("span",{class:"text-xs text-gray-500",children:["(+$",x.price,")"]})]})]}))})]})]})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"Checkbox & Radio 동작 확인:"})," 체크박스는 여러 토핑을 동시에 선택할 수 있고(다중 선택), 라디오 버튼은 크기와 크러스트에서 하나만 선택할 수 있습니다(단일 선택). Lithent가 checked 속성을 올바르게 동기화하고 onChange 이벤트를 정확히 처리하는지 확인해보세요!"]})})]})}}),wd=`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const PizzaBuilder = mount(r => {
  const selectedToppings = state<string[]>(['pepperoni', 'mozzarella'], r);
  const size = state<'small' | 'medium' | 'large'>('medium', r);
  const crust = state<'thin' | 'regular' | 'thick'>('regular', r);

  const toggleTopping = (toppingId: string) => {
    if (selectedToppings.v.includes(toppingId)) {
      selectedToppings.v = selectedToppings.v.filter(id => id !== toppingId);
    } else {
      selectedToppings.v = [...selectedToppings.v, toppingId];
    }
  };

  return () => (
    <>
      {/* Radio Buttons - Single Selection */}
      <input
        type="radio"
        name="size"
        value="small"
        checked={size.v === 'small'}
        onChange={(e) => {
          size.v = e.target.value as 'small' | 'medium' | 'large';
        }}
      /> Small

      <input
        type="radio"
        name="size"
        value="medium"
        checked={size.v === 'medium'}
        onChange={(e) => {
          size.v = e.target.value as 'small' | 'medium' | 'large';
        }}
      /> Medium

      {/* Checkboxes - Multiple Selection */}
      <input
        type="checkbox"
        value="pepperoni"
        checked={selectedToppings.v.includes('pepperoni')}
        onChange={() => toggleTopping('pepperoni')}
      /> Pepperoni

      <input
        type="checkbox"
        value="mushroom"
        checked={selectedToppings.v.includes('mushroom')}
        onChange={() => toggleTopping('mushroom')}
      /> Mushroom
    </>
  );
});
`,Cd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Checkbox & Radio Controls (Pizza Builder)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'<input type="checkbox">'})," ","와"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'<input type="radio">'})," ","요소가 올바르게 동작하는지 보여주는 인터랙티브 피자 빌더 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent가 체크박스의 다중 선택과 라디오 버튼의 단일 선택을 정확하게 처리하고, checked 속성을 올바르게 동기화하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"토핑 체크박스를 선택하면 여러 개를 동시에 선택할 수 있고, 피자 크기나 크러스트는 라디오 버튼으로 하나만 선택할 수 있습니다. 실시간으로 가격이 계산되고 피자 프리뷰가 업데이트됩니다!"}),e(o,{language:"typescript",code:wd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(vd,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Checkbox의 핵심 동작"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"다중 선택"}),": 여러 체크박스를 동시에 선택할 수 있습니다"]}),e("li",{children:[e("strong",{children:"onChange 이벤트"}),": 체크박스를 클릭할 때마다 이벤트 핸들러가 실행됩니다"]}),e("li",{children:[e("strong",{children:"checked 속성"}),": 배열에 값이 포함되어 있는지 확인하여 checked 상태를 결정"]}),e("li",{children:[e("strong",{children:"배열 상태 관리"}),": 선택된 값들을 배열로 관리하며, 추가/제거 시 불변성을 유지"]}),e("li",{children:[e("strong",{children:"value 속성"}),": 각 체크박스의 고유한 값을 식별하는데 사용됩니다"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Radio Button의 핵심 동작"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"단일 선택"}),": 같은 name 속성을 가진 라디오 버튼 중 하나만 선택 가능"]}),e("li",{children:[e("strong",{children:"name 그룹화"}),": name 속성으로 라디오 버튼을 그룹화하여 상호 배타적 선택 구현"]}),e("li",{children:[e("strong",{children:"onChange 이벤트"}),": 라디오 버튼을 선택하면 이벤트 핸들러가 실행됩니다"]}),e("li",{children:[e("strong",{children:"checked 속성"}),": 현재 상태값과 라디오 버튼의 value를 비교하여 checked 상태 결정"]}),e("li",{children:[e("strong",{children:"자동 해제"}),": 같은 그룹의 다른 라디오 버튼을 선택하면 이전 선택이 자동으로 해제됨"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"주요 기능"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"17가지 토핑"}),": 고기, 야채, 치즈, 엑스트라로 분류된 다양한 토핑"]}),e("li",{children:[e("strong",{children:"5가지 프리셋"}),": Pepperoni, Veggie, Meat Lovers, Hawaiian, Supreme"]}),e("li",{children:[e("strong",{children:"3가지 크기"}),": Small, Medium, Large (라디오 버튼)"]}),e("li",{children:[e("strong",{children:"3가지 크러스트"}),": Thin, Regular, Thick (라디오 버튼)"]}),e("li",{children:[e("strong",{children:"실시간 가격 계산"}),": 기본 가격 + 토핑 가격 자동 합산"]}),e("li",{children:[e("strong",{children:"영양 정보"}),": 선택한 토핑의 칼로리 총합 표시"]}),e("li",{children:[e("strong",{children:"비주얼 프리뷰"}),": 선택한 토핑의 이모지가 피자 위에 표시됨"]}),e("li",{children:[e("strong",{children:"Clear All 기능"}),": 모든 토핑 선택 해제"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"여러 토핑 체크박스를 동시에 선택하여 다중 선택이 잘 되는지 확인"}),e("li",{children:"체크박스를 다시 클릭하여 선택 해제가 올바르게 동작하는지 확인"}),e("li",{children:"라디오 버튼으로 크기를 변경하면 이전 선택이 자동으로 해제되는지 확인"}),e("li",{children:"Preset 버튼으로 여러 체크박스가 한 번에 선택/해제되는지 확인"}),e("li",{children:"Clear All로 모든 체크박스가 해제되는지 확인 (라디오는 유지)"}),e("li",{children:"가격과 칼로리가 선택에 따라 실시간으로 업데이트되는지 확인"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800",children:[e("h3",{class:"text-base font-semibold text-orange-800 dark:text-orange-200 mb-2",children:"🍕 왜 피자 빌더인가?"}),e("p",{class:"text-sm text-orange-700 dark:text-orange-300 mb-2",children:"체크박스와 라디오 버튼의 차이를 가장 직관적으로 이해할 수 있는 예제입니다. 토핑은 여러 개를 선택할 수 있지만(체크박스), 크기와 크러스트는 하나만 선택할 수 있다는(라디오) 실생활의 경험과 일치합니다."}),e("p",{class:"text-xs text-orange-600 dark:text-orange-400 italic",children:"💡 참고: 실제 피자 주문 앱도 비슷한 패턴을 사용합니다. 이 예제는 단순히 폼 컨트롤을 테스트하는 것을 넘어, 실용적인 UI 패턴을 배울 수 있는 교육 자료이기도 합니다!"})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 Checkbox vs Radio Button"}),e("div",{class:"text-sm text-purple-700 dark:text-purple-300 space-y-2",children:[e("div",{children:[e("strong",{children:"Checkbox"}),": 독립적인 선택 항목. 각 체크박스는 다른 체크박스와 무관하게 선택/해제 가능. 배열로 상태 관리."]}),e("div",{children:[e("strong",{children:"Radio Button"}),": 상호 배타적 선택. 같은 name을 가진 라디오 중 하나만 선택 가능. 단일 값으로 상태 관리."]}),e("div",{class:"text-xs text-purple-600 dark:text-purple-400 italic mt-2",children:'💡 팁: name 속성을 사용하지 않으면 라디오 버튼이 제대로 그룹화되지 않아 여러 개를 동시에 선택할 수 있게 됩니다. 이 예제에서 name="size"와 name="crust"로 두 그룹을 분리했습니다.'})]})]})]}),N=[{id:"new1",author:"Sarah Chen",avatar:"👩‍💻",content:"Just shipped a new feature with Lithent! The virtual DOM performance is amazing 🚀",time:"2 min ago",likes:42,type:"user"},{id:"new2",author:"Alex Rivera",avatar:"🧑‍🎨",content:"Hot take: Mixing real DOM and virtual DOM is actually a superpower for progressive enhancement",time:"5 min ago",likes:28,type:"trending"},{id:"new3",author:"Jordan Kim",avatar:"🧑‍🚀",content:"Anyone else loving how lightweight Lithent is? No more bloated bundles!",time:"8 min ago",likes:67,type:"user"}],Md=E(t=>{const r=A([!0,!0,!0],t),a=s=>{r.v=r.v.map((l,i)=>i===s?!l:l)},n=()=>{r.v=[!0,!0,!0]},d=()=>{r.v=[!1,!1,!1]};return()=>e(_,{children:[e("div",{class:"sticky top-0 z-10 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 mb-3",children:[e("div",{class:"flex items-center gap-2 mb-2",children:e("span",{class:"text-xs font-semibold text-blue-800 dark:text-blue-200",children:"🔄 실시간 포스트 (가상 DOM)"})}),e("div",{class:"flex flex-wrap gap-2",children:[e("button",{onClick:()=>a(0),class:`px-2 py-1 text-xs rounded ${r.v[0]?"bg-blue-600 text-white":"bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}`,children:"Post 1"}),e("button",{onClick:()=>a(1),class:`px-2 py-1 text-xs rounded ${r.v[1]?"bg-orange-600 text-white":"bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}`,children:"Post 2 (Trending)"}),e("button",{onClick:()=>a(2),class:`px-2 py-1 text-xs rounded ${r.v[2]?"bg-blue-600 text-white":"bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}`,children:"Post 3"}),e("div",{class:"flex-1"}),e("button",{onClick:n,class:"px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700",children:"전체 보기"}),e("button",{onClick:d,class:"px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700",children:"전체 숨기기"})]})]}),r.v[0]&&e("article",{class:"bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-blue-500 shadow-sm animate-fade-in",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:N[0].avatar}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:N[0].author}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:["· ",N[0].time]}),e("span",{class:"px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded",children:"가상 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:N[0].content}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:["❤️ ",N[0].likes]}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"}),e("button",{class:"hover:text-green-500",children:"🔄 Repost"})]})]})]})}),r.v[1]&&e("article",{class:"bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-4 mb-3 border-l-4 border-orange-500 shadow-sm animate-fade-in",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:N[1].avatar}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:N[1].author}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:["· ",N[1].time]}),e("span",{class:"px-1.5 py-0.5 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded",children:"🔥 Trending"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded",children:"가상 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:N[1].content}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:["❤️ ",N[1].likes]}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"}),e("button",{class:"hover:text-green-500",children:"🔄 Repost"})]})]})]})}),r.v[2]&&e("article",{class:"bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-blue-500 shadow-sm animate-fade-in",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:N[2].avatar}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:N[2].author}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:["· ",N[2].time]}),e("span",{class:"px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded",children:"가상 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:N[2].content}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:["❤️ ",N[2].likes]}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"}),e("button",{class:"hover:text-green-500",children:"🔄 Repost"})]})]})]})})]})}),Td=E(()=>{const t=Y(null),r=Y(null);return ae(()=>{const a=t.value,n=r.value;De(e(Md,{}),a,n)}),()=>e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"📱 Social Media Timeline"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"실제 DOM (서버 렌더링)과 가상 DOM (클라이언트 렌더링)이 혼합된 타임라인"})]}),e("div",{ref:t,class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto",children:[e("article",{class:"bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-3 border-l-4 border-purple-500 shadow-sm",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:"📌"}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:"Lithent Team"}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:"· 1 hour ago"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded",children:"Pinned"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:"Welcome to our feed! This post is server-rendered (real DOM) and always stays at the top."}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:"❤️ 156"}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"})]})]})]})}),e("article",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-gray-400 shadow-sm",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:"👤"}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:"Previous User"}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:"· 15 min ago"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:"This is an older post that was server-rendered. It's part of the initial HTML."}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:"❤️ 23"}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"})]})]})]})}),e("article",{ref:r,class:"bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3 border-l-4 border-green-500 shadow-sm",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:"📢"}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:"Sponsored"}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:"· Ad"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:"This sponsored post is also real DOM - it stays in place regardless of what happens above!"}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:e("button",{class:"hover:text-blue-500",children:"Learn More →"})})]})]})}),e("article",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-gray-400 shadow-sm",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:"📜"}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:"Archive"}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:"· 2 hours ago"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:"Older content that's part of the initial page load. Real DOM element."}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:"❤️ 8"}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"})]})]})]})})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"혼합 DOM 테스트:"})," 컨트롤 패널의 버튼으로 중간의 포스트들을 토글하세요. 실제 DOM 요소(상단 Pinned, 하단 Sponsored, Archive)는 그대로 유지되고, 그 사이에 가상 DOM 포스트들이 동적으로 추가/제거됩니다. Lithent가 실제 DOM과 가상 DOM을 올바르게 혼합 관리하는지 확인하세요!"]})}),e("style",{children:`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `})]})}),Sd=`import { mount, Fragment, render, ref, mountCallback } from 'lithent';
import { state } from 'lithent/helper';

// 동적 포스트 컴포넌트 (가상 DOM)
const DynamicPosts = mount(r => {
  const visiblePosts = state<boolean[]>([true, true, true], r);

  const togglePost = (index: number) => {
    visiblePosts.v = visiblePosts.v.map((v, i) => (i === index ? !v : v));
  };

  return () => (
    <Fragment>
      {/* 컨트롤 패널 */}
      <div>Controls...</div>

      {/* 조건부 포스트들 */}
      {visiblePosts.v[0] && <article>Post 1 (가상 DOM)</article>}
      {visiblePosts.v[1] && <article>Post 2 (가상 DOM)</article>}
      {visiblePosts.v[2] && <article>Post 3 (가상 DOM)</article>}
    </Fragment>
  );
});

// 메인 컴포넌트
const Timeline = mount(() => {
  const feedContainer = ref<null | HTMLElement>(null);
  const insertionPoint = ref<null | HTMLElement>(null);

  mountCallback(() => {
    // 가상 DOM을 실제 DOM 사이에 삽입
    render(<DynamicPosts />, feedContainer.value, insertionPoint.value);
  });

  return () => (
    <div ref={feedContainer}>
      {/* 상단: 실제 DOM */}
      <article>Pinned Post (실제 DOM)</article>
      <article>Older Post (실제 DOM)</article>

      {/* 중간: 가상 DOM이 여기 삽입됨 */}

      {/* 하단: 실제 DOM */}
      <article ref={insertionPoint}>Sponsored (실제 DOM)</article>
      <article>Archive (실제 DOM)</article>
    </div>
  );
});
`,Ed=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mixed DOM Elements (Social Media Timeline)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:"실제 DOM 요소와 가상 DOM 요소가 하나의 부모 아래에 혼합되어 있을 때 Lithent가 올바르게 처리할 수 있는지 테스트하는 예제입니다."}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Progressive Enhancement와 SSR(서버 사이드 렌더링) 시나리오를 시뮬레이션"}),"합니다. 서버에서 렌더링된 정적 콘텐츠(실제 DOM)와 클라이언트에서 동적으로 추가되는 인터랙티브 콘텐츠(가상 DOM)가 공존하는 상황을 재현합니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"소셜 미디어 타임라인에서 고정 포스트, 광고, 아카이브는 서버에서 렌더링된 실제 DOM이고, 그 사이의 실시간 포스트들은 Lithent로 관리되는 가상 DOM입니다. 버튼을 눌러 중간의 포스트를 토글하면서 실제 DOM이 영향받지 않는지 확인하세요!"}),e(o,{language:"typescript",code:Sd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Td,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"render() 함수의 insertBefore 모드"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"기본 모드"}),":"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"render(<Component />, parentElement)"})," ","- 부모 요소의 끝에 추가"]}),e("li",{children:[e("strong",{children:"insertBefore 모드"}),":"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"render(<Component />, parentElement, nextElement)"})," ","- nextElement 앞에 삽입"]}),e("li",{children:[e("strong",{children:"Fragment 사용"}),": 여러 요소를 그룹화하여 한 번에 삽입"]}),e("li",{children:[e("strong",{children:"실제 DOM 보존"}),": 기존 실제 DOM 요소는 수정되지 않고 그대로 유지됨"]}),e("li",{children:[e("strong",{children:"동적 업데이트"}),": 가상 DOM 요소만 선택적으로 추가/제거 가능"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"DOM 구조"}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs overflow-x-auto",children:e("pre",{class:"text-gray-800 dark:text-gray-200",children:`<div> (feedContainer)
  <!-- 실제 DOM: 서버 렌더링 -->
  <article>📌 Pinned Post (실제 DOM)</article>
  <article>👤 Previous User (실제 DOM)</article>

  <!-- 가상 DOM: Lithent가 여기에 삽입 -->
  <div>🔄 컨트롤 패널 (가상 DOM)</div>
  <article>👩‍💻 Sarah Chen (가상 DOM)</article>  <!-- 토글 가능 -->
  <article>🧑‍🎨 Alex Rivera (가상 DOM)</article> <!-- 토글 가능 -->
  <article>🧑‍🚀 Jordan Kim (가상 DOM)</article>   <!-- 토글 가능 -->

  <!-- 실제 DOM: 서버 렌더링 (insertionPoint) -->
  <article>📢 Sponsored (실제 DOM)</article>
  <article>📜 Archive (실제 DOM)</article>
</div>`})})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"핵심 개념"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"Progressive Enhancement"}),": 기본 콘텐츠는 서버에서 렌더링하고, 인터랙티브 기능을 클라이언트에서 추가"]}),e("li",{children:[e("strong",{children:"Hydration과의 차이"}),": Hydration은 기존 DOM에 이벤트를 연결하지만, 이 예제는 새로운 DOM을 기존 DOM 사이에 삽입"]}),e("li",{children:[e("strong",{children:"ref 활용"}),": ref로 실제 DOM 요소의 참조를 얻어 render() 함수에 전달"]}),e("li",{children:[e("strong",{children:"mountCallback"}),": 컴포넌트가 마운트된 후 ref 값이 설정되면 실행됨"]}),e("li",{children:[e("strong",{children:"독립적 업데이트"}),": 가상 DOM 부분만 재렌더링되고 실제 DOM은 영향받지 않음"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"개별 포스트 버튼을 눌러 중간의 가상 DOM 포스트가 사라지는지 확인"}),e("li",{children:"포스트를 숨겼다가 다시 표시할 때 실제 DOM(Pinned, Sponsored, Archive)이 그대로인지 확인"}),e("li",{children:'"전체 숨기기"로 모든 가상 DOM을 제거해도 실제 DOM은 유지되는지 확인'}),e("li",{children:'"전체 보기"로 가상 DOM이 올바른 위치(실제 DOM 사이)에 다시 삽입되는지 확인'}),e("li",{children:"페이지 스크롤을 통해 컨트롤 패널이 sticky로 상단에 고정되는지 확인"}),e("li",{children:"fade-in 애니메이션이 포스트 추가 시 작동하는지 확인"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-800 dark:text-green-200 mb-2",children:"🌟 실전 활용 사례"}),e("p",{class:"text-sm text-green-700 dark:text-green-300 mb-2",children:"이 패턴은 다음과 같은 실제 시나리오에서 매우 유용합니다:"}),e("ul",{class:"text-sm text-green-700 dark:text-green-300 space-y-1 ml-4",children:[e("li",{children:["• ",e("strong",{children:"블로그 댓글"}),": 기존 댓글(SSR)과 새로운 댓글(클라이언트 추가)"]}),e("li",{children:["• ",e("strong",{children:"전자상거래"}),": 정적 상품 목록에 동적 필터/정렬 UI 추가"]}),e("li",{children:["• ",e("strong",{children:"뉴스 피드"}),": 고정 기사와 실시간 업데이트 기사 혼합"]}),e("li",{children:["• ",e("strong",{children:"관리자 패널"}),": 서버 렌더링 테이블에 인라인 편집 기능 추가"]})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 왜 이게 중요한가?"}),e("p",{class:"text-sm text-purple-700 dark:text-purple-300 mb-2",children:'많은 가상 DOM 라이브러리는 전체 컨테이너를 장악하려 합니다. 하지만 Lithent는 실제 프로젝트에서 흔히 마주치는 "점진적 마이그레이션" 시나리오를 지원합니다.'}),e("p",{class:"text-xs text-purple-600 dark:text-purple-400 italic",children:'💡 기존 서버 렌더링 앱에 Lithent를 도입할 때, 전체를 다시 작성할 필요 없이 필요한 부분만 가상 DOM으로 교체할 수 있습니다. 이것이 바로 "Progressive Enhancement"의 진정한 의미입니다!'})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800",children:[e("h3",{class:"text-base font-semibold text-orange-800 dark:text-orange-200 mb-2",children:"⚠️ 주의사항"}),e("ul",{class:"text-sm text-orange-700 dark:text-orange-300 space-y-1",children:[e("li",{children:"• insertBefore 모드를 사용할 때는 nextElement가 반드시 parentElement의 자식이어야 합니다"}),e("li",{children:"• 실제 DOM 요소를 직접 수정하면 Lithent의 가상 DOM 추적에서 벗어날 수 있습니다"}),e("li",{children:"• ref 값은 mountCallback 이후에만 사용 가능합니다"}),e("li",{children:"• 같은 위치에 여러 번 render()를 호출하면 이전 가상 DOM이 교체됩니다"})]})]})]}),Jt=[{id:1,name:"Kim Family",partySize:4,waitTime:15,vip:!1,emoji:"👨‍👩‍👧‍👦"},{id:2,name:"Sarah & Alex",partySize:2,waitTime:10,vip:!0,emoji:"💑"},{id:3,name:"Chen Party",partySize:6,waitTime:25,vip:!1,emoji:"👥"},{id:4,name:"Jordan",partySize:1,waitTime:5,vip:!1,emoji:"🧑"}],Dd=E(t=>{const r=A([...Jt],t),a=A(5,t),n=()=>{r.v=[...r.v].sort((m,g)=>m.waitTime-g.waitTime)},d=()=>{r.v=[...r.v].sort((m,g)=>g.partySize-m.partySize)},s=()=>{r.v=[...r.v].sort((m,g)=>m.vip&&!g.vip?-1:!m.vip&&g.vip?1:0)},l=()=>{r.v=[...r.v].reverse()},i=m=>{r.v=r.v.filter(g=>g.id!==m)},c=()=>{const m=["Park Family","Taylor","Martinez Party","Lee & Kim","Johnson"],g=["👨‍👩‍👧","🧑‍🦰","👨‍👩‍👦‍👦","👫","🧑‍🦱"],y=m[Math.floor(Math.random()*m.length)],x=g[Math.floor(Math.random()*g.length)];r.v=[...r.v,{id:a.v,name:y,partySize:Math.floor(Math.random()*6)+1,waitTime:Math.floor(Math.random()*30)+5,vip:Math.random()>.7,emoji:x}],a.v+=1},p=()=>{r.v=[...Jt],a.v=5};return()=>e(_,{children:[e("div",{class:"bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 mb-3 rounded",children:[e("div",{class:"flex items-center gap-2 mb-2",children:e("span",{class:"text-xs font-semibold text-orange-800 dark:text-orange-200",children:"🎛️ Waitlist Controls (가상 DOM)"})}),e("div",{class:"flex flex-wrap gap-2",children:[e("button",{onClick:n,class:"px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700",children:"⏱️ By Wait Time"}),e("button",{onClick:d,class:"px-2 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700",children:"👥 By Party Size"}),e("button",{onClick:s,class:"px-2 py-1 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700",children:"⭐ VIP First"}),e("button",{onClick:l,class:"px-2 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-700",children:"🔄 Reverse"}),e("button",{onClick:c,class:"px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700",children:"➕ Add Guest"}),e("button",{onClick:p,class:"px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700",children:"🔄 Reset"})]})]}),r.v.map((m,g)=>e("div",{class:`rounded-lg p-3 mb-2 border-l-4 shadow-sm transition-all duration-300 ${m.vip?"bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-500":"bg-white dark:bg-gray-800 border-blue-500"}`,children:e("div",{class:"flex items-center justify-between",children:[e("div",{class:"flex items-center gap-3 flex-1",children:[e("div",{class:"text-2xl",children:m.emoji}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2",children:[e("span",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:["#",g+1," ",m.name]}),m.vip&&e("span",{class:"px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded",children:"⭐ VIP"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded",children:["ID: ",m.id]})]}),e("div",{class:"flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1",children:[e("span",{children:["👥 Party of ",m.partySize]}),e("span",{children:"•"}),e("span",{children:["⏱️ ~",m.waitTime," min"]})]})]})]}),e("button",{onClick:()=>i(m.id),class:"px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 ml-2",children:"📢 Call"})]})},m.id)),r.v.length===0&&e("div",{class:"text-center py-8 text-gray-500 dark:text-gray-400",children:[e("div",{class:"text-4xl mb-2",children:"🎉"}),e("p",{class:"text-sm",children:"No guests waiting! All tables are ready."})]})]})}),Od=E(()=>{const t=Y(null),r=Y(null);return ae(()=>{const a=t.value,n=r.value;De(e(Dd,{}),a,n)}),()=>e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"🍽️ Restaurant Waitlist Manager"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"실제 DOM과 가상 DOM이 혼합된 상태에서 리스트 업데이트 테스트"})]}),e("div",{ref:t,class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[700px] overflow-y-auto",children:[e("div",{class:"bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-3 border-l-4 border-purple-500",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-2xl",children:"ℹ️"}),e("div",{children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm mb-1",children:"Welcome to Lithent Restaurant"}),e("p",{class:"text-xs text-gray-700 dark:text-gray-300",children:"Thank you for waiting! We'll call your name when your table is ready."}),e("span",{class:"inline-block mt-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM (고정)"})]})]})}),e("div",{ref:r,class:"bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3 border-l-4 border-green-500",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-2xl",children:"🎁"}),e("div",{children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm mb-1",children:"Special Offer!"}),e("p",{class:"text-xs text-gray-700 dark:text-gray-300",children:"Get 10% off your meal if you join our rewards program today!"}),e("span",{class:"inline-block mt-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM (고정)"})]})]})}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-gray-400",children:e("div",{class:"flex items-center gap-2",children:[e("div",{class:"text-xl",children:"📞"}),e("div",{class:"text-xs text-gray-700 dark:text-gray-300",children:[e("p",{class:"font-semibold",children:"Contact: (555) 123-4567"}),e("p",{class:"text-gray-600 dark:text-gray-400",children:"Hours: 11AM - 10PM Daily"})]}),e("span",{class:"ml-auto px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM (고정)"})]})})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"리스트 + 혼합 DOM 테스트:"})," 대기 목록을 정렬하거나 역순으로 바꿔보세요. Lithent가 key 기반으로 DOM 요소를 올바르게 재정렬하고, 실제 DOM(Welcome, Special Offer, Contact)은 영향받지 않는지 확인하세요! Call 버튼으로 손님을 호출하면 리스트에서 제거됩니다."]})})]})}),Rd=`import { mount, Fragment, render, ref, mountCallback } from 'lithent';
import { state } from 'lithent/helper';

interface Guest {
  id: number;
  name: string;
  partySize: number;
  waitTime: number;
  vip: boolean;
}

// 동적 대기 목록 컴포넌트 (가상 DOM)
const WaitlistManager = mount(r => {
  const guests = state<Guest[]>([...initialGuests], r);

  const sortByWaitTime = () => {
    guests.v = [...guests.v].sort((a, b) => a.waitTime - b.waitTime);
  };

  const reverseOrder = () => {
    guests.v = [...guests.v].reverse();
  };

  const callGuest = (id: number) => {
    guests.v = guests.v.filter(g => g.id !== id);
  };

  return () => (
    <Fragment>
      {/* 컨트롤 패널 */}
      <div>
        <button onClick={sortByWaitTime}>By Wait Time</button>
        <button onClick={reverseOrder}>Reverse</button>
      </div>

      {/* key 기반 리스트 */}
      {guests.v.map((guest, index) => (
        <div key={guest.id}>
          #{index + 1} {guest.name}
          <button onClick={() => callGuest(guest.id)}>Call</button>
        </div>
      ))}
    </Fragment>
  );
});

// 메인 컴포넌트
const RestaurantApp = mount(() => {
  const containerRef = ref<null | HTMLElement>(null);
  const insertionPointRef = ref<null | HTMLElement>(null);

  mountCallback(() => {
    // 가상 DOM을 실제 DOM 사이에 삽입
    render(<WaitlistManager />, containerRef.value, insertionPointRef.value);
  });

  return () => (
    <div ref={containerRef}>
      {/* 상단: 실제 DOM */}
      <div>Welcome Message (실제 DOM)</div>

      {/* 중간: 가상 DOM 리스트가 여기 삽입됨 */}

      {/* 하단: 실제 DOM */}
      <div ref={insertionPointRef}>Special Offer (실제 DOM)</div>
      <div>Footer (실제 DOM)</div>
    </div>
  );
});
`,Id=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mixed DOM with Loop (Restaurant Waitlist)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["실제 DOM과 가상 DOM이 혼합된 상태에서 ",e("strong",{children:"루프(리스트) 요소"}),"를 올바르게 처리할 수 있는지 테스트하는 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는 Example 12의 확장판으로,"," ",e("strong",{children:"key 기반 리스트가 실제 DOM 사이에서 동적으로 정렬, 추가, 제거될 때 Lithent의 diff 알고리즘이 올바르게 동작하는지 검증"}),"합니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"레스토랑 대기 목록에서 손님을 대기 시간순, 파티 크기순, VIP 우선순으로 정렬하거나 역순으로 바꿔보세요. Lithent가 key를 기반으로 DOM 요소를 효율적으로 재정렬하고, 주변의 실제 DOM은 영향받지 않는지 확인할 수 있습니다!"}),e(o,{language:"typescript",code:Rd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Od,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"핵심 테스트 포인트"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"key 기반 diff"}),": 리스트가 정렬될 때 key를 기반으로 기존 DOM 요소를 재사용"]}),e("li",{children:[e("strong",{children:"효율적인 재정렬"}),": 전체를 다시 렌더링하지 않고 위치만 변경"]}),e("li",{children:[e("strong",{children:"혼합 DOM 보존"}),": 리스트 업데이트 시 주변 실제 DOM(Welcome, Special Offer, Footer)은 그대로 유지"]}),e("li",{children:[e("strong",{children:"동적 추가/제거"}),": 새 손님 추가, Call 버튼으로 제거 시 올바른 위치에 삽입/제거"]}),e("li",{children:[e("strong",{children:"Fragment 활용"}),": 컨트롤 패널 + 리스트를 Fragment로 그룹화하여 단일 삽입 지점 사용"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"리스트 조작 기능"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-3",children:[e("div",{class:"bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1",children:"⏱️ By Wait Time"}),e("p",{class:"text-xs text-blue-700 dark:text-blue-300",children:"대기 시간이 짧은 순서로 정렬 (5분 → 25분)"})]}),e("div",{class:"bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800",children:[e("h4",{class:"text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1",children:"👥 By Party Size"}),e("p",{class:"text-xs text-purple-700 dark:text-purple-300",children:"파티 크기가 큰 순서로 정렬 (6명 → 1명)"})]}),e("div",{class:"bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800",children:[e("h4",{class:"text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1",children:"⭐ VIP First"}),e("p",{class:"text-xs text-yellow-700 dark:text-yellow-300",children:"VIP 손님을 맨 앞으로 우선 배치"})]}),e("div",{class:"bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700",children:[e("h4",{class:"text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1",children:"🔄 Reverse"}),e("p",{class:"text-xs text-gray-700 dark:text-gray-300",children:"현재 순서를 역순으로 뒤집기"})]}),e("div",{class:"bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800",children:[e("h4",{class:"text-sm font-semibold text-green-800 dark:text-green-200 mb-1",children:"➕ Add Guest"}),e("p",{class:"text-xs text-green-700 dark:text-green-300",children:"랜덤한 새 손님을 대기 목록에 추가"})]}),e("div",{class:"bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800",children:[e("h4",{class:"text-sm font-semibold text-red-800 dark:text-red-200 mb-1",children:"📢 Call"}),e("p",{class:"text-xs text-red-700 dark:text-red-300",children:"개별 손님을 호출하여 목록에서 제거"})]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"DOM 구조"}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs overflow-x-auto",children:e("pre",{class:"text-gray-800 dark:text-gray-200",children:`<div> (containerRef)
  <!-- 실제 DOM: 상단 안내 -->
  <div>ℹ️ Welcome to Lithent Restaurant (실제 DOM)</div>

  <!-- 가상 DOM: Fragment로 그룹화된 리스트 -->
  <div>🎛️ Waitlist Controls (가상 DOM)</div>
  <div key={1}>#1 Kim Family (가상 DOM)</div>      <!-- 정렬 가능 -->
  <div key={2}>#2 Sarah & Alex (가상 DOM)</div>    <!-- 정렬 가능 -->
  <div key={3}>#3 Chen Party (가상 DOM)</div>      <!-- 정렬 가능 -->
  <div key={4}>#4 Jordan (가상 DOM)</div>          <!-- 정렬 가능 -->

  <!-- 실제 DOM: 하단 광고 & 푸터 (insertionPointRef) -->
  <div>🎁 Special Offer! (실제 DOM)</div>
  <div>📞 Contact Info (실제 DOM)</div>
</div>`})})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:'"By Wait Time" 버튼을 눌러 대기 시간순으로 정렬 → 순서가 바뀌는지 확인'}),e("li",{children:'"Reverse" 버튼을 여러 번 눌러 리스트가 역순으로 뒤집히는지 확인'}),e("li",{children:'"VIP First" 버튼으로 VIP(Sarah & Alex)가 맨 앞으로 가는지 확인'}),e("li",{children:"정렬 중에도 상단 Welcome과 하단 Special Offer/Contact가 그대로인지 확인"}),e("li",{children:'"Call" 버튼으로 손님을 제거 → 나머지 손님의 번호(#1, #2...)가 자동으로 업데이트되는지 확인'}),e("li",{children:'"Add Guest"로 새 손님 추가 → 목록 맨 뒤에 추가되는지 확인'}),e("li",{children:'모든 손님을 Call하면 "No guests waiting!" 메시지가 나타나는지 확인'}),e("li",{children:"ID 배지를 보면서 정렬 시 같은 손님(같은 ID)이 이동하는지 확인"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800",children:[e("h3",{class:"text-base font-semibold text-orange-800 dark:text-orange-200 mb-2",children:"🍽️ 왜 레스토랑 대기 목록인가?"}),e("p",{class:"text-sm text-orange-700 dark:text-orange-300 mb-2",children:"실제 레스토랑 대기 목록 시스템은 다음과 같은 요구사항이 있습니다:"}),e("ul",{class:"text-sm text-orange-700 dark:text-orange-300 space-y-1 ml-4",children:[e("li",{children:"• 대기 시간, 파티 크기, VIP 여부에 따른 우선순위 정렬"}),e("li",{children:"• 손님 호출 시 목록에서 실시간 제거"}),e("li",{children:"• 새로운 손님 등록 시 즉시 목록에 추가"}),e("li",{children:"• 정렬이 바뀌어도 각 손님의 정보(ID, 이름 등)는 유지"})]}),e("p",{class:"text-xs text-orange-600 dark:text-orange-400 italic mt-2",children:'💡 이런 복잡한 리스트 조작은 key 기반 diff가 없으면 매번 전체를 다시 렌더링해야 합니다. Lithent는 key를 통해 "같은 손님"을 추적하고 위치만 변경하여 성능을 최적화합니다!'})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 Example 12 vs Example 13"}),e("div",{class:"text-sm text-purple-700 dark:text-purple-300 space-y-2",children:[e("div",{children:[e("strong",{children:"Example 12 (Mixed DOM)"}),": 실제 DOM과 가상 DOM의 기본적인 혼합. 고정된 개수의 포스트를 토글(추가/제거)"]}),e("div",{children:[e("strong",{children:"Example 13 (Mixed DOM + Loop)"}),": 혼합 DOM에 더해",e("strong",{className:"text-purple-900 dark:text-purple-100",children:[" ","key 기반 리스트의 정렬, 재정렬, 동적 추가/제거"]}),"를 테스트"]}),e("div",{class:"text-xs text-purple-600 dark:text-purple-400 italic",children:'💡 Example 12가 "정적 혼합"이라면, Example 13은 "동적 리스트 혼합"입니다. 실제 앱에서는 두 패턴을 모두 사용합니다!'})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-800 dark:text-green-200 mb-2",children:"🌟 실전 활용 사례"}),e("ul",{class:"text-sm text-green-700 dark:text-green-300 space-y-1 ml-4",children:[e("li",{children:["• ",e("strong",{children:"TODO 리스트"}),": 완료/미완료, 우선순위별 정렬"]}),e("li",{children:["• ",e("strong",{children:"대시보드 테이블"}),": 데이터 정렬, 필터링, 페이지네이션"]}),e("li",{children:["• ",e("strong",{children:"채팅 메시지"}),": 새 메시지 추가, 오래된 메시지는 서버 렌더링"]}),e("li",{children:["• ",e("strong",{children:"쇼핑 카트"}),": 상품 추가/제거, 수량 변경, 가격순 정렬"]}),e("li",{children:["• ",e("strong",{children:"티켓팅 시스템"}),": 우선순위별 정렬, 상태 변경"]})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("h3",{class:"text-base font-semibold text-blue-800 dark:text-blue-200 mb-2",children:"⚡ 성능 최적화 포인트"}),e("ul",{class:"text-sm text-blue-700 dark:text-blue-300 space-y-1",children:[e("li",{children:["• ",e("strong",{children:"key 사용"}),": 각 손님에게 고유한 ID를 key로 설정하여 DOM 재사용"]}),e("li",{children:["• ",e("strong",{children:"불변성 유지"}),":"," ",e("code",{class:"px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs",children:"[...guests.v].sort()"})," ","로 새 배열 생성"]}),e("li",{children:["• ",e("strong",{children:"선택적 업데이트"}),": 정렬 시 DOM 요소의 위치만 변경, 내용은 재렌더링하지 않음"]}),e("li",{children:["• ",e("strong",{children:"Fragment 활용"}),": 여러 요소를 그룹화하여 단일 삽입 지점 사용"]})]})]})]}),Pd=[{id:"w1",name:"Iron Sword",icon:"⚔️",rarity:"common"},{id:"w2",name:"Magic Staff",icon:"🪄",rarity:"rare"},{id:"w3",name:"Dragon Blade",icon:"🗡️",rarity:"legendary"}],Ad=[{id:"a1",name:"Leather Armor",icon:"🛡️",rarity:"common"},{id:"a2",name:"Steel Helmet",icon:"⛑️",rarity:"rare"}],Ld=[{id:"p1",name:"Health Potion",icon:"🧪",rarity:"common"},{id:"p2",name:"Mana Potion",icon:"💙",rarity:"rare"},{id:"p3",name:"Elixir of Life",icon:"✨",rarity:"epic"}],Nd=E((t,r)=>{ae(()=>{const n=r.logEl.value;if(n){const d=n.parentElement;d&&(n.innerHTML+=`<span class="text-blue-400">📦 ${r.item.name} equipped</span><br>`,d.scrollTop=d.scrollHeight)}return()=>{const d=r.logEl.value;if(d){const s=d.parentElement;s&&(d.innerHTML+=`<span class="text-orange-400">❌ ${r.item.name} unequipped</span><br>`,s.scrollTop=s.scrollHeight)}}});const a={common:"bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",rare:"bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700",epic:"bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700",legendary:"bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-500"};return()=>e("div",{class:`flex items-center gap-2 p-2 rounded border ${a[r.item.rarity]}`,children:[e("span",{class:"text-2xl",children:r.item.icon}),e("span",{class:"text-xs font-medium text-gray-700 dark:text-gray-300",children:r.item.name})]})}),et=E((t,r)=>(ae(()=>{const a=r.logEl.value;if(a){const n=a.parentElement;n&&(a.innerHTML+=`<span class="text-green-400">📂 ${r.title} category opened</span><br>`,n.scrollTop=n.scrollHeight)}return()=>{const n=r.logEl.value;if(n){const d=n.parentElement;d&&(n.innerHTML+=`<span class="text-red-400">🗂️ ${r.title} category closed</span><br>`,d.scrollTop=d.scrollHeight)}}}),()=>e("div",{class:"mb-3",children:[e("div",{class:"flex items-center gap-2 mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded",children:[e("span",{class:"text-xl",children:r.icon}),e("h4",{class:"text-sm font-semibold text-gray-900 dark:text-white",children:r.title}),e("span",{class:"ml-auto text-xs text-gray-500 dark:text-gray-400",children:[r.items.length," items"]})]}),e("div",{class:"grid grid-cols-2 gap-2 pl-4",children:r.items.map(a=>e("div",{children:e(Nd,{item:a,logEl:r.logEl})},a.id))})]}))),_d=E((t,r)=>(ae(()=>{const a=r.logEl.value;if(a){const n=a.parentElement;n&&(a.innerHTML+='<span class="text-purple-400 font-bold">🎒 Inventory system initialized</span><br>',n.scrollTop=n.scrollHeight)}return()=>{const n=r.logEl.value;if(n){const d=n.parentElement;d&&(n.innerHTML+='<span class="text-pink-400 font-bold">🎒 Inventory system shutdown</span><br>',d.scrollTop=d.scrollHeight)}}}),()=>e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700",children:[e("div",{class:"flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700",children:[e("span",{class:"text-2xl",children:"🎒"}),e("h3",{class:"text-base font-bold text-gray-900 dark:text-white",children:"Game Inventory"})]}),e(et,{title:"Weapons",icon:"⚔️",items:Pd,logEl:r.logEl}),e(et,{title:"Armor",icon:"🛡️",items:Ad,logEl:r.logEl}),e(et,{title:"Potions",icon:"🧪",items:Ld,logEl:r.logEl})]}))),Hd=E(t=>{const r=A(!0,t),a=Y(null),n=()=>{r.v=!r.v},d=()=>{a.value&&(a.value.innerHTML="")};return()=>e("div",{class:"w-full max-w-3xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"🎮 Game Inventory System"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"중첩된 컴포넌트의 mount/unmount 콜백 테스트"})]}),e("div",{class:"flex gap-2 mb-4",children:[e("button",{onClick:n,class:`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${r.v?"bg-red-600 text-white hover:bg-red-700":"bg-green-600 text-white hover:bg-green-700"}`,children:r.v?"🎒 Close Inventory":"🎒 Open Inventory"}),e("button",{onClick:d,class:"px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 font-medium",children:"🗑️ Clear Log"})]}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e("div",{class:"order-2 md:order-1",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Inventory View"}),r.v?e(_d,{logEl:a}):e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700",children:[e("div",{class:"text-4xl mb-2",children:"🔒"}),e("p",{class:"text-sm text-gray-600 dark:text-gray-400",children:"Inventory is closed"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-500 mt-1",children:'Click "Open Inventory" to view items'})]})]}),e("div",{class:"order-1 md:order-2",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Lifecycle Log"}),e("div",{class:"bg-gray-900 rounded-lg p-4 h-[400px] overflow-y-auto border border-gray-700",children:e("div",{ref:a,class:"text-xs font-mono leading-relaxed"})}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400 mt-2",children:"💡 Watch how nested components mount and unmount in order"})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("p",{class:"text-xs text-blue-800 dark:text-blue-200 mb-2",children:["💡 ",e("strong",{children:"중첩된 언마운트 테스트:"}),' "Close Inventory" 버튼을 누르면 다음 순서로 cleanup이 실행됩니다:']}),e("ol",{class:"text-xs text-blue-700 dark:text-blue-300 ml-4 space-y-1",children:[e("li",{children:["1. ",e("strong",{children:"Inventory system shutdown"})," (Depth 1 - 부모)"]}),e("li",{children:["2. ",e("strong",{children:"Weapons category closed"})," → 해당 카테고리의 모든 아이템 unequipped"]}),e("li",{children:["3. ",e("strong",{children:"Armor category closed"})," → 해당 카테고리의 모든 아이템 unequipped"]}),e("li",{children:["4. ",e("strong",{children:"Potions category closed"})," → 해당 카테고리의 모든 아이템 unequipped"]})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h4",{class:"text-xs font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 컴포넌트 계층 구조"}),e("div",{class:"text-xs font-mono text-purple-700 dark:text-purple-300 leading-relaxed",children:[e("div",{children:"Inventory (Depth 1)"}),e("div",{class:"ml-4",children:"├─ Weapons Category (Depth 2)"}),e("div",{class:"ml-8",children:"│ ├─ Iron Sword (Depth 3)"}),e("div",{class:"ml-8",children:"│ ├─ Magic Staff (Depth 3)"}),e("div",{class:"ml-8",children:"│ └─ Dragon Blade (Depth 3)"}),e("div",{class:"ml-4",children:"├─ Armor Category (Depth 2)"}),e("div",{class:"ml-8",children:"│ ├─ Leather Armor (Depth 3)"}),e("div",{class:"ml-8",children:"│ └─ Steel Helmet (Depth 3)"}),e("div",{class:"ml-4",children:"└─ Potions Category (Depth 2)"}),e("div",{class:"ml-8",children:"├─ Health Potion (Depth 3)"}),e("div",{class:"ml-8",children:"├─ Mana Potion (Depth 3)"}),e("div",{class:"ml-8",children:"└─ Elixir of Life (Depth 3)"})]})]})]})}),Ud=E(()=>()=>e("div",{children:[e("h1",{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4",children:"Example 14: Nested Component Unmount Callbacks"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-6",children:["이 예제는 중첩된 컴포넌트 계층에서 ",e("code",{children:"mountCallback"}),"의 cleanup 함수가 어떤 순서로 실행되는지 테스트합니다. 컴포넌트 트리가 언마운트될 때, 부모에서 자식으로 cleanup이 전파되는지 확인할 수 있습니다."]}),e("div",{class:"my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"💡 테스트 요점"}),e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:[e("strong",{children:"Nested Unmount Callbacks"}),": 부모 컴포넌트가 언마운트될 때, 자식 컴포넌트들의 cleanup 함수도 올바른 순서로 실행되는지 확인합니다. 이는 메모리 누수 방지와 리소스 정리에 중요합니다."]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"컴포넌트 구조"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:"이 예제는 3단계 중첩 구조를 가진 게임 인벤토리 시스템입니다:"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"Depth 1 (Inventory)"}),': 전체 인벤토리 시스템 - "🎒 Inventory system initialized/shutdown" 로그']}),e("li",{children:[e("strong",{children:"Depth 2 (InventoryCategory)"}),': 무기/방어구/포션 카테고리 - "📂 Category opened/closed" 로그']}),e("li",{children:[e("strong",{children:"Depth 3 (ItemSlot)"}),': 개별 아이템 (총 8개) - "📦 Item equipped/unequipped" 로그']})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"코드 예제"}),e(o,{code:`// Depth 3: 개별 아이템 컴포넌트
const ItemSlot = mount<{
  item: Item;
  logEl: { value: HTMLElement | null };
}>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    if (ele) {
      ele.innerHTML += \`<span>📦 \${props.item.name} equipped</span><br>\`;
    }

    // cleanup 함수: 언마운트 시 실행
    return () => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        ele.innerHTML += \`<span>❌ \${props.item.name} unequipped</span><br>\`;
      }
    };
  });

  return () => (
    <div class="flex items-center gap-2 p-2 rounded border">
      <span class="text-2xl">{props.item.icon}</span>
      <span class="text-xs">{props.item.name}</span>
    </div>
  );
});

// Depth 2: 카테고리 컴포넌트
const InventoryCategory = mount<{
  title: string;
  items: Item[];
  logEl: { value: HTMLElement | null };
}>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    if (ele) {
      ele.innerHTML += \`<span>📂 \${props.title} category opened</span><br>\`;
    }

    return () => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        ele.innerHTML += \`<span>🗂️ \${props.title} category closed</span><br>\`;
      }
    };
  });

  return () => (
    <div>
      <h4>{props.title}</h4>
      {props.items.map(item => (
        <ItemSlot key={item.id} item={item} logEl={props.logEl} />
      ))}
    </div>
  );
});

// Depth 1: 인벤토리 컴포넌트
const Inventory = mount<{ logEl: { value: HTMLElement | null } }>(
  (_r, props) => {
    mountCallback(() => {
      const ele = props.logEl.value as HTMLElement;
      if (ele) {
        ele.innerHTML += \`<span>🎒 Inventory system initialized</span><br>\`;
      }

      return () => {
        const ele = props.logEl.value as HTMLElement;
        if (ele) {
          ele.innerHTML += \`<span>🎒 Inventory system shutdown</span><br>\`;
        }
      };
    });

    return () => (
      <div>
        <InventoryCategory title="Weapons" items={weaponItems} logEl={props.logEl} />
        <InventoryCategory title="Armor" items={armorItems} logEl={props.logEl} />
        <InventoryCategory title="Potions" items={potionItems} logEl={props.logEl} />
      </div>
    );
  }
);`,language:"tsx"}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"Unmount 순서"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:'"Close Inventory" 버튼을 클릭하면 다음 순서로 cleanup이 실행됩니다:'}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6",children:e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:[e("strong",{children:"🎒 Inventory system shutdown"})," (Depth 1 - 부모 컴포넌트)"]}),e("li",{children:[e("strong",{children:"🗂️ Weapons category closed"})," (Depth 2)"]}),e("li",{children:[e("strong",{children:"❌ Iron Sword unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Magic Staff unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Dragon Blade unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"🗂️ Armor category closed"})," (Depth 2)"]}),e("li",{children:[e("strong",{children:"❌ Leather Armor unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Steel Helmet unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"🗂️ Potions category closed"})," (Depth 2)"]}),e("li",{children:[e("strong",{children:"❌ Health Potion unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Mana Potion unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Elixir of Life unequipped"})," (Depth 3)"]})]})}),e("div",{class:"my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"🎯 핵심 개념"}),e("ul",{class:"text-sm text-purple-800 dark:text-purple-200 space-y-2",children:[e("li",{children:[e("strong",{children:"부모 우선 정리:"})," 부모 컴포넌트의 cleanup이 먼저 실행되고, 그 다음 자식들의 cleanup이 실행됩니다."]}),e("li",{children:[e("strong",{children:"깊이 우선 탐색(DFS):"})," 각 자식 컴포넌트의 cleanup이 실행된 후, 그 자식의 모든 하위 컴포넌트들이 cleanup됩니다. 예를 들어, Weapons 카테고리가 닫히면 그 카테고리의 모든 아이템이 언마운트된 후 다음 카테고리로 진행됩니다."]}),e("li",{children:[e("strong",{children:"리소스 정리:"})," 이벤트 리스너, 타이머, 구독 등을 정리하는 데 활용할 수 있습니다."]}),e("li",{children:[e("strong",{children:"메모리 누수 방지:"})," 올바른 cleanup 순서는 메모리 누수를 방지하는 데 중요합니다."]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실행 예제"}),e("div",{class:"my-8",children:e(Hd,{})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"테스트 시나리오"}),e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"1️⃣ 기본 언마운트 테스트"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:'"Open Inventory" 버튼을 클릭하여 인벤토리를 엽니다'}),e("li",{children:"Lifecycle Log에서 초기화 메시지들을 확인합니다 (Inventory system initialized → Categories opened → Items equipped)"}),e("li",{children:'"Close Inventory" 버튼을 클릭합니다'}),e("li",{children:"Lifecycle Log에서 cleanup 순서를 확인합니다 (Inventory shutdown → Categories closed → Items unequipped)"})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"2️⃣ 반복 마운트/언마운트 테스트"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:"Open/Close 버튼을 여러 번 반복해서 클릭합니다"}),e("li",{children:"매번 동일한 순서로 mount/unmount가 실행되는지 로그를 확인합니다"}),e("li",{children:"메모리 누수 없이 깔끔하게 정리되는지 확인합니다"})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"3️⃣ 계층 구조 시각화"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:'하단의 "컴포넌트 계층 구조" 섹션을 참고합니다'}),e("li",{children:"3단계 중첩 구조를 이해합니다 (Inventory → Category → ItemSlot)"}),e("li",{children:"총 12개의 cleanup 함수가 실행됨을 확인합니다 (1 + 3 + 8)"})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실전 활용 사례"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"이벤트 리스너 정리:"})," 컴포넌트가 언마운트될 때 등록한 이벤트 리스너를 제거"]}),e("li",{children:[e("strong",{children:"타이머 정리:"})," setInterval, setTimeout 등의 타이머 정리"]}),e("li",{children:[e("strong",{children:"WebSocket 연결 종료:"})," 실시간 통신 연결을 안전하게 종료"]}),e("li",{children:[e("strong",{children:"애니메이션 취소:"})," requestAnimationFrame 등의 애니메이션 정리"]}),e("li",{children:[e("strong",{children:"구독 해제:"})," 옵저버 패턴에서 구독을 해제하여 메모리 누수 방지"]})]}),e("div",{class:"my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2",children:"⚠️ 주의사항"}),e("ul",{class:"text-sm text-yellow-800 dark:text-yellow-200 space-y-2",children:[e("li",{children:"cleanup 함수는 컴포넌트가 DOM에서 제거되기 전에 실행됩니다."}),e("li",{children:"cleanup 함수 내에서 state를 변경하면 예상치 못한 동작이 발생할 수 있으니 주의하세요."}),e("li",{children:"cleanup 함수는 순수 정리 로직만 포함해야 하며, 새로운 부작용을 일으키지 않아야 합니다."}),e("li",{children:"비동기 작업이 있다면, cleanup 함수에서 취소하거나 완료를 기다리지 않도록 처리해야 합니다."})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"관련 예제"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("a",{href:"/examples/4",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/examples/4"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Example 4: Effect Lifecycle"})," ","- effect cleanup과 비교"]}),e("li",{children:[e("a",{href:"/guide/mount-hooks",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/mount-hooks"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Mount Hooks 가이드"})," ","- mountCallback 기본 사용법"]})]})]})),Bd=t=>t.replace(/\/+$/,"")||"/guide/introduction",Fd={"/guide/introduction":Ar,"/guide/quick-start":il,"/guide/mounter":cl,"/guide/updater":ml,"/guide/props":xl,"/guide/children":gl,"/guide/renewer":hl,"/guide/render":bl,"/guide/portal":ul,"/guide/next-tick":Il,"/guide/mount-hooks":pl,"/guide/update-hooks":yl,"/guide/mount-ready-hooks":kl,"/guide/use-renew-hooks":fl,"/guide/state":vl,"/guide/lstate":wl,"/guide/computed":Cl,"/guide/effect":Ml,"/guide/store":Tl,"/guide/lstore":Sl,"/guide/state-ref":El,"/guide/context":Dl,"/guide/lcontext":Ol,"/guide/cache-update":Rl,"/guide/vite-plugin":Pl,"/guide/jsx-manual":Al,"/guide/ftags":Ll,"/guide/htm-tags":Nl,"/guide/template-strings":_l,"/examples/1":Bl,"/examples/2":zl,"/examples/3":ql,"/examples/4":Ql,"/examples/5":rd,"/examples/6":dd,"/examples/7":cd,"/examples/8":hd,"/examples/9":kd,"/examples/10":Cd,"/examples/12":Ed,"/examples/13":Id,"/examples/14":Ud},$d=E(t=>{const r=Xe.watch(t);return()=>{const a=Bd(r.route),n=Fd[a]||Ar;return e("div",{class:"min-h-screen bg-white dark:bg-[#1b1b1f] transition-colors",children:[e(rn,{}),e("div",{class:"mx-auto max-w-[1440px]",children:e("div",{class:"flex",children:[e(an,{}),e("main",{class:"flex-1 w-full min-w-0 px-6 md:px-12 py-8",children:e("div",{class:"max-w-full md:max-w-[43rem]",children:e(n,{})})})]})})]})}});De(e($d,{}),document.body);
//# sourceMappingURL=index-CWYhG1cD.js.map
