import { createMemo } from "solid-js";
import { A } from "solid-start";
import Counter from "~/components/Counter";
import { parseCookie, useServerContext } from "solid-start";
import { isServer } from "solid-js/web";

export default function LoginButton() {
//   const event = useServerContext();
//   const cookie = () =>
//     parseCookie(
//       isServer ? event.request.headers.get("cookie") ?? "" : document.cookie
//     );
//   const myValue = createMemo(() => {
//     const v = cookie();
//     console.log(v);
//     return v;
//   });

  // const fullName = createMemo(() => {
  //     const user = auth?.user()
  //     console.log(user);
  //     return `${user}`
  // })
  // console.log(fullName)
  // if(auth?.isAuthenticated()){
  //     return (
  //         <p>
  //             you are in
  //         </p>
  //     )
  // }
  return (
    <A href="/login">Login</A>
    // <button onClick={() => auth?.loginWithRedirect()} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Login</button>
    // <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Login</button>
  );
}
