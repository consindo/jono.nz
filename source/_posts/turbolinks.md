---
title: Turbolinks
date: 2018-04-02 10:28:17
tags:
- dev
---
Single Page Routing is cool, because it allows your pages to load without incurring the cost a full load. It can be difficult to set up, but I would recommend checking out [Turbolinks](https://github.com/turbolinks/turbolinks). You can Single Page Routing running on your existing site in like, twenty minutes. It's great.

It's a tiny little script that you just have to insert into your `<head>`, and it swaps out the body whenever you follow a link. It prevents your CSS and JS from being redownloaded, so you don't get an unsightly white flash when your page loads.

This site is already pretty fast, as it uses [Hexo](https://hexo.io) to render the site out statically, but I still added Turbolinks, and now it's even faster.

The process was also pretty simple for this site:
- Add script tag
- Move other script tags to the head, with a `defer` attribute.
- Realize that my script only queries the elements once, so I needed to add a `data-turbolinks-permanent` to my navigation element.
<br>

And I think that's it. It's really great for sites that don't use a lot of JavaScript.

<https://github.com/turbolinks/turbolinks>
