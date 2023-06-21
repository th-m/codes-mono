import { APIEvent, json } from 'solid-start/api';
import { getConsumerToken } from '~/models/kolla.server';
import { withCors } from '~/utils/server';

export async function GET() {
  return new Response('Hello From Kolla');
}
export async function POST({ request }: APIEvent) {
  const req = await request.json();
  const token = await getConsumerToken({
    consumer_id: req.consumer_id ?? '',
    metadata: req?.metadata ?? {},
  });
  const headers = withCors();
  return json(token, { headers });
}
export async function OPTIONS({}: APIEvent) {
  const headers = withCors();
  return json({ success: true }, { headers });
}
