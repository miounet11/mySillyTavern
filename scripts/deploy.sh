#!/bin/bash

# SillyTavern Perfect Clone - Deployment Script
# This script builds and deploys the application using Docker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."

    mkdir -p data
    mkdir -p uploads
    mkdir -p logs

    print_success "Directories created"
}

# Setup environment file
setup_env() {
    print_status "Setting up environment variables..."

    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating a template..."
        cat > .env << EOF
# SillyTavern Perfect Clone - Environment Variables

# Application
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database (SQLite by default)
DATABASE_URL=file:./data/sillytavern.db

# Authentication (Optional)
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# AI Model API Keys (Add your API keys here)
# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Anthropic (Claude)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google AI
GOOGLE_AI_API_KEY=your-google-ai-api-key

# PostgreSQL (Optional - Uncomment if using PostgreSQL)
# POSTGRES_PASSWORD=your-secure-password
# DATABASE_URL=postgresql://sillytavern:your-secure-password@postgres:5432/sillytavern

# Redis (Optional - Uncomment if using Redis)
# REDIS_URL=redis://redis:6379
EOF
        print_warning "Please edit .env file and add your API keys before running the application."
    else
        print_success ".env file exists"
    fi
}

# Build and deploy the application
deploy_app() {
    print_status "Building and deploying SillyTavern Perfect Clone..."

    # Stop existing containers
    docker-compose down --remove-orphans || true

    # Build the application
    print_status "Building Docker image..."
    docker-compose build --no-cache

    # Start the application
    print_status "Starting application containers..."
    docker-compose up -d

    # Wait for the application to start
    print_status "Waiting for application to start..."
    sleep 10

    # Check if the application is running
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        print_success "Application is running successfully!"
        print_status "Access your SillyTavern at: http://localhost:3000"
    else
        print_warning "Application might still be starting. Please wait a moment and check http://localhost:3000"
    fi
}

# Show logs
show_logs() {
    print_status "Showing application logs..."
    docker-compose logs -f
}

# Stop the application
stop_app() {
    print_status "Stopping SillyTavern Perfect Clone..."
    docker-compose down
    print_success "Application stopped"
}

# Update the application
update_app() {
    print_status "Updating SillyTavern Perfect Clone..."

    # Pull latest changes (if in git repository)
    if [ -d .git ]; then
        git pull origin main || print_warning "Could not pull latest changes"
    fi

    # Rebuild and restart
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d

    print_success "Application updated successfully!"
}

# Backup data
backup_data() {
    print_status "Creating backup..."

    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # Backup database
    if [ -f data/sillytavern.db ]; then
        cp data/sillytavern.db "$BACKUP_DIR/"
        print_success "Database backed up to $BACKUP_DIR/sillytavern.db"
    fi

    # Backup uploads
    if [ -d uploads ]; then
        cp -r uploads "$BACKUP_DIR/"
        print_success "Uploads backed up to $BACKUP_DIR/uploads"
    fi

    # Backup environment file
    if [ -f .env ]; then
        cp .env "$BACKUP_DIR/"
        print_success "Environment file backed up to $BACKUP_DIR/.env"
    fi

    print_success "Backup completed: $BACKUP_DIR"
}

# Show help
show_help() {
    echo "SillyTavern Perfect Clone - Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy     Build and deploy the application"
    echo "  start      Start the application"
    echo "  stop       Stop the application"
    echo "  restart    Restart the application"
    echo "  logs       Show application logs"
    echo "  update     Update the application"
    echo "  backup     Backup application data"
    echo "  status     Show application status"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy     # First-time deployment"
    echo "  $0 start      # Start the application"
    echo "  $0 logs       # View logs"
    echo "  $0 update     # Update to latest version"
}

# Show application status
show_status() {
    print_status "Application status:"
    docker-compose ps
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        check_docker
        create_directories
        setup_env
        deploy_app
        ;;
    "start")
        check_docker
        docker-compose up -d
        print_success "Application started"
        ;;
    "stop")
        stop_app
        ;;
    "restart")
        stop_app
        check_docker
        docker-compose up -d
        print_success "Application restarted"
        ;;
    "logs")
        show_logs
        ;;
    "update")
        check_docker
        update_app
        ;;
    "backup")
        backup_data
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

print_success "Done! 🎉"