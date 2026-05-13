# FBA Label Trimmer

Simple web-based tool for trimming 4x6 inch FBA labels to 4x4 inch.

## Features

- 💫 Drag and drop support
- 📱 Responsive design for all devices
- 🔒 Client-side processing for privacy
- ⚡️ Real-time progress indication

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5 with runes)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn-svelte](https://shadcn-svelte.com/)
- [pdf-lib](https://pdf-lib.js.org/) for in-browser PDF transforms
- [Bun](https://bun.com/) as runtime + package manager
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) (Static Assets) for hosting

## Getting Started

```bash
git clone https://github.com/ricky9w/fba-label-trimmer.git
cd fba-label-trimmer
bun install
bun run dev
```

Open <http://localhost:5173>.

## Scripts

| Script            | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `bun run dev`     | Vite dev server                                 |
| `bun run build`   | Production build into `.svelte-kit/cloudflare/` |
| `bun run preview` | Run the built worker locally with wrangler      |
| `bun run check`   | `wrangler types --check` + `svelte-check`       |
| `bun run test`    | Vitest unit tests                               |
| `bun run lint`    | Prettier + ESLint check                         |
| `bun run format`  | Prettier write                                  |
| `bun run deploy`  | Build + `wrangler deploy`                       |

## Deployment

Deployed to Cloudflare Workers via `@sveltejs/adapter-cloudflare`. Make sure
you have run `bunx wrangler login` once, then:

```bash
bun run deploy
```

## Privacy

All files are processed locally in your browser. No data is uploaded.

## License

MIT — see [LICENSE](LICENSE).

## Contributing

Issues and Pull Requests are welcome.
