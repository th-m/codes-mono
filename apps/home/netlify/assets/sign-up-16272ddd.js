import{u as C,g as t,i as s,c as b,a as $,e as v,f,A,t as i,s as g}from"./entry-client-96f0c3bd.js";import{c as E,s as M}from"./browser-b4a9accc.js";const R=i('<div><label for="email"><div>Email Address</div><!#><!/></label><input type="email" name="email" id="email" aria-describedby="email-error" aria-autocomplete="inline">'),k=i('<div><label for="password"><div>Password</div><div class="small">Must have at least 6 characters.</div><!#><!/></label><input id="password" type="password" name="password" aria-autocomplete="inline" aria-describedby="password-error">'),F=i('<button type="submit">Sign up'),L=i('<input type="hidden" name="redirectTo">'),N=i('<div><div><input id="remember" name="remember" type="checkbox"><label for="remember">Remember me</label></div><div class="light"><span class="small">Already have an account? </span><!#><!/>'),P=i("<div><div>"),T=i('<div class="error small" id="email-error">'),q=i('<div class="error small" id="password-error">'),U=M.createFetcher("/_m/6e6f664191/signup",!0);function z(){const h=C(),[x,{Form:S}]=E(U),w=h.query.redirectTo??"/",l=x?.result?.errors;return(()=>{const _=t(P),y=_.firstChild;return s(y,b(S,{method:"post",noValidate:!0,get children(){return[(()=>{const e=t(R),r=e.firstChild,a=r.firstChild,n=a.nextSibling,[o,d]=$(n.nextSibling),c=r.nextSibling;return s(r,(()=>{const p=v(()=>!!l?.email);return()=>p()&&(()=>{const m=t(T);return s(m,()=>l?.email),m})()})(),o,d),f(()=>g(c,"aria-invalid",!!l?.email)),e})(),(()=>{const e=t(k),r=e.firstChild,a=r.firstChild,n=a.nextSibling,o=n.nextSibling,[d,c]=$(o.nextSibling),p=r.nextSibling;return s(r,(()=>{const m=v(()=>!!l?.password);return()=>m()&&(()=>{const u=t(q);return s(u,()=>l?.password),u})()})(),d,c),f(()=>g(p,"aria-invalid",!!l?.password)),e})(),t(F),(()=>{const e=t(L);return e.value=w,e})(),(()=>{const e=t(N),r=e.firstChild,a=r.nextSibling,n=a.firstChild,o=n.nextSibling,[d,c]=$(o.nextSibling);return s(a,b(A,{href:"/login",children:"Login"}),d,c),e})()]}})),_})()}export{z as default};