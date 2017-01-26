Rallirekisteri
==============

A simple web application for storing best times in rally games.

![Screenshot](./screenshot.png?raw=true)

See also the IRC bot [Rallibotti](https://github.com/joonasjussila/rallibotti)
that stores times into Rallirekisteri from IRC channels.

Requirements
------------

* nodejs >= v4.0.0
* npm
* yarn
* RethinkDB ~ v2.3.0

Installation
------------

1. Install dependencies ```yarn```
2. Build frontend code ```yarn run build```
3. Start RethinkDB ```rethinkdb --http-port 8081``` 
4. Open RethinkDB's web UI in http://localhost:8081
5. Create new database called `rallirekisteri`
6. Create new table called `rounds`
7. Create new secondary index to `rounds` table called `date`
8. Start application ```yarn start```

Application starts at http://localhost:8080

Default configuration can be overridden by placing a configuration file under 
config directory. Then setting environment variable NODE_ENV makes the 
application to load the configuration file.

**Example**

Create config/production.json
Then start application with:

```
NODE_ENV=production yarn start
```

Development
-----------

Start webpack's hot loading server:

```yarn run dev```

Then connect to http://localhost:3000 and do some coding.

Backend development does not have hot loading or a watcher, so the server
must be restarted after changing something.

Architecture overview
---------------------

When the application loads, initial list of times are fetched via API but all 
updates after this are done via websockets. All changes to data are displayed
on clients in realtime.
