import invariant from "tiny-invariant";

invariant(
  process.env.TH_M_CODES_KOLLA_KEY,
  "SESSION_SECRET must be set in your environment variables."
);

export interface ConsumerTokenRequest {
  consumer_id: string;
  metadata: {
    username?: string;
    email?: string;
    tenant_id?: string;
    tenant_display_name?: string;
  };
}

export interface ConsumerTokenResponse {
  expiry_time: string;
  name: string;
  token: string;
}
export const getConsumerToken = async (data: ConsumerTokenRequest) => {
  const resp = await fetch(
    "https://api.getkolla.com/connect/v1/consumers:consumerToken",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.TH_M_CODES_KOLLA_KEY}`,
      },
      body: JSON.stringify(data),
    }
  );
  const respData = await resp.json() as ConsumerTokenResponse;
  return respData;
};

export const getCredentialsFetch = async(
  token: string,
  consumer_id: string,
  connector_id: string
) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.TH_M_CODES_KOLLA_KEY}`,
    },
    redirect: "follow",
    body: JSON.stringify({ consumer_id }),
  };

  const resp = await fetch(
    `https://api.getkolla.com/connect/v1/connectors/${connector_id}/linkedaccounts/-:credentials`,
    requestOptions
  );
  const respData = await resp.json()
  return respData
};
