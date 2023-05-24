import { createServerAction$,  } from "solid-start/server";
import {  logout } from "~/models/session.server";


export default function Logout() {
    const [login, { Form }] = createServerAction$(
      async (form: FormData, { request }) => {
       
      const resp = await logout(request);
      return resp
       
      ;
      }
    );

  return (
    <div>
      <div>
        <Form method="post" noValidate>
        
          <button type="submit">Log out</button>

        </Form>
      </div>
    </div>
  );
}
