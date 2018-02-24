---
layout: post
title: How does Waka work? - Part 2
date: 2018-02-25 19:56:43
tags:
---

Finally, part two of this guide! In part two, we'll go over how the frontend works. I managed to keep [part one](/2017/10/08/transit-part1/) reasonably well updated, but contact me if you have any issues.

## Setting Up
If you've already set up the server, it'll all good to go! If not, you'll need node.js & npm installed - https://nodejs.org. Then, three easy steps:

- First, get the code with `git clone https://github.com/consindo/waka.git`
- Install dependencies with `npm install`  
- Build the client with  `npm run build` 

## Development
If you're only working on the frontend code, and don't want to go to the hassle of setting up your own server, you can simply use `npm run watch:live`. If you have the server set up, you can use `npm run watch` instead.

Waka uses Webpack, so you get all the fancy live reloading - just head to http://locahost:8009. In terms of code style, eslint & prettier are all set up - just run it through them before you send a pull request.

## React
Waka is written in React, with React Router for the single page routing. If adding a new page or view, it's super important to make sure it can be accessed with a URL - this is how the back button works on Android.

For maps, Waka uses the DYMAJO OpenStreetMap Server, because it's too expensive to use Mapbox or something similar. We're currently using Leaflet with react-leaflet, but this will be replaced with mapbox-gl-js in the near future.

Lots of stuff in Waka is custom because most React components are designed for the desktop. 90% of Traffic to Waka is from mobile, so make sure always build mobile first. Often, I like to plug in my phone and debug directly on that.

## SCSS
It's all custom. It's also a little bit of a mess, because the app has undergone a number of significant redesigns in its 1.5 year history. A new redesign is coming soon, so I'll do my best to clean it up a little more.

## Speed
Waka uses Service Workers to run offline, and it falls back nicely. It's not very useful offline, but at least it will load when you're running out of the house and there's very bad Wi-Fi. Bundle size is also reasonably well optimized, so use dynamic imports if necessary.

There's also the percieved speed - the app uses a large amount of animation in an effort to make things feel faster. If you think something needs an animation, please add it!

## Now what?
Please download the code and mess around! It's much easier to get started with the client than the server, so if there's something you're dying to fix or add, it would be greatly appreciated.

Any questions, suggestions, or issues - [contact me!](http://localhost:4000/me/)

https://github.com/consindo/waka