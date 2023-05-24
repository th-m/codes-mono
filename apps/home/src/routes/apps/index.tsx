import { createEffect, createSignal, onMount } from "solid-js";
import { createServerAction$ } from "solid-start/server";

import { getConsumerToken } from "~/models/kolla.server";
import { fetchUser } from "~/models/users.client";
export interface Kolla {
  initialized: boolean;
  authenticated: boolean;
  isVisible: boolean;
  consumerToken: string;

  init: () => void;
  authenticate: (token: any) => Promise<void>;
  openMarketplace: () => Promise<void>;
  closeMarketplace: () => Promise<void>;
  // subscribe: <EventName extends keyof EventMap>(
  //   eventName: EventName,
  //   handler: EventMap[EventName],
  // ) => () => void;
  openConnector: (connectorID: string) => void;
  // getConnectorLinkedAccounts: (connectorID: string) => Promise<ConsumerDetails>;
  // getConnectors: () => ConnectorApp[];
  // getConsumer: () => ConsumerDetails;
  // asyncGetConsumer: () => Promise<ConsumerDetails>;
  // asyncGetConnectors: () => Promise<Connector[]>;
  getWidgetContainer: () => HTMLDivElement | undefined;
  getWidgetIframe: () => HTMLIFrameElement | undefined;
  _registerRenderHook: (id: string, hook: () => void) => void;
}

declare global {
  interface Window {
    kolla: Kolla;
  }
}

export default function ThirdParty() {
  const [user, setUser] = createSignal<{ email: string; id: string } | null>(
    null
  );
  const [token, setToken] = createSignal("");
  const [initialized, setInitialized] = createSignal(false);
  const [tokenResponse, getConsumerTokenAct] = createServerAction$(
    async (form: FormData, { request }) => {
      const id = form.get("id") as string;
      const email = (form?.get("email") ?? "") as string;
      if (!id) return;
      const tokenData = await getConsumerToken({
        consumer_id: id,
        metadata: { email: email },
      });
      return tokenData
    }
  );

  onMount(() => {
    const timer = setInterval(() => {
      if (window && window.kolla && window.kolla.initialized) {
        setInitialized(true);
        clearInterval(timer);
      }
    }, 100);
  });

  createEffect(async () => {
    const data = await fetchUser();
    setUser(data);
  });

  createEffect(async () => {
    const userData = user();
    const isInitialized = initialized();
    if (!userData || !isInitialized) return;
    const formData = new FormData();
    formData.append("id", userData.id);
    formData.append("email", userData.email);

    getConsumerTokenAct(formData);
  });
  
  createEffect(async () => {
    if(!tokenResponse.result) return;
    setToken(tokenResponse.result.token);
  });

  createEffect(async () => {
    const consumerToken = token();
    if (!consumerToken) return;
    if(!window?.kolla) return;
    window.kolla.authenticate(consumerToken);
    window.kolla.openMarketplace();
  });

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        Apps
      </h1>
      <script src="https://cdn.getkolla.com/sdk/v2/index.js" defer></script>
    </main>
  );
}
