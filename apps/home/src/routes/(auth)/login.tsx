import { A, useLocation } from "solid-start";
import { createServerAction$, json, redirect } from "solid-start/server";
import { createUserSession } from "~/models/session.server";
import { createUser, verifyLogin } from "~/models/users.server";

export default function Login() {
    const [login, { Form }] = createServerAction$(
      async (form: FormData, { request }) => {
        const email = form.get("email") as string;
        const password = form.get("password") as string;
        const remember = form.get("remember") as string;
        const redirectTo = (form?.get("redirectTo") ?? "/") as string;
        const errors = {
          email: "",
          password: "",
        };
        if (!password || password.length < 6) {
          errors.password = "Password must be at least 6 characters long";
        }
        if (!email) {
          errors.email = "Email is required";
        }
  
        if (errors.email || errors.password) {
          return  json({ errors },{ status: 400 });
        }
       
        const session = await verifyLogin(email, password);
        if (!session) {
          errors.email = 'Invalid email or password';
          return  json({ errors },{ status: 400 });
        }
        
     
        return createUserSession({
          request,
           session,
          remember: remember === 'on' ? true : false,
          redirectTo: redirectTo ,
        });
      }
    );
  const location = useLocation();
  const redirectPath = location.query.redirectTo ?? "/";

  // @ts-ignore
  const errors = login?.result?.errors as
    | {
        email: string;
        password: string;
      }
    | undefined;

  return (
    <div>
      <div>
        <Form method="post" noValidate>
          <div>
            <label for="email">
              <div>Email Address</div>
              {errors?.email && (
                <div class="error small" id="email-error">
                  {errors?.email}
                </div>
              )}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              aria-invalid={errors?.email ? true : false}
              aria-describedby="email-error"
              aria-autocomplete="inline"
            />
          </div>
          <div>
            <label for="password">
              <div>Password</div>
              <div class="small">Must have at least 6 characters.</div>
              {errors?.password && (
                <div class="error small" id="password-error">
                  {errors?.password}
                </div>
              )}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              aria-autocomplete="inline"
              aria-invalid={errors?.password ? true : false}
              aria-describedby="password-error"
            />
          </div>
          <button type="submit">Log in</button>
          <input type="hidden" name="redirectTo" value={redirectPath} />
          <div>
            <div>
              <input id="remember" name="remember" type="checkbox" />
              <label for="remember">Remember me</label>
            </div>
            <div class="light">
              <span class="small">Already have an account? </span>
              <A href="/sign-up">sign up</A>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
