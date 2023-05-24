
import { APIEvent, json } from "solid-start";



export async function GET() {
    return new Response("Hello Slack");
  }
  
  export async function POST(e: APIEvent) {
    const data = await e.request.json();
    return json(data);
  }
  
  export async function PATCH() {
    // ...
  }
  
  export async function DELETE() {
    // ...
  }
  