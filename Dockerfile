FROM nginx:stable
RUN apt-get install git
RUN git clone https://github.com/pogointel/openmap-frontend.git
COPY /src/ /usr/share/nginx/html
