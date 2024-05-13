var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function l(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function c(t,e){t.appendChild(e)}function r(t,e,n){t.insertBefore(e,n||null)}function s(t){t.parentNode.removeChild(t)}function u(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function a(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function m(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function p(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function h(t,e){e=""+e,t.data!==e&&(t.data=e)}let g;function v(t){g=t}function $(){if(!g)throw new Error("Function called outside component initialization");return g}function j(){const t=$();return(e,n)=>{const o=t.$$.callbacks[e];if(o){const l=function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(e,n);o.slice().forEach(e=>{e.call(t,l)})}}}const b=[],x=[],y=[],w=[],_=Promise.resolve();let E=!1;function k(t){y.push(t)}let M=!1;const L=new Set;function z(){if(!M){M=!0;do{for(let t=0;t<b.length;t+=1){const e=b[t];v(e),A(e.$$)}for(b.length=0;x.length;)x.pop()();for(let t=0;t<y.length;t+=1){const e=y[t];L.has(e)||(L.add(e),e())}y.length=0}while(b.length);for(;w.length;)w.pop()();E=!1,M=!1,L.clear()}}function A(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(k)}}const C=new Set;let T;function H(t,e){t&&t.i&&(C.delete(t),t.i(e))}function N(t,e,n,o){if(t&&t.o){if(C.has(t))return;C.add(t),T.c.push(()=>{C.delete(t),o&&(n&&t.d(1),o())}),t.o(e)}}function S(t){t&&t.c()}function B(t,n,i){const{fragment:c,on_mount:r,on_destroy:s,after_update:u}=t.$$;c&&c.m(n,i),k(()=>{const n=r.map(e).filter(l);s?s.push(...n):o(n),t.$$.on_mount=[]}),u.forEach(k)}function q(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function F(t,e){-1===t.$$.dirty[0]&&(b.push(t),E||(E=!0,_.then(z)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function O(e,l,i,c,r,u,a=[-1]){const d=g;v(e);const f=l.props||{},m=e.$$={fragment:null,ctx:null,props:u,update:t,not_equal:r,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:[]),callbacks:n(),dirty:a};let p=!1;if(m.ctx=i?i(e,f,(t,n,...o)=>{const l=o.length?o[0]:n;return m.ctx&&r(m.ctx[t],m.ctx[t]=l)&&(m.bound[t]&&m.bound[t](l),p&&F(e,t)),n}):[],m.update(),p=!0,o(m.before_update),m.fragment=!!c&&c(m.ctx),l.target){if(l.hydrate){const t=function(t){return Array.from(t.childNodes)}(l.target);m.fragment&&m.fragment.l(t),t.forEach(s)}else m.fragment&&m.fragment.c();l.intro&&H(e.$$.fragment),B(e,l.target,l.anchor),z()}v(d)}class D{$destroy(){q(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}function I(t,e,n){const o=t.slice();return o[10]=e[n],o[12]=n,o}function P(t,e,n){const o=t.slice();return o[7]=e[n],o[9]=n,o}function G(t){let e;return{c(){e=a("div"),e.textContent=" ",p(e,"class","dot svelte-ocpwaz")},m(t,n){r(t,e,n)},d(t){t&&s(e)}}}function J(t){let e,n,o,l,i,u,g=t[10].emoji+"",v=t[10].selected&&G();function $(...e){return t[6](t[9],t[12],...e)}return{c(){e=a("div"),n=a("p"),o=d(g),i=f(),v&&v.c(),p(n,"id",l=t[9]+"-"+t[12]),p(n,"class","emoji svelte-ocpwaz"),p(e,"class","emoji-container svelte-ocpwaz")},m(t,l,s){r(t,e,l),c(e,n),c(n,o),c(e,i),v&&v.m(e,null),s&&u(),u=m(e,"click",$)},p(n,l){t=n,1&l&&g!==(g=t[10].emoji+"")&&h(o,g),t[10].selected?v||(v=G(),v.c(),v.m(e,null)):v&&(v.d(1),v=null)},d(t){t&&s(e),v&&v.d(),u()}}}function K(t){let e,n,o=t[7],l=[];for(let e=0;e<o.length;e+=1)l[e]=J(I(t,o,e));return{c(){e=a("div");for(let t=0;t<l.length;t+=1)l[t].c();n=f(),p(e,"class","row svelte-ocpwaz")},m(t,o){r(t,e,o);for(let t=0;t<l.length;t+=1)l[t].m(e,null);c(e,n)},p(t,i){if(3&i){let c;for(o=t[7],c=0;c<o.length;c+=1){const r=I(t,o,c);l[c]?l[c].p(r,i):(l[c]=J(r),l[c].c(),l[c].m(e,n))}for(;c<l.length;c+=1)l[c].d(1);l.length=o.length}},d(t){t&&s(e),u(l,t)}}}function Q(e){let n,o=e[0],l=[];for(let t=0;t<o.length;t+=1)l[t]=K(P(e,o,t));return{c(){n=a("div");for(let t=0;t<l.length;t+=1)l[t].c();p(n,"id","board"),p(n,"class","board svelte-ocpwaz")},m(t,e){r(t,n,e);for(let t=0;t<l.length;t+=1)l[t].m(n,null)},p(t,[e]){if(3&e){let i;for(o=t[0],i=0;i<o.length;i+=1){const c=P(t,o,i);l[i]?l[i].p(c,e):(l[i]=K(c),l[i].c(),l[i].m(n,null))}for(;i<l.length;i+=1)l[i].d(1);l.length=o.length}},i:t,o:t,d(t){t&&s(n),u(l,t)}}}function R(t,e,n){const o=j();let{emojis:l=[]}=e,i=0,c=[];var r;function s(t,e){let l=c[t],r=l[e];if(r.selected=!r.selected,l[e]=r,n(0,c[t]=l,c),i+=1,i>=4){u()&&o("bingo",!0)}let s=document.getElementById(t+"-"+e),a="ding",d=.1;r.selected?s.classList.add("emoji-spin"):(a="buzzer",d=.03,s.classList.remove("emoji-spin")),o("playSound",{name:a,volume:d})}function u(){let t=0;for(let e=0;e<5;++e){t=0;for(let n=0;n<5;++n){c[e][n].selected&&(t+=1)}if(5==t)return!0}for(let e=0;e<5;++e){t=0;for(let n=0;n<5;++n){c[n][e].selected&&(t+=1)}if(5==t)return!0}t=0;for(let e=0;e<5;++e){c[e][e].selected&&(t+=1)}if(5==t)return!0;t=0;for(let e=0;e<5;++e){c[e][4-e].selected&&(t+=1)}return 5==t}r=()=>{let t=[...l];for(let e=0;e<5;++e){let n=[];for(let o=0;o<5;++o){if(2===e&&2===o){n.push({emoji:"󠀠",selected:!0});continue}let l=Math.round(Math.random()*(t.length-1)),i=t[l];t.splice(l,1),n.push({emoji:i,selected:!1})}c.push(n)}n(0,c)},$().$$.on_mount.push(r);return t.$set=t=>{"emojis"in t&&n(2,l=t.emojis)},[c,s,l,i,o,u,(t,e,n)=>{s(t,e)}]}class U extends D{constructor(t){super(),O(this,t,R,Q,i,{emojis:2})}}function V(t,e,n){const o=t.slice();return o[6]=e[n],o}function W(e){let n;return{c(){n=a("div"),n.textContent=" ",p(n,"class","emoji svelte-18tta05")},m(t,e){r(t,n,e)},p:t,d(t){t&&s(n)}}}function X(t){let e,n;return{c(){e=a("p"),n=d(t[0]),p(e,"class","emoji svelte-18tta05")},m(t,o){r(t,e,o),c(e,n)},p(t,e){1&e&&h(n,t[0])},d(t){t&&s(e)}}}function Y(t){let e;return{c(){e=a("div"),e.innerHTML='<div class="emoji-selection blank svelte-18tta05"> </div> \n    ',p(e,"class","emoji-selection-container svelte-18tta05")},m(t,n){r(t,e,n)},d(t){t&&s(e)}}}function Z(t){let e,n,o,l,i=t[6]+"";return{c(){e=a("div"),n=a("p"),o=d(i),l=f(),p(n,"class","emoji-selection svelte-18tta05"),p(e,"class","emoji-selection-container svelte-18tta05")},m(t,i){r(t,e,i),c(e,n),c(n,o),c(e,l)},p(t,e){2&e&&i!==(i=t[6]+"")&&h(o,i)},d(t){t&&s(e)}}}function tt(e){let n,o,l,i,d,h,g,v,$;function j(t,e){return""!==t[0]?X:W}let b=j(e),x=b(e),y=e[1],w=[];for(let t=0;t<y.length;t+=1)w[t]=Z(V(e,y,t));let _=null;return y.length||(_=Y()),{c(){n=a("div"),o=a("div"),x.c(),l=f(),i=a("button"),d=a("span"),d.textContent="Spin",g=f(),v=a("div");for(let t=0;t<w.length;t+=1)w[t].c();_&&_.c(),p(o,"class","emoji-container svelte-18tta05"),p(i,"class","spin-button svelte-18tta05"),i.disabled=h=e[2]?"true":"",p(n,"id","board"),p(n,"class","board svelte-18tta05"),p(v,"class","selections svelte-18tta05")},m(t,s,u){r(t,n,s),c(n,o),x.m(o,null),c(n,l),c(n,i),c(i,d),r(t,g,s),r(t,v,s);for(let t=0;t<w.length;t+=1)w[t].m(v,null);_&&_.m(v,null),u&&$(),$=m(i,"click",e[3])},p(t,[e]){if(b===(b=j(t))&&x?x.p(t,e):(x.d(1),x=b(t),x&&(x.c(),x.m(o,null))),4&e&&h!==(h=t[2]?"true":"")&&(i.disabled=h),2&e){let n;for(y=t[1],n=0;n<y.length;n+=1){const o=V(t,y,n);w[n]?w[n].p(o,e):(w[n]=Z(o),w[n].c(),w[n].m(v,null))}for(;n<w.length;n+=1)w[n].d(1);w.length=y.length,y.length?_&&(_.d(1),_=null):_||(_=Y(),_.c(),_.m(v,null))}},i:t,o:t,d(t){t&&s(n),x.d(),t&&s(g),t&&s(v),u(w,t),_&&_.d(),$()}}}function et(t,e,n){const o=j();let{emojis:l=[]}=e,i="",c=[],r=!1;return t.$set=t=>{"emojis"in t&&n(4,l=t.emojis)},[i,c,r,function(){if(l.length<=0)return void o("done",!0);o("spin",!0),n(2,r=!0);let t=Date.now();window.requestAnimationFrame((function e(){let o=Math.round(Math.random()*(l.length-1));n(0,i=l[o]),Date.now()-t>500||l.length<=1?(c.push(i),n(1,c),l.splice(o,1),n(4,l),n(2,r=!1)):window.requestAnimationFrame(e)}))},l]}class nt extends D{constructor(t){super(),O(this,t,et,tt,i,{emojis:4})}}function ot(t){let e,n,o;return{c(){e=a("div"),n=a("div"),p(n,"class","message-text svelte-19iisxs"),p(e,"class","message svelte-19iisxs")},m(l,i,s){r(l,e,i),c(e,n),n.innerHTML=t[3],s&&o(),o=m(e,"click",t[5])},p(t,e){8&e&&(n.innerHTML=t[3])},d(t){t&&s(e),o()}}}function lt(t){let e;const n=new nt({props:{emojis:t[0]}});return n.$on("spin",t[9]),n.$on("done",t[10]),{c(){S(n.$$.fragment)},m(t,o){B(n,t,o),e=!0},p(t,e){const o={};1&e&&(o.emojis=t[0]),n.$set(o)},i(t){e||(H(n.$$.fragment,t),e=!0)},o(t){N(n.$$.fragment,t),e=!1},d(t){q(n,t)}}}function it(t){let e;const n=new U({props:{emojis:t[0]}});return n.$on("bingo",t[7]),n.$on("playSound",t[8]),{c(){S(n.$$.fragment)},m(t,o){B(n,t,o),e=!0},p(t,e){const o={};1&e&&(o.emojis=t[0]),n.$set(o)},i(t){e||(H(n.$$.fragment,t),e=!0)},o(t){N(n.$$.fragment,t),e=!1},d(t){q(n,t)}}}function ct(e){let n,o,l,i,u,d,h,g;return{c(){n=a("div"),n.innerHTML='<div class="logo-text svelte-19iisxs">\n        Emoji Bingo\n      </div>',o=f(),l=a("div"),i=a("div"),u=a("button"),u.innerHTML="<span>Play<span></span></span>",d=f(),h=a("div"),p(n,"class","logo logo-border-animation svelte-19iisxs"),p(l,"class","buttons svelte-19iisxs")},m(t,s,a){r(t,n,s),r(t,o,s),r(t,l,s),c(l,i),c(i,u),c(l,d),c(l,h),a&&g(),g=m(u,"click",e[6])},p:t,i:t,o:t,d(t){t&&s(n),t&&s(o),t&&s(l),g()}}}function rt(t){let e,n,l,i,c,u=t[1]&&ot(t);const d=[ct,it,lt],m=[];function h(t,e){return t[2]||st?t[2]?1:-1:0}return~(l=h(t))&&(i=m[l]=d[l](t)),{c(){u&&u.c(),e=f(),n=a("div"),i&&i.c(),p(n,"class","column-center svelte-19iisxs")},m(t,o){u&&u.m(t,o),r(t,e,o),r(t,n,o),~l&&m[l].m(n,null),c=!0},p(t,[c]){t[1]?u?u.p(t,c):(u=ot(t),u.c(),u.m(e.parentNode,e)):u&&(u.d(1),u=null);let r=l;l=h(t),l===r?~l&&m[l].p(t,c):(i&&(T={r:0,c:[],p:T},N(m[r],1,1,()=>{m[r]=null}),T.r||o(T.c),T=T.p),~l?(i=m[l],i||(i=m[l]=d[l](t),i.c()),H(i,1),i.m(n,null)):i=null)},i(t){c||(H(i),c=!0)},o(t){N(i),c=!1},d(t){u&&u.d(t),t&&s(e),t&&s(n),~l&&m[l].d()}}}let st=!1;function ut(t,e){let n=new Audio(t+".ogg");n.volume=e,n.play()}function at(t,e,n){let{emojis:o=[]}=e,l=!1,i=!1,c="";function r(t){n(3,c=t+"<br>Click to restart."),n(1,l=!0)}ut("theme",.1);return t.$set=t=>{"emojis"in t&&n(0,o=t.emojis)},[o,l,i,c,r,()=>location.reload(),()=>n(2,i=!0),()=>{r("BINGO!"),ut("cheer",.1)},t=>ut(t.detail.name,t.detail.volume),()=>ut("spin",.3),()=>{r("All done!"),ut("cheer",.1)}]}return new class extends D{constructor(t){super(),O(this,t,at,rt,i,{emojis:0})}}({target:document.body,props:{emojis:["🚕","🚗","🏎","📱","🚛","🚌","🚜","🚓","🐴","✈","🚴","🚈","🚑","🏍","🌉","👷","🐶","🛑","🚧","🛵","🚤","🚦","⛽","🚏","🦌","🛝","🅿","🚾","🐄"]}})}();
//# sourceMappingURL=bundle.js.map
