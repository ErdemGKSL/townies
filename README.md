# townies
Town vs Bads algorithm

```ts
const townies = new Townies("townies", [
    { name: "Townie", namespace: "townies", vote: () => null },
    { name: "Mafia", namespace: "mafia", kill: () => null },
] as const);
```