layout: post
title: Mobile Safari Hacks
date: 2016-12-30 8:30:00
tags:
- dev
---
While developing [Waka](https://waka.app), I've discovered that Mobile Safari is the new IE6. Most of this arises because Apple has layered on a number of fancy features that work great for most sites, but create problems when you trying making a web app. Here's a couple of issues and fixes for these things:

## Desktop Safari is completely different to Mobile Safari
**Problem:** Desktop Safari looks great, but the app doesn't work on iOS.
**Solution:** Unfortunately, you always have to be testing on real devices. This goes for Android too, because these devices are a lot slower than your dev machine.

![Chrome CPU Throttling](/images/throttle.png)

It's also a good idea to enable CPU Throttling in Chrome in order to get an idea of how your app will perform.

## Viewport Height is too high
**Problem:** 100vh includes the height of the browser controls, which are overlaid so there's the fancy blur effect.

![iOS Viewport Height Issue](/images/ios-vh-issue.png "Image from https://nicolas-hoizey.com/2015/02/viewport-height-is-taller-than-the-visible-part-of-the-document-in-some-mobile-browsers.html")

**Fix:** If you can't use height 100%, I would recommend using a CSS variable, and line of code like this:
```
document.body.style.setProperty('--real-height', document.documentElement.clientHeight + 'px')
```
Make sure to bind this to your window.onresize event!

## No Kinetic Scrolling in Child Elements
**Problem:** Having overflow:scroll in a container doesn't have any inertia.
**Solution:** On your element, set `-webkit-overflow-scrolling: touch;`

## -webkit-overflow-scrolling bubbles to page
**Problem:** When you're at the top of the element, the entire page scrolls, not the element.
**Solution:** You'll need two elements, something like this: 
```
<div class="scrollable">
  <div class="container">
    Content
  </div>
</div>
```

On the inner element, you'll need to set `min-height: 101%`. Then, `onTouchStart`, you'll need some JavaScript that moves the scroll position down a single pixel at the top of the page, or up a pixel at the bottom.

```
let top = e.scrollTop
let totalScroll = e.scrollHeight
let currentScroll = top + e.offsetHeight
 
if (top === 0) {
  e.scrollTop = 1
} else if (currentScroll === totalScroll) {
  e.scrollTop = top - 1
}
```


## Flexbox is funky in row direction
**Problem:** Flexbox generally doesn't work in the row direction on iOS. 
**Solution:** If setting the container height with the CSS variable you made doesn't work, use `calc()` with that variable. It's really not ideal, but this is what I've found works best.

## Force Touch
**Problem:** If you force touch on an link that you styled like a button because you have fancy single page routing, it'll pop up a preview.
**Solution:** If iOS, don't use the anchor tag (or at least a href). Bind an event to the button, [and push the new URL to the History](https://developer.mozilla.org/en/docs/Web/API/History).

## No caching when pinned to home screen
**Problem:** There's no HTTP caching when the app is pinned to home screen. Makes for long initial load times.
**Solution:** You're gonna have to use [AppCache](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache) for this one.

That's all I can think of for now. If you have a Mobile Safari hack, message me, and I'll add it to this post!