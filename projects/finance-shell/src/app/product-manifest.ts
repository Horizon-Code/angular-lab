type ProductManifest = Readonly<Record<string, string>>;

let manifest: Promise<ProductManifest> | undefined;

/**
 * Resolves a product's remoteEntry URL from `finance.manifest.json`, served by
 * this micro-frontend. `import.meta.url` points at this micro's own origin even
 * when it runs inside the root shell, so the manifest always comes from here.
 */
export async function resolveProductEntry(product: string): Promise<string | undefined> {
  manifest ??= fetch(new URL('/finance.manifest.json', import.meta.url))
    .then((response) => (response.ok ? (response.json() as Promise<ProductManifest>) : {}))
    .catch(() => ({}));
  return (await manifest)[product];
}
