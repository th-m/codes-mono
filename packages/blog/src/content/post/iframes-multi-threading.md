---
publishDate: 2023-05-23T06:41:43.618Z
title: IFrames and Multi-Threading
description: Will a browser give an iframe a separate thread for javascript? The answer is yes, sometimes. 
excerpt: Currently, the only way to get visual renderings is to use Iframes.However, the specification and browser implementation around Iframes is not at all consistent.
image: ~/assets/images/iframe-hacker.webp
category: Web
tags:
- HTML
- Web Development

# canonical: https://astrowind.vercel.app/astrowind-template-in-depth

---

## Why do we want Iframes with multi-threading?

Typically, when running background tasks or concurrent processing, you will want to use [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).  And, If you want a separate thread for audio you can reach for the [audio worklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet). However, web workers and audio worklets do not have access to the DOM or visual rendering. Currently, the only way to get visual renderings is to use Iframes. The problem is, specification and browser implementation around Iframes is not at all consistent.

## Current Browser Support

Check out [this site](https://eylonsu.github.io/browser_thread/) If the lower animation (under 'crossorigin') runs without stopping it has a separate thread.

Currently, mobile browsers do not support an extra thread, and desktop Safari doesn't either. In fact, the only browsers that do may be Chrome and Firefox on desktop. 

## Isolated Sandboxed Iframes

>When enabled, applies process isolation to iframes with the 'sandbox' attribute and without the 'allow-same-origin' permission set on that attribute. This also applies to documents with a similar CSP sandbox header, even in the main frame. The affected sandboxed documents can be grouped into processes based on their URL's site or origin. The default grouping when enabled is per-site. – Mac, Windows, Linux, ChromeOS, Fuchsia, Lacros

[#enable-isolated-sandboxed-iframes](chrome://flags/#enable-isolated-sandboxed-iframes)


## Origin-Agent-Cluster

[The specification](https://web.dev/origin-agent-cluster/)
> Origin-Agent-Cluster is a new HTTP response header that instructs the browser to prevent synchronous scripting access between same-site cross-origin pages. Browsers may also use Origin-Agent-Cluster as a hint that your origin should get its own, separate resources, such as a dedicated process.

> [...] For example, if `https://customerservicewidget.example.com` expects to use lots of resources for video chat, and will be embedded on various origins throughout `https://*.example.com`, the team maintaining that widget could use the Origin-Agent-Cluster header to try to decrease their performance impact on embedders.

> To use the Origin-Agent-Cluster header, configure your web server to send the following HTTP response header: `Origin-Agent-Cluster: ?1` The value of `?1` is the structured header syntax for a boolean true value.

The only problem here is that same-site origins will still share resources. 
