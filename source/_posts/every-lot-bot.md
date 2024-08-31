---
title: "Every Lot Bot"
date: 2020-01-23 10:00:00
tags:
- twitter
- every-lot-bot

---

**Update: These accounts are no longer online as Twitter no longer allows automated bots. Additionally, the Tokyo account is no longer available.**

Over the long weekend, [@nzsd](https://twitter.com/nzsd) & I set up a bunch of bots that tweet a street view photo of every lot for a bunch of cities. They tweet every 20-30 minutes, and you can follow them here:

- Auckalnd: [@everylotakl](https://twitter.com/everylotakl)
- Christchurch: [@everylotchc](https://twitter.com/everylotchc)
- Tokyo: [@everylottokyo](https://twitter.com/everylottokyo)
- Wellington: [@everylotwlg](https://twitter.com/everylotwlg)

They've already tweeted some fun stuff:

<jc-center>
  <blockquote class="twitter-tweet"><p lang="en" dir="ltr">1A Waitomo Avenue, Mount Eden <a href="https://t.co/SN2Of4yKna">pic.twitter.com/SN2Of4yKna</a></p>&mdash; every lot auckland (@everylotakl) <a href="https://twitter.com/everylotakl/status/1219479779746824193?ref_src=twsrc%5Etfw">January 21, 2020</a></blockquote>
</jc-center>

<jc-center>
  <blockquote class="twitter-tweet"><p lang="en" dir="ltr">2B Mount Street, Te Aro <a href="https://t.co/4Yc1jiLRy6">pic.twitter.com/4Yc1jiLRy6</a></p>&mdash; every lot wellington (@everylotwlg) <a href="https://twitter.com/everylotwlg/status/1219130230993911808?ref_src=twsrc%5Etfw">January 20, 2020</a></blockquote>
</jc-center>

<jc-center>
  <blockquote class="twitter-tweet"><p lang="zh" dir="ltr">中央区八重洲一丁目 6-14 <a href="https://t.co/8kEoJ85b6Z">pic.twitter.com/8kEoJ85b6Z</a></p>&mdash; every lot tokyo / 東京のすべての土地 (@everylottokyo) <a href="https://twitter.com/everylottokyo/status/1218835538540498944?ref_src=twsrc%5Etfw">January 19, 2020</a></blockquote>
</jc-center>

However, the main thing I've noticed so far is just how ugly the average New Zealand house is. We're now living in an age where we're going to demolish a lot of them, but honestly, it's for the best.

<jc-center>
  <blockquote class="twitter-tweet"><p lang="en" dir="ltr">162 Grahams Road, Burnside <a href="https://t.co/pvC5xAKRpT">pic.twitter.com/pvC5xAKRpT</a></p>&mdash; every lot christchurch (@everylotchc) <a href="https://twitter.com/everylotchc/status/1220232739774844928?ref_src=twsrc%5Etfw">January 23, 2020</a></blockquote>
</jc-center>

The bots use the [same open source code](https://github.com/fitnr/everylotbot) as some of the [other every lot bots](https://twitter.com/fitnr/lists/every-lot) around the world. However, ours runs as CronJob on Kubernetes (it's using the same cluster that Waka uses!). I can't speak too much creating the GIS database, but you can deploy your own bot with the Terraform here: <https://github.com/consindo/everylotbot-k8s>.

<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
