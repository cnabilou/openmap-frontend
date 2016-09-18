FROM nginx:stable
EXPOSE 80
RUN apt-get update
RUN apt-get install -y git
RUN git clone https://github.com/pogointel/openmap-frontend.git
RUN cp -R openmap-frontend/src/* /usr/share/nginx/html
