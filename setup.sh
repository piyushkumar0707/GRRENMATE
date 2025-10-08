#!/bin/bash

# 🌱 GreenMate - Automated Setup Script
# This script sets up the entire GreenMate development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project info
PROJECT_NAME="GreenMate"
NODE_MIN_VERSION="18"
NPM_MIN_VERSION="9"

print_header() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                     🌱 $PROJECT_NAME Setup                      ║"
    echo "║              Your AI-Powered Plant Care Companion               ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node_version() {
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        local node_major=$(echo $node_version | cut -d. -f1)
        
        if [ "$node_major" -ge "$NODE_MIN_VERSION" ]; then
            print_success "Node.js $node_version is installed and compatible"
            return 0
        else
            print_error "Node.js $node_version is installed but requires >= $NODE_MIN_VERSION"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Check npm version
check_npm_version() {
    if command_exists npm; then
        local npm_version=$(npm --version)
        local npm_major=$(echo $npm_version | cut -d. -f1)
        
        if [ "$npm_major" -ge "$NPM_MIN_VERSION" ]; then
            print_success "npm $npm_version is installed and compatible"
            return 0
        else
            print_warning "npm $npm_version is installed but recommends >= $NPM_MIN_VERSION"
            return 0
        fi
    else
        print_error "npm is not installed"
        return 1
    fi
}

# Install Node.js using NodeSource repository (for Ubuntu/Debian)
install_nodejs_ubuntu() {
    print_step "Installing Node.js $NODE_MIN_VERSION LTS..."
    
    # Update package list
    sudo apt-get update
    
    # Install curl if not present
    if ! command_exists curl; then
        print_info "Installing curl..."
        sudo apt-get install -y curl
    fi
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    
    # Install Node.js
    sudo apt-get install -y nodejs
    
    print_success "Node.js installed successfully"
}

# Install Node.js (generic instructions)
install_nodejs_generic() {
    print_error "Node.js is not installed. Please install Node.js >= $NODE_MIN_VERSION"
    print_info "Visit: https://nodejs.org/en/download/"
    print_info "Or use a version manager like nvm: https://github.com/nvm-sh/nvm"
    exit 1
}

# Check and install prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local node_ok=false
    local npm_ok=false
    
    # Check Node.js
    if check_node_version; then
        node_ok=true
    else
        # Try to install Node.js on Ubuntu
        if [[ -f /etc/ubuntu-release ]] || [[ -f /etc/debian_version ]]; then
            read -p "Would you like to install Node.js automatically? [y/N]: " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                install_nodejs_ubuntu
                if check_node_version; then
                    node_ok=true
                fi
            else
                install_nodejs_generic
            fi
        else
            install_nodejs_generic
        fi
    fi
    
    # Check npm (should come with Node.js)
    if check_npm_version; then
        npm_ok=true
    fi
    
    if [ "$node_ok" = true ] && [ "$npm_ok" = true ]; then
        print_success "All prerequisites are satisfied"
    else
        print_error "Prerequisites check failed"
        exit 1
    fi
}

# Check if Docker is available
check_docker() {
    if command_exists docker && command_exists docker-compose; then
        print_success "Docker and Docker Compose are available"
        return 0
    else
        print_warning "Docker is not available - database will need manual setup"
        return 1
    fi
}

# Start Docker services
start_docker_services() {
    if check_docker; then
        print_step "Starting Docker services..."
        
        if [ -f "docker-compose.yml" ]; then
            docker-compose up -d
            print_success "Docker services started"
            
            # Wait a moment for services to start
            print_info "Waiting for services to initialize..."
            sleep 5
            
            return 0
        else
            print_warning "docker-compose.yml not found"
            return 1
        fi
    else
        return 1
    fi
}

# Create environment files
create_env_files() {
    print_step "Setting up environment variables..."
    
    # Create root .env if it doesn't exist
    if [ ! -f ".env" ]; then
        print_info "Creating root .env file..."
        cat > .env << EOL
# Environment Configuration
NODE_ENV=development

# Server Ports
WEB_PORT=3000
API_PORT=3001

# Database Configuration
DATABASE_URL="postgresql://admin:greenmate123@localhost:5433/greenmate"

# Redis Configuration  
REDIS_URL="redis://localhost:6379"
EOL
        print_success "Root .env file created"
    else
        print_info "Root .env file already exists"
    fi
    
    # Create API .env if it doesn't exist
    if [ ! -f "apps/api/.env" ]; then
        print_info "Creating API .env file..."
        mkdir -p apps/api
        cat > apps/api/.env << EOL
# Server Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# JWT Configuration (REQUIRED for authentication)
JWT_SECRET=your-super-secret-jwt-key-for-development-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-minimum-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DATABASE_URL="postgresql://admin:greenmate123@localhost:5433/greenmate"

# External API Keys (Optional - for full functionality)
# Get these from the respective services:
# PLANTNET_API_KEY=your-plantnet-api-key
# OPENWEATHER_API_KEY=your-openweather-api-key  
# OPENAI_API_KEY=your-openai-api-key
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary Configuration (Optional - for image uploads)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Optional - for notifications)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Redis Configuration
REDIS_URL="redis://localhost:6379"
EOL
        print_success "API .env file created"
    else
        print_info "API .env file already exists"
    fi
    
    # Create database .env if it doesn't exist  
    if [ ! -f "packages/database/.env" ]; then
        print_info "Creating database .env file..."
        mkdir -p packages/database
        cat > packages/database/.env << EOL
# Database Configuration
DATABASE_URL="postgresql://admin:greenmate123@localhost:5433/greenmate"

# Direct connection (for migrations)
DIRECT_URL="postgresql://admin:greenmate123@localhost:5433/greenmate"
EOL
        print_success "Database .env file created"
    else
        print_info "Database .env file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing project dependencies..."
    
    # Install root dependencies
    print_info "Installing root dependencies..."
    npm install
    
    # Install workspace dependencies
    print_info "Installing workspace dependencies..."
    npm run setup
    
    print_success "All dependencies installed"
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    
    # Generate Prisma client
    print_info "Generating Prisma client..."
    npm run db:generate
    
    # Check if we can connect to database
    if start_docker_services; then
        # Wait a bit more for PostgreSQL to be ready
        print_info "Waiting for database to be ready..."
        sleep 10
        
        # Push database schema
        print_info "Pushing database schema..."
        if npm run db:push; then
            print_success "Database schema pushed successfully"
            
            # Seed database
            print_info "Seeding database with sample data..."
            if npm run db:seed; then
                print_success "Database seeded successfully"
            else
                print_warning "Database seeding failed - you can run 'npm run db:seed' later"
            fi
        else
            print_warning "Database schema push failed - check your database connection"
        fi
    else
        print_warning "Docker services not available - database setup skipped"
        print_info "You'll need to set up PostgreSQL manually or install Docker"
    fi
}

# Create helpful scripts
create_scripts() {
    print_step "Creating helpful scripts..."
    
    # Create start script
    if [ ! -f "start.sh" ]; then
        cat > start.sh << 'EOL'
#!/bin/bash
# Quick start script for GreenMate

echo "🌱 Starting GreenMate development servers..."

# Start Docker services if available
if command -v docker-compose >/dev/null 2>&1 && [ -f "docker-compose.yml" ]; then
    echo "Starting Docker services..."
    docker-compose up -d
    sleep 3
fi

# Start development servers
echo "Starting development servers..."
npm run dev
EOL
        chmod +x start.sh
        print_success "Created start.sh script"
    fi
    
    # Create stop script
    if [ ! -f "stop.sh" ]; then
        cat > stop.sh << 'EOL'
#!/bin/bash
# Stop script for GreenMate

echo "🛑 Stopping GreenMate services..."

# Stop Docker services if available
if command -v docker-compose >/dev/null 2>&1 && [ -f "docker-compose.yml" ]; then
    echo "Stopping Docker services..."
    docker-compose down
fi

echo "Services stopped."
EOL
        chmod +x stop.sh
        print_success "Created stop.sh script"
    fi
}

# Display final instructions
show_completion_message() {
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗"
    echo -e "║                    🎉 Setup Complete!                           ║"
    echo -e "╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo
    print_success "GreenMate is ready for development!"
    echo
    echo -e "${PURPLE}📝 Next Steps:${NC}"
    echo "1. Start development servers:"
    echo -e "   ${CYAN}./start.sh${NC} or ${CYAN}npm run dev${NC}"
    echo
    echo "2. Open your browser:"
    echo -e "   ${CYAN}Frontend: http://localhost:3000${NC}"
    echo -e "   ${CYAN}API: http://localhost:3001${NC}"
    echo
    echo "3. Access database admin (if Docker is running):"
    echo -e "   ${CYAN}Adminer: http://localhost:8080${NC}"
    echo -e "   ${CYAN}Prisma Studio: npm run db:studio${NC}"
    echo
    echo -e "${PURPLE}🔑 Important Files:${NC}"
    echo -e "   ${CYAN}apps/api/.env${NC} - Configure API keys for full functionality"
    echo -e "   ${CYAN}README.md${NC} - Detailed project documentation"
    echo -e "   ${CYAN}DEVELOPMENT.md${NC} - Development guidelines"
    echo
    echo -e "${PURPLE}📚 Documentation:${NC}"
    echo -e "   ${CYAN}PROJECT_DOCUMENTATION.md${NC} - Complete technical documentation"
    echo -e "   ${CYAN}BEGINNER_GUIDE_TO_WEB_DEVELOPMENT.md${NC} - Learning guide"
    echo
    echo -e "${YELLOW}⚠ Note:${NC} Some features require external API keys (Plant identification, Weather, etc.)"
    echo "Add them to apps/api/.env for full functionality."
    echo
    print_success "Happy coding! 🚀🌱"
}

# Main setup function
main() {
    print_header
    
    # Change to script directory
    cd "$(dirname "$0")"
    
    print_info "Setting up $PROJECT_NAME in: $(pwd)"
    echo
    
    # Run setup steps
    check_prerequisites
    create_env_files
    install_dependencies
    setup_database
    create_scripts
    
    # Show completion message
    show_completion_message
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi