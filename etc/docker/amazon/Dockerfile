FROM amazonlinux:2

# Setup build environment
RUN mkdir -p /build/src && \
	yum update -y && \
	# Add required packages
	yum install -y awscli git gcc clang tree make zip gzip tar perl zlib-devel && \
	# Install rust with rustup
	curl -sSf https://sh.rustup.rs | sh -s -- -y

WORKDIR /usr/local/src
RUN curl -O https://www.openssl.org/source/openssl-1.1.1s.tar.gz && \
	tar xzvf openssl-1.1.1s.tar.gz
WORKDIR /usr/local/src/openssl-1.1.1s
RUN ./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl shared zlib
RUN make
RUN make install

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

WORKDIR /root
ENV OPENSSL_DIR=/usr/local/openssl
ENV OPENSSL_STATIC=true

ADD . .

# Default build command
# ENTRYPOINT \
# 	source /root/.profile && \
# 	nvm install && \
# 	nvm use && \
# 	npm install && \
# 	npm run build && \
# 	npm pack && \
# 	mv *.tgz /build