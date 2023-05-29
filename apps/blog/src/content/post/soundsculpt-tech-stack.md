---
publishDate: 2023-05-25T06:41:43.618Z
title: Developing SoundSculpt
description: I believe that websites and apps are going to eventually merge into one. This is our attempt to make online shop that has the utility of an app.
excerpt:  Soundsculpt.app is equal parts "site" and "app". This a deep dive in what we did to get the most out of the browser while also optimizing for performance and SEO.
image: ~/assets/images/audio-sound-engineer.webp
category: Web
tags:
- Netlify
- NX
- GCP
- Supabase

# canonical: https://astrowind.vercel.app/astrowind-template-in-depth

---

## SoundSculpt

[Soundsculpt](https.soundsculpt.app) is a royalty-free music shop where you can modify audio in real-time to get exactly what you want at the time of purchase. The goal for this was to find the right balance between "application" and "website". We wanted something like a simplified DAW experience, the "app" part. And we wanted an SEO-friendly and performance-optimized shop, the "website" part. This is how we did it.

## A bit of History

My brother [Ricky Valadez](https://rickyvaladez.com/) started tinkering with Javascript Audio API about 3 years ago, making tools to help him in his day-to-day work as a Producer at Berkly.  

About a year ago he had a POC that was impressive. I didn't know the browser was capable of quality audio processing. At that time we decided to team up in order to create a product out of the tool.
