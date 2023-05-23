import { APIEvent, json } from "solid-start/api";
import { getUser } from "~/models/session.server";

export async function GET(e:APIEvent) {
  const d = await getUser(e.request)
  return json(d);
}

// export async function POST(e: APIEvent) {
//   // const data = await e.request.json();
//   const d = await getUser(e.request)
//   return json(d);
// }

// export async function PATCH() {
//   // ...
// }

// export async function DELETE() {
//   // ...
// }
