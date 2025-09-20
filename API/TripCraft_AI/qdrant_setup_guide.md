# Qdrant Vector Database Setup Guide

Qdrant is a vector similarity search engine that can be run locally (free) or in the cloud. This guide covers both options.

## Option 1: Local Qdrant (Completely Free)

### Using Docker (Recommended)

The easiest way to run Qdrant locally:

```bash
# Run Qdrant in Docker (no API key needed)
docker run -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

**What this does:**
- Downloads and runs Qdrant locally
- Exposes API on port 6333 (HTTP) and 6334 (gRPC)
- Creates local storage directory for persistence
- No authentication required for local setup

**Your .env configuration:**
```bash
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # Leave empty for local setup
```

### Using Docker Compose (For Production)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334" 
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      QDRANT__SERVICE__HTTP_PORT: 6333
      QDRANT__SERVICE__GRPC_PORT: 6334

volumes:
  qdrant_data:
```

Run with:
```bash
docker-compose up -d
```

### Binary Installation (Advanced)

Download from [Qdrant releases](https://github.com/qdrant/qdrant/releases):

```bash
# Linux/Mac
wget https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-unknown-linux-musl.tar.gz
tar -xzf qdrant-x86_64-unknown-linux-musl.tar.gz
./qdrant
```

## Option 2: Qdrant Cloud (Has Free Tier)

### Sign Up for Qdrant Cloud

1. **Visit**: https://cloud.qdrant.io/
2. **Sign up** with email or GitHub
3. **Free tier includes**:
   - 1GB storage
   - 100k vectors
   - Single cluster
   - No credit card required

### Create a Cluster

1. **Login** to Qdrant Cloud dashboard
2. **Click "Create Cluster"**
3. **Choose "Free" plan** (1GB, no cost)
4. **Select region** (choose closest to your location)
5. **Name your cluster** (e.g., "tripcraft-dev")
6. **Click "Create"**

### Get API Credentials

After cluster creation:

1. **Go to "API Keys"** in dashboard
2. **Click "Create API Key"**
3. **Name it** (e.g., "TripCraft API Key")
4. **Copy the API key** (starts with `qdt_`)
5. **Note the cluster URL** (looks like `https://xyz-abc.eu-central.aws.cloud.qdrant.io:6333`)

### Configure Your Application

Update your `.env` file:
```bash
QDRANT_URL=https://your-cluster-id.region.cloud.qdrant.io:6333
QDRANT_API_KEY=qdt_your_api_key_here
```

## Verification Steps

### Test Local Connection

```bash
# Check if Qdrant is running
curl http://localhost:6333/health

# Expected response:
# {"title":"qdrant - vector search engine","version":"1.x.x"}
```

### Test Cloud Connection

```bash
# Replace with your cloud URL and API key
curl -H "api-key: qdt_your_api_key_here" \
  https://your-cluster.cloud.qdrant.io:6333/health
```

### Test with Python

```python
from qdrant_client import QdrantClient

# Local connection
client = QdrantClient(url="http://localhost:6333")

# Cloud connection  
client = QdrantClient(
    url="https://your-cluster.cloud.qdrant.io",
    api_key="qdt_your_api_key_here"
)

# Test connection
print(client.get_collections())
```

## TripCraft AI Integration

The application will automatically:

1. **Connect to Qdrant** using your .env settings
2. **Create collections** for travel experiences
3. **Store embeddings** of destinations, activities, preferences
4. **Search similar experiences** when planning trips

### Collection Structure

TripCraft creates these collections:

- **travel_experiences**: POIs, activities, user preferences
- **destinations**: City and location embeddings
- **user_profiles**: Past trip preferences and patterns

## Troubleshooting

### Local Qdrant Issues

**Port already in use:**
```bash
# Check what's using port 6333
lsof -i :6333

# Kill process if needed
kill -9 PID

# Or use different port
docker run -p 6334:6333 qdrant/qdrant
```

**Storage permissions:**
```bash
# Fix Docker volume permissions
sudo chown -R $USER:$USER ./qdrant_storage
```

**Connection refused:**
```bash
# Check if Docker is running
docker ps

# Check Qdrant logs
docker logs qdrant_container_name
```

### Cloud Qdrant Issues

**API key invalid:**
- Regenerate API key in dashboard
- Check for extra spaces in .env file
- Ensure API key starts with `qdt_`

**Connection timeout:**
- Check cluster status in dashboard
- Verify URL format (include https:// and :6333)
- Check firewall/network settings

**Quota exceeded:**
- Monitor usage in dashboard
- Free tier: 1GB storage, 100k vectors
- Upgrade plan if needed

### Python Client Issues

**Installation:**
```bash
pip install qdrant-client>=1.7.0
```

**Import errors:**
```python
# If import fails, try:
pip install --upgrade qdrant-client
```

## Performance Tips

### Local Setup
- Allocate at least 2GB RAM to Docker
- Use SSD storage for better performance
- Consider memory limits: `docker run -m 4g qdrant/qdrant`

### Cloud Setup
- Choose region closest to your users
- Monitor query latency in dashboard
- Consider upgrading for production workloads

## Security Considerations

### Local Development
- Local Qdrant has no authentication by default
- Only accessible from localhost
- Use firewall rules if needed

### Production/Cloud
- Always use API keys
- Rotate keys regularly
- Use HTTPS endpoints only
- Monitor access logs

## Migration Between Setups

### Local to Cloud
```python
from qdrant_client import QdrantClient

# Source (local)
local_client = QdrantClient(url="http://localhost:6333")

# Target (cloud)
cloud_client = QdrantClient(
    url="https://your-cluster.cloud.qdrant.io",
    api_key="your_api_key"
)

# Migrate collections
collections = local_client.get_collections()
for collection in collections.collections:
    # Recreate collection structure
    # Copy vectors and payloads
    pass
```

### Backup and Restore
```bash
# Local backup
docker exec qdrant_container tar -czf /tmp/backup.tar.gz /qdrant/storage
docker cp qdrant_container:/tmp/backup.tar.gz ./qdrant_backup.tar.gz

# Restore
docker cp ./qdrant_backup.tar.gz qdrant_container:/tmp/
docker exec qdrant_container tar -xzf /tmp/backup.tar.gz -C /
```

## Cost Comparison

### Local Qdrant
- **Cost**: $0 (only electricity/server costs)
- **Performance**: Depends on your hardware
- **Scalability**: Limited by single machine
- **Maintenance**: You handle updates/backups

### Qdrant Cloud Free Tier
- **Cost**: $0 up to 1GB/100k vectors
- **Performance**: Optimized cloud infrastructure
- **Scalability**: Easy to upgrade
- **Maintenance**: Fully managed

### Qdrant Cloud Paid Plans
- **Starter**: ~$25/month (more storage/vectors)
- **Production**: Custom pricing
- **Enterprise**: Advanced features

## Recommendation

**For Development**: Use local Docker setup
**For MVP/Testing**: Use Qdrant Cloud free tier  
**For Production**: Evaluate based on scale and requirements

The TripCraft AI system works with both setups seamlessly - just change the .env configuration.