---
title: Gradiator
date: 2024-09-17 12:00:00
tags:
  - dev
---

In 2011, we released Gradiator—a Mac & Linux app to create CSS3 gradients. This was one of the first apps I worked on, along with [George Czabania](https://czabania.com).

Yesterday, I spent a couple of hours restoring it, so you can try it out in your web browser:

<a class="button" href="{{"source/projects/gradiator/index.html" | inputPathToUrl}}">Gradiator</a>

## What was Gradiator?

When CSS3 first came out, it introduced CSS gradients. Skeuomorphism was quite popular in design at the time so the use of CSS gradients became popular very quickly.

However, creating these gradients was a little bit annoying. Vendor prefixes were still a thing, and different browsers had new and legacy syntax.

Gradiator solved these problems by generating all the vendor specific code, and providing a nice interface to create & save gradients.

## Why couldn't it run in a web browser in 2011?

There were a couple of web based gradient generators at the time but we decided to ship "native" apps for Mac & Linux. This was for two reasons:

- You couldn't get access to the system color picker—we really wanted the app to be able to pick a color from the screen.
- Copying to the clipboard was not possible without Adobe Flash.

To get around these limitations we wrapped up the HTML using the native webviews for each platform, and had a bit of Python/Objective-C to pass messages between JS and the native APIs. It was super nasty: it would set `document.title` to send a message to the other context. There was probably a better way of doing it, but we didn't really know what we were doing at the time.

This predated Electron by a couple of years, and it's why we never released a version for Windows—EdgeHTML was still 4 years away.

## A code review on your 13 year old code

When we originally wrote it, I was about half the age I am now. I honestly think it holds up pretty well and it's more just a product of it's time—a 2500 line JS file with plenty of jQuery.

I've lost the original source code, which I believe used CoffeeScript and Sass. This was created before using a compiler and build system for JavaScript became popular, so the transform to JavaScript and CSS was actually very basic. 

Making the tweaks to make it run today wasn't difficult. To view the GPL source, you can use *view source* in your browser.

## Changes to get it working

I pulled the source out of the last Linux package and made a couple of changes to get it running:

- A system color picker is implemented with `input[type=color]` ([good browser support circa 2019](https://caniuse.com/input-color))
- Copying to the clipboard is implemented using `navigator.clipboard` ([good browser support circa 2020](https://caniuse.com/mdn-api_navigator_clipboard))

Apart from fixing up a couple odd layout issues, it basically just works. I also upgraded jQuery 1.7 to 3.7 just by swapping a `<script>` tag.

  There's definitely something to be said for this older style of web development.

<a href="{{"source/projects/gradiator/index.html" | inputPathToUrl}}">jono.nz/projects/gradiator</a>

