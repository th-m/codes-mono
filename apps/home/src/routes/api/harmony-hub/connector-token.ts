import { APIEvent, json } from 'solid-start/api';
import { getConsumerToken, getCredentialsFetch } from '~/models/kolla.server';
import { withCors } from '~/utils/server';

export async function POST({ request }: APIEvent) {
  const {token, consumer_id, connector_id} = await request.json();
  const connectorToken = await getCredentialsFetch(token, consumer_id, connector_id);
  const headers = withCors();
  return json(connectorToken,{headers});
}
