FROM million12/nginx-php
EXPOSE 80
RUN yum install -y git
RUN git clone https://github.com/pogointel/openmap-frontend.git
RUN cp -R openmap-frontend/src/* /usr/share/nginx/html
