# Water Log API

GraphQL API to log various drinks

## Development Guide

### Requirements

* [Auth0](https://auth0.com/) - This API is protected by authentication provided by Auth0. 
* [Docker](https://www.docker.com/)

### Getting started 

* Clone the repo
* Copy `.env.sample`, rename to `.env` and populate variables
* Add the development domain to your local hostfile
* Generate dev certificates
  * using [mkcert][mkcert], install the root CA certificate: `mkcert -install`
  * Install certs in `certs` directory:
  
    ```sh
    mkcert -cert-file ./certs/caCert.pem -key-file ./certs/caPrivkey.pem <dev domain>
    ```
    **Note**: Cert file _must_ be named `caCert.pem`, and key file _must_ be named `caPrivkey.pem`.
* Start the server `docker compose up`
  

**Note**: This project uses [docker-nginx-certbot][docker-nginx-certbot] to generate certificates. 
Please review the documentation on [advanced usage][advanced-usage] as it relates to 
local development.

[mkcert]: https://github.com/FiloSottile/mkcert
[docker-nginx-certbot]: https://github.com/JonasAlfredsson/docker-nginx-certbot
[advanced-usage]: https://github.com/JonasAlfredsson/docker-nginx-certbot/blob/master/docs/advanced_usage.md

