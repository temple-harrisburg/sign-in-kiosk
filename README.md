# Sign-in Kiosk

# Overview
## Dependencies
- [Node.js 26.2.0](https://nodejs.org/en/download/current)
- [`lp`](https://manpage.me/index.cgi?apropos=0&q=lp&sektion=0&manpath=FreeBSD+12-CURRENT+and+Ports&arch=default&format=html)
- (recommended) [printer-driver-dymo](https://packages.ubuntu.com/search?keywords=printer%2Ddriver%2Ddymo&searchon=all&suite=all&section=all)
- (recommended) [pnpm](https://pnpm.io/)

## Quick Start
```sh
pnpm install
pnpm start
```
By default the web interface is served at http://localhost:8080.

## Configuration
### Precedence
Configuration options are read from the following sources, by order of precedence:
1. CLI Options
2. SQLite Database ("config" table)
3. `.env` file.

### Setting Config Options
#### CLI
The CLI options are specified in [`src/main.js`](https://github.com/temple-harrisburg/sign-in-kiosk/blob/e2cf51d50b210cebfda8d511ae94b344e4043d64/src/main.js#L18):
```js
const options = {
    /**
     * The port the server will run on
     */
    "port": { type: "string", default: "8080" },

    /**
     * The env file from which to pull default configuration
     */
    "env-file": { type: "string", default: ".env" },

    /**
     * The prefix indicating an environment variable should be loaded into the app config, e.g. CONFIG_PASSWORD="p@ssword!" is saved as {key:'password', value:"p@ssword!"}
     */
    "config-prefix": { type: "string", default: "CONFIG_" },

    /**
     * The directory where the front-end static files (html,css,js,etc.) are located.
     */
    "static-dir": { type: "string", default: "./src/static" },

    /**
     * The path to the SQLite database. Defaults to in-memory
     */
    "db-uri": { type: "string", default: ":memory:" },

    /**
     * Path to the SVG label template 
     */
    "print-template": { type: "string", default: "./template.svg" },

    /**
     * Path to temporary directory for intermediate files generated during printing
     */
    "print-tmpdir": { type: "string", default: os.tmpdir() },

    /**
     * Whether or not to enable verbose logging
     */
    "verbose": { type: "boolean", default: false },

    /**
     * File to write logs to. Leave empty to log only to sdout.
     */
    "log-file": { type: "string" },

    /**
     * Enable or disable colors for the stdout log stream
     */
    "log-colors": { type: "boolean", default: true }
}
```

For example:
```sh
node src/main.js --verbose --env-file .env.production
```
This command will enable verbose logging and read config files from an env file named `.env.production` in the current working directory.


#### Database
Configuration is persisted in the database in the 'config' table. Config options specified here will take precedence over whatever is found in the `.env` file.

#### .env file
`src/main.js` looks for variables in the environment with keys that start with a prefix. The default prefix is `CONFIG_`. The key names are assumed to be in 'SNAKE_CASE', so they're converted to 'camelCase', then loaded into the database.

For example, the following env file will result in the below configuration:
```sh 
CONFIG_PASSWORD=password
CONFIG_LABEL_DEFAULT_COUNT=300
CONFIG_LABEL_TEMPLATE_PATH="template.svg"
```

Results in:

```js
{
    "password":"password",
    "labelDefaultCount":"300",
    "labelTemplatePath":"template.svg"
}
```

If these keys are not found in the database, they will be entered as new items. Otherwise, the existing database configuration takes precedence, and the environment variable is ignored.
