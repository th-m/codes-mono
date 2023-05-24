import { createEffect, createMemo, createSignal, on, onMount } from "solid-js";
import { parseCookie, useLocation, useServerContext } from "solid-start";
import { A} from "solid-start";
import LoginButton from "./LoginButton";
import { fetchUser } from "~/models/users.client";


export default function NavBar() {
  const [user, setUser] = createSignal(null);
  
  const [dropdown, setDropdown] = createSignal(false);
  const location = useLocation();
  const active = (path: string) => {
    if (path.includes("/apps") && location.pathname.includes("/apps")) {
      return location.pathname == path
        ? "border-sky-600"
        : "border-transparent hover:border-sky-600";
    }
    return path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  };

  createEffect( async () => {
    console.log("Route Change",location.pathname)
    const data = await fetchUser();
    setUser(data);
  });

  return (
    <div>
      <nav class="bg-slate-900 relative">
        <ul class="container flex items-center p-3 text-gray-200">
          <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
            <A href="/">Home</A>
          </li>
          <li class={`border-b-2 ${active("/shop")} mx-1.5 sm:mx-6`}>
            <A href="https://shop.th-m.codes/">Shop</A>
          </li>
          <li class={`border-b-2 ${active("/Blog")} mx-1.5 sm:mx-6`}>
            <A href="https://Blog.th-m.codes/">Blog</A>
          </li>
          <li class={`border-b-2 ${active("/apps")} mx-1.5 sm:mx-6`}>
            <A href="/apps">Apps</A>
          </li>

          {/* <li class={`border-b-2 ${active("/apps")} mx-1.5 sm:mx-6`}>
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
              // class="text-white  hover:bg-sky-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              class={`mx-1.5 sm:mx-6  text-center inline-flex items-center`}
              type="button"
              onClick={() => setDropdown(!dropdown())}
            >
              Apps{" "}
              <svg
                class="w-4 h-4 ml-2"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
          </li> */}
          {!user() ? (
            <li
              class={`border-b-2 ${active(
                "/login"
              )} mx-1.5 sm:mx-6 justify-end justify-self-end`}
            >
              <LoginButton />
            </li>
          ) : (
            <li class={`border-b-2 ${active("/logout")} mx-1.5 sm:mx-6`}>
              <A href="/logout">Logout</A>
            </li>
          )}
        </ul>
      </nav>
      <div
        id="dropdown"
        class={`z-10 absolute left-14 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 ${
          !dropdown() ? "hidden" : ""
        }`}
      >
        <ul
          class="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          <li>
            <A
              onClick={() => setDropdown(!dropdown())}
              class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              href="/apps/hubspot"
            >
              Hubspot
            </A>
          </li>
          <li>
            <A
              onClick={() => setDropdown(!dropdown())}
              class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              href="/apps/shopify"
            >
              Shopify
            </A>
          </li>
          <li>
            <A
              onClick={() => setDropdown(!dropdown())}
              class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              href="/apps/slack"
            >
              Slack
            </A>
          </li>
        </ul>
      </div>
    </div>
  );
}
