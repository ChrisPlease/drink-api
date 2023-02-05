# server {
#   listen 80;
#   server_name api.waterlog.dev;

#   location / {
#     return 301 https://$host$request_uri;
#   }

#   location /.well-known/acme-challenge/ {
#     root /var/www/certbot;
#   }
# }

# server {
#   listen 443 ssl;
#   server_name api.waterlog.dev;

#   ssl_certificate /etc/letsencrypt/live/api.waterlog.dev/fullchain.pem;
#   ssl_certificate_key /etc/letsencrypt/live/api.waterlog.dev/privkey.pem;
#   include /etc/letsencrypt/options-ssl-nginx.conf;
#   ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;


#   location / {
#     proxy_pass http://api.waterlog.dev;
#   }
# }a
server {
    # Listen to port 443 on both IPv4 and IPv6.
    listen 443 ssl default_server reuseport;
    listen [::]:443 ssl default_server reuseport;

    # Domain names this server should respond to.
    server_name waterlog.dev api.waterlog.dev;

    # Load the certificate files.
    ssl_certificate         /etc/letsencrypt/live/test-name/fullchain.pem;
    ssl_certificate_key     /etc/letsencrypt/live/test-name/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/test-name/chain.pem;

    # Load the Diffie-Hellman parameter.
    ssl_dhparam /etc/letsencrypt/dhparams/dhparam.pem;

    return 200 'Let\'s Encrypt certificate successfully installed!';
    add_header Content-Type text/plain;
}
