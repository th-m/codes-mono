import { APIEvent, json } from 'solid-start/api';
import { getConsumerToken } from '~/models/kolla.server';

export async function POST({ request }: APIEvent) {
  const req = await request.json();
  const token = await getConsumerToken({
    consumer_id: req.userId ?? "",
    metadata: req?.metadata ?? {},
  });
  
  return json(token);
}
