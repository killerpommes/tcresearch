# Thaumcraft Research Helper

A lightweight React and TypeScript rebuild of the [Thaumcraft Research Helper](https://killerpommes.github.io/tcresearch/).

Choose the fixed **From** and **To** aspects from a research note, enter the number of blank spaces between them, and select **Find connection**. The pathfinder returns the shortest route while preferring aspects marked as available.

## Development

```sh
pnpm install
pnpm dev
```

The development server is exposed through Portless at
[`https://tcresearch.localhost`](https://tcresearch.localhost). On the first
run, Portless may prompt to trust its local certificate.

## Validation

```sh
pnpm lint
pnpm build
```

## Availability

Disable aspects you cannot craft in the aspect library. Addon aspect groups can be enabled from the setup panel. If no fully available route exists, the pathfinder falls back to the route with the fewest unavailable aspects.

## License

Licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Original project by [ythri](https://github.com/ythri/tcresearch).
