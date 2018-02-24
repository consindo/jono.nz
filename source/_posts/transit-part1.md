---
layout: post
title: How does Waka work? - Part 1
date: 2017-10-08 19:56:43
tags:
---

Matt keeps asking me how Waka works, so I’ve decided to write a guide. In Part 1, we go over how the server does things. I’ll try make an effort to keep this guide updated - contact me if it’s not. 

## The Server Stack
Before you even try to start Waka, you’ll need:
- Windows or Linux (I develop on Windows, production on Linux)
- Node.js https://nodejs.org
- Microsoft SQL Server http://downloadsqlserverexpress.com
- Azure Storage Emulator https://azure.microsoft.com/en-us/downloads/
- Git https://git-scm.com/

### Handy Tools
- SQL Server Management Studio (install when installing SQL Server) - Windows only though.
- Azure Storage Explorer (don’t use it a lot but it can be handy) https://azure.microsoft.com/en-us/features/storage-explorer/

### Third Party API’s
- Auckland Transport (if you want Auckland to work) https://dev-portal.at.govt.nz/
- Sendgrid (to get the send a link emails working) https://sendgrid.com/
- Azure Application Insights (only for production) https://azure.microsoft.com/en-us/services/application-insights/

## Configuration
- First, get the code with `git clone https://github.com/consindo/waka.git`
- Install dependencies with `npm install`  
- Build the client with  `npm run build` 

### /config.js
This is app wide config. Defaults should be fine, but change the public & private ports if required. Make sure you don’t expose the private port to the web! You can also disable auto updates / worker management of cities by adjusting the `autoupdate` entry.

### /server-master/db/config-master.js, config-slave.js
These are where the app looks for database connection strings. Make your SQL Server install allows SQL Server Authentication, and TCP/IP Network Protocol is enabled. The user set in `config-master.js` must be allowed to Create Databases, and the user set in `config-slave.js` must be allowed to access and modify the created database. You will need an already created database in `config-master.js`, but this is not needed for the slave.

By default, workers in the workers table use the dbconfig of `slave`, but you can set this to `whatever` if you want to use `config-whatever.js` (if you need to distribute over multiple instances of SQL Server).

### Environmental Variables

- `AZURE_STORAGE_ACCOUNT` - the Azure Storage Account. For the emulator, use: `devstoreaccount1`
- `AZURE_STORAGE_ACCESS_KEY` - the Azure Storage Account Key. For the emulator, use:
  `Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==`
- `atApiKey` - the Auckland Transport API Key (optional if you don’t want Auckland)
- `SENDGRID_API_KEY` for emails (optional)
- `AZURE_INSIGHTS` for insights (optional)
- `AGENDA21_API_KEY` currently a private key, returns parking information for Auckland Carparks (optional)

## Starting

Yay! You’ve configured Waka. Run `node index.js` to start, and it’ll create the database and start on the port you specified.

If you don’t want it to start downloading data from Auckland automatically, make sure you disable the auto updates in `/config.js`.

## Architecture

Waka has a master process that manages a collection of worker processes, each encapsulating a particular region & version and providing the API. Each worker process uses its own database which keeps things smaller, faster, and is easier to delete when the data has expired. There’s mapping functionality which sends all requests to a particular region to a particular version. If you’re using the auto importers you shouldn’t have to worry about the mappings, but it is possible to override. 

Worker spawning is done through node’s `child_process.fork`, and all communication thereafter is done through a standard REST API - using both the public and private methods on both the master and the worker. Requests are proxied through to the mapped worker from the master. Check out all the router files for further details. 

Static rendering and hosting of assets is done through yet another process. For static rendering, it uses the standard public REST API, and transforms the JSON to HTML. Files in `/dist` are all hosted under `/` when a route cannot be found. If a file is not found in `/dist`, the static server returns a default or 404 page, and lets the client side JavaScript take over the rest.

## Server-Master Private API

If you’re not using an auto importer or just need to emergency fix things, you can do so with the private API. It’s not secured, so you have to make sure the port isn’t exposed.

For most of these requests, just pop a JSON object with the prefix (region) and version in the request body. 

**Update**: You can now just head to <http://localhost:8001> and there's a nice UI for running these request.

- `GET /worker` - Returns all the available workers.
- `POST /worker/add` - Send a prefix, version to create a new worker.
- `POST /worker/load` - Load workers from the database again (generally shouldn’t use this)
- `POST /worker/start` - Send a prefix, version to start a particular worker.
- `POST /worker/startall` - Starts all workers that have startpolicy ‘auto’
- `POST /worker/stop` - Stops a worker process.
- `POST /worker/delete` - Stops a worker, and then deletes it from the database.
- `GET  /mapping` - Shows which prefixes are mapped to which workers.
- `POST /mapping/load` - Loads mappings from the database again (generally shouldn’t use this)
- `POST /mapping/set` - Send a prefix and a version to set the worker where requests are forwarded.
- `POST /mapping/delete` - Unmaps a prefix - requests to a region will 404 after being deleted.
- `POST /import-start/:mode` - Trigger a manual import of GTFS data. Use `db` for the database import, `shapes` for the Azure Shapes Parse & Upload, or `all` for both.
- `POST /import-complete` - Used internally from the worker - tells master that an import has completed so it can update the database and run any callbacks.

## Server-Worker & Server-Static Public API
This is the public API. You can generate them with `npm run document` or just head to <https://getwaka.com/docs/index.html>.

## SQL Migrations
Because we create the database from scratch every time a new worker is created, we don’t have to worry about migrations! Simply delete the worker and try again if you’re having any issues. The SQL files which create the tables and stored procedures are located in `/server-worker/db/procs`

I’m not sure how to do the migrations for the master database yet, but the scripts that create it on first run are in `/server-master/db/procs`

## Tests
No unit tests yet 😢. There’s a couple of tests in the Auckland auto importer that does a quick check before changing the live mapping, but that’s it. There’s definitely room for improvement here.

## Other Things
Here’s some things you might want to do when modifying or using Waka as a dev.

### Adding a New City
- Add an importer with countrycode-airportcode as the prefix in `/server-worker/importers`
- Use the private API to add, start, run the importer, and set the mapping to your version.
- Fix anything that’s broken when you try use that city.
  - Lines requires special config.
  - Realtime also requires special config.
  - Stations, Stop Times, and Timetable should be pretty smooth sailing.
- Add an auto importer to keep versions & mappings up to date.
- Send a pull request!

## Now what?
Hopefully you download the code and have a play - fix a few issues, or even just file some 😃 https://github.com/consindo/waka/issues

In [Part 2](/2018/02/25/transit-part2/), we’ll go over the client-side development.

