import{b as a,x as p,j as t,y as f,g as k,t as w}from"./entry-client.9d21cc98.js";import{c as x,s as y}from"./browser.7020d17b.js";const h=w('<main class="text-center mx-auto text-gray-700 p-4"><h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">Apps</h1><script src="https://cdn.getkolla.com/sdk/v2/index.js" defer>'),g=y.createFetcher("/_m/b269b8455a/tokenResponse",!0);function I(){const[o,r]=a(null),[i,c]=a(""),[l,d]=a(!1),[s,u]=x(g);return p(()=>{const e=setInterval(()=>{window&&window.kolla&&window.kolla.initialized&&(d(!0),clearInterval(e))},100)}),t(async()=>{const e=await f();r(e)}),t(async()=>{const e=o(),m=l();if(!e||!m)return;const n=new FormData;n.append("id",e.id),n.append("email",e.email),u(n)}),t(async()=>{!s.result||c(s.result.token)}),t(async()=>{const e=i();!e||!window?.kolla||(window.kolla.authenticate(e),window.kolla.openMarketplace())}),k(h)}export{I as default};
