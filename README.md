# Daily Games Hub

A website that serves as a hub for popular daily games like Wordle, Connections, and more.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/liny18/daily-games-hub.git
cd daily-games-hub
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

- `app/`: Next.js app router pages and layouts
- `components/`: React components
  - `ui/`: shadcn/ui components
- `lib/`: Utility functions and data
- `public/`: Static assets

## Adding More Games

To add more games to the directory, edit the `lib/games-data.ts` file and add new entries to the `games` array.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
