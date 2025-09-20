# scripts/pull_models.sh
set -e

echo "🚀 Pulling required models for TripCraft AI..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Ollama is running
check_ollama() {
    if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo -e "${RED}❌ Ollama is not running. Please start it first:${NC}"
        echo "docker-compose up -d ollama"
        echo "or: ollama serve"
        exit 1
    fi
    echo -e "${GREEN}✅ Ollama is running${NC}"
}

# Pull model with progress
pull_model() {
    local model=$1
    local description=$2
    
    echo -e "${YELLOW}📦 Pulling $model ($description)...${NC}"
    
    if ollama pull "$model"; then
        echo -e "${GREEN}✅ Successfully pulled $model${NC}"
    else
        echo -e "${RED}❌ Failed to pull $model${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo "🔍 Checking Ollama status..."
    check_ollama
    
    echo "📋 Required models for TripCraft AI:"
    echo "  - gemma2:2b (2GB) - Main conversation model"
    echo "  - nomic-embed-text (274MB) - Embeddings"
    echo "  - llava:7b (4.7GB) - Image analysis (optional)"
    
    # Estimate total size
    echo -e "${YELLOW}💾 Total download size: ~7GB${NC}"
    echo -e "${YELLOW}🧠 RAM requirements: 8GB minimum${NC}"
    
    read -p "Continue with model download? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Download cancelled."
        exit 0
    fi
    
    # Pull essential models
    pull_model "gemma2:2b" "Main LLM - 2GB"
    pull_model "nomic-embed-text" "Text embeddings - 274MB"
    
    # Optional image model
    read -p "Download image analysis model llava:7b (4.7GB)? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pull_model "llava:7b" "Image analysis - 4.7GB"
    fi
    
    echo -e "${GREEN}🎉 All models downloaded successfully!${NC}"
    echo -e "${GREEN}🚀 You can now start the application:${NC}"
    echo "docker-compose up -d"
    echo "python main.py"
}

# Run main function
main "$@"
