(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&n(d)}).observe(document,{childList:!0,subtree:!0});function a(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(o){if(o.ep)return;o.ep=!0;const s=a(o);fetch(o.href,s)}})();const De=Symbol.for("lithentWDomSymbol"),Ee={value:""},ke={value:null},ue={value:!1},H=new WeakMap,sr=new WeakSet,da=t=>{H.set(t,{vd:{value:null},up:()=>{},upR:[],upS:{value:0},upD:[],upCB:[],mts:[],umts:[],wdCB:[]})},le=()=>ke.value,it=(t,r)=>{const a=H.get(t);return a?a[r]:null},oa=t=>{ke.value=t},sa=t=>{ke.value=t,da(t)},ia=t=>{const r=H.get(t);r&&(r.umts.forEach(a=>a()),r.umts=[])},ne=t=>t.getParent&&t.getParent(),Ie=Object.entries,ir=Object.keys,Re=t=>typeof t=="object"&&t!==null,ze=Object.assign,fe=t=>Re(t)&&!("resolve"in t),He=(t,r)=>fe(t)&&t.type===r,ca=(t,r)=>"ctor"in t?t.ctor===(r&&r.ctor):t===(r&&r.ctor),ma=(t,r)=>!!(fe(t)&&r&&r.type==="f"&&r.children&&r.children.length===(t.children&&t.children.length)),xa=(t,r)=>!!(fe(t)&&r&&r.type==="e"&&r.tag===t.tag&&r.children&&r.children.length===(t.children&&t.children.length)),Rt=(t,r)=>!!(fe(t)&&r&&r.type===t.type),ga=(t,r)=>!!(fe(t)&&r&&r.type===t.type&&(pe((t.children||[])[0])&&pe((r.children||[])[0])||r.children&&t.children&&r.children.length===t.children.length)),Q=t=>(t&&t.compProps&&t.compProps.key)??(t&&t.props&&t.props.key),be=t=>t&&["f","l"].includes(t),Je=t=>typeof t=="function"&&!cr(t)||Re(t)&&"resolve"in t,cr=t=>typeof t=="function"&&t===L,ha=t=>fe(t)&&!t.type,pe=t=>mr(Q(t)),mr=t=>t!=null,At=(t,r)=>t==="style"&&Re(r),ua=(t,r)=>t==="ref"&&Re(r),ba=(t,r)=>{const a=Object.getOwnPropertyDescriptor(t.constructor.prototype,r);return a&&a.get&&a.set},pa=t=>Je(t)?"c":He(t,"f")?"f":He(t,"e")?"e":He(t,"l")?"l":He(t,"t")?"t":"et",ya={c:ca,l:ga,t:Rt,e:xa,f:ma,et:Rt},xr=t=>{const r=le();if(r){const a=H.get(r);a&&a.umts.push(t)}},We=t=>{const{compKey:r}=t;r&&ka(r),gr(t)},gr=t=>{(t.children||[]).forEach(r=>{r.compKey?We(r):gr(r)})},ka=t=>{ia(t),H.delete(t)};let ct=[];const fa=t=>{t.compKey&&ct.push(t)},yt=()=>{ct.forEach(t=>va(t)),ct=[]},te=t=>{const r=le();if(r){const a=H.get(r);a&&a.mts.push(t)}},va=t=>{const{compKey:r}=t;if(r){const a=H.get(r);if(!a)return;const{mts:n,upS:o}=a;ke.value=r,o&&(o.value=0),n&&(a.mts=[],n.forEach(s=>{const d=s();d&&xr(d)}))}},wa=t=>{const r=le();if(r){const a=H.get(r);a&&a.wdCB.push(t)}},Ca=t=>{const{compKey:r}=t;if(r){const a=H.get(r),n=a&&a.wdCB;ke.value=r,n&&n.length>0&&(a.wdCB=[],n.forEach(o=>{const s=o();s&&typeof s=="function"&&xr(s)}))}},Nt=(t,r=()=>[])=>{const a=le();if(!a)return;const n=H.get(a);if(!n)return;const{upD:o,upS:s}=n,d=o[s.value],i=r();if(d&&Sa(d,i)){const c=t();c&&n.upCB.push(c)}o[s.value]=i,s.value+=1},Ma=t=>{const{compKey:r}=t;if(r){const a=H.get(r);if(!a)return;const{upCB:n,upS:o}=a;ke.value=r,o&&(o.value=0),t.ctor&&n&&(a.upCB=[],n.forEach(s=>s()))}},Sa=(t,r)=>t.length?t.some((a,n)=>a!==r[n]):!0,kt=()=>new DocumentFragment,Ut=t=>document.createElement(t),ce=(t,r,a,n)=>{t.isRoot=!0,r=r||document.body,t.we=r;const o=Xe(t,n);return a?(t.ae=a,r.insertBefore(o,a)):r.tagName==="HTML"?r.replaceWith(o):r.appendChild(o),yt(),()=>{const s=H.get(t.compProps||{}),d=s&&s.vd.value||t;d!==t&&We(d),Ge(d),Ta(d)}},Ge=t=>{t.props&&t.el&&kr(t.props,t.el),(t.children||[]).forEach(r=>{Ge(r)})},Ta=t=>hr(t,t.we),ft=t=>{t.op&&t.el&&kr(t.op,t.el),hr(t,qe(ne(t)))},hr=(t,r)=>{r&&t.el&&(t.el.nodeType===11||(t==null?void 0:t.tag)==="portal"?ur(t):[1,3].includes(t.el.nodeType)&&r.removeChild(t.el),delete t.el)},ur=(t,r)=>{(t&&t.oc||t&&t.children||[]).forEach(a=>{const n=a.el&&a.el.nodeType;if(n)if([1,3].includes(n)){const o=a.el;o.tagName==="HTML"?o.innerHTML="":o.remove()}else n===11&&ur(a)})},br=t=>{ft(t),vt(t)},Ea=t=>{if(xt(t),ne(t).nr!=="L"){const r=pr(t);vt(t,r)}},vt=(t,r)=>{r||(r=Xe(t));const a=ne(t);if(a.type){const n=qe(a),o=a.type==="l"&&a.nr&&a.nr!=="L"?mt(a,ne(a)):mt(t,a);r&&n&&(t.tag!=="portal"&&(o?n.insertBefore(r,o):n.appendChild(r)),yt())}},pr=t=>be(t.type)?(t&&t.children||[]).reduce((r,a)=>{const n=pr(a);return n&&r.appendChild(n),r},kt()):t.el,mt=(t,r)=>{const a=r.children||[],n=a.indexOf(t)+1,o=a.slice(n),s=yr(o),d=r.type||"";if(s)return s;if(!r.isRoot&&be(d))return mt(r,ne(r));if(r.isRoot&&be(d)&&r.ae)return r.ae},yr=t=>t.reduce((r,a)=>{if(r)return r;const{type:n,el:o}=a;if(n&&be(n)){const s=yr(a.children||[]);if(s)return s}return o&&o.nodeType!==11?o:r},void 0),Da=t=>{const r=ne(t),a=t.el;if(r.type&&a)if(a.nodeType===11)br(t);else{const n=qe(r),o=Xe(t);n&&t.tag!=="portal"&&n.replaceChild(o,a),yt()}},kr=(t,r)=>{Ie(t||{}).forEach(([a,n])=>{a.match(/^on/)&&r.removeEventListener(a.slice(2).toLowerCase(),n)})},xt=t=>{if(t.type==="t"){Ia(t);return}if(t.el){const{op:r,props:a}=t;vr(a,t.el,r),delete t.op,t.tag==="input"&&(t.el.value=String(a&&a.value||""))}(t.children||[]).forEach(r=>fr(r)),Ma(t)},fr=t=>{const{nr:r}=t;r!==void 0&&r!=="N"&&(Pa[r](t),delete t.nr,delete t.oc,delete t.op)},Pa={A:vt,D:ft,R:Da,U:xt,S:br,T:Ea,L:xt},Ia=t=>{t.el&&(t.el.nodeValue=String(t.text))},vr=(t,r,a,n)=>{const o=a||{};Ie(t||{}).forEach(([s,d])=>{if(d===o[s]){delete o[s];return}s==="key"||d===o[s]||s==="portal"&&Re(d)||(s==="innerHTML"&&typeof d=="string"?r.innerHTML=d:At(s,d)?Aa(d,At(s,o.style)?o.style:{},r):ua(s,d)?d.value=r:s.match(/^on/)?Ra(r,s,d,o[s]):s&&(s!=="type"&&ba(r,s)?r[s]=d:Oa(s==="className"?"class":s,r,d))),delete o[s]}),ir(o).forEach(s=>r.removeAttribute(s))},Oa=(t,r,a)=>Ee.value&&t!=="xmlns"?r.setAttributeNS(null,t,a):r.setAttribute(t,a),Xe=(t,r)=>{let a;const{type:n,tag:o,text:s,props:d,children:i=[]}=t,c=be(n);return Ca(t),o==="svg"&&(Ee.value=String(d&&d.xmlns)),c?a=kt():n==="e"&&o?o==="portal"&&d&&d.portal?a=d.portal:a=Ee.value?document.createElementNS(Ee.value,o):Ut(o):n==="t"&&mr(s)?a=document.createTextNode(String(s)):a=Ut("e"),t.el=a,La(i,a,r),vr(d,a,null),fa(t),o==="svg"&&(Ee.value=""),a},La=(t,r,a)=>{const n=t.reduce((o,s)=>{if(s.type){const d=Xe(s,a);s.tag!=="portal"&&!a&&o.appendChild(d)}return o},kt());r&&n.hasChildNodes()&&r.appendChild(n)},Ra=(t,r,a,n)=>{const o=r.slice(2).toLowerCase();n!==a&&(n&&t.removeEventListener(o,n),a&&t.addEventListener(o,a))},Aa=(t,r,a)=>{const n={...r},o=a instanceof HTMLElement?a:null,s=o==null?void 0:o.style;if(!s)return;const d=s;Ie(t).forEach(([i,c])=>{d[i]=c,delete n[i]}),Ie(n).forEach(([i])=>{d[i]=""})},qe=t=>{const r=be(t.type);return t.isRoot&&r?t.we:r?qe(ne(t)):t.el},Ke=(t,r)=>Na(t,ya[pa(t)](t,r),r),Na=(t,r,a)=>{const n=ja(t,r,a),o=Ha(n,r,a),s=o==="N";return s||(n.children=Va(n,r,a)),n.nr=o,Ua(n,a,o),!s&&a&&(a.il=!0,delete a.children),(a==null?void 0:a.tag)==="portal"&&(n.tag="portal"),n},Ua=(t,r,a)=>{a!=="A"&&r&&(t.el=r.el),(a==="D"||a==="R"||a==="S")&&(r&&(We(r),Ge(r)),t.oc=r&&r.children),t.op=r&&r.props},Ha=(t,r,a)=>{if(ha(t))return"D";if(t.type==="t"&&r&&t.text===(a&&a.text)||t===a)return"N";if(!(a&&a.type))return"A";const n=ne(a),o=!t.isRoot&&n&&n.type==="l"&&pe(t);let s=r?o?"T":"U":o?"S":"R";return t.type==="l"&&s==="U"&&a&&_a(t,a)&&(s="L"),s},_a=(t,r)=>{if(!pe((t.children||[])[0])||!pe((r.children||[])[0]))return!1;const a=[...r&&r.children||[]],n=[...t&&t.children||[]].filter(d=>a.find(i=>Q(d)===Q(i))),o=a.filter(d=>n.find(i=>Q(d)===Q(i)));let s=o.length===n.length;return s&&(s=o.every((d,i)=>Q(d)===Q(n[i]))),s},Ba=(t,r)=>{t&&r!==t&&(ir(t).forEach(a=>delete t[a]),Ie(r||{}).forEach(([a,n])=>t[a]=n))},Fa=(t,r)=>{t&&(t.splice(0,t.length),r&&r.forEach(a=>t.push(a)))},$a=(t,r)=>{const{compProps:a,compChild:n}=t,{props:o,children:s}=r;return a&&Ba(a,o),n&&s&&n!==s&&Fa(n,s),t.reRender&&t.reRender()},ja=(t,r,a)=>Je(t)?r&&a?$a(a,t):t.resolve():t,Va=(t,r,a)=>r&&a?Ja(t,a):za(t),za=t=>(t.children||[]).map(r=>ze(Ke(r),{getParent:()=>t})),Ja=(t,r)=>t.type==="l"&&pe((t.children||[])[0])?Wa(t,r):(t.children||[]).map((a,n)=>ze(Ke(a,(r.children||[])[n]),{getParent:()=>t})),Wa=(t,r)=>{const[a,n]=Ga(t,r);return n.forEach(o=>{We(o),Ge(o),ft(o)}),a},Ga=(t,r)=>{const a=[...r.children||[]];return[(t.children||[]).map(n=>{const o=Xa(n,a),s=Ke(n,o);return o&&a.splice(a.indexOf(o),1),s.getParent=()=>t,s}),a]},Xa=(t,r)=>r.find(a=>Q(a)===Q(t)),gt=new Map;let ht=!1;const qa=(t,r)=>{const a=H.get(t);a&&(a.up=()=>{gt.set(t,r),ht||(ht=!0,queueMicrotask(Ka))})},wr=t=>()=>{const r=H.get(t),a=r&&r.up;return a?(a(),!0):!1},Ka=()=>{gt.forEach(t=>{t()}),gt.clear(),ht=!1},Ya=(t,r=()=>[])=>{const a=le();if(!a)return;const n=H.get(a);n&&(n.upR.push(()=>Nt(t,r)),Nt(t,r))},Za=()=>{const t=le();if(!t)return;const r=H.get(t),a=r&&r.upR;a&&a.length&&a.forEach(n=>n())},L=(t,...r)=>({type:"f",[De]:!0,children:r}),$e=(t,r,...a)=>{const n={value:void 0},o=Cr(n,a),s=an(t,r||{},o);return Je(s)||(n.value=s),s},Qa=(t,r)=>$e("portal",{portal:r},t),v=t=>(r,a)=>t,en=t=>(r,a)=>(sr.add(t),t),tn=(t,r,a)=>{const n=(o,s)=>{if(!(!o||s.has(o))){if(s.add(o),o.compChild){const d=o.compChild.indexOf(r);d!==-1&&o.compChild.splice(d,1,a)}n(o.getParent?o.getParent():void 0,s)}};n(t,new Set)},rn=(t,r,a,n)=>{if(n.il)return;ue.value=!0;const o=Sr(t,r,a),s=Ke(o,n),{isRoot:d,getParent:i,we:c,ae:h}=n;if(s.getParent=i,!d&&i){const m=i(),x=m&&m.children||[],k=x.indexOf(n);k!==-1&&x.splice(k,1,s),tn(m,n,s)}else s.isRoot=!0,s.we=c,s.ae=h;ue.value=!1,fr(s)},an=(t,r,a)=>{if(cr(t))return L(r,...a);if(Je(t)){const n=Sr(t,r,a);return ue.value?n:n.resolve()}return{type:"e",[De]:!0,tag:t,props:r,children:a}},Cr=(t,r)=>r.map(a=>ze(Mr(a),{getParent:()=>t.value})),Mr=t=>{if(t==null||t===!1)return{type:null,[De]:!0};if(Array.isArray(t)){const r={value:void 0},a=Cr(r,t),n={type:"l",[De]:!0,children:a};return r.value=n,n}else if(typeof t=="string"||typeof t=="number")return{type:"t",[De]:!0,text:t};return t},nn=(t,r,a)=>(n=r)=>{const o=ue.value;ue.value=!1,sa(n);const s=t(r,a);let d;if(typeof s=="function"){const c=s;d=sr.has(c)?c(r,a):c(wr(n),r,a)}else d=c=>t(c,a);const i=ln(d,n,t,r,a);return ue.value=o,i},Sr=(t,r,a)=>{const n=t,o=a,s=nn(t,r,o);return{ctor:n,props:r,children:o,resolve:s}},ln=(t,r,a,n,o)=>{const{wrappedComponentMaker:s,customNode:d}=sn(t,n),i=dn(s,r,a,n,o);return Tr(d,r,a,n,o,i),d},dn=(t,r,a,n,o)=>{const s=()=>on(t,r,a,n,o,s);return s},on=(t,r,a,n,o,s)=>{oa(r),Za();const d=t(n);return Tr(d,r,a,n,o,s),d},sn=(t,r)=>{let a=t(r);if(!a.reRender)return{wrappedComponentMaker:t,customNode:a};const n=o=>{const s=t(o);if(!s||!s.reRender){const i=Mr(s),c=L({},i);return i.getParent=()=>c,c}const d=L({},s);return s.getParent=()=>d,d};return a=n(r),{wrappedComponentMaker:n,customNode:a}},Tr=(t,r,a,n,o,s)=>{ze(t,{compProps:n,compChild:o,ctor:a,compKey:r,reRender:s}),qa(r,()=>rn(a,t.compProps||n,t.compChild||o,t)),it(r,"vd")&&(it(r,"vd").value=t)},V=t=>({value:t}),cn=()=>{const t=le();return t?wr(t):()=>!1};function e(t,r,a,n,o,s){const{children:d,...i}=r;if(d!=null){const c=Array.isArray(d)?d:[d];return $e(t,{...i,key:a},...c)}return $e(t,{...i,key:a})}const P=(t,r)=>{let a=t;return{get value(){return a},get v(){return a},set value(n){a=n,r()},set v(n){a=n,r()}}},mn=t=>{let r=t;return{get value(){return r()},get v(){return r()},set value(a){throw new Error("You can't change 'computed'")},set v(a){throw new Error("You can't change 'computed'")}}},xn=(t,r=()=>{},a=()=>[])=>{te(()=>(t(),r)),Ya(()=>(r&&r(),t),a)},gn={cache:!0};function hn(t){const r={value:!1},a=!Array.isArray(t)&&typeof t=="object"&&t!==null?t:{value:t},n=new Set,o=[],s=new WeakMap;return(d,i,c)=>{const{cache:h}=Object.assign({},gn,c||{});if(h&&d&&s.has(d))return s.get(d);const m={},x=new Set;let k={value:null},g=()=>{};return o.push(m),d&&i&&(g=()=>d(k.value),k.value=Ht(a,r,n,x,o,g,m),r.value=!0,i(k.value),r.value=!1),k.value||(k.value=Ht(a,r,n,x,o),d&&(g=()=>d(k.value),n.add(g))),d&&(bn(g,n,m,x),s.set(d,k.value)),k.value}}function Ht(t,r,a,n,o,s,d){return new Proxy(t,{get(i,c){return s&&d&&r.value&&(d[c]??(d[c]=new Set),d[c].has(s)||(d[c].add(s),n.add(c))),i[c]},set(i,c,h){return i[c]===h||(i[c]=h,un(a,o,c)),!0}})}function un(t,r=[],a){const n=new Set;Bt(t).forEach(o=>n.add(o)),(r||[]).forEach(o=>{const s=o[a]||new Set;Bt(s).forEach(d=>n.add(d)),_t(n,s)}),_t(n,t)}function _t(t,r){t.forEach(a=>{r.delete(a)})}function Bt(t){const r=[];return t.forEach(a=>{a()===!1&&r.push(a)}),r}function bn(t,r,a,n){const o=t();o instanceof AbortSignal&&o.addEventListener("abort",()=>{const s=a||{};r.delete(t),Object.entries(s).forEach(([d,i])=>{i.delete(t),n.delete(d)})})}const pn={cache:!0};function yn(t){const r={value:!1},a=!Array.isArray(t)&&typeof t=="object"&&t!==null?t:{value:t},n=new Set,o=[],s=new WeakMap,d=(i,c,h)=>{const{cache:m}=Object.assign({},pn,h||{});if(m&&i&&s.has(i))return s.get(i);const x={},k=new Set;let g={value:null},D=()=>{};return o.push(x),i&&c&&(D=()=>i(g.value),g.value=Ft(a,r,n,k,o,D,x),r.value=!0,c(g.value),r.value=!1),g.value||(g.value=Ft(a,r,n,k,o),i&&(D=()=>i(g.value),n.add(D))),i&&(fn(D,n,x,k),s.set(i,g.value)),g.value};return{useStore(i,c){const h=cn();return d(h,i,c)},watch(i,c,h){return d(i,c,h)}}}function Ft(t,r,a,n,o,s,d){return new Proxy(t,{get(i,c){return s&&d&&r.value&&(d[c]??(d[c]=new Set),d[c].has(s)||(d[c].add(s),n.add(c))),i[c]},set(i,c,h){return i[c]===h||(i[c]=h,kn(a,o,c)),!0}})}function kn(t,r=[],a){const n=new Set;jt(t).forEach(o=>n.add(o)),(r||[]).forEach(o=>{const s=o[a]||new Set;jt(s).forEach(d=>n.add(d)),$t(n,s)}),$t(n,t)}function $t(t,r){t.forEach(a=>{r.delete(a)})}function jt(t){const r=[];return t.forEach(a=>{a()===!1&&r.push(a)}),r}function fn(t,r,a,n){const o=t();o instanceof AbortSignal&&o.addEventListener("abort",()=>{const s=a||{};r.delete(t),Object.entries(s).forEach(([d,i])=>{i.delete(t),n.delete(d)})})}const vn=(t,r)=>{let a=[],n=null;return o=>{const s=t(),d=a.every((c,h)=>c===s[h]);if(a=s,d&&n)return n;const i=r(o);return n=i,i}},ut=Symbol("INJECT"),Fe=Symbol("ADDRENEW"),Vt=Symbol("Provider");function wn(){const t=v((r,a,n)=>(a[Vt]=!0,()=>$e(L,null,n)));return{Provider:t,contextState:zt,useContext:(r,a,n)=>{if(r.Provider!==t)throw new Error("Context mismatch: Provider does not match");const o=le(),s={},d=c=>{s[c]=zt()};n&&n.forEach(c=>d(c));const i=c=>{var h;if(!c){const x=o&&it(o,"vd");return x!=null&&x.value?i(x.value):null}if(c.compProps&&c.compProps[Vt])return c.compProps;const m=(h=c.getParent)==null?void 0:h.call(c);return m?i(m):null};return wa(()=>{const c=i();c&&((n||Object.keys(c).filter(h=>typeof h=="string"&&h!=="children"&&c[h]&&typeof c[h][Fe]=="function")).forEach(h=>{s[h]||d(h);const m=c[h];if(!m)return;const x=s[h];x[ut](m.value);const k=g=>(x[ut](g),a());m[Fe](k),x[Fe](g=>(m.value=g,!0))}),a())}),s}}}const zt=(t,r)=>{let a=t,n=[];return r&&n.push(()=>r()),{get value(){return a},set value(o){a=o,n.length&&(n=n.filter(s=>s(a)))},[ut](o){a=o},[Fe](o){return n.push(o),!0}}},bt="/ko",Cn=t=>t.startsWith("/")?t:`/${t}`,Mn=t=>Cn(t||"/").replace(/^\/ko(?=\/|$)/,"")||"/",Pe=(t,r)=>{const a=Mn(t);return r==="ko"?a==="/"?`${bt}/guide/introduction`:`${bt}${a}`:a},Sn=()=>{const t=localStorage.getItem("lithent-theme");return t==="light"||t==="dark"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"},Ye=yn({theme:Sn(),route:location.pathname||"/guide/introduction",sidebarOpen:!1}),ee=Ye.watch(),Er=t=>{ee.theme=t,localStorage.setItem("lithent-theme",t),t==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")},Tn=()=>{Er(ee.theme==="light"?"dark":"light")},En=()=>ee.route.startsWith(bt),Dr=t=>{ee.route=t,window.history.pushState({},"",t),ee.sidebarOpen=!1,window.scrollTo(0,0)},y=t=>{const r=En()?"ko":"en",a=Pe(t,r);Dr(a)},Jt=t=>{const r=Pe(ee.route,t);r!==ee.route&&Dr(r)};window.addEventListener("popstate",()=>{ee.route=location.pathname||"/guide/introduction",window.scrollTo(0,0)});Er(ee.theme);const Dn=v(t=>{const r=Ye.watch(t);return()=>{const a=r.route.startsWith("/ko");return e("header",{class:"sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1b1b1f]",children:e("div",{class:"mx-auto max-w-[1440px]",children:e("div",{class:"flex h-16",children:[e("div",{class:"w-auto sm:w-48 lg:w-64 flex-shrink-0 flex items-center px-6 md:px-12",children:e("a",{href:"/",onClick:n=>{n.preventDefault(),y("/")},class:"flex items-center gap-3",children:[e("img",{src:"/lithent.png",alt:"Lithent",class:"w-8 h-8"}),e("span",{class:"font-semibold text-xl text-gray-900 dark:text-white",children:"Lithent"})]})}),e("div",{class:"flex-1 w-full min-w-0 px-6 md:px-12",children:e("div",{class:"max-w-full md:max-w-[43rem] flex items-center justify-end h-16",children:[e("nav",{class:"hidden md:flex items-center gap-6",children:[e("a",{href:"/guide/introduction",onClick:n=>{n.preventDefault(),y("/guide/introduction")},class:"text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#42b883] dark:hover:text-[#42b883] transition-colors",children:"Guide"}),e("a",{href:"https://github.com/superlucky84/lithent",target:"_blank",rel:"noopener",class:"text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#42b883] dark:hover:text-[#42b883] transition-colors",children:"GitHub"})]}),e("div",{class:"flex items-center ml-4 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-semibold overflow-hidden",children:[e("button",{type:"button",class:`px-3 py-1 transition-colors ${a?"text-gray-600 dark:text-gray-300":"bg-[#42b883] text-white"}`,"aria-pressed":!a,onClick:()=>Jt("en"),children:"EN"}),e("button",{type:"button",class:`px-3 py-1 transition-colors ${a?"bg-[#42b883] text-white":"text-gray-600 dark:text-gray-300"}`,"aria-pressed":a,onClick:()=>Jt("ko"),children:"KO"})]}),e("button",{onClick:Tn,class:"hidden sm:inline-flex ml-6 relative items-center h-9 w-16 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#42b883] focus:ring-offset-2 bg-gray-200 dark:bg-gray-700","aria-label":"Toggle dark mode",title:r.theme==="light"?"Switch to dark mode":"Switch to light mode",children:e("span",{class:`inline-block h-7 w-7 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${r.theme==="dark"?"translate-x-8":"translate-x-1"}`,children:e("span",{class:"flex items-center justify-center h-full",children:r.theme==="light"?e("svg",{class:"w-4 h-4 text-gray-600",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"})}):e("svg",{class:"w-4 h-4 text-gray-600",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"})})})})}),e("button",{class:"lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-2 ml-4",onClick:()=>{r.sidebarOpen=!r.sidebarOpen},"aria-label":"Toggle sidebar",children:e("svg",{class:"w-6 h-6 text-gray-600 dark:text-gray-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M4 6h16M4 12h16M4 18h16"})})})]})})]})})})}}),at=[{text:"Getting Started",items:[{text:"Introduction",link:"/guide/introduction"},{text:"Quick Start",link:"/guide/quick-start"}]},{text:"Essential Features",items:[{text:"Mounter",link:"/guide/mounter"},{text:"Updater",link:"/guide/updater"},{text:"Props",link:"/guide/props"},{text:"Children",link:"/guide/children"},{text:"Renewer",link:"/guide/renewer"},{text:"Render",link:"/guide/render"},{text:"Portal",link:"/guide/portal"},{text:"Mount Hooks",link:"/guide/mount-hooks"},{text:"Update Hooks",link:"/guide/update-hooks"},{text:"Mount Ready Hooks",link:"/guide/mount-ready-hooks"},{text:"useRenew Hooks",link:"/guide/use-renew-hooks"},{text:"NextTick",link:"/guide/next-tick"},{text:"Stateless Components",link:"/guide/stateless"}]},{text:"Helper Features",items:[{text:"State",link:"/guide/state"},{text:"Lstate",link:"/guide/lstate"},{text:"Computed",link:"/guide/computed"},{text:"Effect",link:"/guide/effect"},{text:"Store",link:"/guide/store"},{text:"Lstore",link:"/guide/lstore"},{text:"Context",link:"/guide/context"},{text:"LContext",link:"/guide/lcontext"},{text:"CacheUpdate",link:"/guide/cache-update"},{text:"State-Ref",link:"/guide/state-ref"}]},{text:"JSX & Templates",items:[{text:"Vite Plugin",link:"/guide/vite-plugin"},{text:"Manual JSX Setup",link:"/guide/jsx-manual"},{text:"FTags",link:"/guide/ftags"},{text:"HTM Tags",link:"/guide/htm-tags"},{text:"Template Strings",link:"/guide/template-strings"}]},{text:"Examples",items:[{text:"Computed (바나나 칼로리)",link:"/examples/1"},{text:"Shared Store (helper)",link:"/examples/2"},{text:"Render Props (Mouse tracker)",link:"/examples/3"},{text:"Effect Lifecycle (helper)",link:"/examples/4"},{text:"Nested Fragments (Notifications)",link:"/examples/5"},{text:"Key-based Lists (Playlist)",link:"/examples/6"},{text:"innerHTML (Markdown Editor)",link:"/examples/7"},{text:"Select Controls (Character)",link:"/examples/8"},{text:"Input Controls (Business Card)",link:"/examples/9"},{text:"Checkbox & Radio (Pizza Builder)",link:"/examples/10"},{text:"Context (Theme & User)",link:"/examples/11"},{text:"Mixed DOM (Social Timeline)",link:"/examples/12"},{text:"Mixed DOM + Loop (Waitlist)",link:"/examples/13"},{text:"Nested Unmount (Game Inventory)",link:"/examples/14"},{text:"Nested Props (Volume Controller)",link:"/examples/15"},{text:"insertBefore + Destroy (Music Library)",link:"/examples/16"},{text:"SVG Rendering (Traffic Light)",link:"/examples/17"},{text:"CacheUpdate (Product Filter)",link:"/examples/18"},{text:"FTags CDN (Smart Todo List)",link:"/examples/19"},{text:"Portal (이미지 라이트박스)",link:"/examples/20"}]}],nt=t=>t.replace(/\/+$/,"")||"/",Pn=v(t=>{const r=Ye.watch(t),a=Object.fromEntries(at.map(d=>[d.text,!1]));let n=r.route;const o=d=>{const i=r.route.startsWith("/ko")?"ko":"en";y(Pe(d,i))},s=d=>{a[d]=!a[d],t()};return()=>{const d=r.route!==n,i=nt(r.route),c=r.route.startsWith("/ko")?"ko":"en",h=x=>nt(Pe(x,c));d&&i==="/"&&at.forEach(x=>{a[x.text]=!1});const m=e(L,{children:[r.sidebarOpen&&e("div",{class:"fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden",onClick:()=>{r.sidebarOpen=!1}}),e("aside",{class:`
            fixed lg:sticky top-16 left-0 z-40
            w-64 h-[calc(100vh-4rem)] flex-shrink-0
            bg-white dark:bg-[#1b1b1f]
            border-r border-gray-200 dark:border-gray-800
            overflow-y-auto
            transition-transform duration-300
            ${r.sidebarOpen?"translate-x-0":"-translate-x-full lg:translate-x-0"}
          `,children:e("nav",{class:"pl-6 md:pl-12 pr-3 md:pr-4 py-6",children:at.map(x=>{d&&i!=="/"&&x.items.some(D=>h(D.link)===i)&&(a[x.text]=!0);const k=a[x.text];return e("div",{class:"mb-3",children:[e("button",{class:"mb-1 w-full flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider",onClick:()=>s(x.text),children:[e("span",{children:x.text}),e("span",{class:"text-base leading-none",children:k?"▾":"▸"})]}),e("ul",{class:`
                      space-y-0 overflow-hidden transition-all duration-200 ease-in-out
                      ${k?"max-h-[1200px] opacity-100":"max-h-0 opacity-0 pointer-events-none"}
                    `,"aria-hidden":!k,children:x.items.map(g=>{const D=Pe(g.link,c),N=i===nt(D);return e("li",{children:e("a",{href:D,onClick:F=>{F.preventDefault(),o(g.link)},class:`
                              block px-2 py-1.5 rounded-md text-sm font-normal transition-colors
                              ${N?"text-[#42b883] bg-[#42b883] bg-opacity-10":"text-gray-700 dark:text-gray-300 hover:text-[#42b883] dark:hover:text-[#42b883] hover:bg-gray-100 dark:hover:bg-gray-800"}
                            `,children:g.text})})})})]})})})})]});return n=r.route,m}}),In=[{title:"Getting Started",description:"Lithent를 시작하기 위한 기본 가이드",icon:"🚀",theme:{gradient:"from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",borderColor:"border-blue-200 dark:border-blue-800",hoverBorder:"hover:border-blue-400 dark:hover:border-blue-600",tagBg:"bg-blue-100 dark:bg-blue-900/40",tagHover:"hover:bg-blue-200 dark:hover:bg-blue-800/60",textColor:"text-blue-900 dark:text-blue-100"},items:[{text:"Introduction",link:"/guide/introduction"},{text:"Quick Start",link:"/guide/quick-start"}]},{title:"Essential Features",description:"Lithent의 핵심 기능",icon:"⚡",theme:{gradient:"from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",borderColor:"border-green-200 dark:border-green-800",hoverBorder:"hover:border-green-400 dark:hover:border-green-600",tagBg:"bg-green-100 dark:bg-green-900/40",tagHover:"hover:bg-green-200 dark:hover:bg-green-800/60",textColor:"text-green-900 dark:text-green-100"},items:[{text:"Mounter",link:"/guide/mounter"},{text:"Updater",link:"/guide/updater"},{text:"Props",link:"/guide/props"},{text:"Children",link:"/guide/children"},{text:"Renewer",link:"/guide/renewer"},{text:"Render",link:"/guide/render"},{text:"Portal",link:"/guide/portal"},{text:"Mount Hooks",link:"/guide/mount-hooks"},{text:"Update Hooks",link:"/guide/update-hooks"},{text:"Mount Ready Hooks",link:"/guide/mount-ready-hooks"},{text:"useRenew Hooks",link:"/guide/use-renew-hooks"},{text:"NextTick",link:"/guide/next-tick"}]},{title:"Helper Features",description:"선택적으로 사용할 수 있는 헬퍼 기능",icon:"🔧",theme:{gradient:"from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",borderColor:"border-purple-200 dark:border-purple-800",hoverBorder:"hover:border-purple-400 dark:hover:border-purple-600",tagBg:"bg-purple-100 dark:bg-purple-900/40",tagHover:"hover:bg-purple-200 dark:hover:bg-purple-800/60",textColor:"text-purple-900 dark:text-purple-100"},items:[{text:"State",link:"/guide/state"},{text:"Lstate",link:"/guide/lstate"},{text:"Computed",link:"/guide/computed"},{text:"Effect",link:"/guide/effect"},{text:"Store",link:"/guide/store"},{text:"Lstore",link:"/guide/lstore"},{text:"Context",link:"/guide/context"},{text:"LContext",link:"/guide/lcontext"},{text:"CacheUpdate",link:"/guide/cache-update"},{text:"State-Ref",link:"/guide/state-ref"}]},{title:"JSX & Templates",description:"다양한 템플릿 방식 지원",icon:"📝",theme:{gradient:"from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",borderColor:"border-orange-200 dark:border-orange-800",hoverBorder:"hover:border-orange-400 dark:hover:border-orange-600",tagBg:"bg-orange-100 dark:bg-orange-900/40",tagHover:"hover:bg-orange-200 dark:hover:bg-orange-800/60",textColor:"text-orange-900 dark:text-orange-100"},items:[{text:"Vite Plugin",link:"/guide/vite-plugin"},{text:"Manual JSX Setup",link:"/guide/jsx-manual"},{text:"FTags",link:"/guide/ftags"},{text:"HTM Tags",link:"/guide/htm-tags"},{text:"Template Strings",link:"/guide/template-strings"}]}],Wt=[{text:"Computed (커피 주문 계산기)",link:"/examples/1",description:"computed로 여러 state에서 자동 계산되는 파생 값 관리"},{text:"Shared Store (helper)",link:"/examples/2",description:"전역 store로 여러 컴포넌트 간 상태 공유"},{text:"Render Props (Mouse tracker)",link:"/examples/3",description:"render props 패턴으로 재사용 가능한 로직 구현"},{text:"Effect Lifecycle (helper)",link:"/examples/4",description:"effect로 상태 변경 시 사이드 이펙트 실행"},{text:"Nested Fragments (Notifications)",link:"/examples/5",description:"중첩된 Fragment로 복잡한 DOM 구조 관리"},{text:"Key-based Lists (Playlist)",link:"/examples/6",description:"key 기반 리스트 렌더링으로 효율적인 업데이트"},{text:"innerHTML (Markdown Editor)",link:"/examples/7",description:"innerHTML로 동적 HTML 콘텐츠 렌더링"},{text:"Select Controls (Character)",link:"/examples/8",description:"select 입력 제어와 상태 동기화"},{text:"Input Controls (Business Card)",link:"/examples/9",description:"input 필드 제어와 양방향 데이터 바인딩"},{text:"Checkbox & Radio (Pizza Builder)",link:"/examples/10",description:"checkbox와 radio 입력 제어"},{text:"Context (Theme & User)",link:"/examples/11",description:"Context로 user/theme/accent를 트리 전체에서 공유"},{text:"Mixed DOM (Social Timeline)",link:"/examples/12",description:"가상 DOM과 실제 DOM을 혼합 사용"},{text:"Mixed DOM + Loop (Waitlist)",link:"/examples/13",description:"반복문과 혼합 DOM 패턴 활용"},{text:"Nested Unmount (Game Inventory)",link:"/examples/14",description:"중첩된 컴포넌트의 unmount 생명주기 관리"},{text:"Nested Props (Volume Controller)",link:"/examples/15",description:"중첩 컴포넌트에 props 전달"},{text:"insertBefore + Destroy (Music Library)",link:"/examples/16",description:"DOM 삽입 위치 제어와 컴포넌트 제거"},{text:"SVG Rendering (Traffic Light)",link:"/examples/17",description:"SVG 요소 동적 렌더링"},{text:"CacheUpdate (Product Filter)",link:"/examples/18",description:"cacheUpdate로 여러 상태 변경을 한 번에 반영"},{text:"FTags CDN (Smart Todo List)",link:"/examples/19",description:"FTags로 빌드 없이 CDN만으로 앱 구현"},{text:"Portal (이미지 라이트박스)",link:"/examples/20",description:"portal로 다른 DOM 위치에 컴포넌트 렌더링"}],On=v(t=>{const r=P(!1,t),a=V(null),n=s=>{y(s)},o=()=>{r.v=!r.v,r.v&&setTimeout(()=>{a.value&&a.value.scrollIntoView({behavior:"smooth",block:"start"})},200)};return()=>e("div",{children:[e("div",{class:"mb-12",children:[e("h1",{class:"text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4",children:"Lithent Documentation"}),e("p",{class:"text-lg text-gray-600 dark:text-gray-400",children:"친숙한 클로저 패턴을 사용하여 예측 가능하고 가벼운 UI를 만드는 JavaScript 라이브러리"})]}),e("div",{class:"space-y-6 mb-12",children:In.map(s=>e("div",{class:`bg-gradient-to-r ${s.theme.gradient} rounded-lg border ${s.theme.borderColor} ${s.theme.hoverBorder} p-6 transition-all hover:shadow-xl`,children:[e("div",{class:"flex items-start gap-4 mb-4",children:[e("span",{class:"text-4xl flex-shrink-0",children:s.icon}),e("div",{class:"flex-1",children:[e("h2",{class:`text-2xl font-bold ${s.theme.textColor} mb-2`,children:s.title}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:s.description})]})]}),e("div",{class:"flex flex-wrap gap-2",children:s.items.map(d=>e("a",{href:d.link,onClick:i=>{i.preventDefault(),n(d.link)},class:`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${s.theme.tagBg} ${s.theme.tagHover} ${s.theme.textColor} transition-all hover:shadow-md`,children:d.text},d.link))})]},s.title))}),e("div",{ref:a,class:"bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 p-6 transition-all hover:shadow-lg",children:[e("button",{onClick:o,class:"w-full flex items-center justify-between mb-4 group",children:[e("div",{class:"flex items-start gap-4",children:[e("span",{class:"text-4xl flex-shrink-0",children:"💡"}),e("div",{class:"flex-1 text-left",children:[e("h2",{class:"text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2",children:"Examples"}),!r.v&&e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:[Wt.length,"개의 실용적인 예제를 확인해보세요"]})]})]}),e("span",{class:`text-2xl text-indigo-600 dark:text-indigo-400 transition-transform duration-200 ${r.v?"rotate-90":""}`,children:"▸"})]}),e("div",{class:`grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden transition-all duration-300 ease-in-out ${r.v?"max-h-[3000px] opacity-100 mt-4":"max-h-0 opacity-0"}`,children:Wt.map(s=>e("a",{href:s.link,onClick:d=>{d.preventDefault(),n(s.link)},class:"bg-white dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-lg",children:[e("div",{class:"text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1.5",children:s.text}),e("div",{class:"text-xs text-gray-700 dark:text-gray-300 leading-relaxed",children:s.description})]},s.link))})]})]})});function Ln(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function Pr(t){return t instanceof Map?t.clear=t.delete=t.set=function(){throw new Error("map is read-only")}:t instanceof Set&&(t.add=t.clear=t.delete=function(){throw new Error("set is read-only")}),Object.freeze(t),Object.getOwnPropertyNames(t).forEach(r=>{const a=t[r],n=typeof a;(n==="object"||n==="function")&&!Object.isFrozen(a)&&Pr(a)}),t}class Gt{constructor(r){r.data===void 0&&(r.data={}),this.data=r.data,this.isMatchIgnored=!1}ignoreMatch(){this.isMatchIgnored=!0}}function Ir(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")}function ae(t,...r){const a=Object.create(null);for(const n in t)a[n]=t[n];return r.forEach(function(n){for(const o in n)a[o]=n[o]}),a}const Rn="</span>",Xt=t=>!!t.scope,An=(t,{prefix:r})=>{if(t.startsWith("language:"))return t.replace("language:","language-");if(t.includes(".")){const a=t.split(".");return[`${r}${a.shift()}`,...a.map((n,o)=>`${n}${"_".repeat(o+1)}`)].join(" ")}return`${r}${t}`};class Nn{constructor(r,a){this.buffer="",this.classPrefix=a.classPrefix,r.walk(this)}addText(r){this.buffer+=Ir(r)}openNode(r){if(!Xt(r))return;const a=An(r.scope,{prefix:this.classPrefix});this.span(a)}closeNode(r){Xt(r)&&(this.buffer+=Rn)}value(){return this.buffer}span(r){this.buffer+=`<span class="${r}">`}}const qt=(t={})=>{const r={children:[]};return Object.assign(r,t),r};class wt{constructor(){this.rootNode=qt(),this.stack=[this.rootNode]}get top(){return this.stack[this.stack.length-1]}get root(){return this.rootNode}add(r){this.top.children.push(r)}openNode(r){const a=qt({scope:r});this.add(a),this.stack.push(a)}closeNode(){if(this.stack.length>1)return this.stack.pop()}closeAllNodes(){for(;this.closeNode(););}toJSON(){return JSON.stringify(this.rootNode,null,4)}walk(r){return this.constructor._walk(r,this.rootNode)}static _walk(r,a){return typeof a=="string"?r.addText(a):a.children&&(r.openNode(a),a.children.forEach(n=>this._walk(r,n)),r.closeNode(a)),r}static _collapse(r){typeof r!="string"&&r.children&&(r.children.every(a=>typeof a=="string")?r.children=[r.children.join("")]:r.children.forEach(a=>{wt._collapse(a)}))}}class Un extends wt{constructor(r){super(),this.options=r}addText(r){r!==""&&this.add(r)}startScope(r){this.openNode(r)}endScope(){this.closeNode()}__addSublanguage(r,a){const n=r.root;a&&(n.scope=`language:${a}`),this.add(n)}toHTML(){return new Nn(this,this.options).value()}finalize(){return this.closeAllNodes(),!0}}function Oe(t){return t?typeof t=="string"?t:t.source:null}function Or(t){return me("(?=",t,")")}function Hn(t){return me("(?:",t,")*")}function _n(t){return me("(?:",t,")?")}function me(...t){return t.map(a=>Oe(a)).join("")}function Bn(t){const r=t[t.length-1];return typeof r=="object"&&r.constructor===Object?(t.splice(t.length-1,1),r):{}}function Ct(...t){return"("+(Bn(t).capture?"":"?:")+t.map(n=>Oe(n)).join("|")+")"}function Lr(t){return new RegExp(t.toString()+"|").exec("").length-1}function Fn(t,r){const a=t&&t.exec(r);return a&&a.index===0}const $n=/\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;function Mt(t,{joinWith:r}){let a=0;return t.map(n=>{a+=1;const o=a;let s=Oe(n),d="";for(;s.length>0;){const i=$n.exec(s);if(!i){d+=s;break}d+=s.substring(0,i.index),s=s.substring(i.index+i[0].length),i[0][0]==="\\"&&i[1]?d+="\\"+String(Number(i[1])+o):(d+=i[0],i[0]==="("&&a++)}return d}).map(n=>`(${n})`).join(r)}const jn=/\b\B/,Rr="[a-zA-Z]\\w*",St="[a-zA-Z_]\\w*",Ar="\\b\\d+(\\.\\d+)?",Nr="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",Ur="\\b(0b[01]+)",Vn="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",zn=(t={})=>{const r=/^#![ ]*\//;return t.binary&&(t.begin=me(r,/.*\b/,t.binary,/\b.*/)),ae({scope:"meta",begin:r,end:/$/,relevance:0,"on:begin":(a,n)=>{a.index!==0&&n.ignoreMatch()}},t)},Le={begin:"\\\\[\\s\\S]",relevance:0},Jn={scope:"string",begin:"'",end:"'",illegal:"\\n",contains:[Le]},Wn={scope:"string",begin:'"',end:'"',illegal:"\\n",contains:[Le]},Gn={begin:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},Ze=function(t,r,a={}){const n=ae({scope:"comment",begin:t,end:r,contains:[]},a);n.contains.push({scope:"doctag",begin:"[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",end:/(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,excludeBegin:!0,relevance:0});const o=Ct("I","a","is","so","us","to","at","if","in","it","on",/[A-Za-z]+['](d|ve|re|ll|t|s|n)/,/[A-Za-z]+[-][a-z]+/,/[A-Za-z][a-z]{2,}/);return n.contains.push({begin:me(/[ ]+/,"(",o,/[.]?[:]?([.][ ]|[ ])/,"){3}")}),n},Xn=Ze("//","$"),qn=Ze("/\\*","\\*/"),Kn=Ze("#","$"),Yn={scope:"number",begin:Ar,relevance:0},Zn={scope:"number",begin:Nr,relevance:0},Qn={scope:"number",begin:Ur,relevance:0},el={begin:/(?=\/[^/\n]*\/)/,contains:[{scope:"regexp",begin:/\//,end:/\/[gimuy]*/,illegal:/\n/,contains:[Le,{begin:/\[/,end:/\]/,relevance:0,contains:[Le]}]}]},tl={scope:"title",begin:Rr,relevance:0},rl={scope:"title",begin:St,relevance:0},al={begin:"\\.\\s*"+St,relevance:0},nl=function(t){return Object.assign(t,{"on:begin":(r,a)=>{a.data._beginMatch=r[1]},"on:end":(r,a)=>{a.data._beginMatch!==r[1]&&a.ignoreMatch()}})};var _e=Object.freeze({__proto__:null,MATCH_NOTHING_RE:jn,IDENT_RE:Rr,UNDERSCORE_IDENT_RE:St,NUMBER_RE:Ar,C_NUMBER_RE:Nr,BINARY_NUMBER_RE:Ur,RE_STARTERS_RE:Vn,SHEBANG:zn,BACKSLASH_ESCAPE:Le,APOS_STRING_MODE:Jn,QUOTE_STRING_MODE:Wn,PHRASAL_WORDS_MODE:Gn,COMMENT:Ze,C_LINE_COMMENT_MODE:Xn,C_BLOCK_COMMENT_MODE:qn,HASH_COMMENT_MODE:Kn,NUMBER_MODE:Yn,C_NUMBER_MODE:Zn,BINARY_NUMBER_MODE:Qn,REGEXP_MODE:el,TITLE_MODE:tl,UNDERSCORE_TITLE_MODE:rl,METHOD_GUARD:al,END_SAME_AS_BEGIN:nl});function ll(t,r){t.input[t.index-1]==="."&&r.ignoreMatch()}function dl(t,r){t.className!==void 0&&(t.scope=t.className,delete t.className)}function ol(t,r){r&&t.beginKeywords&&(t.begin="\\b("+t.beginKeywords.split(" ").join("|")+")(?!\\.)(?=\\b|\\s)",t.__beforeBegin=ll,t.keywords=t.keywords||t.beginKeywords,delete t.beginKeywords,t.relevance===void 0&&(t.relevance=0))}function sl(t,r){Array.isArray(t.illegal)&&(t.illegal=Ct(...t.illegal))}function il(t,r){if(t.match){if(t.begin||t.end)throw new Error("begin & end are not supported with match");t.begin=t.match,delete t.match}}function cl(t,r){t.relevance===void 0&&(t.relevance=1)}const ml=(t,r)=>{if(!t.beforeMatch)return;if(t.starts)throw new Error("beforeMatch cannot be used with starts");const a=Object.assign({},t);Object.keys(t).forEach(n=>{delete t[n]}),t.keywords=a.keywords,t.begin=me(a.beforeMatch,Or(a.begin)),t.starts={relevance:0,contains:[Object.assign(a,{endsParent:!0})]},t.relevance=0,delete a.beforeMatch},xl=["of","and","for","in","not","or","if","then","parent","list","value"],gl="keyword";function Hr(t,r,a=gl){const n=Object.create(null);return typeof t=="string"?o(a,t.split(" ")):Array.isArray(t)?o(a,t):Object.keys(t).forEach(function(s){Object.assign(n,Hr(t[s],r,s))}),n;function o(s,d){r&&(d=d.map(i=>i.toLowerCase())),d.forEach(function(i){const c=i.split("|");n[c[0]]=[s,hl(c[0],c[1])]})}}function hl(t,r){return r?Number(r):ul(t)?0:1}function ul(t){return xl.includes(t.toLowerCase())}const Kt={},ie=t=>{console.error(t)},Yt=(t,...r)=>{console.log(`WARN: ${t}`,...r)},he=(t,r)=>{Kt[`${t}/${r}`]||(console.log(`Deprecated as of ${t}. ${r}`),Kt[`${t}/${r}`]=!0)},je=new Error;function _r(t,r,{key:a}){let n=0;const o=t[a],s={},d={};for(let i=1;i<=r.length;i++)d[i+n]=o[i],s[i+n]=!0,n+=Lr(r[i-1]);t[a]=d,t[a]._emit=s,t[a]._multi=!0}function bl(t){if(Array.isArray(t.begin)){if(t.skip||t.excludeBegin||t.returnBegin)throw ie("skip, excludeBegin, returnBegin not compatible with beginScope: {}"),je;if(typeof t.beginScope!="object"||t.beginScope===null)throw ie("beginScope must be object"),je;_r(t,t.begin,{key:"beginScope"}),t.begin=Mt(t.begin,{joinWith:""})}}function pl(t){if(Array.isArray(t.end)){if(t.skip||t.excludeEnd||t.returnEnd)throw ie("skip, excludeEnd, returnEnd not compatible with endScope: {}"),je;if(typeof t.endScope!="object"||t.endScope===null)throw ie("endScope must be object"),je;_r(t,t.end,{key:"endScope"}),t.end=Mt(t.end,{joinWith:""})}}function yl(t){t.scope&&typeof t.scope=="object"&&t.scope!==null&&(t.beginScope=t.scope,delete t.scope)}function kl(t){yl(t),typeof t.beginScope=="string"&&(t.beginScope={_wrap:t.beginScope}),typeof t.endScope=="string"&&(t.endScope={_wrap:t.endScope}),bl(t),pl(t)}function fl(t){function r(d,i){return new RegExp(Oe(d),"m"+(t.case_insensitive?"i":"")+(t.unicodeRegex?"u":"")+(i?"g":""))}class a{constructor(){this.matchIndexes={},this.regexes=[],this.matchAt=1,this.position=0}addRule(i,c){c.position=this.position++,this.matchIndexes[this.matchAt]=c,this.regexes.push([c,i]),this.matchAt+=Lr(i)+1}compile(){this.regexes.length===0&&(this.exec=()=>null);const i=this.regexes.map(c=>c[1]);this.matcherRe=r(Mt(i,{joinWith:"|"}),!0),this.lastIndex=0}exec(i){this.matcherRe.lastIndex=this.lastIndex;const c=this.matcherRe.exec(i);if(!c)return null;const h=c.findIndex((x,k)=>k>0&&x!==void 0),m=this.matchIndexes[h];return c.splice(0,h),Object.assign(c,m)}}class n{constructor(){this.rules=[],this.multiRegexes=[],this.count=0,this.lastIndex=0,this.regexIndex=0}getMatcher(i){if(this.multiRegexes[i])return this.multiRegexes[i];const c=new a;return this.rules.slice(i).forEach(([h,m])=>c.addRule(h,m)),c.compile(),this.multiRegexes[i]=c,c}resumingScanAtSamePosition(){return this.regexIndex!==0}considerAll(){this.regexIndex=0}addRule(i,c){this.rules.push([i,c]),c.type==="begin"&&this.count++}exec(i){const c=this.getMatcher(this.regexIndex);c.lastIndex=this.lastIndex;let h=c.exec(i);if(this.resumingScanAtSamePosition()&&!(h&&h.index===this.lastIndex)){const m=this.getMatcher(0);m.lastIndex=this.lastIndex+1,h=m.exec(i)}return h&&(this.regexIndex+=h.position+1,this.regexIndex===this.count&&this.considerAll()),h}}function o(d){const i=new n;return d.contains.forEach(c=>i.addRule(c.begin,{rule:c,type:"begin"})),d.terminatorEnd&&i.addRule(d.terminatorEnd,{type:"end"}),d.illegal&&i.addRule(d.illegal,{type:"illegal"}),i}function s(d,i){const c=d;if(d.isCompiled)return c;[dl,il,kl,ml].forEach(m=>m(d,i)),t.compilerExtensions.forEach(m=>m(d,i)),d.__beforeBegin=null,[ol,sl,cl].forEach(m=>m(d,i)),d.isCompiled=!0;let h=null;return typeof d.keywords=="object"&&d.keywords.$pattern&&(d.keywords=Object.assign({},d.keywords),h=d.keywords.$pattern,delete d.keywords.$pattern),h=h||/\w+/,d.keywords&&(d.keywords=Hr(d.keywords,t.case_insensitive)),c.keywordPatternRe=r(h,!0),i&&(d.begin||(d.begin=/\B|\b/),c.beginRe=r(c.begin),!d.end&&!d.endsWithParent&&(d.end=/\B|\b/),d.end&&(c.endRe=r(c.end)),c.terminatorEnd=Oe(c.end)||"",d.endsWithParent&&i.terminatorEnd&&(c.terminatorEnd+=(d.end?"|":"")+i.terminatorEnd)),d.illegal&&(c.illegalRe=r(d.illegal)),d.contains||(d.contains=[]),d.contains=[].concat(...d.contains.map(function(m){return vl(m==="self"?d:m)})),d.contains.forEach(function(m){s(m,c)}),d.starts&&s(d.starts,i),c.matcher=o(c),c}if(t.compilerExtensions||(t.compilerExtensions=[]),t.contains&&t.contains.includes("self"))throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");return t.classNameAliases=ae(t.classNameAliases||{}),s(t)}function Br(t){return t?t.endsWithParent||Br(t.starts):!1}function vl(t){return t.variants&&!t.cachedVariants&&(t.cachedVariants=t.variants.map(function(r){return ae(t,{variants:null},r)})),t.cachedVariants?t.cachedVariants:Br(t)?ae(t,{starts:t.starts?ae(t.starts):null}):Object.isFrozen(t)?ae(t):t}var wl="11.8.0";class Cl extends Error{constructor(r,a){super(r),this.name="HTMLInjectionError",this.html=a}}const lt=Ir,Zt=ae,Qt=Symbol("nomatch"),Ml=7,Fr=function(t){const r=Object.create(null),a=Object.create(null),n=[];let o=!0;const s="Could not find the language '{}', did you forget to load/include a language module?",d={disableAutodetect:!0,name:"Plain text",contains:[]};let i={ignoreUnescapedHTML:!1,throwUnescapedHTML:!1,noHighlightRe:/^(no-?highlight)$/i,languageDetectRe:/\blang(?:uage)?-([\w-]+)\b/i,classPrefix:"hljs-",cssSelector:"pre code",languages:null,__emitter:Un};function c(u){return i.noHighlightRe.test(u)}function h(u){let b=u.className+" ";b+=u.parentNode?u.parentNode.className:"";const w=i.languageDetectRe.exec(b);if(w){const S=z(w[1]);return S||(Yt(s.replace("{}",w[1])),Yt("Falling back to no-highlight mode for this block.",u)),S?w[1]:"no-highlight"}return b.split(/\s+/).find(S=>c(S)||z(S))}function m(u,b,w){let S="",T="";typeof b=="object"?(S=u,w=b.ignoreIllegals,T=b.language):(he("10.7.0","highlight(lang, code, ...args) has been deprecated."),he("10.7.0",`Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`),T=u,S=b),w===void 0&&(w=!0);const O={code:S,language:T};re("before:highlight",O);const B=O.result?O.result:x(O.language,O.code,w);return B.code=O.code,re("after:highlight",B),B}function x(u,b,w,S){const T=Object.create(null);function O(p,f){return p.keywords[f]}function B(){if(!C.keywords){A.addText(I);return}let p=0;C.keywordPatternRe.lastIndex=0;let f=C.keywordPatternRe.exec(I),M="";for(;f;){M+=I.substring(p,f.index);const E=K.case_insensitive?f[0].toLowerCase():f[0],U=O(C,E);if(U){const[Z,na]=U;if(A.addText(M),M="",T[E]=(T[E]||0)+1,T[E]<=Ml&&(Ue+=na),Z.startsWith("_"))M+=f[0];else{const la=K.classNameAliases[Z]||Z;q(f[0],la)}}else M+=f[0];p=C.keywordPatternRe.lastIndex,f=C.keywordPatternRe.exec(I)}M+=I.substring(p),A.addText(M)}function Ae(){if(I==="")return;let p=null;if(typeof C.subLanguage=="string"){if(!r[C.subLanguage]){A.addText(I);return}p=x(C.subLanguage,I,!0,Lt[C.subLanguage]),Lt[C.subLanguage]=p._top}else p=g(I,C.subLanguage.length?C.subLanguage:null);C.relevance>0&&(Ue+=p.relevance),A.__addSublanguage(p._emitter,p.language)}function j(){C.subLanguage!=null?Ae():B(),I=""}function q(p,f){p!==""&&(A.startScope(f),A.addText(p),A.endScope())}function Dt(p,f){let M=1;const E=f.length-1;for(;M<=E;){if(!p._emit[M]){M++;continue}const U=K.classNameAliases[p[M]]||p[M],Z=f[M];U?q(Z,U):(I=Z,B(),I=""),M++}}function Pt(p,f){return p.scope&&typeof p.scope=="string"&&A.openNode(K.classNameAliases[p.scope]||p.scope),p.beginScope&&(p.beginScope._wrap?(q(I,K.classNameAliases[p.beginScope._wrap]||p.beginScope._wrap),I=""):p.beginScope._multi&&(Dt(p.beginScope,f),I="")),C=Object.create(p,{parent:{value:C}}),C}function It(p,f,M){let E=Fn(p.endRe,M);if(E){if(p["on:end"]){const U=new Gt(p);p["on:end"](f,U),U.isMatchIgnored&&(E=!1)}if(E){for(;p.endsParent&&p.parent;)p=p.parent;return p}}if(p.endsWithParent)return It(p.parent,f,M)}function Qr(p){return C.matcher.regexIndex===0?(I+=p[0],1):(rt=!0,0)}function ea(p){const f=p[0],M=p.rule,E=new Gt(M),U=[M.__beforeBegin,M["on:begin"]];for(const Z of U)if(Z&&(Z(p,E),E.isMatchIgnored))return Qr(f);return M.skip?I+=f:(M.excludeBegin&&(I+=f),j(),!M.returnBegin&&!M.excludeBegin&&(I=f)),Pt(M,p),M.returnBegin?0:f.length}function ta(p){const f=p[0],M=b.substring(p.index),E=It(C,p,M);if(!E)return Qt;const U=C;C.endScope&&C.endScope._wrap?(j(),q(f,C.endScope._wrap)):C.endScope&&C.endScope._multi?(j(),Dt(C.endScope,p)):U.skip?I+=f:(U.returnEnd||U.excludeEnd||(I+=f),j(),U.excludeEnd&&(I=f));do C.scope&&A.closeNode(),!C.skip&&!C.subLanguage&&(Ue+=C.relevance),C=C.parent;while(C!==E.parent);return E.starts&&Pt(E.starts,p),U.returnEnd?0:f.length}function ra(){const p=[];for(let f=C;f!==K;f=f.parent)f.scope&&p.unshift(f.scope);p.forEach(f=>A.openNode(f))}let Ne={};function Ot(p,f){const M=f&&f[0];if(I+=p,M==null)return j(),0;if(Ne.type==="begin"&&f.type==="end"&&Ne.index===f.index&&M===""){if(I+=b.slice(f.index,f.index+1),!o){const E=new Error(`0 width match regex (${u})`);throw E.languageName=u,E.badRule=Ne.rule,E}return 1}if(Ne=f,f.type==="begin")return ea(f);if(f.type==="illegal"&&!w){const E=new Error('Illegal lexeme "'+M+'" for mode "'+(C.scope||"<unnamed>")+'"');throw E.mode=C,E}else if(f.type==="end"){const E=ta(f);if(E!==Qt)return E}if(f.type==="illegal"&&M==="")return 1;if(tt>1e5&&tt>f.index*3)throw new Error("potential infinite loop, way more iterations than matches");return I+=M,M.length}const K=z(u);if(!K)throw ie(s.replace("{}",u)),new Error('Unknown language: "'+u+'"');const aa=fl(K);let et="",C=S||aa;const Lt={},A=new i.__emitter(i);ra();let I="",Ue=0,se=0,tt=0,rt=!1;try{if(K.__emitTokens)K.__emitTokens(b,A);else{for(C.matcher.considerAll();;){tt++,rt?rt=!1:C.matcher.considerAll(),C.matcher.lastIndex=se;const p=C.matcher.exec(b);if(!p)break;const f=b.substring(se,p.index),M=Ot(f,p);se=p.index+M}Ot(b.substring(se))}return A.finalize(),et=A.toHTML(),{language:u,value:et,relevance:Ue,illegal:!1,_emitter:A,_top:C}}catch(p){if(p.message&&p.message.includes("Illegal"))return{language:u,value:lt(b),illegal:!0,relevance:0,_illegalBy:{message:p.message,index:se,context:b.slice(se-100,se+100),mode:p.mode,resultSoFar:et},_emitter:A};if(o)return{language:u,value:lt(b),illegal:!1,relevance:0,errorRaised:p,_emitter:A,_top:C};throw p}}function k(u){const b={value:lt(u),illegal:!1,relevance:0,_top:d,_emitter:new i.__emitter(i)};return b._emitter.addText(u),b}function g(u,b){b=b||i.languages||Object.keys(r);const w=k(u),S=b.filter(z).filter(ge).map(j=>x(j,u,!1));S.unshift(w);const T=S.sort((j,q)=>{if(j.relevance!==q.relevance)return q.relevance-j.relevance;if(j.language&&q.language){if(z(j.language).supersetOf===q.language)return 1;if(z(q.language).supersetOf===j.language)return-1}return 0}),[O,B]=T,Ae=O;return Ae.secondBest=B,Ae}function D(u,b,w){const S=b&&a[b]||w;u.classList.add("hljs"),u.classList.add(`language-${S}`)}function N(u){let b=null;const w=h(u);if(c(w))return;if(re("before:highlightElement",{el:u,language:w}),u.children.length>0&&(i.ignoreUnescapedHTML||(console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."),console.warn("https://github.com/highlightjs/highlight.js/wiki/security"),console.warn("The element with unescaped HTML:"),console.warn(u)),i.throwUnescapedHTML))throw new Cl("One of your code blocks includes unescaped HTML.",u.innerHTML);b=u;const S=b.textContent,T=w?m(S,{language:w,ignoreIllegals:!0}):g(S);u.innerHTML=T.value,D(u,w,T.language),u.result={language:T.language,re:T.relevance,relevance:T.relevance},T.secondBest&&(u.secondBest={language:T.secondBest.language,relevance:T.secondBest.relevance}),re("after:highlightElement",{el:u,result:T,text:S})}function F(u){i=Zt(i,u)}const ve=()=>{X(),he("10.6.0","initHighlighting() deprecated.  Use highlightAll() now.")};function J(){X(),he("10.6.0","initHighlightingOnLoad() deprecated.  Use highlightAll() now.")}let G=!1;function X(){if(document.readyState==="loading"){G=!0;return}document.querySelectorAll(i.cssSelector).forEach(N)}function Y(){G&&X()}typeof window<"u"&&window.addEventListener&&window.addEventListener("DOMContentLoaded",Y,!1);function $(u,b){let w=null;try{w=b(t)}catch(S){if(ie("Language definition for '{}' could not be registered.".replace("{}",u)),o)ie(S);else throw S;w=d}w.name||(w.name=u),r[u]=w,w.rawDefinition=b.bind(null,t),w.aliases&&xe(w.aliases,{languageName:u})}function we(u){delete r[u];for(const b of Object.keys(a))a[b]===u&&delete a[b]}function de(){return Object.keys(r)}function z(u){return u=(u||"").toLowerCase(),r[u]||r[a[u]]}function xe(u,{languageName:b}){typeof u=="string"&&(u=[u]),u.forEach(w=>{a[w.toLowerCase()]=b})}function ge(u){const b=z(u);return b&&!b.disableAutodetect}function Ce(u){u["before:highlightBlock"]&&!u["before:highlightElement"]&&(u["before:highlightElement"]=b=>{u["before:highlightBlock"](Object.assign({block:b.el},b))}),u["after:highlightBlock"]&&!u["after:highlightElement"]&&(u["after:highlightElement"]=b=>{u["after:highlightBlock"](Object.assign({block:b.el},b))})}function Me(u){Ce(u),n.push(u)}function Se(u){const b=n.indexOf(u);b!==-1&&n.splice(b,1)}function re(u,b){const w=u;n.forEach(function(S){S[w]&&S[w](b)})}function oe(u){return he("10.7.0","highlightBlock will be removed entirely in v12.0"),he("10.7.0","Please use highlightElement now."),N(u)}Object.assign(t,{highlight:m,highlightAuto:g,highlightAll:X,highlightElement:N,highlightBlock:oe,configure:F,initHighlighting:ve,initHighlightingOnLoad:J,registerLanguage:$,unregisterLanguage:we,listLanguages:de,getLanguage:z,registerAliases:xe,autoDetection:ge,inherit:Zt,addPlugin:Me,removePlugin:Se}),t.debugMode=function(){o=!1},t.safeMode=function(){o=!0},t.versionString=wl,t.regex={concat:me,lookahead:Or,either:Ct,optional:_n,anyNumberOfTimes:Hn};for(const u in _e)typeof _e[u]=="object"&&Pr(_e[u]);return Object.assign(t,_e),t},ye=Fr({});ye.newInstance=()=>Fr({});var Sl=ye;ye.HighlightJS=ye;ye.default=ye;const W=Ln(Sl),Ve="[A-Za-z$_][0-9A-Za-z$_]*",$r=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends"],jr=["true","false","null","undefined","NaN","Infinity"],Vr=["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],zr=["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"],Jr=["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],Wr=["arguments","this","super","console","window","document","localStorage","sessionStorage","module","global"],Gr=[].concat(Jr,Vr,zr);function Tl(t){const r=t.regex,a=(b,{after:w})=>{const S="</"+b[0].slice(1);return b.input.indexOf(S,w)!==-1},n=Ve,o={begin:"<>",end:"</>"},s=/<[A-Za-z0-9\\._:-]+\s*\/>/,d={begin:/<[A-Za-z0-9\\._:-]+/,end:/\/[A-Za-z0-9\\._:-]+>|\/>/,isTrulyOpeningTag:(b,w)=>{const S=b[0].length+b.index,T=b.input[S];if(T==="<"||T===","){w.ignoreMatch();return}T===">"&&(a(b,{after:S})||w.ignoreMatch());let O;const B=b.input.substring(S);if(O=B.match(/^\s*=/)){w.ignoreMatch();return}if((O=B.match(/^\s+extends\s+/))&&O.index===0){w.ignoreMatch();return}}},i={$pattern:Ve,keyword:$r,literal:jr,built_in:Gr,"variable.language":Wr},c="[0-9](_?[0-9])*",h=`\\.(${c})`,m="0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",x={className:"number",variants:[{begin:`(\\b(${m})((${h})|\\.)?|(${h}))[eE][+-]?(${c})\\b`},{begin:`\\b(${m})\\b((${h})\\b|\\.)?|(${h})\\b`},{begin:"\\b(0|[1-9](_?[0-9])*)n\\b"},{begin:"\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"},{begin:"\\b0[bB][0-1](_?[0-1])*n?\\b"},{begin:"\\b0[oO][0-7](_?[0-7])*n?\\b"},{begin:"\\b0[0-7]+n?\\b"}],relevance:0},k={className:"subst",begin:"\\$\\{",end:"\\}",keywords:i,contains:[]},g={begin:"html`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,k],subLanguage:"xml"}},D={begin:"css`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,k],subLanguage:"css"}},N={begin:"gql`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,k],subLanguage:"graphql"}},F={className:"string",begin:"`",end:"`",contains:[t.BACKSLASH_ESCAPE,k]},J={className:"comment",variants:[t.COMMENT(/\/\*\*(?!\/)/,"\\*/",{relevance:0,contains:[{begin:"(?=@[A-Za-z]+)",relevance:0,contains:[{className:"doctag",begin:"@[A-Za-z]+"},{className:"type",begin:"\\{",end:"\\}",excludeEnd:!0,excludeBegin:!0,relevance:0},{className:"variable",begin:n+"(?=\\s*(-)|$)",endsParent:!0,relevance:0},{begin:/(?=[^\n])\s/,relevance:0}]}]}),t.C_BLOCK_COMMENT_MODE,t.C_LINE_COMMENT_MODE]},G=[t.APOS_STRING_MODE,t.QUOTE_STRING_MODE,g,D,N,F,{match:/\$\d+/},x];k.contains=G.concat({begin:/\{/,end:/\}/,keywords:i,contains:["self"].concat(G)});const X=[].concat(J,k.contains),Y=X.concat([{begin:/\(/,end:/\)/,keywords:i,contains:["self"].concat(X)}]),$={className:"params",begin:/\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:Y},we={variants:[{match:[/class/,/\s+/,n,/\s+/,/extends/,/\s+/,r.concat(n,"(",r.concat(/\./,n),")*")],scope:{1:"keyword",3:"title.class",5:"keyword",7:"title.class.inherited"}},{match:[/class/,/\s+/,n],scope:{1:"keyword",3:"title.class"}}]},de={relevance:0,match:r.either(/\bJSON/,/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),className:"title.class",keywords:{_:[...Vr,...zr]}},z={label:"use_strict",className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},xe={variants:[{match:[/function/,/\s+/,n,/(?=\s*\()/]},{match:[/function/,/\s*(?=\()/]}],className:{1:"keyword",3:"title.function"},label:"func.def",contains:[$],illegal:/%/},ge={relevance:0,match:/\b[A-Z][A-Z_0-9]+\b/,className:"variable.constant"};function Ce(b){return r.concat("(?!",b.join("|"),")")}const Me={match:r.concat(/\b/,Ce([...Jr,"super","import"]),n,r.lookahead(/\(/)),className:"title.function",relevance:0},Se={begin:r.concat(/\./,r.lookahead(r.concat(n,/(?![0-9A-Za-z$_(])/))),end:n,excludeBegin:!0,keywords:"prototype",className:"property",relevance:0},re={match:[/get|set/,/\s+/,n,/(?=\()/],className:{1:"keyword",3:"title.function"},contains:[{begin:/\(\)/},$]},oe="(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|"+t.UNDERSCORE_IDENT_RE+")\\s*=>",u={match:[/const|var|let/,/\s+/,n,/\s*/,/=\s*/,/(async\s*)?/,r.lookahead(oe)],keywords:"async",className:{1:"keyword",3:"title.function"},contains:[$]};return{name:"JavaScript",aliases:["js","jsx","mjs","cjs"],keywords:i,exports:{PARAMS_CONTAINS:Y,CLASS_REFERENCE:de},illegal:/#(?![$_A-z])/,contains:[t.SHEBANG({label:"shebang",binary:"node",relevance:5}),z,t.APOS_STRING_MODE,t.QUOTE_STRING_MODE,g,D,N,F,J,{match:/\$\d+/},x,de,{className:"attr",begin:n+r.lookahead(":"),relevance:0},u,{begin:"("+t.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",relevance:0,contains:[J,t.REGEXP_MODE,{className:"function",begin:oe,returnBegin:!0,end:"\\s*=>",contains:[{className:"params",variants:[{begin:t.UNDERSCORE_IDENT_RE,relevance:0},{className:null,begin:/\(\s*\)/,skip:!0},{begin:/\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:Y}]}]},{begin:/,/,relevance:0},{match:/\s+/,relevance:0},{variants:[{begin:o.begin,end:o.end},{match:s},{begin:d.begin,"on:begin":d.isTrulyOpeningTag,end:d.end}],subLanguage:"xml",contains:[{begin:d.begin,end:d.end,skip:!0,contains:["self"]}]}]},xe,{beginKeywords:"while if switch catch for"},{begin:"\\b(?!function)"+t.UNDERSCORE_IDENT_RE+"\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",returnBegin:!0,label:"func.def",contains:[$,t.inherit(t.TITLE_MODE,{begin:n,className:"title.function"})]},{match:/\.\.\./,relevance:0},Se,{match:"\\$"+n,relevance:0},{match:[/\bconstructor(?=\s*\()/],className:{1:"title.function"},contains:[$]},Me,ge,we,re,{match:/\$[(.]/}]}}function Tt(t){const r=Tl(t),a=Ve,n=["any","void","number","boolean","string","object","never","symbol","bigint","unknown"],o={beginKeywords:"namespace",end:/\{/,excludeEnd:!0,contains:[r.exports.CLASS_REFERENCE]},s={beginKeywords:"interface",end:/\{/,excludeEnd:!0,keywords:{keyword:"interface extends",built_in:n},contains:[r.exports.CLASS_REFERENCE]},d={className:"meta",relevance:10,begin:/^\s*['"]use strict['"]/},i=["type","namespace","interface","public","private","protected","implements","declare","abstract","readonly","enum","override"],c={$pattern:Ve,keyword:$r.concat(i),literal:jr,built_in:Gr.concat(n),"variable.language":Wr},h={className:"meta",begin:"@"+a},m=(k,g,D)=>{const N=k.contains.findIndex(F=>F.label===g);if(N===-1)throw new Error("can not find mode to replace");k.contains.splice(N,1,D)};Object.assign(r.keywords,c),r.exports.PARAMS_CONTAINS.push(h),r.contains=r.contains.concat([h,o,s]),m(r,"shebang",t.SHEBANG()),m(r,"use_strict",d);const x=r.contains.find(k=>k.label==="func.def");return x.relevance=0,Object.assign(r,{name:"TypeScript",aliases:["ts","tsx","mts","cts"]}),r}const er="[A-Za-z$_][0-9A-Za-z$_]*",El=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends"],Dl=["true","false","null","undefined","NaN","Infinity"],Xr=["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],qr=["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"],Kr=["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],Pl=["arguments","this","super","console","window","document","localStorage","sessionStorage","module","global"],Il=[].concat(Kr,Xr,qr);function Yr(t){const r=t.regex,a=(b,{after:w})=>{const S="</"+b[0].slice(1);return b.input.indexOf(S,w)!==-1},n=er,o={begin:"<>",end:"</>"},s=/<[A-Za-z0-9\\._:-]+\s*\/>/,d={begin:/<[A-Za-z0-9\\._:-]+/,end:/\/[A-Za-z0-9\\._:-]+>|\/>/,isTrulyOpeningTag:(b,w)=>{const S=b[0].length+b.index,T=b.input[S];if(T==="<"||T===","){w.ignoreMatch();return}T===">"&&(a(b,{after:S})||w.ignoreMatch());let O;const B=b.input.substring(S);if(O=B.match(/^\s*=/)){w.ignoreMatch();return}if((O=B.match(/^\s+extends\s+/))&&O.index===0){w.ignoreMatch();return}}},i={$pattern:er,keyword:El,literal:Dl,built_in:Il,"variable.language":Pl},c="[0-9](_?[0-9])*",h=`\\.(${c})`,m="0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",x={className:"number",variants:[{begin:`(\\b(${m})((${h})|\\.)?|(${h}))[eE][+-]?(${c})\\b`},{begin:`\\b(${m})\\b((${h})\\b|\\.)?|(${h})\\b`},{begin:"\\b(0|[1-9](_?[0-9])*)n\\b"},{begin:"\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"},{begin:"\\b0[bB][0-1](_?[0-1])*n?\\b"},{begin:"\\b0[oO][0-7](_?[0-7])*n?\\b"},{begin:"\\b0[0-7]+n?\\b"}],relevance:0},k={className:"subst",begin:"\\$\\{",end:"\\}",keywords:i,contains:[]},g={begin:"html`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,k],subLanguage:"xml"}},D={begin:"css`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,k],subLanguage:"css"}},N={begin:"gql`",end:"",starts:{end:"`",returnEnd:!1,contains:[t.BACKSLASH_ESCAPE,k],subLanguage:"graphql"}},F={className:"string",begin:"`",end:"`",contains:[t.BACKSLASH_ESCAPE,k]},J={className:"comment",variants:[t.COMMENT(/\/\*\*(?!\/)/,"\\*/",{relevance:0,contains:[{begin:"(?=@[A-Za-z]+)",relevance:0,contains:[{className:"doctag",begin:"@[A-Za-z]+"},{className:"type",begin:"\\{",end:"\\}",excludeEnd:!0,excludeBegin:!0,relevance:0},{className:"variable",begin:n+"(?=\\s*(-)|$)",endsParent:!0,relevance:0},{begin:/(?=[^\n])\s/,relevance:0}]}]}),t.C_BLOCK_COMMENT_MODE,t.C_LINE_COMMENT_MODE]},G=[t.APOS_STRING_MODE,t.QUOTE_STRING_MODE,g,D,N,F,{match:/\$\d+/},x];k.contains=G.concat({begin:/\{/,end:/\}/,keywords:i,contains:["self"].concat(G)});const X=[].concat(J,k.contains),Y=X.concat([{begin:/\(/,end:/\)/,keywords:i,contains:["self"].concat(X)}]),$={className:"params",begin:/\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:Y},we={variants:[{match:[/class/,/\s+/,n,/\s+/,/extends/,/\s+/,r.concat(n,"(",r.concat(/\./,n),")*")],scope:{1:"keyword",3:"title.class",5:"keyword",7:"title.class.inherited"}},{match:[/class/,/\s+/,n],scope:{1:"keyword",3:"title.class"}}]},de={relevance:0,match:r.either(/\bJSON/,/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),className:"title.class",keywords:{_:[...Xr,...qr]}},z={label:"use_strict",className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},xe={variants:[{match:[/function/,/\s+/,n,/(?=\s*\()/]},{match:[/function/,/\s*(?=\()/]}],className:{1:"keyword",3:"title.function"},label:"func.def",contains:[$],illegal:/%/},ge={relevance:0,match:/\b[A-Z][A-Z_0-9]+\b/,className:"variable.constant"};function Ce(b){return r.concat("(?!",b.join("|"),")")}const Me={match:r.concat(/\b/,Ce([...Kr,"super","import"]),n,r.lookahead(/\(/)),className:"title.function",relevance:0},Se={begin:r.concat(/\./,r.lookahead(r.concat(n,/(?![0-9A-Za-z$_(])/))),end:n,excludeBegin:!0,keywords:"prototype",className:"property",relevance:0},re={match:[/get|set/,/\s+/,n,/(?=\()/],className:{1:"keyword",3:"title.function"},contains:[{begin:/\(\)/},$]},oe="(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|"+t.UNDERSCORE_IDENT_RE+")\\s*=>",u={match:[/const|var|let/,/\s+/,n,/\s*/,/=\s*/,/(async\s*)?/,r.lookahead(oe)],keywords:"async",className:{1:"keyword",3:"title.function"},contains:[$]};return{name:"JavaScript",aliases:["js","jsx","mjs","cjs"],keywords:i,exports:{PARAMS_CONTAINS:Y,CLASS_REFERENCE:de},illegal:/#(?![$_A-z])/,contains:[t.SHEBANG({label:"shebang",binary:"node",relevance:5}),z,t.APOS_STRING_MODE,t.QUOTE_STRING_MODE,g,D,N,F,J,{match:/\$\d+/},x,de,{className:"attr",begin:n+r.lookahead(":"),relevance:0},u,{begin:"("+t.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",relevance:0,contains:[J,t.REGEXP_MODE,{className:"function",begin:oe,returnBegin:!0,end:"\\s*=>",contains:[{className:"params",variants:[{begin:t.UNDERSCORE_IDENT_RE,relevance:0},{className:null,begin:/\(\s*\)/,skip:!0},{begin:/\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:i,contains:Y}]}]},{begin:/,/,relevance:0},{match:/\s+/,relevance:0},{variants:[{begin:o.begin,end:o.end},{match:s},{begin:d.begin,"on:begin":d.isTrulyOpeningTag,end:d.end}],subLanguage:"xml",contains:[{begin:d.begin,end:d.end,skip:!0,contains:["self"]}]}]},xe,{beginKeywords:"while if switch catch for"},{begin:"\\b(?!function)"+t.UNDERSCORE_IDENT_RE+"\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",returnBegin:!0,label:"func.def",contains:[$,t.inherit(t.TITLE_MODE,{begin:n,className:"title.function"})]},{match:/\.\.\./,relevance:0},Se,{match:"\\$"+n,relevance:0},{match:[/\bconstructor(?=\s*\()/],className:{1:"title.function"},contains:[$]},Me,ge,we,re,{match:/\$[(.]/}]}}function Zr(t){const r=t.regex,a=r.concat(/[\p{L}_]/u,r.optional(/[\p{L}0-9_.-]*:/u),/[\p{L}0-9_.-]*/u),n=/[\p{L}0-9._:-]+/u,o={className:"symbol",begin:/&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/},s={begin:/\s/,contains:[{className:"keyword",begin:/#?[a-z_][a-z1-9_-]+/,illegal:/\n/}]},d=t.inherit(s,{begin:/\(/,end:/\)/}),i=t.inherit(t.APOS_STRING_MODE,{className:"string"}),c=t.inherit(t.QUOTE_STRING_MODE,{className:"string"}),h={endsWithParent:!0,illegal:/</,relevance:0,contains:[{className:"attr",begin:n,relevance:0},{begin:/=\s*/,relevance:0,contains:[{className:"string",endsParent:!0,variants:[{begin:/"/,end:/"/,contains:[o]},{begin:/'/,end:/'/,contains:[o]},{begin:/[^\s"'=<>`]+/}]}]}]};return{name:"HTML, XML",aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist","wsf","svg"],case_insensitive:!0,unicodeRegex:!0,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,relevance:10,contains:[s,c,i,d,{begin:/\[/,end:/\]/,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,contains:[s,d,c,i]}]}]},t.COMMENT(/<!--/,/-->/,{relevance:10}),{begin:/<!\[CDATA\[/,end:/\]\]>/,relevance:10},o,{className:"meta",end:/\?>/,variants:[{begin:/<\?xml/,relevance:10,contains:[c]},{begin:/<\?[a-z][a-z0-9]+/}]},{className:"tag",begin:/<style(?=\s|>)/,end:/>/,keywords:{name:"style"},contains:[h],starts:{end:/<\/style>/,returnEnd:!0,subLanguage:["css","xml"]}},{className:"tag",begin:/<script(?=\s|>)/,end:/>/,keywords:{name:"script"},contains:[h],starts:{end:/<\/script>/,returnEnd:!0,subLanguage:["javascript","handlebars","xml"]}},{className:"tag",begin:/<>|<\/>/},{className:"tag",begin:r.concat(/</,r.lookahead(r.concat(a,r.either(/\/>/,/>/,/\s/)))),end:/\/?>/,contains:[{className:"name",begin:a,relevance:0,starts:h}]},{className:"tag",begin:r.concat(/<\//,r.lookahead(r.concat(a,/>/))),contains:[{className:"name",begin:a,relevance:0},{begin:/>/,relevance:0,endsParent:!0}]}]}}function Ol(t){const r=t.regex,a={},n={begin:/\$\{/,end:/\}/,contains:["self",{begin:/:-/,contains:[a]}]};Object.assign(a,{className:"variable",variants:[{begin:r.concat(/\$[\w\d#@][\w\d_]*/,"(?![\\w\\d])(?![$])")},n]});const o={className:"subst",begin:/\$\(/,end:/\)/,contains:[t.BACKSLASH_ESCAPE]},s={begin:/<<-?\s*(?=\w+)/,starts:{contains:[t.END_SAME_AS_BEGIN({begin:/(\w+)/,end:/(\w+)/,className:"string"})]}},d={className:"string",begin:/"/,end:/"/,contains:[t.BACKSLASH_ESCAPE,a,o]};o.contains.push(d);const i={className:"",begin:/\\"/},c={className:"string",begin:/'/,end:/'/},h={begin:/\$?\(\(/,end:/\)\)/,contains:[{begin:/\d+#[0-9a-f]+/,className:"number"},t.NUMBER_MODE,a]},m=["fish","bash","zsh","sh","csh","ksh","tcsh","dash","scsh"],x=t.SHEBANG({binary:`(${m.join("|")})`,relevance:10}),k={className:"function",begin:/\w[\w\d_]*\s*\(\s*\)\s*\{/,returnBegin:!0,contains:[t.inherit(t.TITLE_MODE,{begin:/\w[\w\d_]*/})],relevance:0},g=["if","then","else","elif","fi","for","while","until","in","do","done","case","esac","function","select"],D=["true","false"],N={match:/(\/[a-z._-]+)+/},F=["break","cd","continue","eval","exec","exit","export","getopts","hash","pwd","readonly","return","shift","test","times","trap","umask","unset"],ve=["alias","bind","builtin","caller","command","declare","echo","enable","help","let","local","logout","mapfile","printf","read","readarray","source","type","typeset","ulimit","unalias"],J=["autoload","bg","bindkey","bye","cap","chdir","clone","comparguments","compcall","compctl","compdescribe","compfiles","compgroups","compquote","comptags","comptry","compvalues","dirs","disable","disown","echotc","echoti","emulate","fc","fg","float","functions","getcap","getln","history","integer","jobs","kill","limit","log","noglob","popd","print","pushd","pushln","rehash","sched","setcap","setopt","stat","suspend","ttyctl","unfunction","unhash","unlimit","unsetopt","vared","wait","whence","where","which","zcompile","zformat","zftp","zle","zmodload","zparseopts","zprof","zpty","zregexparse","zsocket","zstyle","ztcp"],G=["chcon","chgrp","chown","chmod","cp","dd","df","dir","dircolors","ln","ls","mkdir","mkfifo","mknod","mktemp","mv","realpath","rm","rmdir","shred","sync","touch","truncate","vdir","b2sum","base32","base64","cat","cksum","comm","csplit","cut","expand","fmt","fold","head","join","md5sum","nl","numfmt","od","paste","ptx","pr","sha1sum","sha224sum","sha256sum","sha384sum","sha512sum","shuf","sort","split","sum","tac","tail","tr","tsort","unexpand","uniq","wc","arch","basename","chroot","date","dirname","du","echo","env","expr","factor","groups","hostid","id","link","logname","nice","nohup","nproc","pathchk","pinky","printenv","printf","pwd","readlink","runcon","seq","sleep","stat","stdbuf","stty","tee","test","timeout","tty","uname","unlink","uptime","users","who","whoami","yes"];return{name:"Bash",aliases:["sh"],keywords:{$pattern:/\b[a-z][a-z0-9._-]+\b/,keyword:g,literal:D,built_in:[...F,...ve,"set","shopt",...J,...G]},contains:[x,t.SHEBANG(),k,h,t.HASH_COMMENT_MODE,s,N,d,i,c,a]}}function Ll(t){const r={className:"attr",begin:/"(\\.|[^\\"\r\n])*"(?=\s*:)/,relevance:1.01},a={match:/[{}[\],:]/,className:"punctuation",relevance:0},n=["true","false","null"],o={scope:"literal",beginKeywords:n.join(" ")};return{name:"JSON",keywords:{literal:n},contains:[r,a,t.QUOTE_STRING_MODE,o,t.C_NUMBER_MODE,t.C_LINE_COMMENT_MODE,t.C_BLOCK_COMMENT_MODE],illegal:"\\S"}}W.registerLanguage("typescript",Tt);W.registerLanguage("tsx",Tt);W.registerLanguage("javascript",Yr);W.registerLanguage("js",Yr);W.registerLanguage("xml",Zr);W.registerLanguage("html",Zr);W.registerLanguage("jsx",Tt);W.registerLanguage("bash",Ol);W.registerLanguage("json",Ll);const Rl=t=>t.includes("lTag`"),Al=t=>t.replace(/lTag`/g,"html`"),Nl=t=>t.replace(/html`/g,"lTag`"),l=en(()=>{const t=V(null);return te(()=>{var d;if(!t.value)return;const r=((d=t.value.className.match(/language-(\w+)/))==null?void 0:d[1])||"typescript";if(r==="bash"){W.highlightElement(t.value),t.value.innerHTML&&(t.value.innerHTML=t.value.innerHTML.replace(/^(\s*)\$(\s)/gm,'$1<span class="bash-prompt">$</span>$2'));return}const a=t.value.textContent||"",n=Rl(a),o=n?Al(a):a,s=W.highlight(o,{language:r}).value;t.value.innerHTML=n?Nl(s):s}),({code:r,language:a})=>e("pre",{class:"code-block bg-gray-100 dark:bg-[#1e1e1e] p-6 rounded-lg overflow-x-auto mb-6 text-xs md:text-sm border border-gray-200 dark:border-gray-800",children:e("code",{ref:t,class:`language-${a||"typescript"}`,children:r})})}),pt=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Introduction"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent is a lightweight JavaScript library for building small, predictable pieces of UI.",e("br",{}),"It removes unnecessary magic or complex APIs so you can focus on a simple and fully predictable programming model."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"Why does Lithent exist?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["You still need a dependable library when you care about"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"lightweight DOM manipulation in size-sensitive environments"}),". Most frameworks are powerful, but they tend to be heavy for small projects or embedded widgets.",e("br",{}),e("br",{}),"Lithent was designed for that gap."," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"The Core package alone can drive a complete UI"}),". When you need state management or a reactive system,"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"optional Helpers plug in like expansion packs"}),"without forcing new concepts on the project.",e("br",{}),e("br",{}),"Take only what you need so the stack can scale with the team, the product, and the runtime requirements."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"How do you use it?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent exposes two primary styles:"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Manual control"})," ","and"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Declarative Light API mode"}),". Mix and match both approaches inside the same project without friction."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Manual mode"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["State lives inside the most familiar JavaScript construct:"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"closures"}),". Forget custom languages or hidden dependency tracking—you declare variables, mutate them, and the flow stays obvious and readable.",e("br",{}),e("br",{}),"Inside this transparent flow,",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"renew()"}),"simply asks Lithent to refresh the view. After mutating state, call renew() to update the UI—no hidden queues or implicit subscriptions.",e("br",{}),e("br",{}),"Pairing closures with this tiny API keeps updates 100% predictable and in your control. This is the natural developer experience Lithent optimizes for.",e("br",{}),e("br",{}),"Because there is no mandatory global state mechanism, the library stays slim and you stay in plain JavaScript."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const App = mount((renew, _props) => {
  let count = 0;

  const inc = () => {
    count += 1;
    renew();
  };

  // Wrapping JSX in a returned function keeps state inside a closure.
  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Declarative Light API mode"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["This pattern automatically reflects state changes in the UI. The",e("code",{children:"lstate"})," API ships through loosely coupled helpers, so you only import it when the project actually needs it. Bring in state, context, and other helpers a la carte."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const inc = () => {
    count.value += 1;
  };

  // Wrapping JSX in a returned function keeps state inside a closure.
  return () => (
    <div>
      <p>{count.value}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Heads-up:"})," ","Stateless UI does not require mount or lmount—just write a plain function component in Lithent style (for example"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:["(","{ props, children }",")"]}),"is not necessary). A Lithent function component looks like"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:["(","{ title }",", children)"]}),". Read more in the"," ",e("a",{href:"/guide/stateless",onClick:t=>{t.preventDefault(),y("/guide/stateless")},class:"text-[#42b883] hover:underline",children:"Stateless Components"})," ","section."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Gradual adoption"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:"Lithent can slot into almost any web stack:"}),e("ul",{class:"list-disc list-inside space-y-2 mb-6 ml-4 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"Progressively enhance static HTML—no build step required"}),e("li",{children:"Single-page applications (SPA)"}),e("li",{children:"Server-side rendering (SSR)"})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What’s next"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/quick-start",onClick:t=>{t.preventDefault(),y("/guide/quick-start")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Quick start →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"Now that you know the core philosophy, jump into the Quick Start guide to see Lithent in action."})]})})]}),Ul=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Quick start"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4",children:"Creating a Lithent application"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("p",{class:"text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3",children:"📋 Prerequisites"}),e("ul",{class:"space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("span",{children:"Basic command line experience"})]}),e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("span",{children:[e("strong",{class:"font-medium text-gray-900 dark:text-white",children:"Node.js 18.12"})," ","or higher installed"]})]})]})]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"This section walks through creating a Lithent application on your local machine. The generated project uses a Vite-based build setup."}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Make sure you are running a recent Node.js version and that your current working directory is where you want the project folder to live. Then run the following command in your terminal (do not type the leading"," ",e("code",{children:"$"}),"):"]}),e(l,{language:"bash",code:"$ npx create-lithent@latest"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["This command installs and runs ",e("code",{children:"create-lithent"}),", the official Lithent scaffolding tool.",e("br",{}),e("br",{}),"It will prompt you for a project name and template type:"]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("p",{class:"text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3",children:"📦 Template types"}),e("ul",{class:"space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("div",{children:[e("strong",{class:"font-medium text-gray-900 dark:text-white",children:"SSR (Express)"}),": Express-based template with server-side rendering support. Great when SEO matters or you want to optimize perceived first-load performance."]})]}),e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("div",{children:[e("strong",{class:"font-medium text-gray-900 dark:text-white",children:"SPA (Vite)"}),": Vite-based template for pure client-side rendering. Ideal for fast DX and simple deployments."]})]})]})]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Once the project is scaffolded, follow the prompts to install dependencies and start the dev server:"}),e(l,{language:"bash",code:`$ cd <your-project-name>
$ npm install
$ npm run dev`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Your first Lithent project should now be running.",e("br",{}),"Lithent supports multiple template styles, but the default starter uses JSX.",e("br",{}),e("br",{}),"When you are ready to ship to production, run:"]}),e(l,{language:"bash",code:"$ npm run build"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["This creates a production build under ",e("code",{children:"./dist"}),"."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4",children:"Using Lithent from a CDN"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"You can load Lithent directly from a CDN via a script tag:"}),e(l,{language:"bash",code:'<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"><\/script>'}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["When using Lithent from a CDN you do not need a build step. This makes setup much simpler and works well for enhancing static HTML or integrating into an existing backend framework.",e("br",{}),e("br",{}),"JSX is not available in this setup. Instead, you can use"," ",e("code",{children:"ftags"})," to build templates in a functional style or wire it up with ",e("code",{children:"htm"}),"."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["Here is an example using ",e("code",{children:"ftags"}),"."]}),e(l,{language:"html",code:`<!DOCTYPE html>
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
</html>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["This example uses ",e("code",{children:"flMount"}),", but you can also use",e("code",{children:"fMount"}),".",e("br",{}),e("br",{}),"With ",e("code",{children:"fMount"}),", helpers like ",e("code",{children:"lstate"})," are no longer required, so you can skip loading the helper bundle and reduce network overhead."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["When loading Lithent directly in the browser, ",e("code",{children:"ftags"})," can be very handy.",e("br",{}),e("br",{}),"Alternatively, you can use ",e("code",{children:"htm"})," instead of ftags. That approach is covered in more detail in a separate section."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4",children:"Using the ES module build"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"You can also use the ES module build of Lithent. Most modern browsers natively support ES modules, so you can load Lithent directly as a module from a CDN:"}),e(l,{language:"html",code:`<!DOCTYPE html>
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
</html>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["For security reasons, ES modules only run over the ",e("code",{children:"http://"})," or",e("code",{children:"https://"})," protocols—the ones browsers use when loading pages from the web. To use ES modules locally, you should serve files through a local HTTP server instead of opening them directly with the",e("code",{children:"file://"})," protocol."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What’s next"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/mounter",onClick:t=>{t.preventDefault(),y("/guide/mounter")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core feature: Mounter →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Learn about Mounter, one of the core concepts in Lithent.",e("br",{}),"You will see how to create and initialize components step by step."]})]})})]}),Hl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mounter"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mount"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["A mounter is the function you pass into the ",e("code",{children:"mount"})," API.",e("br",{}),"It is called"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"exactly once when the component is first rendered"}),"and is responsible for defining the component's state and methods.",e("br",{}),e("br",{}),"In the example below, the mounter defines a ",e("code",{children:"count"})," state with an initial value of ",e("code",{children:"0"})," and an ",e("code",{children:"increase"})," function that increments it by 1."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const App = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  // Updater
  // Wrapping JSX in a returned function keeps state inside a closure.
  return () => (
    <div>
      <p>{count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["The first argument passed into ",e("code",{children:"mount"}),","," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"renew"}),", is the function used to trigger a re-render of the component.",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Renewer"}),"covers this behavior in more detail."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"The mounter returns another function that contains the JSX expression. This returned function is called the updater, which we will explore in the next section."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent's core model is to manage state via plain closures: you use normal variables as state and call the ",e("code",{children:"renew"})," API to refresh the UI.",e("br",{}),e("br",{}),"However, many developers are used to a React-like pattern where state changes automatically trigger UI updates. In those cases, explicitly calling ",e("code",{children:"renew"})," can feel noisy or cumbersome.",e("br",{}),e("br",{}),"Instead of ",e("code",{children:"mount"}),", you can pair"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lmount"})," ","with"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lstate"})," ","to get a more automatic, reactive style. In the example below,",e("code",{children:"lstate"})," stores the state, and any change to its"," ",e("code",{children:"value"})," property immediately re-renders the UI."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const App = lmount((_props) => {
  const countRef = lstate(0);

  const increase = () => {
    countRef.value += 1;
  };

  // Updater
  // Wrapping JSX in a returned function keeps state inside a closure.
  return () => (
    <div>
      <p>{countRef.count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Thanks to ",e("code",{children:"lstate"}),", you no longer need the ",e("code",{children:"renew"})," ","API, so ",e("code",{children:"lmount"})," does not expose it and components stay more concise.",e("br",{}),e("br",{}),"Because ",e("code",{children:"lstate"})," comes from a helper module, you will ship a slightly larger bundle than with the Core-only setup—but in many apps the ergonomics are worth it.",e("br",{}),e("br",{}),"This mode still uses closures under the hood, but since"," ",e("code",{children:"lstate"})," hides explicit ",e("code",{children:"renew"}),' calls, it can make the "closure-based" mental model of Lithent feel less obvious.']}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Data fetching example"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Fetching data inside a mounter is a pattern reserved for"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"specific, constrained use cases"}),".",e("br",{}),e("br",{}),"It is helpful when you need to fetch data"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"exactly once for the lifetime of the component"}),". The mounter only runs when the component is first created, so even if props change later, the data will not be re-fetched.",e("br",{}),e("br",{}),"A typical example is loading detail data based on an ID from the URL: you only need to fetch once when the page loads. If you need to re-fetch when props change, use ",e("code",{children:"updateCallback"})," or"," ",e("code",{children:"effect"})," instead."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["In the example below, the component receives a Pokemon name via props and calls the API once when the component mounts. A ",e("code",{children:"loading"})," flag is used to indicate progress and update the UI once the data arrives."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["The ",e("code",{children:"loadDetail"})," function is"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"executed exactly once when the component first mounts"}),"."]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Note:"})," ","This pattern is not a good fit if the user should browse multiple Pokemon in the same view. If you want to fetch another Pokemon on button click, move the fetching logic into an event handler instead of the mounter. If new data should load whenever props change, use"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"updateCallback"})," ","or"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"effect"})," ","instead."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What’s next"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/updater",onClick:t=>{t.preventDefault(),y("/guide/updater")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core feature: Updater →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["If the mounter runs only once, the updater runs every time state changes.",e("br",{}),"Learn how the updater builds new virtual DOM and updates the screen."]})]})})]}),_l=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Updater"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What is an Updater?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["An Updater is the function returned by the mounter. While the mounter runs"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"exactly once when the component is created"}),", the Updater is"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"called every time state changes"}),".",e("br",{}),e("br",{}),"Its job is to"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"build a new virtual DOM tree from the current state"}),". Lithent then diffs this new tree against the previous one and applies only the minimal changes to the real DOM."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const Counter = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew(); // Re-run the Updater and refresh the view
  };

  // 👇 This returned function is the Updater
  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["In this example, the arrow function returned from the mounter is the Updater. Every time ",e("code",{children:"renew()"})," is called, this function runs again to produce a fresh virtual DOM tree."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Accessing state via closures"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Because the Updater is defined inside the mounter, it has access to everything the mounter declared through JavaScript closures. This is the core of Lithent's"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"closure-based state management"}),"model."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const TodoList = mount((renew, _props) => {
  // State and methods defined in the mounter
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

  // The Updater can access all of the above via closure
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Inside the Updater you can freely use ",e("code",{children:"todos"}),","," ",e("code",{children:"inputValue"}),", ",e("code",{children:"addTodo"}),", ",e("code",{children:"removeTodo"}),", and anything else defined in the mounter. This is just standard JavaScript closure behavior."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Updaters with lmount"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["When using ",e("code",{children:"lmount"}),", the Updater works the same way conceptually. The main difference is that you do not call"," ",e("code",{children:"renew"})," explicitly: whenever an ",e("code",{children:"lstate"})," value changes, the Updater runs automatically."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const increase = () => {
    count.value += 1; // Changing lstate.value automatically triggers the Updater
  };

  // This returned function is the Updater
  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["When you update ",e("code",{children:"lstate.value"}),", Lithent internally calls",e("code",{children:"renew"})," for you and re-runs the Updater. A new virtual DOM tree is produced and the view updates accordingly."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Updater lifecycle"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"The update flow for a Lithent component looks like this:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"State changes (plain variable or lstate.value)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:[e("code",{children:"renew()"})," is called (manually or automatically by lstate)"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Updater runs → new virtual DOM is created"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"Previous and new virtual DOM are diffed"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"Only the changed parts are patched into the real DOM"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"This flow lets Lithent update the UI efficiently. The Updater can freely return a full virtual DOM tree every time, but only the minimal changes touch the real DOM."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What’s next"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/props",onClick:t=>{t.preventDefault(),y("/guide/props")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core feature: Props →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Learn how Props are used to pass data between components.",e("br",{}),"You'll see how parent components provide data and callbacks to children."]})]})})]}),Bl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Props"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What are Props?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Props are how a parent component passes data down to a child component.",e("br",{}),e("br",{}),"In Lithent, props are provided as"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"the second argument to the mounter"}),"and also as"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"the first argument to the Updater"}),". The same props reference is preserved for the lifetime of the component."]}),e(l,{language:"tsx",code:`import { mount, render } from 'lithent';

type Props = { name: string; age: number };

const UserCard = mount<Props>((renew, props) => {
  // props is the second argument of the mounter

  return (propsFromUpdater) => (
    // props is also passed as the first argument to the Updater
    <div>
      <h2>{props.name}</h2>
      <p>Age: {props.age}</p>
    </div>
  );
});

render(
  <UserCard name="Alice" age={25} />,
  document.getElementById('root')
);`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["When using TypeScript, you can define the Props type as the generic parameter of ",e("code",{children:"mount"})," for better type safety."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Access patterns and gotchas"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Props keep the same"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"reference"})," ","throughout the component's lifetime. This is important because the way you access props can change the behavior you see."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

type Props = { count: number };

const Counter = mount<Props>((renew, props) => {
  // ⚠️ Be careful: destructuring props in the mounter
  const { count: countFromMounter } = props;

  return ({ count: countFromUpdater }) => (
    <>
      {/* ✅ Always up to date – direct props access */}
      <div>count: {props.count}</div>

      {/* ❌ Stale value – primitive copied in the mounter */}
      <div>count: {countFromMounter} (does not update)</div>

      {/* ✅ Always up to date – props from the Updater */}
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["When you click the button in the example above:",e("br",{}),e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"props.count"})," ","- ✅ becomes 1, 2, 3... as expected",e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"countFromMounter"})," ","- ❌ stays fixed at 0 (primitive copied by value)",e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"countFromUpdater"})," ","- ✅ becomes 1, 2, 3... as expected"]}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ Important:"})," If you destructure props inside the mounter, the values are ",e("strong",{children:"copied"}),' at that time. For primitive types (number, string, boolean) this behaves like "call by value", so those destructured variables will not update when props change later.',e("br",{}),e("br",{}),"To always get the latest values, prefer accessing"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"props.propertyName"}),"directly or using the props object passed into the Updater."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Passing functions as props"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Props can carry not only data but also functions. This lets child components update state that lives in their parents."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Functions are reference types, so a function passed through props always keeps the parent component's closure. This makes it safe for children to drive updates to parent state."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Object and array props"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"When you pass an object or array as props, the reference is passed. Even if you destructure it in the mounter, you are copying the reference, so nested values stay in sync."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

type User = { name: string; age: number };
type Props = { user: User };

const UserCard = mount<Props>((renew, props) => {
  // Objects are reference types, so destructuring here is fine
  const { user } = props;

  return () => (
    <div>
      <h2>{user.name}</h2>
      <p>Age: {user.age}</p>
      {/* Accessing via props.user yields the same result */}
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Objects and arrays are reference types, so destructuring in the mounter still copies the reference. When nested values change, the UI will update correctly after ",e("code",{children:"renew"}),"."]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Note:"})," ","It's still a good idea to keep objects and arrays immutable where possible. Creating new objects instead of mutating existing ones makes data flow easier to reason about."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Props with lmount"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["When using ",e("code",{children:"lmount"}),", props behave the same way as with"," ",e("code",{children:"mount"}),". There is no ",e("code",{children:"renew"}),", but the access patterns and caveats are identical."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What’s next"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/children",onClick:t=>{t.preventDefault(),y("/guide/children")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core: Children →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Learn how Lithent handles children, the elements a component wraps around.",e("br",{}),"You'll see how children are managed separately from props."]})]})})]}),Fl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Children"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What are children?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Children are the"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"elements a component wraps around"}),".",e("br",{}),e("br",{}),"Unlike React, Lithent"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"passes children as a separate argument instead of bundling them into props"}),". This separation reflects Lithent's design philosophy of keeping configuration (props) and structure (children) clearly distinct."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const Card = mount<{ title: string }>(
  (renew, props, children) => {  // children is the third argument!
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

// Usage
<Card title="My Card">
  <p>This is the card content</p>
  <button>Click me</button>
</Card>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Differences from React"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent keeps children and props separate to make component structure easier to reason about."}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"React"}),e(l,{language:"tsx",code:`// React: children is part of props
const Card = ({ title, children }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};`})]}),e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"Lithent"}),e(l,{language:"tsx",code:`// Lithent: children is a separate argument
const Card = mount(
  (renew, props, children) => {
    return () => (
      <div class="card">
        <h2>{props.title}</h2>
        <div>{children}</div>
      </div>
    );
  }
);`})]})]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Why a separate argument?"})," ","Props describe configuration for a component, while children describe the nested structure. Keeping them separate clarifies intent and improves type safety."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Basic usage"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"Using children with mount"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const Container = mount<{ width: number }>(
  (renew, props, children) => {
    // children has type WDom[]
    // You can access it inside the mounter
    console.log('Children count:', children.length);

    return () => (
      <div style={{ width: \`\${props.width}px\` }}>
        {children}
      </div>
    );
  }
);

// Usage
<Container width={300}>
  <h1>Title</h1>
  <p>Content</p>
</Container>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Using children with lmount"}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';

const Container = lmount<{ width: number }>(
  (props, children) => {  // lmount passes only props and children
    return () => (
      <div style={{ width: \`\${props.width}px\` }}>
        {children}
      </div>
    );
  }
);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Children in the mounter vs the Updater"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["A key detail:"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"children are only passed into the mounter, not into the Updater."}),e("br",{}),e("br",{}),"The mounter runs when the component is first mounted and receives children at that time. The Updater, on the other hand, only runs when props change. Because children are already fixed by the mounter, they do not need to be passed again to the Updater."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const Container = mount<{ title: string }>(
  // Mounter: receives renew, props, and children
  (renew, props, children) => {
    console.log('Mounter - children:', children);

    // Updater: receives only props (no children argument)
    return (props) => {
      console.log('Updater - props:', props);
      // children cannot be accessed as an argument in the Updater

      return (
        <div>
          <h1>{props.title}</h1>
          {/* children still available via closure */}
          {children}
        </div>
      );
    };
  }
);`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Closure capture:"})," ","Even though the Updater does not receive children as an argument, it can still access the children defined in the mounter through closure. Whenever children truly change, the parent re-renders and the entire component is re-evaluated. When only props change, the Updater reuses the same children reference."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Why doesn't the Updater receive children?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"1. The Updater only reacts to prop changes"}),e("br",{}),"The Updater runs when props change. When children change, the parent re-renders and the whole component tree is re-evaluated, so there is no need to pass children as a separate argument at Updater time.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"2. Closures already provide access"}),e("br",{}),"Children received by the mounter are still available in the Updater via closure, so there is no need to pass them again.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"3. Clear separation of responsibilities"}),e("br",{}),"The mounter is responsible for setting up initial structure (including children), while the Updater focuses purely on prop-driven updates. This keeps each function's role clear."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Internal representation"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Internally, Lithent keeps children separate from props in the virtual DOM structure."}),e(l,{language:"typescript",code:`// Lithent internal structure (wDom.ts)
export interface WDom {
  type?: string | null;
  tag?: string;
  props?: Props;       // Props for regular elements
  children?: WDom[];   // Children of regular elements

  compProps?: Props;   // Props of custom components
  compChild?: WDom[];  // Children of custom components (managed separately)

  // ...
}

// h function signature
export const h = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateWDomChildren  // children are the rest arguments
) => {
  // ...
};`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Internal layout:"})," ","Lithent distinguishes between children of regular elements and children of components. Component props are stored in ",e("code",{children:"compProps"})," and component children in ",e("code",{children:"compChild"}),", which helps the runtime handle updates efficiently."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Practical examples"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"Layout components"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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

// Usage
<Layout sidebar={true}>
  <h1>Page Title</h1>
  <p>Page content goes here</p>
</Layout>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Conditional rendering"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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

// Usage
<Accordion title="Details">
  <p>This content is hidden by default</p>
  <p>Click the title to reveal it</p>
</Accordion>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Transforming children"}),e(l,{language:"tsx",code:`import { mount, Fragment } from 'lithent';

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

// Usage
<List ordered={false}>
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</List>
// Result:
// <ul>
//   <li><span>Item 1</span></li>
//   <li><span>Item 2</span></li>
//   <li><span>Item 3</span></li>
// </ul>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Slot pattern (named children)"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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

// Usage
<Card
  header={<h2>Card Title</h2>}
  footer={<button>Action</button>}
>
  <p>This is the main content</p>
</Card>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Render props pattern"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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

// Usage
<MouseTracker
  render={(x, y) => (
    <div>
      Mouse position: {x}, {y}
    </div>
  )}
>
  <p>Move your mouse around</p>
</MouseTracker>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Children type"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Children are represented as an array of ",e("code",{children:"WDom"}),". You can annotate this explicitly when using TypeScript."]}),e(l,{language:"typescript",code:`import { mount, WDom } from 'lithent';

// children has type WDom[]
const Container = mount<{ title: string }>(
  (renew, props, children: WDom[]) => {
    // You can freely transform the children array
    const hasChildren = children.length > 0;

    return () => (
      <div>
        <h1>{props.title}</h1>
        {hasChildren ? children : <p>No content</p>}
      </div>
    );
  }
);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Things to watch out for"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ No props.children:"})," In Lithent you cannot access children via ",e("code",{children:"props.children"}),". Always use the separate ",e("code",{children:"children"})," argument.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Argument order:"})," For",e("code",{children:"mount"}),", the order is ",e("code",{children:"(renew, props, children)"}),". For ",e("code",{children:"lmount"}),", it is ",e("code",{children:"(props, children)"}),". Do not swap them.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Children are arrays:"})," Children are always passed as a ",e("code",{children:"WDom[]"})," array, even when there is only a single child.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Not passed to the Updater:"})," Children are only provided to the mounter as an argument. In the Updater you should rely on closure to access them."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What’s next"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/renewer",onClick:t=>{t.preventDefault(),y("/guide/renewer")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core: Renewer →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["You now have a solid grasp of children.",e("br",{}),"Next, dive into Renewer to learn how components are updated."]})]})})]}),$l=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Renewer"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What is renew()?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{children:"renew()"})," is the"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"core function that updates a component"}),". It is provided as the first argument to ",e("code",{children:"mount"}),", and you call it whenever state changes and the UI needs to update.",e("br",{}),e("br",{}),"When you call ",e("code",{children:"renew()"}),", the Updater runs again to produce a new virtual DOM. Lithent then diffs it against the previous tree and applies only the changed parts to the real DOM."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const Counter = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew(); // 👈 Call renew() after changing state
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["If you never call ",e("code",{children:"renew()"}),", the UI will not change even when state does. This is Lithent's"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"explicit update"})," ","philosophy."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"When should you call renew()?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Call ",e("code",{children:"renew()"})," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"whenever state changes and the view needs to reflect it"}),". In practice, this usually happens inside event handlers after you mutate state."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const TodoList = mount((renew, _props) => {
  const todos = [];
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos.push({ id: Date.now(), text: inputValue });
      inputValue = '';
      renew(); // Call renew() after pushing into the array
    }
  };

  const removeTodo = (id: number) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index > -1) {
      todos.splice(index, 1);
      renew(); // Call renew() after removing from the array
    }
  };

  const handleInput = (e: Event) => {
    inputValue = (e.target as HTMLInputElement).value;
    renew(); // Call renew() after updating the input value
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["As in the example above, every handler that mutates state should call",e("code",{children:"renew()"})," to refresh the UI."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"renew() with async work"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["When asynchronous work (API calls, ",e("code",{children:"setTimeout"}),", etc.) changes state, you should still call ",e("code",{children:"renew()"})," at each significant step."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const UserProfile = mount((renew, _props) => {
  let user = null;
  let loading = true;
  let error = null;

  const fetchUser = async () => {
    try {
      loading = true;
      renew(); // Call renew() when loading starts

      const response = await fetch('/api/user');
      user = await response.json();
      error = null;
    } catch (err) {
      error = err.message;
      user = null;
    } finally {
      loading = false;
      renew(); // Call renew() after data is loaded
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["At each stage of an async workflow (start, success, failure), call",e("code",{children:"renew()"})," whenever state changes so the UI stays in sync."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"How renew() works under the hood"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["When ",e("code",{children:"renew()"})," is called, Lithent goes through the following steps:"]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:[e("code",{children:"renew()"})," is called"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"Updater runs → new virtual DOM is created"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Previous and new virtual DOM are diffed"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"Only the changed parts are patched into the real DOM"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:[e("code",{children:"updateCallback"})," hooks run (when registered)"]})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"This process lets Lithent update the UI efficiently. The Updater may return a full virtual DOM tree, but only the minimal changes touch the real DOM, keeping performance predictable."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Optimizing renew()"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Calling ",e("code",{children:"renew()"})," too often can hurt performance. In edge cases, you can batch updates like this:"]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const OptimizedCounter = mount((renew, _props) => {
  let count = 0;
  let pendingUpdate = false;

	  const scheduleUpdate = () => {
    if (!pendingUpdate) {
      pendingUpdate = true;
      // Only update once on the next frame
      requestAnimationFrame(() => {
        pendingUpdate = false;
        renew();
      });
    }
  };

  const increaseMany = () => {
    // Even if we change state multiple times, renew() runs once
    count += 1;
    count += 1;
    count += 1;
    scheduleUpdate(); // Batched update
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increaseMany}>Increase by 3</button>
    </div>
  );
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Note:"})," ","In most cases, plain ",e("code",{children:"renew()"})," calls are enough. Techniques like the one above are only needed when updates happen extremely often."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount removes the need for renew()"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["With ",e("code",{children:"lmount"})," and ",e("code",{children:"lstate"}),", you do not call"," ",e("code",{children:"renew()"})," explicitly. When an ",e("code",{children:"lstate"})," value changes, ",e("code",{children:"renew()"})," is invoked automatically."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const increase = () => {
    count.value += 1; // renew() is called automatically ✨
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{children:"lstate"})," makes development convenient, but you lose explicit control over when ",e("code",{children:"renew()"})," fires. Choose between"," ",e("code",{children:"mount"})," and ",e("code",{children:"lmount"})," based on how much control you need."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What’s next"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/render",onClick:t=>{t.preventDefault(),y("/guide/render")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core feature: Render →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Learn how to render components into the real DOM.",e("br",{}),"You'll see how the ",e("code",{children:"render"})," function mounts and unmounts components."]})]})})]}),jl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Render"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What does render() do?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["The ",e("code",{children:"render()"})," function"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"mounts a component into the real DOM"}),". It turns virtual DOM into real DOM nodes and attaches them to the container element you specify.",e("br",{}),e("br",{}),e("code",{children:"render()"})," also"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"returns a destroy function"}),"so you can unmount the component later."]}),e(l,{language:"tsx",code:`import { render, mount } from 'lithent';

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

// Render the component into the #root element
const destroy = render(<App />, document.getElementById('root'));

// Unmount later if needed
// destroy();`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["The first argument to ",e("code",{children:"render()"})," is the virtual DOM you want to render; the second is the container element. If you omit the container, the component is rendered into ",e("code",{children:"document.body"})," by default."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"render() signature"}),e(l,{language:"tsx",code:`render(
  wDom: VirtualDOM,           // Virtual DOM to render
  wrapElement?: HTMLElement,  // Container element (default: document.body)
  afterElement?: HTMLElement  // Reference element for insertBefore (optional)
): () => void                 // Returns a destroy function`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{children:"render()"})," takes three parameters:",e("br",{}),e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"wDom"}),": the virtual DOM to render (required)",e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"wrapElement"}),": the container element (optional, defaults to ",e("code",{children:"document.body"}),")",e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"afterElement"}),": a reference element used when inserting before a specific node (optional)"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Basic usage"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"The most common pattern is to render a component into a specific DOM node."}),e(l,{language:"tsx",code:`import { render, mount } from 'lithent';

const Greeting = mount(() => {
  return () => <h1>Hello, Lithent!</h1>;
});

// Render into the #app element
render(<Greeting />, document.getElementById('app'));

// Or use document.querySelector
render(<Greeting />, document.querySelector('.container'));

// If you omit the container, it renders into document.body
render(<Greeting />);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Unmounting"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Calling the destroy function returned by ",e("code",{children:"render()"})," removes the component from the DOM, unregisters event listeners, and runs any registered cleanup callbacks.",e("br",{}),e("br",{}),"If your component needs to clean up resources (timers, event listeners, etc.) when it unmounts, use the"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"mountCallback hook"}),". When you return a cleanup function from ",e("code",{children:"mountCallback"}),", it runs automatically on unmount."]}),e(l,{language:"tsx",code:`import { render, mount, mountCallback } from 'lithent';

const Timer = mount((renew) => {
  let count = 0;

  // Register work to run on mount via mountCallback
  mountCallback(() => {
    // Start a timer when the component mounts
    const intervalId = setInterval(() => {
      count += 1;
      renew();
    }, 1000);

    // Return a cleanup function – runs automatically on unmount
    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {count} seconds</div>;
});

const destroy = render(<Timer />, document.getElementById('root'));

// Remove the timer component after 5 seconds
setTimeout(() => {
  destroy(); // Unmount the component and run cleanup
}, 5000);`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["When you call ",e("code",{children:"destroy()"}),":",e("br",{}),e("br",{}),"1. The cleanup function returned from ",e("code",{children:"mountCallback"})," runs",e("br",{}),"2. All event listeners are detached",e("br",{}),"3. The rendered DOM nodes are removed"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Inserting before a specific element"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Using the third parameter, ",e("code",{children:"afterElement"}),", you can insert a component before a specific DOM node."]}),e(l,{language:"tsx",code:`import { render, mount } from 'lithent';

const NewItem = mount(() => {
  return () => <li>New Item</li>;
});

// HTML structure:
// <ul id="list">
//   <li>Item 1</li>
//   <li id="item2">Item 2</li>
//   <li>Item 3</li>
// </ul>

const container = document.getElementById('list');
const referenceElement = document.getElementById('item2');

// Insert New Item before Item 2
render(<NewItem />, container, referenceElement);

// Result:
// <ul id="list">
//   <li>Item 1</li>
//   <li>New Item</li>      ← inserted here
//   <li id="item2">Item 2</li>
//   <li>Item 3</li>
// </ul>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"This is useful when you need to insert a component at a dynamic position within existing DOM."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Rendering multiple components"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"You can render multiple independent components into different parts of the page."}),e(l,{language:"tsx",code:`import { render, mount } from 'lithent';

const Header = mount(() => {
  return () => <header>Header</header>;
});

const Sidebar = mount(() => {
  return () => <aside>Sidebar</aside>;
});

const Content = mount(() => {
  return () => <main>Content</main>;
});

// Render each component independently
const destroyHeader = render(<Header />, document.getElementById('header'));
const destroySidebar = render(<Sidebar />, document.getElementById('sidebar'));
const destroyContent = render(<Content />, document.getElementById('content'));

// Unmount each independently when needed
// destroyHeader();
// destroySidebar();
// destroyContent();`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Note:"})," ","In many apps it's simpler to render a single root component and compose everything else inside it. When you truly need multiple roots, consider wrapping them in a parent component to keep data flow predictable."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"How render() works internally"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["When ",e("code",{children:"render()"})," is called, Lithent goes through these steps:"]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"Convert the virtual DOM into real DOM nodes (wDomToDom)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"Attach nodes to the container (appendChild or insertBefore)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Run mountCallback hooks (when registered)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"Run mountReadyCallback hooks (when registered)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"Return the destroy function"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"This sequence turns the virtual DOM into pixels on the screen and ensures lifecycle hooks fire in a well-defined order."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What’s next"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/guide/portal",onClick:t=>{t.preventDefault(),y("/guide/portal")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core feature: Portal →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Learn how to render components outside of their parent DOM hierarchy using Portals.",e("br",{}),"This is especially useful for modals, tooltips, and other UI that needs to escape overflow boundaries."]})]}),e("a",{href:"/examples/16",onClick:t=>{t.preventDefault(),y("/examples/16")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Example: insertBefore + Destroy →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"See a practical example of inserting a Lithent component between existing DOM nodes using insertBefore, then cleaning it up with the destroy function."})]})]})]}),Vl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Portal"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What is a Portal?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["A Portal"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"renders a component outside its parent DOM hierarchy"}),".",e("br",{}),e("br",{}),"Normally, components render inside their parent's DOM tree. But UI like"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"modals"})," ","or"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"tooltips"})," ","often need to float above everything else. Parent styles such as"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"overflow: hidden"})," ","or"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"z-index"})," ","can clip or hide them.",e("br",{}),e("br",{}),"Portals solve this by letting you render a component at a completely different place in the DOM, while its state and lifecycle still live with its logical parent."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"The simplest Portal usage"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["The most common pattern is to render into"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"document.body"}),". Here is a modal example:"]}),e(l,{language:"tsx",code:`import { mount, portal } from 'lithent';

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
      {/* Even if the parent container has overflow: hidden */}
      <h1>My App</h1>
      <button onClick={openModal}>Open Modal</button>

      {/* The modal is rendered into document.body and displays correctly */}
      {showModal && portal(
        <Modal onClose={closeModal} />,
        document.body
      )}
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["In this example, the App container uses"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"overflow: hidden"}),", but the modal is rendered into ",e("code",{children:"document.body"}),", so it can cover the entire viewport without being clipped."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Portal API"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["The ",e("code",{children:"portal()"})," helper takes two arguments:"]}),e(l,{language:"tsx",code:`import { portal } from 'lithent';

portal(
  wDom,           // Virtual DOM to render
  targetElement   // Target HTMLElement (e.g. document.body)
)`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"wDom"}),": the component or JSX tree to render",e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"targetElement"}),": the real DOM element where the Portal should render"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Using predefined containers in HTML"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"In larger apps it's common to define dedicated Portal containers in your HTML. This makes it easier to layer and manage modals and tooltips:"}),e(l,{language:"html",code:`<!-- index.html -->
<!DOCTYPE html>
<html>
<body>
  <div id="root"></div>
  <!-- Dedicated Portal containers -->
  <div id="modal-root"></div>
  <div id="tooltip-root"></div>
</body>
</html>`}),e(l,{language:"tsx",code:`import { mount, portal } from 'lithent';

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

    // Automatically hide after 3 seconds
    setTimeout(() => {
      toastMessage = null;
      renew();
    }, 3000);
  };

  return () => (
    <div>
      <button onClick={showSuccess}>Show Toast</button>

      {/* Render into the modal-root container */}
      {toastMessage && portal(
        <Toast {...toastMessage} />,
        document.getElementById('modal-root')!
      )}
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Advantages of this approach:",e("br",{}),e("br",{}),"• Easier ",e("code",{children:"z-index"})," management by separating modals, tooltips, etc.",e("br",{}),"• Clearer CSS targeting",e("br",{}),"• DOM structure is easier to inspect while debugging"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Using Portals from nested components"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Portals work just fine from deeply nested components. State and lifecycle stay with the logical parent:"}),e(l,{language:"tsx",code:`import { mount, portal } from 'lithent';

// Nested child component
const ConfirmDialog = mount<{ message: string; onConfirm: () => void }>(() => {
  return ({ message, onConfirm }) => (
    <div class="dialog">
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
});

// Intermediate component
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

      {/* Portals work even from nested components */}
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

// Parent component
const App = mount(() => {
  return () => (
    <div class="app" style="overflow: hidden;">
      <UserCard name="Alice" />
      <UserCard name="Bob" />
    </div>
  );
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["In this example, ",e("code",{children:"UserCard"})," is a child of ",e("code",{children:"App"}),", and",e("code",{children:"ConfirmDialog"})," is a child of ",e("code",{children:"UserCard"}),". The dialog still renders into ",e("code",{children:"document.body"}),", so it is unaffected by",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"overflow: hidden"})," ","on the App container."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"How Portals work internally"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Internally, Portals behave like this:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"portal(wDom, element)"})," ","creates a special ",e("code",{children:"portal"})," virtual DOM node"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"When rendering, the Portal node itself is not added to the parent DOM tree; instead, the given HTMLElement is used as the container"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Components inside the Portal share state and lifecycle with their parent component"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:["When the parent calls ",e("code",{children:"renew()"}),", the Portal content updates as well"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"When the parent unmounts, the Portal content is cleaned up too"})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Things to watch out for"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ Event bubbling:"})," Events fired inside a Portal bubble along the ",e("strong",{children:"component tree"}),", not the DOM tree. For example, clicks inside a modal may bubble to its parent component, so you might need to call"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"e.stopPropagation()"}),".",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ CSS styling:"})," Portal content inherits CSS from where it is rendered, not from its logical parent. Treat Portal components as visually independent and style them accordingly.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Server-side rendering:"})," Portals only work in a browser environment. In SSR you may need a guard such as"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"typeof window !== 'undefined'"}),"."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"What’s next"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/guide/mount-hooks",onClick:t=>{t.preventDefault(),y("/guide/mount-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core feature: Mount Hooks →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Learn about ",e("code",{children:"mountCallback"})," and"," ",e("code",{children:"mountReadyCallback"}),", the hooks that run when a component mounts.",e("br",{}),"They give you fine-grained control over the component lifecycle."]})]}),e("a",{href:"/examples/20",onClick:t=>{t.preventDefault(),y("/examples/20")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Example: image gallery lightbox →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Try the example that uses Portals to open a full-screen lightbox on top of an ",e("code",{children:"overflow: hidden"})," gallery container."]})]})]})]}),zl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mount Hooks"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountCallback이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["mountCallback은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트가 DOM에 마운트된 후 실행되는 훅"}),"입니다. 마운터 내부에서 호출하며, 컴포넌트가 화면에 표시된 직후에 실행됩니다.",e("br",{}),e("br",{}),"mountCallback의 주요 용도:",e("br",{}),e("br",{}),"• 타이머 설정 (setTimeout, setInterval)",e("br",{}),"• DOM 이벤트 리스너 등록",e("br",{}),"• 외부 라이브러리 초기화",e("br",{}),"• 데이터 구독 (subscription)",e("br",{}),"• 초기 데이터 로딩",e("br",{}),e("br",{}),"그리고"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"cleanup 함수를 반환"}),"하면, 컴포넌트가 언마운트될 때 자동으로 정리 작업을 수행합니다."]}),e(l,{language:"tsx",code:`import { mount, mountCallback } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"DOM 요소에 접근하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"mountCallback은 DOM이 생성된 후에 실행되므로, ref로 DOM 요소에 안전하게 접근할 수 있습니다. 이는 외부 라이브러리를 초기화하거나 DOM 이벤트 리스너를 등록할 때 유용합니다."}),e(l,{language:"tsx",code:`import { mount, mountCallback, ref } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"이벤트 리스너 등록하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"window나 document 같은 전역 객체에 이벤트 리스너를 등록할 때 mountCallback을 사용합니다. cleanup 함수에서 리스너를 제거하면 메모리 누수를 방지할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount, mountCallback } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"데이터 구독하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"WebSocket 연결, 이벤트 스트림, 또는 상태 관리 라이브러리 구독 등에도 mountCallback을 사용합니다."}),e(l,{language:"tsx",code:`import { mount, mountCallback } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 mountCallback 등록하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"하나의 컴포넌트에서 여러 개의 mountCallback을 등록할 수 있습니다. 각각의 mountCallback은 독립적으로 동작하며, 등록된 순서대로 실행됩니다."}),e(l,{language:"tsx",code:`import { mount, mountCallback } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"각 mountCallback은 독립적인 cleanup 함수를 가질 수 있어서, 관련된 설정과 정리 작업을 함께 묶어두면 코드가 깔끔해집니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountReadyCallback과의 차이"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent는 두 가지 마운트 관련 훅을 제공합니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ul",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountCallback"}),": ",e("strong",{children:"DOM 마운트 후"})," 실행. DOM 요소에 접근 가능하며, 가장 일반적으로 사용됨."]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountReadyCallback"}),": ",e("strong",{children:"Virtual DOM 생성 직후, DOM 마운트 전"})," 실행. DOM에 접근할 수 없지만, 더 빠른 시점에 실행됨."]})]})]})}),e(l,{language:"tsx",code:`import { mount, mountCallback, mountReadyCallback, ref } from 'lithent';

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
});`})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/update-hooks",onClick:t=>{t.preventDefault(),y("/guide/update-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Update Hooks →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트가 업데이트될 때 실행되는 updateCallback 훅에 대해 알아보세요.",e("br",{}),"상태 변경 후 추가 작업을 수행하는 방법을 배워봅시다."]})]})})]}),Jl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Update Hooks"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"updateCallback이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["updateCallback은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트가 업데이트될 때 실행되는 훅"}),"입니다. 중요한 점은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"두 단계로 동작"}),"한다는 것입니다:",e("br",{}),e("br",{}),"1."," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"updateCallback 함수 자체"}),": dependencies가 변경되었을 때 ",e("strong",{children:"업데이트 전에"})," 실행",e("br",{}),"2."," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"반환하는 함수"}),": ",e("strong",{children:"DOM 업데이트 후에"})," 실행",e("br",{}),e("br",{}),"updateCallback의 주요 용도:",e("br",{}),e("br",{}),"• 업데이트 전 준비 작업 (데이터 가져오기, 계산 등)",e("br",{}),"• DOM 업데이트 후 작업 (스크롤 조정, 애니메이션 등)",e("br",{}),"• 외부 라이브러리와 동기화",e("br",{}),"• 특정 값 변경 감지 및 부수 효과 실행"]}),e(l,{language:"tsx",code:`import { mount, updateCallback } from 'lithent';

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
// 2. 업데이트 후: DOM updated with count 1`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"dependencies로 실행 조건 지정하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["updateCallback의 두 번째 인자로"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"dependencies 함수"}),"를 전달하면, 지정한 값이 변경되었을 때만 실행됩니다. 이는 불필요한 실행을 방지하여 성능을 최적화합니다."]}),e(l,{language:"tsx",code:`import { mount, updateCallback } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:'위 예제에서 "Change User"를 클릭하면 userId 관련 updateCallback만 실행되고, "Toggle Theme"를 클릭하면 theme 관련 updateCallback만 실행됩니다.'}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"반환 함수: DOM 업데이트 후 작업"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["updateCallback이 반환하는 함수는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"DOM 업데이트 후"}),"에 실행됩니다. 이는 업데이트된 DOM에 접근하거나 외부 라이브러리를 동기화할 때 유용합니다."]}),e(l,{language:"tsx",code:`import { mount, updateCallback, ref } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 예제는 count가 변경될 때마다 DOM 업데이트 후 애니메이션을 트리거합니다. 반환 함수가 실행되는 시점에는 이미 DOM이 업데이트되어 있으므로, boxRef.value로 최신 DOM 요소에 안전하게 접근할 수 있습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제: 채팅 스크롤 자동 조정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"반환 함수는 DOM 업데이트 후 실행되므로, 새로운 DOM 요소에 접근할 수 있습니다. 채팅 메시지가 추가될 때 스크롤을 자동으로 맨 아래로 이동하는 예제입니다."}),e(l,{language:"tsx",code:`import { mount, updateCallback, ref } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제: 외부 라이브러리 동기화"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent의 상태가 변경될 때 외부 차트 라이브러리를 동기화하는 예제입니다. 업데이트 전에 데이터를 준비하고, DOM 업데이트 후 차트를 갱신합니다."}),e(l,{language:"tsx",code:`import { mount, updateCallback, ref } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 updateCallback 등록하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"하나의 컴포넌트에서 여러 개의 updateCallback을 등록할 수 있습니다. 각각 다른 dependencies를 가질 수 있어서, 관련된 로직을 분리하여 관리할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount, updateCallback } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"의존성 배열 동작"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["dependencies는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"배열을 반환하는 함수"}),"여야 합니다. 이 함수가 반환하는 배열의 값이 변경되었을 때만 updateCallback이 실행됩니다.",e("br",{}),e("br",{}),"Lithent는 클로저 기반으로 동작하므로, updateCallback 내부에서 외부 변수를 자유롭게 참조할 수 있습니다. 의존성 배열은 React와 달리 모든 외부 값을 포함할 필요가 없으며, 단순히 콜백을 재실행할 시점을 결정하는 조건으로만 사용됩니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 왜 함수로 설계되었나요?"}),e("br",{}),e("br",{}),"Lithent는 ",e("strong",{class:"font-semibold",children:"클로저 기반 상태 관리"}),"를 사용합니다. 컴포넌트의 상태(userId, status 등)는 클로저 변수로 존재하며, 매 업데이트 시점마다 변경 여부를 확인하려면"," ",e("strong",{class:"font-semibold",children:"그 시점의 최신 값"}),"을 읽어야 합니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"() => [userId, status]"}),"처럼 함수로 설계하면, 의존성을 확인할 때마다 이 함수를 호출하여"," ",e("strong",{class:"font-semibold",children:"항상 최신 클로저 값"}),"을 가져올 수 있습니다. 함수 호출 시점에 userId와 status의 현재 값을 읽어 배열로 반환하므로, 이전 값과 비교하여 변경 여부를 정확히 감지할 수 있습니다."]})}),e(l,{language:"tsx",code:`import { mount, updateCallback } from 'lithent';

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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ",'React의 useEffect와 달리, Lithent의 updateCallback은 클로저를 통해 항상 최신 값을 참조합니다. 의존성 배열은 단순히 "언제 재실행할지"만 결정합니다.']})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountCallback vs updateCallback"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"두 훅의 차이를 명확히 이해하는 것이 중요합니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ul",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountCallback"}),": 컴포넌트가 ",e("strong",{children:"처음 마운트될 때 단 한 번"})," 실행. 초기화 작업에 적합."]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"updateCallback"}),": 컴포넌트가 ",e("strong",{children:"업데이트될 때마다"})," 실행. 상태 변경에 대한 부수 효과에 적합."]})]})]})}),e(l,{language:"tsx",code:`import { mount, mountCallback, updateCallback } from 'lithent';

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
// 3. updateCallback 반환 함수 (DOM 업데이트 후)`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"updateCallback의 실행 흐름:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"마운터 실행 시 updateCallback 호출로 콜백 함수 등록"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"renew() 호출로 Updater 실행 → 새로운 Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"등록된 updateCallback들의 dependencies 확인"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:["dependencies가 변경된 경우, effectAction ",e("strong",{children:"즉시 실행"})]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"effectAction이 반환하는 함수를 큐(upCB)에 저장"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"6."}),e("span",{children:"Virtual DOM 비교 및 실제 DOM 업데이트"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"7."}),e("span",{children:"큐에 저장된 반환 함수들을 순서대로 실행 (DOM 업데이트 후)"})]})]})}),e(l,{language:"tsx",code:`// 실행 흐름 예시
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
// 6. "B. DOM 업데이트 후 실행" 출력`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 두 단계 실행 이해하기:"})," ","updateCallback 자체는 dependencies 변경 시 즉시 실행되고, 반환 함수는 DOM 업데이트 후 실행됩니다. 이 차이를 정확히 이해해야 합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ dependencies는 함수로 전달:"})," ","dependencies는 배열이 아닌 ",e("strong",{children:"배열을 반환하는 함수"}),'로 전달해야 합니다. Lithent의 클로저 기반 상태 관리 방식 때문입니다. 자세한 내용은 위의 "의존성 배열 동작" 섹션을 참고하세요.',e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 무한 루프 주의:"})," 반환 함수에서 renew()를 호출하면 무한 루프가 발생할 수 있습니다. 조건부로 renew()를 호출하거나 dependencies를 잘 설정하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," updateCallback은 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 첫 렌더링에도 실행:"})," updateCallback은 마운트 시점에도 실행됩니다. 마운트 이후 업데이트만 감지하려면 별도의 플래그를 사용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/mount-ready-hooks",onClick:t=>{t.preventDefault(),y("/guide/mount-ready-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Mount Ready Hooks →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Virtual DOM 생성 직후 실행되는 mountReadyCallback 훅에 대해 알아보세요.",e("br",{}),"DOM 마운트 전에 실행해야 하는 작업을 처리하는 방법을 배워봅시다."]})]})})]}),Wl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mount Ready Hooks"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountReadyCallback이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["mountReadyCallback은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Virtual DOM이 생성된 직후, 실제 DOM에 마운트되기 전에 실행되는 훅"}),"입니다.",e("br",{}),e("br",{}),"mountCallback보다"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"더 빠른 시점"}),"에 실행되므로, DOM이 필요 없는 초기화 작업에 적합합니다. 하지만 이 시점에는 아직 실제 DOM이 생성되지 않았으므로,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"ref.value는 null"}),"입니다."]}),e(l,{language:"tsx",code:`import { mount, mountReadyCallback } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mountCallback vs mountReadyCallback"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"두 훅의 차이를 정확히 이해하는 것이 중요합니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ul",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountReadyCallback"}),": Virtual DOM 생성 직후 실행. ",e("strong",{children:"DOM 접근 불가"}),". 더 빠른 초기화."]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mountCallback"}),": 실제 DOM 마운트 후 실행. ",e("strong",{children:"DOM 접근 가능"}),". 가장 일반적으로 사용."]})]})]})}),e(l,{language:"tsx",code:`import { mount, mountReadyCallback, mountCallback, ref } from 'lithent';

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
//    divRef.value: <div>Hello</div>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["mountReadyCallback은 특수한 경우에만 사용됩니다. 대부분의 경우 mountCallback으로 충분합니다.",e("br",{}),e("br",{}),"mountReadyCallback이 적합한 경우:",e("br",{}),e("br",{}),"• DOM이 필요 없는 데이터 초기화",e("br",{}),"• 상태 관리 구독 (store subscription)",e("br",{}),"• 로깅 및 분석 초기화",e("br",{}),"• 가능한 한 빠른 시점의 초기화가 필요한 경우",e("br",{}),e("br",{}),"mountCallback이 적합한 경우:",e("br",{}),e("br",{}),"• DOM 요소 접근이 필요한 경우 (대부분의 경우)",e("br",{}),"• 외부 라이브러리 초기화 (차트, 에디터 등)",e("br",{}),"• DOM 이벤트 리스너 등록",e("br",{}),"• 타이머 설정"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"데이터 초기화 예제"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"DOM이 필요 없는 데이터 초기화는 mountReadyCallback을 사용하여 더 빠르게 수행할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount, mountReadyCallback } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 예제는 DOM이 생성되기 전에 데이터 로딩을 시작하여, 초기 렌더링 성능을 개선할 수 있습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"상태 관리 구독 예제"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"전역 상태 관리 스토어 구독은 DOM과 무관하므로 mountReadyCallback을 사용할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount, mountReadyCallback } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 mountReadyCallback 등록하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"mountCallback과 마찬가지로, 여러 개의 mountReadyCallback을 등록할 수 있습니다. 각각 독립적인 cleanup 함수를 가질 수 있습니다."}),e(l,{language:"tsx",code:`import { mount, mountReadyCallback } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"mountReadyCallback의 실행 흐름:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"마운터 실행 시 mountReadyCallback 호출로 콜백 함수 등록 (아직 실행 안 됨)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"Updater 실행 → Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Virtual DOM 생성 직후, 등록된 mountReadyCallback 함수들을 순서대로 실행"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"cleanup 함수가 반환되면 unmount 시점까지 보관"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"Virtual DOM을 실제 DOM으로 변환"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"6."}),e("span",{children:"DOM을 화면에 렌더링"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"7."}),e("span",{children:"mountCallback 함수들 실행 (이제 DOM 접근 가능)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"8."}),e("span",{children:"컴포넌트 언마운트 시 cleanup 함수들을 역순으로 실행하여 정리"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"mountReadyCallback은 3단계에서 실행되고, mountCallback은 7단계에서 실행됩니다. 이 차이가 두 훅의 핵심입니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"전체 생명주기 흐름"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"모든 훅의 실행 순서를 종합하면 다음과 같습니다:"}),e(l,{language:"tsx",code:`import { mount, mountReadyCallback, mountCallback, updateCallback } from 'lithent';

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
// Cleanup: mountReadyCallback`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ DOM 접근 불가:"})," mountReadyCallback 실행 시점에는 아직 DOM이 생성되지 않았습니다. ref.value는 항상 null입니다. DOM이 필요하다면 mountCallback을 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 대부분 불필요:"})," 대부분의 경우 mountCallback으로 충분합니다. mountReadyCallback은 정말 빠른 초기화가 필요하거나 DOM이 절대 필요 없는 경우에만 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ cleanup은 선택적:"})," cleanup 함수를 반환하지 않아도 됩니다. 정리 작업이 필요 없다면 아무것도 반환하지 마세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," ","mountReadyCallback은 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"요약: 어떤 훅을 사용해야 할까?"}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장 사용법:"}),e("br",{}),e("br",{}),e("strong",{children:"99%의 경우 → mountCallback 사용"}),e("br",{}),"DOM 접근이 필요하거나, 일반적인 초기화 작업에 사용하세요.",e("br",{}),e("br",{}),e("strong",{children:"DOM 없이 최대한 빨리 초기화 → mountReadyCallback 사용"}),e("br",{}),"데이터 프리페치, 스토어 구독, 분석 초기화 등 특수한 경우에만 사용하세요.",e("br",{}),e("br",{}),e("strong",{children:"매 업데이트마다 작업 → updateCallback 사용"}),e("br",{}),"상태 변경 시마다 부수 효과가 필요한 경우 사용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/use-renew-hooks",onClick:t=>{t.preventDefault(),y("/guide/use-renew-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: useRenew Hook →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["lmount 컴포넌트에서 renew 함수를 가져오는 useRenew 훅에 대해 알아보세요.",e("br",{}),"클로저 변수와 함께 수동 업데이트가 필요한 경우 사용하는 방법을 배워봅시다."]})]})})]}),Gl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"useRenew Hook"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"useRenew란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["useRenew는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lmount 컴포넌트 내에서 renew 함수를 가져오는 훅"}),"입니다.",e("br",{}),e("br",{}),"lmount는 일반적으로 lstate와 같은 반응형 헬퍼와 함께 사용되어 자동으로 UI가 업데이트됩니다. 하지만 클로저 변수를 사용하면서 수동으로 업데이트를 트리거해야 하는 특별한 경우에 useRenew를 사용할 수 있습니다."]}),e(l,{language:"tsx",code:`import { lmount, useRenew } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["useRenew는 다음과 같은 특별한 상황에서 유용합니다:",e("br",{}),e("br",{}),"• lmount 컴포넌트에서 클로저 변수를 사용할 때",e("br",{}),"• lstate를 사용하지 않고 단순한 값을 관리할 때",e("br",{}),"• 외부 라이브러리와의 통합에서 수동 업데이트가 필요할 때",e("br",{}),e("br",{}),"하지만 대부분의 경우"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"lstate를 사용하는 것이 더 권장"}),"됩니다. lstate를 사용하면 자동으로 업데이트되므로 renew를 명시적으로 호출할 필요가 없습니다.",e("br",{}),e("br",{}),"또한 클로저 변수와 함께 renew가 필요하다면,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"lmount + useRenew보다는 그냥 mount를 사용하는 것이 더 효과적"}),"입니다. mount는 renew를 매개변수로 직접 제공하므로 더 간결하고 직관적입니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"useRenew vs lstate 비교"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"같은 기능을 useRenew와 lstate로 구현한 예시를 비교해봅시다:"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"useRenew 사용 (수동 업데이트)"}),e(l,{language:"tsx",code:`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count += 1;
    renew(); // 명시적으로 renew 호출 필요
  };

  return () => <div>Count: {count}</div>;
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"lstate 사용 (자동 업데이트) - 권장"}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);

  const increment = () => {
    count.value += 1; // 자동으로 업데이트됨
  };

  return () => <div>Count: {count.value}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장사항:"})," ","lmount를 사용한다면 lstate를 함께 사용하는 것이 더 간결하고 직관적입니다. useRenew는 특별한 경우에만 사용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"외부 라이브러리 통합"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"외부 라이브러리의 이벤트를 받아서 UI를 업데이트해야 할 때 useRenew가 유용할 수 있습니다."}),e(l,{language:"tsx",code:`import { lmount, useRenew, mountCallback } from 'lithent';

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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"타이머 예제"}),e(l,{language:"tsx",code:`import { lmount, useRenew, mountCallback } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mount vs lmount + useRenew"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lmount에서 useRenew를 사용하는 것과 mount를 사용하는 것은 거의 동일합니다. 차이점은 renew 함수를 어떻게 받느냐입니다."}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"mount (renew 매개변수로 받음)"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`})]}),e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"lmount + useRenew (훅으로 받음)"}),e(l,{language:"tsx",code:`import { lmount, useRenew } from 'lithent';

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
});`})]})]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","두 방식 모두 동일하게 동작합니다. 클로저 변수를 사용한다면 mount를 사용하는 것이 더 일반적이고, lmount는 lstate 같은 반응형 헬퍼와 함께 사용하는 것이 권장됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ lmount에서만 사용:"})," useRenew는 lmount 컴포넌트 내에서만 사용할 수 있습니다. mount 컴포넌트에서는 매개변수로 renew를 직접 받으므로 useRenew가 필요 없습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ lstate 사용 권장:"})," lmount를 사용한다면 대부분의 경우 lstate를 사용하는 것이 더 직관적입니다. useRenew는 특별한 경우에만 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," useRenew는 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/state",onClick:t=>{t.preventDefault(),y("/guide/state")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: State →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Core 기능 학습을 완료했습니다!",e("br",{}),"이제 Helper 기능을 알아봅시다. State 헬퍼부터 시작해보세요."]})]})})]}),Xl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"State"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"state란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["state는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"mount 컴포넌트에서 사용하는 반응형 상태 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"state의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 함수를 명시적으로 인자를 통해 위임"}),"한다는 점입니다. 이것이 lstate와의 근본적인 차이이며, mount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다.",e("br",{}),e("br",{}),"클로저 변수는 값을 변경한 후 renew()를 직접 호출해야 하지만, state를 사용하면 renew를 한 번 위임한 후 값이 변경될 때마다 자동으로 renew()가 호출되어 UI가 업데이트됩니다. mount의 명시적 제어와 자동 업데이트의 편리함을 함께 누릴 수 있습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["state는 초기값과 renew 함수를 인자로 받습니다. 반환된 객체의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"value"})," ","프로퍼티를 통해 값을 읽고 쓸 수 있습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"클로저 변수 vs state 비교"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["클로저 변수와 state의 차이를 비교해봅시다. state는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 명시적으로 위임하는 방식"}),"으로, mount 컴포넌트의 철학과 완벽하게 일치합니다:"]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"클로저 변수 (수동 renew 호출)"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew(); // 명시적으로 renew 호출 필요
  };

  return () => <div>Count: {count}</div>;
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"state 헬퍼 (자동 renew 호출)"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew);

  const increment = () => {
    count.value += 1; // 자동으로 renew 호출됨
  };

  return () => <div>Count: {count.value}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 선택 기준:"})," ",e("strong",{class:"font-medium text-gray-700 dark:text-gray-300",children:"state는 mount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다."})," ","간단한 값이라면 state를 사용하는 것이 편리하며, renew를 명시적으로 위임하여 제어권을 명확히 할 수 있습니다. 복잡한 객체나 배열을 다룬다면 클로저 변수를 사용하고 필요할 때만 renew()를 호출하는 것이 더 효율적일 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 state 사용"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"토글 상태 관리"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"카운터 그룹"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"객체와 배열 다루기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"state는 원시 값뿐만 아니라 객체나 배열도 저장할 수 있습니다. 하지만 객체나 배열의 경우, 새로운 참조를 할당해야 변경이 감지됩니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 주의:"})," 객체나 배열의 내부를 직접 변경하면 UI가 업데이트되지 않습니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm",children:"todos.value.push('new') // ❌ 동작하지 않음"}),e("br",{}),e("code",{class:"px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm",children:"todos.value = [...todos.value, 'new'] // ✅ 새 참조로 할당"})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ mount와 함께 사용:"})," state는 mount 컴포넌트에서 사용하는 것이 자연스럽고 올바른 방식입니다. lmount에서는 lstate를 사용하세요. state는 renew를 명시적으로 인자를 통해 위임하는 방식이며, 이것이 lstate와의 근본적인 차이입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ renew 명시적 위임:"})," state는 두 번째 인자로 renew 함수를 반드시 전달해야 합니다. 이는 제어권을 명확히 위임하는 mount의 철학을 따릅니다. renew를 전달하지 않으면 값이 변경되어도 UI가 업데이트되지 않습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," state는 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/lstate",onClick:t=>{t.preventDefault(),y("/guide/lstate")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Lstate →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["lmount에서 사용하는 반응형 상태 관리인 lstate에 대해 알아보세요.",e("br",{}),"state와 유사하지만 renew를 자동으로 처리하는 방법을 배워봅시다."]})]})})]}),ql=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Lstate"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lstate란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstate는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lmount 컴포넌트에서 사용하는 반응형 상태 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"lstate의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 자동으로 처리"}),"한다는 점입니다. state와 달리 renew를 인자로 전달할 필요가 없으며, 내부적으로 useRenew 훅을 사용하여 자동으로 renew를 가져옵니다. 이것이 state와의 근본적인 차이이며, lmount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다.",e("br",{}),e("br",{}),"값이 변경될 때마다 자동으로 renew()가 호출되어 UI가 업데이트되므로, 선언형 패턴에 최적화되어 있습니다."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstate는 초기값만 인자로 받습니다. renew는 내부적으로 자동 처리됩니다. 반환된 객체의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"value"})," ","프로퍼티를 통해 값을 읽고 쓸 수 있습니다."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"state vs lstate 비교"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["state와 lstate의 차이를 비교해봅시다. 핵심 차이는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 어떻게 처리하는가"}),"입니다:"]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"state (mount + 명시적 renew 위임)"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew); // renew 명시적 전달

  const increment = () => {
    count.value += 1;
  };

  return () => <div>Count: {count.value}</div>;
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"lstate (lmount + 자동 renew 처리)"}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0); // renew 자동 처리

  const increment = () => {
    count.value += 1;
  };

  return () => <div>Count: {count.value}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 선택 기준:"})," ",e("strong",{class:"font-medium text-gray-700 dark:text-gray-300",children:"lstate는 lmount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다."})," ","lstate는 renew를 자동으로 처리하여 선언형 패턴에 최적화되어 있으며, state는 renew를 명시적으로 위임하여 수동 제어에 최적화되어 있습니다. mount를 사용한다면 state를, lmount를 사용한다면 lstate를 선택하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 개의 lstate 사용"}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"토글 상태 관리"}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"탭 컴포넌트"}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"객체와 배열 다루기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lstate는 원시 값뿐만 아니라 객체나 배열도 저장할 수 있습니다. 하지만 객체나 배열의 경우, 새로운 참조를 할당해야 변경이 감지됩니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 주의:"})," 객체나 배열의 내부를 직접 변경하면 UI가 업데이트되지 않습니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm",children:"todos.value.push('new') // ❌ 동작하지 않음"}),e("br",{}),e("code",{class:"px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm",children:"todos.value = [...todos.value, 'new'] // ✅ 새 참조로 할당"})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"복잡한 상태 관리 예제"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"여러 개의 lstate를 조합하여 복잡한 상태를 관리할 수 있습니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ lmount와 함께 사용:"})," lstate는 lmount 컴포넌트에서 사용하는 것이 자연스럽고 올바른 방식입니다. mount에서는 state를 사용하세요. lstate는 renew를 자동으로 처리하는 방식이며, 이것이 state와의 근본적인 차이입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ renew 자동 처리:"})," lstate는 내부적으로 useRenew를 사용하여 renew를 자동으로 가져옵니다. 따라서 renew를 인자로 전달할 필요가 없으며, 이는 선언형 패턴에 최적화된 설계입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," lstate는 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/computed",onClick:t=>{t.preventDefault(),y("/guide/computed")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Computed →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["다른 상태로부터 파생된 값을 계산하는 computed에 대해 알아보세요.",e("br",{}),"읽기 전용 파생 값을 만드는 방법을 배워봅시다."]})]})})]}),Kl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Computed Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Computed란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["computed는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"다른 값으로부터 파생된 값을 계산하는 읽기 전용 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"computed는 함수를 인자로 받아, 해당 함수가 반환하는 값을 읽기 전용으로 제공합니다. 값에 접근할 때마다 함수가 다시 실행되므로, 항상 최신 상태를 반영하는 파생 값을 얻을 수 있습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"핵심 특징"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["computed의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"읽기 전용이며, 접근할 때마다 함수를 실행"}),"한다는 점입니다.",e("br",{}),e("br",{}),"• ",e("strong",{children:"읽기 전용"}),": computed 값을 직접 변경하려고 하면 에러가 발생합니다.",e("br",{}),"• ",e("strong",{children:"즉시 평가 (Lazy Evaluation)"}),": 값에 접근할 때마다 함수가 실행됩니다.",e("br",{}),"• ",e("strong",{children:"항상 최신 값"}),": 의존하는 상태가 변경되면 다음 접근 시 새로운 값을 반환합니다.",e("br",{}),"• ",e("strong",{children:"mount와 lmount 모두 사용 가능"}),": renew를 필요로 하지 않기 때문에 mount, lmount 어디서든 자유롭게 사용할 수 있습니다."]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","computed는 의존성을 자동으로 추적하지 않습니다. Vue나 React의 computed 속성과 달리, 단순히 함수를 래핑하여 접근할 때마다 실행하는 편리한 헬퍼입니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"단순 계산"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"여러 값 조합"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"장바구니 계산"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"필터링 및 정렬"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"동적 클래스명 생성"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"읽기 전용 특성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"computed는 읽기 전용입니다. 값을 직접 변경하려고 하면 에러가 발생합니다."}),e(l,{language:"tsx",code:`const doubled = computed(() => count.value * 2);

// ❌ 에러 발생!
doubled.value = 10;  // Error: You can't change 'computed'

// ✅ 올바른 방법: 원본 값을 변경
count.value = 5;  // doubled는 자동으로 10이 됨`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 읽기 전용:"})," computed 값은 파생 값이므로 직접 변경할 수 없습니다. 원본 상태를 변경하면 computed 값도 자동으로 업데이트됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mount와 lmount 모두 사용 가능"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["computed는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 함수를 필요로 하지 않는 읽기 전용 헬퍼"}),"이므로, mount와 lmount 어디서든 자유롭게 사용할 수 있습니다.",e("br",{}),e("br",{}),"이것이 state/lstate와의 차이점입니다. state는 renew를 명시적으로 전달받고, lstate는 useRenew로 자동 처리하지만, computed는 renew 자체가 필요 없으므로 lcomputed라는 별도 버전이 존재하지 않습니다."]}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"mount에서 사용"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const App = mount(renew => {
  const count = state(0, renew);
  const doubled = computed(
    () => count.value * 2
  );

  return () => (
    <div>{doubled.value}</div>
  );
});`})]}),e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"lmount에서 사용"}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstate, computed } from 'lithent/helper';

const App = lmount(() => {
  const count = lstate(0);
  const doubled = computed(
    () => count.value * 2
  );

  return () => (
    <div>{doubled.value}</div>
  );
});`})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 즉시 평가:"})," computed는 값에 접근할 때마다 함수를 실행합니다. 계산 비용이 큰 작업의 경우 주의가 필요합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 의존성 추적 없음:"})," Vue나 React와 달리 의존성을 자동으로 추적하지 않습니다. 단순히 함수를 래핑한 헬퍼입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 부수 효과 금지:"})," computed 함수 내에서 상태를 변경하거나 부수 효과를 일으키지 마세요. 순수 함수여야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/examples/1",onClick:t=>{t.preventDefault(),y("/examples/1")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"예제: 바나나 스무디 칼로리 →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["computed로 파생된 칼로리 값을 계산하고,",e("br",{}),"상태 변경에 따라 자동으로 업데이트되는 간단한 예제를 실행해 보세요."]})]}),e("a",{href:"/guide/effect",onClick:t=>{t.preventDefault(),y("/guide/effect")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Effect →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["파생 값 계산을 마스터했습니다!",e("br",{}),"이제 부수 효과를 관리하는 Effect 헬퍼를 알아봅시다."]})]})]})]}),Yl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Effect Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"effect란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["effect는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"부수 효과(Side Effect)를 관리하는 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"컴포넌트의 마운트, 업데이트, 언마운트 시점에 특정 작업을 실행하고, 필요한 경우 클린업(정리)할 수 있습니다. 내부적으로 mountCallback과 updateCallback을 사용하여 구현되어 있습니다.",e("br",{}),e("br",{}),"API 호출, DOM 이벤트 리스너 등록, 타이머 설정 등의 부수 효과를 선언적으로 관리할 수 있습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["effect는 세 가지 인자를 받습니다:",e("br",{}),e("br",{}),"• ",e("strong",{children:"forward"}),": 부수 효과를 실행하는 함수",e("br",{}),"• ",e("strong",{children:"backward"}),": 클린업 함수 (선택적)",e("br",{}),"• ",e("strong",{children:"dependencies"}),": 의존성 배열을 반환하는 함수 (선택적, 기본값은 빈 배열)"]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"핵심 특징"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"1. mount와 lmount 모두 사용 가능"}),e("br",{}),"effect는 renew를 필요로 하지 않으므로 mount, lmount 어디서든 사용할 수 있습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"2. 의존성 기반 실행"}),e("br",{}),"dependencies 배열의 값이 변경되었을 때만 effect가 재실행됩니다. 빈 배열을 전달하면 마운트 시에만 실행됩니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"3. 자동 클린업"}),e("br",{}),"backward 클린업 함수는 컴포넌트 언마운트 시 또는 다음 업데이트 전에 자동으로 실행됩니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"타이머 구현"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"DOM 이벤트 리스너"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"API 데이터 가져오기"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"로컬 스토리지 동기화"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"의존성 배열 동작"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["dependencies는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"배열을 반환하는 함수"}),"여야 합니다. 이 함수가 반환하는 배열의 값이 변경되었을 때만 effect가 재실행됩니다.",e("br",{}),e("br",{}),"Lithent는 클로저 기반으로 동작하므로, effect 내부에서 외부 변수를 자유롭게 참조할 수 있습니다. 의존성 배열은 React와 달리 모든 외부 값을 포함할 필요가 없으며, 단순히 effect를 재실행할 시점을 결정하는 조건으로만 사용됩니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 왜 함수로 설계되었나요?"}),e("br",{}),e("br",{}),"Lithent는 ",e("strong",{class:"font-semibold",children:"클로저 기반 상태 관리"}),"를 사용합니다. 컴포넌트의 상태(count, isRunning 등)는 클로저 변수로 존재하며, 매 업데이트 시점마다 변경 여부를 확인하려면"," ",e("strong",{class:"font-semibold",children:"그 시점의 최신 값"}),"을 읽어야 합니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"() => [count, isRunning]"}),"처럼 함수로 설계하면, 의존성을 확인할 때마다 이 함수를 호출하여"," ",e("strong",{class:"font-semibold",children:"항상 최신 클로저 값"}),"을 가져올 수 있습니다. 함수 호출 시점에 count와 isRunning의 현재 값을 읽어 배열로 반환하므로, 이전 값과 비교하여 변경 여부를 정확히 감지할 수 있습니다."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"빈 배열: 마운트 시에만 실행"}),e(l,{language:"tsx",code:`effect(
  () => {
    console.log('Only once on mount');
  },
  undefined,
  () => [] // 빈 배열 = 마운트 시에만 실행
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"특정 값 의존: 값 변경 시마다 실행"}),e(l,{language:"tsx",code:`const count = state(0, renew);

effect(
  () => {
    console.log('Count changed:', count.value);
  },
  undefined,
  () => [count.value] // count.value가 변경될 때마다 실행
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"여러 값 의존"}),e(l,{language:"tsx",code:`const count = state(0, renew);
const message = state('', renew);

effect(
  () => {
    console.log('Count or message changed');
  },
  undefined,
  () => [count.value, message.value] // 둘 중 하나라도 변경되면 실행
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"클로저 안전성 (React와의 차이점)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent는 클로저 기반으로 동작하므로, 의존성 배열에 포함하지 않은 값도 안전하게 참조할 수 있습니다."}),e(l,{language:"tsx",code:`const count = state(0, renew);
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
// multiplier가 변경되어도 effect는 재실행되지 않음`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ",'React의 useEffect와 달리, Lithent의 effect는 클로저를 통해 항상 최신 값을 참조합니다. 의존성 배열은 단순히 "언제 재실행할지"만 결정합니다.']})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mount vs lmount에서 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"effect는 renew를 필요로 하지 않으므로 mount와 lmount 모두에서 동일하게 사용할 수 있습니다."}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"mount에서 사용"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`})]}),e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"lmount에서 사용"}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 마운터에서만 호출:"})," effect는 마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안 됩니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 클린업 필수:"})," 타이머, 이벤트 리스너, 구독 등을 설정한 경우 반드시 클린업 함수에서 정리해야 메모리 누수를 방지할 수 있습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 의존성은 함수로 전달:"})," dependencies는 배열이 아닌 ",e("strong",{children:"배열을 반환하는 함수"}),'여야 합니다. Lithent의 클로저 기반 상태 관리 방식 때문입니다. 자세한 내용은 위의 "의존성 배열 동작" 섹션을 참고하세요.',e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 비동기 처리:"})," async/await를 사용할 경우, forward 함수를 async로 만들지 말고 내부에서 async 함수를 호출하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/examples/4",onClick:t=>{t.preventDefault(),y("/examples/4")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"예제: effect로 DOM 이벤트 다루기 →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"effect로 DOM 이벤트 리스너를 등록하고 클린업하는 실제 예제를 실행해 보세요."})]}),e("a",{href:"/guide/store",onClick:t=>{t.preventDefault(),y("/guide/store")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Store →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["전역 상태 관리를 위한 Store 헬퍼에 대해 알아보세요.",e("br",{}),"여러 컴포넌트 간 상태를 공유하는 방법을 배워봅시다."]})]})]})]}),Zl=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Store Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"store란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["store는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"전역 상태를 관리하는 헬퍼"}),"입니다.",e("br",{}),e("br",{}),"store의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 함수를 명시적으로 인자를 통해 위임"}),"한다는 점입니다. 이것이 lstore와의 근본적인 차이이며, mount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다.",e("br",{}),e("br",{}),"여러 컴포넌트에서 동일한 상태를 공유할 수 있으며, 상태가 변경되면 구독한 모든 컴포넌트가 자동으로 업데이트됩니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["store는 2단계로 사용합니다:",e("br",{}),e("br",{}),e("strong",{children:"1단계: store 생성"})," - 초기값으로 store 생성 함수를 만듭니다.",e("br",{}),e("strong",{children:"2단계: 구독"})," - 컴포넌트에서 renew를 전달하여 구독합니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"핵심 특징"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"1. mount와 함께 사용"}),e("br",{}),"store는 renew를 명시적으로 인자로 받으므로, mount 컴포넌트에서 사용하는 것이 자연스럽습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"2. 전역 상태 공유"}),e("br",{}),"컴포넌트 외부에서 store를 생성하면 여러 컴포넌트가 동일한 상태를 공유할 수 있습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"3. 반응형 Proxy"}),e("br",{}),"store는 JavaScript Proxy를 사용하여 반응성을 구현합니다. 속성을 직접 변경하면 자동으로 구독자들이 업데이트됩니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"4. 선택적 구독 (watch)"}),e("br",{}),"두 번째 인자로 observer 함수를 전달하면 특정 속성만 감시할 수 있습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"원시값 vs 객체"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"객체 저장 (권장)"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"원시값 저장"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 원시값은 .value로 래핑됨
const countStore = store(0);

const Counter = mount(renew => {
  const count = countStore(renew);

  console.log(count.value);  // 0
  count.value = 1;  // .value를 통해 접근

  return () => <div>{count.value}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장:"})," ","원시값보다는 객체 형태로 저장하는 것이 더 직관적입니다. 여러 관련된 상태를 하나의 객체로 묶으면 관리가 편리합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선택적 구독 (watch)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"두 번째 인자로 observer 함수를 전달하면 특정 속성만 감시할 수 있습니다. observer 함수 내에서 접근한 속성만 감시 대상이 됩니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 성능 최적화:"})," ","observer를 사용하면 불필요한 리렌더링을 방지할 수 있습니다. 큰 store를 사용할 때 특정 속성만 감시하면 성능이 향상됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"사용자 인증 상태"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"쇼핑 카트"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"테마 관리"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"구독 없이 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"renew를 전달하지 않으면 구독 없이 store에 접근할 수 있습니다. 주로 유틸리티 함수나 이벤트 핸들러에서 사용합니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"캐싱"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["store는 기본적으로 동일한 renew 함수에 대해 동일한 proxy 객체를 반환합니다(캐싱). 이를 비활성화하려면 세 번째 인자에"," ",e("code",{children:"cache: false"}),"를 전달하세요."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 객체 반응성 (중요!)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"store는 1depth까지만 반응성을 제공합니다."})," ","중첩된 객체의 속성을 변경해도 반응성이 동작하지 않습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"🚨 중요:"})," store는 shallow reactivity만 제공합니다. 중첩 객체의 속성을 직접 변경하면 UI가 업데이트되지 않습니다. 항상 1depth 속성 전체를 새로운 객체로 교체하세요."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"중첩 객체 다루기 패턴"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장 구조:"})," ","중첩 객체 사용을 최소화하고, 가능하면 flat한 구조로 store를 설계하는 것이 좋습니다. 깊은 중첩이 필요하다면 각 depth마다 별도의 속성으로 분리하세요."]})}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💎 Deep Reactivity:"})," 중첩 객체에 대한 세밀한 반응성이 필요하다면"," ",e("a",{href:"/guide/state-ref",onClick:t=>{t.preventDefault(),y("/guide/state-ref")},class:"underline hover:no-underline font-medium",children:"state-ref"})," ","라이브러리를 사용하는 것을 권장합니다. 자세한 내용은 state-ref 페이지를 참고하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Cache 옵션"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["store는 기본적으로 컴포넌트별로 store 접근을 캐싱합니다. 캐시를 비활성화하려면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"{ cache: false }"})," ","옵션을 전달하세요."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({ count: 0 });

const Component = mount(renew => {
  // 캐시 비활성화
  const app = appStore(renew, null, { cache: false });

  return () => <div>Count: {app.count}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","일반적으로 캐시를 활성화(기본값)하는 것이 좋습니다. 캐시를 비활성화하면 동일한 컴포넌트 인스턴스에서 store()를 여러 번 호출할 때마다 새로운 구독이 생성됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ mount와 함께 사용:"})," store는 renew를 명시적으로 인자를 통해 위임하는 방식이므로, mount 컴포넌트에서 사용하는 것이 자연스럽고 올바른 방식입니다. lmount에서는 lstore를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 컴포넌트 외부에서 생성:"})," store는 컴포넌트 외부에서 생성하여 전역으로 공유해야 합니다. 컴포넌트 내부에서 생성하면 매번 새로운 store가 만들어집니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 1depth만 반응성:"})," store는 shallow reactivity만 제공합니다. 중첩 객체의 속성을 직접 변경하면 UI가 업데이트되지 않습니다. 1depth 속성 전체를 교체하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 배열 변경:"})," 배열의 경우 push, pop 등의 메서드를 사용하면 반응성이 동작하지 않습니다. 새로운 배열을 할당하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/examples/2",onClick:t=>{t.preventDefault(),y("/examples/2")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"예제: 공유 Store로 상태 나누기 →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["여러 컴포넌트에서 하나의 store를 공유하면서,",e("br",{}),"mount + store 패턴을 실제 예제로 확인해 보세요."]})]}),e("a",{href:"/guide/lstore",onClick:t=>{t.preventDefault(),y("/guide/lstore")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Lstore →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["lmount에서 사용하는 전역 상태 관리인 lstore에 대해 알아보세요.",e("br",{}),"store와 유사하지만 renew를 자동으로 처리하는 방법을 배워봅시다."]})]})]})]}),Ql=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Lstore Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lstore란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstore는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"전역 상태를 관리하는 헬퍼"}),"로, store의 lmount 전용 버전입니다.",e("br",{}),e("br",{}),"lstore의 핵심은"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"useStore() 메서드가 내부적으로 useRenew()를 자동 호출"}),"하여, 수동으로 renew를 전달할 필요가 없다는 점입니다.",e("br",{}),e("br",{}),"여러 컴포넌트에서 동일한 상태를 공유할 수 있으며, 상태가 변경되면 구독한 모든 컴포넌트가 자동으로 업데이트됩니다."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"useStore() vs watch()"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lstore는 두 가지 메서드를 제공합니다:"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"useStore() - lmount 전용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:"내부적으로 useRenew()를 호출하여 자동으로 구독합니다. renew를 수동으로 전달할 필요가 없습니다."})]}),e("div",{class:"border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"watch() - mount 호환"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:"수동으로 renew를 전달합니다. store의 일반 호출 방식과 동일하게 동작합니다."})]})]}),e(l,{language:"tsx",code:`import { lmount, mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선택적 구독 (Observer)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"makeObserver를 사용하면 특정 필드의 변경에만 반응할 수 있습니다. 성능 최적화에 유용합니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","makeObserver를 생략하면 store의 모든 필드 변경에 반응합니다. 큰 store에서는 성능 저하가 발생할 수 있으므로, 필요한 필드만 선택적으로 구독하는 것이 좋습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 객체 반응성 (중요!)"}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 주의:"})," lstore는 store와 동일하게"," ",e("strong",{children:"1depth(루트 레벨)의 속성에 대해서만 반응성을 제공"}),"합니다.",e("br",{}),e("br",{}),"중첩된 객체의 속성을 직접 변경하면 반응성이 동작하지 않습니다."]})}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"중첩 객체 다루기 패턴"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["중첩 객체를 업데이트할 때는 항상"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"1depth 속성을 새로운 객체로 교체"}),"해야 합니다. 스프레드 연산자를 활용하면 편리합니다."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
}`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💎 Deep Reactivity:"})," 중첩 객체에 대한 세밀한 반응성이 필요하다면"," ",e("a",{href:"/guide/state-ref",onClick:t=>{t.preventDefault(),y("/guide/state-ref")},class:"underline hover:no-underline font-medium",children:"state-ref"})," ","라이브러리를 사용하는 것을 권장합니다. 자세한 내용은 state-ref 페이지를 참고하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Primitive 값 저장"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstore는 객체뿐만 아니라 primitive 값(number, string, boolean)도 저장할 수 있습니다. primitive 값을 저장하면 자동으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"{ value: ... }"})," ","형태로 래핑됩니다."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","대부분의 경우 객체 형태로 store를 정의하는 것이 좋습니다. 여러 관련된 상태를 하나의 store에 그룹화할 수 있고, 타입 추론도 더 명확합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lstore vs store 비교"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"lstore"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"store"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"대상 컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"lmount (useStore)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"renew 전달"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동 (useRenew 호출)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"수동 (인자로 전달)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 방식"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"store.useStore()"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"store(renew)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"반응성 depth"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"1depth (얕은 반응성)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"1depth (얕은 반응성)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"선택적 구독"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원 (makeObserver)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원 (makeObserver)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount 호환성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"watch() 메서드로 가능"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"기본 방식"})]})]})]})}),e(l,{language:"tsx",code:`import { mount, lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Cache 옵션"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstore는 기본적으로 컴포넌트별로 store 접근을 캐싱합니다. 캐시를 비활성화하려면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"{ cache: false }"})," ","옵션을 전달하세요."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({ count: 0 });

const Component = lmount(() => {
  // 캐시 비활성화
  const app = appStore.useStore(null, { cache: false });

  return () => <div>Count: {app.count}</div>;
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","일반적으로 캐시를 활성화(기본값)하는 것이 좋습니다. 캐시를 비활성화하면 동일한 컴포넌트 인스턴스에서 useStore()를 여러 번 호출할 때마다 새로운 구독이 생성됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),y("/guide/context")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: Context →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트 트리에서 데이터를 공유하는 Context API에 대해 알아보세요.",e("br",{}),"props drilling 없이 깊은 컴포넌트 계층에 데이터를 전달하는 방법을 배워봅시다."]})]})})]}),ed=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"State-Ref"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"state-ref란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("a",{href:"https://github.com/superlucky84/state-ref",target:"_blank",rel:"noopener noreferrer",class:"text-[#42b883] hover:underline font-medium",children:"state-ref"}),"는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"중첩 객체에 대한 깊은 반응성(deep reactivity)"}),"을 제공하는 외부 라이브러리입니다.",e("br",{}),e("br",{}),"모든 depth의 중첩 객체와 배열에 대해 반응성을 제공하여, 복잡한 데이터 구조에서도 편리하게 상태를 관리할 수 있습니다.",e("br",{}),e("br",{}),"Lithent와 함께 사용하도록 최적화되어 있으며, 복잡한 중첩 구조를 다루는 경우 매우 유용합니다."]}),e("div",{class:"border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:[e("span",{class:"font-medium",children:"📦 설치:"}),e("br",{}),e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"npm install state-ref"})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["state-ref는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"createStore"})," ","함수를 사용하여 store를 생성합니다. 생성된 store는 renew 함수를 전달받아 컴포넌트와 연결됩니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 .value 접근:"})," state-ref의 모든 속성은"," ",e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:".value"}),"를 통해 접근하고 변경합니다. 이는 Proxy를 통한 반응성 추적을 위한 것입니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 객체 반응성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"state-ref의 가장 큰 장점은 깊은 중첩 구조에서도 반응성이 동작한다는 것입니다. 모든 depth의 속성에 대해 .value를 통한 직접 변경이 가능합니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"배열 반응성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"state-ref에서 배열을 다룰 때는 프록시 setter가 호출되도록 인덱스를 통한 직접 할당을 사용해야 합니다. 배열 내부 객체의 속성 변경은 .value를 통해 감지됩니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ state-ref가 유용한 경우"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 깊은 중첩 구조의 복잡한 데이터 (예: 폼 데이터, 설정 객체, API 응답)"}),e("li",{children:"• 배열 내부 객체의 속성을 자주 변경하는 경우"}),e("li",{children:"• 여러 depth의 속성을 동시에 업데이트해야 하는 경우"}),e("li",{children:"• 트리 구조나 그래프 같은 재귀적 데이터 구조"}),e("li",{children:"• 복잡한 상태 관리가 필요한 대시보드나 폼"})]})]}),e("h3",{class:"text-xl font-medium text-gray-900 dark:text-white mb-4",children:"실제 사용 예시"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"다음과 같은 실제 시나리오에서 state-ref가 특히 유용합니다:"}),e("ul",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-3 mb-6 list-disc list-inside",children:[e("li",{children:[e("strong",{class:"font-semibold",children:"다단계 폼:"})," 여러 섹션으로 나뉜 폼에서 각 필드를 개별적으로 업데이트"]}),e("li",{children:[e("strong",{class:"font-semibold",children:"설정 패널:"})," 다양한 카테고리와 하위 설정을 가진 애플리케이션 설정"]}),e("li",{children:[e("strong",{class:"font-semibold",children:"채팅 애플리케이션:"})," 사용자, 메시지, 채널이 중첩된 구조"]}),e("li",{children:[e("strong",{class:"font-semibold",children:"대시보드:"})," 위젯, 차트, 필터가 복잡하게 구성된 데이터 시각화"]}),e("li",{children:[e("strong",{class:"font-semibold",children:"파일 탐색기:"})," 폴더와 파일이 트리 구조로 구성된 인터페이스"]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ .value 필수:"})," state-ref의 모든 속성은"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:".value"}),"를 통해 접근해야 합니다. 이를 생략하면 Proxy 객체가 반환되어 예상과 다른 동작이 발생할 수 있습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 배열 메서드 주의:"})," push, pop, splice 같은 배열 메서드를 직접 호출하면 프록시 setter가 트리거되지 않아 반응성이 동작하지 않습니다. 대신 인덱스를 통한 직접 할당"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"arr.value[0] = item"})," ","또는 전체 배열 교체"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"arr.value = [...]"}),"를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ mount 권장:"})," state-ref는 renew를 명시적으로 전달하는 방식이므로"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"mount"}),"와 함께 사용하는 것이 자연스럽습니다. lmount에서 사용하려면 useRenew()를 직접 호출해야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"더 알아보기"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"https://github.com/superlucky84/state-ref",target:"_blank",rel:"noopener noreferrer",class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"GitHub Repository →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"state-ref의 전체 API 문서와 더 많은 예제를 확인하세요."})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/vite-plugin",onClick:t=>{t.preventDefault(),y("/guide/vite-plugin")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"템플릿: Vite Plugin →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["JSX나 다양한 템플릿 방식을 사용하기 위한 Vite 플러그인 설정 방법을 알아보세요.",e("br",{}),"프로젝트에 맞는 템플릿 방식을 선택할 수 있습니다."]})]})})]}),td=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Context Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Context는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트 트리에서 데이터를 공유"}),"하는 헬퍼입니다.",e("br",{}),e("br",{}),"Props drilling 없이 깊은 계층의 컴포넌트에 데이터를 전달할 수 있으며,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 명시적으로 전달"}),"하는 방식으로 동작합니다. 따라서 mount 컴포넌트와 함께 사용하는 것이 자연스럽습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"1. Context 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"createContext"}),"로 Context를 생성합니다. 타입 인자로 Context가 관리할 데이터 구조를 정의합니다."]}),e(l,{language:"tsx",code:`import { createContext } from 'lithent/helper';

// Context 타입 정의
type UserContext = {
  name: string;
  age: number;
};

// Context 생성
const userContext = createContext<UserContext>();

// 구조분해로 필요한 것들 추출
const { Provider, contextState, useContext } = userContext;`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"2. contextState로 상태 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Provider에 전달할 상태를"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"로 생성합니다. 초기값을 인자로 전달합니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"일반적으로 renew를 전달하지 않습니다."})," ","Provider는 초기값을 제공하는 역할만 하고, Consumer에서 값을 구독하고 변경합니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"3. Provider로 Context 제공"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Provider 컴포넌트로 하위 컴포넌트들에게 Context를 제공합니다. Context 타입에 정의된 키들을 props로 전달합니다."}),e(l,{language:"tsx",code:`const App = mount(renew => {
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"4. useContext로 Context 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["하위 컴포넌트에서"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useContext"}),"로 Context를 사용합니다. renew를 전달하여 Context 변경 시 리렌더링되도록 합니다."]}),e(l,{language:"tsx",code:`const Header = mount(renew => {
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선택적 구독"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"useContext의 세 번째 인자로 구독할 키를 지정할 수 있습니다. 특정 필드의 변경에만 반응하도록 최적화할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 성능 최적화:"})," ","여러 필드를 가진 큰 Context에서는 선택적 구독을 사용하는 것이 좋습니다. 필요한 필드만 구독하면 불필요한 리렌더링을 방지할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context 값 변경"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["기본적으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"로 생성한 상태는 Provider와 Consumer 어디서든 값을 변경할 수 있습니다.",e("br",{}),e("br",{}),"하지만"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 없이 생성하면 Consumer에서만 구독"}),"되므로, Provider에서 값을 변경해도 Provider 자체는 리렌더링되지 않습니다. 실질적으로는 단방향처럼 동작합니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 권장 패턴:"})," 일반적으로"," ",e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"contextState"}),"는 renew 없이 생성하고, Consumer에서만 값을 읽고 변경하는 것이 좋습니다. Provider는 초기값만 제공하는 역할로 사용하세요."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"양방향 동기화 (권장하지 않음)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"의 두 번째 인자로 renew를 전달하면 진짜 양방향 동기화가 가능하지만,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"권장하지 않습니다."})]}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 양방향 동기화 문제:"}),e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"contextState(initialValue, renew)"}),e("br",{}),e("br",{}),"위처럼 renew를 전달하면 Provider에서 값 변경 시 Provider가 리렌더링되어 양방향 동기화가 가능합니다. 하지만"," ",e("strong",{class:"font-semibold",children:"Provider 하위 트리 전체가 리렌더링"}),"되는 부작용이 발생합니다.",e("br",{}),e("br",{}),"Consumer는 선택적 구독으로 필요한 컴포넌트만 리렌더링하지만, Provider에 renew를 전달하면 모든 하위 컴포넌트가 영향을 받아 성능 문제가 발생할 수 있습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold",children:"권장: renew를 전달하지 말고 Consumer에서만 값을 관리하세요."})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 Provider"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Provider는 중첩될 수 있으며, Consumer는 가장 가까운 상위 Provider를 사용합니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 Context 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"하나의 컴포넌트에서 여러 Context를 동시에 사용할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context vs Store 비교"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"Context"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"Store"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"범위"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Provider 하위 컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"전역 (모든 컴포넌트)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"중첩"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"가능 (Provider 중첩)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"불가능 (전역 단일)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 케이스"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"특정 트리 내 공유"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"앱 전역 상태"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Props drilling"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"해결함"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"해결함"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"선택적 구독"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원 (subscribeKeys)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원 (makeObserver)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"대상 컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount"})]})]})]})}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ Context 사용 권장"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 특정 컴포넌트 트리 내에서만 공유되는 데이터"}),e("li",{children:"• 같은 타입의 Context를 여러 곳에서 독립적으로 사용"}),e("li",{children:"• UI 테마, 언어 설정 등 트리별로 다를 수 있는 설정"}),e("li",{children:"• Props drilling을 피하고 싶을 때"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-blue-900 dark:text-blue-100 mb-2",children:"✅ Store 사용 권장"}),e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2",children:[e("li",{children:"• 앱 전역에서 공유되는 상태"}),e("li",{children:"• 사용자 인증 정보, 전역 설정 등"}),e("li",{children:"• 컴포넌트 트리와 무관하게 접근해야 하는 데이터"}),e("li",{children:"• 더 단순한 API를 원할 때"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ mount 전용:"})," Context는 renew를 명시적으로 전달하는 방식이므로"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"mount"})," ","컴포넌트에서 사용해야 합니다. lmount에서는"," ",e("a",{href:"/guide/lcontext",onClick:t=>{t.preventDefault(),y("/guide/lcontext")},class:"underline hover:no-underline font-medium",children:"lcontext"}),"를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Provider 필수:"})," useContext를 사용하려면 상위에 Provider가 반드시 있어야 합니다. Provider가 없으면 Context를 찾을 수 없습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ .value 접근:"})," contextState로 생성한 상태는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:".value"}),"를 통해 접근하고 변경해야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/examples/11",onClick:t=>{t.preventDefault(),y("/examples/11")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"예제: Context로 테마 & 사용자 공유 →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["여러 컴포넌트가 같은 Context(AppContext)를 구독하고,",e("br",{}),"user / theme / accent 값을 함께 공유하는 실제 예제를 실행해 보세요."]})]}),e("a",{href:"/guide/lcontext",onClick:t=>{t.preventDefault(),y("/guide/lcontext")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: LContext →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["lmount 컴포넌트에서 사용하는 LContext에 대해 알아보세요.",e("br",{}),"자동 renew 관리로 더 간편한 Context 사용 방법을 배워봅시다."]})]})]})]}),rd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"LContext Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"LContext란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["LContext는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lmount 컴포넌트 전용 Context"}),"입니다.",e("br",{}),e("br",{}),e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),y("/guide/context")},class:"text-[#42b883] hover:underline font-medium",children:"Context"}),"와 달리"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 자동으로 관리"}),"하며, lmount의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useRenew()"})," ","훅을 내부적으로 사용합니다. 따라서 lmount 컴포넌트에서 더 간편하게 Context를 사용할 수 있습니다."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"1. LContext 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"createLContext"}),"로 LContext를 생성합니다. 타입 인자로 Context가 관리할 데이터 구조를 정의합니다."]}),e(l,{language:"tsx",code:`import { createLContext } from 'lithent/helper';

// LContext 타입 정의
type UserContext = {
  name: string;
  age: number;
};

// LContext 생성
const userContext = createLContext<UserContext>();

// 구조분해로 필요한 것들 추출
const { Provider, contextState, useContext } = userContext;`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"2. contextState로 상태 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Provider에 전달할 상태를"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"로 생성합니다. 초기값을 인자로 전달합니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Context와 달리 renew 파라미터가 없습니다."})," ","Consumer에서 useContext를 호출할 때 자동으로 renew가 연결됩니다."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';

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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"3. Provider로 Context 제공"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Provider 컴포넌트로 하위 컴포넌트들에게 Context를 제공합니다. Context 타입에 정의된 키들을 props로 전달합니다."}),e(l,{language:"tsx",code:`const App = lmount((props, children) => {
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"4. useContext로 Context 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["하위 컴포넌트에서"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useContext"}),"로 Context를 사용합니다."," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew를 전달하지 않습니다"})," ","- 내부적으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useRenew()"}),"를 자동으로 호출하여 리렌더링을 관리합니다."]}),e(l,{language:"tsx",code:`const Header = lmount((props, children) => {
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
});`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 자동 renew 관리:"})," LContext는 lmount의"," ",e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"useRenew()"})," ","훅을 사용하여 renew를 자동으로 관리합니다. 따라서 Context보다 더 간편하게 사용할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선택적 구독"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"useContext의 두 번째 인자로 구독할 키를 지정할 수 있습니다. 특정 필드의 변경에만 반응하도록 최적화할 수 있습니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 성능 최적화:"})," ","여러 필드를 가진 큰 Context에서는 선택적 구독을 사용하는 것이 좋습니다. 필요한 필드만 구독하면 불필요한 리렌더링을 방지할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context 값 변경"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["LContext의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"contextState"}),"는 renew 파라미터를 받지 않습니다. 따라서"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Provider는 Context 값 변경을 구독하지 않습니다."}),e("br",{}),e("br",{}),"Provider에서 값을 변경하면 Consumer들은 업데이트되지만, Provider 자체는 리렌더링되지 않습니다. 실질적으로는 단방향처럼 동작합니다."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 권장 패턴:"})," Provider는 초기값만 제공하는 역할로 사용하고, Consumer에서만 값을 읽고 변경하는 것이 좋습니다. 이는"," ",e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),y("/guide/context")},class:"underline hover:no-underline font-medium",children:"Context"}),"와 동일한 패턴입니다."]})}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 양방향 동기화 불가:"})," LContext의"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"contextState"}),"는 renew 파라미터를 받지 않으므로, Provider에서 양방향 동기화를 구현할 수 없습니다.",e("br",{}),e("br",{}),"만약 Provider에서도 Context 값 변경에 반응해야 한다면, 일반적으로"," ",e("strong",{class:"font-semibold",children:"권장하지 않지만"})," ",e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),y("/guide/context")},class:"underline hover:no-underline font-medium",children:"Context"}),"를 사용하고"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"contextState(value, renew)"}),"로 renew를 전달할 수 있습니다. 하지만 이 경우 Provider 하위 트리 전체가 리렌더링되는 성능 문제가 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩 Provider"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Provider는 중첩될 수 있으며, Consumer는 가장 가까운 상위 Provider를 사용합니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 Context 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"하나의 컴포넌트에서 여러 Context를 동시에 사용할 수 있습니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Context vs LContext 비교"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"Context"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"LContext"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"대상 컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"lmount"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"renew 관리"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"수동 (renew 전달)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동 (useRenew 사용)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"contextState"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"contextState(value, renew?)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"contextState(value)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"useContext"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"useContext(ctx, renew, keys?)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"useContext(ctx, keys?)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Provider 구독"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"renew 전달 시 (비권장)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"불가 (renew 없음)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"선택적 구독"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"지원"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 편의성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"보통 (명시적 관리)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"높음 (자동 관리)"})]})]})]})}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ LContext 사용 권장"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• lmount 컴포넌트를 사용하는 경우"}),e("li",{children:"• renew를 자동으로 관리하고 싶을 때"}),e("li",{children:"• Consumer에서만 Context 값을 변경하는 단방향 패턴"}),e("li",{children:"• 더 간편한 API를 원할 때"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-blue-900 dark:text-blue-100 mb-2",children:"✅ Context 사용 권장"}),e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2",children:[e("li",{children:"• mount 컴포넌트를 사용하는 경우"}),e("li",{children:"• renew를 명시적으로 관리하고 싶을 때"}),e("li",{children:"• Provider는 초기값만 제공하는 단방향 패턴을 원할 때"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ lmount 전용:"})," LContext는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"lmount"})," ","컴포넌트 전용입니다. mount 컴포넌트에서는"," ",e("a",{href:"/guide/context",onClick:t=>{t.preventDefault(),y("/guide/context")},class:"underline hover:no-underline font-medium",children:"Context"}),"를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Provider 필수:"})," useContext를 사용하려면 상위에 Provider가 반드시 있어야 합니다. Provider가 없으면 Context를 찾을 수 없습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ .value 접근:"})," contextState로 생성한 상태는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:".value"}),"를 통해 접근하고 변경해야 합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ useRenew 의존성:"})," LContext는 내부적으로"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"useRenew()"}),"를 사용하므로, lmount의 Hook 규칙을 따라야 합니다. useContext는 조건문 안에서 호출하지 마세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/cache-update",onClick:t=>{t.preventDefault(),y("/guide/cache-update")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: CacheUpdate →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"Context에서 파생되는 값이나 목록을 효율적으로 캐시하고 업데이트하는 방법을 배워봅시다."})]})})]}),ad=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"CacheUpdate Helper"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"CacheUpdate란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["CacheUpdate는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트의 렌더링 결과를 캐싱"}),"하는 헬퍼입니다.",e("br",{}),e("br",{}),"의존성 배열이 변경되지 않으면 이전에 생성한 Virtual DOM을 재사용하여"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"불필요한 리렌더링을 방지"}),"합니다. React의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useMemo"}),"나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"React.memo"}),"와 유사한 개념입니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 성능 최적화:"})," cacheUpdate는 렌더링 최적화를 위한 도구입니다. 모든 컴포넌트에 사용할 필요는 없으며, 성능 병목이 발생하는 컴포넌트에만 선택적으로 적용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["cacheUpdate는 두 개의 인자를 받습니다:",e("br",{}),e("br",{}),"1."," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"checkFunction"}),": 의존성 배열을 반환하는 함수",e("br",{}),"2."," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"updater"}),": Virtual DOM을 반환하는 렌더 함수",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"중요:"})," ","checkFunction은 배열을 직접 전달하는 것이 아니라"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"배열을 반환하는 함수"}),"입니다. 이는 Lithent의 클로저 기반 상태 관리 방식 때문에 매 렌더링마다 최신 값을 읽기 위함입니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 동작 방식:"})," ","위 예제에서"," ",e("code",{class:"px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm",children:"changeOther"}),"를 클릭해도"," ",e("code",{class:"px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm",children:"count"}),"가 변경되지 않았으므로 렌더링이 발생하지 않습니다. 화면에 표시된"," ",e("code",{class:"px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm",children:"otherValue"}),"는 업데이트되지 않습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"의존성 배열"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["checkFunction은 배열을 반환해야 하며, 이 배열의 각 요소는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"참조 비교(===)"}),"로 이전 값과 비교됩니다. 모든 요소가 같으면 캐시된 렌더링 결과를 재사용합니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 왜 함수로 설계되었나요?"}),e("br",{}),e("br",{}),"Lithent는 ",e("strong",{class:"font-semibold",children:"클로저 기반 상태 관리"}),"를 사용합니다. 컴포넌트의 상태(count, name 등)는 클로저 변수로 존재하며, 매 렌더링 시점마다 변경 여부를 확인하려면"," ",e("strong",{class:"font-semibold",children:"그 시점의 최신 값"}),"을 읽어야 합니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"() => [count, name]"}),"처럼 함수로 설계하면, 의존성을 확인할 때마다 이 함수를 호출하여"," ",e("strong",{class:"font-semibold",children:"항상 최신 클로저 값"}),"을 가져올 수 있습니다. 함수 호출 시점에 count와 name의 현재 값을 읽어 배열로 반환하므로, 이전 값과 비교하여 변경 여부를 정확히 감지할 수 있습니다."]})}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
// props.userId가 변경되면? updater 함수가 props를 받으므로 자동으로 반영됨`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 참조 비교:"})," 의존성 배열은 참조 비교를 사용합니다. 객체나 배열을 의존성으로 사용할 때는 주의하세요. 내용이 같아도 참조가 다르면 다른 값으로 인식됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실제 사용 예시"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"1. 리스트 아이템 최적화"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"리스트의 각 아이템을 최적화하여, 다른 아이템이 변경되어도 영향을 받지 않도록 할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"2. 복잡한 계산 결과 캐싱"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"비용이 큰 계산의 결과를 캐싱하여 불필요한 재계산을 방지할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
}`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"3. 부분 업데이트 최적화"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"컴포넌트의 일부만 의존성으로 지정하여, 나머지 상태 변경 시 렌더링을 건너뛸 수 있습니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"cacheUpdate vs Computed 비교"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"cacheUpdate"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"computed"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"목적"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"렌더링 결과 캐싱"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"계산 결과 캐싱"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"반환값"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Virtual DOM (렌더 함수)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"계산된 값"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 위치"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount의 return 문"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mounter 함수 내부"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"의존성 지정"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"명시적 (checkFunction)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동 추적 (state 접근)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"renew 필요"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"필요 (수동)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"적용 대상"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount, lmount"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"mount (state와 함께)"})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 참조 비교:"})," 의존성 배열의 각 요소는"," ",e("code",{class:"px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm",children:"==="}),"로 비교됩니다. 객체나 배열을 의존성으로 사용하면, 내용이 같아도 참조가 다르면 매번 리렌더링됩니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 의존성 누락:"})," updater 함수에서 사용하는 모든 변수를 의존성 배열에 포함해야 합니다. 누락하면 화면이 최신 상태를 반영하지 못합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 과도한 사용 주의:"})," 모든 컴포넌트에 cacheUpdate를 사용할 필요는 없습니다. 실제로 성능 문제가 있는 부분에만 적용하세요. 불필요하게 사용하면 오히려 코드가 복잡해집니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ renew 호출:"})," 의존성이 변경되지 않으면 renew를 호출해도 리렌더링이 발생하지 않습니다. 이는 의도된 동작이지만, 예상과 다를 수 있으니 주의하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ cacheUpdate 사용 권장"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 렌더링 비용이 큰 컴포넌트 (복잡한 리스트, 차트 등)"}),e("li",{children:"• 일부 상태만 화면에 영향을 주는 경우"}),e("li",{children:"• 리스트의 각 아이템을 독립적으로 최적화하고 싶을 때"}),e("li",{children:"• Props가 자주 변경되지만 특정 props만 렌더링에 영향을 줄 때"})]})]}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2",children:"⚠️ cacheUpdate 사용 불필요"}),e("ul",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed space-y-2",children:[e("li",{children:"• 단순한 컴포넌트 (렌더링 비용이 작음)"}),e("li",{children:"• 모든 상태 변경이 화면에 반영되어야 하는 경우"}),e("li",{children:"• 성능 문제가 실제로 발생하지 않는 경우"}),e("li",{children:"• 코드 복잡도를 낮추는 것이 더 중요한 경우"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/examples/18",onClick:t=>{t.preventDefault(),y("/examples/18")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"예제: cacheUpdate로 리스트 최적화 →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["cacheUpdate로 리스트 렌더링 횟수를 줄이고,",e("br",{}),"루트 렌더와 부분 렌더 카운트를 눈으로 확인하는 예제를 실행해 보세요."]})]}),e("a",{href:"/guide/state-ref",onClick:t=>{t.preventDefault(),y("/guide/state-ref")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: State-Ref →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["깊은 중첩 객체에 대한 반응성을 제공하는 외부 라이브러리인 state-ref를 알아보세요.",e("br",{}),"복잡한 데이터 구조를 다룰 때 매우 유용합니다."]})]})]})]}),nd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"nextTick"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"nextTick이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["nextTick은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"현재 실행 컨텍스트가 끝난 후 다음 마이크로태스크 큐에서 실행되도록 보장하는 함수"}),"입니다.",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"Promise.resolve()"}),"를 반환하는 간단한 API로,"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"DOM 업데이트가 완료된 후"}),"에 특정 작업을 수행해야 할 때 유용합니다.",e("br",{}),e("br",{}),"renew()를 호출하면 Virtual DOM이 생성되고 실제 DOM이 업데이트됩니다. 이 과정은 동기적으로 실행되지만, nextTick을 사용하면 DOM 업데이트가 완전히 끝난 후의 시점을 보장받을 수 있습니다."]}),e(l,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["nextTick은 Promise를 반환하므로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"await"}),"키워드와 함께 사용하거나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:".then()"}),"으로 체이닝할 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"await 사용"}),e(l,{language:"tsx",code:`import { mount, nextTick } from 'lithent';

const App = mount((renew) => {
  let message = 'Hello';

  const update = async () => {
    message = 'Updated!';
    renew();

    await nextTick();
    console.log('DOM updated:', message);
  };

  return () => <div>{message}</div>;
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:".then() 사용"}),e(l,{language:"tsx",code:`import { mount, nextTick } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"DOM 요소 측정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"업데이트된 DOM 요소의 크기나 위치를 측정해야 할 때 nextTick을 사용할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"포커스 설정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"새로 추가된 입력 필드에 자동으로 포커스를 설정할 때 유용합니다."}),e(l,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"스크롤 위치 조정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"채팅 메시지를 추가한 후 스크롤을 맨 아래로 이동할 때 사용할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"애니메이션 트리거"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"DOM이 업데이트된 후 CSS 애니메이션이나 트랜지션을 트리거할 때 사용합니다."}),e(l,{language:"tsx",code:`import { mount, nextTick, ref } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"테스트에서 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"nextTick은 테스트 코드에서도 매우 유용합니다. DOM 업데이트를 기다린 후 검증할 때 사용할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount, render, nextTick } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["nextTick은 내부적으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"Promise.resolve()"}),"를 반환합니다:"]}),e(l,{language:"tsx",code:"export const nextTick = () => Promise.resolve();"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["JavaScript의 이벤트 루프에서 Promise는 마이크로태스크 큐에 추가됩니다. 현재 실행 중인 모든 동기 코드와 DOM 업데이트가 완료된 후, 마이크로태스크 큐의 작업들이 실행됩니다.",e("br",{}),e("br",{}),"실행 순서:"]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"renew() 호출 → Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"Diff 알고리즘 실행 → 변경사항 계산"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"실제 DOM 업데이트 (동기 작업)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"현재 콜 스택의 나머지 코드 실행"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"마이크로태스크 큐 실행 (nextTick의 콜백이 여기서 실행됨)"})]})]})}),e(l,{language:"tsx",code:`const update = async () => {
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
// 3. After nextTick`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"updateCallback과의 차이"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"nextTick과 updateCallback의 반환 함수는 비슷해 보이지만 사용 목적이 다릅니다:"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"nextTick"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"updateCallback 반환 함수"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"사용 위치"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"어디서든 (이벤트 핸들러, 함수 내부 등)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"마운터에서만 등록"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"실행 시점"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"명시적으로 호출한 시점"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"매 업데이트마다 자동 실행"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"의존성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"없음"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"의존성 배열 기반"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"용도"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"일회성 DOM 업데이트 대기"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"반복적인 업데이트 후 작업"})]})]})]})}),e(l,{language:"tsx",code:`import { mount, nextTick, updateCallback } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 동기적 DOM 업데이트:"})," Lithent의 renew()는 DOM을 동기적으로 업데이트합니다. nextTick이 필요한 이유는 브라우저 렌더링이 완료될 때까지 기다리기 위함이 아니라, 마이크로태스크 큐를 활용하여 현재 실행 컨텍스트 이후를 보장받기 위함입니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 과도한 사용 지양:"})," 대부분의 경우 updateCallback의 반환 함수로 충분합니다. nextTick은 일회성 작업이나 이벤트 핸들러 내부에서 필요할 때만 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 브라우저 렌더링:"})," nextTick은 마이크로태스크 큐까지만 보장합니다. 브라우저의 실제 화면 렌더링(paint)을 기다려야 한다면 requestAnimationFrame을 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 에러 처리:"})," nextTick이 반환하는 Promise는 항상 resolve됩니다. try-catch로 감쌀 필요는 없지만, nextTick 이후의 코드에서 발생하는 에러는 적절히 처리해야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 사용해야 할까?"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ nextTick 사용 권장"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 이벤트 핸들러에서 DOM 업데이트 후 작업이 필요할 때"}),e("li",{children:"• 새로 추가된 요소에 포커스를 설정하거나 측정할 때"}),e("li",{children:"• 테스트 코드에서 DOM 업데이트를 기다릴 때"}),e("li",{children:"• 일회성으로 업데이트 완료를 기다려야 할 때"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-blue-900 dark:text-blue-100 mb-2",children:"💡 updateCallback 사용 권장"}),e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2",children:[e("li",{children:"• 매 업데이트마다 반복적으로 실행해야 하는 작업"}),e("li",{children:"• 특정 의존성이 변경될 때만 실행하고 싶을 때"}),e("li",{children:"• 컴포넌트 생명주기에 맞춘 작업"}),e("li",{children:"• 외부 라이브러리와의 지속적인 동기화"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/stateless",onClick:t=>{t.preventDefault(),y("/guide/stateless")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Stateless Components →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["상태가 전혀 없는 UI는 mount 없이 간단한 함수 컴포넌트로도 충분히 표현할 수 있습니다.",e("br",{}),"Lithent에서의 단순 컴포넌트 패턴을 살펴봅니다."]})]})})]}),ld=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Vite Plugin"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"@lithent/lithent-vite란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@lithent/lithent-vite"}),"는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Lithent를 위한 공식 Vite 플러그인"}),"입니다.",e("br",{}),e("br",{}),"개발 중 Hot Module Replacement(HMR)를 활성화하여 컴포넌트 상태를 잃지 않고 즉시 변경사항을 확인할 수 있습니다. 플러그인이 자동으로 HMR 경계를 주입하여 원활한 개발 경험을 제공합니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주요 기능"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ul",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Hot Module Replacement"}),": 개발 중 즉각적인 업데이트"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"자동 HMR 경계"}),": mount 컴포넌트를 자동으로 래핑"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"마커 지원"}),": 주석으로 명시적 HMR 경계 제어"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"타입 안전"}),": 완전한 TypeScript 지원"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"•"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"제로 설정"}),": 합리적인 기본값으로 즉시 작동"]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"설치"}),e(l,{language:"bash",code:`npm install @lithent/lithent-vite
# or
pnpm add @lithent/lithent-vite
# or
yarn add @lithent/lithent-vite`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"📦 Peer Dependencies:"}),e("br",{}),"• lithent: 1.x",e("br",{}),"• vite: 5.x"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 설정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"vite.config.js"})," ","또는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"vite.config.ts"}),"에 플러그인을 추가합니다:"]}),e(l,{language:"typescript",code:`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin(),
  ],
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이것으로 끝입니다! 플러그인이 자동으로 Lithent 컴포넌트에 HMR을 활성화합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"옵션 설정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"플러그인 동작을 커스터마이징할 수 있습니다:"}),e(l,{language:"typescript",code:`import { defineConfig } from 'vite';
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"주요 옵션"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"타입"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"기본값"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"include"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"RegExp | RegExp[]"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"/\\.([cm]?[tj]sx?)$/"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"변환할 파일 패턴"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"boundaryMarker"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"string"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"'/* lithent:hmr-boundary */'"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"HMR 경계 마커 문자열"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"jsxImportSource"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"string"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"'lithent'"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"자동 JSX 변환 소스"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"devtoolsInProd"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"boolean"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"false"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"프로덕션 devtools 활성화"})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"동작 원리"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"자동 HMR 경계"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["플러그인은 자동으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"mount"}),"를 사용하는 컴포넌트를 래핑합니다:"]}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"변환 전:"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4",children:"변환 후:"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
import { createHmrBoundary } from 'lithent/devHelper';

const App = createHmrBoundary(
  mount((renew, props) => {
    return () => <div>Hello World</div>;
  }),
  import.meta.hot,
  'App'
);

export default App;`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"createHmrBoundary"}),"는 컴포넌트를 감싸서 HMR 업데이트 시 상태를 적절히 처리합니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"명시적 HMR 경계"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"마커 주석을 사용하여 세밀한 제어가 가능합니다:"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"/* lithent:hmr-boundary default */"})," ","주석은 해당 파일의 default export에 명시적으로 HMR 경계를 추가합니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"상태 보존 (모듈 단위 HMR)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"네이티브 클로저 기반 상태 관리"}),"를 사용하므로, HMR이"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"모듈(파일) 단위"}),"로 동작합니다:"]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-3",children:[e("li",{children:[e("strong",{children:"🔄 수정한 모듈:"})," 코드를 수정한 파일(모듈) 전체의 클로저 상태가 리셋됩니다",e("br",{}),e("span",{class:"text-xs opacity-80",children:"→ 해당 파일의 모든 컴포넌트와 변수가 재생성되어 초기화됨"})]}),e("li",{children:[e("strong",{children:"✅ 수정하지 않은 모듈:"})," 다른 파일의 컴포넌트 상태는 모두 유지됩니다",e("br",{}),e("span",{class:"text-xs opacity-80",children:"→ 부모/자식/형제 컴포넌트가 다른 파일에 있다면 영향받지 않음"})]})]})}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("strong",{children:"⚠️ 중요:"})," HMR은 파일(모듈) 단위로 동작합니다. 한 파일에 여러 컴포넌트가 있다면 그 중 하나만 수정해도 파일 전체가 교체되므로 모든 컴포넌트의 상태가 리셋됩니다.",e("br",{}),e("br",{}),e("strong",{children:"⚠️ 외부 상태도 모듈 단위:"})," lithent/helper의 state 또는 store로 만들어진 외부 상태라도, 그 상태를 생성한 모듈이 HMR로 교체되면 해당 상태도 함께 초기화됩니다. 상태가 정의된 모듈의 클로저 컨텍스트가 재생성되기 때문입니다."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"React HMR과의 차이점"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["React는 컴포넌트 상태를 React의 상태 시스템에 저장하므로 HMR 시 보존이 가능하지만, Lithent는 클로저 자체에 상태를 저장하므로 모듈이 재로드되면 해당 모듈의 클로저가 재생성되어 상태도 리셋됩니다.",e("br",{}),e("br",{}),"이는 Lithent의"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"네이티브 JavaScript 클로저 기반 설계"}),"에서 비롯된 자연스러운 동작입니다. 개발 중 수정한 파일의 상태를 항상 초기화하여 깨끗한 상태에서 테스트할 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"실제 동작 예시"}),e(l,{language:"tsx",code:`// ParentComponent.tsx (파일 A)
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
//    - parentCount, childCount 모두 리셋됨`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 개발 팁:"})," ","컴포넌트를 별도 파일로 분리하면, 한 컴포넌트를 수정할 때 다른 컴포넌트의 상태가 유지됩니다. 이는 개발 중 더 나은 HMR 경험을 제공합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"SSR 설정 (Express/Node.js)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Vite 미들웨어와 함께 서버 사이드 렌더링을 사용하는 경우:"}),e(l,{language:"javascript",code:`import express from 'express';
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

app.listen(3000);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"문제 해결"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"HMR이 작동하지 않을 때"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("ol",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed space-y-2",children:[e("li",{children:"1. 플러그인이 다른 변환 플러그인보다 먼저 로드되는지 확인하세요"}),e("li",{children:"2. 파일이 include 패턴과 일치하는지 확인하세요"}),e("li",{children:"3. import.meta.hot이 사용 가능한지 확인하세요 (개발 모드에만 존재)"})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"TypeScript 에러"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"tsconfig.json"}),"에 Vite 클라이언트 타입을 추가하세요:"]}),e(l,{language:"json",code:`{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"관련 패키지"}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("ul",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed space-y-2",children:[e("li",{children:[e("strong",{class:"text-gray-700 dark:text-gray-300",children:"@lithent/hmr-parser"})," ","- 핵심 HMR 변환 로직"]}),e("li",{children:[e("strong",{class:"text-gray-700 dark:text-gray-300",children:"lithent"})," - Lithent 코어 라이브러리"]}),e("li",{children:[e("strong",{class:"text-gray-700 dark:text-gray-300",children:"lithent/devHelper"})," ","- 브라우저 사이드 HMR 런타임"]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/jsx-manual",onClick:t=>{t.preventDefault(),y("/guide/jsx-manual")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"JSX & Templates: Manual JSX Setup →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Vite 플러그인 없이 수동으로 JSX를 설정하는 방법을 알아보세요.",e("br",{}),"TypeScript와 Babel 설정 방법을 배워봅시다."]})]})})]}),dd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Manual JSX Setup"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"개요"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Vite 플러그인을 사용하지 않고 직접 JSX를 설정하는 방법을 안내합니다.",e("br",{}),e("br",{}),"TypeScript, Babel, Vite(esbuild) 등 다양한 도구에서 Lithent의 JSX를 사용할 수 있도록 설정할 수 있습니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 언제 Manual Setup이 필요한가요?"}),e("br",{}),e("br",{}),"• Vite를 사용하지 않는 프로젝트",e("br",{}),"• Babel 기반 빌드 시스템 (Create React App, Next.js 등)",e("br",{}),"• TypeScript만으로 빌드하는 환경",e("br",{}),"• 커스텀 빌드 파이프라인"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"JSX 변환 방식"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"JSX는 JavaScript의 확장 문법으로, 브라우저가 직접 이해할 수 없습니다. 따라서 빌드 도구가 JSX를 일반 JavaScript로 변환해야 합니다."}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"Classic Transform (전통적 변환)"}),e(l,{language:"tsx",code:`// JSX 코드
const element = <div className="box">Hello</div>;

// 변환 후 (Classic)
import { h } from 'lithent';
const element = h('div', { className: 'box' }, 'Hello');`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Classic 방식은"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"h"})," ","함수를 명시적으로 호출합니다. React의 React.createElement와 동일한 패턴입니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Automatic Transform (자동 변환)"}),e(l,{language:"tsx",code:`// JSX 코드
const element = <div className="box">Hello</div>;

// 변환 후 (Automatic)
import { jsx as _jsx } from 'lithent/jsx-runtime';
const element = _jsx('div', { className: 'box', children: 'Hello' });`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Automatic 방식은 JSX runtime을 자동으로 import하며, 파일 상단에"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"import { h }"}),"를 작성할 필요가 없습니다."]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 권장 사항:"})," ","TypeScript 4.1.1 이상을 사용한다면"," ",e("strong",{class:"text-gray-700 dark:text-gray-300",children:"Automatic Transform"}),"을 권장합니다. 코드가 더 깔끔하고 import 문을 자동으로 처리합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"TypeScript 설정"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"방법 1: Automatic Transform (권장)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"TypeScript 4.1.1 이상에서 사용 가능한 자동 JSX 변환 방식입니다."}),e(l,{language:"json",code:`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'jsx: "react-jsx"'})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["새로운 JSX 변환 방식 활성화. JSX를 자동으로 ",e("code",{children:"_jsx()"})," ","함수 호출로 변환"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxImportSource"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX runtime을 가져올 패키지 지정. ",e("code",{children:"lithent/jsx-runtime"}),"에서 자동으로 import"]})]})]})]})}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"장점"}),e("ul",{class:"space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:["매 파일마다"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"import { h, Fragment } from 'lithent'"})," ","작성 불필요"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:"더 작은 번들 크기 (사용되는 함수만 import)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:"최신 React 생태계와 호환"})]})]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"방법 2: Classic Transform"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"전통적인 JSX 변환 방식입니다. 모든 TypeScript 버전에서 사용 가능합니다."}),e(l,{language:"json",code:`{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'jsx: "react"'})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Classic JSX 변환 활성화. JSX를 factory 함수 호출로 변환"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFactory"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX 요소를 변환할 함수 이름. Lithent는 ",e("code",{children:"h"})," 함수 사용"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFragmentFactory"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["Fragment 요소를 변환할 함수 이름. Lithent는 ",e("code",{children:"Fragment"})," ","사용"]})]})]})]})}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"사용 예시"}),e(l,{language:"tsx",code:`import { h, Fragment, mount } from 'lithent';

const App = mount((renew) => {
  return () => (
    <Fragment>
      <div>Hello</div>
      <div>World</div>
    </Fragment>
  );
});`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("strong",{children:"⚠️ 주의:"})," Classic Transform 사용 시 매 파일마다"," ",e("code",{class:"px-2 py-1 bg-yellow-700 dark:bg-yellow-600 rounded text-sm",children:"import { h, Fragment }"}),"를 작성해야 합니다. 작성하지 않으면"," ",e("code",{class:"px-2 py-1 bg-yellow-700 dark:bg-yellow-600 rounded text-sm",children:"h is not defined"})," ","에러가 발생합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Babel 설정"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Babel을 사용하는 프로젝트에서 Lithent JSX를 설정하는 방법입니다."}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"Classic Transform"}),e(l,{language:"json",code:`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "h",
        "pragmaFrag": "Fragment"
      }
    ]
  ]
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"pragma"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX 요소를 생성할 함수 이름. 기본값은"," ",e("code",{children:"React.createElement"}),", Lithent는 ",e("code",{children:"h"})]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"pragmaFrag"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["Fragment 컴포넌트 이름. 기본값은 ",e("code",{children:"React.Fragment"}),", Lithent는 ",e("code",{children:"Fragment"})]})]})]})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Automatic Transform"}),e(l,{language:"json",code:`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic",
        "importSource": "lithent"
      }
    ]
  ]
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'runtime: "automatic"'})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"새로운 JSX 변환 활성화. JSX runtime을 자동으로 import"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"importSource"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX runtime 패키지 지정. ",e("code",{children:"lithent/jsx-runtime"}),"에서 import"]})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Vite 설정 (esbuild)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Vite 플러그인 없이 esbuild의 JSX 설정만 사용하는 방법입니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"주의:"})," ","이 방식은 HMR을 지원하지 않습니다. HMR이 필요하다면"," ",e("a",{href:"/guide/vite-plugin",onClick:t=>{t.preventDefault(),y("/guide/vite-plugin")},class:"text-[#42b883] hover:underline",children:"@lithent/lithent-vite"})," ","플러그인을 사용하세요."]}),e(l,{language:"typescript",code:`import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
});`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFactory"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["esbuild의 JSX factory 함수. ",e("code",{children:"<div />"}),"를"," ",e("code",{children:"h('div')"}),"로 변환"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFragment"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["esbuild의 Fragment 컴포넌트. ",e("code",{children:"<></>"}),"를"," ",e("code",{children:"Fragment"}),"로 변환"]})]})]})]})}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","esbuild는 현재 Automatic Transform을 지원하지 않습니다. Classic Transform만 사용 가능합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"TypeScript + Babel 조합"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["TypeScript로 타입 체크만 하고, Babel로 실제 변환을 수행하는 설정입니다.",e("br",{}),"Next.js, Create React App 등에서 주로 사용하는 패턴입니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"tsconfig.json"}),e(l,{language:"json",code:`{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"옵션"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'jsx: "preserve"'})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JSX 구문을 그대로 유지하고 변환하지 않음. Babel이 나중에 변환"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"jsxFactory"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["타입 체크용. TypeScript가 ",e("code",{children:"h"}),"가 유효한 factory임을 인식"]})]})]})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:".babelrc"}),e(l,{language:"json",code:`{
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
}`}),e("div",{class:"overflow-x-auto mb-6 mt-4",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설정"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"설명"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@babel/typescript"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["TypeScript 파일 처리. ",e("code",{children:'jsxPragma: "h"'}),"로 factory 지정"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@babel/transform-react-jsx"})}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["JSX를 JavaScript로 변환. ",e("code",{children:"pragma"}),"와"," ",e("code",{children:"pragmaFrag"})," 설정"]})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"문제 해결"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:'"h is not defined" 에러'}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("strong",{children:"원인:"})," Classic Transform 사용 시"," ",e("code",{class:"px-2 py-1 bg-red-700 dark:bg-red-600 rounded text-sm",children:"h"})," ","함수를 import하지 않았습니다."]})}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"해결 방법 1: h 함수 import"}),e(l,{language:"tsx",code:`import { h, Fragment } from 'lithent';

const App = () => <div>Hello</div>;`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"해결 방법 2: Automatic Transform 사용"}),e(l,{language:"json",code:`// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}

// 이제 import 없이 사용 가능
const App = () => <div>Hello</div>;`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"TypeScript 타입 에러"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("strong",{children:"증상:"}),` JSX 요소에 빨간 밑줄이 생기고 "JSX element implicitly has type 'any'" 에러가 발생합니다.`]})}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"해결 방법: 타입 정의 추가"}),e(l,{language:"typescript",code:`// src/jsx.d.ts 파일 생성
import 'lithent';

declare module 'lithent' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"또는 tsconfig.json에 lithent 타입을 포함:"}),e(l,{language:"json",code:`{
  "compilerOptions": {
    "types": ["lithent"]
  }
}`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"권장 설정 요약"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-4",children:"현대적인 TypeScript 프로젝트"}),e(l,{language:"json",code:`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}`})]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-4",children:"Vite 프로젝트 (HMR 필요)"}),e(l,{language:"typescript",code:`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [lithentVitePlugin()],
});`})]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-4",children:"Babel 프로젝트"}),e(l,{language:"json",code:`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic",
        "importSource": "lithent"
      }
    ]
  ]
}`})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/ftags",onClick:t=>{t.preventDefault(),y("/guide/ftags")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"JSX & Templates: FTags →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["JSX 없이 함수형 API로 컴포넌트를 작성하는 FTags를 알아보세요.",e("br",{}),"빌드 도구 설정 없이 즉시 사용 가능합니다."]})]})})]}),od=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"FTags"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"개요"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/ftags"}),"는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"JSX 없이 순수 JavaScript/TypeScript 함수로 UI를 작성"}),"할 수 있는 함수형 API입니다.",e("br",{}),e("br",{}),"빌드 도구 설정 없이 즉시 사용 가능하며, TypeScript에서 완전한 타입 안전성을 제공합니다."]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"주요 장점"}),e("ul",{class:"space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"제로 설정:"})," ","Babel, TypeScript, Vite 설정 불필요"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"타입 안전:"})," ","완전한 TypeScript 타입 추론"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"유연한 문법:"})," ","Props 생략 가능한 직관적 API"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"CDN 친화적:"})," ","빌드 도구 없이 브라우저에서 직접 사용 가능"]})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"설치"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"NPM"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent를 설치하면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/ftags"}),"를 바로 사용할 수 있습니다. 별도의 설치가 필요하지 않습니다."]}),e(l,{language:"bash",code:`npm install lithent
# or
pnpm add lithent`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"CDN (UMD)"}),e(l,{language:"html",code:`<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js
"><\/script>

<script>
  const { render } = lithent;
  const { fTags, fMount, fFragment } = lithentFTags;

  // 사용 가능
<\/script>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"fTags - HTML 요소 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"fTags"}),"는 Proxy 기반으로 모든 HTML 태그를 동적으로 생성합니다. 구조 분해 할당으로 필요한 태그만 가져올 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e(l,{language:"typescript",code:`import { render } from 'lithent';
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

render(element3, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Props 생략 가능"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["FTags의 핵심 기능 중 하나는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Props 자동 감지"}),"입니다. 첫 번째 인자가 일반 객체(props)인지 children인지 자동으로 판단합니다."]}),e(l,{language:"typescript",code:`const { div, span } = fTags;

// Props 없이 children만
div('텍스트만');
div(span('중첩 요소'));

// Props와 children
div({ id: 'app' }, '텍스트');
div({ className: 'box' }, span('중첩'));

// Props만 (children 없음)
input({ type: 'text', placeholder: '입력...' });

// 모두 없음
div();`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 동작 원리:"}),e("br",{}),e("br",{}),"FTags는 내부적으로"," ",e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"isPropType()"})," ","함수를 사용하여 첫 번째 인자를 검사합니다:",e("br",{}),e("br",{}),"• 일반 객체(Plain Object)이고 Virtual DOM이 아니면 → Props로 처리",e("br",{}),"• 문자열, 숫자, Virtual DOM 등이면 → Children으로 처리"]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Props 속성"}),e(l,{language:"typescript",code:`const { div, button, input, a } = fTags;

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
a({ href: 'https://example.com', target: '_blank' }, 'Visit Site');`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"복잡한 중첩 구조"}),e(l,{language:"typescript",code:`const { section, div, h1, p, ul, li, strong } = fTags;

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

render(page, document.getElementById('root'));`}),e("div",{class:"border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-emerald-800 dark:text-emerald-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 마운터 없이도 OK:"})," fTags로 만든 결과는 바로 render에 넘겨 사용할 수 있습니다. 컴포넌트 추상화가 필요할 때만 fMount/flMount를 쓰고, 단순 정적/동적 트리를 만들 때는 위 예시처럼 바로 render를 호출하면 됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"fFragment - Fragment 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"fFragment"}),"는 여러 요소를 감싸는 wrapper 없이 그룹화합니다. JSX의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<></>"}),"와 동일합니다."]}),e(l,{language:"typescript",code:`import { fTags, fFragment } from 'lithent/ㅏftags';

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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 사용 사례:"}),e("br",{}),e("br",{}),"• 컴포넌트에서 여러 최상위 요소 반환",e("br",{}),"• 테이블의 여러 행 그룹화 (tr 여러 개)",e("br",{}),"• 불필요한 div wrapper 제거"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"fMount - 컴포넌트 생성"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"fMount"}),"는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"mount"})," ","스타일의 컴포넌트 함수를 JSX 없이 바로 사용할 수 있게 합니다."," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"mount나 lmount로 한 번 더 감싸지 말고"}),", renew 인자를 받는 원본 컴포넌트를 그대로 전달하세요."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 컴포넌트"}),e(l,{language:"typescript",code:`import { render } from 'lithent';
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
render(Counter(), document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Props가 있는 컴포넌트"}),e(l,{language:"typescript",code:`import { render } from 'lithent';
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
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Children이 있는 컴포넌트"}),e(l,{language:"typescript",code:`import { render } from 'lithent';
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
);`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Props와 Children 함께 사용"}),e(l,{language:"typescript",code:`import { render } from 'lithent';
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
);`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 Props 생략 가능:"}),e("br",{}),e("br",{}),"FMount도 fTags처럼 Props를 생략할 수 있습니다:",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"Card() // Props, Children 모두 없음"}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"Card(p('Text')) // Props 없이 Children만"}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"Card({ title: 'Hi' }) // Props만"}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"Card({ title: 'Hi' }, p('Text')) // Props와 Children"})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"flMount - Light API 컴포넌트"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"flMount"}),"는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lmount"}),"(Light API) 스타일 컴포넌트를 JSX 없이 함수 형태로 사용할 수 있게 합니다. lmount로 한 번 더 감쌀 필요 없이, renew가 없는 Light API 컴포넌트를 바로 전달하세요. 상태 갱신이 필요하면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useRenew"}),"나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lstate"}),"를 사용해 다시 그리면 됩니다."]}),e(l,{language:"typescript",code:`import { render, useRenew } from 'lithent';
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

render(Counter(), document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"lstate와 함께 사용 (권장)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"flMount"}),"는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lstate"}),"(lithent/helper)와 함께 사용하면 더욱 강력합니다. renew 없이 자동으로 상태가 추적되고 업데이트됩니다."]}),e(l,{language:"typescript",code:`import { render } from 'lithent';
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

render(Counter(), document.getElementById('root'));`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"복잡한 예제: Todo 앱 (lstate 사용)"}),e(l,{language:"typescript",code:`import { render } from 'lithent';
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

render(TodoApp(), document.getElementById('root'));`}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h4",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"💡 flMount + lstate의 장점"}),e("ul",{class:"space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"renew 불필요:"})," ","상태가 자동으로 추적되고 업데이트됨"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"간결한 코드:"})," ","lstate가 상태 변경을 감지하여 자동 렌더링"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"함수형 스타일:"})," ","JSX 없이도 깔끔한 함수형 컴포넌트 작성"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"빌드 도구 불필요:"})," ","CDN으로도 즉시 사용 가능"]})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"Todo 앱"}),e(l,{language:"typescript",code:`import { render } from 'lithent';
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

render(TodoApp(), document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"재사용 가능한 컴포넌트 조합"}),e(l,{language:"typescript",code:`import { render } from 'lithent';
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

render(App(), document.getElementById('root'));`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"JSX vs FTags 비교"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",children:[e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"JSX 방식"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`})]}),e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"FTags 방식"}),e(l,{language:"typescript",code:`import { mount } from 'lithent';
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
          `})]})]}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특징"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"JSX"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"FTags"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"빌드 설정"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Babel/TypeScript 설정 필요"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"설정 불필요"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"CDN 사용"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"불가능 (빌드 필요)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"즉시 사용 가능"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"가독성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"HTML과 유사 (직관적)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"함수 호출 형태"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"타입 안전성"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"완전 지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"완전 지원"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"학습 곡선"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"HTML 지식 활용"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JavaScript 함수 호출"})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 FTags를 사용할까?"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-green-900 dark:text-green-100 mb-2",children:"✓ FTags가 적합한 경우"}),e("ul",{class:"space-y-2 text-sm md:text-base text-green-800 dark:text-green-200",children:[e("li",{children:"• 빌드 도구 설정을 피하고 싶을 때"}),e("li",{children:"• CDN으로 즉시 프로토타입을 만들 때"}),e("li",{children:"• 순수 JavaScript/TypeScript로 작업하고 싶을 때"}),e("li",{children:"• 작은 위젯이나 라이브러리를 만들 때"}),e("li",{children:"• JSX 설정이 어려운 환경 (일부 레거시 프로젝트)"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"ℹ️ JSX가 더 나은 경우"}),e("ul",{class:"space-y-2 text-sm md:text-base text-blue-800 dark:text-blue-200",children:[e("li",{children:"• 대규모 애플리케이션 개발"}),e("li",{children:"• 팀이 JSX에 익숙할 때"}),e("li",{children:"• 복잡한 UI 구조 (JSX가 더 읽기 쉬움)"}),e("li",{children:"• 이미 빌드 환경이 구축된 프로젝트"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"TypeScript 타입 정의"}),e(l,{language:"typescript",code:`import type { Props, WDom, MiddleStateWDom } from 'lithent';

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
) => WDom;`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/htm-tags",onClick:t=>{t.preventDefault(),y("/guide/htm-tags")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"JSX & Templates: HTM Tags →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Template literal 기반의 HTM(Hyperscript Tagged Markup)을 알아보세요.",e("br",{}),"HTML과 유사한 문법으로 빌드 도구 없이 사용 가능합니다."]})]})})]}),sd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"HTM Tags"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"HTM이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("a",{href:"https://github.com/developit/htm",target:"_blank",rel:"noopener noreferrer",class:"text-[#42b883] hover:underline font-medium",children:"HTM (Hyperscript Tagged Markup)"}),"은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"JSX-like 문법을 순수 JavaScript로 사용"}),"할 수 있게 해주는 라이브러리입니다.",e("br",{}),e("br",{}),"트랜스파일러 없이 브라우저에서 직접 JSX와 유사한 문법을 사용할 수 있으며, 매우 작은 크기(약 600 bytes)를 자랑합니다.",e("br",{}),e("br",{}),"Lithent는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"})," ","패키지를 통해 HTM을 Lithent의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"h"})," ","함수에 바인딩하여 제공합니다."]}),e("div",{class:"border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:[e("span",{class:"font-medium",children:"✨ 주요 특징:"}),e("br",{}),e("br",{}),"• 트랜스파일러 불필요 - 순수 JavaScript",e("br",{}),"• 매우 작은 크기 - 약 600 bytes",e("br",{}),"• JSX와 유사한 문법",e("br",{}),"• ES6 Tagged Templates 사용",e("br",{}),"• 모든 모던 브라우저 지원"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"설치 및 기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"설치"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent를 설치하면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"}),"를 바로 사용할 수 있습니다. 별도의 설치가 필요하지 않습니다."]}),e(l,{language:"bash",code:"npm install lithent"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"CDN 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"빌드 툴 없이 브라우저에서 직접 사용하고 싶다면 CDN을 통해 import할 수 있습니다. ES modules를 사용하여 HTM과 Lithent를 함께 사용할 수 있습니다."}),e(l,{language:"html",code:`<!DOCTYPE html>
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
</html>`}),e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"✨ CDN 장점:"})," 위 HTML 파일을 그대로 저장하고 브라우저에서 열면 바로 동작합니다. 빌드 설정이나 번들러가 전혀 필요하지 않습니다!",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"📦 추가 패키지:"})," Helper 기능도 사용하려면"," ",e("code",{class:"px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm",children:"lithent@2/helper/dist/lithentHelper.umd.js"}),"를 추가로 로드하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"🔖 버전 지정:"})," 특정 버전을 사용하려면"," ",e("code",{class:"px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm",children:"lithent@1.20.2"})," ","처럼 버전을 명시할 수 있습니다."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"기본 사용 (npm)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"}),"에서"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lTag"}),"를 import하면 바로 사용할 수 있습니다."]}),e(l,{language:"javascript",code:`import { mount, render } from 'lithent';
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

render(lTag\`<\${App} />\`, document.getElementById('root'));`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 Tagged Templates:"})," HTM은 ES6 Tagged Templates를 사용합니다."," ",e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm",children:"lTag`...`"})," ","형태로 사용하며, 백틱(`) 안에 HTML-like 마크업을 작성합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"JSX와의 차이점"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"HTM은 JSX와 매우 유사하지만 몇 가지 차이점이 있습니다:"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특성"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"JSX"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"HTM"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"트랜스파일러"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"필요 (Babel 등)"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"불필요 (순수 JS)"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"컴포넌트"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"<Foo />"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"<${Foo} />"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Spread Props"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"<div {...props}>"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"<div ...${props}>"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"종료 태그"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"</Foo>"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:["<//>"," (간단 종료)"]})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"HTML 따옴표"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"필수"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"선택 (class=foo)"})]})]})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"예제 비교"}),e(l,{language:"javascript",code:`// JSX
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
<//>\``}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"카운터 애플리케이션"}),e(l,{language:"javascript",code:`import { mount, render } from 'lithent';
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

render(lTag\`<\${Counter} />\`, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Todo 리스트"}),e(l,{language:"javascript",code:`import { mount, render } from 'lithent';
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

render(lTag\`<\${TodoApp} />\`, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"컴포넌트 구성"}),e(l,{language:"javascript",code:`import { mount, render } from 'lithent';
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

render(lTag\`<\${App} />\`, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Fragment 사용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["HTM은 자동으로 여러 루트 요소를 Fragment로 처리합니다. JSX처럼"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<></>"}),"를 명시할 필요가 없습니다."]}),e(l,{language:"javascript",code:`import { mount, render, Fragment } from 'lithent';
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

render(lTag\`<\${ConditionalContent} />\`, document.getElementById('root'));`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 Fragment:"})," ","HTM은 자동으로 여러 루트 요소를 배열로 반환하므로, 대부분의 경우 Fragment를 명시하지 않아도 됩니다. 하지만 조건부 렌더링이나 의미를 명확히 하고 싶을 때는 Fragment를 명시적으로 사용할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"직접 바인딩하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"}),"를 사용하지 않고 직접 HTM을 바인딩할 수도 있습니다."]}),e(l,{language:"javascript",code:`import { h, mount, render } from 'lithent';
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

render(html\`<\${App} />\`, document.getElementById('root'));`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lithent/tag"}),"의 lTag는 내부적으로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"htm.bind(h)"}),"를 수행한 것입니다. 직접 바인딩하는 것과 동일하게 동작합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"HTM vs JSX 선택하기"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-green-900 dark:text-green-100 mb-2",children:"✅ HTM을 사용하면 좋은 경우"}),e("ul",{class:"text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2",children:[e("li",{children:"• 빌드 툴 없이 브라우저에서 직접 개발하고 싶을 때"}),e("li",{children:"• 프로토타입이나 간단한 프로젝트"}),e("li",{children:"• CDN에서 직접 import하여 사용하고 싶을 때"}),e("li",{children:"• 빌드 설정이 복잡한 환경을 피하고 싶을 때"}),e("li",{children:"• 번들 크기를 최소화하고 싶을 때"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-medium text-blue-900 dark:text-blue-100 mb-2",children:"✅ JSX를 사용하면 좋은 경우"}),e("ul",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2",children:[e("li",{children:"• 대규모 프로젝트"}),e("li",{children:"• TypeScript를 사용하고 완전한 타입 체킹을 원할 때"}),e("li",{children:"• IDE의 자동완성과 문법 검사를 최대한 활용하고 싶을 때"}),e("li",{children:"• 빌드 시간에 최적화를 원할 때"}),e("li",{children:"• 팀에서 JSX에 익숙한 경우"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 컴포넌트 참조:"})," HTM에서 컴포넌트를 사용할 때는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"<${Component} />"})," ","형태로 달러 기호와 중괄호를 사용해야 합니다. JSX처럼"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"<Component />"}),"를 사용하면 동작하지 않습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 백틱 사용:"})," HTM은 ES6 Tagged Templates를 사용하므로 반드시 백틱(`)을 사용해야 합니다. 일반 따옴표나 큰따옴표는 사용할 수 없습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 런타임 파싱:"})," HTM은 런타임에 템플릿을 파싱합니다. JSX는 빌드 타임에 컴파일되므로 런타임 성능은 JSX가 더 우수합니다. 하지만 HTM도 충분히 빠르며, 템플릿 캐싱을 통해 성능을 최적화합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"더 알아보기"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"https://github.com/developit/htm",target:"_blank",rel:"noopener noreferrer",class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"HTM GitHub Repository →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"HTM의 공식 문서와 더 많은 예제를 확인하세요."})]}),e("a",{href:"/guide/template-strings",onClick:t=>{t.preventDefault(),y("/guide/template-strings")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Template Strings →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["강력한 지시자(l-if, l-for)를 제공하는 Lithent의 템플릿 시스템을 알아보세요.",e("br",{}),"JSX와 유사하면서도 더 선언적인 문법을 제공합니다."]})]})]})]}),id=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Template Strings"}),e("div",{class:"border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed",children:[e("span",{class:"font-medium text-red-900 dark:text-red-100",children:"⚠️ 실험적 기능 (Experimental)"}),e("br",{}),e("br",{}),"Lithent Template Strings는 현재"," ",e("strong",{children:"실험적(Experimental) 단계"}),"입니다:",e("br",{}),e("br",{}),"• ",e("strong",{children:"프로덕션 테스트 미완료:"})," 실제 운영 환경에서 충분히 검증되지 않았습니다",e("br",{}),"• ",e("strong",{children:"API 변경 가능:"})," 향후 문법이나 동작이 변경될 수 있습니다",e("br",{}),"• ",e("strong",{children:"에디터 지원 부족:"})," VSCode 등 에디터에서 문법 하이라이팅, 자동완성, 린트 플러그인이 아직 제공되지 않습니다",e("br",{}),e("br",{}),"프로덕션 프로젝트에서는"," ",e("a",{href:"/guide/jsx-manual",onClick:t=>{t.preventDefault(),y("/guide/jsx-manual")},class:"text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300",children:"JSX"}),","," ",e("a",{href:"/guide/ftags",onClick:t=>{t.preventDefault(),y("/guide/ftags")},class:"text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300",children:"FTags"}),", 또는"," ",e("a",{href:"/guide/htm-tags",onClick:t=>{t.preventDefault(),y("/guide/htm-tags")},class:"text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300",children:"HTM Tags"}),"를 권장합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"개요"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent Template Strings는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"JSX-like 문법을 순수 JavaScript h() 호출로 변환"}),"하는 템플릿 시스템입니다.",e("br",{}),e("br",{}),"JSX와 유사한 직관적인 문법을 제공하면서도 JSX transform에 의존하지 않으며, 강력한 지시자(directives)를 통해 조건부 렌더링과 리스트 렌더링을 선언적으로 작성할 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"왜 Template Strings인가?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"JSX는 강력하지만, 태그와 태그 사이에서 조건문이나 반복문을 처리할 때 JavaScript 문법이 난발되어 가독성이 떨어지는 문제가 있습니다:"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"❌ JSX의 가독성 문제"}),e(l,{language:"tsx",code:`// 조건문과 반복문이 중첩되면 복잡해짐
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
</div>`})]}),e("div",{children:[e("h4",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"✅ Template의 명확한 의도"}),e(l,{language:"typescript",code:`// 지시자로 의도가 명확함
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
</div>`})]})]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed",children:[e("span",{class:"font-medium text-gray-900 dark:text-white",children:"💡 핵심 개선:"}),e("br",{}),e("br",{}),"Template Strings는"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"l-if"}),","," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"l-for"})," ","같은 지시자를 통해 조건부 렌더링과 리스트 렌더링을"," ",e("strong",{children:"선언적이고 가독성 높게"})," 작성할 수 있습니다. 중첩된 JavaScript 표현식과 삼항 연산자 대신, HTML 속성처럼 자연스럽게 의도를 표현할 수 있습니다."]})}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"주요 특징"}),e("ul",{class:"space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"JSX-like 문법:"})," ","HTML과 유사한 직관적인 마크업"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"강력한 지시자:"})," ","l-if, l-for 등 선언적 제어 구조"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"소스맵 지원:"})," ","디버깅 시 원본 템플릿 위치 추적"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"✓"}),e("div",{children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"Vite 통합:"})," ","HMR 지원 및 빠른 개발 환경"]})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"설치 및 설정"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"lithentVite 플러그인 설치"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Template Strings 기능은"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@lithent/lithent-vite"})," ","플러그인의 template 옵션을 통해 사용합니다:"]}),e(l,{language:"bash",code:`npm install -D @lithent/lithent-vite
# or
pnpm add -D @lithent/lithent-vite`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Vite 설정"}),e(l,{language:"typescript",code:`// vite.config.ts
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6 mt-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"template"})," ","옵션을 설정하면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:".ltsx"})," ","및"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:".ljsx"})," ","파일이 자동으로 변환되며, HMR(Hot Module Replacement) 기능도 함께 활성화됩니다."]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 간편한 설정:"}),e("br",{}),e("br",{}),"템플릿 기능만 필요하고 기본 설정을 사용한다면"," ",e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"template: true"}),"로 간단히 활성화할 수 있습니다:",e("br",{}),e("br",{}),e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"lithentVitePlugin({ template: true })"})]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"HMR 없이 템플릿만 사용 (권장하지 않음)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["특별한 이유로"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"@lithent/lithent-template-vite"}),"를 직접 사용해야 한다면:"]}),e(l,{language:"typescript",code:`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      extensions: ['.ltsx', '.ljsx'],
    }),
  ],
});`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 권장:"})," 대부분의 경우"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"@lithent/lithent-vite"}),"의 template 옵션을 사용하는 것이 더 편리합니다. HMR 기능도 함께 제공되며, 설정도 더 간단합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"템플릿 문법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 요소"}),e(l,{language:"typescript",code:`// src/App.ltsx
import { render } from 'lithent';

const App = () => (
  <div class="container">
    <h1>Hello Lithent</h1>
    <p>This is a template string</p>
  </div>
);

render(<App />, document.getElementById('root'));`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"텍스트 보간"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["중괄호"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"{}"}),"를 사용하여 JavaScript 표현식을 삽입할 수 있습니다:"]}),e(l,{language:"typescript",code:`const Greeting = () => {
  const name = 'John';
  const count = 5;

  return (
    <div>
      <p>Hello {name}!</p>
      <p>You have {count} notifications</p>
      <p>Total: {count + 10}</p>
    </div>
  );
};`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"동적 속성"}),e(l,{language:"typescript",code:`const DynamicProps = () => {
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
};`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"Fragment"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"여러 요소를 wrapper 없이 그룹화할 수 있습니다:"}),e(l,{language:"typescript",code:`const MultipleElements = () => (
  <>
    <h1>Title</h1>
    <p>Description</p>
    <div>Content</div>
  </>
);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"지시자 (Directives)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent 템플릿은"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"l-"})," ","접두사를 사용하는 강력한 지시자를 제공합니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"l-if / l-else-if / l-else"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"조건부 렌더링을 선언적으로 작성할 수 있습니다:"}),e(l,{language:"typescript",code:`const ConditionalRendering = () => {
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
};`}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 규칙:"}),e("br",{}),e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"l-else-if"}),"와"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"l-else"}),"는 반드시"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"l-if"}),"나"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"l-else-if"})," ","바로 다음에 와야 합니다",e("br",{}),"• 표현식은 항상"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"{}"})," ","안에 작성합니다"]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"l-for"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"리스트를 반복 렌더링합니다:"}),e(l,{language:"typescript",code:`const TodoList = () => {
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
};`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"인덱스 사용"}),e(l,{language:"typescript",code:`const NumberedList = () => {
  const items = ['Apple', 'Banana', 'Cherry'];

  return (
    <ul>
      {/* (item, index) in list */}
      <li l-for={(item, index) in items}>
        {index + 1}. {item}
      </li>
    </ul>
  );
};`}),e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6",children:"복잡한 예제"}),e(l,{language:"typescript",code:`const TodoApp = () => {
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
};`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"💡 l-for 문법:"}),e("br",{}),e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"l-for={item in list}"})," ","- 각 요소만",e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm",children:"l-for={(item, index) in list}"})," ","- 요소와 인덱스",e("br",{}),"• list는 배열, 객체 등 반복 가능한 모든 값"]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"컴포넌트 사용"}),e(l,{language:"typescript",code:`// Button.ltsx
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
};`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실전 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"완전한 Todo 앱"}),e(l,{language:"typescript",code:`// TodoApp.ltsx
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"사용자 프로필 카드"}),e(l,{language:"typescript",code:`// ProfileCard.ltsx
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"컴파일 결과"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"템플릿이 어떻게 변환되는지 확인해보세요:"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",children:[e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"템플릿 (입력)"}),e(l,{language:"typescript",code:`<div class="todo-list">
  <h2>Todos ({todos.length})</h2>
  <ul>
    <li l-for={(todo, index) in todos}>
      <span>{index + 1}.</span>
      <span>{todo.text}</span>
    </li>
  </ul>
</div>`})]}),e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"JavaScript (출력)"}),e(l,{language:"javascript",code:`h('div', { class: 'todo-list' },
  h('h2', null, 'Todos (', todos.length, ')'),
  h('ul', null,
    (todos).map((todo, index) =>
      h('li', null,
        h('span', null, index + 1, '.'),
        h('span', null, todo.text)
      )
    )
  )
)`})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"템플릿 vs JSX vs 기타"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border-collapse border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"특징"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"Template Strings"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"JSX"}),e("th",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white",children:"HTM Tags"})]})}),e("tbody",{children:[e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"문법"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JSX-like"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JSX"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Tagged Template"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"지시자"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"l-if, l-for 지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JavaScript 표현식"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"JavaScript 표현식"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"빌드 설정"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Vite 플러그인"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"Babel/TypeScript"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"설정 불필요"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"파일 확장자"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:".ltsx, .ljsx"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:".tsx, .jsx"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:".ts, .js"})]}),e("tr",{children:[e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white",children:"소스맵"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"완벽 지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300",children:"완벽 지원"}),e("td",{class:"border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300",children:"N/A (런타임)"})]})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 템플릿을 사용할까?"}),e("div",{class:"grid gap-6 mb-6",children:[e("div",{class:"border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-green-900 dark:text-green-100 mb-2",children:"✅ 템플릿이 적합한 경우"}),e("ul",{class:"space-y-2 text-sm md:text-base text-green-800 dark:text-green-200",children:[e("li",{children:"• 선언적 조건부 렌더링이 많은 경우 (l-if)"}),e("li",{children:"• 복잡한 리스트 렌더링 (l-for)"}),e("li",{children:"• HTML-like 문법을 선호하는 경우"}),e("li",{children:"• JSX transform 없이 JSX 스타일을 원할 때"}),e("li",{children:"• 소스맵 지원이 중요한 프로젝트"})]})]}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"ℹ️ JSX가 더 나은 경우"}),e("ul",{class:"space-y-2 text-sm md:text-base text-blue-800 dark:text-blue-200",children:[e("li",{children:"• 이미 JSX 환경이 구축된 프로젝트"}),e("li",{children:"• React에서 마이그레이션하는 경우"}),e("li",{children:"• 팀이 JSX에 익숙한 경우"}),e("li",{children:"• 복잡한 JavaScript 로직이 많은 경우"})]})]})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"고급 옵션"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"커스텀 확장자"}),e(l,{language:"typescript",code:`// vite.config.ts
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
});`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8",children:"필터 패턴"}),e(l,{language:"typescript",code:`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      // 특정 파일만 처리
      include: [/\\.ltsx$/, /src\\/templates\\/.*\\.ts$/],
    }),
  ],
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/examples/1",onClick:t=>{t.preventDefault(),y("/examples/1")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"실전 예제 보기 →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["20개 이상의 실용적인 예제를 통해 Lithent의 다양한 기능을 경험해보세요.",e("br",{}),"computed, store, portal 등의 실제 활용 방법을 배울 수 있습니다."]})]}),e("a",{href:"/",onClick:t=>{t.preventDefault(),y("/")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"← 홈으로 돌아가기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"Lithent의 전체 문서 구조를 확인하고 원하는 주제를 찾아보세요."})]})]})]}),cd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Stateless Components"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["상태가 전혀 필요 없는 UI라면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"mount"}),"나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lmount"}),"를 쓰지 않고도 간단한 함수로 컴포넌트를 정의할 수 있습니다. 이렇게 하면 번들 크기를 줄이고 의존성을 최소화할 수 있습니다. Lithent에서는 React와 달리"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"children"}),"이 props 안이 아니라 두 번째 인자로 전달된다는 점만 주의하면 됩니다."]}),e(l,{language:"tsx",code:`// 단순 표시용 컴포넌트는 함수만으로도 충분합니다.
export const Badge = ({ label }: { label: string }) => (
  <span>[{label}]</span>
);

// Lithent에서는 children이 props가 아니라 두 번째 인자로 들어옵니다.
// (props, children) 순서를 지켜 주세요.
export const Card = (
  { title }: { title: string },
  children: JSX.Element
) => (
  <div>
    <Badge label="Info" /> {title}
    {children}
  </div>
);

// 필요한 경우에만 mount/lmount를 사용해 상태를 추가
// const StatefulCard = mount(renew => { ... });`}),e("div",{class:"border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"Tip:"})," 렌더링마다 새 함수를 만들지 않도록 바깥에서 정의한 순수 함수 컴포넌트를 재사용하면 성능에도 유리합니다."]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-8",children:["상태가 필요한 순간이 오면 언제든지"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"mount"}),"나",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"lmount"}),"를 도입하면 됩니다. 작은 UI 조각은 가능한 한 가볍게 유지하세요."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/state",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state"),window.dispatchEvent(new PopStateEvent("popstate"))},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Helper: State →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"이제 상태가 있는 컴포넌트를 작성해보고 싶다면 helper의 state 훅을 확인해 보세요."})]})})]}),md=v(t=>{const r=P(1,t),a=mn(()=>r.v*95),n=()=>{r.v+=1},o=()=>{r.v=Math.max(0,r.v-1)};return()=>e("div",{class:"flex flex-col gap-3",children:[e("div",{class:"flex items-center gap-2",children:[e("button",{type:"button",onClick:o,class:"px-2 py-1 rounded border border-gray-300 text-sm disabled:opacity-40",disabled:r.v===0,children:"-1"}),e("span",{class:"text-sm text-gray-800 dark:text-gray-200",children:["🍌 스무디 ",r.v,"잔"]}),e("button",{type:"button",onClick:n,class:"px-2 py-1 rounded bg-[#42b883] text-white text-sm",children:"+1"})]}),e("div",{class:"text-sm text-gray-800 dark:text-gray-200",children:["예상 칼로리: ",e("strong",{class:"text-[#42b883]",children:[a.v," kcal"]})]})]})}),xd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Example 1 - computed로 바나나 칼로리 계산"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"computed"})," ","훅을 사용해 바나나 스무디 잔 수에서 예상 칼로리를 계산하는 아주 작은 예제입니다. 수량 state가 바뀔 때마다 파생 값인 칼로리가 자동으로 다시 계산됩니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

// 1잔당 95 kcal 기준 바나나 스무디 칼로리 계산기
export const BananaSmoothie = mount(renew => {
  const cups = state(1, renew);
  const calories = computed(() => cups.v * 95);

  const inc = () => (cups.v += 1);
  const dec = () => (cups.v = Math.max(0, cups.v - 1));

  return () => (
    <div>
      <p>🍌 스무디 {cups.v}잔</p>
      <p>예상 칼로리: {calories.v} kcal</p>
      <button onClick={dec} disabled={cups.v === 0}>-1</button>
      <button onClick={inc}>+1</button>
    </div>
  );
});`}),e("div",{class:"not-prose mt-6 mb-10",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(md,{})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/computed",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/computed"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Computed 가이드"})," ","- computed 훅의 전체 동작과 API를 자세히 설명합니다."]}),e("li",{children:[e("a",{href:"/guide/state",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"State 가이드"})," ","- 기본 state 훅과 .v 패턴에 대해 소개합니다."]})]})]}),gd=hn({text:"여러 컴포넌트가 이 텍스트를 공유합니다"}),tr=v(t=>{const r=gd(t,n=>[n.text]),a=n=>{r.text=n.target.value};return()=>e("textarea",{onInput:a,value:r.text,class:"w-full h-32 px-4 py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none",placeholder:"여기에 텍스트를 입력하세요..."})}),hd=v(()=>{const t=V(null),r=V(null);return te(()=>{t.value&&ce(e(tr,{}),t.value),r.value&&ce(e(tr,{}),r.value)}),()=>e("div",{class:"space-y-6",children:[e("div",{class:"bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4",children:e("p",{class:"text-sm md:text-base text-blue-800 dark:text-blue-200",children:"💡 두 개의 textarea가 동일한 store를 공유합니다. 한 쪽에서 텍스트를 수정하면 다른 쪽도 자동으로 업데이트됩니다."})}),e("div",{class:"grid md:grid-cols-2 gap-6",children:[e("div",{class:"space-y-2",children:[e("div",{class:"flex items-center gap-2",children:[e("div",{class:"w-2 h-2 bg-blue-500 rounded-full"}),e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300",children:"Writer 컴포넌트 #1"})]}),e("div",{ref:t})]}),e("div",{class:"space-y-2",children:[e("div",{class:"flex items-center gap-2",children:[e("div",{class:"w-2 h-2 bg-green-500 rounded-full"}),e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300",children:"Writer 컴포넌트 #2"})]}),e("div",{ref:r})]})]}),e("div",{class:"bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"📌 핵심 개념"}),e("ul",{class:"space-y-1 text-sm text-gray-600 dark:text-gray-400",children:[e("li",{children:["•"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"store()"}),"로 공유 상태 생성"]}),e("li",{children:["• 각 컴포넌트에서"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"assignSharedStore(renew)"}),"로 구독"]}),e("li",{children:"• 한 곳에서 값 변경 시 모든 구독자가 자동 업데이트"})]})]})]})}),ud=`import { mount, render } from 'lithent';
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
`,bd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Store Helper"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"store"}),"훅으로 여러 컴포넌트가 값을 공유하는 방법을 보여주는 예제입니다. 아래에서 코드와 라이브 데모를 함께 확인하세요."]}),e(l,{language:"typescript",code:ud}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(hd,{})]})}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/store",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/store"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Store 가이드"})," ","- 전역 상태를 store로 공유하는 기본 개념과 API를 자세히 다룹니다."]}),e("li",{children:[e("a",{href:"/guide/state",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"State 가이드"})," ","- textarea 값 변경을 추적하는 데 사용된 state 헬퍼의 동작을 복습할 수 있습니다."]})]})]})]}),dt=v(t=>{const r=P({x:0,y:0},t),a=V(null),n=o=>{if(a.value){const s=a.value.getBoundingClientRect();r.v={x:o.clientX-s.left,y:o.clientY-s.top}}};return({render:o})=>e("div",{ref:a,onMouseMove:n,class:"relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-crosshair",children:o(r.v)})}),pd=({emoji:t,pos:r})=>e("div",{class:"absolute text-4xl pointer-events-none transition-transform duration-100",style:{left:`${r.x}px`,top:`${r.y}px`,transform:"translate(-50%, -50%)"},children:t}),yd=v(t=>({pos:r})=>e("div",{class:"absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700",children:e("div",{class:"text-sm font-mono space-y-1",children:[e("div",{class:"text-gray-600 dark:text-gray-400",children:["X:"," ",e("span",{class:"font-bold text-blue-600 dark:text-blue-400",children:Math.round(r.x)})]}),e("div",{class:"text-gray-600 dark:text-gray-400",children:["Y:"," ",e("span",{class:"font-bold text-purple-600 dark:text-purple-400",children:Math.round(r.y)})]})]})})),kd=v(t=>({pos:r})=>{const a=(r.x+r.y)%360;return e("div",{class:"absolute inset-0 opacity-20 transition-all duration-300",style:{background:`radial-gradient(circle at ${r.x}px ${r.y}px, hsl(${a}, 70%, 60%), transparent 50%)`}})}),fd=v(t=>{const r=P("colorful",t),a=[{id:"emoji",label:"🐱 이모지 팔로워",color:"blue"},{id:"coords",label:"📍 좌표 표시",color:"green"},{id:"colorful",label:"🎨 컬러풀 배경",color:"purple"}];return()=>e("div",{class:"space-y-6",children:[e("div",{class:"bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4",children:e("p",{class:"text-sm md:text-base text-orange-800 dark:text-orange-200",children:["💡 ",e("strong",{children:"Render Prop 패턴"}),": 컴포넌트가 렌더링 로직을 함수로 받아서 실행합니다. 이 예제에서 MouseTracker는 마우스 위치를 추적하고, render prop으로 받은 함수에 데이터를 전달합니다."]})}),e("div",{class:"flex gap-2 flex-wrap",children:a.map(n=>e("button",{onClick:()=>r.v=n.id,class:`px-4 py-2 rounded-lg text-sm font-medium transition-all ${r.v===n.id?`bg-${n.color}-600 text-white shadow-lg scale-105`:"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`,children:n.label}))}),r.v==="emoji"&&e(dt,{render:n=>e(L,{children:[e("div",{class:"absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm pointer-events-none",children:"마우스를 움직여보세요!"}),e(pd,{emoji:"🐱",pos:n})]})}),r.v==="coords"&&e(dt,{render:n=>e(L,{children:[e("div",{class:"absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm pointer-events-none",children:"마우스를 움직여 좌표를 확인하세요"}),e(yd,{pos:n}),e("div",{class:"absolute w-2 h-2 bg-red-500 rounded-full pointer-events-none",style:{left:`${n.x}px`,top:`${n.y}px`,transform:"translate(-50%, -50%)"}})]})}),r.v==="colorful"&&e(dt,{render:n=>e(L,{children:[e(kd,{pos:n}),e("div",{class:"absolute inset-0 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm pointer-events-none z-10",children:"마우스를 움직여 색상을 변경하세요"})]})}),e("div",{class:"bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"📌 핵심 개념"}),e("ul",{class:"space-y-1 text-sm text-gray-600 dark:text-gray-400",children:[e("li",{children:["•"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"render"})," ","prop을 함수로 받아서 데이터 전달"]}),e("li",{children:"• MouseTracker가 마우스 위치 추적 로직을 캡슐화"}),e("li",{children:"• 렌더링 로직은 외부에서 자유롭게 구현 가능"}),e("li",{children:"• 재사용성과 유연성이 뛰어난 컴포넌트 디자인 패턴"})]})]})]})}),vd=`import { mount, ref } from 'lithent';
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
`,wd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Render Props (Mouse tracker)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["마우스 위치를 추적하는 로직을 ",e("strong",{children:"render prop"}),"으로 노출해 원하는 뷰를 그릴 수 있는 예제입니다. 기본 데모는 컬러풀 배경이며, 이모지 팔로워·좌표 표시 뷰로 전환할 수도 있습니다."]}),e(l,{language:"typescript",code:vd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(fd,{})]})}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/children",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/children"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Children 가이드"})," ","- render prop처럼 함수 형태의 children을 다루는 패턴과 차이를 정리합니다."]}),e("li",{children:[e("a",{href:"/guide/state",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"State 가이드"})," ","- 마우스 위치를 추적하는 state 업데이트 흐름을 다시 한 번 살펴볼 수 있습니다."]})]})]})]}),Cd=`import { mount, render, ref } from 'lithent';
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
`,Md=v((t,r)=>{const a=P(0,t),n=()=>{a.v+=1};let o=!1;const s=i=>{requestAnimationFrame(()=>{requestAnimationFrame(()=>{const c=i.parentElement;c&&(c.scrollTop=c.scrollHeight)})})},d=i=>{i.innerHTML=i.innerHTML.replace(/text-green-400/g,"text-gray-500").replace(/text-orange-400/g,"text-gray-500")};return xn(()=>{const i=r.logEl.value;o||d(i),o=!1,i.innerHTML+='<span class="text-green-400">INJECT</span><br>',i.innerHTML+='<div class="my-2 border-t border-gray-500 opacity-30"></div>',s(i)},()=>{const i=r.logEl.value;d(i),o=!0,setTimeout(()=>{o=!1},0),i.innerHTML+='<span class="text-orange-400">CLEAN_UP</span><br>',i.innerHTML+='<div class="my-2 border-t border-gray-500 opacity-30"></div>',s(i)},()=>[a.v]),()=>e("div",{class:"flex items-center gap-3",children:[e("button",{onClick:n,type:"button",class:"px-3 py-2 rounded-md text-sm font-medium text-white bg-[#42b883] hover:bg-[#36996b] transition-colors",children:"increase"}),e("span",{class:"text-sm text-gray-800 dark:text-gray-200",children:["count: ",e("strong",{class:"text-[#42b883]",children:a.v})]})]})}),Sd=v(t=>{let r=V(null),a=!0;const n=()=>{a=!a,t()};return()=>e("div",{class:"flex flex-col gap-3",children:[e("div",{class:"rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-3 h-40 overflow-y-auto text-xs font-mono",children:e("div",{ref:r,class:"text-gray-700 dark:text-gray-300"})}),e("div",{class:"flex items-center gap-3 min-h-[70px]",children:[e("button",{onClick:n,type:"button",class:"px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:a?"Unmount Child":"Mount Child"}),a?e(Md,{logEl:r}):null]}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"count 변경 시 CLEAN_UP → INJECT가 실행되고, 컴포넌트 unmount 시 CLEAN_UP만 실행됩니다."})]})}),Td=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Effect Helper"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"effect"}),"훅으로 컴포넌트 생명주기에 따른 사이드 이펙트를 관리하는 예제입니다. 첫 번째 인자는 mount/update 후 실행되는 액션, 두 번째 인자는 unmount/update 전 실행되는 cleanup 함수입니다."]}),e(l,{language:"typescript",code:Cd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Sd,{})]})}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/effect",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/effect"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Effect 가이드"})," ","- effect 헬퍼의 forward/backward/dependencies 설계와 생명주기 연동 방식을 자세히 설명합니다."]}),e("li",{children:[e("a",{href:"/guide/mount-hooks",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/mount-hooks"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Mount Hooks 가이드"})," ","- effect의 내부 구현에 사용되는 mountCallback/mountReadyCallback 흐름을 함께 이해할 수 있습니다."]})]})]})]}),Be=v((t,r)=>{const a=o=>{switch(o){case"like":return"❤️";case"comment":return"💬";case"follow":return"👤";case"system":return"🔔";default:return"📌"}},n=o=>{switch(o){case"like":return"bg-pink-500";case"comment":return"bg-blue-500";case"follow":return"bg-purple-500";case"system":return"bg-gray-500";default:return"bg-gray-400"}};return()=>{const o=r.notification;return e("div",{class:`flex items-start gap-3 p-3 rounded-lg transition-all ${o.read?"bg-gray-50 dark:bg-gray-800/50":"bg-white dark:bg-gray-800 border border-[#42b883]/20"}`,children:[e("div",{class:`flex-shrink-0 w-10 h-10 rounded-full ${n(o.type)} flex items-center justify-center text-lg`,children:a(o.type)}),e("div",{class:"flex-1 min-w-0",children:[e("p",{class:"text-sm text-gray-900 dark:text-gray-100",children:[o.user&&e("strong",{children:o.user})," ",o.content]}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400 mt-1",children:o.time})]}),e("button",{onClick:r.onToggleRead,class:`flex-shrink-0 w-3 h-3 rounded-full border-2 transition-colors ${o.read?"border-gray-300 dark:border-gray-600":"border-[#42b883] bg-[#42b883]"}`,title:o.read?"Mark as unread":"Mark as read"})]})}}),Ed=v(t=>{const r=P([{id:1,type:"like",user:"Sarah",content:"liked your post",time:"2 min ago",read:!1},{id:2,type:"comment",user:"John",content:'commented: "Great work!"',time:"5 min ago",read:!1},{id:3,type:"like",user:"Mike",content:"liked your comment",time:"10 min ago",read:!0},{id:4,type:"follow",user:"Emma",content:"started following you",time:"15 min ago",read:!1},{id:5,type:"comment",user:"Alex",content:"replied to your comment",time:"20 min ago",read:!0},{id:6,type:"system",content:"Your profile was viewed 25 times this week",time:"1 hour ago",read:!0},{id:7,type:"follow",user:"Lisa",content:"started following you",time:"2 hours ago",read:!0}],t),a=P({like:!0,comment:!0,follow:!0,system:!0},t),n=d=>{a.v={...a.v,[d]:!a.v[d]}},o=d=>{r.v=r.v.map(i=>i.id===d?{...i,read:!i.read}:i)},s=()=>{r.v=r.v.map(d=>({...d,read:!0}))};return()=>{const d=r.v.filter(x=>x.type==="like"),i=r.v.filter(x=>x.type==="comment"),c=r.v.filter(x=>x.type==="follow"),h=r.v.filter(x=>x.type==="system"),m=r.v.filter(x=>!x.read).length;return e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"flex items-center justify-between mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white",children:["Notifications",m>0&&e("span",{class:"ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-[#42b883] text-white",children:m})]}),m>0&&e("button",{onClick:s,class:"text-xs text-[#42b883] hover:text-[#36996b] font-medium transition-colors",children:"Mark all as read"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>n("like"),class:`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${a.v.like?"bg-pink-500 text-white":"bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`,children:["❤️ Likes (",d.length,")"]}),e("button",{onClick:()=>n("comment"),class:`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${a.v.comment?"bg-blue-500 text-white":"bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`,children:["💬 Comments (",i.length,")"]}),e("button",{onClick:()=>n("follow"),class:`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${a.v.follow?"bg-purple-500 text-white":"bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`,children:["👤 Follows (",c.length,")"]}),e("button",{onClick:()=>n("system"),class:`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${a.v.system?"bg-gray-500 text-white":"bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`,children:["🔔 System (",h.length,")"]})]}),e("div",{class:"space-y-2 max-h-96 overflow-y-auto",children:[e(L,{children:[a.v.like&&e(L,{children:d.map(x=>e(Be,{notification:x,onToggleRead:()=>o(x.id)}))}),a.v.comment&&e(L,{children:i.map(x=>e(Be,{notification:x,onToggleRead:()=>o(x.id)}))}),e(L,{children:[a.v.follow&&e(L,{children:c.map(x=>e(Be,{notification:x,onToggleRead:()=>o(x.id)}))}),a.v.system&&e(L,{children:h.map(x=>e(Be,{notification:x,onToggleRead:()=>o(x.id)}))})]})]}),!a.v.like&&!a.v.comment&&!a.v.follow&&!a.v.system&&e("div",{class:"text-center py-8 text-gray-500 dark:text-gray-400",children:e("p",{class:"text-sm",children:"No filters selected"})})]}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400 mt-4",children:"이 예제는 중첩된 Fragment를 사용하여 알림 타입별로 그룹화합니다. 필터를 토글하면 Fragment 단위로 DOM이 추가/제거됩니다."})]})}}),Dd=`import { mount, Fragment } from 'lithent';
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
`,Pd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Nested Fragments (Notification Center)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["중첩된"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"Fragment"}),"를 사용하여 알림 센터를 구현한 예제입니다. 각 알림 타입(좋아요, 댓글, 팔로우, 시스템)을 Fragment로 그룹화하고, 필터 버튼으로 특정 타입의 알림들을 토글할 수 있습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent의 가상 돔 엔진이 복잡하게 중첩된 Fragment 구조를 정확하게 처리하고 효율적으로 업데이트하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"필터를 변경하면 Fragment 단위로 DOM이 추가/제거되며, 여러 단계로 중첩된 구조에서도 올바르게 diff 알고리즘이 작동합니다."}),e(l,{language:"typescript",code:Dd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Ed,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Fragment 중첩 구조의 장점"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"논리적 그룹화"}),": 관련된 요소들을 Fragment로 묶어 구조를 명확하게 표현"]}),e("li",{children:[e("strong",{children:"효율적인 업데이트"}),": 필터 변경 시 해당 Fragment 그룹만 추가/제거"]}),e("li",{children:[e("strong",{children:"깨끗한 DOM"}),": Fragment는 실제 DOM 노드를 생성하지 않아 불필요한 래퍼 요소가 없음"]}),e("li",{children:[e("strong",{children:"유연한 구조"}),": 여러 단계로 중첩하여 복잡한 조건부 렌더링 구현 가능"]})]})]}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("a",{href:"/guide/children",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/children"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Children 가이드"})," ","- Fragment와 children이 어떻게 렌더 트리를 구성하는지 기본 개념을 정리합니다."]}),e("li",{children:[e("a",{href:"/guide/updater",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/updater"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Updater 가이드"})," ","- 필터 변경 시 Fragment 그룹이 어떻게 갱신되는지, 업데이트 흐름 관점에서 이해할 수 있습니다."]})]})]})]}),Id=v((t,r)=>{const a=n=>{switch(n){case"pop":return"🎵";case"rock":return"🎸";case"jazz":return"🎷";case"hiphop":return"🎤";default:return"🎵"}};return()=>{const n=r.song;return e("div",{class:`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${n.color} bg-white dark:bg-gray-800 hover:shadow-md`,children:[e("div",{class:"text-3xl",children:a(n.genre)}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2",children:[e("h4",{class:"text-sm font-semibold text-gray-900 dark:text-gray-100 truncate",children:n.title}),e("span",{class:"text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",children:["ID: ",n.id]})]}),e("p",{class:"text-xs text-gray-600 dark:text-gray-400",children:[n.artist," • ",n.duration]})]}),e("div",{class:"flex items-center gap-2",children:[e("div",{class:"text-center px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30",children:[e("div",{class:"text-xs text-purple-600 dark:text-purple-400 font-semibold",children:n.plays}),e("div",{class:"text-xs text-purple-500 dark:text-purple-500",children:"plays"})]}),e("button",{onClick:r.onPlay,class:"w-8 h-8 flex items-center justify-center rounded-full bg-[#42b883] hover:bg-[#36996b] text-white transition-colors",title:"Play",children:"▶"}),e("button",{onClick:r.onRemove,class:"w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors text-xs",title:"Remove",children:"✕"})]})]})}}),Od=v(t=>{const r=P([{id:1,title:"Summer Vibes",artist:"The Waves",genre:"pop",duration:"3:24",plays:0,color:"border-pink-300"},{id:2,title:"Electric Dreams",artist:"Neon Knights",genre:"rock",duration:"4:15",plays:0,color:"border-red-300"},{id:3,title:"Midnight Jazz",artist:"Smooth Trio",genre:"jazz",duration:"5:02",plays:0,color:"border-blue-300"},{id:4,title:"Street Flow",artist:"MC Rhythm",genre:"hiphop",duration:"3:45",plays:0,color:"border-purple-300"},{id:5,title:"Ocean Waves",artist:"Chill Beats",genre:"pop",duration:"3:58",plays:0,color:"border-teal-300"}],t);let a=6;const n=m=>{r.v=r.v.map(x=>x.id===m?{...x,plays:x.plays+1}:x)},o=m=>{r.v=r.v.filter(x=>x.id!==m)},s=()=>{const m=[...r.v];for(let x=m.length-1;x>0;x--){const k=Math.floor(Math.random()*(x+1));[m[x],m[k]]=[m[k],m[x]]}r.v=m},d=()=>{r.v=[...r.v].sort((m,x)=>m.title.localeCompare(x.title))},i=()=>{r.v=[...r.v].sort((m,x)=>x.plays-m.plays)},c=()=>{const m=["Starlight","Thunder Road","Golden Hour","Neon Lights","Blue Moon"],x=["Dream Band","Solo Star","The Legends","New Wave","Classic Crew"],k=["pop","rock","jazz","hiphop"],g=["border-pink-300","border-red-300","border-blue-300","border-purple-300","border-teal-300","border-orange-300","border-green-300"],D={id:a++,title:m[Math.floor(Math.random()*m.length)],artist:x[Math.floor(Math.random()*x.length)],genre:k[Math.floor(Math.random()*k.length)],duration:`${Math.floor(Math.random()*3+2)}:${Math.floor(Math.random()*60).toString().padStart(2,"0")}`,plays:0,color:g[Math.floor(Math.random()*g.length)]};r.v=[...r.v,D]},h=()=>{r.v=[...r.v].reverse()};return()=>e("div",{class:"w-full max-w-3xl mx-auto",children:[e("div",{class:"flex items-center justify-between mb-4",children:e("div",{children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white",children:"🎧 My Playlist"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:[r.v.length," songs • Total plays:"," ",r.v.reduce((m,x)=>m+x.plays,0)]})]})}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:c,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#42b883] hover:bg-[#36996b] transition-colors",children:"➕ Add Song"}),e("button",{onClick:s,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",children:"🔀 Shuffle"}),e("button",{onClick:h,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:"🔄 Reverse"}),e("button",{onClick:d,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"🔤 Sort by Title"}),e("button",{onClick:i,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"📊 Sort by Plays"})]}),e("div",{class:"space-y-2 max-h-96 overflow-y-auto",children:r.v.length===0?e("div",{class:"text-center py-8 text-gray-500 dark:text-gray-400",children:[e("p",{class:"text-sm",children:"Your playlist is empty"}),e("p",{class:"text-xs mt-1",children:'Click "Add Song" to get started'})]}):r.v.map(m=>e(Id,{song:m,onPlay:()=>n(m.id),onRemove:()=>o(m.id)},m.id))}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"Key 동작 확인:"})," 노래를 재생하여 plays 카운터를 증가시킨 후 Shuffle이나 Sort를 해보세요. 각 노래의 ID와 plays 카운터가 유지되는 것을 확인할 수 있습니다. 이는 key prop 덕분에 Lithent가 동일한 요소를 정확하게 추적하고 있기 때문입니다."]})})]})}),Ld=`import { mount } from 'lithent';
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
`,Rd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Key-based List Updates (Playlist Manager)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["리스트를 렌더링할 때"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"key"})," ","prop을 사용하여 각 아이템을 고유하게 식별하는 음악 플레이리스트 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent의 가상 돔 엔진이 key를 기반으로 리스트 아이템을 정확하게 추적하고, 순서가 변경되거나 아이템이 추가/삭제될 때 효율적으로 DOM을 업데이트하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"각 노래의 재생 횟수(plays)를 증가시킨 후 Shuffle이나 Sort를 실행해보세요. key 덕분에 각 노래의 ID와 내부 상태가 유지되는 것을 확인할 수 있습니다."}),e(l,{language:"typescript",code:Ld}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Od,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Key 사용의 중요성"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"요소 식별"}),": key를 통해 Lithent는 리스트의 각 아이템을 고유하게 식별"]}),e("li",{children:[e("strong",{children:"효율적인 업데이트"}),": 순서 변경 시 DOM 노드를 재사용하여 불필요한 재생성 방지"]}),e("li",{children:[e("strong",{children:"상태 보존"}),": 아이템의 위치가 바뀌어도 내부 상태(plays 카운터)가 유지됨"]}),e("li",{children:[e("strong",{children:"정확한 diff"}),": key 기반으로 어떤 아이템이 추가/삭제/이동되었는지 정확히 판단"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"여러 노래의 재생 버튼(▶)을 클릭하여 plays 카운터를 증가시킵니다"}),e("li",{children:"🔀 Shuffle 버튼을 클릭하여 순서를 섞어봅니다"}),e("li",{children:"각 노래의 ID와 plays 카운터가 그대로 유지되는지 확인합니다"}),e("li",{children:"📊 Sort by Plays로 정렬해도 상태가 유지되는 것을 확인합니다"}),e("li",{children:"➕ Add Song으로 새 노래를 추가하고 ✕ 버튼으로 노래를 삭제해봅니다"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",children:[e("h3",{class:"text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2",children:"⚠️ Key가 없다면?"}),e("p",{class:"text-sm text-yellow-700 dark:text-yellow-300",children:"key를 사용하지 않으면 Lithent는 리스트 아이템을 인덱스 기반으로 매칭합니다. 이 경우 순서가 변경되면 잘못된 DOM 노드에 데이터가 적용되어 plays 카운터가 다른 노래로 이동하거나, 불필요한 DOM 재생성이 발생할 수 있습니다."})]}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("a",{href:"/guide/updater",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/updater"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Updater 가이드"})," ","- 리스트 재정렬 시 Updater가 어떻게 diff를 수행하고 DOM을 최소 변경하는지 설명합니다."]}),e("li",{children:[e("a",{href:"/guide/state",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"State 가이드"})," ","- 배열 상태를 불변성 있게 갱신하는 패턴(새 배열 생성 등)을 다시 확인할 수 있습니다."]})]})]})]}),Ad=t=>{let r=t;return r=r.replace(/^### (.*$)/gim,'<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>'),r=r.replace(/^## (.*$)/gim,'<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h2>'),r=r.replace(/^# (.*$)/gim,'<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">$1</h1>'),r=r.replace(/^\* (.*$)/gim,'<li class="ml-4 text-gray-700 dark:text-gray-300">$1</li>'),r=r.replace(/(<li class="ml-4.*<\/li>)/s,'<ul class="list-disc list-inside mb-2">$1</ul>'),r=r.replace(/^\d+\. (.*$)/gim,'<li class="ml-4 text-gray-700 dark:text-gray-300">$1</li>'),r=r.replace(/\*\*(.*?)\*\*/g,'<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>'),r=r.replace(/\*([^\s*][^*]*?)\*/g,'<em class="italic text-gray-700 dark:text-gray-300">$1</em>'),r=r.replace(/`(.*?)`/g,'<code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono text-pink-600 dark:text-pink-400">$1</code>'),r=r.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">$1</a>'),r=r.replace(/^> (.*$)/gim,'<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>'),r=r.replace(/^---$/gim,'<hr class="my-4 border-gray-300 dark:border-gray-600" />'),r=r.replace(/\n\n/g,'</p><p class="mb-2 text-gray-700 dark:text-gray-300">'),r=r.replace(/\n/g,"<br/>"),r='<p class="mb-2 text-gray-700 dark:text-gray-300">'+r+"</p>",r},rr={welcome:`# Welcome to Markdown Editor 👋

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
Check out [MDN Web Docs](https://developer.mozilla.org) for reference.`},Nd=v(t=>{const r=P(rr.welcome,t),a=o=>{r.v=rr[o]},n=o=>{r.v=o.target.value};return()=>{const o=Ad(r.v),s=r.v.trim().split(/\s+/).length,d=r.v.length;return e("div",{class:"w-full max-w-5xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"📝 Markdown Editor"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"Edit markdown on the left, see live HTML preview on the right"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>a("welcome"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",children:"👋 Welcome"}),e("button",{onClick:()=>a("article"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:"📰 Article"}),e("button",{onClick:()=>a("todo"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors",children:"✅ Todo"}),e("button",{onClick:()=>a("code"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors",children:"💻 Code"}),e("div",{class:"flex-1"}),e("div",{class:"text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3",children:[e("span",{children:[s," words"]}),e("span",{children:"•"}),e("span",{children:[d," characters"]})]})]}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e("div",{class:"flex flex-col",children:[e("div",{class:"mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300",children:"Markdown Input"}),e("textarea",{value:r.v,onInput:n,class:"flex-1 min-h-[400px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#42b883]",placeholder:"Type your markdown here..."})]}),e("div",{class:"flex flex-col",children:[e("div",{class:"mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300",children:"HTML Preview (using innerHTML)"}),e("div",{class:"flex-1 min-h-[400px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 overflow-auto",children:e("div",{innerHTML:o,class:"text-gray-700 dark:text-gray-300"})})]})]}),e("div",{class:"mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2",children:"💡 Supported Markdown Syntax"}),e("div",{class:"grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-700 dark:text-blue-300",children:[e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"# Heading"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"**bold**"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"*italic*"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"`code`"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"[link](url)"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"* list"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"1. ordered"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"> quote"})}),e("div",{children:e("code",{class:"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded",children:"---"})})]})]})]})}}),Ud=`import { mount } from 'lithent';
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
`,Hd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"innerHTML Property (Markdown Editor)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"innerHTML"})," ","prop을 사용하여 HTML 문자열을 직접 DOM에 삽입하는 실시간 마크다운 에디터 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent가 innerHTML을 통해 동적으로 생성된 HTML 문자열을 효율적으로 DOM에 렌더링하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"마크다운 문법으로 텍스트를 입력하면 실시간으로 HTML로 변환되어 미리보기에 표시됩니다. 템플릿 버튼을 클릭하거나 직접 마크다운을 작성해보세요!"}),e(l,{language:"typescript",code:Ud}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Nd,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"innerHTML 사용 시나리오"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"외부 HTML 삽입"}),": API나 CMS에서 받은 HTML 콘텐츠를 렌더링"]}),e("li",{children:[e("strong",{children:"마크다운 변환"}),": 마크다운을 HTML로 변환하여 표시"]}),e("li",{children:[e("strong",{children:"Syntax Highlighting"}),": 코드 하이라이터 라이브러리 결과물 렌더링"]}),e("li",{children:[e("strong",{children:"Rich Text"}),": WYSIWYG 에디터에서 생성된 HTML 표시"]}),e("li",{children:[e("strong",{children:"SVG/Chart"}),": 문자열로 생성된 SVG나 차트 삽입"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"주요 기능"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"실시간 변환"}),": 타이핑할 때마다 즉시 HTML로 변환되어 미리보기 갱신"]}),e("li",{children:[e("strong",{children:"다양한 문법 지원"}),": 헤딩, 볼드, 이탤릭, 코드, 링크, 리스트, 인용문 등"]}),e("li",{children:[e("strong",{children:"템플릿 시스템"}),": 4가지 샘플 템플릿으로 빠른 시작"]}),e("li",{children:[e("strong",{children:"통계 표시"}),": 단어 수와 글자 수를 실시간으로 계산"]}),e("li",{children:[e("strong",{children:"양방향 에디터"}),": 입력과 미리보기를 나란히 배치하여 직관적인 UX 제공"]})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",children:[e("h3",{class:"text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2",children:"⚠️ innerHTML 사용 시 주의사항"}),e("ul",{class:"list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300",children:[e("li",{children:[e("strong",{children:"XSS 공격 위험"}),": 사용자 입력을 그대로 innerHTML에 넣으면 보안 위험이 있습니다. 반드시 입력을 검증하거나 sanitize 해야 합니다."]}),e("li",{children:[e("strong",{children:"이벤트 리스너 손실"}),": innerHTML로 삽입된 요소에는 이벤트 리스너가 자동으로 연결되지 않습니다."]}),e("li",{children:[e("strong",{children:"성능 고려"}),": 큰 HTML 문자열을 자주 업데이트하면 성능에 영향을 줄 수 있습니다."]})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-800 dark:text-green-200 mb-2",children:"✅ 안전한 사용 방법"}),e("p",{class:"text-sm text-green-700 dark:text-green-300 mb-2",children:"이 예제처럼 신뢰할 수 있는 소스(자체 마크다운 파서)에서 생성된 HTML만 사용하거나, DOMPurify 같은 라이브러리로 sanitize 한 후 사용하세요. 외부에서 받은 HTML을 그대로 사용하는 것은 절대 피해야 합니다."}),e("p",{class:"text-xs text-green-600 dark:text-green-400 italic",children:["💡 참고: 이 예제의 마크다운 파서는 데모를 위해 급조한 것이라 정규식 버그가 숨어있을 수 있습니다 😅 프로덕션에서는"," ",e("code",{class:"px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs",children:"marked"}),"나"," ",e("code",{class:"px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs",children:"markdown-it"})," ","같은 검증된 라이브러리를 사용하세요. 정규식은 항상 우리를 배신합니다."]})]}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("a",{href:"/guide/props",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/props"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Props 가이드"})," ","- innerHTML처럼 DOM 속성을 props로 다루는 기본 규칙과 주의사항을 정리합니다."]}),e("li",{children:[e("a",{href:"/guide/htm-tags",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/htm-tags"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"HTM Tags 가이드"})," ","- innerHTML 대신 템플릿 태그로 마크업을 구성하는 대안적인 방법을 소개합니다."]})]})]})]}),R={face:[{value:"😊",label:"😊 Happy"},{value:"😎",label:"😎 Cool"},{value:"🤓",label:"🤓 Nerdy"},{value:"😴",label:"😴 Sleepy"},{value:"🤠",label:"🤠 Cowboy"},{value:"🥳",label:"🥳 Party"},{value:"😇",label:"😇 Angel"},{value:"🤡",label:"🤡 Clown"}],hair:[{value:"🦰",label:"🦰 Red Hair"},{value:"🦱",label:"🦱 Curly"},{value:"🦲",label:"🦲 Bald"},{value:"🦳",label:"🦳 White"},{value:"💇",label:"💇 Haircut"},{value:"👨‍🦰",label:"👨‍🦰 Short Red"},{value:"👩‍🦱",label:"👩‍🦱 Curly Long"},{value:"🧔",label:"🧔 Beard"}],eyes:[{value:"👀",label:"👀 Normal"},{value:"👁️",label:"👁️ Single"},{value:"🕶️",label:"🕶️ Sunglasses"},{value:"👓",label:"👓 Glasses"},{value:"🥽",label:"🥽 Goggles"},{value:"😵‍💫",label:"😵‍💫 Dizzy"},{value:"🤩",label:"🤩 Star Eyes"},{value:"😍",label:"😍 Heart Eyes"}],outfit:[{value:"👔",label:"👔 Formal"},{value:"👕",label:"👕 T-Shirt"},{value:"👗",label:"👗 Dress"},{value:"👘",label:"👘 Kimono"},{value:"🦺",label:"🦺 Safety Vest"},{value:"🥼",label:"🥼 Lab Coat"},{value:"🎽",label:"🎽 Athletic"},{value:"👚",label:"👚 Blouse"}],accessory:[{value:"🎩",label:"🎩 Top Hat"},{value:"👑",label:"👑 Crown"},{value:"🎓",label:"🎓 Grad Cap"},{value:"⛑️",label:"⛑️ Helmet"},{value:"🧢",label:"🧢 Baseball Cap"},{value:"💍",label:"💍 Ring"},{value:"🎀",label:"🎀 Ribbon"},{value:"🎭",label:"🎭 Theater Mask"}],background:[{value:"bg-gradient-to-br from-blue-400 to-blue-600",label:"🌊 Ocean"},{value:"bg-gradient-to-br from-green-400 to-green-600",label:"🌲 Forest"},{value:"bg-gradient-to-br from-yellow-400 to-orange-500",label:"🌅 Sunset"},{value:"bg-gradient-to-br from-purple-400 to-pink-500",label:"🌸 Fantasy"},{value:"bg-gradient-to-br from-gray-700 to-gray-900",label:"🌃 Night"},{value:"bg-gradient-to-br from-red-400 to-red-600",label:"🔥 Fire"},{value:"bg-gradient-to-br from-cyan-300 to-blue-400",label:"❄️ Ice"},{value:"bg-gradient-to-br from-yellow-200 to-yellow-400",label:"☀️ Sunny"}]},_d={developer:{face:"🤓",hair:"🦲",eyes:"👓",outfit:"👕",accessory:"💻",background:"bg-gradient-to-br from-gray-700 to-gray-900"},pirate:{face:"😎",hair:"🧔",eyes:"🕶️",outfit:"🦺",accessory:"🎩",background:"bg-gradient-to-br from-blue-400 to-blue-600"},royalty:{face:"😇",hair:"👨‍🦰",eyes:"👀",outfit:"👗",accessory:"👑",background:"bg-gradient-to-br from-purple-400 to-pink-500"},athlete:{face:"🥳",hair:"🦱",eyes:"😍",outfit:"🎽",accessory:"🧢",background:"bg-gradient-to-br from-green-400 to-green-600"}},Bd=v(t=>{const r=P({face:"😊",hair:"🦰",eyes:"👀",outfit:"👔",accessory:"🎩",background:"bg-gradient-to-br from-blue-400 to-blue-600"},t),a=(d,i)=>{r.v={...r.v,[d]:i}},n=d=>{r.v={..._d[d]}},o=()=>{r.v={face:R.face[Math.floor(Math.random()*R.face.length)].value,hair:R.hair[Math.floor(Math.random()*R.hair.length)].value,eyes:R.eyes[Math.floor(Math.random()*R.eyes.length)].value,outfit:R.outfit[Math.floor(Math.random()*R.outfit.length)].value,accessory:R.accessory[Math.floor(Math.random()*R.accessory.length)].value,background:R.background[Math.floor(Math.random()*R.background.length)].value}},s=()=>{const d=JSON.stringify(r.v,null,2);navigator.clipboard.writeText(d),alert("캐릭터 데이터가 클립보드에 복사되었습니다!")};return()=>e("div",{class:"w-full max-w-4xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"🎨 Character Creator"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"Create your unique character using select controls"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>n("developer"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-800 transition-colors",children:"💻 Developer"}),e("button",{onClick:()=>n("pirate"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:"🏴‍☠️ Pirate"}),e("button",{onClick:()=>n("royalty"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",children:"👑 Royalty"}),e("button",{onClick:()=>n("athlete"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors",children:"🏃 Athlete"}),e("button",{onClick:o,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors",children:"🎲 Randomize"}),e("button",{onClick:s,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"📋 Export"})]}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e("div",{class:"order-2 md:order-1",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Your Character"}),e("div",{class:`relative rounded-2xl ${r.v.background} p-8 min-h-[300px] flex items-center justify-center shadow-lg`,children:e("div",{class:"text-center",children:[e("div",{class:"text-8xl mb-4",children:r.v.face}),e("div",{class:"flex justify-center gap-4 text-5xl mb-4",children:[e("span",{children:r.v.hair}),e("span",{children:r.v.eyes})]}),e("div",{class:"flex justify-center gap-4 text-5xl",children:[e("span",{children:r.v.outfit}),e("span",{children:r.v.accessory})]})]})}),e("div",{class:"mt-3 text-xs text-gray-500 dark:text-gray-400 text-center",children:"💡 Select controls update character in real-time"})]}),e("div",{class:"order-1 md:order-2 space-y-3",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Customize"}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Face"}),e("select",{value:r.v.face,onChange:d=>a("face",d.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:R.face.map(d=>e("option",{value:d.value,selected:r.v.face===d.value,children:d.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Hair Style"}),e("select",{value:r.v.hair,onChange:d=>a("hair",d.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:R.hair.map(d=>e("option",{value:d.value,selected:r.v.hair===d.value,children:d.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Eyes / Eyewear"}),e("select",{value:r.v.eyes,onChange:d=>a("eyes",d.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:R.eyes.map(d=>e("option",{value:d.value,selected:r.v.eyes===d.value,children:d.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Outfit"}),e("select",{value:r.v.outfit,onChange:d=>a("outfit",d.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:R.outfit.map(d=>e("option",{value:d.value,selected:r.v.outfit===d.value,children:d.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Accessory"}),e("select",{value:r.v.accessory,onChange:d=>a("accessory",d.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:R.accessory.map(d=>e("option",{value:d.value,selected:r.v.accessory===d.value,children:d.label}))})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Background"}),e("select",{value:r.v.background,onChange:d=>a("background",d.target.value),class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]",children:R.background.map(d=>e("option",{value:d.value,selected:r.v.background===d.value,children:d.label}))})]})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"Select 동작 확인:"})," 각 드롭다운에서 옵션을 선택하면 onChange 이벤트가 발생하고, Lithent가 변경된 값을 감지하여 캐릭터 프리뷰를 즉시 업데이트합니다. selected 속성이 올바르게 동기화되는지 확인해보세요!"]})})]})}),Fd=`import { mount } from 'lithent';
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
`,$d=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Select Controls (Character Creator)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<select>"})," ","요소와"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"selected"})," ","속성이 올바르게 동작하는지 보여주는 이모지 기반 캐릭터 크리에이터 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent가 select 요소의 onChange 이벤트를 처리하고, selected 속성을 통해 현재 선택된 옵션을 정확하게 동기화하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"각 드롭다운에서 옵션을 선택하면 캐릭터가 실시간으로 변경됩니다. Preset 버튼이나 Randomize 기능으로 다양한 조합을 시도해보세요!"}),e(l,{language:"typescript",code:Fd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Bd,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Select 요소의 핵심 동작"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"onChange 이벤트"}),": 사용자가 옵션을 선택하면 이벤트 핸들러가 즉시 실행됩니다"]}),e("li",{children:[e("strong",{children:"selected 속성"}),": 현재 상태값과 옵션의 value를 비교하여 selected 속성을 동적으로 설정"]}),e("li",{children:[e("strong",{children:"양방향 바인딩"}),": value prop으로 현재 선택값을 설정하고, onChange로 변경사항을 감지"]}),e("li",{children:[e("strong",{children:"상태 동기화"}),": Preset이나 Randomize처럼 프로그래밍 방식으로 상태를 변경해도 select가 올바르게 업데이트됨"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"주요 기능"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"다양한 커스터마이징 옵션"}),": 얼굴, 헤어, 눈, 옷, 악세사리, 배경을 각각 선택"]}),e("li",{children:[e("strong",{children:"Preset 시스템"}),": Developer, Pirate, Royalty, Athlete 프리셋 제공"]}),e("li",{children:[e("strong",{children:"Randomize 기능"}),": 랜덤하게 캐릭터 생성"]}),e("li",{children:[e("strong",{children:"Export 기능"}),": 캐릭터 데이터를 JSON으로 클립보드에 복사"]}),e("li",{children:[e("strong",{children:"실시간 프리뷰"}),": Select 변경 시 즉시 캐릭터 모습이 업데이트"]}),e("li",{children:[e("strong",{children:"그라디언트 배경"}),": Tailwind CSS 그라디언트로 다양한 분위기 연출"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"각 드롭다운에서 다양한 옵션을 선택하여 캐릭터가 즉시 변경되는지 확인"}),e("li",{children:"Preset 버튼을 클릭하여 모든 select가 한 번에 업데이트되는지 확인"}),e("li",{children:"Randomize로 무작위 조합 생성 후 각 select의 선택값이 올바른지 확인"}),e("li",{children:"같은 드롭다운을 여러 번 변경하여 selected 속성이 정확히 동기화되는지 확인"}),e("li",{children:"Export 버튼으로 현재 상태를 JSON으로 내보낼 수 있는지 테스트"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎨 왜 이모지 캐릭터인가?"}),e("p",{class:"text-sm text-purple-700 dark:text-purple-300 mb-2",children:"단순한 숫자나 텍스트 select 예제는 지루할 수 있습니다. 이모지를 사용하면 select의 동작을 테스트하면서도 시각적으로 즐거운 경험을 제공할 수 있습니다."}),e("p",{class:"text-xs text-purple-600 dark:text-purple-400 italic",children:"💡 참고: 실제 게임이나 앱의 아바타 시스템도 비슷한 방식으로 동작합니다. Select 대신 버튼이나 이미지 선택기를 사용할 수도 있지만, 핵심 로직은 동일합니다!"})]}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("a",{href:"/guide/state",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"State 가이드"})," ","- select 변경에 따라 Character 상태를 갱신하는 기본 패턴을 자세히 설명합니다."]}),e("li",{children:[e("a",{href:"/guide/props",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/props"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Props 가이드"})," ","- value/selected 같은 DOM 속성을 props로 제어할 때의 규칙을 함께 참고하면 좋습니다."]})]})]})]}),jd={modern:{gradient:"bg-gradient-to-br from-blue-500 to-purple-600",text:"text-white",accent:"text-blue-100"},classic:{gradient:"bg-gradient-to-br from-gray-800 to-gray-900",text:"text-white",accent:"text-gray-300"},minimal:{gradient:"bg-white dark:bg-gray-100",text:"text-gray-900",accent:"text-gray-600"},vibrant:{gradient:"bg-gradient-to-br from-pink-500 to-orange-500",text:"text-white",accent:"text-pink-100"}},Vd={developer:{name:"Alex Johnson",title:"Full Stack Developer",company:"TechCorp Inc.",email:"alex@techcorp.com",phone:"+1 (555) 123-4567",website:"alexjohnson.dev",bio:"Passionate about building scalable web applications with modern technologies.",theme:"modern"},designer:{name:"Sarah Lee",title:"Creative Director",company:"Design Studio",email:"sarah@designstudio.io",phone:"+1 (555) 234-5678",website:"sarahlee.design",bio:"Creating beautiful and intuitive user experiences.",theme:"vibrant"},entrepreneur:{name:"Michael Chen",title:"CEO & Founder",company:"StartupXYZ",email:"michael@startupxyz.com",phone:"+1 (555) 345-6789",website:"startupxyz.com",bio:"Building the future of technology, one startup at a time.",theme:"classic"}},zd=v(t=>{const r=P({name:"Your Name",title:"Your Title",company:"Your Company",email:"email@example.com",phone:"+1 (555) 000-0000",website:"yourwebsite.com",bio:"Write a short bio about yourself...",theme:"modern"},t),a=(d,i)=>{r.v={...r.v,[d]:i}},n=d=>{r.v={...Vd[d]}},o=()=>{r.v={name:"",title:"",company:"",email:"",phone:"",website:"",bio:"",theme:"modern"}},s=()=>{const d=JSON.stringify(r.v,null,2);navigator.clipboard.writeText(d),alert("명함 데이터가 클립보드에 복사되었습니다!")};return()=>{const d=jd[r.v.theme];return e("div",{class:"w-full max-w-5xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"💼 Business Card Generator"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"Create your digital business card with live preview"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>n("developer"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:"👨‍💻 Developer"}),e("button",{onClick:()=>n("designer"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors",children:"🎨 Designer"}),e("button",{onClick:()=>n("entrepreneur"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-800 transition-colors",children:"🚀 Entrepreneur"}),e("button",{onClick:o,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors",children:"🔄 Reset"}),e("button",{onClick:s,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"📋 Export"})]}),e("div",{class:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e("div",{class:"order-2 lg:order-1",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Card Preview"}),e("div",{class:"aspect-[1.6/1] max-w-md mx-auto",children:e("div",{class:`w-full h-full rounded-2xl shadow-2xl p-8 flex flex-col justify-between ${d.gradient}`,children:[e("div",{children:[e("h2",{class:`text-2xl font-bold mb-1 ${d.text} truncate`,children:r.v.name||"Your Name"}),e("p",{class:`text-sm ${d.accent} truncate`,children:r.v.title||"Your Title"}),e("p",{class:`text-sm font-medium ${d.text} truncate`,children:r.v.company||"Your Company"})]}),e("div",{class:`text-xs ${d.accent} space-y-1`,children:[e("p",{class:"truncate",children:["📧 ",r.v.email||"email@example.com"]}),e("p",{class:"truncate",children:["📱 ",r.v.phone||"+1 (555) 000-0000"]}),e("p",{class:"truncate",children:["🌐 ",r.v.website||"yourwebsite.com"]})]}),e("div",{class:`text-xs ${d.text} opacity-90 line-clamp-2`,children:r.v.bio||"Write a short bio..."})]})}),e("div",{class:"mt-3 text-xs text-gray-500 dark:text-gray-400 text-center",children:"💡 Input fields update the card in real-time"})]}),e("div",{class:"order-1 lg:order-2 space-y-3",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Card Information"}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Full Name"}),e("input",{type:"text",value:r.v.name,onInput:i=>a("name",i.target.value),placeholder:"Enter your name",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Job Title"}),e("input",{type:"text",value:r.v.title,onInput:i=>a("title",i.target.value),placeholder:"Enter your job title",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Company"}),e("input",{type:"text",value:r.v.company,onInput:i=>a("company",i.target.value),placeholder:"Enter your company name",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Email"}),e("input",{type:"email",value:r.v.email,onInput:i=>a("email",i.target.value),placeholder:"your@email.com",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Phone"}),e("input",{type:"tel",value:r.v.phone,onInput:i=>a("phone",i.target.value),placeholder:"+1 (555) 000-0000",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Website"}),e("input",{type:"url",value:r.v.website,onInput:i=>a("website",i.target.value),placeholder:"yourwebsite.com",class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Bio (Short Description)"}),e("textarea",{value:r.v.bio,onInput:i=>a("bio",i.target.value),placeholder:"Write a short bio...",rows:3,class:"w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883] resize-none"})]}),e("div",{children:[e("label",{class:"block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1",children:"Card Theme"}),e("div",{class:"grid grid-cols-2 gap-2",children:[e("button",{onClick:()=>a("theme","modern"),class:`px-3 py-2 rounded-lg text-xs font-medium transition-all ${r.v.theme==="modern"?"bg-blue-600 text-white ring-2 ring-blue-400":"bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`,children:"Modern"}),e("button",{onClick:()=>a("theme","classic"),class:`px-3 py-2 rounded-lg text-xs font-medium transition-all ${r.v.theme==="classic"?"bg-gray-800 text-white ring-2 ring-gray-600":"bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`,children:"Classic"}),e("button",{onClick:()=>a("theme","minimal"),class:`px-3 py-2 rounded-lg text-xs font-medium transition-all ${r.v.theme==="minimal"?"bg-white text-gray-900 ring-2 ring-gray-400":"bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`,children:"Minimal"}),e("button",{onClick:()=>a("theme","vibrant"),class:`px-3 py-2 rounded-lg text-xs font-medium transition-all ${r.v.theme==="vibrant"?"bg-pink-600 text-white ring-2 ring-pink-400":"bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`,children:"Vibrant"})]})]})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"Input 동작 확인:"})," 각 input 필드에 텍스트를 입력하면 onInput 이벤트가 발생하고, Lithent가 변경된 값을 감지하여 명함 프리뷰를 실시간으로 업데이트합니다. value 속성을 통해 양방향 바인딩이 올바르게 동작하는지 확인해보세요!"]})})]})}}),Jd=`import { mount } from 'lithent';
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
`,Wd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Input Controls (Business Card Generator)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<input>"})," ","요소와"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"<textarea>"})," ","요소가 올바르게 동작하는지 보여주는 실시간 명함 생성기 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent가 input/textarea 요소의 onInput 이벤트를 처리하고, value 속성을 통해 양방향 바인딩을 정확하게 구현하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"각 input 필드에 텍스트를 입력하면 명함 프리뷰가 실시간으로 업데이트됩니다. Template 버튼으로 샘플 데이터를 불러오거나 직접 입력해보세요!"}),e(l,{language:"typescript",code:Jd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(zd,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Input 요소의 핵심 동작"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"onInput 이벤트"}),": 사용자가 타이핑할 때마다 이벤트 핸들러가 즉시 실행됩니다"]}),e("li",{children:[e("strong",{children:"value 바인딩"}),": value prop으로 현재 입력값을 설정하여 양방향 바인딩 구현"]}),e("li",{children:[e("strong",{children:"다양한 input 타입"}),": text, email, tel, url 등 다양한 타입의 input 지원"]}),e("li",{children:[e("strong",{children:"textarea 지원"}),": 여러 줄 텍스트 입력도 동일한 방식으로 동작"]}),e("li",{children:[e("strong",{children:"실시간 동기화"}),": Template 로드 시 모든 input 필드가 즉시 업데이트됨"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"주요 기능"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"7가지 입력 필드"}),": Name, Title, Company, Email, Phone, Website, Bio"]}),e("li",{children:[e("strong",{children:"Template 시스템"}),": Developer, Designer, Entrepreneur 프리셋"]}),e("li",{children:[e("strong",{children:"4가지 테마"}),": Modern, Classic, Minimal, Vibrant 스타일"]}),e("li",{children:[e("strong",{children:"실시간 프리뷰"}),": 명함 카드가 입력과 동시에 업데이트"]}),e("li",{children:[e("strong",{children:"Reset 기능"}),": 모든 필드를 한 번에 초기화"]}),e("li",{children:[e("strong",{children:"Export 기능"}),": 명함 데이터를 JSON으로 내보내기"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"각 input 필드에 텍스트를 입력하여 실시간 업데이트 확인"}),e("li",{children:"Template 버튼으로 모든 필드가 한 번에 채워지는지 확인"}),e("li",{children:"Email이나 Phone 같은 특수 input type이 올바르게 동작하는지 확인"}),e("li",{children:"Textarea에 여러 줄 텍스트를 입력하여 line-clamp 동작 확인"}),e("li",{children:"Theme 버튼으로 명함 스타일이 즉시 변경되는지 확인"}),e("li",{children:"Reset 후 모든 input 필드가 초기화되는지 확인"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-800 dark:text-green-200 mb-2",children:"💼 실용적인 예제"}),e("p",{class:"text-sm text-green-700 dark:text-green-300 mb-2",children:"이 명함 생성기는 단순한 데모를 넘어 실제로 사용 가능한 도구입니다. 네트워킹 이벤트에서 디지털 명함으로 사용하거나, 이메일 서명에 넣을 프로필 카드로 활용할 수 있습니다."}),e("p",{class:"text-xs text-green-600 dark:text-green-400 italic",children:"💡 참고: 실제 서비스에서는 입력값 검증(이메일 형식, 전화번호 형식 등)과 sanitization을 추가하는 것이 좋습니다. 또한 명함 디자인을 이미지나 PDF로 내보내는 기능도 구현할 수 있습니다!"})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 Input vs onChange vs onInput"}),e("p",{class:"text-sm text-purple-700 dark:text-purple-300",children:["Lithent는"," ",e("code",{class:"px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs",children:"onInput"}),"이벤트를 권장합니다."," ",e("code",{class:"px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs",children:"onChange"}),"는 포커스를 잃었을 때만 발생하지만,"," ",e("code",{class:"px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-xs",children:"onInput"}),"은 타이핑할 때마다 즉시 발생하여 더 반응적인 UI를 만들 수 있습니다."]})]}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("a",{href:"/guide/state",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"State 가이드"})," ","- 명함 필드들을 state로 관리하고 불변성을 유지하는 방법을 자세히 다룹니다."]}),e("li",{children:[e("a",{href:"/guide/props",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/props"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Props 가이드"})," ","- value/onInput처럼 폼 컨트롤을 제어 컴포넌트로 사용하는 패턴을 정리합니다."]})]})]})]}),Te=[{id:"pepperoni",name:"Pepperoni",emoji:"🍕",price:2.5,calories:140,category:"meat"},{id:"sausage",name:"Sausage",emoji:"🌭",price:2.5,calories:130,category:"meat"},{id:"bacon",name:"Bacon",emoji:"🥓",price:3,calories:150,category:"meat"},{id:"ham",name:"Ham",emoji:"🍖",price:2.5,calories:110,category:"meat"},{id:"chicken",name:"Chicken",emoji:"🍗",price:3,calories:120,category:"meat"},{id:"mushroom",name:"Mushroom",emoji:"🍄",price:1.5,calories:20,category:"veggie"},{id:"olive",name:"Olive",emoji:"🫒",price:1.5,calories:30,category:"veggie"},{id:"pepper",name:"Bell Pepper",emoji:"🫑",price:1.5,calories:25,category:"veggie"},{id:"onion",name:"Onion",emoji:"🧅",price:1,calories:15,category:"veggie"},{id:"tomato",name:"Tomato",emoji:"🍅",price:1.5,calories:20,category:"veggie"},{id:"pineapple",name:"Pineapple",emoji:"🍍",price:2,calories:40,category:"veggie"},{id:"mozzarella",name:"Extra Mozzarella",emoji:"🧀",price:2,calories:80,category:"cheese"},{id:"cheddar",name:"Cheddar",emoji:"🧀",price:2,calories:90,category:"cheese"},{id:"parmesan",name:"Parmesan",emoji:"🧀",price:2.5,calories:85,category:"cheese"},{id:"basil",name:"Fresh Basil",emoji:"🌿",price:1,calories:5,category:"sauce"},{id:"garlic",name:"Garlic",emoji:"🧄",price:1,calories:10,category:"sauce"},{id:"hotpepper",name:"Hot Pepper",emoji:"🌶️",price:1.5,calories:15,category:"sauce"}],Gd={pepperoni:["pepperoni","mozzarella"],veggie:["mushroom","olive","pepper","onion","tomato","mozzarella"],meatLovers:["pepperoni","sausage","bacon","ham","mozzarella"],hawaiian:["ham","pineapple","mozzarella"],supreme:["pepperoni","sausage","mushroom","olive","pepper","onion","mozzarella"]},Xd=v(t=>{const r=P(["pepperoni","mozzarella"],t),a=P("medium",t),n=P("regular",t),o={small:8.99,medium:12.99,large:16.99},s=c=>{r.v.includes(c)?r.v=r.v.filter(h=>h!==c):r.v=[...r.v,c]},d=c=>{r.v=[...Gd[c]]},i=()=>{r.v=[]};return()=>{const c=Te.filter(g=>r.v.includes(g.id)),h=c.reduce((g,D)=>g+D.price,0),m=o[a.v]+h,x=c.reduce((g,D)=>g+D.calories,0)+200,k={meat:Te.filter(g=>g.category==="meat"),veggie:Te.filter(g=>g.category==="veggie"),cheese:Te.filter(g=>g.category==="cheese"),sauce:Te.filter(g=>g.category==="sauce")};return e("div",{class:"w-full max-w-6xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"🍕 Pizza Builder"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"Build your perfect pizza with checkboxes and radio buttons"})]}),e("div",{class:"flex flex-wrap gap-2 mb-4",children:[e("button",{onClick:()=>d("pepperoni"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors",children:"🍕 Pepperoni"}),e("button",{onClick:()=>d("veggie"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors",children:"🥗 Veggie"}),e("button",{onClick:()=>d("meatLovers"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-700 hover:bg-orange-800 transition-colors",children:"🥩 Meat Lovers"}),e("button",{onClick:()=>d("hawaiian"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors",children:"🏝️ Hawaiian"}),e("button",{onClick:()=>d("supreme"),class:"px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",children:"👑 Supreme"}),e("button",{onClick:i,class:"px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",children:"🗑️ Clear All"})]}),e("div",{class:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e("div",{class:"order-2 lg:order-1 space-y-4",children:[e("div",{children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Your Pizza"}),e("div",{class:"bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900 dark:to-orange-900 rounded-full aspect-square p-8 flex items-center justify-center shadow-2xl",children:e("div",{class:"text-center",children:[e("div",{class:"text-6xl mb-2",children:"🍕"}),e("div",{class:"flex flex-wrap justify-center gap-1 max-w-xs",children:c.map(g=>e("span",{class:"text-2xl",title:g.name,children:g.emoji}))}),e("div",{class:"mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200",children:[a.v.charAt(0).toUpperCase()+a.v.slice(1)," ·"," ",n.v.charAt(0).toUpperCase()+n.v.slice(1)," Crust"]})]})})]}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",children:"Order Summary"}),e("div",{class:"space-y-2 text-sm",children:[e("div",{class:"flex justify-between text-gray-600 dark:text-gray-400",children:[e("span",{children:[a.v.charAt(0).toUpperCase()+a.v.slice(1)," Pizza (",n.v," crust)"]}),e("span",{children:["$",o[a.v].toFixed(2)]})]}),c.length>0&&e("div",{class:"text-gray-600 dark:text-gray-400",children:[e("div",{class:"font-medium mb-1",children:"Toppings:"}),c.map(g=>e("div",{class:"flex justify-between pl-3",children:[e("span",{children:[g.emoji," ",g.name]}),e("span",{children:["$",g.price.toFixed(2)]})]}))]}),e("div",{class:"border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-gray-900 dark:text-white text-base",children:[e("span",{children:"Total"}),e("span",{children:["$",m.toFixed(2)]})]})]}),e("div",{class:"mt-4 pt-4 border-t border-gray-300 dark:border-gray-600",children:e("div",{class:"text-xs text-gray-600 dark:text-gray-400 space-y-1",children:[e("div",{class:"font-semibold mb-1",children:"Nutrition Info (approx.)"}),e("div",{children:["🔥 Calories: ~",x]}),e("div",{children:["🧈 Toppings: ",c.length]})]})})]})]}),e("div",{class:"order-1 lg:order-2 space-y-4",children:[e("div",{children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Size"}),e("div",{class:"flex gap-3",children:[e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"size",value:"small",checked:a.v==="small",onChange:g=>{a.v=g.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Small ($8.99)"})]}),e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"size",value:"medium",checked:a.v==="medium",onChange:g=>{a.v=g.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Medium ($12.99)"})]}),e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"size",value:"large",checked:a.v==="large",onChange:g=>{a.v=g.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Large ($16.99)"})]})]})]}),e("div",{children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Crust"}),e("div",{class:"flex gap-3",children:[e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"crust",value:"thin",checked:n.v==="thin",onChange:g=>{n.v=g.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Thin"})]}),e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"crust",value:"regular",checked:n.v==="regular",onChange:g=>{n.v=g.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Regular"})]}),e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"radio",name:"crust",value:"thick",checked:n.v==="thick",onChange:g=>{n.v=g.target.value},class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883]"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Thick"})]})]})]}),e("div",{children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Toppings"}),e("div",{class:"mb-3",children:[e("div",{class:"text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1",children:"🥩 Meat"}),e("div",{class:"grid grid-cols-2 gap-2",children:k.meat.map(g=>e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"checkbox",value:g.id,checked:r.v.includes(g.id),onChange:()=>s(g.id),class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:[g.emoji," ",g.name," ",e("span",{class:"text-xs text-gray-500",children:["(+$",g.price,")"]})]})]}))})]}),e("div",{class:"mb-3",children:[e("div",{class:"text-xs font-semibold text-green-600 dark:text-green-400 mb-1",children:"🥗 Vegetables"}),e("div",{class:"grid grid-cols-2 gap-2",children:k.veggie.map(g=>e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"checkbox",value:g.id,checked:r.v.includes(g.id),onChange:()=>s(g.id),class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:[g.emoji," ",g.name," ",e("span",{class:"text-xs text-gray-500",children:["(+$",g.price,")"]})]})]}))})]}),e("div",{class:"mb-3",children:[e("div",{class:"text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1",children:"🧀 Cheese"}),e("div",{class:"grid grid-cols-2 gap-2",children:k.cheese.map(g=>e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"checkbox",value:g.id,checked:r.v.includes(g.id),onChange:()=>s(g.id),class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:[g.emoji," ",g.name," ",e("span",{class:"text-xs text-gray-500",children:["(+$",g.price,")"]})]})]}))})]}),e("div",{children:[e("div",{class:"text-xs font-semibold text-red-600 dark:text-red-400 mb-1",children:"🌶️ Extras"}),e("div",{class:"grid grid-cols-2 gap-2",children:k.sauce.map(g=>e("label",{class:"flex items-center gap-2 cursor-pointer",children:[e("input",{type:"checkbox",value:g.id,checked:r.v.includes(g.id),onChange:()=>s(g.id),class:"w-4 h-4 text-[#42b883] focus:ring-[#42b883] rounded"}),e("span",{class:"text-sm text-gray-700 dark:text-gray-300",children:[g.emoji," ",g.name," ",e("span",{class:"text-xs text-gray-500",children:["(+$",g.price,")"]})]})]}))})]})]})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"Checkbox & Radio 동작 확인:"})," 체크박스는 여러 토핑을 동시에 선택할 수 있고(다중 선택), 라디오 버튼은 크기와 크러스트에서 하나만 선택할 수 있습니다(단일 선택). Lithent가 checked 속성을 올바르게 동기화하고 onChange 이벤트를 정확히 처리하는지 확인해보세요!"]})})]})}}),qd=`import { mount } from 'lithent';
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
`,Kd=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Checkbox & Radio Controls (Pizza Builder)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'<input type="checkbox">'})," ","와"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:'<input type="radio">'})," ","요소가 올바르게 동작하는지 보여주는 인터랙티브 피자 빌더 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Lithent가 체크박스의 다중 선택과 라디오 버튼의 단일 선택을 정확하게 처리하고, checked 속성을 올바르게 동기화하는지 테스트"}),"하기 위해 설계되었습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"토핑 체크박스를 선택하면 여러 개를 동시에 선택할 수 있고, 피자 크기나 크러스트는 라디오 버튼으로 하나만 선택할 수 있습니다. 실시간으로 가격이 계산되고 피자 프리뷰가 업데이트됩니다!"}),e(l,{language:"typescript",code:qd}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(Xd,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Checkbox의 핵심 동작"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"다중 선택"}),": 여러 체크박스를 동시에 선택할 수 있습니다"]}),e("li",{children:[e("strong",{children:"onChange 이벤트"}),": 체크박스를 클릭할 때마다 이벤트 핸들러가 실행됩니다"]}),e("li",{children:[e("strong",{children:"checked 속성"}),": 배열에 값이 포함되어 있는지 확인하여 checked 상태를 결정"]}),e("li",{children:[e("strong",{children:"배열 상태 관리"}),": 선택된 값들을 배열로 관리하며, 추가/제거 시 불변성을 유지"]}),e("li",{children:[e("strong",{children:"value 속성"}),": 각 체크박스의 고유한 값을 식별하는데 사용됩니다"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"Radio Button의 핵심 동작"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"단일 선택"}),": 같은 name 속성을 가진 라디오 버튼 중 하나만 선택 가능"]}),e("li",{children:[e("strong",{children:"name 그룹화"}),": name 속성으로 라디오 버튼을 그룹화하여 상호 배타적 선택 구현"]}),e("li",{children:[e("strong",{children:"onChange 이벤트"}),": 라디오 버튼을 선택하면 이벤트 핸들러가 실행됩니다"]}),e("li",{children:[e("strong",{children:"checked 속성"}),": 현재 상태값과 라디오 버튼의 value를 비교하여 checked 상태 결정"]}),e("li",{children:[e("strong",{children:"자동 해제"}),": 같은 그룹의 다른 라디오 버튼을 선택하면 이전 선택이 자동으로 해제됨"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"주요 기능"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"17가지 토핑"}),": 고기, 야채, 치즈, 엑스트라로 분류된 다양한 토핑"]}),e("li",{children:[e("strong",{children:"5가지 프리셋"}),": Pepperoni, Veggie, Meat Lovers, Hawaiian, Supreme"]}),e("li",{children:[e("strong",{children:"3가지 크기"}),": Small, Medium, Large (라디오 버튼)"]}),e("li",{children:[e("strong",{children:"3가지 크러스트"}),": Thin, Regular, Thick (라디오 버튼)"]}),e("li",{children:[e("strong",{children:"실시간 가격 계산"}),": 기본 가격 + 토핑 가격 자동 합산"]}),e("li",{children:[e("strong",{children:"영양 정보"}),": 선택한 토핑의 칼로리 총합 표시"]}),e("li",{children:[e("strong",{children:"비주얼 프리뷰"}),": 선택한 토핑의 이모지가 피자 위에 표시됨"]}),e("li",{children:[e("strong",{children:"Clear All 기능"}),": 모든 토핑 선택 해제"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"여러 토핑 체크박스를 동시에 선택하여 다중 선택이 잘 되는지 확인"}),e("li",{children:"체크박스를 다시 클릭하여 선택 해제가 올바르게 동작하는지 확인"}),e("li",{children:"라디오 버튼으로 크기를 변경하면 이전 선택이 자동으로 해제되는지 확인"}),e("li",{children:"Preset 버튼으로 여러 체크박스가 한 번에 선택/해제되는지 확인"}),e("li",{children:"Clear All로 모든 체크박스가 해제되는지 확인 (라디오는 유지)"}),e("li",{children:"가격과 칼로리가 선택에 따라 실시간으로 업데이트되는지 확인"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800",children:[e("h3",{class:"text-base font-semibold text-orange-800 dark:text-orange-200 mb-2",children:"🍕 왜 피자 빌더인가?"}),e("p",{class:"text-sm text-orange-700 dark:text-orange-300 mb-2",children:"체크박스와 라디오 버튼의 차이를 가장 직관적으로 이해할 수 있는 예제입니다. 토핑은 여러 개를 선택할 수 있지만(체크박스), 크기와 크러스트는 하나만 선택할 수 있다는(라디오) 실생활의 경험과 일치합니다."}),e("p",{class:"text-xs text-orange-600 dark:text-orange-400 italic",children:"💡 참고: 실제 피자 주문 앱도 비슷한 패턴을 사용합니다. 이 예제는 단순히 폼 컨트롤을 테스트하는 것을 넘어, 실용적인 UI 패턴을 배울 수 있는 교육 자료이기도 합니다!"})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 Checkbox vs Radio Button"}),e("div",{class:"text-sm text-purple-700 dark:text-purple-300 space-y-2",children:[e("div",{children:[e("strong",{children:"Checkbox"}),": 독립적인 선택 항목. 각 체크박스는 다른 체크박스와 무관하게 선택/해제 가능. 배열로 상태 관리."]}),e("div",{children:[e("strong",{children:"Radio Button"}),": 상호 배타적 선택. 같은 name을 가진 라디오 중 하나만 선택 가능. 단일 값으로 상태 관리."]}),e("div",{class:"text-xs text-purple-600 dark:text-purple-400 italic mt-2",children:'💡 팁: name 속성을 사용하지 않으면 라디오 버튼이 제대로 그룹화되지 않아 여러 개를 동시에 선택할 수 있게 됩니다. 이 예제에서 name="size"와 name="crust"로 두 그룹을 분리했습니다.'})]})]}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("a",{href:"/guide/state",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"State 가이드"})," ","- 체크박스/라디오 선택을 배열·단일 값 상태로 관리하는 패턴을 설명합니다."]}),e("li",{children:[e("a",{href:"/guide/props",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/props"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Props 가이드"})," ","- checked/value/name 같은 폼 관련 props를 어떻게 다루는지 정리한 문서입니다."]})]})]})]}),Qe=wn(),{Provider:Yd,contextState:ot,useContext:Et}=Qe,Zd=v(t=>{const r=Et(Qe,t,["theme","accent","user"]);return()=>{const a=r.theme.value==="dark",n=r.accent.value;return e("div",{class:`relative overflow-hidden rounded-xl border shadow-sm transition-colors ${a?"border-gray-700 bg-gray-900":"border-gray-200 bg-white"}`,children:[e("div",{class:`absolute inset-0 bg-gradient-to-br ${n==="emerald"?"from-emerald-500/80 to-emerald-700/90":n==="sky"?"from-sky-500/80 to-sky-700/90":"from-amber-500/80 to-amber-700/90"} opacity-60`}),e("div",{class:"relative p-5 space-y-3",children:[e("div",{class:"text-xs uppercase tracking-wide text-gray-100/80",children:"Context Preview"}),e("div",{class:"text-2xl font-bold text-white",children:r.user.value||"Guest"}),e("div",{class:"flex items-center gap-2 text-sm text-gray-100/90",children:[e("span",{class:"inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 text-xs font-medium",children:[e("span",{class:`inline-block w-2 h-2 rounded-full ${a?"bg-gray-100":"bg-yellow-300"}`}),a?"Dark theme":"Light theme"]}),e("span",{class:"inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 text-xs font-medium",children:["🎨 Accent: ",n]})]}),e("p",{class:"text-xs text-gray-100/80",children:"이 카드와 아래 배지는 모두 같은 Context를 구독하고 있습니다."})]})]})}}),Qd=v(t=>{const r=Et(Qe,t,["user","theme"]);return()=>e("div",{class:"inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800",children:[e("span",{class:"w-2 h-2 rounded-full bg-emerald-500"}),e("span",{class:"text-xs font-medium text-gray-700 dark:text-gray-200",children:["Signed in as"," ",e("span",{class:"font-semibold text-[#42b883]",children:r.user.value})]}),e("span",{class:"text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200",children:r.theme.value==="dark"?"Dark":"Light"})]})}),eo=v(t=>{const r=Et(Qe,t,["user","theme","accent"]),a=()=>{const s=r.user.value,d=s==="Alice"?"Bob":s==="Bob"?"Charlie":"Alice";r.user.value=d},n=()=>{r.theme.value=r.theme.value==="light"?"dark":"light"},o=s=>{r.accent.value=s};return()=>e("div",{class:"space-y-4",children:[e("div",{class:"space-y-2",children:[e("h4",{class:"text-sm font-semibold text-gray-900 dark:text-gray-100",children:"사용자 & 테마 변경"}),e("div",{class:"flex flex-wrap gap-2",children:[e("button",{type:"button",onClick:a,class:"px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors",children:"사용자 바꾸기"}),e("button",{type:"button",onClick:n,class:"px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",children:["테마 토글 (",r.theme.value==="light"?"Light":"Dark",")"]})]})]}),e("div",{class:"space-y-2",children:[e("h4",{class:"text-sm font-semibold text-gray-900 dark:text-gray-100",children:"Accent 색상"}),e("div",{class:"flex flex-wrap gap-2",children:[{id:"emerald",label:"Emerald"},{id:"sky",label:"Sky"},{id:"amber",label:"Amber"}].map(s=>e("button",{type:"button",onClick:()=>o(s.id),class:`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${r.accent.value===s.id?"border-[#42b883] bg-[#42b883]/10 text-[#42b883]":"border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-[#42b883]"}`,children:s.label}))})]})]})}),to=v(t=>{const r=ot("Alice"),a=ot("light"),n=ot("emerald");return()=>e(Yd,{user:r,theme:a,accent:n,children:e("div",{class:"space-y-6",children:[e("div",{class:"bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4",children:[e("h3",{class:"text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-1",children:"💡 Context Helper 데모"}),e("p",{class:"text-xs md:text-sm text-emerald-800 dark:text-emerald-200",children:["여러 컴포넌트가 하나의 Context(AppContext)를"," ",e("strong",{children:"구독하고 공유"}),"합니다. 위/아래 뷰는 서로 다른 컴포넌트지만, 같은 user/theme/accent 값을 실시간으로 참조합니다."]})]}),e("div",{class:"flex flex-wrap items-center justify-between gap-3",children:[e(Qd,{}),e("div",{class:"text-[11px] text-gray-500 dark:text-gray-400",children:"Header, Controls, Preview 모두 같은 Context를 사용합니다."})]}),e("div",{class:"grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]",children:[e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4",children:e(eo,{})}),e(Zd,{})]})]})})}),ro=`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type ThemeMode = 'light' | 'dark';
type AccentColor = 'emerald' | 'sky' | 'amber';

type AppContext = {
  user: string;
  theme: ThemeMode;
  accent: AccentColor;
};

const appContext = createContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

// Context를 제공하는 루트 컴포넌트
const App = mount(renew => {
  const userState = contextState('Alice');
  const themeState = contextState<ThemeMode>('light');
  const accentState = contextState<AccentColor>('emerald');

  return () => (
    <Provider user={userState} theme={themeState} accent={accentState}>
      <Header />
      <Main />
    </Provider>
  );
});

// 여러 Consumer가 같은 Context를 구독
const Header = mount(renew => {
  const ctx = useContext(appContext, renew, ['user', 'theme']);

  return () => (
    <header>
      <span>Signed in as {ctx.user.value}</span>
      <span>Theme: {ctx.theme.value}</span>
    </header>
  );
});

const Controls = mount(renew => {
  const ctx = useContext(appContext, renew, ['user', 'theme', 'accent']);

  const cycleUser = () => {
    const next = ctx.user.value === 'Alice'
      ? 'Bob'
      : ctx.user.value === 'Bob'
      ? 'Charlie'
      : 'Alice';
    ctx.user.value = next;
  };

  const toggleTheme = () => {
    ctx.theme.value = ctx.theme.value === 'light' ? 'dark' : 'light';
  };

  const setAccent = (color: AccentColor) => {
    ctx.accent.value = color;
  };

  return () => (
    <section>
      <button onClick={cycleUser}>사용자 바꾸기</button>
      <button onClick={toggleTheme}>테마 토글</button>
      <button onClick={() => setAccent('emerald')}>Emerald</button>
      <button onClick={() => setAccent('sky')}>Sky</button>
      <button onClick={() => setAccent('amber')}>Amber</button>
    </section>
  );
});`,ao=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Context Helper (테마 & 사용자 패널)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는 여러 컴포넌트가"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"Context"}),"를 통해 ",e("strong",{children:"user / theme / accent"}),' 값을 공유하는 작은 "테마 & 사용자" 패널입니다. 상단 배지, 컨트롤 패널, 프리뷰 카드가 모두 같은 Context를 구독하고 있습니다.']}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["위/아래 컴포넌트들은 서로 독립적인 마운터이지만,"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"Provider"}),"로 감싼 트리 안에 있기 때문에"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"useContext"}),"로 같은 데이터를 읽고, 변경 사항도 함께 반영됩니다."]}),e(l,{language:"tsx",code:ro}),e("div",{class:"not-prose mt-6 mb-10",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(to,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/context",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/context"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Context 가이드"})," ","- createContext / Provider / useContext / contextState API와 선택적 구독(subscribeKeys) 패턴을 자세히 설명합니다."]}),e("li",{children:[e("a",{href:"/guide/store",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/store"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Store 가이드"})," ","- 트리 범위에 한정된 Context와 달리, 전역 store로 상태를 공유하는 방식과의 차이를 비교해 볼 수 있습니다."]})]})]})]}),_=[{id:"new1",author:"Sarah Chen",avatar:"👩‍💻",content:"Just shipped a new feature with Lithent! The virtual DOM performance is amazing 🚀",time:"2 min ago",likes:42,type:"user"},{id:"new2",author:"Alex Rivera",avatar:"🧑‍🎨",content:"Hot take: Mixing real DOM and virtual DOM is actually a superpower for progressive enhancement",time:"5 min ago",likes:28,type:"trending"},{id:"new3",author:"Jordan Kim",avatar:"🧑‍🚀",content:"Anyone else loving how lightweight Lithent is? No more bloated bundles!",time:"8 min ago",likes:67,type:"user"}],no=v(t=>{const r=P([!0,!0,!0],t),a=s=>{r.v=r.v.map((d,i)=>i===s?!d:d)},n=()=>{r.v=[!0,!0,!0]},o=()=>{r.v=[!1,!1,!1]};return()=>e(L,{children:[e("div",{class:"sticky top-0 z-10 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-3 mb-3",children:[e("div",{class:"flex items-center gap-2 mb-2",children:e("span",{class:"text-xs font-semibold text-blue-800 dark:text-blue-200",children:"🔄 실시간 포스트 (가상 DOM)"})}),e("div",{class:"flex flex-wrap gap-2",children:[e("button",{onClick:()=>a(0),class:`px-2 py-1 text-xs rounded ${r.v[0]?"bg-blue-600 text-white":"bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}`,children:"Post 1"}),e("button",{onClick:()=>a(1),class:`px-2 py-1 text-xs rounded ${r.v[1]?"bg-orange-600 text-white":"bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}`,children:"Post 2 (Trending)"}),e("button",{onClick:()=>a(2),class:`px-2 py-1 text-xs rounded ${r.v[2]?"bg-blue-600 text-white":"bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}`,children:"Post 3"}),e("div",{class:"flex-1"}),e("button",{onClick:n,class:"px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700",children:"전체 보기"}),e("button",{onClick:o,class:"px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700",children:"전체 숨기기"})]})]}),r.v[0]&&e("article",{class:"bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-blue-500 shadow-sm animate-fade-in",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:_[0].avatar}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:_[0].author}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:["· ",_[0].time]}),e("span",{class:"px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded",children:"가상 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:_[0].content}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:["❤️ ",_[0].likes]}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"}),e("button",{class:"hover:text-green-500",children:"🔄 Repost"})]})]})]})}),r.v[1]&&e("article",{class:"bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-4 mb-3 border-l-4 border-orange-500 shadow-sm animate-fade-in",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:_[1].avatar}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:_[1].author}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:["· ",_[1].time]}),e("span",{class:"px-1.5 py-0.5 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded",children:"🔥 Trending"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded",children:"가상 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:_[1].content}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:["❤️ ",_[1].likes]}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"}),e("button",{class:"hover:text-green-500",children:"🔄 Repost"})]})]})]})}),r.v[2]&&e("article",{class:"bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-blue-500 shadow-sm animate-fade-in",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:_[2].avatar}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:_[2].author}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:["· ",_[2].time]}),e("span",{class:"px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded",children:"가상 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:_[2].content}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:["❤️ ",_[2].likes]}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"}),e("button",{class:"hover:text-green-500",children:"🔄 Repost"})]})]})]})})]})}),lo=v(()=>{const t=V(null),r=V(null);return te(()=>{const a=t.value,n=r.value;ce(e(no,{}),a,n)}),()=>e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"📱 Social Media Timeline"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"실제 DOM (서버 렌더링)과 가상 DOM (클라이언트 렌더링)이 혼합된 타임라인"})]}),e("div",{ref:t,class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto",children:[e("article",{class:"bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-3 border-l-4 border-purple-500 shadow-sm",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:"📌"}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:"Lithent Team"}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:"· 1 hour ago"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded",children:"Pinned"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:"Welcome to our feed! This post is server-rendered (real DOM) and always stays at the top."}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:"❤️ 156"}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"})]})]})]})}),e("article",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-gray-400 shadow-sm",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:"👤"}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:"Previous User"}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:"· 15 min ago"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:"This is an older post that was server-rendered. It's part of the initial HTML."}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:"❤️ 23"}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"})]})]})]})}),e("article",{ref:r,class:"bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3 border-l-4 border-green-500 shadow-sm",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:"📢"}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:"Sponsored"}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:"· Ad"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:"This sponsored post is also real DOM - it stays in place regardless of what happens above!"}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:e("button",{class:"hover:text-blue-500",children:"Learn More →"})})]})]})}),e("article",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-gray-400 shadow-sm",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-3xl",children:"📜"}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2 mb-1",children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:"Archive"}),e("span",{class:"text-xs text-gray-500 dark:text-gray-400",children:"· 2 hours ago"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM"})]}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mb-2",children:"Older content that's part of the initial page load. Real DOM element."}),e("div",{class:"flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:[e("button",{class:"hover:text-red-500",children:"❤️ 8"}),e("button",{class:"hover:text-blue-500",children:"💬 Reply"})]})]})]})})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"혼합 DOM 테스트:"})," 컨트롤 패널의 버튼으로 중간의 포스트들을 토글하세요. 실제 DOM 요소(상단 Pinned, 하단 Sponsored, Archive)는 그대로 유지되고, 그 사이에 가상 DOM 포스트들이 동적으로 추가/제거됩니다. Lithent가 실제 DOM과 가상 DOM을 올바르게 혼합 관리하는지 확인하세요!"]})}),e("style",{children:`
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
        `})]})}),oo=`<!-- 서버에서 렌더링된 초기 HTML (실제 DOM) -->
<div id="feed">
  <article>📌 Pinned Post (실제 DOM)</article>
  <article>👤 Older Post (실제 DOM)</article>

  <!-- 이 지점 위/아래는 서버가 렌더링한 실제 DOM 입니다 -->
  <article id="sponsored-slot">📢 Sponsored (실제 DOM)</article>
  <article>📜 Archive (실제 DOM)</article>
</div>`,so=`import { Fragment, render } from 'lithent';
import { state } from 'lithent/helper';

// 동적 포스트 컴포넌트 (가상 DOM)
const DynamicPosts = mount(renew => {
  const visiblePosts = state([true, true, true], renew);

  const togglePost = (index: number) => {
    visiblePosts.v = visiblePosts.v.map((v, i) => (i === index ? !v : v));
  };

  return () => (
    <Fragment>
      <div>Controls...</div>
      {visiblePosts.v[0] && <article>Post 1 (가상 DOM)</article>}
      {visiblePosts.v[1] && <article>Post 2 (가상 DOM)</article>}
      {visiblePosts.v[2] && <article>Post 3 (가상 DOM)</article>}
    </Fragment>
  );
});

// 기존 실제 DOM 사이에 가상 DOM 삽입
const feedContainer = document.getElementById('feed');
const insertionPoint = document.getElementById('sponsored-slot');

if (feedContainer && insertionPoint) {
  render(<DynamicPosts />, feedContainer, insertionPoint as HTMLElement);
}`,io=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mixed DOM Elements (Social Media Timeline)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:"실제 DOM 요소와 가상 DOM 요소가 하나의 부모 아래에 혼합되어 있을 때 Lithent가 올바르게 처리할 수 있는지 테스트하는 예제입니다."}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는"," ",e("strong",{children:"Progressive Enhancement와 SSR(서버 사이드 렌더링) 시나리오를 시뮬레이션"}),"합니다. 서버에서 렌더링된 정적 콘텐츠(실제 DOM)와 클라이언트에서 동적으로 추가되는 인터랙티브 콘텐츠(가상 DOM)가 공존하는 상황을 재현합니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"소셜 미디어 타임라인에서 고정 포스트, 광고, 아카이브는 서버에서 렌더링된 실제 DOM이고, 그 사이의 실시간 포스트들은 Lithent로 관리되는 가상 DOM입니다. 버튼을 눌러 중간의 포스트를 토글하면서 실제 DOM이 영향받지 않는지 확인하세요!"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3",children:"1. 서버에서 내려온 초기 HTML (실제 DOM)"}),e(l,{language:"html",code:oo}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-8 mb-3",children:"2. 클라이언트에서 실행되는 Lithent 코드 (가상 DOM)"}),e(l,{language:"typescript",code:so}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(lo,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"render() 함수의 insertBefore 모드"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"기본 모드"}),":"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"render(<Component />, parentElement)"})," ","- 부모 요소의 끝에 추가"]}),e("li",{children:[e("strong",{children:"insertBefore 모드"}),":"," ",e("code",{class:"px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"render(<Component />, parentElement, nextElement)"})," ","- nextElement 앞에 삽입"]}),e("li",{children:[e("strong",{children:"Fragment 사용"}),": 여러 요소를 그룹화하여 한 번에 삽입"]}),e("li",{children:[e("strong",{children:"실제 DOM 보존"}),": 기존 실제 DOM 요소는 수정되지 않고 그대로 유지됨"]}),e("li",{children:[e("strong",{children:"동적 업데이트"}),": 가상 DOM 요소만 선택적으로 추가/제거 가능"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"DOM 구조"}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs overflow-x-auto",children:e("pre",{class:"text-gray-800 dark:text-gray-200",children:`<div> (feedContainer)
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
</div>`})})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"핵심 개념"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"Progressive Enhancement"}),": 기본 콘텐츠는 서버에서 렌더링하고, 인터랙티브 기능을 클라이언트에서 추가"]}),e("li",{children:[e("strong",{children:"Hydration과의 차이"}),": Hydration은 기존 DOM에 이벤트를 연결하지만, 이 예제는 새로운 DOM을 기존 DOM 사이에 삽입"]}),e("li",{children:[e("strong",{children:"ref 활용"}),": ref로 실제 DOM 요소의 참조를 얻어 render() 함수에 전달"]}),e("li",{children:[e("strong",{children:"mountCallback"}),": 컴포넌트가 마운트된 후 ref 값이 설정되면 실행됨"]}),e("li",{children:[e("strong",{children:"독립적 업데이트"}),": 가상 DOM 부분만 재렌더링되고 실제 DOM은 영향받지 않음"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"개별 포스트 버튼을 눌러 중간의 가상 DOM 포스트가 사라지는지 확인"}),e("li",{children:"포스트를 숨겼다가 다시 표시할 때 실제 DOM(Pinned, Sponsored, Archive)이 그대로인지 확인"}),e("li",{children:'"전체 숨기기"로 모든 가상 DOM을 제거해도 실제 DOM은 유지되는지 확인'}),e("li",{children:'"전체 보기"로 가상 DOM이 올바른 위치(실제 DOM 사이)에 다시 삽입되는지 확인'}),e("li",{children:"페이지 스크롤을 통해 컨트롤 패널이 sticky로 상단에 고정되는지 확인"}),e("li",{children:"fade-in 애니메이션이 포스트 추가 시 작동하는지 확인"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-800 dark:text-green-200 mb-2",children:"🌟 실전 활용 사례"}),e("p",{class:"text-sm text-green-700 dark:text-green-300 mb-2",children:"이 패턴은 다음과 같은 실제 시나리오에서 매우 유용합니다:"}),e("ul",{class:"text-sm text-green-700 dark:text-green-300 space-y-1 ml-4",children:[e("li",{children:["• ",e("strong",{children:"블로그 댓글"}),": 기존 댓글(SSR)과 새로운 댓글(클라이언트 추가)"]}),e("li",{children:["• ",e("strong",{children:"전자상거래"}),": 정적 상품 목록에 동적 필터/정렬 UI 추가"]}),e("li",{children:["• ",e("strong",{children:"뉴스 피드"}),": 고정 기사와 실시간 업데이트 기사 혼합"]}),e("li",{children:["• ",e("strong",{children:"관리자 패널"}),": 서버 렌더링 테이블에 인라인 편집 기능 추가"]})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 왜 이게 중요한가?"}),e("p",{class:"text-sm text-purple-700 dark:text-purple-300 mb-2",children:'많은 가상 DOM 라이브러리는 전체 컨테이너를 장악하려 합니다. 하지만 Lithent는 실제 프로젝트에서 흔히 마주치는 "점진적 마이그레이션" 시나리오를 지원합니다.'}),e("p",{class:"text-xs text-purple-600 dark:text-purple-400 italic",children:'💡 기존 서버 렌더링 앱에 Lithent를 도입할 때, 전체를 다시 작성할 필요 없이 필요한 부분만 가상 DOM으로 교체할 수 있습니다. 이것이 바로 "Progressive Enhancement"의 진정한 의미입니다!'})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800",children:[e("h3",{class:"text-base font-semibold text-orange-800 dark:text-orange-200 mb-2",children:"⚠️ 주의사항"}),e("ul",{class:"text-sm text-orange-700 dark:text-orange-300 space-y-1",children:[e("li",{children:"• insertBefore 모드를 사용할 때는 nextElement가 반드시 parentElement의 자식이어야 합니다"}),e("li",{children:"• 실제 DOM 요소를 직접 수정하면 Lithent의 가상 DOM 추적에서 벗어날 수 있습니다"}),e("li",{children:"• ref 값은 mountCallback 이후에만 사용 가능합니다"}),e("li",{children:"• 같은 위치에 여러 번 render()를 호출하면 이전 가상 DOM이 교체됩니다"})]})]}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2 mb-6",children:[e("li",{children:[e("a",{href:"/guide/render",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/render"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Render 가이드"})," ","- render(wDom, wrapElement, afterElement) 시그니처와 insertBefore 모드를 정식 문서로 정리해 둔 페이지입니다."]}),e("li",{children:[e("a",{href:"/examples/13",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/examples/13"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Example 13: Mixed DOM + Loop"})," ","- 같은 패턴을 key 기반 리스트와 함께 사용하는 확장 예제를 함께 보면 이해가 더 잘 됩니다."]})]})]})]}),ar=[{id:1,name:"Kim Family",partySize:4,waitTime:15,vip:!1,emoji:"👨‍👩‍👧‍👦"},{id:2,name:"Sarah & Alex",partySize:2,waitTime:10,vip:!0,emoji:"💑"},{id:3,name:"Chen Party",partySize:6,waitTime:25,vip:!1,emoji:"👥"},{id:4,name:"Jordan",partySize:1,waitTime:5,vip:!1,emoji:"🧑"}],co=v(t=>{const r=P([...ar],t),a=P(5,t),n=()=>{r.v=[...r.v].sort((m,x)=>m.waitTime-x.waitTime)},o=()=>{r.v=[...r.v].sort((m,x)=>x.partySize-m.partySize)},s=()=>{r.v=[...r.v].sort((m,x)=>m.vip&&!x.vip?-1:!m.vip&&x.vip?1:0)},d=()=>{r.v=[...r.v].reverse()},i=m=>{r.v=r.v.filter(x=>x.id!==m)},c=()=>{const m=["Park Family","Taylor","Martinez Party","Lee & Kim","Johnson"],x=["👨‍👩‍👧","🧑‍🦰","👨‍👩‍👦‍👦","👫","🧑‍🦱"],k=m[Math.floor(Math.random()*m.length)],g=x[Math.floor(Math.random()*x.length)];r.v=[...r.v,{id:a.v,name:k,partySize:Math.floor(Math.random()*6)+1,waitTime:Math.floor(Math.random()*30)+5,vip:Math.random()>.7,emoji:g}],a.v+=1},h=()=>{r.v=[...ar],a.v=5};return()=>e(L,{children:[e("div",{class:"bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 mb-3 rounded",children:[e("div",{class:"flex items-center gap-2 mb-2",children:e("span",{class:"text-xs font-semibold text-orange-800 dark:text-orange-200",children:"🎛️ Waitlist Controls (가상 DOM)"})}),e("div",{class:"flex flex-wrap gap-2",children:[e("button",{onClick:n,class:"px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700",children:"⏱️ By Wait Time"}),e("button",{onClick:o,class:"px-2 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700",children:"👥 By Party Size"}),e("button",{onClick:s,class:"px-2 py-1 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700",children:"⭐ VIP First"}),e("button",{onClick:d,class:"px-2 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-700",children:"🔄 Reverse"}),e("button",{onClick:c,class:"px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700",children:"➕ Add Guest"}),e("button",{onClick:h,class:"px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700",children:"🔄 Reset"})]})]}),r.v.map((m,x)=>e("div",{class:`rounded-lg p-3 mb-2 border-l-4 shadow-sm transition-all duration-300 ${m.vip?"bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-500":"bg-white dark:bg-gray-800 border-blue-500"}`,children:e("div",{class:"flex items-center justify-between",children:[e("div",{class:"flex items-center gap-3 flex-1",children:[e("div",{class:"text-2xl",children:m.emoji}),e("div",{class:"flex-1 min-w-0",children:[e("div",{class:"flex items-center gap-2",children:[e("span",{class:"font-semibold text-gray-900 dark:text-white text-sm",children:["#",x+1," ",m.name]}),m.vip&&e("span",{class:"px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded",children:"⭐ VIP"}),e("span",{class:"px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded",children:["ID: ",m.id]})]}),e("div",{class:"flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1",children:[e("span",{children:["👥 Party of ",m.partySize]}),e("span",{children:"•"}),e("span",{children:["⏱️ ~",m.waitTime," min"]})]})]})]}),e("button",{onClick:()=>i(m.id),class:"px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 ml-2",children:"📢 Call"})]})},m.id)),r.v.length===0&&e("div",{class:"text-center py-8 text-gray-500 dark:text-gray-400",children:[e("div",{class:"text-4xl mb-2",children:"🎉"}),e("p",{class:"text-sm",children:"No guests waiting! All tables are ready."})]})]})}),mo=v(()=>{const t=V(null),r=V(null);return te(()=>{const a=t.value,n=r.value;ce(e(co,{}),a,n)}),()=>e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"🍽️ Restaurant Waitlist Manager"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"실제 DOM과 가상 DOM이 혼합된 상태에서 리스트 업데이트 테스트"})]}),e("div",{ref:t,class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[700px] overflow-y-auto",children:[e("div",{class:"bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-3 border-l-4 border-purple-500",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-2xl",children:"ℹ️"}),e("div",{children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm mb-1",children:"Welcome to Lithent Restaurant"}),e("p",{class:"text-xs text-gray-700 dark:text-gray-300",children:"Thank you for waiting! We'll call your name when your table is ready."}),e("span",{class:"inline-block mt-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM (고정)"})]})]})}),e("div",{ref:r,class:"bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3 border-l-4 border-green-500",children:e("div",{class:"flex items-start gap-3",children:[e("div",{class:"text-2xl",children:"🎁"}),e("div",{children:[e("h4",{class:"font-semibold text-gray-900 dark:text-white text-sm mb-1",children:"Special Offer!"}),e("p",{class:"text-xs text-gray-700 dark:text-gray-300",children:"Get 10% off your meal if you join our rewards program today!"}),e("span",{class:"inline-block mt-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM (고정)"})]})]})}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-gray-400",children:e("div",{class:"flex items-center gap-2",children:[e("div",{class:"text-xl",children:"📞"}),e("div",{class:"text-xs text-gray-700 dark:text-gray-300",children:[e("p",{class:"font-semibold",children:"Contact: (555) 123-4567"}),e("p",{class:"text-gray-600 dark:text-gray-400",children:"Hours: 11AM - 10PM Daily"})]}),e("span",{class:"ml-auto px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded",children:"실제 DOM (고정)"})]})})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-xs text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"리스트 + 혼합 DOM 테스트:"})," 대기 목록을 정렬하거나 역순으로 바꿔보세요. Lithent가 key 기반으로 DOM 요소를 올바르게 재정렬하고, 실제 DOM(Welcome, Special Offer, Contact)은 영향받지 않는지 확인하세요! Call 버튼으로 손님을 호출하면 리스트에서 제거됩니다."]})})]})}),xo=`<!-- 서버에서 렌더링된 초기 HTML (실제 DOM) -->
<div id="waitlist">
  <div>ℹ️ Welcome to Lithent Restaurant (실제 DOM)</div>

  <!-- 이 지점 위/아래는 서버가 렌더링한 실제 DOM 입니다 -->
  <div id="offer-slot">🎁 Special Offer! (실제 DOM)</div>
  <div>📞 Contact Info (실제 DOM)</div>
</div>`,go=`import { Fragment, render } from 'lithent';
import { state } from 'lithent/helper';

interface Guest {
  id: number;
  name: string;
  partySize: number;
  waitTime: number;
  vip: boolean;
}

// 동적 대기 목록 컴포넌트 (가상 DOM)
const WaitlistManager = mount(renew => {
  const guests = state<Guest[]>([...initialGuests], renew);

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
      <div>
        <button onClick={sortByWaitTime}>By Wait Time</button>
        <button onClick={reverseOrder}>Reverse</button>
      </div>

      {guests.v.map((guest, index) => (
        <div key={guest.id}>
          #{index + 1} {guest.name}
          <button onClick={() => callGuest(guest.id)}>Call</button>
        </div>
      ))}
    </Fragment>
  );
});

// 기존 실제 DOM 사이에 가상 DOM 리스트 삽입
const container = document.getElementById('waitlist');
const insertionPoint = document.getElementById('offer-slot');

if (container && insertionPoint) {
  render(<WaitlistManager />, container, insertionPoint as HTMLElement);
}`,ho=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mixed DOM with Loop (Restaurant Waitlist)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["실제 DOM과 가상 DOM이 혼합된 상태에서 ",e("strong",{children:"루프(리스트) 요소"}),"를 올바르게 처리할 수 있는지 테스트하는 예제입니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:["이 예제는 Example 12의 확장판으로,"," ",e("strong",{children:"key 기반 리스트가 실제 DOM 사이에서 동적으로 정렬, 추가, 제거될 때 Lithent의 diff 알고리즘이 올바르게 동작하는지 검증"}),"합니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"레스토랑 대기 목록에서 손님을 대기 시간순, 파티 크기순, VIP 우선순으로 정렬하거나 역순으로 바꿔보세요. Lithent가 key를 기반으로 DOM 요소를 효율적으로 재정렬하고, 주변의 실제 DOM은 영향받지 않는지 확인할 수 있습니다!"}),e("h2",{class:"text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-3",children:"1. 서버에서 내려온 초기 HTML (실제 DOM)"}),e(l,{language:"html",code:xo}),e("h2",{class:"text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mt-8 mb-3",children:"2. 클라이언트에서 실행되는 Lithent 코드 (가상 DOM)"}),e(l,{language:"typescript",code:go}),e("div",{class:"not-prose mt-6",children:e("div",{class:"rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"Live demo"}),e(mo,{})]})}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"핵심 테스트 포인트"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"key 기반 diff"}),": 리스트가 정렬될 때 key를 기반으로 기존 DOM 요소를 재사용"]}),e("li",{children:[e("strong",{children:"효율적인 재정렬"}),": 전체를 다시 렌더링하지 않고 위치만 변경"]}),e("li",{children:[e("strong",{children:"혼합 DOM 보존"}),": 리스트 업데이트 시 주변 실제 DOM(Welcome, Special Offer, Footer)은 그대로 유지"]}),e("li",{children:[e("strong",{children:"동적 추가/제거"}),": 새 손님 추가, Call 버튼으로 제거 시 올바른 위치에 삽입/제거"]}),e("li",{children:[e("strong",{children:"Fragment 활용"}),": 컨트롤 패널 + 리스트를 Fragment로 그룹화하여 단일 삽입 지점 사용"]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"리스트 조작 기능"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-3",children:[e("div",{class:"bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1",children:"⏱️ By Wait Time"}),e("p",{class:"text-xs text-blue-700 dark:text-blue-300",children:"대기 시간이 짧은 순서로 정렬 (5분 → 25분)"})]}),e("div",{class:"bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800",children:[e("h4",{class:"text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1",children:"👥 By Party Size"}),e("p",{class:"text-xs text-purple-700 dark:text-purple-300",children:"파티 크기가 큰 순서로 정렬 (6명 → 1명)"})]}),e("div",{class:"bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800",children:[e("h4",{class:"text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1",children:"⭐ VIP First"}),e("p",{class:"text-xs text-yellow-700 dark:text-yellow-300",children:"VIP 손님을 맨 앞으로 우선 배치"})]}),e("div",{class:"bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700",children:[e("h4",{class:"text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1",children:"🔄 Reverse"}),e("p",{class:"text-xs text-gray-700 dark:text-gray-300",children:"현재 순서를 역순으로 뒤집기"})]}),e("div",{class:"bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800",children:[e("h4",{class:"text-sm font-semibold text-green-800 dark:text-green-200 mb-1",children:"➕ Add Guest"}),e("p",{class:"text-xs text-green-700 dark:text-green-300",children:"랜덤한 새 손님을 대기 목록에 추가"})]}),e("div",{class:"bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800",children:[e("h4",{class:"text-sm font-semibold text-red-800 dark:text-red-200 mb-1",children:"📢 Call"}),e("p",{class:"text-xs text-red-700 dark:text-red-300",children:"개별 손님을 호출하여 목록에서 제거"})]})]})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"DOM 구조"}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs overflow-x-auto",children:e("pre",{class:"text-gray-800 dark:text-gray-200",children:`<div> (containerRef)
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
</div>`})})]}),e("div",{class:"mt-6",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"테스트 시나리오"}),e("ol",{class:"list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:'"By Wait Time" 버튼을 눌러 대기 시간순으로 정렬 → 순서가 바뀌는지 확인'}),e("li",{children:'"Reverse" 버튼을 여러 번 눌러 리스트가 역순으로 뒤집히는지 확인'}),e("li",{children:'"VIP First" 버튼으로 VIP(Sarah & Alex)가 맨 앞으로 가는지 확인'}),e("li",{children:"정렬 중에도 상단 Welcome과 하단 Special Offer/Contact가 그대로인지 확인"}),e("li",{children:'"Call" 버튼으로 손님을 제거 → 나머지 손님의 번호(#1, #2...)가 자동으로 업데이트되는지 확인'}),e("li",{children:'"Add Guest"로 새 손님 추가 → 목록 맨 뒤에 추가되는지 확인'}),e("li",{children:'모든 손님을 Call하면 "No guests waiting!" 메시지가 나타나는지 확인'}),e("li",{children:"ID 배지를 보면서 정렬 시 같은 손님(같은 ID)이 이동하는지 확인"})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800",children:[e("h3",{class:"text-base font-semibold text-orange-800 dark:text-orange-200 mb-2",children:"🍽️ 왜 레스토랑 대기 목록인가?"}),e("p",{class:"text-sm text-orange-700 dark:text-orange-300 mb-2",children:"실제 레스토랑 대기 목록 시스템은 다음과 같은 요구사항이 있습니다:"}),e("ul",{class:"text-sm text-orange-700 dark:text-orange-300 space-y-1 ml-4",children:[e("li",{children:"• 대기 시간, 파티 크기, VIP 여부에 따른 우선순위 정렬"}),e("li",{children:"• 손님 호출 시 목록에서 실시간 제거"}),e("li",{children:"• 새로운 손님 등록 시 즉시 목록에 추가"}),e("li",{children:"• 정렬이 바뀌어도 각 손님의 정보(ID, 이름 등)는 유지"})]}),e("p",{class:"text-xs text-orange-600 dark:text-orange-400 italic mt-2",children:'💡 이런 복잡한 리스트 조작은 key 기반 diff가 없으면 매번 전체를 다시 렌더링해야 합니다. Lithent는 key를 통해 "같은 손님"을 추적하고 위치만 변경하여 성능을 최적화합니다!'})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 Example 12 vs Example 13"}),e("div",{class:"text-sm text-purple-700 dark:text-purple-300 space-y-2",children:[e("div",{children:[e("strong",{children:"Example 12 (Mixed DOM)"}),": 실제 DOM과 가상 DOM의 기본적인 혼합. 고정된 개수의 포스트를 토글(추가/제거)"]}),e("div",{children:[e("strong",{children:"Example 13 (Mixed DOM + Loop)"}),": 혼합 DOM에 더해",e("strong",{className:"text-purple-900 dark:text-purple-100",children:[" ","key 기반 리스트의 정렬, 재정렬, 동적 추가/제거"]}),"를 테스트"]}),e("div",{class:"text-xs text-purple-600 dark:text-purple-400 italic",children:'💡 Example 12가 "정적 혼합"이라면, Example 13은 "동적 리스트 혼합"입니다. 실제 앱에서는 두 패턴을 모두 사용합니다!'})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-800 dark:text-green-200 mb-2",children:"🌟 실전 활용 사례"}),e("ul",{class:"text-sm text-green-700 dark:text-green-300 space-y-1 ml-4",children:[e("li",{children:["• ",e("strong",{children:"TODO 리스트"}),": 완료/미완료, 우선순위별 정렬"]}),e("li",{children:["• ",e("strong",{children:"대시보드 테이블"}),": 데이터 정렬, 필터링, 페이지네이션"]}),e("li",{children:["• ",e("strong",{children:"채팅 메시지"}),": 새 메시지 추가, 오래된 메시지는 서버 렌더링"]}),e("li",{children:["• ",e("strong",{children:"쇼핑 카트"}),": 상품 추가/제거, 수량 변경, 가격순 정렬"]}),e("li",{children:["• ",e("strong",{children:"티켓팅 시스템"}),": 우선순위별 정렬, 상태 변경"]})]})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("h3",{class:"text-base font-semibold text-blue-800 dark:text-blue-200 mb-2",children:"⚡ 성능 최적화 포인트"}),e("ul",{class:"text-sm text-blue-700 dark:text-blue-300 space-y-1",children:[e("li",{children:["• ",e("strong",{children:"key 사용"}),": 각 손님에게 고유한 ID를 key로 설정하여 DOM 재사용"]}),e("li",{children:["• ",e("strong",{children:"불변성 유지"}),":"," ",e("code",{class:"px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs",children:"[...guests.v].sort()"})," ","로 새 배열 생성"]}),e("li",{children:["• ",e("strong",{children:"선택적 업데이트"}),": 정렬 시 DOM 요소의 위치만 변경, 내용은 재렌더링하지 않음"]}),e("li",{children:["• ",e("strong",{children:"Fragment 활용"}),": 여러 요소를 그룹화하여 단일 삽입 지점 사용"]})]})]}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("a",{href:"/examples/12",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/examples/12"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Example 12: Mixed DOM Elements"})," ","- 동일한 Mixed DOM 패턴을 정적 포스트 토글 형태로 먼저 살펴보는 기초 예제입니다."]}),e("li",{children:[e("a",{href:"/guide/render",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/render"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Render 가이드"})," ","- insertBefore 모드와 destroy 함수 등 Mixed DOM 시나리오에 필요한 render의 동작 원리를 설명합니다."]})]})]})]}),uo=[{id:"w1",name:"Iron Sword",icon:"⚔️",rarity:"common"},{id:"w2",name:"Magic Staff",icon:"🪄",rarity:"rare"},{id:"w3",name:"Dragon Blade",icon:"🗡️",rarity:"legendary"}],bo=[{id:"a1",name:"Leather Armor",icon:"🛡️",rarity:"common"},{id:"a2",name:"Steel Helmet",icon:"⛑️",rarity:"rare"}],po=[{id:"p1",name:"Health Potion",icon:"🧪",rarity:"common"},{id:"p2",name:"Mana Potion",icon:"💙",rarity:"rare"},{id:"p3",name:"Elixir of Life",icon:"✨",rarity:"epic"}],yo=v((t,r)=>{te(()=>{const n=r.logEl.value;if(n){const o=n.parentElement;o&&(n.innerHTML+=`<span class="text-blue-400">📦 ${r.item.name} equipped</span><br>`,o.scrollTop=o.scrollHeight)}return()=>{const o=r.logEl.value;if(o){const s=o.parentElement;s&&(o.innerHTML+=`<span class="text-orange-400">❌ ${r.item.name} unequipped</span><br>`,s.scrollTop=s.scrollHeight)}}});const a={common:"bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",rare:"bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700",epic:"bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700",legendary:"bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-500"};return()=>e("div",{class:`flex items-center gap-2 p-2 rounded border ${a[r.item.rarity]}`,children:[e("span",{class:"text-2xl",children:r.item.icon}),e("span",{class:"text-xs font-medium text-gray-700 dark:text-gray-300",children:r.item.name})]})}),st=v((t,r)=>(te(()=>{const a=r.logEl.value;if(a){const n=a.parentElement;n&&(a.innerHTML+=`<span class="text-green-400">📂 ${r.title} category opened</span><br>`,n.scrollTop=n.scrollHeight)}return()=>{const n=r.logEl.value;if(n){const o=n.parentElement;o&&(n.innerHTML+=`<span class="text-red-400">🗂️ ${r.title} category closed</span><br>`,o.scrollTop=o.scrollHeight)}}}),()=>e("div",{class:"mb-3",children:[e("div",{class:"flex items-center gap-2 mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded",children:[e("span",{class:"text-xl",children:r.icon}),e("h4",{class:"text-sm font-semibold text-gray-900 dark:text-white",children:r.title}),e("span",{class:"ml-auto text-xs text-gray-500 dark:text-gray-400",children:[r.items.length," items"]})]}),e("div",{class:"grid grid-cols-2 gap-2 pl-4",children:r.items.map(a=>e("div",{children:e(yo,{item:a,logEl:r.logEl})},a.id))})]}))),ko=v((t,r)=>(te(()=>{const a=r.logEl.value;if(a){const n=a.parentElement;n&&(a.innerHTML+='<span class="text-purple-400 font-bold">🎒 Inventory system initialized</span><br>',n.scrollTop=n.scrollHeight)}return()=>{const n=r.logEl.value;if(n){const o=n.parentElement;o&&(n.innerHTML+='<span class="text-pink-400 font-bold">🎒 Inventory system shutdown</span><br>',o.scrollTop=o.scrollHeight)}}}),()=>e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700",children:[e("div",{class:"flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700",children:[e("span",{class:"text-2xl",children:"🎒"}),e("h3",{class:"text-base font-bold text-gray-900 dark:text-white",children:"Game Inventory"})]}),e(st,{title:"Weapons",icon:"⚔️",items:uo,logEl:r.logEl}),e(st,{title:"Armor",icon:"🛡️",items:bo,logEl:r.logEl}),e(st,{title:"Potions",icon:"🧪",items:po,logEl:r.logEl})]}))),fo=v(t=>{const r=P(!0,t),a=V(null),n=()=>{r.v=!r.v},o=()=>{a.value&&(a.value.innerHTML="")};return()=>e("div",{class:"w-full max-w-3xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"🎮 Game Inventory System"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"중첩된 컴포넌트의 mount/unmount 콜백 테스트"})]}),e("div",{class:"flex gap-2 mb-4",children:[e("button",{onClick:n,class:`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${r.v?"bg-red-600 text-white hover:bg-red-700":"bg-green-600 text-white hover:bg-green-700"}`,children:r.v?"🎒 Close Inventory":"🎒 Open Inventory"}),e("button",{onClick:o,class:"px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 font-medium",children:"🗑️ Clear Log"})]}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e("div",{class:"order-2 md:order-1",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Inventory View"}),r.v?e(ko,{logEl:a}):e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700",children:[e("div",{class:"text-4xl mb-2",children:"🔒"}),e("p",{class:"text-sm text-gray-600 dark:text-gray-400",children:"Inventory is closed"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-500 mt-1",children:'Click "Open Inventory" to view items'})]})]}),e("div",{class:"order-1 md:order-2",children:[e("h4",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",children:"Lifecycle Log"}),e("div",{class:"bg-gray-900 rounded-lg p-4 h-[400px] overflow-y-auto border border-gray-700",children:e("div",{ref:a,class:"text-xs font-mono leading-relaxed"})}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400 mt-2",children:"💡 Watch how nested components mount and unmount in order"})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("p",{class:"text-xs text-blue-800 dark:text-blue-200 mb-2",children:["💡 ",e("strong",{children:"중첩된 언마운트 테스트:"}),' "Close Inventory" 버튼을 누르면 다음 순서로 cleanup이 실행됩니다:']}),e("ol",{class:"text-xs text-blue-700 dark:text-blue-300 ml-4 space-y-1",children:[e("li",{children:["1. ",e("strong",{children:"Inventory system shutdown"})," (Depth 1 - 부모)"]}),e("li",{children:["2. ",e("strong",{children:"Weapons category closed"})," → 해당 카테고리의 모든 아이템 unequipped"]}),e("li",{children:["3. ",e("strong",{children:"Armor category closed"})," → 해당 카테고리의 모든 아이템 unequipped"]}),e("li",{children:["4. ",e("strong",{children:"Potions category closed"})," → 해당 카테고리의 모든 아이템 unequipped"]})]})]}),e("div",{class:"mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h4",{class:"text-xs font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🎯 컴포넌트 계층 구조"}),e("div",{class:"text-xs font-mono text-purple-700 dark:text-purple-300 leading-relaxed",children:[e("div",{children:"Inventory (Depth 1)"}),e("div",{class:"ml-4",children:"├─ Weapons Category (Depth 2)"}),e("div",{class:"ml-8",children:"│ ├─ Iron Sword (Depth 3)"}),e("div",{class:"ml-8",children:"│ ├─ Magic Staff (Depth 3)"}),e("div",{class:"ml-8",children:"│ └─ Dragon Blade (Depth 3)"}),e("div",{class:"ml-4",children:"├─ Armor Category (Depth 2)"}),e("div",{class:"ml-8",children:"│ ├─ Leather Armor (Depth 3)"}),e("div",{class:"ml-8",children:"│ └─ Steel Helmet (Depth 3)"}),e("div",{class:"ml-4",children:"└─ Potions Category (Depth 2)"}),e("div",{class:"ml-8",children:"├─ Health Potion (Depth 3)"}),e("div",{class:"ml-8",children:"├─ Mana Potion (Depth 3)"}),e("div",{class:"ml-8",children:"└─ Elixir of Life (Depth 3)"})]})]})]})}),vo=v(()=>()=>e("div",{children:[e("h1",{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4",children:"Example 14: Nested Component Unmount Callbacks"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-6",children:["이 예제는 중첩된 컴포넌트 계층에서 ",e("code",{children:"mountCallback"}),"의 cleanup 함수가 어떤 순서로 실행되는지 테스트합니다. 컴포넌트 트리가 언마운트될 때, 부모에서 자식으로 cleanup이 전파되는지 확인할 수 있습니다."]}),e("div",{class:"my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"💡 테스트 요점"}),e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:[e("strong",{children:"Nested Unmount Callbacks"}),": 부모 컴포넌트가 언마운트될 때, 자식 컴포넌트들의 cleanup 함수도 올바른 순서로 실행되는지 확인합니다. 이는 메모리 누수 방지와 리소스 정리에 중요합니다."]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"컴포넌트 구조"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:"이 예제는 3단계 중첩 구조를 가진 게임 인벤토리 시스템입니다:"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"Depth 1 (Inventory)"}),': 전체 인벤토리 시스템 - "🎒 Inventory system initialized/shutdown" 로그']}),e("li",{children:[e("strong",{children:"Depth 2 (InventoryCategory)"}),': 무기/방어구/포션 카테고리 - "📂 Category opened/closed" 로그']}),e("li",{children:[e("strong",{children:"Depth 3 (ItemSlot)"}),': 개별 아이템 (총 8개) - "📦 Item equipped/unequipped" 로그']})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"코드 예제"}),e(l,{code:`// Depth 3: 개별 아이템 컴포넌트
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
);`,language:"tsx"}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"Unmount 순서"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:'"Close Inventory" 버튼을 클릭하면 다음 순서로 cleanup이 실행됩니다:'}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6",children:e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:[e("strong",{children:"🎒 Inventory system shutdown"})," (Depth 1 - 부모 컴포넌트)"]}),e("li",{children:[e("strong",{children:"🗂️ Weapons category closed"})," (Depth 2)"]}),e("li",{children:[e("strong",{children:"❌ Iron Sword unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Magic Staff unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Dragon Blade unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"🗂️ Armor category closed"})," (Depth 2)"]}),e("li",{children:[e("strong",{children:"❌ Leather Armor unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Steel Helmet unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"🗂️ Potions category closed"})," (Depth 2)"]}),e("li",{children:[e("strong",{children:"❌ Health Potion unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Mana Potion unequipped"})," (Depth 3)"]}),e("li",{children:[e("strong",{children:"❌ Elixir of Life unequipped"})," (Depth 3)"]})]})}),e("div",{class:"my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"🎯 핵심 개념"}),e("ul",{class:"text-sm text-purple-800 dark:text-purple-200 space-y-2",children:[e("li",{children:[e("strong",{children:"부모 우선 정리:"})," 부모 컴포넌트의 cleanup이 먼저 실행되고, 그 다음 자식들의 cleanup이 실행됩니다."]}),e("li",{children:[e("strong",{children:"깊이 우선 탐색(DFS):"})," 각 자식 컴포넌트의 cleanup이 실행된 후, 그 자식의 모든 하위 컴포넌트들이 cleanup됩니다. 예를 들어, Weapons 카테고리가 닫히면 그 카테고리의 모든 아이템이 언마운트된 후 다음 카테고리로 진행됩니다."]}),e("li",{children:[e("strong",{children:"리소스 정리:"})," 이벤트 리스너, 타이머, 구독 등을 정리하는 데 활용할 수 있습니다."]}),e("li",{children:[e("strong",{children:"메모리 누수 방지:"})," 올바른 cleanup 순서는 메모리 누수를 방지하는 데 중요합니다."]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실행 예제"}),e("div",{class:"my-8",children:e(fo,{})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"테스트 시나리오"}),e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"1️⃣ 기본 언마운트 테스트"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:'"Open Inventory" 버튼을 클릭하여 인벤토리를 엽니다'}),e("li",{children:"Lifecycle Log에서 초기화 메시지들을 확인합니다 (Inventory system initialized → Categories opened → Items equipped)"}),e("li",{children:'"Close Inventory" 버튼을 클릭합니다'}),e("li",{children:"Lifecycle Log에서 cleanup 순서를 확인합니다 (Inventory shutdown → Categories closed → Items unequipped)"})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"2️⃣ 반복 마운트/언마운트 테스트"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:"Open/Close 버튼을 여러 번 반복해서 클릭합니다"}),e("li",{children:"매번 동일한 순서로 mount/unmount가 실행되는지 로그를 확인합니다"}),e("li",{children:"메모리 누수 없이 깔끔하게 정리되는지 확인합니다"})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"3️⃣ 계층 구조 시각화"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:'하단의 "컴포넌트 계층 구조" 섹션을 참고합니다'}),e("li",{children:"3단계 중첩 구조를 이해합니다 (Inventory → Category → ItemSlot)"}),e("li",{children:"총 12개의 cleanup 함수가 실행됨을 확인합니다 (1 + 3 + 8)"})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실전 활용 사례"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"이벤트 리스너 정리:"})," 컴포넌트가 언마운트될 때 등록한 이벤트 리스너를 제거"]}),e("li",{children:[e("strong",{children:"타이머 정리:"})," setInterval, setTimeout 등의 타이머 정리"]}),e("li",{children:[e("strong",{children:"WebSocket 연결 종료:"})," 실시간 통신 연결을 안전하게 종료"]}),e("li",{children:[e("strong",{children:"애니메이션 취소:"})," requestAnimationFrame 등의 애니메이션 정리"]}),e("li",{children:[e("strong",{children:"구독 해제:"})," 옵저버 패턴에서 구독을 해제하여 메모리 누수 방지"]})]}),e("div",{class:"my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2",children:"⚠️ 주의사항"}),e("ul",{class:"text-sm text-yellow-800 dark:text-yellow-200 space-y-2",children:[e("li",{children:"cleanup 함수는 컴포넌트가 DOM에서 제거되기 전에 실행됩니다."}),e("li",{children:"cleanup 함수 내에서 state를 변경하면 예상치 못한 동작이 발생할 수 있으니 주의하세요."}),e("li",{children:"cleanup 함수는 순수 정리 로직만 포함해야 하며, 새로운 부작용을 일으키지 않아야 합니다."}),e("li",{children:"비동기 작업이 있다면, cleanup 함수에서 취소하거나 완료를 기다리지 않도록 처리해야 합니다."})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"관련 예제"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("a",{href:"/examples/4",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/examples/4"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Example 4: Effect Lifecycle"})," ","- effect cleanup과 비교"]}),e("li",{children:[e("a",{href:"/guide/mount-hooks",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/mount-hooks"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Mount Hooks 가이드"})," ","- mountCallback 기본 사용법"]})]})]})),wo=v(()=>({volume:t})=>e("div",{class:"flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700",children:[e("div",{class:"text-6xl",children:(a=>a===0?"🔇":a<30?"🔈":a<70?"🔉":"🔊")(t)}),e("div",{class:"text-xs font-semibold text-purple-700 dark:text-purple-300",children:"Depth 3: VolumeEmoji"})]})),Co=v(()=>({volume:t})=>e("div",{class:"p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700",children:[e("div",{class:"flex items-center justify-between mb-2",children:[e("span",{class:"text-sm font-semibold text-blue-700 dark:text-blue-300",children:"Depth 2: VolumeBar"}),e("span",{class:"text-xs text-blue-600 dark:text-blue-400",children:[t,"%"]})]}),e("div",{class:"w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",children:e("div",{class:"h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-300",style:{width:`${t}%`}})}),e("div",{class:"mt-3",children:e(wo,{volume:t})})]})),Mo=v(()=>({volume:t})=>e(L,{children:[e("div",{class:"p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700",children:e("div",{class:"text-center mb-4",children:[e("div",{class:"text-sm font-semibold text-green-700 dark:text-green-300 mb-2",children:"Depth 1: VolumeDisplay"}),e("div",{class:"text-6xl font-bold text-green-600 dark:text-green-400",children:t}),e("div",{class:"text-sm text-green-600 dark:text-green-400 mt-1",children:"볼륨 레벨"})]})}),e("div",{class:"mt-4",children:e(Co,{volume:t})})]})),So=v(t=>{const r=P(50,t),a=()=>{r.v<100&&(r.v+=10)},n=()=>{r.v>0&&(r.v-=10)},o=s=>{const d=s.target;r.v=Number(d.value)};return()=>e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"mb-6",children:[e("h3",{class:"text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2",children:[e("span",{class:"text-2xl",children:"🔊"}),"볼륨 컨트롤러"]}),e("p",{class:"text-sm text-gray-600 dark:text-gray-400",children:["Root에서 관리하는"," ",e("code",{class:"px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"volume"})," ","값이 3단계 중첩 컴포넌트에 전달되는 것을 확인하세요"]})]}),e("div",{class:"mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg",children:[e("div",{class:"flex items-center gap-3 mb-3",children:[e("button",{onClick:n,class:"w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed",disabled:r.v===0,children:"−"}),e("input",{type:"range",min:"1",max:"100",value:r.v,onInput:o,class:"flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"}),e("button",{onClick:a,class:"w-12 h-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed",disabled:r.v===100,children:"+"})]}),e("div",{class:"text-center text-xs text-gray-600 dark:text-gray-400",children:"Root 컴포넌트 (state 관리)"})]}),e("div",{class:"bg-white dark:bg-gray-900 rounded-lg p-6 border-2 border-gray-300 dark:border-gray-700",children:e(Mo,{volume:r.v})}),e("div",{class:"mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3",children:"💡 Props 전달 흐름"}),e("div",{class:"text-xs font-mono text-blue-700 dark:text-blue-300 space-y-1",children:[e("div",{class:"flex items-center gap-2",children:[e("span",{class:"font-bold",children:"Root:"}),e("code",{class:"px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded",children:["volume = ",r.v]})]}),e("div",{class:"ml-4",children:"↓ volume prop"}),e("div",{class:"ml-4 flex items-center gap-2",children:[e("span",{class:"font-bold",children:"VolumeDisplay (Depth 1):"}),e("code",{class:"px-2 py-0.5 bg-green-200 dark:bg-green-800 rounded",children:["props.volume = ",r.v]})]}),e("div",{class:"ml-8",children:"↓ volume prop"}),e("div",{class:"ml-8 flex items-center gap-2",children:[e("span",{class:"font-bold",children:"VolumeBar (Depth 2):"}),e("code",{class:"px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded",children:["props.volume = ",r.v]})]}),e("div",{class:"ml-12",children:"↓ volume prop"}),e("div",{class:"ml-12 flex items-center gap-2",children:[e("span",{class:"font-bold",children:"VolumeEmoji (Depth 3):"}),e("code",{class:"px-2 py-0.5 bg-purple-200 dark:bg-purple-800 rounded",children:["props.volume = ",r.v]})]})]})]}),e("div",{class:"mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h4",{class:"text-sm font-semibold text-green-800 dark:text-green-200 mb-2",children:"🎯 테스트 요점"}),e("ul",{class:"text-xs text-green-700 dark:text-green-300 space-y-1",children:[e("li",{children:["• 슬라이더나 버튼으로 ",e("strong",{children:"volume"}),"을 변경하세요"]}),e("li",{children:["• 3개의 컴포넌트가 모두 ",e("strong",{children:"동시에 업데이트"}),"되는 것을 확인하세요"]}),e("li",{children:["• 각 컴포넌트는 ",e("strong",{children:"같은 값을 다른 방식"}),"으로 표현합니다 (숫자 / 바 / 이모지)"]}),e("li",{children:["• Fragment를 사용하여 ",e("strong",{children:"불필요한 DOM 래퍼 없이"})," ","구성됩니다"]})]})]})]})}),To=v(()=>()=>e("div",{children:[e("h1",{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4",children:"Example 15: Nested Props Update (Volume Controller)"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-6",children:"이 예제는 부모 컴포넌트에서 관리하는 상태가 여러 단계의 중첩된 컴포넌트들에게 props를 통해 어떻게 전달되고 업데이트되는지를 테스트합니다. 하나의 volume 값이 3개의 컴포넌트에서 다른 방식으로 표현됩니다."}),e("div",{class:"my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"💡 테스트 요점"}),e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:[e("strong",{children:"Nested Props Update"}),": 부모 컴포넌트의 state가 변경될 때, props로 전달된 값이 모든 중첩된 자식 컴포넌트에 정확하게 전파되는지 확인합니다. 이는 Lithent의 반응형 시스템이 올바르게 동작하는지 검증하는 핵심 테스트입니다."]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"컴포넌트 구조"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:"이 예제는 3단계 중첩 구조를 가진 볼륨 컨트롤 시스템입니다:"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"Root"}),": volume state 관리 (0-100)"]}),e("li",{children:[e("strong",{children:"Depth 1 (VolumeDisplay)"}),": 숫자로 volume 표시"]}),e("li",{children:[e("strong",{children:"Depth 2 (VolumeBar)"}),": 프로그레스 바로 volume 표시"]}),e("li",{children:[e("strong",{children:"Depth 3 (VolumeEmoji)"}),": 이모지로 volume 표시 (🔇 🔈 🔉 🔊)"]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"코드 예제"}),e(l,{code:`import { mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

// Depth 3: 이모지로 볼륨 표시
const VolumeEmoji = mount<{ volume: number }>(() => ({ volume }) => {
  const getEmoji = (vol: number) => {
    if (vol === 0) return '🔇';
    if (vol < 30) return '🔈';
    if (vol < 70) return '🔉';
    return '🔊';
  };

  return <div>{getEmoji(volume)}</div>;
});

// Depth 2: 프로그레스 바로 볼륨 표시
const VolumeBar = mount<{ volume: number }>(() => ({ volume }) => {
  return (
    <div>
      <div class="progress-bar" style={{ width: \`\${volume}%\` }} />
      <VolumeEmoji volume={volume} />
    </div>
  );
});

// Depth 1: 숫자로 볼륨 표시
const VolumeDisplay = mount<{ volume: number }>(() => ({ volume }) => {
  return (
    <Fragment>
      <div class="volume-number">{volume}</div>
      <VolumeBar volume={volume} />
    </Fragment>
  );
});

// Root: 볼륨 상태 관리
const VolumeController = mount(renew => {
  const volume = state(50, renew);

  const increase = () => {
    if (volume.v < 100) volume.v += 10;
  };

  return () => (
    <div>
      <button onClick={increase}>+10</button>
      <VolumeDisplay volume={volume.v} />
    </div>
  );
});`,language:"tsx"}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"Props 전달 흐름"}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6",children:e("pre",{class:"text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre",children:`Root Component
  ├─ volume: state<number>
  │
  └─> VolumeDisplay (Depth 1)
       ├─ props: { volume: number }
       │
       └─> VolumeBar (Depth 2)
            ├─ props: { volume: number }
            │
            └─> VolumeEmoji (Depth 3)
                 └─ props: { volume: number }`})}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:["Root 컴포넌트에서"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"volume.v"}),"가 변경되면:"]}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6",children:[e("li",{children:"Root의 updater 함수가 실행되어 새로운 가상 DOM 생성"}),e("li",{children:"VolumeDisplay가 새로운 volume prop을 받아 업데이트"}),e("li",{children:"VolumeBar가 새로운 volume prop을 받아 업데이트"}),e("li",{children:"VolumeEmoji가 새로운 volume prop을 받아 동시에 업데이트"})]}),e("div",{class:"my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"🎯 핵심 개념"}),e("ul",{class:"text-sm text-purple-800 dark:text-purple-200 space-y-2",children:[e("li",{children:[e("strong",{children:"단방향 데이터 흐름:"})," Props는 항상 부모에서 자식으로만 흐릅니다."]}),e("li",{children:[e("strong",{children:"불변성:"})," Props는 자식 컴포넌트에서 직접 수정할 수 없습니다."]}),e("li",{children:[e("strong",{children:"자동 업데이트:"})," 부모의 state가 변경되면 props를 받는 모든 자식이 자동으로 업데이트됩니다."]}),e("li",{children:[e("strong",{children:"효율적인 렌더링:"})," Lithent는 변경된 부분만 효율적으로 업데이트합니다."]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실행 예제"}),e("div",{class:"my-8",children:e(So,{})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"테스트 시나리오"}),e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"1️⃣ 슬라이더로 테스트"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:"슬라이더를 움직여 volume 값을 변경"}),e("li",{children:"VolumeDisplay(숫자), VolumeBar(바), VolumeEmoji(이모지)가 모두 동시에 업데이트되는지 확인"}),e("li",{children:"값이 실시간으로 전파되는 것을 확인"})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"2️⃣ 버튼으로 테스트"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:"+/- 버튼을 클릭하여 10씩 증감"}),e("li",{children:"각 버튼 클릭마다 모든 컴포넌트가 업데이트되는지 확인"}),e("li",{children:"0과 100에서 버튼이 비활성화되는지 확인"})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"3️⃣ 이모지 변화 확인"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:"0: 🔇 (음소거)"}),e("li",{children:"1-29: 🔈 (낮은 볼륨)"}),e("li",{children:"30-69: 🔉 (중간 볼륨)"}),e("li",{children:"70-100: 🔊 (높은 볼륨)"})]})]}),e("div",{class:"my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2",children:"⚠️ 주의사항"}),e("ul",{class:"text-sm text-yellow-800 dark:text-yellow-200 space-y-2",children:[e("li",{children:"Props는 읽기 전용입니다. 자식 컴포넌트에서 props를 직접 수정하지 마세요."}),e("li",{children:"Props 변경은 부모 컴포넌트의 state나 변수를 통해서만 이루어져야 합니다."}),e("li",{children:"중첩이 깊을수록 성능에 영향을 줄 수 있으므로, 불필요한 중첩은 피하세요."}),e("li",{children:"Props drilling이 너무 깊어지면 Context API 사용을 고려하세요."})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실전 활용 사례"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"다단계 폼:"})," 회원가입이나 결제 과정에서 단계별로 데이터를 전달"]}),e("li",{children:[e("strong",{children:"대시보드:"})," 사용자 정보를 여러 위젯 컴포넌트에 전달"]}),e("li",{children:[e("strong",{children:"테마 시스템:"})," 테마 설정을 모든 UI 컴포넌트에 전파"]}),e("li",{children:[e("strong",{children:"권한 관리:"})," 사용자 권한을 기반으로 UI를 조건부 렌더링"]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"관련 예제"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/props",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/props"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Props 가이드"})," ","- Props 기본 사용법"]}),e("li",{children:[e("a",{href:"/guide/updater",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/updater"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Updater 가이드"})," ","- 컴포넌트 업데이트 메커니즘"]})]})]})),nr=v((t,{songs:r})=>{const a=P(0,t),n=()=>{a.v<r.length-1&&(a.v+=1)},o=()=>{a.v>0&&(a.v-=1)};return()=>e(L,{children:[e("div",{class:"p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 mb-2",children:[e("div",{class:"flex items-center justify-between mb-3",children:[e("span",{class:"text-sm font-semibold text-purple-700 dark:text-purple-300",children:"🎵 Current Playlist (가상 DOM)"}),e("span",{class:"text-xs text-purple-600 dark:text-purple-400",children:[a.v+1," / ",r.length]})]}),e("div",{class:"flex gap-2",children:[e("button",{onClick:o,disabled:a.v===0,class:"px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors text-sm",children:"⏮ Prev"}),e("button",{onClick:n,disabled:a.v===r.length-1,class:"px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors text-sm",children:"Next ⏭"})]})]}),r.map((s,d)=>e("div",{class:`p-3 rounded-lg border transition-all ${d===a.v?"bg-purple-100 dark:bg-purple-800/30 border-purple-400 dark:border-purple-500 scale-105":"bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60"}`,children:e("div",{class:"flex items-center gap-3",children:[e("div",{class:"text-3xl",children:s.emoji}),e("div",{class:"flex-1",children:[e("div",{class:"text-sm font-semibold text-gray-900 dark:text-white",children:s.title}),e("div",{class:"text-xs text-gray-600 dark:text-gray-400",children:s.artist})]}),d===a.v&&e("div",{class:"text-purple-500 animate-pulse",children:"▶"})]})},s.id))]})}),Eo=v(t=>{const r=V(null),a=V(null),n=P(!0,t);let o=null;const s=[{id:1,emoji:"🎸",title:"Rock Anthem",artist:"The Rockers"},{id:2,emoji:"🎹",title:"Jazz Night",artist:"Smooth Jazz Band"},{id:3,emoji:"🎤",title:"Pop Star",artist:"Chart Toppers"},{id:4,emoji:"🎻",title:"Classical Suite",artist:"Symphony Orchestra"}];te(()=>{r.value&&a.value&&(o=ce(e(nr,{songs:s}),r.value,a.value))});const d=()=>{o&&(o(),n.v=!1)},i=()=>{r.value&&a.value&&(o=ce(e(nr,{songs:s}),r.value,a.value),n.v=!0)};return()=>e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"mb-6",children:[e("h3",{class:"text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2",children:[e("span",{class:"text-2xl",children:"🎵"}),"Music Library Manager"]}),e("p",{class:"text-sm text-gray-600 dark:text-gray-400",children:"실제 DOM 요소 사이에 가상 DOM(loop)이 삽입되고, destroy 함수로 제거되는 것을 확인하세요"})]}),e("div",{class:"mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg",children:[e("div",{class:"flex gap-2",children:[e("button",{onClick:d,disabled:!n.v,class:"px-4 py-2 rounded bg-red-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-600 transition-colors text-sm font-semibold",children:"🗑️ Clear Playlist (destroy)"}),e("button",{onClick:i,disabled:n.v,class:"px-4 py-2 rounded bg-green-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-600 transition-colors text-sm font-semibold",children:"↻ Restore Playlist (render)"})]}),e("div",{class:"mt-2 text-xs text-gray-600 dark:text-gray-400",children:["Status:"," ",e("span",{class:n.v?"text-green-600 dark:text-green-400 font-semibold":"text-red-600 dark:text-red-400 font-semibold",children:n.v?"✓ Active":"✗ Destroyed"})]})]}),e("div",{ref:r,class:"bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-700 space-y-2",children:[e("div",{class:"p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700",children:e("div",{class:"flex items-center gap-3",children:[e("div",{class:"text-2xl",children:"🔔"}),e("div",{class:"flex-1",children:[e("div",{class:"text-sm font-semibold text-blue-900 dark:text-blue-100",children:"System Sounds (실제 DOM)"}),e("div",{class:"text-xs text-blue-700 dark:text-blue-300",children:"Cannot be removed"})]})]})}),e("div",{ref:a,class:"p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700",children:e("div",{class:"flex items-center gap-3",children:[e("div",{class:"text-2xl",children:"💾"}),e("div",{class:"flex-1",children:[e("div",{class:"text-sm font-semibold text-green-900 dark:text-green-100",children:"Downloaded Music (실제 DOM)"}),e("div",{class:"text-xs text-green-700 dark:text-green-300",children:"Permanent storage"})]})]})})]}),e("div",{class:"mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3",children:"💡 DOM 구조"}),e("div",{class:"text-xs font-mono text-blue-700 dark:text-blue-300 space-y-1",children:[e("div",{children:["<div ref=","{playlistContainer}",">"]}),e("div",{class:"ml-4",children:"<div>System Sounds (실제 DOM)</div>"}),e("div",{class:"ml-4 text-purple-600 dark:text-purple-400 font-semibold",children:n.v?"⬅ Current Playlist (가상 DOM - Loop with keys)":"⬅ (destroyed)"}),e("div",{class:"ml-4",children:["<div ref=","{insertionPoint}",">Downloaded Music (실제 DOM)</div>"]}),e("div",{children:"</div>"})]})]}),e("div",{class:"mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h4",{class:"text-sm font-semibold text-green-800 dark:text-green-200 mb-2",children:"🎯 테스트 요점"}),e("ul",{class:"text-xs text-green-700 dark:text-green-300 space-y-1",children:[e("li",{children:["• ",e("strong",{children:"insertBefore 모드"}),": 가상 DOM이 실제 DOM"," ",e("strong",{children:"사이"}),"에 삽입됩니다"]}),e("li",{children:["• ",e("strong",{children:"Loop with keys"}),": 4개의 곡이 key를 가진 리스트로 렌더링됩니다"]}),e("li",{children:["• ",e("strong",{children:"destroy 함수"}),': "Clear Playlist"로 가상 DOM만 제거하고 실제 DOM은 유지됩니다']}),e("li",{children:["• ",e("strong",{children:"재렌더링"}),': "Restore Playlist"로 같은 위치에 다시 렌더링할 수 있습니다']}),e("li",{children:"• Prev/Next 버튼으로 현재 재생 중인 곡을 변경하며 반응형 업데이트를 확인하세요"})]})]})]})}),Do=`<!-- 서버에서 렌더링된 초기 HTML (실제 DOM) -->
<div id="music-library">
  <!-- 상단: 실제 DOM -->
  <div>🔔 System Sounds (실제 DOM)</div>

  <!-- 중간: 여기 사이에 가상 DOM 플레이리스트가 삽입됩니다 -->

  <!-- 하단: 실제 DOM (삽입 기준점) -->
  <div id="downloaded-music">💾 Downloaded Music (실제 DOM)</div>
</div>`,Po=`import { Fragment, render } from 'lithent';
import { state } from 'lithent/helper';

interface Song {
  id: number;
  emoji: string;
  title: string;
  artist: string;
}

// 동적 플레이리스트 컴포넌트 (가상 DOM)
const DynamicPlaylist = mount<{ songs: Song[] }>((renew, { songs }) => {
  const currentIndex = state(0, renew);

  const playNext = () => {
    if (currentIndex.v < songs.length - 1) currentIndex.v += 1;
  };

  const playPrev = () => {
    if (currentIndex.v > 0) currentIndex.v -= 1;
  };

  return () => (
    <Fragment>
      <div>Current Playlist (가상 DOM)</div>
      <button onClick={playPrev} disabled={currentIndex.v === 0}>
        ⏮ Prev
      </button>
      <button
        onClick={playNext}
        disabled={currentIndex.v === songs.length - 1}
      >
        Next ⏭
      </button>

      {songs.map((song, idx) => (
        <div key={song.id}>
          #{idx + 1} {song.emoji} {song.title} – {song.artist}
        </div>
      ))}
    </Fragment>
  );
});

// 기존 실제 DOM 사이에 가상 DOM(loop)을 삽입하고 destroy로 제거
const playlist: Song[] = [
  { id: 1, emoji: '🎸', title: 'Rock Anthem', artist: 'The Rockers' },
  { id: 2, emoji: '🎹', title: 'Jazz Night', artist: 'Smooth Jazz Band' },
  { id: 3, emoji: '🎤', title: 'Pop Star', artist: 'Chart Toppers' },
  { id: 4, emoji: '🎻', title: 'Classical Suite', artist: 'Symphony Orchestra' },
];

const container = document.getElementById('music-library');
const insertionPoint = document.getElementById('downloaded-music');

let destroyPlaylist: (() => void) | null = null;

if (container && insertionPoint) {
  destroyPlaylist = render(
    <DynamicPlaylist songs={playlist} />,
    container,
    insertionPoint as HTMLElement
  );
}

// 나중에 필요하면 destroyPlaylist?.() 로 가상 DOM만 제거`,Io=v(()=>()=>e("div",{children:[e("h1",{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4",children:"Example 16: insertBefore + Loop + Destroy (Music Library Manager)"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-6",children:"이 예제는 실제 DOM 요소들 사이에 가상 DOM(loop 포함)이 삽입되고, destroy 함수로 제거될 수 있는지를 테스트합니다. 음악 라이브러리 관리자를 통해 insertBefore 모드, keyed list 렌더링, 그리고 destroy 기능을 모두 확인할 수 있습니다."}),e("div",{class:"my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"💡 테스트 요점"}),e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:[e("strong",{children:"insertBefore + Loop + Destroy"}),": render() 함수의 세 번째 인자를 사용해 가상 DOM을 실제 DOM 사이에 삽입하고, 반환된 destroy 함수로 가상 DOM만 선택적으로 제거할 수 있습니다. 이 예제는 loop 렌더링(key 사용)과 destroy 기능이 함께 작동하는 것을 보여줍니다."]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"컴포넌트 구조"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:"이 예제는 다음과 같은 순서로 구성되어 있습니다:"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"Title과 설명"}),": 예제 제목과 간단한 설명"]}),e("li",{children:[e("strong",{children:"컨트롤 패널"}),": Clear Playlist/Restore Playlist 버튼과 상태 표시 (playlistContainer 밖에 위치)"]}),e("li",{children:[e("strong",{children:"Music Library Container (playlistContainer)"}),":",e("ul",{class:"list-disc list-inside ml-6 mt-2 space-y-1",children:[e("li",{children:[e("strong",{children:"System Sounds (실제 DOM - 상단)"}),": 서버에서 렌더링되었거나 정적으로 존재하는 콘텐츠"]}),e("li",{children:[e("strong",{children:"Current Playlist (가상 DOM - 중간)"}),": mountCallback에서 render()로 삽입되는 동적 플레이리스트 (4개 곡, key 사용)"]}),e("li",{children:[e("strong",{children:"Downloaded Music (실제 DOM - 하단, insertionPoint)"}),": 가상 DOM이 이 요소 앞에 삽입되는 기준점"]})]})]}),e("li",{children:[e("strong",{children:"DOM 구조 설명"}),": 실시간으로 DOM 상태를 보여주는 다이어그램"]}),e("li",{children:[e("strong",{children:"테스트 요점"}),": 예제의 핵심 개념 설명"]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"코드 예제"}),e("h3",{class:"text-xl font-semibold text-gray-900 dark:text-white mb-3",children:"1. 서버에서 내려온 초기 HTML (실제 DOM)"}),e(l,{language:"html",code:Do}),e("h3",{class:"text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3",children:"2. 클라이언트에서 실행되는 Lithent 코드 (가상 DOM)"}),e(l,{language:"tsx",code:Po}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"render() 함수의 insertBefore 모드"}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6",children:e("pre",{class:"text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre",children:`const destroyFn = render(
  <Component />,
  parentElement,      // 부모 요소
  beforeElement       // 이 요소 앞에 삽입 (insertBefore)
);

// 나중에 가상 DOM 제거
destroyFn();`})}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:"render() 함수의 세 가지 사용 방법:"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6",children:[e("li",{children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"render(<C />, parent)"})," ","- 부모의 끝에 추가"]}),e("li",{children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"render(<C />, parent, next)"})," ","- next 요소 앞에 삽입"]}),e("li",{children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"const destroy = render(...)"})," ","- destroy 함수로 나중에 제거 가능"]})]}),e("div",{class:"my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"🎯 핵심 개념"}),e("ul",{class:"text-sm text-purple-800 dark:text-purple-200 space-y-2",children:[e("li",{children:[e("strong",{children:"insertBefore 모드:"})," render() 함수의 세 번째 인자로 삽입 위치를 정확하게 지정할 수 있습니다."]}),e("li",{children:[e("strong",{children:"Loop with keys:"})," map()으로 렌더링할 때 key를 지정하면 Lithent가 요소를 효율적으로 추적합니다."]}),e("li",{children:[e("strong",{children:"destroy 함수:"})," render()가 반환하는 함수를 호출하면 해당 가상 DOM만 제거되고 실제 DOM은 영향받지 않습니다."]}),e("li",{children:[e("strong",{children:"재렌더링:"})," destroy 후에도 같은 위치에 다시 render()를 호출할 수 있습니다."]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실행 예제"}),e("div",{class:"my-8",children:e(Eo,{})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"테스트 시나리오"}),e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"1️⃣ 플레이리스트 네비게이션"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:"Prev/Next 버튼으로 현재 재생 곡을 변경"}),e("li",{children:"현재 재생 중인 곡이 시각적으로 강조(scale-105, 색상 변경)되는지 확인"}),e("li",{children:"첫 곡에서 Prev 버튼, 마지막 곡에서 Next 버튼이 비활성화되는지 확인"})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"2️⃣ Destroy 기능 테스트"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:'"Clear Playlist" 버튼 클릭'}),e("li",{children:"플레이리스트(가상 DOM)만 사라지고 System Sounds와 Downloaded Music(실제 DOM)은 그대로인지 확인"}),e("li",{children:'Status가 "✗ Destroyed"로 변경되는지 확인'}),e("li",{children:'DOM 구조 섹션에서 "(destroyed)" 표시가 나타나는지 확인'})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"3️⃣ 재렌더링 테스트"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:'"Restore Playlist" 버튼 클릭'}),e("li",{children:"플레이리스트가 정확히 같은 위치(실제 DOM 사이)에 다시 나타나는지 확인"}),e("li",{children:'Status가 "✓ Active"로 변경되는지 확인'}),e("li",{children:"Prev/Next 버튼이 다시 작동하는지 확인 (상태가 초기화됨)"})]})]}),e("div",{class:"my-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-green-900 dark:text-green-100 mb-2",children:"🌟 실전 활용 사례"}),e("p",{class:"text-sm text-green-700 dark:text-green-300 mb-2",children:"이 패턴은 다음과 같은 실제 시나리오에서 매우 유용합니다:"}),e("ul",{class:"text-sm text-green-700 dark:text-green-300 space-y-1 ml-4",children:[e("li",{children:["• ",e("strong",{children:"필터링 가능한 리스트"}),": 고정 헤더/푸터 사이에 동적 필터링되는 아이템 리스트"]}),e("li",{children:["• ",e("strong",{children:"모달/오버레이"}),": 페이지의 특정 위치에 동적 콘텐츠를 삽입하고 제거"]}),e("li",{children:["• ",e("strong",{children:"Progressive Enhancement"}),": 서버 렌더링된 페이지에 클라이언트 측 인터랙티브 요소 추가"]}),e("li",{children:["• ",e("strong",{children:"위젯 시스템"}),": 기존 페이지의 특정 위치에 동적 위젯 삽입/제거"]}),e("li",{children:["• ",e("strong",{children:"A/B 테스팅"}),": 페이지의 특정 섹션만 동적으로 교체"]})]})]}),e("div",{class:"my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2",children:"⚠️ 주의사항"}),e("ul",{class:"text-sm text-yellow-800 dark:text-yellow-200 space-y-2",children:[e("li",{children:[e("strong",{children:"insertBefore 요소 확인:"})," 세 번째 인자(beforeElement)는 반드시 두 번째 인자(parentElement)의 자식이어야 합니다."]}),e("li",{children:[e("strong",{children:"ref 타이밍:"})," ref 값은 mountCallback() 이후에만 사용 가능합니다."]}),e("li",{children:[e("strong",{children:"destroy 함수 저장:"})," destroy 함수를 변수에 저장하지 않으면 나중에 제거할 수 없습니다."]}),e("li",{children:[e("strong",{children:"key 사용:"})," loop 렌더링 시 key를 사용하면 Lithent가 요소를 효율적으로 추적하고 업데이트합니다."]}),e("li",{children:[e("strong",{children:"실제 DOM 수정 금지:"})," 실제 DOM 요소를 직접 수정하면 Lithent의 가상 DOM 추적에서 벗어날 수 있습니다."]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"관련 예제"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("a",{href:"/examples/12",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/examples/12"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Example 12: Mixed DOM Elements"})," ","- 실제 DOM과 가상 DOM 혼합"]}),e("li",{children:[e("a",{href:"/examples/13",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/examples/13"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Example 13: Mixed DOM + Loop"})," ","- 실제 DOM과 가상 DOM(loop) 혼합"]}),e("li",{children:[e("a",{href:"/guide/render",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/render"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Render 가이드"})," ","- render() 함수 사용법"]}),e("li",{children:[e("a",{href:"/guide/mount-hooks",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/mount-hooks"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Mount Hooks 가이드"})," ","- mountCallback 사용법"]})]})]})),Oo=v(t=>{const r=P("red",t),a=P(!1,t);let n=null;const o=["red","yellow","green"],s=()=>{const x=(o.indexOf(r.v)+1)%o.length;r.v=o[x]},d=()=>{a.v=!a.v,a.v?n=window.setInterval(()=>{s()},2e3):n&&(clearInterval(n),n=null)},i=m=>r.v===m?1:.2,c=m=>{switch(m){case"red":return"#EF4444";case"yellow":return"#FBBF24";case"green":return"#10B981"}},h=m=>{switch(m){case"red":return"🔴 Stop";case"yellow":return"🟡 Ready";case"green":return"🟢 Go"}};return()=>e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"mb-6",children:[e("h3",{class:"text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2",children:[e("span",{class:"text-2xl",children:"🚦"}),"Traffic Light Controller"]}),e("p",{class:"text-sm text-gray-600 dark:text-gray-400",children:"SVG 요소(circle, rect, text)를 사용한 인터랙티브 신호등 예제입니다"})]}),e("div",{class:"mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg",children:[e("div",{class:"flex gap-3 mb-3",children:[e("button",{onClick:s,disabled:a.v,class:"px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm font-semibold",children:"⏭ Next Light"}),e("button",{onClick:d,class:`px-4 py-2 rounded text-white transition-colors text-sm font-semibold ${a.v?"bg-red-500 hover:bg-red-600":"bg-green-500 hover:bg-green-600"}`,children:a.v?"⏸ Stop Auto":"▶ Auto Mode"})]}),e("div",{class:"text-sm text-gray-600 dark:text-gray-400",children:["Current Status:"," ",e("span",{class:"font-semibold text-gray-900 dark:text-white",children:h(r.v)}),a.v&&e("span",{class:"ml-2 text-xs text-blue-600 dark:text-blue-400",children:"(Auto switching every 2 seconds)"})]})]}),e("div",{class:"flex justify-center mb-6",children:e("div",{class:"p-8 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl",children:e("svg",{width:"200",height:"400",viewBox:"0 0 200 400",xmlns:"http://www.w3.org/2000/svg",children:[e("rect",{x:"25",y:"25",width:"150",height:"350",rx:"20",fill:"#1F2937",stroke:"#374151","stroke-width":"3"}),e("circle",{cx:"100",cy:"85",r:"40",fill:c("red"),opacity:i("red"),class:"transition-opacity duration-300"}),r.v==="red"&&e("circle",{cx:"100",cy:"85",r:"45",fill:"none",stroke:c("red"),"stroke-width":"3",opacity:"0.5",class:"animate-pulse"}),e("circle",{cx:"100",cy:"200",r:"40",fill:c("yellow"),opacity:i("yellow"),class:"transition-opacity duration-300"}),r.v==="yellow"&&e("circle",{cx:"100",cy:"200",r:"45",fill:"none",stroke:c("yellow"),"stroke-width":"3",opacity:"0.5",class:"animate-pulse"}),e("circle",{cx:"100",cy:"315",r:"40",fill:c("green"),opacity:i("green"),class:"transition-opacity duration-300"}),r.v==="green"&&e("circle",{cx:"100",cy:"315",r:"45",fill:"none",stroke:c("green"),"stroke-width":"3",opacity:"0.5",class:"animate-pulse"})]})})}),e("div",{class:"mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3",children:"💡 사용된 SVG 요소"}),e("div",{class:"text-xs text-blue-700 dark:text-blue-300 space-y-2",children:[e("div",{class:"flex items-start gap-2",children:[e("code",{class:"px-2 py-0.5 bg-red-200 dark:bg-red-800 rounded font-mono",children:"xmlns"}),e("span",{children:[e("strong",{class:"text-red-700 dark:text-red-300",children:'xmlns="http://www.w3.org/2000/svg"'})," ","- SVG 네임스페이스 선언 (필수!)"]})]}),e("div",{class:"flex items-start gap-2",children:[e("code",{class:"px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono",children:"<rect>"}),e("span",{children:"신호등 외곽 박스 (width, height, rx for rounded corners)"})]}),e("div",{class:"flex items-start gap-2",children:[e("code",{class:"px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono",children:"<circle>"}),e("span",{children:"3개의 신호등 (cx, cy for position, r for radius, fill, opacity)"})]}),e("div",{class:"flex items-start gap-2",children:[e("code",{class:"px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono",children:"opacity"}),e("span",{children:["현재 신호: ",r.v==="red"&&"빨강(1.0)",r.v==="yellow"&&"노랑(1.0)",r.v==="green"&&"초록(1.0)",", 나머지: 0.2"]})]}),e("div",{class:"flex items-start gap-2",children:[e("code",{class:"px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono",children:"stroke"}),e("span",{children:"켜진 신호에 외곽선 효과 (animate-pulse로 깜빡임)"})]})]})]}),e("div",{class:"mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",children:[e("h4",{class:"text-sm font-semibold text-green-800 dark:text-green-200 mb-2",children:"🎯 테스트 요점"}),e("ul",{class:"text-xs text-green-700 dark:text-green-300 space-y-1",children:[e("li",{children:["• ",e("strong",{children:"SVG 렌더링"}),": Lithent가 SVG 요소를 정확히 렌더링하는지 확인"]}),e("li",{children:["• ",e("strong",{children:"동적 속성"}),": opacity, fill, stroke 등의 SVG 속성이 반응형으로 업데이트됨"]}),e("li",{children:["• ",e("strong",{children:"조건부 렌더링"}),": 켜진 신호에만 외곽 원(glow 효과)이 표시됨"]}),e("li",{children:["• ",e("strong",{children:"CSS transition"}),": SVG 요소에 Tailwind CSS 클래스 적용 가능"]}),e("li",{children:["• ",e("strong",{children:"Auto Mode"}),": setInterval로 자동 전환, clearInterval로 정리"]})]})]}),e("div",{class:"mt-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",children:[e("h4",{class:"text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2",children:"🚦 신호등 작동 방식"}),e("ol",{class:"text-xs text-purple-700 dark:text-purple-300 space-y-1 list-decimal list-inside",children:[e("li",{children:[e("strong",{children:"빨간불 (🔴 Stop)"}),": 정지 - 차량 멈춤"]}),e("li",{children:[e("strong",{children:"노란불 (🟡 Ready)"}),": 준비 - 출발 준비"]}),e("li",{children:[e("strong",{children:"초록불 (🟢 Go)"}),": 출발 - 차량 통과"]}),e("li",{children:"순환: 빨강 → 노랑 → 초록 → 빨강 (무한 반복)"})]})]})]})}),Lo=v(()=>()=>e("div",{children:[e("h1",{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4",children:"Example 17: SVG Rendering (Traffic Light)"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-6",children:"이 예제는 Lithent가 SVG 요소를 정확하게 렌더링하고, SVG 속성(fill, opacity, stroke 등)을 반응형으로 업데이트할 수 있는지를 테스트합니다. 신호등을 통해 SVG의 다양한 기능을 확인할 수 있습니다."}),e("div",{class:"my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"💡 테스트 요점"}),e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:[e("strong",{children:"SVG Rendering"}),": Lithent가 SVG 요소(rect, circle)를 정확히 렌더링하고, 동적 속성 변경(opacity, fill, stroke)이 반응형으로 업데이트되는지 확인합니다. 또한 SVG 요소에 조건부 렌더링과 CSS 클래스를 적용할 수 있는지 테스트합니다."]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"컴포넌트 구조"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:"이 예제는 다음과 같은 요소로 구성되어 있습니다:"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"컨트롤 패널"}),": Next Light 버튼과 Auto Mode 토글"]}),e("li",{children:[e("strong",{children:"신호등 SVG"}),":",e("ul",{class:"list-disc list-inside ml-6 mt-2 space-y-1",children:[e("li",{children:"외곽 박스 (rect 요소)"}),e("li",{children:"빨간불 (circle, cy=85)"}),e("li",{children:"노란불 (circle, cy=200)"}),e("li",{children:"초록불 (circle, cy=315)"}),e("li",{children:"켜진 신호의 glow 효과 (조건부 렌더링된 circle with stroke)"})]})]}),e("li",{children:[e("strong",{children:"현재 상태 표시"}),": 실시간으로 켜진 신호 정보 표시"]}),e("li",{children:[e("strong",{children:"사용된 SVG 요소 설명"}),": 각 SVG 요소와 속성 설명"]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"코드 예제"}),e(l,{code:`import { mount } from 'lithent';
import { state } from 'lithent/helper';

type LightState = 'red' | 'yellow' | 'green';

const TrafficLight = mount(renew => {
  const currentLight = state<LightState>('red', renew);
  const autoMode = state(false, renew);
  let autoInterval: number | null = null;

  const lightSequence: LightState[] = ['red', 'yellow', 'green'];

  const nextLight = () => {
    const currentIndex = lightSequence.indexOf(currentLight.v);
    const nextIndex = (currentIndex + 1) % lightSequence.length;
    currentLight.v = lightSequence[nextIndex];
  };

  const toggleAutoMode = () => {
    autoMode.v = !autoMode.v;

    if (autoMode.v) {
      autoInterval = window.setInterval(() => {
        nextLight();
      }, 2000);
    } else if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }
  };

  const getLightOpacity = (light: LightState) => {
    return currentLight.v === light ? 1 : 0.2;
  };

  return () => (
    <div>
      {/* 컨트롤 패널 */}
      <button onClick={nextLight} disabled={autoMode.v}>
        Next Light
      </button>
      <button onClick={toggleAutoMode}>
        {autoMode.v ? 'Stop Auto' : 'Auto Mode'}
      </button>

      {/* 신호등 SVG */}
      <svg
        width="200"
        height="400"
        viewBox="0 0 200 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 외곽 박스 */}
        <rect
          x="25"
          y="25"
          width="150"
          height="350"
          rx="20"
          fill="#1F2937"
        />

        {/* 빨간불 */}
        <circle
          cx="100"
          cy="85"
          r="40"
          fill="#EF4444"
          opacity={getLightOpacity('red')}
        />
        {currentLight.v === 'red' && (
          <circle
            cx="100"
            cy="85"
            r="45"
            fill="none"
            stroke="#EF4444"
            stroke-width="3"
            opacity="0.5"
            class="animate-pulse"
          />
        )}

        {/* 노란불 */}
        <circle
          cx="100"
          cy="200"
          r="40"
          fill="#FBBF24"
          opacity={getLightOpacity('yellow')}
        />

        {/* 초록불 */}
        <circle
          cx="100"
          cy="315"
          r="40"
          fill="#10B981"
          opacity={getLightOpacity('green')}
        />
      </svg>
    </div>
  );
});`,language:"tsx"}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"SVG 요소와 속성"}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6",children:[e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"사용된 SVG 요소"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("code",{class:"px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"<svg>"}),": SVG 컨테이너 (width, height, viewBox, ",e("strong",{children:"xmlns"})," 속성)",e("div",{class:"ml-6 mt-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded",children:[e("strong",{class:"text-red-700 dark:text-red-300",children:"⚠️ 중요:"})," ",e("code",{class:"px-1 py-0.5 bg-red-100 dark:bg-red-900 rounded text-xs",children:'xmlns="http://www.w3.org/2000/svg"'})," ","속성이 ",e("strong",{children:"반드시 필요합니다"}),". 이 속성이 없으면 브라우저가 SVG를 올바르게 렌더링하지 못합니다."]})]}),e("li",{children:[e("code",{class:"px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"<rect>"}),": 사각형 요소 (x, y, width, height, rx for rounded corners)"]}),e("li",{children:[e("code",{class:"px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"<circle>"}),": 원 요소 (cx, cy for center position, r for radius)"]})]}),e("h3",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3 mt-4",children:"동적으로 업데이트되는 속성"}),e("ul",{class:"list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("code",{class:"px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"opacity"}),": 현재 켜진 신호는 1.0, 나머지는 0.2"]}),e("li",{children:[e("code",{class:"px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"fill"}),": 요소의 채우기 색상 (빨강: #EF4444, 노랑: #FBBF24, 초록: #10B981)"]}),e("li",{children:[e("code",{class:"px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"stroke"}),": 외곽선 색상 (glow 효과용)"]}),e("li",{children:[e("code",{class:"px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs",children:"stroke-width"}),": 외곽선 두께"]})]})]}),e("div",{class:"my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"🎯 핵심 개념"}),e("ul",{class:"text-sm text-purple-800 dark:text-purple-200 space-y-2",children:[e("li",{children:[e("strong",{children:"SVG in JSX:"})," Lithent는 SVG 요소를 JSX 문법으로 자연스럽게 작성할 수 있습니다."]}),e("li",{children:[e("strong",{children:"반응형 SVG 속성:"})," opacity, fill, stroke 등의 속성이 state 변경에 따라 자동으로 업데이트됩니다."]}),e("li",{children:[e("strong",{children:"조건부 SVG 렌더링:"})," 켜진 신호에만 glow 효과(외곽 circle)가 조건부로 렌더링됩니다."]}),e("li",{children:[e("strong",{children:"CSS 클래스 적용:"})," SVG 요소에 Tailwind CSS 클래스 (animate-pulse, transition-opacity)를 적용할 수 있습니다."]}),e("li",{children:[e("strong",{children:"타이머 관리:"})," setInterval로 자동 모드를 구현하고, 컴포넌트 상태에 따라 clearInterval로 정리합니다."]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실행 예제"}),e("div",{class:"my-8",children:e(Oo,{})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"테스트 시나리오"}),e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"1️⃣ 수동 신호 전환"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:'"Next Light" 버튼을 클릭하여 신호 전환'}),e("li",{children:"신호가 빨강 → 노랑 → 초록 → 빨강 순서로 순환하는지 확인"}),e("li",{children:"현재 켜진 신호만 밝게 표시되고 나머지는 어둡게 표시되는지 확인"}),e("li",{children:"켜진 신호에 외곽선 glow 효과(animate-pulse)가 나타나는지 확인"})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"2️⃣ 자동 모드 테스트"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4",children:[e("li",{children:'"Auto Mode" 버튼 클릭'}),e("li",{children:"2초마다 자동으로 신호가 전환되는지 확인"}),e("li",{children:'"Next Light" 버튼이 비활성화되는지 확인'}),e("li",{children:'"Stop Auto" 버튼을 눌러 자동 모드를 종료하는지 확인'})]}),e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"3️⃣ SVG 렌더링 확인"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2",children:[e("li",{children:"신호등의 외곽 박스(rect)가 둥근 모서리로 표시되는지 확인"}),e("li",{children:"3개의 원(circle)이 정확한 위치에 렌더링되는지 확인"}),e("li",{children:"opacity 전환 시 부드러운 transition 효과가 적용되는지 확인"}),e("li",{children:"브라우저 개발자 도구로 SVG 요소가 올바른 속성값을 가지는지 확인"})]})]}),e("div",{class:"my-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-green-900 dark:text-green-100 mb-2",children:"🌟 실전 활용 사례"}),e("p",{class:"text-sm text-green-700 dark:text-green-300 mb-2",children:"SVG를 사용한 동적 UI 요소는 다음과 같은 경우에 유용합니다:"}),e("ul",{class:"text-sm text-green-700 dark:text-green-300 space-y-1 ml-4",children:[e("li",{children:["• ",e("strong",{children:"아이콘 시스템"}),": 상태에 따라 색상과 스타일이 변하는 동적 아이콘"]}),e("li",{children:["• ",e("strong",{children:"데이터 시각화"}),": 실시간으로 업데이트되는 차트와 그래프"]}),e("li",{children:["• ",e("strong",{children:"애니메이션"}),": CSS transition과 결합한 부드러운 SVG 애니메이션"]}),e("li",{children:["• ",e("strong",{children:"UI 컴포넌트"}),": 프로그레스 바, 로딩 스피너, 상태 표시기 등"]}),e("li",{children:["• ",e("strong",{children:"인터랙티브 다이어그램"}),": 클릭/호버 시 변하는 다이어그램이나 플로우차트"]})]})]}),e("div",{class:"my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2",children:"⚠️ 주의사항"}),e("ul",{class:"text-sm text-yellow-800 dark:text-yellow-200 space-y-2",children:[e("li",{children:[e("strong",{class:"text-red-700 dark:text-red-300",children:"xmlns 속성 필수:"})," ",e("code",{class:"px-1.5 py-0.5 bg-yellow-200 dark:bg-yellow-900 rounded text-xs font-mono",children:'xmlns="http://www.w3.org/2000/svg"'})," ","속성이 반드시 있어야 SVG가 올바르게 렌더링됩니다. 이 속성이 없으면 브라우저가 SVG 요소를 일반 HTML 요소로 인식하여 제대로 표시되지 않습니다."]}),e("li",{children:[e("strong",{children:"속성 이름:"})," SVG 속성은 kebab-case를 사용합니다 (stroke-width, fill-rule 등)"]}),e("li",{children:[e("strong",{children:"타이머 정리:"})," setInterval을 사용할 때는 컴포넌트 언마운트 시 clearInterval로 정리해야 메모리 누수를 방지할 수 있습니다"]}),e("li",{children:[e("strong",{children:"viewBox:"})," viewBox를 사용하면 SVG가 반응형으로 스케일됩니다"]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"관련 가이드"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/state",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"State 가이드"})," ","- 반응형 상태 관리"]}),e("li",{children:[e("a",{href:"/guide/updater",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/updater"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Updater 가이드"})," ","- 컴포넌트 업데이트 메커니즘"]})]})]})),lr=[{id:1,name:"Laptop Pro",price:1200,emoji:"💻"},{id:2,name:"Wireless Mouse",price:30,emoji:"🖱️"},{id:3,name:"Keyboard",price:80,emoji:"⌨️"},{id:4,name:"Monitor",price:300,emoji:"🖥️"},{id:5,name:"Headphones",price:150,emoji:"🎧"},{id:6,name:"USB Cable",price:10,emoji:"🔌"}],Ro=v(t=>{const r=P(500,t),a=P("name",t);let n=0,o=0;const s=vn(()=>[r.v],()=>{o+=1;const h=lr.filter(m=>m.price<=r.v);return e("div",{class:"p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700",children:[e("div",{class:"mb-3 flex items-center justify-between",children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white",children:"📦 Product List"}),e("div",{class:"flex flex-col items-end gap-1 text-xs",children:e("span",{class:"px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-purple-700 dark:text-purple-300 font-semibold",children:["ProductList 렌더링: ",o,"회"]})})]}),e("div",{class:"space-y-2",children:h.length>0?h.map(m=>e("div",{class:"flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded",children:e("div",{class:"flex items-center gap-3",children:[e("span",{class:"text-2xl",children:m.emoji}),e("div",{children:[e("div",{class:"text-sm font-semibold text-gray-900 dark:text-white",children:m.name}),e("div",{class:"text-xs text-gray-600 dark:text-gray-400",children:["$",m.price]})]})]})},m.id)):e("div",{class:"text-sm text-gray-500 dark:text-gray-400 text-center py-4",children:"No products found in this price range"})}),e("div",{class:"mt-3 text-xs text-gray-500 dark:text-gray-400",children:["Showing ",h.length," of ",lr.length," products"]})]})}),d=h=>{r.v=h},i=h=>{a.v=h},c=()=>a.v==="price-low"?"Price: Low":a.v==="price-high"?"Price: High":"Name";return()=>{n+=1;const h=e(s,{});return e("div",{class:"w-full max-w-2xl mx-auto",children:[e("div",{class:"mb-6",children:[e("h3",{class:"text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2",children:[e("span",{class:"text-2xl",children:"🛍️"}),"Product Filter Dashboard"]}),e("p",{class:"text-sm text-gray-600 dark:text-gray-400",children:["cacheUpdate를 사용해 ",e("strong",{children:"가격 범위"}),"가 바뀔 때만 상품 리스트를 다시 렌더링합니다. 정렬 보기 모드는 Root UI만 다시 그려지고 리스트는 그대로 유지됩니다."]})]}),e("div",{class:"mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg",children:[e("div",{class:"text-xs text-gray-600 dark:text-gray-400 mb-2",children:"렌더링 카운터:"}),e("div",{class:"flex gap-3 flex-wrap",children:[e("span",{class:"px-3 py-1 bg-green-100 dark:bg-green-900 rounded text-green-700 dark:text-green-300 text-sm font-semibold",children:["Root 렌더링: ",n,"회"]}),e("span",{class:"px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded text-purple-700 dark:text-purple-300 text-sm font-semibold",children:["ProductList 렌더링: ",o,"회"]})]})]}),e("div",{class:"mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4",children:[e("div",{children:[e("div",{class:"flex items-center justify-between mb-2",children:[e("label",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300",children:"💰 Price Range (추적됨)"}),e("span",{class:"text-sm font-bold text-blue-600 dark:text-blue-400",children:["$",r.v]})]}),e("input",{type:"range",min:"0",max:"1500",value:r.v,onInput:m=>d(Number(m.target.value)),class:"w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg cursor-pointer"}),e("div",{class:"flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1",children:[e("span",{children:"$0"}),e("span",{children:"$1500"})]}),e("div",{class:"mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300",children:["✓ 이 값이 변경되면 ",e("strong",{children:"ProductList"}),"가 리렌더링됩니다"]})]}),e("div",{children:[e("label",{class:"text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block",children:"🔀 Sort View (UI 전용)"}),e("div",{class:"flex gap-2 flex-wrap",children:[e("button",{onClick:()=>i("name"),class:`px-3 py-2 rounded text-sm font-semibold transition-colors ${a.v==="name"?"bg-blue-500 text-white":"bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`,children:"Name"}),e("button",{onClick:()=>i("price-low"),class:`px-3 py-2 rounded text-sm font-semibold transition-colors ${a.v==="price-low"?"bg-blue-500 text-white":"bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`,children:"Price: Low"}),e("button",{onClick:()=>i("price-high"),class:`px-3 py-2 rounded text-sm font-semibold transition-colors ${a.v==="price-high"?"bg-blue-500 text-white":"bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`,children:"Price: High"})]}),e("div",{class:"mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300",children:["⚠️ 이 값은 ",e("strong",{children:"UI 표시용"}),' 상태입니다. 버튼 스타일과 "현재 보기" 텍스트만 바뀌고 ProductList는 다시 렌더링되지 않습니다.']}),e("div",{class:"mt-1 text-xs text-gray-600 dark:text-gray-400",children:["현재 보기: ",e("strong",{children:c()})]})]})]}),h,e("div",{class:"mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3",children:"💡 cacheUpdate 동작 방식"}),e("div",{class:"text-xs text-blue-700 dark:text-blue-300 space-y-2",children:[e("div",{children:e("code",{class:"px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono",children:"cacheUpdate(() => [priceRange.v], () => updater)"})}),e("div",{children:"첫 번째 인자의 배열 값들을 이전 렌더링과 비교하여, 변경되지 않으면 두 번째 인자(updater)의 실행을 스킵합니다."}),e("div",{class:"pt-2 border-t border-blue-200 dark:border-blue-700",children:[e("strong",{children:"이 예제에서:"}),e("ul",{class:"list-disc list-inside ml-2 mt-1 space-y-1",children:[e("li",{children:"priceRange 변경 → ProductList 렌더링 카운터 증가 ✓"}),e("li",{children:"sortOption 변경 → Root 렌더링만 증가, ProductList는 그대로 ✗"})]})]})]})]})]})}}),Ao=v(()=>()=>e("div",{class:"prose dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4",children:"Example 18: CacheUpdate (Product Filter Dashboard)"}),e("p",{class:"text-gray-600 dark:text-gray-400 mb-8",children:["이 예제는 ",e("code",{children:"cacheUpdate"})," helper 함수를 사용한 선택적 리렌더링 최적화를 보여줍니다. React의 ",e("code",{children:"memo"}),"처럼 의존성 배열의 값이 변경될 때만 특정 컴포넌트를 다시 그립니다."]}),e("div",{class:"my-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800",children:[e("h2",{class:"text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4",children:"🎯 테스트 포커스"}),e("ul",{class:"space-y-2 text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"cacheUpdate 동작"}),": 첫 번째 인자의 의존성 배열이 변경되지 않으면 두 번째 인자(updater)의 실행을 스킵합니다"]}),e("li",{children:[e("strong",{children:"선택적 리렌더링"}),": 가격 슬라이더처럼 비싼 연산이 필요한 부분만 추적하고, 나머지 UI 상태는 무시하여 성능을 최적화합니다"]}),e("li",{children:[e("strong",{children:"렌더링 카운터"}),": Root와 ProductList의 렌더링 횟수를 시각적으로 표시하여 최적화 효과를 확인합니다"]}),e("li",{children:[e("strong",{children:"React.memo 유사"}),": React의 memo와 비슷한 최적화 패턴입니다"]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"컴포넌트 구조"}),e("ol",{class:"list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"Root Component (Example18)"}),": 두 개의 state를 관리합니다",e("ul",{class:"list-disc list-inside ml-6 mt-2 space-y-1",children:[e("li",{children:[e("code",{children:"priceRange"}),": 가격 범위 (추적됨 - cacheUpdate 의존성 배열에 포함)"]}),e("li",{children:[e("code",{children:"sortOption"}),": 정렬 보기 모드 (UI 전용 상태, 의존성 배열에는 포함되지 않음)"]})]})]}),e("li",{children:[e("strong",{children:"CachedProductList Tag"}),": ",e("code",{children:"cacheUpdate"}),"로 감싼 TagFunction으로, 가격 범위가 변경될 때만 내부 상품 리스트를 다시 렌더링합니다"]}),e("li",{children:[e("strong",{children:"렌더링 카운터"}),": Root와 ProductList의 렌더링 횟수를 각각 표시합니다"]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"코드 예제"}),e(l,{language:"typescript",code:`import { mount } from 'lithent';
import { state, cacheUpdate } from 'lithent/helper';

interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

const products: Product[] = [
  { id: 1, name: 'Laptop Pro', price: 1200, emoji: '💻' },
  { id: 2, name: 'Wireless Mouse', price: 30, emoji: '🖱️' },
  // ...
];

export const Example18 = mount(renew => {
  const priceRange = state(500, renew);
  const sortOption = state<'name' | 'price-low' | 'price-high'>('name', renew);

  let rootRenderCount = 0;
  let listRenderCount = 0;

  // 가격 범위가 바뀔 때만 상품 리스트를 다시 만드는 TagFunction
  const CachedProductList = cacheUpdate(
    () => [priceRange.v],
    () => {
      listRenderCount += 1;
      const filteredProducts = products.filter(p => p.price <= priceRange.v);

      return (
        <div>
          <h4>📦 Product List</h4>
          <div>ProductList 렌더링: {listRenderCount}회</div>
          {/* ... filteredProducts UI ... */}
        </div>
      );
    }
  );

  const updatePriceRange = (value: number) => {
    priceRange.v = value;
  };

  const changeSortOption = (value: typeof sortOption.v) => {
    sortOption.v = value;
  };

  return () => {
    rootRenderCount += 1;

    return (
      <div>
        <h3>🛍️ Product Filter Dashboard</h3>

        {/* 렌더링 카운터 */}
        <div>Root 렌더링: {rootRenderCount}회</div>
        <div>ProductList 렌더링: {listRenderCount}회</div>

        {/* 가격 범위 슬라이더 (추적됨) */}
        <input
          type="range"
          min="0"
          max="1500"
          value={priceRange.v}
          onInput={e => updatePriceRange(Number((e.target as HTMLInputElement).value))}
        />

        {/* 정렬 옵션 (UI 전용 상태) */}
        <button onClick={() => changeSortOption('name')}>Name</button>
        <button onClick={() => changeSortOption('price-low')}>Price: Low</button>
        <button onClick={() => changeSortOption('price-high')}>Price: High</button>

        {/* cacheUpdate로 최적화된 상품 리스트 */}
        <CachedProductList />
      </div>
    );
  };
});`}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"cacheUpdate 동작 방식"}),e("div",{class:"bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6",children:e("div",{class:"text-gray-700 dark:text-gray-300 space-y-4",children:[e("div",{children:e("code",{class:"px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm",children:"cacheUpdate(() => [deps...], () => updater)"})}),e("div",{children:[e("strong",{children:"첫 번째 인자"}),": 의존성 배열을 반환하는 함수",e("ul",{class:"list-disc list-inside ml-4 mt-2 space-y-1",children:[e("li",{children:"이전 렌더링의 배열 값과 현재 배열 값을 얕은 비교(shallow compare)"}),e("li",{children:"값이 동일하면 두 번째 인자 실행을 스킵"}),e("li",{children:"값이 다르면 두 번째 인자 실행"})]})]}),e("div",{children:[e("strong",{children:"두 번째 인자"}),": updater를 반환하는 함수",e("ul",{class:"list-disc list-inside ml-4 mt-2 space-y-1",children:[e("li",{children:"의존성이 변경되었을 때만 실행됩니다"}),e("li",{children:"새로운 updater 함수를 반환합니다"}),e("li",{children:"이 updater가 실제 virtual DOM을 생성합니다"})]})]}),e("div",{class:"pt-4 border-t border-gray-200 dark:border-gray-700",children:[e("strong",{children:"이 예제에서:"}),e("ul",{class:"list-disc list-inside ml-4 mt-2 space-y-1",children:[e("li",{children:[e("code",{children:"priceRange.v"})," 변경 → 의존성 배열 변경 → updater 실행 → ProductList 리렌더링 ✓"]}),e("li",{children:[e("code",{children:"sortOption.v"})," 변경 → Root만 리렌더링 → ProductList는 이전 props로 그대로 유지 ✗"]})]})]})]})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"React.memo와 비교"}),e("div",{class:"overflow-x-auto mb-6",children:e("table",{class:"min-w-full border border-gray-300 dark:border-gray-700",children:[e("thead",{class:"bg-gray-100 dark:bg-gray-800",children:e("tr",{children:[e("th",{class:"px-4 py-2 text-left border-b border-gray-300 dark:border-gray-700",children:"-"}),e("th",{class:"px-4 py-2 text-left border-b border-gray-300 dark:border-gray-700",children:"React.memo"}),e("th",{class:"px-4 py-2 text-left border-b border-gray-300 dark:border-gray-700",children:"Lithent cacheUpdate"})]})}),e("tbody",{class:"text-gray-700 dark:text-gray-300",children:[e("tr",{children:[e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:e("strong",{children:"목적"})}),e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:"불필요한 리렌더링 방지"}),e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:"불필요한 리렌더링 방지"})]}),e("tr",{children:[e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:e("strong",{children:"사용 방식"})}),e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:"컴포넌트를 memo()로 감싸기"}),e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:"updater를 cacheUpdate()로 감싸기"})]}),e("tr",{children:[e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:e("strong",{children:"비교 대상"})}),e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:"모든 props (또는 커스텀 비교 함수)"}),e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:"명시적 의존성 배열"})]}),e("tr",{children:[e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:e("strong",{children:"제어 수준"})}),e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:"기본: 모든 props, 커스텀: 비교 함수 작성"}),e("td",{class:"px-4 py-2 border-b border-gray-300 dark:border-gray-700",children:"의존성 배열로 세밀하게 제어"})]})]})]})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"⚠️ 주의사항"}),e("div",{class:"bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mb-6 border border-yellow-200 dark:border-yellow-800",children:e("ul",{class:"space-y-3 text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{class:"text-yellow-800 dark:text-yellow-300",children:"의존성 배열 누락 주의"}),": 의존성 배열에 포함되지 않은 값이 변경되어도 컴포넌트는 리렌더링되지 않습니다. 필요한 모든 의존성을 포함해야 합니다."]}),e("li",{children:[e("strong",{class:"text-yellow-800 dark:text-yellow-300",children:"얕은 비교(Shallow Compare)"}),": 객체나 배열은 참조가 변경되어야 다른 값으로 인식됩니다."," ",e("code",{children:"[1, 2, 3]"}),"을 매번 새로 생성하면 항상 리렌더링됩니다."]}),e("li",{children:[e("strong",{class:"text-yellow-800 dark:text-yellow-300",children:"과도한 최적화 금지"}),": 모든 컴포넌트에 cacheUpdate를 사용할 필요는 없습니다. 성능 문제가 실제로 발생하는 경우에만 사용하세요."]}),e("li",{children:[e("strong",{class:"text-yellow-800 dark:text-yellow-300",children:"부모-자식 props 전달"}),": 부모가 cacheUpdate로 최적화되어 있어도, 자식 컴포넌트는 전달받은 props가 동일하면 리렌더링되지 않습니다 (이 예제의 ProductList처럼)."]})]})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"🧪 테스트 시나리오"}),e("div",{class:"bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6",children:e("ol",{class:"list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"가격 범위 슬라이더 조절"}),e("ul",{class:"list-disc list-inside ml-6 mt-2 space-y-1",children:[e("li",{children:"Root 렌더링 카운터 증가 ✓"}),e("li",{children:"ProductList 렌더링 카운터 증가 ✓"}),e("li",{children:"상품 목록이 필터링되어 가격 범위 이하의 상품만 표시됨 ✓"})]})]}),e("li",{children:[e("strong",{children:"정렬 옵션 버튼 클릭 (Name / Price: Low / Price: High)"}),e("ul",{class:"list-disc list-inside ml-6 mt-2 space-y-1",children:[e("li",{children:"Root 렌더링 카운터 증가 ✓"}),e("li",{children:"ProductList 렌더링 카운터 증가하지 않음 ✓"}),e("li",{children:"상품 목록은 이전 상태 그대로 유지됨 (정렬 미적용) ✓"})]})]}),e("li",{children:[e("strong",{children:"가격 범위와 정렬 옵션을 번갈아가며 변경"}),e("ul",{class:"list-disc list-inside ml-6 mt-2 space-y-1",children:[e("li",{children:"가격 범위 변경 시에만 ProductList가 리렌더링되는 것을 확인 ✓"}),e("li",{children:"두 렌더링 카운터의 차이가 점점 벌어지는 것을 확인 ✓"})]})]})]})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"💡 실제 사용 사례"}),e("div",{class:"bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-8 border border-green-200 dark:border-green-800",children:e("ul",{class:"space-y-3 text-gray-700 dark:text-gray-300",children:[e("li",{children:[e("strong",{children:"대용량 리스트"}),": 수백~수천 개의 아이템을 렌더링하는 리스트 컴포넌트에서 불필요한 리렌더링 방지"]}),e("li",{children:[e("strong",{children:"복잡한 차트/그래프"}),": 렌더링 비용이 높은 시각화 컴포넌트에서 데이터가 실제로 변경될 때만 리렌더링"]}),e("li",{children:[e("strong",{children:"필터링/정렬 UI"}),": 여러 필터 옵션 중 일부만 특정 컴포넌트에 영향을 미치는 경우"]}),e("li",{children:[e("strong",{children:"실시간 데이터 대시보드"}),": 여러 데이터 소스를 표시하지만 각 위젯은 자신의 데이터만 추적"]}),e("li",{children:[e("strong",{children:"폼 컴포넌트"}),": 폼 전체가 리렌더링되어도 변경되지 않은 입력 필드는 유지"]})]})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"🚀 실행 예제"}),e("div",{class:"not-prose my-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800",children:e(Ro,{})}),e("div",{class:"mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800",children:e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:["💡 ",e("strong",{children:"Tip"}),": 가격 범위 슬라이더를 움직일 때와 정렬 버튼을 클릭할 때 렌더링 카운터가 어떻게 변하는지 비교해보세요. ProductList는 priceRange가 변경될 때만 리렌더링됩니다!"]})}),e("div",{class:"mt-10",children:[e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mb-3",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/cache-update",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/cache-update"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"CacheUpdate 가이드"})," ","- cacheUpdate(checkFunction, updater) API와 의존성 배열 설계를 상세히 설명합니다."]}),e("li",{children:[e("a",{href:"/guide/computed",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/computed"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Computed 가이드"})," ","- 계산 비용이 큰 파생 값을 캐싱하는 또 다른 도구인 computed와의 차이를 비교해볼 수 있습니다."]})]})]})]})),No=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Todo List - Lithent FTags</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 650px;
      width: 100%;
      padding: 30px;
    }
    h1 { color: #667eea; margin-bottom: 10px; font-size: 28px; }
    .subtitle { color: #888; font-size: 14px; margin-bottom: 20px; }
    .input-group {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 10px;
      margin-bottom: 20px;
    }
    input[type="text"] {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
    }
    select {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
    }
    .btn-add {
      background: #667eea;
      color: white;
    }
    .btn-add:hover { background: #5568d3; transform: translateY(-2px); }
    .btn-delete {
      background: #ff6b6b;
      color: white;
      padding: 6px 12px;
      font-size: 12px;
    }
    .btn-delete:hover { background: #ee5a52; }
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 8px 16px;
      background: #f0f0f0;
      color: #666;
      font-size: 13px;
    }
    .filter-btn.active {
      background: #667eea;
      color: white;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .summary-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 15px;
      border-radius: 12px;
      text-align: center;
    }
    .summary-card.total { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
    .summary-card.completed { background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); }
    .summary-card.pending { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); }
    .summary-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .summary-amount {
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }
    .todo-list {
      list-style: none;
      max-height: 450px;
      overflow-y: auto;
    }
    .todo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 10px;
      transition: all 0.3s;
      background: white;
      border: 2px solid #e0e0e0;
    }
    .todo-item:hover {
      transform: translateX(5px);
      border-color: #667eea;
    }
    .todo-item.completed {
      background: linear-gradient(to right, #d4fc79 0%, #96e6a1 100%);
      border-color: #4caf50;
    }
    .todo-item.completed .todo-text {
      text-decoration: line-through;
      opacity: 0.6;
    }
    .todo-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .todo-content {
      flex: 1;
      min-width: 0;
    }
    .todo-text {
      font-weight: 600;
      color: #333;
      margin-bottom: 3px;
      word-wrap: break-word;
    }
    .todo-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .category-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .category-badge.home {
      background: #e3f2fd;
      color: #1976d2;
    }
    .category-badge.work {
      background: #fce4ec;
      color: #c2185b;
    }
    .category-badge.other {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    .todo-date {
      font-size: 11px;
      color: #999;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }
    .empty-icon {
      font-size: 60px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.umd.js"><\/script>

  <script>
    const { render } = lithent;
    const { flMount, fTags } = lithentFTags;
    const { lstate, computed } = lithentHelper;

    const { div, h1, p, input, button, select, option, ul, li, span, label } = fTags;

    // Smart Todo List App
    const TodoList = flMount(() => {
      const todos = lstate([]);
      const taskText = lstate('');
      const category = lstate('home');
      const filter = lstate('all');

      const addTodo = () => {
        const text = taskText.value.trim();
        if (text) {
          todos.value = [
            ...todos.value,
            {
              id: Date.now(),
              text: text,
              category: category.value,
              completed: false,
              createdAt: new Date().toLocaleDateString()
            }
          ];
          taskText.value = '';
        }
      };

      const toggleTodo = (id) => {
        todos.value = todos.value.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
      };

      const deleteTodo = (id) => {
        todos.value = todos.value.filter(t => t.id !== id);
      };

      const filteredTodos = computed(() => {
        if (filter.value === 'all') return todos.value;
        if (filter.value === 'completed') return todos.value.filter(t => t.completed);
        if (filter.value === 'pending') return todos.value.filter(t => !t.completed);
        return todos.value.filter(t => t.category === filter.value);
      });

      const totalCount = computed(() => todos.value.length);
      const completedCount = computed(() => todos.value.filter(t => t.completed).length);
      const pendingCount = computed(() => todos.value.filter(t => !t.completed).length);

      const categoryIcon = {
        home: '🏠',
        work: '💼',
        other: '📌'
      };

      const categoryLabel = {
        home: '집안일',
        work: '회사일',
        other: '기타'
      };

      return () => div(
        { className: 'container' },

        // Header
        h1('✅ Smart Todo List'),
        p({ className: 'subtitle' }, 'Built with Lithent FTags - No build tools required!'),

        // Input Form
        div(
          { className: 'input-group' },
          input({
            type: 'text',
            placeholder: '할 일을 입력하세요... (예: 빨래하기, 보고서 작성)',
            value: taskText.value,
            onInput: (e) => taskText.value = e.target.value,
            onKeyPress: (e) => e.key === 'Enter' && addTodo()
          }),
          select(
            {
              value: category.value,
              onChange: (e) => category.value = e.target.value
            },
            option({ value: 'home' }, '🏠 집안일'),
            option({ value: 'work' }, '💼 회사일'),
            option({ value: 'other' }, '📌 기타')
          ),
          button(
            {
              className: 'btn-add',
              onClick: addTodo
            },
            '+ 추가'
          )
        ),

        // Summary Cards
        div(
          { className: 'summary' },
          div(
            { className: 'summary-card total' },
            div({ className: 'summary-label' }, '📋 전체'),
            div({ className: 'summary-amount' }, totalCount.value)
          ),
          div(
            { className: 'summary-card completed' },
            div({ className: 'summary-label' }, '✅ 완료'),
            div({ className: 'summary-amount' }, completedCount.value)
          ),
          div(
            { className: 'summary-card pending' },
            div({ className: 'summary-label' }, '⏳ 진행중'),
            div({ className: 'summary-amount' }, pendingCount.value)
          )
        ),

        // Filters
        div(
          { className: 'filters' },
          button(
            {
              className: \`filter-btn \${filter.value === 'all' ? 'active' : ''}\`,
              onClick: () => filter.value = 'all'
            },
            \`전체 (\${todos.value.length})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'completed' ? 'active' : ''}\`,
              onClick: () => filter.value = 'completed'
            },
            \`완료 (\${completedCount.value})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'pending' ? 'active' : ''}\`,
              onClick: () => filter.value = 'pending'
            },
            \`진행중 (\${pendingCount.value})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'home' ? 'active' : ''}\`,
              onClick: () => filter.value = 'home'
            },
            \`🏠 집안일 (\${todos.value.filter(t => t.category === 'home').length})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'work' ? 'active' : ''}\`,
              onClick: () => filter.value = 'work'
            },
            \`💼 회사일 (\${todos.value.filter(t => t.category === 'work').length})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'other' ? 'active' : ''}\`,
              onClick: () => filter.value = 'other'
            },
            \`📌 기타 (\${todos.value.filter(t => t.category === 'other').length})\`
          )
        ),

        // Todo List
        filteredTodos.value.length === 0
          ? div(
              { className: 'empty-state' },
              div({ className: 'empty-icon' }, '📝'),
              p(
                { style: { fontSize: '16px', fontWeight: '600' } },
                filter.value === 'all'
                  ? '아직 할 일이 없습니다'
                  : filter.value === 'completed'
                  ? '완료된 할 일이 없습니다'
                  : filter.value === 'pending'
                  ? '진행중인 할 일이 없습니다'
                  : \`\${categoryLabel[filter.value]} 할 일이 없습니다\`
              ),
              p(
                { style: { fontSize: '14px', marginTop: '10px' } },
                '위에서 새로운 할 일을 추가해보세요!'
              )
            )
          : ul(
              { className: 'todo-list' },
              ...filteredTodos.value.map(todo =>
                li(
                  {
                    key: todo.id,
                    className: \`todo-item \${todo.completed ? 'completed' : ''}\`
                  },
                  input({
                    type: 'checkbox',
                    className: 'todo-checkbox',
                    checked: todo.completed,
                    onChange: () => toggleTodo(todo.id)
                  }),
                  div(
                    { className: 'todo-content' },
                    div({ className: 'todo-text' }, todo.text),
                    div(
                      { className: 'todo-meta' },
                      span(
                        { className: \`category-badge \${todo.category}\` },
                        \`\${categoryIcon[todo.category]} \${categoryLabel[todo.category]}\`
                      ),
                      span({ className: 'todo-date' }, todo.createdAt)
                    )
                  ),
                  button(
                    {
                      className: 'btn-delete',
                      onClick: () => deleteTodo(todo.id)
                    },
                    '🗑️'
                  )
                )
              )
            )
      );
    });

    // Render the app
    render(TodoList(), document.getElementById('root'));
  <\/script>
</body>
</html>`,Uo=v(()=>()=>e("div",{class:"w-full max-w-5xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"✅ Smart Todo List with FTags"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"빌드 도구 없이 CDN만으로 작동하는 완전한 예제 - 복사해서 HTML 파일로 저장하고 브라우저에서 바로 실행하세요!"})]}),e("div",{class:"my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"💡 사용 방법"}),e("ol",{class:"text-sm text-blue-800 dark:text-blue-200 space-y-2 ml-4",children:[e("li",{children:"1. 아래 코드를 전체 선택하여 복사합니다"}),e("li",{children:["2."," ",e("code",{class:"px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded",children:"smart-todo.html"})," ","파일을 생성합니다"]}),e("li",{children:"3. 복사한 코드를 붙여넣고 저장합니다"}),e("li",{children:"4. 브라우저에서 파일을 열면 바로 작동합니다!"})]})]}),e("div",{class:"my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"🎯 예제 특징"}),e("ul",{class:"text-sm text-purple-800 dark:text-purple-200 space-y-2",children:[e("li",{children:[e("strong",{children:"제로 설정:"})," NPM, Webpack, Babel 등 빌드 도구 불필요"]}),e("li",{children:[e("strong",{children:"CDN 로딩:"})," Lithent, FTags, Helper를 CDN에서 직접 로드"]}),e("li",{children:[e("strong",{children:"반응형 상태:"})," lstate와 computed를 활용한 자동 업데이트"]}),e("li",{children:[e("strong",{children:"카테고리 관리:"})," 집안일, 회사일, 기타로 할 일 분류"]}),e("li",{children:[e("strong",{children:"다중 필터:"})," 전체, 완료, 진행중, 카테고리별 필터링"]}),e("li",{children:[e("strong",{children:"체크박스 완료:"})," 클릭으로 완료/미완료 토글"]}),e("li",{children:[e("strong",{children:"아름다운 UI:"})," 그라데이션과 애니메이션이 포함된 모던 디자인"]})]})]}),e("div",{class:"my-8",children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"📋 완전한 HTML 파일"}),e("p",{class:"text-sm text-gray-600 dark:text-gray-400 mb-3",children:"아래 코드를 복사해서 .html 파일로 저장하고 브라우저에서 열어보세요!"}),e(l,{code:No,language:"html"})]}),e("div",{class:"my-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-green-900 dark:text-green-100 mb-2",children:"✨ 주요 학습 포인트"}),e("div",{class:"text-sm text-green-800 dark:text-green-200 space-y-3",children:[e("div",{children:[e("strong",{children:"1. flMount 사용:"}),e("br",{}),e("code",{class:"px-2 py-1 bg-green-200 dark:bg-green-800 rounded",children:"flMount"}),"로 컴포넌트를 생성하고 JSX 없이 함수 호출로 UI 구성"]}),e("div",{children:[e("strong",{children:"2. lstate 반응성:"}),e("br",{}),e("code",{class:"px-2 py-1 bg-green-200 dark:bg-green-800 rounded",children:"lstate"}),"로 상태를 관리하면 자동으로 UI가 업데이트됨"]}),e("div",{children:[e("strong",{children:"3. computed 값:"}),e("br",{}),e("code",{class:"px-2 py-1 bg-green-200 dark:bg-green-800 rounded",children:"computed"}),"로 파생 상태(전체/완료/진행중 개수)를 자동 계산"]}),e("div",{children:[e("strong",{children:"4. Props 생략:"}),e("br",{}),"fTags는 Props 객체를 생략하고 바로 children을 전달 가능"]}),e("div",{children:[e("strong",{children:"5. 조건부 렌더링:"}),e("br",{}),"삼항 연산자로 빈 상태와 리스트를 조건부로 렌더링"]})]})]}),e("div",{class:"my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2",children:"🔧 커스터마이징 아이디어"}),e("ul",{class:"text-sm text-yellow-800 dark:text-yellow-200 space-y-2",children:[e("li",{children:["• ",e("strong",{children:"LocalStorage 추가:"})," 브라우저를 닫아도 할 일이 유지되도록 개선"]}),e("li",{children:["• ",e("strong",{children:"우선순위 기능:"})," 높음/중간/낮음 우선순위 추가"]}),e("li",{children:["• ",e("strong",{children:"마감일 설정:"})," 각 할 일에 마감일을 추가하고 정렬"]}),e("li",{children:["• ",e("strong",{children:"서브태스크:"})," 큰 작업을 작은 단계로 나누기"]}),e("li",{children:["• ",e("strong",{children:"검색 기능:"})," 할 일 제목으로 검색"]})]})]}),e("div",{class:"mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-3",children:"📚 더 알아보기"}),e("div",{class:"space-y-2 text-sm",children:[e("a",{href:"/guide/ftags",class:"block text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/ftags"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"→ FTags 가이드: 전체 API 문서와 더 많은 예제"}),e("a",{href:"/guide/lstate",class:"block text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/lstate"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"→ Lstate 가이드: 반응형 상태 관리 자세히 알아보기"}),e("a",{href:"/guide/computed",class:"block text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/computed"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"→ Computed 가이드: 파생 상태 활용법"})]})]})]})),Ho=v(()=>()=>e("div",{children:[e("h1",{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4",children:"Example 19: Smart Todo List with FTags (CDN Ready)"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-6",children:"이 예제는 FTags를 사용하여 빌드 도구 없이 CDN만으로 작동하는 완전한 Todo 애플리케이션을 만드는 방법을 보여줍니다. 코드를 복사해서 HTML 파일로 저장하면 즉시 실행할 수 있습니다!"}),e("div",{class:"my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"💡 테스트 요점"}),e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:[e("strong",{children:"Zero Configuration with FTags"}),": FTags를 사용하면 JSX, Babel, Webpack 등의 빌드 도구 설정 없이 순수 JavaScript로 반응형 UI를 만들 수 있습니다. CDN에서 직접 로드하여 HTML 파일 하나로 완전한 앱을 구현할 수 있습니다."]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"FTags의 장점"}),e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"✨ 핵심 장점"}),e("div",{class:"space-y-4",children:[e("div",{children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-2",children:"1️⃣ 제로 설정 (Zero Configuration)"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"NPM 설치, package.json 설정, Babel/Webpack 구성 등이 전혀 필요하지 않습니다. HTML 파일 하나면 충분합니다."})]}),e("div",{children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-2",children:"2️⃣ CDN 즉시 사용"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"Lithent, FTags, Helper 라이브러리를 CDN에서 직접 로드하여 즉시 사용할 수 있습니다. 프로토타입을 빠르게 만들거나 간단한 위젯을 만들 때 유용합니다."})]}),e("div",{children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-2",children:"3️⃣ 순수 함수형 API"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"모든 HTML 태그가 함수로 제공되며, 함수 호출만으로 UI를 구성할 수 있습니다. TypeScript 타입 안전성도 완벽하게 지원됩니다."})]}),e("div",{children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-2",children:"4️⃣ Props 자동 감지"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"첫 번째 인자가 props인지 children인지 자동으로 판단하여, props를 생략하고 바로 children을 전달할 수 있습니다. 코드가 더 간결해집니다."})]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"Smart Todo List 앱 구조"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:"이 예제는 완전한 기능을 갖춘 할 일 관리 앱입니다:"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"할 일 추가:"})," 텍스트 입력과 카테고리 선택으로 할 일 추가"]}),e("li",{children:[e("strong",{children:"카테고리 분류:"})," 집안일, 회사일, 기타로 분류"]}),e("li",{children:[e("strong",{children:"실시간 통계:"})," 전체, 완료, 진행중 개수 자동 계산"]}),e("li",{children:[e("strong",{children:"다중 필터:"})," 전체/완료/진행중 및 카테고리별 필터링"]}),e("li",{children:[e("strong",{children:"완료 토글:"})," 체크박스로 완료/미완료 상태 전환"]}),e("li",{children:[e("strong",{children:"삭제 기능:"})," 각 할 일을 개별적으로 삭제 가능"]}),e("li",{children:[e("strong",{children:"반응형 UI:"})," 상태 변경 시 자동으로 UI 업데이트"]}),e("li",{children:[e("strong",{children:"아름다운 디자인:"})," 그라데이션, 배지, 애니메이션 포함"]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"사용된 기술"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{class:"bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"flMount"}),e("p",{class:"text-sm text-purple-800 dark:text-purple-200",children:"JSX 없이 Light API 컴포넌트를 생성합니다. lstate와 함께 사용하면 자동으로 UI가 업데이트됩니다."})]}),e("div",{class:"bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-900 dark:text-green-100 mb-2",children:"fTags"}),e("p",{class:"text-sm text-green-800 dark:text-green-200",children:"모든 HTML 태그를 함수로 제공합니다. div, button, input, select 등을 구조 분해로 가져와 사용합니다."})]}),e("div",{class:"bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800",children:[e("h3",{class:"text-base font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"lstate"}),e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:"반응형 상태 관리. .value로 접근/수정하면 자동으로 컴포넌트가 리렌더링됩니다."})]}),e("div",{class:"bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800",children:[e("h3",{class:"text-base font-semibold text-orange-900 dark:text-orange-100 mb-2",children:"computed"}),e("p",{class:"text-sm text-orange-800 dark:text-orange-200",children:"파생 상태. 의존하는 상태가 변경되면 자동으로 다시 계산됩니다."})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실행 예제"}),e("div",{class:"my-8",children:e(Uo,{})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"활용 사례"}),e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"언제 FTags를 사용할까?"}),e("div",{class:"space-y-3 text-sm text-gray-700 dark:text-gray-300",children:[e("div",{class:"flex items-start",children:[e("span",{class:"text-green-600 dark:text-green-400 mr-2",children:"✓"}),e("div",{children:[e("strong",{children:"빠른 프로토타이핑:"})," 아이디어를 빠르게 검증하고 싶을 때"]})]}),e("div",{class:"flex items-start",children:[e("span",{class:"text-green-600 dark:text-green-400 mr-2",children:"✓"}),e("div",{children:[e("strong",{children:"작은 위젯:"})," 웹사이트에 삽입할 간단한 인터랙티브 위젯"]})]}),e("div",{class:"flex items-start",children:[e("span",{class:"text-green-600 dark:text-green-400 mr-2",children:"✓"}),e("div",{children:[e("strong",{children:"교육 목적:"})," 학생들에게 빌드 도구 없이 리액티브 프로그래밍 가르치기"]})]}),e("div",{class:"flex items-start",children:[e("span",{class:"text-green-600 dark:text-green-400 mr-2",children:"✓"}),e("div",{children:[e("strong",{children:"레거시 환경:"})," JSX 설정이 어려운 환경에서 모던한 UI 개발"]})]}),e("div",{class:"flex items-start",children:[e("span",{class:"text-green-600 dark:text-green-400 mr-2",children:"✓"}),e("div",{children:[e("strong",{children:"독립 실행형 도구:"})," 외부 의존성 없이 배포 가능한 HTML 파일"]})]})]})]}),e("div",{class:"my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2",children:"⚠️ 주의사항"}),e("ul",{class:"text-sm text-yellow-800 dark:text-yellow-200 space-y-2",children:[e("li",{children:"대규모 애플리케이션에는 JSX가 더 가독성이 좋을 수 있습니다."}),e("li",{children:"팀이 JSX에 익숙하다면 굳이 FTags로 전환할 필요는 없습니다."}),e("li",{children:"복잡한 중첩 구조에서는 함수 호출 방식이 JSX보다 읽기 어려울 수 있습니다."}),e("li",{children:"성능은 JSX와 동일합니다. 둘 다 동일한 Virtual DOM을 생성합니다."})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"확장 아이디어"}),e("div",{class:"grid gap-4 mb-6",children:[e("div",{class:"bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800",children:[e("h4",{class:"text-base font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"💾 LocalStorage 지속성"}),e("p",{class:"text-sm text-purple-800 dark:text-purple-200",children:"할 일 목록을 LocalStorage에 저장하여 브라우저를 닫아도 데이터가 유지되도록 만들어보세요."})]}),e("div",{class:"bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-base font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"🎯 우선순위 시스템"}),e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:"높음, 중간, 낮음 우선순위를 추가하고 색상으로 구분해보세요."})]}),e("div",{class:"bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800",children:[e("h4",{class:"text-base font-semibold text-green-900 dark:text-green-100 mb-2",children:"📅 마감일 관리"}),e("p",{class:"text-sm text-green-800 dark:text-green-200",children:"각 할 일에 마감일을 설정하고 임박한 순서대로 정렬하는 기능을 추가해보세요."})]}),e("div",{class:"bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800",children:[e("h4",{class:"text-base font-semibold text-orange-900 dark:text-orange-100 mb-2",children:"🔍 검색 기능"}),e("p",{class:"text-sm text-orange-800 dark:text-orange-200",children:"할 일 제목으로 검색하는 기능을 추가하여 많은 할 일 중에서 빠르게 찾아보세요."})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/ftags",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/ftags"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"FTags 가이드"})," ","- FTags의 모든 기능과 API 문서"]}),e("li",{children:[e("a",{href:"/guide/lstate",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/lstate"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Lstate 가이드"})," ","- Light API 반응형 상태 관리"]}),e("li",{children:[e("a",{href:"/guide/computed",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/computed"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Computed 가이드"})," ","- 파생 상태와 자동 계산"]})]})]})),_o=[{id:1,title:"산 풍경",thumbnail:"🏔️",full:"🏔️"},{id:2,title:"바다 풍경",thumbnail:"🌊",full:"🌊"},{id:3,title:"도시 야경",thumbnail:"🌃",full:"🌃"},{id:4,title:"숲 속",thumbnail:"🌲",full:"🌲"},{id:5,title:"석양",thumbnail:"🌅",full:"🌅"},{id:6,title:"별이 빛나는 밤",thumbnail:"🌌",full:"🌌"}],Bo=v(t=>{const r=P(null,t),a=o=>{r.v=o},n=()=>{r.v=null};return()=>e("div",{class:"w-full max-w-4xl mx-auto",children:[e("div",{class:"mb-4",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2",children:"🖼️ 이미지 갤러리"}),e("p",{class:"text-xs text-gray-500 dark:text-gray-400",children:"썸네일을 클릭하면 Portal을 통해 라이트박스가 표시됩니다"})]}),e("div",{class:"bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 overflow-hidden border-2 border-dashed border-gray-400 dark:border-gray-600",children:[e("p",{class:"text-xs text-gray-600 dark:text-gray-400 mb-3",children:"📦 overflow: hidden 컨테이너"}),e("div",{class:"grid grid-cols-3 md:grid-cols-6 gap-3",children:_o.map(o=>e("button",{onClick:()=>a(o),class:"aspect-square bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center p-2 border border-gray-200 dark:border-gray-600",children:[e("span",{class:"text-3xl md:text-4xl",children:o.thumbnail}),e("span",{class:"text-xs text-gray-600 dark:text-gray-300 mt-1",children:o.title})]},o.id))})]}),r.v&&Qa(e("div",{class:"fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 animate-fadeIn",children:[e("button",{onClick:n,class:"absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors",children:"✕"}),e("div",{class:"bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4",children:e("div",{class:"flex flex-col items-center",children:[e("span",{class:"text-9xl mb-4",children:r.v.full}),e("h3",{class:"text-2xl font-bold text-gray-900 dark:text-white mb-2",children:r.v.title}),e("p",{class:"text-sm text-gray-600 dark:text-gray-400 mb-4",children:["ID: ",r.v.id]}),e("button",{onClick:n,class:"px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",children:"닫기"})]})})]}),document.body),e("div",{class:"mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",children:[e("p",{class:"text-xs text-blue-800 dark:text-blue-200 mb-2",children:["💡 ",e("strong",{children:"Portal의 핵심 특성:"})]}),e("ol",{class:"text-xs text-blue-700 dark:text-blue-300 ml-4 space-y-1",children:[e("li",{children:["1. 갤러리는 ",e("strong",{children:"overflow:hidden"})," 컨테이너 안에 있습니다"]}),e("li",{children:["2. 라이트박스는 ",e("strong",{children:"Portal"}),"을 통해 별도 영역에 렌더링됩니다"]}),e("li",{children:["3. overflow 제약을 받지 않고 ",e("strong",{children:"전체 화면"}),"으로 표시됩니다"]})]})]}),e("style",{children:`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `})]})}),Fo=v(()=>()=>e("div",{children:[e("h1",{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4",children:"Example 20: 이미지 갤러리 라이트박스"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-6",children:"이 예제는 Portal 기능을 사용하여 overflow:hidden 컨테이너 안의 썸네일을 클릭하면 전체 화면 라이트박스가 표시되는 이미지 갤러리를 구현합니다. Portal의 핵심 특성을 가장 직관적으로 경험할 수 있습니다!"}),e("div",{class:"my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"💡 학습 포인트"}),e("p",{class:"text-sm text-purple-800 dark:text-purple-200",children:[e("strong",{children:"Portal의 마법:"})," 갤러리는 overflow:hidden 컨테이너 안에 갇혀 있지만, 썸네일을 클릭하면 Portal을 통해 전체 화면 라이트박스가 표시됩니다. 라이트박스는 물리적으로 다른 DOM 위치에 렌더링되어 부모의 overflow 제약을 받지 않습니다."]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"Portal이 해결하는 문제"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:"일반적으로 부모 컨테이너에 overflow: hidden이 있으면 자식 요소가 잘립니다. 하지만 라이트박스나 모달은 전체 화면을 덮어야 합니다. Portal은 이 문제를 해결합니다."}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"갤러리 라이트박스 구조"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("strong",{children:"썸네일 갤러리:"})," overflow:hidden 컨테이너 안에 6개의 이미지"]}),e("li",{children:[e("strong",{children:"클릭 이벤트:"})," 썸네일 클릭 시 선택된 사진 상태 업데이트"]}),e("li",{children:[e("strong",{children:"Portal 렌더링:"})," 라이트박스를 별도 DOM 위치에 표시"]}),e("li",{children:[e("strong",{children:"전체 화면 오버레이:"})," 검은 배경 + 큰 이미지 표시"]}),e("li",{children:[e("strong",{children:"닫기 기능:"})," X 버튼 또는 닫기 버튼으로 라이트박스 종료"]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"사용된 기술"}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{class:"bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800",children:[e("h3",{class:"text-base font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"portal()"}),e("p",{class:"text-sm text-purple-800 dark:text-purple-200",children:"라이트박스를 다른 DOM 위치로 렌더링합니다. portal(content, targetElement)로 사용합니다."})]}),e("div",{class:"bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800",children:[e("h3",{class:"text-base font-semibold text-green-900 dark:text-green-100 mb-2",children:"state (helper)"}),e("p",{class:"text-sm text-green-800 dark:text-green-200",children:"선택된 사진 상태를 관리합니다. .v로 접근하고 자동으로 리렌더링됩니다."})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"코드 예제"}),e("p",{class:"text-base text-gray-700 dark:text-gray-300 mb-4",children:"다음은 Portal을 사용하여 SSR로 미리 렌더링된 영역에 라이트박스를 렌더링하는 예제입니다:"}),e("div",{class:"mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700",children:[e("h3",{class:"text-sm font-semibold text-gray-900 dark:text-white mb-2",children:"💡 SSR 시나리오"}),e("p",{class:"text-xs text-gray-700 dark:text-gray-300",children:["서버에서 HTML에 라이트박스 컨테이너를 미리 렌더링하고, 클라이언트에서 Portal을 사용해 해당 영역(예: ",e("code",{children:"document.body"})," 또는 별도의"," ",e("code",{children:"lightbox-root"}),")에 라이트박스를 렌더링합니다."]})]}),e(l,{language:"html",code:`<!-- index.html (서버에서 렌더링된 HTML) -->
<!DOCTYPE html>
<html>
<body>
  <!-- 앱이 마운트될 영역 -->
  <div id="app"></div>

  <!-- SSR로 미리 렌더링된 라이트박스 컨테이너 -->
  <div id="lightbox-root"></div>
</body>
</html>`}),e(l,{language:"tsx",code:`// app.tsx (클라이언트 코드)
import { mount, portal } from 'lithent';
import { state } from 'lithent/helper';

export const Gallery = mount(renew => {
  const selectedPhoto = state<Photo | null>(null, renew);

  const openLightbox = (photo: Photo) => {
    selectedPhoto.v = photo;
  };

  const closeLightbox = () => {
    selectedPhoto.v = null;
  };

  return () => (
    <div>
      {/* 갤러리 (overflow:hidden 컨테이너) */}
      <div class="gallery-container" style="overflow: hidden;">
        {photos.map(photo => (
          <button key={photo.id} onClick={() => openLightbox(photo)}>
            <span>{photo.thumbnail}</span>
            <span>{photo.title}</span>
          </button>
        ))}
      </div>

      {/* Portal 렌더링 - document.body 또는 SSR로 정의된 lightbox-root 등 */}
      {selectedPhoto.v &&
        portal(
          <Lightbox photo={selectedPhoto.v} onClose={closeLightbox} />,
          document.body
        )}
    </div>
  );
});`}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300 mt-4 mb-2",children:e("strong",{children:"라이트박스 컴포넌트 (Portal로 렌더링되는 내용):"})}),e(l,{language:"tsx",code:`// Lightbox.tsx (Portal로 렌더링되는 컴포넌트)
const Lightbox = mount<{
  photo: Photo;
  onClose: () => void;
}>((r, props) => {
  return () => (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 animate-fadeIn">
      {/* 닫기 버튼 */}
      <button
        onClick={props.onClose}
        class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors"
      >
        ✕
      </button>

      {/* 라이트박스 본체 */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4">
        <div class="flex flex-col items-center">
          {/* 큰 이미지 */}
          <span class="text-9xl mb-4">{props.photo.full}</span>

          {/* 제목 */}
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {props.photo.title}
          </h3>

          {/* ID */}
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ID: {props.photo.id}
          </p>

          {/* 닫기 버튼 */}
          <button
            onClick={props.onClose}
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
});

// Gallery 컴포넌트에서 사용
const renderLightbox = () => {
  const lightboxRoot = document.getElementById('lightbox-root');
  return lightboxRoot && selectedPhoto.v
    ? portal(
        <Lightbox photo={selectedPhoto.v} onClose={closeLightbox} />,
        lightboxRoot
      )
    : null;
};`}),e("div",{class:"my-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"💡 핵심 포인트"}),e("ul",{class:"text-sm text-blue-800 dark:text-blue-200 space-y-2",children:[e("li",{children:[e("strong",{children:"1. SSR 컨테이너:"})," HTML에 미리 정의된 lightbox-root를 사용합니다."]}),e("li",{children:[e("strong",{children:"2. document.getElementById():"})," SSR로 렌더링된 DOM 요소를 직접 참조합니다."]}),e("li",{children:[e("strong",{children:"3. portal() 함수:"})," portal(<Lightbox />, lightboxRoot)로 라이트박스 컴포넌트를 렌더링합니다."]}),e("li",{children:[e("strong",{children:"4. 재사용 가능한 컴포넌트:"})," Lightbox를 독립적인 컴포넌트로 분리하여 props로 데이터를 전달합니다."]}),e("li",{children:[e("strong",{children:"5. overflow 해결:"})," 갤러리는 overflow:hidden이지만 라이트박스는 전체 화면에 표시됩니다."]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실행 예제"}),e("div",{class:"my-8",children:e(Bo,{})}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"Portal의 핵심 특성"}),e("div",{class:"bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6",children:[e("h3",{class:"text-lg font-semibold text-gray-900 dark:text-white mb-3",children:"🎯 이 예제가 보여주는 것"}),e("div",{class:"space-y-4",children:[e("div",{children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-2",children:"1️⃣ Overflow 제약 극복"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"갤러리 컨테이너는 overflow:hidden이지만, Portal로 렌더링된 라이트박스는 전체 화면을 덮을 수 있습니다."})]}),e("div",{children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-2",children:"2️⃣ 시각적으로 명확한 개념"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:'작은 썸네일 → 큰 라이트박스로의 전환이 Portal의 "다른 위치 렌더링" 개념을 직관적으로 보여줍니다.'})]}),e("div",{children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-2",children:"3️⃣ 실용적인 패턴"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"실제 웹사이트에서 자주 사용하는 이미지 갤러리 + 라이트박스 패턴입니다."})]}),e("div",{children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-white mb-2",children:"4️⃣ 생명주기 관리"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"선택된 사진 상태가 null이 되면 Portal도 자동으로 제거됩니다."})]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"실전 활용 예시"}),e("div",{class:"grid gap-4 mb-6",children:[e("div",{class:"bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800",children:[e("h4",{class:"text-base font-semibold text-purple-900 dark:text-purple-100 mb-2",children:"🖼️ 이미지 갤러리"}),e("p",{class:"text-sm text-purple-800 dark:text-purple-200",children:"포트폴리오, 블로그, 쇼핑몰 등에서 이미지를 크게 보여주는 라이트박스를 구현할 수 있습니다."})]}),e("div",{class:"bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800",children:[e("h4",{class:"text-base font-semibold text-blue-900 dark:text-blue-100 mb-2",children:"🎬 비디오 플레이어"}),e("p",{class:"text-sm text-blue-800 dark:text-blue-200",children:"작은 썸네일 클릭 시 전체 화면 비디오 플레이어를 표시할 수 있습니다."})]}),e("div",{class:"bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800",children:[e("h4",{class:"text-base font-semibold text-green-900 dark:text-green-100 mb-2",children:"📄 문서 미리보기"}),e("p",{class:"text-sm text-green-800 dark:text-green-200",children:"PDF, 이미지 등의 문서를 큰 화면으로 미리 볼 수 있는 뷰어를 만들 수 있습니다."})]}),e("div",{class:"bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800",children:[e("h4",{class:"text-base font-semibold text-orange-900 dark:text-orange-100 mb-2",children:"🎨 상품 상세보기"}),e("p",{class:"text-sm text-orange-800 dark:text-orange-200",children:"쇼핑몰에서 상품 이미지를 확대해서 보여주는 줌 기능을 구현할 수 있습니다."})]})]}),e("div",{class:"my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded",children:[e("h3",{class:"text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2",children:"⚠️ 주의사항"}),e("ul",{class:"text-sm text-yellow-800 dark:text-yellow-200 space-y-2",children:[e("li",{children:[e("strong",{children:"이벤트 버블링:"})," Portal 내부의 클릭 이벤트가 부모로 전파될 수 있으므로 e.stopPropagation()이 필요할 수 있습니다."]}),e("li",{children:[e("strong",{children:"접근성:"})," ESC 키로 닫기, 포커스 트랩 등의 접근성 기능을 추가하는 것이 좋습니다."]}),e("li",{children:[e("strong",{children:"스크롤 방지:"})," 라이트박스 열릴 때 body 스크롤을 비활성화하면 더 나은 UX를 제공합니다."]}),e("li",{children:[e("strong",{children:"애니메이션:"})," fade-in/fade-out 애니메이션을 추가하면 더 부드러운 전환 효과를 얻을 수 있습니다."]})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"확장 아이디어"}),e("div",{class:"grid gap-4 mb-6",children:[e("div",{class:"bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700",children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-gray-100 mb-2",children:"⬅️➡️ 이전/다음 네비게이션"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"라이트박스에서 화살표 버튼으로 다음/이전 이미지를 볼 수 있는 기능을 추가해보세요."})]}),e("div",{class:"bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700",children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-gray-100 mb-2",children:"🔍 줌 인/아웃"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"마우스 휠이나 핀치 제스처로 이미지를 확대/축소하는 기능을 추가해보세요."})]}),e("div",{class:"bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700",children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-gray-100 mb-2",children:"📱 스와이프 지원"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"모바일에서 좌우 스와이프로 이미지를 전환하는 기능을 추가해보세요."})]}),e("div",{class:"bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700",children:[e("h4",{class:"text-base font-semibold text-gray-900 dark:text-gray-100 mb-2",children:"🎞️ 슬라이드쇼"}),e("p",{class:"text-sm text-gray-700 dark:text-gray-300",children:"자동으로 다음 이미지로 넘어가는 슬라이드쇼 모드를 추가해보세요."})]})]}),e("h2",{class:"text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4",children:"관련 문서"}),e("ul",{class:"list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2",children:[e("li",{children:[e("a",{href:"/guide/portal",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/portal"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Portal 가이드"})," ","- Portal의 모든 기능과 API 문서"]}),e("li",{children:[e("a",{href:"/guide/mount-hooks",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/mount-hooks"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"Mount Hooks 가이드"})," ","- mountCallback과 컴포넌트 생명주기"]}),e("li",{children:[e("a",{href:"/guide/state-ref",class:"text-[#42b883] hover:underline",onClick:t=>{t.preventDefault(),window.history.pushState({},"","/guide/state-ref"),window.dispatchEvent(new PopStateEvent("popstate"))},children:"State-Ref 가이드"})," ","- ref를 사용한 DOM 요소 참조"]})]})]})),$o=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"소개"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent는 작고 예측 가능한 UI를 만들기 위한 경량 JavaScript 라이브러리입니다.",e("br",{}),"불필요한 마법이나 복잡한 API를 걷어내고, 단순하고 예측 가능한 방식으로 동작하는 것을 목표로 합니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"왜 Lithent를 만들었나요?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"가벼운 DOM 조작이 필요한, 용량에 민감한 환경"}),"에서도 부담 없이 사용할 수 있는 라이브러리가 필요했습니다. 기존의 많은 프레임워크들은 강력하지만, 작은 프로젝트나 라이브러리에 포함시키기엔 무겁습니다.",e("br",{}),e("br",{}),"Lithent는 이런 배경에서 탄생했습니다."," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Core만으로도 완전히 동작하는 UI를 만들 수 있습니다"}),". 상태 관리, 반응성 시스템 같은 추가 기능이 필요하다면, 언제든지"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Helper를 확장팩처럼 선택적으로 추가"}),"할 수 있습니다.",e("br",{}),e("br",{}),"필요한 것만 가져다 쓰는 방식으로, 프로젝트 규모와 요구사항에 맞춰 유연하게 확장할 수 있습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"어떻게 사용하나요?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent는 크게 두 가지 방식을 제공합니다:"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"수동 제어 기반 (Manual Mode)"}),"과"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"선언형 기반 (Light API Mode)"}),"입니다. 이 두 방식은 한 프로젝트 내에서 자유롭게 혼용할 수 있습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"수동 제어 기반 (Manual Mode)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["상태는 JavaScript 개발자에게 가장 익숙한 패턴인",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"클로저"}),"에 담깁니다. 복잡한 반응성 시스템이나 특별한 문법 없이, 그저 변수를 선언하고 사용하면 됩니다. 상태가 어디에 있는지, 어떻게 변하는지 코드를 읽는 것만으로도 명확하게 파악할 수 있습니다.",e("br",{}),e("br",{}),"이러한 투명하고 자연스러운 흐름 속에서,",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"renew()"}),'는 "이제 화면을 갱신해줘"라고 명시적으로 요청하는 단순한 함수입니다. 상태를 변경한 후 renew()를 호출하면 UI가 업데이트됩니다. 복잡한 의존성 추적도, 예측하기 어려운 자동 렌더링도 없습니다.',e("br",{}),e("br",{}),"클로저라는 친숙한 개념 위에 renew()라는 단순한 API를 더한 것만으로, 언제 무엇이 업데이트되는지 완전히 예측 가능하고 제어 가능한 UI를 만들 수 있습니다. 이것이 Lithent가 추구하는 자연스러움입니다.",e("br",{}),e("br",{}),"별도의 상태 관리 메커니즘이 필요 없기 때문에 라이브러리는 경량을 유지하면서도, 개발자는 JavaScript 본연의 방식으로 코드를 작성할 수 있습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"선언형 기반 (Light API Mode)"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"상태 변화가 자동으로 UI에 반영되는 선언형 패턴입니다. 상태 생성을 위한 lstate API는 코어와 느슨하게 결합된 helper를 통해 제공되며, 필요할 때만 가볍게 가져다 사용할 수 있습니다. 상태, 컨텍스트 등 추가 기능이 필요할 때 선택적으로 활용할 수 있습니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","상태가 전혀 필요 없는 단순한 UI는 mount나 lmount 없이"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:["(","{ props, children }",")"]}),"가 아닌, Lithent 스타일의 일반 함수 컴포넌트(예:"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:["(","{ title }",", children)"]}),")로도 표현할 수 있습니다. 자세한 패턴은"," ",e("a",{href:"/guide/stateless",onClick:t=>{t.preventDefault(),y("/guide/stateless")},class:"text-[#42b883] hover:underline",children:"Stateless Components"})," ","섹션에서 다룹니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"점진적 적용"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4",children:"Lithent는 다양한 형태의 웹 환경에서 사용 가능합니다:"}),e("ul",{class:"list-disc list-inside space-y-2 mb-6 ml-4 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{children:"빌드 단계없이 정적 HTML을 강화"}),e("li",{children:"싱글 페이지 애플리케이션(SPA)"}),e("li",{children:"서버 사이드 렌더링(SSR)"})]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/quick-start",onClick:t=>{t.preventDefault(),y("/guide/quick-start")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"빠르게 시작하기 →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["이제 Lithent에 대한 기본적인 철학을 알았습니다!",e("br",{}),"빠르게 시작하기에서 쉽게 Lithent를 시작하는 방법을 알아봐요."]})]})})]}),jo=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"빠르게 시작하기"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4",children:"Lithent 애플리케이션 생성하기"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("p",{class:"text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3",children:"📋 사전 준비사항"}),e("ul",{class:"space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("span",{children:"커맨드 라인 사용에 익숙할 것"})]}),e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("span",{children:[e("strong",{class:"font-medium text-gray-900 dark:text-white",children:"Node.js 18.12"})," ","이상 버전 설치"]})]})]})]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 섹션에서는 로컬 컴퓨터에서 Lithent 애플리케이션을 생성하는 방법을 소개합니다. 생성된 프로젝트는 Vite를 기반으로 한 빌드 환경을 사용합니다."}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"최신 버전의 Node.js가 설치되어 있는지 확인하고, 현재 작업 디렉터리가 프로젝트를 생성하려는 위치인지 확인하세요. 명령줄에서 다음 명령을 실행하세요($ 기호는 입력하지 않습니다):"}),e(l,{language:"bash",code:"$ npx create-lithent@latest"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["이 명령은 공식 Lithent 프로젝트 생성 도구인 create-lithent를 설치하고 실행합니다.",e("br",{}),e("br",{}),"실행하면 프로젝트 이름과 템플릿 유형을 선택할 수 있습니다:"]}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:[e("p",{class:"text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3",children:"📦 템플릿 유형"}),e("ul",{class:"space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("div",{children:[e("strong",{class:"font-medium text-gray-900 dark:text-white",children:"SSR (Express)"}),": 서버 사이드 렌더링을 지원하는 Express 기반 템플릿. SEO가 중요하거나 초기 로딩 성능을 최적화하려는 경우에 적합합니다."]})]}),e("li",{class:"flex items-start",children:[e("svg",{class:"w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e("div",{children:[e("strong",{class:"font-medium text-gray-900 dark:text-white",children:"SPA (Vite)"}),": 클라이언트 사이드 렌더링만 사용하는 Vite 기반 템플릿. 빠른 개발 환경과 간단한 배포를 원하는 경우에 적합합니다."]})]})]})]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"프로젝트가 생성되면, 의존성 설치 및 개발 서버 실행을 위한 안내에 따라 진행하세요:"}),e(l,{language:"bash",code:`$ cd <your-project-name>
$ npm install
$ npm run dev`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["이제 첫 번째 Lithent 프로젝트가 실행되고 있을 것입니다!",e("br",{}),"Lithent는 여러 가지 템플릿 스타일을 지원하지만, 기본 애플리케이션은 JSX를 사용하여 생성됩니다.",e("br",{}),e("br",{}),"앱을 프로덕션에 배포할 준비가 되면 다음 명령을 실행하세요:"]}),e(l,{language:"bash",code:"$ npm run build"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 명령은 프로젝트의 ./dist 디렉터리에 프로덕션용 빌드를 생성합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4",children:"CDN에서 Lithent 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"스크립트 태그를 통해 CDN에서 직접 Lithent를 사용할 수 있습니다:"}),e(l,{language:"bash",code:'<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"><\/script>'}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["CDN에서 Lithent를 사용할 때는 빌드 단계가 필요하지 않습니다. 이로 인해 설정이 훨씬 간단해지며, 정적 HTML을 보강하거나 백엔드 프레임워크와 통합할 때 적합합니다.",e("br",{}),e("br",{}),"다만 JSX 문법은 사용할 수 없습니다. 대신 함수형으로 템플릿을 만드는 ftags 방식을 사용하거나 htm을 사용할 수 있습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"아래는 ftags를 사용한 예시입니다."}),e(l,{language:"html",code:`<!DOCTYPE html>
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
</html>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["예제에서는 flMount를 사용했지만 fMount를 사용할 수도 있습니다.",e("br",{}),e("br",{}),"fMount를 사용하면 lstate와 같은 확장 기능이 필요하지 않기 때문에 helper 리소스를 별도로 로드하지 않아도 되므로, 더 적은 네트워크 비용으로 사용할 수 있습니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:["브라우저에서 직접 로드하는 방식으로 사용할 때 ftags가 매우 유용합니다.",e("br",{}),e("br",{}),"ftags 외에도 htm을 이용하여 사용하는 방법이 있습니다. 이 방법은 다른 섹션에서 더 자세히 설명하겠습니다."]}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4",children:"ES 모듈 빌드 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"ESM으로 빌드된 버전을 사용하면 ES 모듈 문법으로 사용할 수 있습니다. 대부분의 최신 브라우저는 ES 모듈을 기본적으로 지원하므로, 다음과 같이 CDN에서 네이티브 ES 모듈로 Lithent를 사용할 수 있습니다:"}),e(l,{language:"html",code:`<!DOCTYPE html>
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
</html>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4",children:"보안상의 이유로, ES 모듈은 http:// 또는 https:// 프로토콜에서만 동작합니다. 즉, 브라우저가 웹에서 페이지를 열 때 사용하는 프로토콜입니다. 로컬 컴퓨터에서 ES 모듈을 사용하려면 파일을 직접 열지 말고(file://), 로컬 HTTP 서버를 통해 제공해야 합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/mounter",onClick:t=>{t.preventDefault(),y("/guide/mounter")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Mounter →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Lithent의 핵심 개념인 Mounter에 대해 알아보세요.",e("br",{}),"컴포넌트를 생성하고 초기화하는 방법을 배워봅시다."]})]})})]}),Vo=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Mounter"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"mount"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["마운터는 mount 함수의 인자로서 포함되는 함수입니다.",e("br",{}),"컴포넌트가 처음 그려질 때"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"단 한 번 호출"}),"됩니다. 컴포넌트의 상태와 메서드를 정의합니다.",e("br",{}),e("br",{}),"아래 예제는 초기값 0을 갖는 count 라는 상태와, 값을 1씩 증가시키는 increase라는 메서드를 정의되어 있습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["mount 함수의 첫번째 인자로서 꺼내어 사용할수 있는",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"renew"}),"는 컴포넌트 갱신 함수입니다.",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Renewer"}),"섹션에서 더 자세히 다룹니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"저 마운트 함수는 jsx 표현식이 있는 또 다른 함수를 리턴하고 있는데, 업데이터라고 합니다. 업데이터는 다음 단계에서 더 자세히 다루겠습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Lithent는 네이티브 클로저 기반의 상태관리를 컨셉으로 하기 때문에, 일반적인 변수 정의를 상태값으로 활용하고 renew api를 이용해 갱신하는것이 기본 컨셉입니다.",e("br",{}),e("br",{}),"하지만 보통 상태변경이 즉각적으로 ui에 반영되는 React-like 방식에 익숙하기 때문에 어색할 수 있으며, 상황에따라 renew api를 이용하는 방식이 쓸대없이 불편할 수 있습니다.",e("br",{}),e("br",{}),"mount 대신",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lmount"}),"와",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"lstate"}),"를 함께 사용하면 를 사용하면 상태변경이 즉각적으로 ui변경을 트리거 할수 있습니다. 아래 예제를 보면 lstate를 사용하여 상태를 저장하고, lstate의 value 속성이 변경되면 즉각적으로 ui에 반영됩니다."]}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["lstate 덕분에 renew api의 필요성이 없어졌으므로 renew를 제공하지 않는 lmount를 사용하여 더 간결하게 컴포넌트를 정의하여 사용 가능합니다.",e("br",{}),e("br",{}),"lstate를 사용하므로서 core모듈 외에 별도의 helper 모듈을 추가로 사용해야 하므로 번들사이즈가 약간 늘어날 수 있는 단점이 있지만 유용합니다.",e("br",{}),e("br",{}),"이 모드도 여전히 클로저를 이용한 상태관리인 점은 마찬가지지만 lstate에서 값 변경시 renew 호출을 대신해주므로 사용자는 클로저기반으로 동작한다는 Lithent의 멘탈 모델 인지가 약해지는 단점이 있습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"데이터 가져오기 예시"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["마운터에서 데이터를 가져오는 것은",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"특수한 상황"}),"에 사용되는 패턴입니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"컴포넌트와 생명주기를 함께하는 데이터를 딱 한 번만 가져올 때"}),"유용합니다. 마운터는 컴포넌트가 처음 생성될 때 단 한 번만 실행되므로, 이후 props가 변경되어도 데이터를 다시 가져오지 않습니다.",e("br",{}),e("br",{}),"예를 들어, URL의 ID 파라미터로 특정 상세 페이지에 접근했을 때, 그 ID에 해당하는 데이터를 한 번만 로드하면 되는 경우에 적합합니다. 만약 props 변경에 따라 데이터를 다시 가져와야 한다면, updateCallback이나 effect 같은 다른 방법을 사용해야 합니다."]}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"아래는 포켓몬 이름을 props로 받아서, 컴포넌트 마운트 시 단 한 번 API를 호출하는 예제입니다. loading 상태를 통해 로딩 중임을 사용자에게 알리고, 데이터를 가져온 후 화면을 업데이트합니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["loadDetail 함수는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"컴포넌트가 처음 마운트될 때 단 한 번만 실행"}),"됩니다."]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","이후 다른 포켓몬을 보고 싶다면, 이 컴포넌트는 적합하지 않습니다. 버튼 클릭으로 다른 포켓몬 데이터를 가져와야 한다면 마운터가 아닌 이벤트 핸들러에서 처리해야 하고, props가 변경될 때마다 새로운 데이터를 가져와야 한다면"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"updateCallback"}),"이나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"effect"}),"를 사용해야 합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/updater",onClick:t=>{t.preventDefault(),y("/guide/updater")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Updater →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["마운터가 단 한 번 실행된다면, Updater는 상태가 변경될 때마다 호출됩니다.",e("br",{}),"새로운 Virtual DOM을 생성하고 화면을 업데이트하는 Updater의 동작 원리를 알아보세요."]})]})})]}),zo=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Updater"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Updater란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Updater는 마운터가 반환하는 함수입니다. 마운터가 컴포넌트 생성 시"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"단 한 번만 실행"}),"되는 것과 달리, Updater는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"상태가 변경될 때마다 호출"}),"됩니다.",e("br",{}),e("br",{}),"Updater의 역할은 현재 상태를 기반으로"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"새로운 Virtual DOM을 생성"}),"하는 것입니다. Lithent는 이전 Virtual DOM과 새로운 Virtual DOM을 비교(diffing)하여 실제로 변경된 부분만 실제 DOM에 반영합니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"위 예제에서 화살표 함수로 반환되는 부분이 Updater입니다. renew()가 호출될 때마다 이 함수가 다시 실행되어 새로운 Virtual DOM을 생성합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"클로저를 통한 상태 접근"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Updater는 마운터 내부에서 정의되므로, 클로저를 통해 마운터에서 선언한 모든 변수와 함수에 접근할 수 있습니다. 이것이 Lithent의"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"클로저 기반 상태 관리"}),"의 핵심입니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Updater 내부에서 todos, inputValue, addTodo, removeTodo 등 마운터에서 정의한 모든 것을 자유롭게 사용할 수 있습니다. 이는 JavaScript의 클로저 특성을 활용한 것입니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount에서의 Updater"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lmount를 사용할 때도 Updater의 개념은 동일합니다. 차이점은 renew를 명시적으로 호출하지 않아도 lstate 값이 변경될 때 자동으로 Updater가 호출된다는 점입니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lstate의 value를 변경하면 내부적으로 renew가 자동 호출되어 Updater가 실행됩니다. 결과적으로 새로운 Virtual DOM이 생성되고 화면이 업데이트됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Updater 실행 흐름"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent 컴포넌트의 업데이트 흐름은 다음과 같습니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"상태 변경 (변수 값 변경 또는 lstate.value 변경)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"renew() 호출 (수동 또는 lstate에 의해 자동)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Updater 함수 실행 → 새로운 Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"이전 Virtual DOM과 새로운 Virtual DOM 비교(Diffing)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"변경된 부분만 실제 DOM에 반영(Patching)"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이러한 흐름을 통해 Lithent는 효율적으로 화면을 업데이트합니다. Updater가 매번 전체 Virtual DOM을 반환하지만, 실제 DOM 조작은 변경된 부분에만 이루어지므로 성능이 최적화됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/props",onClick:t=>{t.preventDefault(),y("/guide/props")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Props →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트 간 데이터를 전달하는 Props에 대해 알아보세요.",e("br",{}),"부모 컴포넌트에서 자식 컴포넌트로 데이터와 함수를 전달하는 방법을 배워봅시다."]})]})})]}),Jo=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Props"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Props란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Props는 부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법입니다.",e("br",{}),e("br",{}),"Props는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"마운터의 두 번째 인자"}),"로 제공되며,"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"Updater의 첫 번째 인자"}),"로도 제공됩니다. 컴포넌트의 생명주기 동안 동일한 참조를 유지합니다."]}),e(l,{language:"tsx",code:`import { mount, render } from 'lithent';

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
);`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"TypeScript를 사용할 때는 mount 함수의 제네릭으로 Props 타입을 정의할 수 있습니다. 이를 통해 타입 안정성을 확보할 수 있습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Props 접근 방법과 주의사항"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Props는 컴포넌트의 생명주기 동안 동일한"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"참조(reference)"}),"를 유지합니다. 이는 매우 중요한 특성으로, Props에 접근하는 방식에 따라 다른 결과를 얻을 수 있습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["위 예제에서 버튼을 클릭하면:",e("br",{}),e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"props.count"})," ","- ✅ 1, 2, 3... 정상적으로 증가",e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"countFromMounter"})," ","- ❌ 0으로 고정 (primitive 값 복사)",e("br",{}),"•"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"countFromUpdater"})," ","- ✅ 1, 2, 3... 정상적으로 증가"]}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 중요:"})," 마운터에서 props를 구조분해 할당하면 그 시점의 값이 ",e("strong",{children:"복사"}),'됩니다. Primitive 타입(number, string, boolean)의 경우 "call by value"로 동작하므로, 이후 props가 업데이트되어도 마운터에서 분해한 변수는 업데이트되지 않습니다.',e("br",{}),e("br",{}),"항상 최신 값을 얻으려면"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"props.속성명"}),"으로 직접 접근하거나, Updater에서 받은 props를 사용하세요."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"함수를 Props로 전달하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Props를 통해 데이터뿐만 아니라 함수도 전달할 수 있습니다. 이를 통해 자식 컴포넌트에서 부모 컴포넌트의 상태를 변경할 수 있습니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"함수는 참조 타입이므로, props를 통해 전달된 함수는 항상 부모 컴포넌트의 클로저를 유지합니다. 따라서 자식 컴포넌트에서 부모의 상태를 안전하게 변경할 수 있습니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"객체와 배열 Props"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"객체나 배열을 props로 전달할 때는 참조가 전달되므로, 마운터에서 구조분해 할당을 해도 객체/배열 내부의 속성은 최신 상태를 유지합니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"객체나 배열은 참조 타입이므로, 마운터에서 구조분해 할당을 하더라도 그 참조를 복사하는 것입니다. 따라서 객체/배열 내부의 값이 변경되면 정상적으로 업데이트됩니다."}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","객체나 배열을 props로 전달할 때는 불변성(immutability)을 유지하는 것이 좋습니다. 객체의 속성을 직접 변경하는 대신, 새로운 객체를 생성하여 전달하면 예측 가능한 상태 관리가 가능합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount에서의 Props"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lmount를 사용할 때도 Props의 동작 방식은 동일합니다. renew가 없을 뿐, props 접근 방법과 주의사항은 mount와 같습니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/children",onClick:t=>{t.preventDefault(),y("/guide/children")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core: Children →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트가 감싸는 자식 요소들인 Children에 대해 알아보세요.",e("br",{}),"Lithent에서 children이 props와 별도로 관리되는 방식을 배워봅시다."]})]})})]}),Wo=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Children"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Children이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Children은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트가 감싸고 있는 자식 요소들"}),"입니다.",e("br",{}),e("br",{}),"Lithent에서는 React와 달리"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"children이 props에 포함되지 않고 별도의 인자로 전달"}),"됩니다. 이는 props와 children을 명확히 분리하여 코드의 의도를 더 명확하게 만드는 Lithent의 설계 철학입니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
</Card>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"React와의 차이점"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent는 children을 props와 별도로 관리함으로써 구조적 명확성을 제공합니다."}),e("div",{class:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"React"}),e(l,{language:"tsx",code:`// React: children이 props에 포함됨
const Card = ({ title, children }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};`})]}),e("div",{children:[e("h4",{class:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"Lithent"}),e(l,{language:"tsx",code:`// Lithent: children이 별도 인자
const Card = mount(
  (renew, props, children) => {
    return () => (
      <div class="card">
        <h2>{props.title}</h2>
        <div>{children}</div>
      </div>
    );
  }
);`})]})]}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 왜 별도 인자로?"})," ","props는 컴포넌트의 설정 데이터이고, children은 컴포넌트가 감싸는 구조입니다. 이 둘을 분리함으로써 각각의 역할이 명확해지고, 타입 안전성도 향상됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"mount에서 children 사용"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
</Container>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"lmount에서 children 사용"}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';

const Container = lmount<{ width: number }>(
  (props, children) => {  // lmount는 renew 없이 props, children만
    return () => (
      <div style={{ width: \`\${props.width}px\` }}>
        {children}
      </div>
    );
  }
);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Mounter vs Updater에서의 children"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["중요한 특징:"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"children은 Mounter에서만 제공되고, Updater에서는 제공되지 않습니다."}),e("br",{}),e("br",{}),"Mounter는 컴포넌트가 처음 마운트될 때 실행되며, 이때 children이 함께 전달됩니다. 하지만 Updater는 props가 변경될 때만 실행되며, children은 이미 Mounter에서 결정되었으므로 다시 전달되지 않습니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
);`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 클로저 캡처:"})," ","Updater에서 children을 직접 인자로 받지는 않지만, Mounter에서 선언된 children을 클로저를 통해 접근할 수 있습니다. children이 변경되면 부모 컴포넌트의 리렌더링으로 전체 컴포넌트가 다시 평가되므로, Updater만 실행되는 경우(props만 변경)에는 기존 children을 그대로 사용합니다."]})}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"왜 Updater에서 children을 제공하지 않을까?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:[e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"1. Updater는 props 변경에만 반응"}),e("br",{}),"Updater는 컴포넌트의 props가 변경될 때만 실행됩니다. children이 변경되는 경우는 부모 컴포넌트가 리렌더링되면서 전체 컴포넌트 트리가 다시 평가되므로, Updater 시점에 children을 전달할 필요가 없습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"2. 클로저를 통한 접근으로 충분"}),e("br",{}),"Mounter에서 받은 children은 클로저를 통해 Updater에서도 자유롭게 접근할 수 있습니다. 별도로 인자를 전달하지 않아도 동일한 children 참조를 사용할 수 있습니다.",e("br",{}),e("br",{}),e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"3. 명확한 책임 분리"}),e("br",{}),"Mounter는 컴포넌트의 초기 구조(children 포함)를 설정하고, Updater는 props 데이터 변경에만 집중합니다. 이러한 분리가 각 함수의 역할을 더 명확하게 만듭니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"내부 구조"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Lithent 내부적으로 children은 가상 DOM 구조에서 props와 별도로 관리됩니다."}),e(l,{language:"typescript",code:`// Lithent 내부 구조 (wDom.ts)
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
};`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 내부 구조:"})," ","Lithent는 일반 요소의 children과 컴포넌트의 children을 구분하여 관리합니다. 컴포넌트의 경우 compProps와 compChild로 별도 저장되어 업데이트 시 효율적으로 처리됩니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"실용적인 예제"}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4",children:"레이아웃 컴포넌트"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
</Layout>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"조건부 렌더링"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
</Accordion>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Children 조작"}),e(l,{language:"tsx",code:`import { mount, Fragment } from 'lithent';

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
// </ul>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"슬롯 패턴 (Named Children)"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
</Card>`}),e("h3",{class:"text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6",children:"Render Props 패턴"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';
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
</MouseTracker>`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Children 타입"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Children은 WDom 배열 타입입니다. TypeScript를 사용할 때 타입을 명시할 수 있습니다."}),e(l,{language:"typescript",code:`import { mount, WDom } from 'lithent';

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
);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ props.children 없음:"})," Lithent에서는 props.children으로 접근할 수 없습니다. 항상 별도의 children 인자를 사용하세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 인자 순서:"})," mount는 (renew, props, children) 순서이고, lmount는 (props, children) 순서입니다. 순서를 바꾸지 마세요.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ children은 배열:"})," children은 항상 WDom[] 배열입니다. 단일 child라도 배열 형태로 전달됩니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ Updater에서 제공 안 됨:"})," children은 Mounter에서만 인자로 제공되며, Updater에서는 제공되지 않습니다. 하지만 클로저를 통해 Mounter의 children에 접근할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/renewer",onClick:t=>{t.preventDefault(),y("/guide/renewer")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"Core: Renewer →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["Children 개념을 마스터했습니다!",e("br",{}),"이제 컴포넌트를 업데이트하는 Renewer에 대해 알아봅시다."]})]})})]}),Go=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Renewer"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"renew()란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["renew()는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트를 업데이트하는 핵심 함수"}),"입니다. mount 함수의 첫 번째 인자로 제공되며, 상태가 변경되었을 때 이 함수를 호출하여 UI를 업데이트합니다.",e("br",{}),e("br",{}),"renew()를 호출하면 Updater 함수가 다시 실행되어 새로운 Virtual DOM이 생성되고, 이전 Virtual DOM과 비교하여 변경된 부분만 실제 DOM에 반영됩니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["renew()를 호출하지 않으면 상태가 변경되어도 화면이 업데이트되지 않습니다. 이것이 Lithent의"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"명시적 업데이트"})," ","철학입니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언제 renew()를 호출해야 할까?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["renew()는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"상태가 변경되어 화면을 업데이트해야 할 때"})," ","호출합니다. 일반적으로 이벤트 핸들러 내부에서 상태를 변경한 후 호출합니다."]}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"위 예제처럼 상태를 변경하는 모든 이벤트 핸들러에서 renew()를 호출하여 화면을 업데이트합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"비동기 작업과 renew()"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"비동기 작업(API 호출, setTimeout 등)의 결과로 상태를 업데이트할 때도 renew()를 호출해야 합니다."}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"비동기 작업의 각 단계(시작, 성공, 실패)에서 상태가 변경될 때마다 renew()를 호출하여 UI를 업데이트합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"renew()의 동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"renew()가 호출되면 다음과 같은 과정이 진행됩니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"renew() 호출"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"Updater 함수 실행 → 새로운 Virtual DOM 생성"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"이전 Virtual DOM과 새로운 Virtual DOM 비교(Diffing)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"변경된 부분만 실제 DOM에 반영(Patching)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"updateCallback 훅 실행 (등록된 경우)"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 과정을 통해 Lithent는 효율적으로 화면을 업데이트합니다. 전체 DOM을 다시 그리는 것이 아니라, 변경된 부분만 업데이트하므로 성능이 최적화됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"renew() 최적화"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"renew()를 불필요하게 자주 호출하면 성능이 저하될 수 있습니다. 다음과 같은 방법으로 최적화할 수 있습니다:"}),e(l,{language:"tsx",code:`import { mount } from 'lithent';

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
});`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","대부분의 경우 일반적인 renew() 호출로 충분합니다. 위와 같은 최적화는 매우 빈번하게 업데이트가 발생하는 특수한 경우에만 필요합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"lmount에서는 renew가 필요없다"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lmount와 lstate를 사용하면 renew()를 명시적으로 호출할 필요가 없습니다. lstate의 value가 변경되면 자동으로 renew()가 호출됩니다."}),e(l,{language:"tsx",code:`import { lmount } from 'lithent';
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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"lstate를 사용하면 개발이 편리하지만, renew() 호출 시점을 명시적으로 제어할 수 없다는 trade-off가 있습니다. 프로젝트의 요구사항에 따라 mount와 lmount 중 적합한 방식을 선택하세요."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음단계"}),e("div",{class:"grid gap-6 mt-6",children:e("a",{href:"/guide/render",onClick:t=>{t.preventDefault(),y("/guide/render")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Render →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트를 실제 DOM에 렌더링하는 방법을 알아보세요.",e("br",{}),"render 함수의 사용법과 컴포넌트를 마운트/언마운트하는 방법을 배워봅시다."]})]})})]}),Xo=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Render"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"render() 함수란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["render() 함수는"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트를 실제 DOM에 마운트"}),"하는 함수입니다. Virtual DOM을 실제 DOM으로 변환하여 지정한 컨테이너 요소에 렌더링합니다.",e("br",{}),e("br",{}),"render() 함수는"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"destroy 함수를 반환"}),"하여, 나중에 컴포넌트를 언마운트할 수 있습니다."]}),e(l,{language:"tsx",code:`import { render, mount } from 'lithent';

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
// destroy();`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"render() 함수의 첫 번째 인자는 렌더링할 Virtual DOM이고, 두 번째 인자는 컨테이너 요소입니다. 컨테이너를 지정하지 않으면 기본적으로 document.body에 렌더링됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"render() 함수의 시그니처"}),e(l,{language:"tsx",code:`render(
  wDom: VirtualDOM,           // 렌더링할 Virtual DOM
  wrapElement?: HTMLElement,  // 컨테이너 요소 (기본값: document.body)
  afterElement?: HTMLElement  // insertBefore 참조 요소 (선택적)
): () => void                 // destroy 함수 반환`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["render() 함수는 3개의 매개변수를 받습니다:",e("br",{}),e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"wDom"}),": 렌더링할 Virtual DOM (필수)",e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"wrapElement"}),": 컨테이너 요소 (선택적, 기본값: document.body)",e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"afterElement"}),": 특정 요소 앞에 삽입할 때 사용하는 참조 요소 (선택적)"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"기본 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"가장 일반적인 사용법은 컴포넌트를 특정 DOM 요소에 렌더링하는 것입니다."}),e(l,{language:"tsx",code:`import { render, mount } from 'lithent';

const Greeting = mount(() => {
  return () => <h1>Hello, Lithent!</h1>;
});

// HTML의 #app 요소에 렌더링
render(<Greeting />, document.getElementById('app'));

// 또는 document.querySelector 사용
render(<Greeting />, document.querySelector('.container'));

// 컨테이너를 지정하지 않으면 body에 렌더링
render(<Greeting />);`}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"언마운트하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["render() 함수가 반환하는 destroy 함수를 호출하면 컴포넌트를 DOM에서 제거하고, 등록된 이벤트 리스너를 정리하며, 등록된 cleanup 콜백을 실행합니다.",e("br",{}),e("br",{}),"컴포넌트가 언마운트될 때 정리 작업(타이머 해제, 이벤트 리스너 제거 등)이 필요하다면"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"mountCallback 훅"}),"을 사용합니다. mountCallback에서 cleanup 함수를 반환하면, 컴포넌트가 언마운트될 때 자동으로 실행됩니다."]}),e(l,{language:"tsx",code:`import { render, mount, mountCallback } from 'lithent';

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
}, 5000);`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["destroy() 함수를 호출하면:",e("br",{}),e("br",{}),"1. mountCallback이 반환한 cleanup 함수 실행",e("br",{}),"2. 모든 이벤트 리스너 제거",e("br",{}),"3. DOM에서 요소 제거"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"insertBefore로 특정 위치에 삽입하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"세 번째 매개변수인 afterElement를 사용하면 특정 요소 앞에 컴포넌트를 삽입할 수 있습니다."}),e(l,{language:"tsx",code:`import { render, mount } from 'lithent';

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
// </ul>`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 기능은 동적으로 특정 위치에 컴포넌트를 삽입해야 할 때 유용합니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"여러 컴포넌트 렌더링하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"여러 개의 독립적인 컴포넌트를 각각 다른 위치에 렌더링할 수 있습니다."}),e(l,{language:"tsx",code:`import { render, mount } from 'lithent';

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
// destroyContent();`}),e("div",{class:"border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed",children:[e("span",{class:"font-medium text-gray-700 dark:text-gray-300",children:"💡 참고:"})," ","대부분의 경우 하나의 루트 컴포넌트만 렌더링하는 것이 권장됩니다. 여러 컴포넌트를 렌더링해야 한다면, 하나의 부모 컴포넌트 안에 자식 컴포넌트로 구성하는 것이 상태 관리와 데이터 흐름 측면에서 유리합니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"render()의 동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"render() 함수가 호출되면 다음과 같은 과정이 진행됩니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:"Virtual DOM을 실제 DOM 요소로 변환 (wDomToDom)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"컨테이너에 요소 추가 (appendChild 또는 insertBefore)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"mountCallback 훅 실행 (등록된 경우)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"mountReadyCallback 훅 실행 (등록된 경우)"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"destroy 함수 반환"})]})]})}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"이 과정을 통해 Virtual DOM이 실제 브라우저 화면에 표시되고, 라이프사이클 훅이 적절한 순서로 실행됩니다."}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/guide/portal",onClick:t=>{t.preventDefault(),y("/guide/portal")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Portal →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트를 부모 DOM 계층 외부로 렌더링하는 Portal 기능을 알아보세요.",e("br",{}),"모달, 툴팁 등을 구현할 때 유용한 Portal의 사용법을 배워봅시다."]})]}),e("a",{href:"/examples/16",onClick:t=>{t.preventDefault(),y("/examples/16")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"예제: insertBefore + Destroy →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"기존 실제 DOM 사이에 Lithent 컴포넌트를 insertBefore 모드로 삽입하고, destroy 함수로 정리하는 실전 예제를 확인해 보세요."})]})]})]}),qo=()=>e("div",{class:"prose prose-lg dark:prose-invert max-w-none",children:[e("h1",{class:"text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6",children:"Portal"}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Portal이란?"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Portal은"," ",e("strong",{class:"font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded",children:"컴포넌트를 부모 DOM 계층 외부로 렌더링"}),"하는 기능입니다.",e("br",{}),e("br",{}),"일반적으로 컴포넌트는 부모의 DOM 트리 안에 렌더링됩니다. 하지만"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"모달(Modal)"}),"이나"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"툴팁(Tooltip)"}),"처럼 화면 위에 떠 있어야 하는 UI는 부모의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"overflow: hidden"})," ","이나"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"z-index"})," ","때문에 가려지거나 잘릴 수 있습니다.",e("br",{}),e("br",{}),"Portal을 사용하면 이런 문제를 해결할 수 있습니다. 컴포넌트의 상태와 생명주기는 부모와 함께 유지하면서도, DOM 상에서는 완전히 다른 위치에 렌더링됩니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"가장 간단한 Portal 사용법"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["Portal을 사용하는 가장 일반적인 방법은"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"document.body"}),"에 렌더링하는 것입니다. 모달을 예로 들어보겠습니다:"]}),e(l,{language:"tsx",code:`import { mount, portal } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["위 예제에서 App 컴포넌트의 컨테이너에"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"overflow: hidden"}),"이 적용되어 있지만, Modal은 document.body에 렌더링되므로 아무 문제없이 화면 전체를 덮을 수 있습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Portal API"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"portal() 함수는 두 개의 인자를 받습니다:"}),e(l,{language:"tsx",code:`import { portal } from 'lithent';

portal(
  wDom,           // 렌더링할 Virtual DOM
  targetElement   // 대상 HTMLElement (예: document.body)
)`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"wDom"}),": 렌더링할 컴포넌트나 JSX 요소",e("br",{}),"•"," ",e("strong",{class:"font-semibold text-gray-900 dark:text-white",children:"targetElement"}),": Portal이 렌더링될 실제 DOM 요소"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"HTML에 미리 정의된 컨테이너 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"대규모 앱에서는 HTML에 Portal 전용 컨테이너를 미리 만들어두는 것이 좋습니다. 이렇게 하면 모달, 툴팁 등을 계층적으로 관리할 수 있습니다:"}),e(l,{language:"html",code:`<!-- index.html -->
<!DOCTYPE html>
<html>
<body>
  <div id="root"></div>
  <!-- Portal 전용 컨테이너들 -->
  <div id="modal-root"></div>
  <div id="tooltip-root"></div>
</body>
</html>`}),e(l,{language:"tsx",code:`import { mount, portal } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["이 방식의 장점:",e("br",{}),e("br",{}),"• 모달, 툴팁 등을 용도별로 분리하여 z-index 관리가 쉬움",e("br",{}),"• CSS 스타일링이 명확해짐",e("br",{}),"• 디버깅 시 DOM 구조 파악이 쉬움"]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"중첩된 컴포넌트에서 Portal 사용하기"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Portal은 깊게 중첩된 컴포넌트에서도 작동합니다. 컴포넌트의 상태와 생명주기는 부모와 함께 유지됩니다:"}),e(l,{language:"tsx",code:`import { mount, portal } from 'lithent';

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
});`}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:["이 예제에서 UserCard 컴포넌트는 App의 자식이고, ConfirmDialog는 UserCard의 자식입니다. 하지만 Dialog는 document.body에 렌더링되므로 App의"," ",e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"overflow: hidden"}),"에 영향받지 않습니다."]}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"Portal의 동작 원리"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6",children:"Portal은 내부적으로 다음과 같이 동작합니다:"}),e("div",{class:"border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r",children:e("ol",{class:"space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300",children:[e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"1."}),e("span",{children:[e("code",{class:"px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm",children:"portal(wDom, element)"})," ","호출 시 'portal' 타입의 특수한 Virtual DOM 노드 생성"]})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"2."}),e("span",{children:"렌더링 시 Portal 노드는 부모 DOM 트리에 추가되지 않고, 지정된 HTMLElement를 컨테이너로 사용"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"3."}),e("span",{children:"Portal 내부의 컴포넌트는 부모 컴포넌트와 동일한 상태와 생명주기 공유"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"4."}),e("span",{children:"부모가 renew()를 호출하면 Portal 내부도 함께 업데이트됨"})]}),e("li",{class:"flex items-start",children:[e("span",{class:"font-semibold text-[#42b883] mr-3 flex-shrink-0",children:"5."}),e("span",{children:"부모가 언마운트되면 Portal 내부도 함께 정리됨"})]})]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"주의사항"}),e("div",{class:"border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r",children:e("p",{class:"text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed",children:[e("span",{class:"font-medium",children:"⚠️ 이벤트 버블링:"})," Portal로 렌더링된 요소에서 발생한 이벤트는 ",e("strong",{children:"컴포넌트 트리를 따라 버블링"}),"됩니다. DOM 트리와는 무관합니다. 예를 들어, Modal 내부의 클릭 이벤트가 부모 컴포넌트로 전파될 수 있으므로"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"e.stopPropagation()"}),"을 사용해야 할 수 있습니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ CSS 스타일:"})," Portal로 렌더링된 요소는 대상 위치의 CSS를 상속받습니다. 부모 컴포넌트의 스타일은 상속되지 않으므로, Portal 컴포넌트는 독립적인 스타일을 가져야 합니다.",e("br",{}),e("br",{}),e("span",{class:"font-medium",children:"⚠️ 서버 사이드 렌더링:"})," Portal은 브라우저 환경에서만 동작합니다. SSR 환경에서는"," ",e("code",{class:"px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm",children:"typeof window !== 'undefined'"})," ","체크가 필요할 수 있습니다."]})}),e("hr",{class:"border-t border-gray-200 dark:border-gray-700 my-10"}),e("h2",{class:"text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4",children:"다음 단계"}),e("div",{class:"grid gap-6 mt-6",children:[e("a",{href:"/guide/mount-hooks",onClick:t=>{t.preventDefault(),y("/guide/mount-hooks")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"기본 기능: Mount Hooks →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:["컴포넌트의 마운트 시점에 실행되는 mountCallback과 mountReadyCallback 훅에 대해 알아보세요.",e("br",{}),"컴포넌트 생명주기를 제어하는 방법을 배워봅시다."]})]}),e("a",{href:"/examples/20",onClick:t=>{t.preventDefault(),y("/examples/20")},class:"block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer",children:[e("h3",{class:"text-lg md:text-xl font-medium text-[#42b883] mb-2",children:"예제: 이미지 갤러리 라이트박스 →"}),e("p",{class:"text-sm md:text-base text-gray-700 dark:text-gray-300",children:"overflow:hidden 갤러리 밖으로 Portal을 사용해 전체 화면 라이트박스를 띄우는 예제를 직접 실행해 보세요."})]})]})]}),dr=t=>t.replace(/\/+$/,"")||"/",or={"/":On,"/guide/introduction":pt,"/ko/guide/introduction":$o,"/guide/quick-start":Ul,"/ko/guide/quick-start":jo,"/guide/mounter":Hl,"/ko/guide/mounter":Vo,"/guide/updater":_l,"/ko/guide/updater":zo,"/guide/props":Bl,"/ko/guide/props":Jo,"/guide/children":Fl,"/ko/guide/children":Wo,"/guide/renewer":$l,"/ko/guide/renewer":Go,"/guide/render":jl,"/ko/guide/render":Xo,"/guide/portal":Vl,"/ko/guide/portal":qo,"/guide/next-tick":nd,"/guide/mount-hooks":zl,"/guide/update-hooks":Jl,"/guide/mount-ready-hooks":Wl,"/guide/use-renew-hooks":Gl,"/guide/state":Xl,"/guide/lstate":ql,"/guide/computed":Kl,"/guide/effect":Yl,"/guide/store":Zl,"/guide/lstore":Ql,"/guide/state-ref":ed,"/guide/context":td,"/guide/lcontext":rd,"/guide/cache-update":ad,"/guide/vite-plugin":ld,"/guide/jsx-manual":dd,"/guide/ftags":od,"/guide/htm-tags":sd,"/guide/template-strings":id,"/guide/stateless":cd,"/examples/1":xd,"/examples/2":bd,"/examples/3":wd,"/examples/4":Td,"/examples/5":Pd,"/examples/6":Rd,"/examples/7":Hd,"/examples/8":$d,"/examples/9":Wd,"/examples/10":Kd,"/examples/11":ao,"/examples/12":io,"/examples/13":ho,"/examples/14":vo,"/examples/15":To,"/examples/16":Io,"/examples/17":Lo,"/examples/18":Ao,"/examples/19":Ho,"/examples/20":Fo},Ko=t=>{const r=dr(t),a=or[r];if(a)return a;if(r.startsWith("/ko")){const n=dr(r.replace(/^\/ko/,"")||"/");return or[n]||pt}return pt},Yo=v(t=>{const r=Ye.watch(t);return()=>{const a=Ko(r.route);return e("div",{class:"min-h-screen bg-white dark:bg-[#1b1b1f] transition-colors",children:[e(Dn,{}),e("div",{class:"mx-auto max-w-[1440px]",children:e("div",{class:"flex",children:[e(Pn,{}),e("main",{class:"flex-1 w-full min-w-0 px-6 md:px-12 py-8 max-w-full",children:e("div",{class:"max-w-full md:max-w-[43rem] page-shell",children:e(a,{})})})]})})]})}});ce(e(Yo,{}),document.body);
//# sourceMappingURL=index-Ca7Nc_NT.js.map
