// @refresh reload
import { Suspense, createSignal, createResource } from "solid-js";
import {
  useLocation,
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "./root.css";
import NavBar from "./components/NavBar";

export default function Root() {
  return (
    <Html lang="en" class="m-0 h-full">
      <Head>
        <Title>Th-m Codes</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="m-0 h-full">
        <Suspense>
          <ErrorBoundary>
            {/* <NavBar /> */}
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
