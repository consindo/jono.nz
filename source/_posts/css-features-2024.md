---
title: CSS features I’ve been using recently
date: 2024-09-01 10:30:00
tags:
  - dev
  - turbomaps
---

While recently redesigning this site and working on [new Turbomaps features](https://turbomaps.io/blog), I took the opportunity to use a few CSS techniques new to me. Here's a list of CSS features I recommend taking a look at.

## Wide gamut color

Plenty of devices these days have wide gamut displays that can display more than just sRGB, and make colors really *"pop"*. There's a bunch of different methods for authoring these in CSS, but I recommend using `oklch()`.

In fact, you can just use `oklch()` by default. Unlike `hsl()` the lightness is uniform, so you can predictably create color palettes based off a single color. If your chosen color is in the P3 gamut, you may want to specify a fallback color in sRGB.

The OKLCH color picker is very nice for playing around with this.

[oklch.com](https://oklch.com/)


## System font stacks

While I love web fonts, especially variable ones, you don't always need to use them. I just used system fonts for this site and tweaked the families and weights a little to ensure everything is legible across platforms.

I've learned to accept the quality of text rendering across platforms differs anyway, so using a completely different font isn't such a bad thing.[^1]

[^1]: I will fight you if you think macOS has better text rendering than Windows.

[github.com/system-fonts/modern-font-stacks](https://github.com/system-fonts/modern-font-stacks)

## HTML web components

HTML custom elements have been around for a while now, and they seem like they're a really good choice for building out a component library. The idea is that you can wrap existing native elements with your custom HTML elements, style with CSS, and *progressively enhance* with JavaScript.

```html
<my-button bg="green">
  <button>Click me</button>
</my-button>
```

Writing components in this way plays nicely with server side rendering, and provides an easy way to scope styles. Many of the attributes you would usually pass into a React component can just be native HTML attributes, and styled with CSS. No Shadow DOM required! 

```css
my-button[bg="green"] > button {
  background: green;
}
```

I found [Jeremy Keith's article](https://adactio.com/journal/20618) to be particularly compelling. I've had success with HTML web components in my projects so far, and would highly recommend considering them for any design system or component library.

## Styling with accessibility attributes

When implementing custom UI, you should be using [ARIA roles and attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA). However, you might be tempted to add additional classes to handle the styling. But you could just not—keep things simple and target the ARIA attribute.

```html
<your-element aria-disabled="true" class="disabled" />

<style>
/* Instead of introducing an extra class for styling: */
your-element.disabled {
  color: gray;
}

/* You can just target the ARIA attribute: */
your-element[aria-disabled="true"] {
  color: gray;
}
</style>
```

I find writing CSS in this way helps me keep accessibility top of mind.

## :is

This can make your code much less verbose and more readable. I've noticed it's particularly helpful when you've got lots of different attributes.

```css
/* Instead of adding separate selectors: */
your-element[bg="red"], your-element[bg="green"], your-element[bg="blue"] {
  color: white;
}

/* You can simplify it to the following: */
your-element:is([bg="red"], [bg="green"], [bg="blue"]) {
  color: white;
}
```

[developer.mozilla.org/en-US/docs/Web/CSS/:is](https://developer.mozilla.org/en-US/docs/Web/CSS/:is)

## AVIF

This one isn't a CSS feature, but AVIF is too good not to mention. The file sizes are tiny, browser support is great, and almost every modern piece of hardware has built in AV1 decode.

For images on the web, I recommend:

- Don't bother with WebP.
- Start with a minimum of 2x scale—you don't need a 1x image.
- Use the `<picture>` element for a JPG/PNG fallback if you have to.

I was using webp for a while on this blog, but I've now switched all the recent content to AVIF. I used the [11ty image plugin](https://www.11ty.dev/docs/plugins/image/), but if you're not processing images at build time you can use `npx avif` to easily convert a whole directory.

AVIF requires a decent amount of compute to encode, so I would not recommend conversion at runtime (i.e using some SaaS service).

[developer.mozilla.org/en-US/docs/Web/HTML/Element/picture](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture)

## text-decoration-*

I always just assumed `text-decoration` could only be `underline`, `dotted`, `dashed`, or `none`. Turns out you can set the thickness, distance, color, and more.

Upon learning this, I went with some fancy dotted links on this site. They even animate on hover.

[developer.mozilla.org/en-US/docs/Web/CSS/text-decoration](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)

## text-wrap: pretty

This one is subtle, but a nice improvement for blog posts and documentation. You probably don't want to apply this everywhere as it does negatively impact performance.

[developer.mozilla.org/en-US/docs/Web/CSS/text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap)

## scrollbar-color

I don't find myself often needing to customize the scrollbar, but it can be good for scrollable containers within the main page (e.g the Turbomaps sidebar).

You can use `scrollbar-color` to customize the track and thumb, and `scrollbar-width` if you're careful.

[developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color)

## Animated Masks

I recently came across a loading spinner implemented as an animated SVG. While great in theory, it turns out that SVG animations don't start until the `onload` event. This can make it problematic if you're using the loading spinner in a *Single Page App*.

Ideally, you should be server side rendering, but if it has to be a SPA you can use a CSS animation instead. Many loading spinners are easy to do with CSS animations—often just a `transform: rotate(360deg)`, but I was given a spinner than was clipping the path of a outlined square.

You may be tempted to use [clip path animations](https://caniuse.com/mdn-css_properties_clip-path_is_animatable), but I learned it's still not supported in Safari. Instead, you may be able to use CSS masks and animate the position(s) to achieve the same effect.

```css
@keyframes loader {
  0% {
    mask-position: 50px 50px, -50px -50px;
  }
  100% {
    mask-position: 25px -25px, -25px 25px;
  }
}
your-loader {
  /* the linear-gradient() just generates some square "images" */
  mask: linear-gradient(#000, #000), linear-gradient(#000, #000);
  animation: 1s loader infinite ease;
  width: 50px;
  height: 50px;
}
```

[developer.mozilla.org/en-US/docs/Web/CSS/mask](https://developer.mozilla.org/en-US/docs/Web/CSS/mask)

## \<dialog\>

I've found that the HTML `<dialog>` element is not only good for modals, but dropdown & right-click menus too. They're now used extensively throughout Turbomaps.

However, they're a bit tricky to animate. The trick is to use an animation in, but a transition out combined with `allow-discrete`. You can also use `@starting-style` instead of an animation, but the browser support still needs to improve.

```css
@keyframes show {
  0% { opacity: 0 }
  100% { opacity: 1 }
}
dialog {
  opacity: 0;
  transition:
    100ms ease-out opacity,
    overlay 100ms ease-out allow-discrete,
    display 100ms ease-out allow-discrete;
}
dialog[open] {
  opacity: 1;
  animation: 100ms ease-out show 1; /* animate in, but use transition out */
}
```

Depending on your needs, the [popover attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/popover) may be better than a `<dialog>`, but the same animation techniques still apply.

[developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior)
