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
  const json = await resp.json() as ConsumerTokenResponse;
  return json;
};