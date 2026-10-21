---
title: "Easy personal container hosting"
date: 2026-10-21 12:00:00
tags:
  - tech
---

Not everything needs to be high availability! [Waka](https://waka.app) and this blog are running on a Raspberry Pi under my desk, and it seems to work pretty well. This is how it's set up.

## Assumptions

Your setup may be easier, or more difficult, depending on how many of the following constraints you have!

- You're hosting your own containers that aren't published to a public repository
- Your server has a different CPU architecture to your development machine
- You don't want to give the server any credentials (i.e deployments should be pushed to the server)
- Your server is on a separate network, but you have SSH access to it
- Your server can be accessed from the internet (using a tunnel like cloudflared is also fine!)

## Setup a bare git repo

A bare git repo is basically a remote that you can push your local git repo to. You can push manually from your local machine, or set up some sort of pipeline to push it from CI/CD. If your code is open source (or you're happy to put credentials on your server), then you don't need to do this: you can just clone from the repo directly.

On your server:

```bash
mkdir ~/git
cd ~/git
git init --bare your-repo.git
```

Then, add this repo as a remote locally and push to it.

```bash
git remote add your-server-name ssh://your-user@your-server-address/home/user/git/your-repo.git
git push your-server name main
```

On your server, you then need to clone from the local bare repo. This does feel a bit weird, but it does work, and you can run `git pull` as usual once it's setup.

```bash
mkdir ~/dev
cd ~/dev
git clone ~/git/your-repo.git
```

The whole point of this is so you can then build your container on the server. It's absolutely possible to push your containers over SSH, but I'm using a Raspberry Pi and multi-architecture builds are a bit of a hassle. For this use case, I find it easier to just build on the server directly.

```bash
podman build -t localhost/your-project:latest .
```

### Setting up Podman

I'm a big fan of Podman quadlets. They're simple to setup, and allow you to run and manage containers with systemd. This example uses rootless containers. To create a quadlet, make a file in `~/.config/containers/systemd/your-project.container`.

```toml
[Unit]
Description=your project
Documentation=https://example.com

[Container]
Image=localhost/your-project:latest
Label=io.containers.autoupdate=local
PublishPort=3000:80 # replace this with your container port

[Install]
WantedBy=multi-user.target default.target

[Service]
Restart=always
```

Then, restart systemd.

```bash
systemctl --user daemon-reload
systemctl --user start your-project.service

# ensure it restarts at boot
loginctl enable-linger
systemctl --user enable podman-auto-update
```

Your container will then be accessible on localhost:3000.

Proxying traffic through nginx is a good idea. Install nginx, and then configure nginx to pass this traffic through. Repeat this for all the individual containers you want to host.

```plain
server {
	listen 80;
	server_name example.com;

	location / {
		proxy_pass http://localhost:3000;
	}
}
```

Once you restart nginx and update your DNS to point to this server, then any requests will be proxied to your container. I'm using a Cloudflare tunnel to expose my server to the internet, but there's plenty of other options (other tunnels, dynamic DNS, just getting a static IP etc).

## Updating the deployment

Once you've pushed to the remote with git, you can run this small script on your server every time your want to update your deployment.

```bash
#!/bin/sh
git -C ~/dev/your-repo/ pull
podman build -t localhost/your-project:latest ~/dev/your-repo
systemctl --user restart your-project.service
```

## That's it!

There's no right way to deploy a container, but I find this is a very simple and easy setup. It's great for small personal stuff, but I wouldn't recommend hosting anything critical like this.

I would really recommend Podman quadlets generally. This is more or less how I have bit and pieces deployment on my own server (Home Assistant, Immich etc), and most of the time you can run things rootless too. The main difference is for home, I'm generally not building containers (because there's usually something prebuilt), and I use Tailscale instead of a Cloudflare tunnel (and have public DNS records setup pointing to the private Tailscale IPs).
