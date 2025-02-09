---
title: Desktop Linux in 2025
date: 2025-02-09 12:00:00
tags:
  - tech
---

I've been running Linux on my main computer again for 6 months now, after not having used it on the desktop for 10 years. I've mostly been very happy, and I don't miss Windows 11 at all.

When trying to solve issues on Linux, you tend to find a lot of random information on personal websites and forum posts, so here's my contribution to that. I'm currently running Fedora 41 (GNOME), but many of these tips & issues will apply to all distros.

## Hardware Issues & Fixes

I'm running this on my desktop, but the laptop issues of the past (e.g no WiFi) don't seem to be issues anymore. 

### USB devices not being detected

Initially, only my mouse and keyboard was being detected. I fixed this by **turning on IOMMU** in the UEFI BIOS. Kind of weird, but everything was detected afterwards.

### Nvidia Drivers

Unfortunately, this is still painful today. I actually had a good experience on Fedora 40 where everything worked out of the box, but my computer would no longer suspend after upgrading to Fedora 41—it either wouldn't go to sleep at all, freeze trying to go to sleep, or freeze trying to wake up.

After lots of trial and error, the configuration I've found with working supend on Fedora 41 is using the **570.86.16 Nvidia Drivers** from the [negativo17 repo](https://negativo17.org/nvidia-driver/), combined with **Linux Kernel 6.13.1**.

I still can't seem to get hardware accelerated AV1 decoding to work properly, but other codecs seem to work fine. I  wouldn't recommend buying an Nvidia card for Linux, but the RTX 4060 is the only decent spec card that fits in [my case](https://teenage.engineering/products/computer-1).

Also, good to remember the `akmods --rebuild` command for when the kernel updates but the Nvidia driver didn't get rebuilt with it.

### Flickering on monitor

This is actually a problem with my monitor's FreeSync implementation, and was a problem on Windows too. Turning off VRR in the GNOME display settings didn't work, so disabling it in the monitor OSD did the trick.

## Tips

### Enable AirPlay

I have a bunch of Sonos speakers around the house, and it's nice to use AirPlay from your computer sometimes. This is easy to set up, just create a file `~/config/pipewire/pipewire.conf.d/raop-discover.conf` with the following contents:

```
context.modules = [
  {
    name = libpipewire-module-raop-discover
    args = { }
  }
]
```

### Use RDP from a Mac

Using the built in GNOME RDP server works fine from a Windows client, but I received `Error code: 0x207` from the Mac RDP client.

To fix this, export the server configuration and then pop it open a text editor. Find the line `use redirection server name:i:0` and change it to `use redirection server name:i:1`. Open the RDP file/import it, and it should fix the error.

### Adjust monitor brightness

On Windows I was using [Monitorian](https://github.com/emoacht/Monitorian) for this, but I found this [GNOME extension](https://extensions.gnome.org/extension/4652/adjust-display-brightness/) which works even better. The [display configuration switcher extension](https://extensions.gnome.org/extension/7281/display-configuration-switcher/) is also super useful if you have multiple monitors.

### Reboot into UEFI

I also recommend a [GNOME extension](https://extensions.gnome.org/extension/5105/reboottouefi/) for this.

### Play Windows games through Steam

By default Steam will only show you games that have been verified to work on Linux. However, most games will just work - open the **Steam Settings → Compatibility**, and **Enable Steam Play for all other titles**. I just use Proton Experimental, and have yet to find a Windows game that doesn't work (although I don't play any games with anticheat).

For playing games through the Epic Game Store and EA, I've had good success with [Lutris](https://lutris.net/).

## Other good software

- [Ventoy](https://www.ventoy.net/en/index.html) - This is useful for the install. Write this to a USB drive, and then you can just drag and drop operating system .iso files into the filesystem, rather than overriding the contents of the drive every time.
- [Piper](https://flathub.org/apps/org.freedesktop.Piper) - This is a great tool for configuring a Logitech gaming mouse.
- [Mission Center](https://missioncenter.io/) - A Windows 10/11 style task manager—a big improvement over the default GNOME system monitor.
- [Pinta](https://www.pinta-project.com/) - A basic drawing app, very similar to Paint.NET.
- [Tailscale](https://tailscale.com/) - Join all your devices into a secure VPN. The Linux version is command line based, but there's a great [GNOME extension](https://extensions.gnome.org/extension/5112/tailscale-status/) for it.
- [Sublime Text](https://www.sublimetext.com/) & [Sublime Merge](https://www.sublimemerge.com/) - It's been my favourite text editor for 10+ years and their git client is great too.
