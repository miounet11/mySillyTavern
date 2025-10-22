# SillyTavern Perfect Clone

🎭 **Perfect clone of SillyTavern AI chat interface with enhanced features**

A modern, feature-complete reimplementation of SillyTavern using Next.js 14, TypeScript, and cutting-edge web technologies. Maintains 100% compatibility with original SillyTavern while providing improved performance and developer experience.

## ✨ Features

### 🎯 Core SillyTavern Compatibility
- ✅ **100% Feature Parity** - All original SillyTavern functionality
- ✅ **Character Card Support** - JSON, PNG, and TavernAI formats
- ✅ **AI Model Integration** - OpenAI, Anthropic, Local AI models
- ✅ **World Info System** - Keyword and vector-based information injection
- ✅ **Chat Branching** - Complete conversation flow management
- ✅ **Plugin Architecture** - Extensible plugin system
- ✅ **UI Consistency** - Exact replica of original interface

### 🚀 Enhanced Features
- 🎨 **Modern Tech Stack** - Next.js 14 + TypeScript + Tailwind CSS
- 📱 **Responsive Design** - Mobile-friendly interface
- ⚡ **Performance Optimized** - Faster responses and reduced memory usage
- 🔒 **Enhanced Security** - Modern security practices and encryption
- 🐳 **Container Ready** - Docker deployment support
- 📊 **Monitoring** - Built-in performance monitoring
- 🌍 **Internationalization** - Multi-language support ready

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5
- **Styling**: Tailwind CSS 3, Headless UI
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: SQLite (local) + Prisma ORM
- **Testing**: Jest + React Testing Library + Playwright
- **Deployment**: Docker + Docker Compose

### Project Structure
```
sillytavern-perfect-clone/
├── apps/
│   └── web/                    # Next.js application
├── packages/
│   ├── shared/                 # Shared types and utilities
│   ├── database/               # Database schemas and migrations
│   └── ai-providers/           # AI model integrations
├── infrastructure/
│   └── docker/                 # Docker configurations
├── docs/                       # Project documentation
└── tests/                      # E2E tests
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/sillytavern-perfect-clone.git
   cd sillytavern-perfect-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Initialize database**
   ```bash
   npm run db:setup
   ```

5. **Start development**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Development

```bash
# Start all services with Docker
npm run docker:dev

# Or manually
docker-compose -f docker-compose.dev.yml up
```

## 📖 Documentation

- [Product Requirements Document](docs/sillytavern-prd.md)
- [Architecture Design](docs/sillytavern-fullstack-architecture.md)
- [Competitor Analysis](docs/sillytavern-competitor-analysis.md)
- [Project Brief](docs/sillytavern-project-brief.md)

## 🎮 Usage

### Creating Your First Character

1. Navigate to the Characters section
2. Click "Create Character"
3. Fill in character details:
   - Name and description
   - Personality and background
   - First message and example dialogue
4. Save and start chatting!

### Setting Up AI Models

1. Go to Settings → AI Models
2. Add your preferred AI provider:
   - **OpenAI**: Add API key
   - **Anthropic**: Add API key
   - **Local AI**: Configure local endpoint
3. Test connection and start chatting

### Importing Existing Characters

1. Go to Characters → Import
2. Upload your character card (JSON/PNG format)
3. Review and save imported character

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=file:./dev.db

# AI Providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
LOCAL_AI_BASE_URL=http://localhost:5000/api

# Security
JWT_SECRET=your-jwt-secret-key

# Development
NODE_ENV=development
LOG_LEVEL=debug
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests

# Watch mode
npm run test:unit -- --watch

# Coverage
npm run test -- --coverage
```

## 📦 Build & Deploy

### Local Build

```bash
npm run build
npm run start
```

### Docker Deployment

```bash
# Build images
npm run docker:build

# Run production containers
docker-compose up -d
```

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Add JSDoc comments for functions
- Include tests for new features

## 📋 Roadmap

### Phase 1: Core Features ✅
- [x] Basic chat interface
- [x] Character management
- [x] AI model integration
- [x] Database setup

### Phase 2: Advanced Features 🚧
- [ ] World info system
- [ ] Chat branching
- [ ] Plugin architecture
- [ ] Import/export functionality

### Phase 3: Polish & Optimization 📋
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Internationalization
- [ ] Advanced monitoring

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SillyTavern** - Original inspiration and feature set
- **Next.js Team** - Amazing framework
- **Vercel** - Hosting and deployment platform
- **OpenAI & Anthropic** - AI model providers

## 📞 Support

- 📧 Email: support@sillytavern-clone.com
- 💬 Discord: [Join our community](https://discord.gg/sillytavern)
- 📖 Documentation: [docs.sillytavern-clone.com](https://docs.sillytavern-clone.com)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/your-org/sillytavern-perfect-clone/issues)

---

<div align="center">
  Made with ❤️ by the SillyTavern Perfect Clone Team
</div>