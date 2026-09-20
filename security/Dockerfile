FROM python:3.12-slim

WORKDIR /strix

# Install basic network tools and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    nmap \
    dnsutils \
    jq \
    docker-cli \
    && rm -rf /var/lib/apt/lists/*

# Install strix-agent CLI
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir strix-agent requests || true

COPY scripts/ /strix/scripts/
RUN chmod +x /strix/scripts/*.sh

VOLUME ["/strix/reports"]

ENV STRIX_TARGET_URL="http://vibe-nginx:80"

CMD ["tail", "-f", "/dev/null"]
