---
title: "A Cloud Native Waka"
date: 2019-04-19 12:15:00
tags:
- dev
- waka
---

Recently, Waka has a had a bit of a rewrite to make it much easier to get started locally, and is now able to be run in a high-availability, cloud native configuration.

## Old Waka

Old Waka was a little bit of a monolith. Everything was bundled together into the [dymajo/waka](https://github.com/dymajo/waka) repository. The barrier to entry was high - you had to get everything going if you wanted to develop it.

Everything also used a crazy, [multi-process architecture]({{"source/_posts/transit-part1.md" | inputPathToUrl}}). It provided a way to split cities processes from each other. This was helpful when the software was less stable - an import of a new Auckland timetable could crash Wellington. **I would not recommend this**. It's way more sensible to use a proper application orchestration technology, such as Amazon ECS or Kubernetes.

## New Waka

New Waka addresses all these issues. The application has been split into a number of components, but still delivers an excellent development experience. It also **doesn't require any set-up** to get going.

- [waka](https://github.com/dymajo/waka) - the front end
- [waka-importer](https://github.com/dymajo/waka-importer) - task that downloads GTFS feeds, and imports them into SQL Server
- [waka-orchestrator](https://github.com/dymajo/waka-server) - service that manages manages timetable updates
- [waka-proxy](https://github.com/dymajo/waka-server) - service that discovers running workers, and redirects map requests
- [waka-worker](https://github.com/dymajo/waka-server) - service that provides gtfs and realtime information for each city
- [waka-healthcheck](https://github.com/dymajo/waka-healthcheck) - a lambda to [check if waka is up](https://assets-us-west-2.waka.app/status/index.html)
- [waka-maps](https://github.com/dymajo/waka-maps) - scripts that generate map tiles, and upload them to S3


## How was it done?

### Developer Experience

The developer experience has been vastly improved because no config is required to get started. This was done by making a number of assumptions:

- Use local disk instead of DynamoDB for configuration locally.
- Assume SQL Server is running in Docker, but is configurable.
- Missing API Keys will disable external requests.
- waka-importer does not need to be called directly.
- Auto-discovery of regions.
- Disabled import of line shapes into S3.

With the split into multiple components, it was important to keep the development experience as good as a monolith - developing in Docker containers is not fun. Originally, I thought this was going to be difficult to do - we need multiple waka-workers for each city. I didn't want to go back to the multi-process mess. Then it hit me. **Every component should be a class that can be instantiated**.

This is awesome. When it's running locally, the class exposes some routes that are added to waka-orchestrator's router. When it's running in a Docker container, it sets up its own web server, and grabs config from environmental variables.

### Cloud Native

With each component being a Docker container, we now run Waka on Amazon ECS. We chose ECS over Kubernetes, because ECS is easier and cheaper to get set-up with. I also spend a lot of time working with Kubernetes at work, so I'm fully aware that it's a much better system!

![Waka ECS Services](/images/waka-ecs.png)

waka-orchestrator speaks to the Amazon ECS API to adjust the active version, as well as launching Fargate waka-importer tasks. For bonus points, our SQL server instance also runs on ECS with an EBS mount (there's only timetables in there), and our cluster runs on 75% spot instances! Our stage environment runs on 100% spot instances, and auto-scales so is only available when we're awake.

![Waka ALB Routes](/images/waka-alb.png)

As waka has been designed in a way where no components actually talk to each other (apart from waka-proxy, which is doing auto-discovery), we effectively have a zero-trust network. All the components sit behind an Amazon Application Load Balancer (ALB), with routes to the ECS target groups. We also have the Waka admin console on the ALB, but using [Auth0](https://auth0.com) to authenticate these requests on the Load Balancer.

## Help us build Waka!

With these changes, Waka is ready for the future. We've got new cities in the pipeline and other exciting ideas! 

If you want to help us build Waka, you can now get going in a matter of minutes. Check out the [front-end](https://github.com/dymajo/waka) or [server](https://github.com/dymajo/waka-server) to get started.
