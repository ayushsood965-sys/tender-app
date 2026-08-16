FROM node:20-bookworm-slim

# Install Python 3 and python-docx for high-fidelity DOCX generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && pip3 install --no-cache-dir --break-system-packages python-docx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "server.js"]
