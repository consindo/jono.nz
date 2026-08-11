---
title: "Exporting HDR photos from Lightroom CC"
date: 2026-08-11 12:00:00
tags:
  - tech
---

**tl;dr: export from Lightroom CC as a JPEG, check that the SDR preview looks okay, and make sure nothing processes your photo further**

HDR is one of those annoying technologies where everything in the chain has to be setup correctly for it to work properly. However I think the results are worth it, and the experience can be very seamless when publishing on the web.

Lightroom has good HDR editing support, but there's a few things to keep in mind when exporting your photos:

## 1. Export as a JPEG
Normally, I would recommend exporting as an AVIF as the file size is much smaller. Unfortunately, it seems that the AVIF export from Lightroom doesn't look the same as the Lightroom preview, and often looks really bad on non-HDR displays due to a lack of a gain map. They also seem to screw up Chrome on Android in weird ways.

I'm sure this will be fixed in the future, but for now, the Lightroom JPEG (sRGB) works properly: both the SDR and HDR versions of the image will display correctly.

## 2. Check the SDR Preview
When editing a photo in Lightroom, just turning on HDR mode will instantly make the SDR version of the image quite dark. I recommend the following SDR settings as a starting point, and tweaking if you need:

- **Brightness:** +60
- **Contrast:** 0
- **Clarity:** -100
- **Highlights:** -50
- **Shadows:** -50
- **Whites:** +50
- **Highlight Saturation:** 0

{% image "../../public/images/hdr-bad-map.jpg", "SDR version of a HDR image with the default settings" %}

Above: A SDR version of a HDR image with the default Lightroom settings.

{% image "../../public/images/hdr-good-map.jpg", "SDR version of a HDR image with the modified settings" %}

Above: A SDR version of a HDR image with the Lightroom settings above.

<img loading="lazy" alt="A HDR image. It will look like the second image if you don't have a HDR display." src="/images/hdr.jpg"></a>

Above: A HDR image. It will look the same as the second image if you don't have a HDR display.

## 3. Don't process your photo further
While web browsers support HDR images well, it feels like almost everything else does not (even Preview in Mac OS). When publishing on the web, just make sure your original photo is being used and isn't being resized by your blog software or something else (it usually reverts your photo back to the SDR image).

In practice, this means you have to do two exports in Lightroom - for your thumbnails, and for the full sized image.

## Other Tips
Putting your exported HDR photos into Google Photos works well, and it'll display your photos in HDR on supported displays. The thumbnails will be in SDR.

Immich also works, but by default the full sized preview will be in SDR (as it's processed the photo). Change the setting in your mobile/browser client to "Display Original Photos" in order for your images to display properly.

I would also recommend using a Mac or iPad for all of this, as HDR works properly out of the box. I've found that HDR on Windows doesn't really work particularly well: you'll need to do quite a bit of calibration to get things looking reasonable. 

## Further Reading

This post is more of a how to get things working, but this rabbit hole goes deep. If you're interested in HDR on the web, I would recommend the following links:

- <https://scottstuff.net/posts/2026/03/04/the-end-of-srgb-is-neigh-hdr-images/>
- <https://gregbenzphotography.com/hdr/>

