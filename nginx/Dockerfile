FROM nginx:1.15.1-alpine

RUN mkdir /etc/nginx/sites-enabled
COPY nginx.conf /etc/nginx
COPY default /etc/nginx/sites-enabled
COPY proxy_params /etc/nginx

EXPOSE 443
