# MDDB VRE

This repo contains the basic **VRE** for the [**MDDB**](https://mddbr.eu/) project. Through this web application, will be able to **upload raw data** to an **MDDB node**.

![logo](public/img/logo.png)

## Installation

1. Git clone this same repository on the server:

```bash
git clone [git@mmb.irbbarcelona.org:22124]:gbayarri/mddb-vre.git
```

2. Install node modules:

```bash
npm install
```

3. A `.env` file must be created in the project root. The file `.env.git` can be taken as an example. The file must contain the following environment variables:

| key                       | value                                    | description                     |
| ------------------------- | ---------------------------------------- | ------------------------------- |
| BASE_URL_DEVELOPMENT      | string                                   | baseURL for development         |
| BASE_URL_STAGING          | string                                   | baseURL for staging             |
| BASE_URL_PRODUCTION       | string                                   | baseURL for production          |
| NODE_NAME                 | string                                   | node identifier to deploy       |

## Development Server

Start the development server on `http://localhost:3001`:

```bash
# npm
npm run dev
```

## Build

Build the application for production.

### Staging

Build the application for development server (webdev3).

```bash
# npm
npm run build:staging
```

Copy the **.output** folder to the server.

### Production

Build the application for production server.

```bash
# npm
npm run build:production
```

Copy the **.output** folder to the server.

## Configuration for apache server (development)

1. Edit */etc/apache2/sites-available/000-default.conf* file and add:

```apacheconf
<Location /vre/ >
    ProxyPass http://localhost:3001/whatever/vre/
    ProxyPassReverse http://localhost:3001/whatever/vre/
</Location>
```

Note that port can be 3001 or any other declared in the **ecosystem.config.js** file (see step 4)

2. Enable proxy and proxy_http modules and restart apache:

```shell
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo /etc/init.d/apache2 restart
```

3. Install PM2 for running nodeJS server as a daemon:

```bash
sudo npm install pm2 -g
```

4. Create **ecosystem.config.js** file in the same folder where the **.output** folfer has been copied:

```javascript
module.exports = {
  apps: [
    {
      name: 'vre',
      port: '3001',
      exec_mode: 'cluster',
      instances: 'max',
      env: {
	    NODE_ENV: 'staging'
      },
      script: './.output/server/index.mjs'
    }
  ]
}
```

4. Launch server (from the folder where it's installed):

```bash
pm2 start ecosystem.config.js --name vre
```

5. Check that the server is up and running:

```bash
pm2 list
lsof -i tcp:3001
```

5. Make pm2 persistent in case VM has to be reset:
    
```bash
pm2 startup systemd
```

## Credits

Genís Bayarri, Adam Hospital.

## Copyright & licensing

This website has been developed by the [MMB group](https://mmb.irbbarcelona.org) at the [IRB Barcelona](https://irbbarcelona.org).

© 2024 **Institute for Research in Biomedicine**

Licensed under the **Apache License 2.0**.