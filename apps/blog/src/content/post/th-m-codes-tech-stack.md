---
publishDate: 2023-02-27T06:41:43.618Z
title: th-m.codes Tech Stack
description: Let me share the th-m.codes tech stack - Netlify, NX, SolidStart, Astro, Supabase - with you.
excerpt: My choice wasn't about picking the "best" tools but rather choosing ones that resonate with my personal preferences and working style. Let's explore each of them in detail.
image: ~/assets/images/th-m-tech-stack.webp
category: Web
tags:
- SolidJS
- Netlify
- NX
- Astro
- Supabase

# canonical: https://astrowind.vercel.app/astrowind-template-in-depth

---

Let me share the th-m.codes tech stack - Netlify, NX, SolidStart, Astro, Supabase - with you. My choice wasn't about picking the "best" tools but rather choosing ones that resonate with my personal preferences and working style. Let's explore each of them in detail.

### Build Tools: Why NX?
Most frameworks offer an `npx init` command, so why choose a monorepo like NX? My reasons are rooted in component/tooling reusability and type safety.

While working on personal and professional projects, I found that I often ended up "dogfooding" my own tooling, a process I talk about in my article [Dogfooding Libraries with NX](dog-fooding-libs-with-nx). The experience of working with `npm link` and isolated packages was painful and error-prone, at least it was for me. With NX, these workflows become simpler and more streamlined.


### Servers Made Easy: Netlify
Back when I was a baby developer I remember setting up Apache servers on Linux machines so I could run my WordPress projects.  I still have nightmares about those days. Now we have services like Netlify and Vercel, so we don't have to worry about that those things anymore.

Netlify and Vercel both provide solid hosting solutions, but I lean toward Netlify. Their seamless integration with NX and the simplicity of managing monorepos with `netlify.toml` files give them an edge. While Vercel has its strengths, my experiences with their monorepo support left me wanting.


### Database: Supabase
Supabase is my choice for data storage. Not only does it help keep my SQL skills sharp, but it's also built on top of PostgRest—an open-source tool that generates an API layer with OpenAPI docs. This is ideal for my side hobby of generating and abstracting everything off of the Swagger/OpenAPI specs.

A simple script paired with TypeScript offers end-to-end (E2E) type safety with my database. By integrating this into an NX library, I can ensure it applies to all apps that use it.

### Blogging with Astro
I went with Astro because it has a 100% performance score with lighthouse. Then, I found they had a template [astrowind](https://github.com/onwidget/astrowind) that was preconfigured with MDX support. So I can copy and paste my markdown notes from Obsidian, prompt midjourney for an image and, bing bang bong, a new blog article. 

Astro also has some unique features, like being able to use components from any client-side framework. So I figured it would be useful to play with.

### Home: SolidStart
I really admire the philosophy of the Remix team working with Shopify. Their guiding principle is to extend the web's native abilities." I think SolidStart executed on this idea in a better way, essentially by cutting out React.

There are some nice things like using a `script` tag in a component or adding `class` to your html elements.  It feels like you get all the best parts of JSX without sacrificing or abstracting any HTML and after working with React for the last decade it is a bit of fresh air. Don't get me wrong I love me some React, and for many SAS solutions, I would still recommend it as their frontend tech. 

But for my dinky lil playground, I will choose a fledgling tech framework that has very low adoption. 