# Sign-in Kiosk

# Overview
## Dependencies
- [`lp`](https://manpage.me/index.cgi?apropos=0&q=lp&sektion=0&manpath=FreeBSD+12-CURRENT+and+Ports&arch=default&format=html)
- (Optional, for use with Dymo printers) [matthiasbock/dymo-cups-drivers](https://github.com/matthiasbock/dymo-cups-drivers)
## Configuration
### Precedence
Configuration options are read from the following sources, by order of precedence:
1. CLI Options
2. SQLite Database ("config" table)
3. `.env` file.

### Setting Config Options
#### CLI
These are the CLI arguments:
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

#### Database

#### .env file
`main.js` looks for variables in the environment with keys that start with a prefix. The default prefix is `CONFIG_`. The key names are assumed to be in 'SNAKE_CASE', so they're converted to 'camelCase', then loaded into the database.

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