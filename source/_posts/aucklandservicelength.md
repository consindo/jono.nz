---
title: "Which transit services in Auckland travel the furthest?"
date: 2018-12-15 12:00:00
tags:
- auckland
- transport
- waka
---

I got this question a couple of weeks ago, and I realized I was in a pretty good position to answer it. Waka already has all the required data in it, so it was a matter of writing a couple of SQL queries.

These results were obtained for the week of November 5th - 11th, 2018. All routes are bus routes if not specified otherwise.

## What are the longest routes in Auckland?
The first question is simple - what are the longest routes in Auckland (school buses excluded).

| Code | Route Description | Length (km) |
|:-----|:------------------|------------:|
| [125X](https://waka.app/l/nz-akl/125X) | Helensville To City Centre Via Westgate Express | 58.96 |
| [396](https://waka.app/l/nz-akl/396) | Pukekohe Interchange To Waiuku Loop Via Patumahoe | 49.49 |
| [SKY](https://waka.app/l/nz-akl/SKY) | Airport To Albany - *Commercial Bus* | 47.68 |
| [399](https://waka.app/l/nz-akl/399) | Pukekohe To Port Waikato Via Tuakau | 44.21 |
| [171X](https://waka.app/l/nz-akl/171X) | City Centre To New Lynn Via Laingholm | 39.23 |
| [125](https://waka.app/l/nz-akl/125) | Helensville To Westgate | 38.48 |
| [997](https://waka.app/l/nz-akl/997) | Warkworth To Omaha Via Matakana And Port Wells | 37.60 |
| [395](https://waka.app/l/nz-akl/395) | Waiuku To Papakura Interchange | 35.70 |
| [N11](https://waka.app/l/nz-akl/N11) | City To Papakura Via Great South Rd - *Night Bus* | 34.47 |
| [120](https://waka.app/l/nz-akl/120) | Akoranga to Henderson | 32.82 |

[Full Results](/files/aucklandservicelength/routeDistance.csv) &middot; [SQL Queries](/files/aucklandservicelength/routeDistance.sql)

These results are not particularly interesting. The majority of the above services are semi rural, and don't have great frequency.

## What are the shortest routes in Auckland?
Ignoring the weird routes that aren't really routes (i.e short running services) and school buses, here are the shortest routes in Auckland.

| Code | Route Description | Length (km) |
|:-----|:------------------|------------:|
| [SBAY](https://waka.app/l/nz-akl/SBAY) | Auckland To Stanley Bay - *Ferry* | 2.17 |
| [BAYS](https://waka.app/l/nz-akl/BAYS) | Bayswater To Auckland - *Ferry* | 2.35 |
| [DEV](https://waka.app/l/nz-akl/DEV) | Auckland To Devonport - *Ferry* | 3.11 |
| [890](https://waka.app/l/nz-akl/890) | Albany Station To Corinthian Dr Loop | 3.51 |
| [987](https://waka.app/l/nz-akl/987) | Arkles Bay Loop | 3.80 |
| [BIRK](https://waka.app/l/nz-akl/BIRK) | Auckland To Birkenhead Via Northcote Point - *Ferry* | 4.08 |
| [161](https://waka.app/l/nz-akl/161) | New Lynn to Brains Park | 4.17 |
| [807](https://waka.app/l/nz-akl/807) | Devonport Wharf To Cheltenham Loop | 4.21 |
| [842](https://waka.app/l/nz-akl/842) | Smales Farm Station To Crown Hill Via East Coast Rd | 4.44 |
| [889](https://waka.app/l/nz-akl/889) | Constellation Station To Albany Station Via Hugh Green Dr | 5.18 |

It's interesting to see that there are no services under 2km, and most of these short services are ferries or local loops.

## Which routes in Auckland have most services per week.
This includes both short/long running services - there's no good way split them out.

| Route | Services per Week |
|:------|------------------:|
| [NX1](https://waka.app/l/nz-akl/NX1) | 2687 |
| [NX2](https://waka.app/l/nz-akl/NX2) | 1788 |
| [InnerLink](https://waka.app/l/nz-akl/INN) | 1490 |
| [70](https://waka.app/l/nz-akl/70) | 1427 |
| [SkyBus](https://waka.app/l/nz-akl/SKY) - *Commercial Bus* | 1387 |
| [18](https://waka.app/l/nz-akl/18) | 1379 |
| [OuterLink](https://waka.app/l/nz-akl/OUT) | 1304 |
| [82](https://waka.app/l/nz-akl/82) | 1164 |
| [CityLink](https://waka.app/l/nz-akl/CTY) | 1164 |
| [25B](https://waka.app/l/nz-akl/25B) | 1147 |

[Full Results](/files/aucklandservicelength/servicesPerWeek.csv) &middot; [SQL Queries](/files/aucklandservicelength/servicesPerWeek.sql)

The NX1 has the most services by far, but there's also a lot of services that start halfway through the route. The InnerLink & OuterLink is also fairly high (and the real frequency is high), but because they're weird loops the route can be split into a bunch of segments (the smallest being 900m).

The SkyBus is deceiving, because there's essentially 3 routes under the same code - Albany to Airport, City to Airport via Mt Eden Road, and City to Airport via Dominion Road.

## Which transit services in Auckland travel the furthest each week?
Now we'll combine the number of services with how far they go, grouping by the route code.

| Route | Distance Traveled per Week (km) |
|:------|------------------:|
| [NX1](https://waka.app/l/nz-akl/NX1) | 57,378 |
| [SkyBus](https://waka.app/l/nz-akl/SKY) - *Commerical Bus* | 55,605 |
| [OuterLink](https://waka.app/l/nz-akl/OUT) | 32,326 |
| [NX2](https://waka.app/l/nz-akl/NX2) | 32,118 |
| [70](https://waka.app/l/nz-akl/70) | 30,257 |
| [380](https://waka.app/l/nz-akl/380) | 30,233 |
| [Southern Line](https://waka.app/l/nz-akl/STH) - *Train* | 28,070 |
| [Western Line](https://waka.app/l/nz-akl/WEST) - *Train* | 25,143 |
| [Eastern Line](https://waka.app/l/nz-akl/EAST) - *Train* | 21,872 |
| [83](https://waka.app/l/nz-akl/83) | 21,153 |

[Full Results](/files/aucklandservicelength/kmPerWeek.csv) &middot; [SQL Queries](/files/aucklandservicelength/kmPerWeek.sql)

The NX1 comes out on top - the frequency is good, and as it travels a long distance on the busway and motorway. In many ways the SkyBus is similar - it travels quite far on the busway and motorway with good frequency, but it is a little deceiving as mentioned earlier.

It's not surprising to see some of our long frequent routes in here too - OUT, NX2, 70, and 83. Our trains also make an appearance - while the frequency is not as good as some of our bus network, the trains tend to travel longer distances.

The most interesting apperance in here is the 380. It is not classified as a frequent service, but it has 15-20 minute service all day. As it is an airport bus, it starts extremely early (4:40am) and ends very late (12:40am) every day. It's also a bit of a silly route - it really should be split into two halves - Airport to Manukau, and Airport to Onehunga/Mangere.
