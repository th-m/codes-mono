import { createSignal } from "solid-js";

interface AppInstallProps {
  app: string;
}
export default function AppInstall({ app }: AppInstallProps) {
  return (
    <div>
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        {app}
      </h1>
      <button class="w-[200px] rounded-full bg-gray-100 border-2 border-gray-300 focus:border-gray-400 active:border-gray-400 px-[2rem] py-[1rem]">
        Install this app
      </button>
    </div>
  );
}
