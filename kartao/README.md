# Kartão

A lightweight Kanban board application that stores project data in JSON files, making it perfect for version control and personal project management.

## Features

- Store project data in JSON files
- Drag-and-drop interface for managing tasks
- Customizable columns
- Dark mode with Nord theme
- Custom CSS support
- Docker support

## Prerequisites

- Docker and Docker Compose
- Node.js (for development)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kartao.git
cd kartao
```

2. Create the required volume directories:
```bash
mkdir -p volumes/data volumes/css
```

3. Start the application:
```bash
docker-compose up
```

4. Access the application at http://localhost:3000

## Development

1. Install dependencies:
```bash
npm install
cd src/frontend && npm install
```

2. Start the development server:
```bash
npm run dev
```

## Customization

### Default Columns

You can customize the default columns by modifying the `DEFAULT_COLUMNS` environment variable in `docker/docker-compose.yml`.

### Custom CSS

Place your custom CSS files in the `volumes/css` directory. These files will override the default styles.

## Project Structure

```
kartao/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/
│   ├── frontend/
│   │   ├── components/
│   │   ├── styles/
│   │   └── App.tsx
│   ├── backend/
│   │   ├── routes/
│   │   └── server.ts
│   └── types/
├── volumes/
│   ├── data/
│   └── css/
└── README.md
```

## License

MIT 