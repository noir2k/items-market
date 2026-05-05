import fs from "node:fs/promises";

const icons = [
  [
    "maplestory",
    "https://www.google.com/s2/favicons?domain_url=https://maplestory.nexon.com&sz=128"
  ],
  [
    "lineagem",
    "https://www.google.com/s2/favicons?domain_url=https://lineagem.plaync.com&sz=128"
  ],
  [
    "lineagew",
    "https://www.google.com/s2/favicons?domain_url=https://lineagew.plaync.com&sz=128"
  ],
  [
    "lineage2m",
    "https://www.google.com/s2/favicons?domain_url=https://lineage2m.plaync.com&sz=128"
  ],
  [
    "lostark",
    "https://www.google.com/s2/favicons?domain_url=https://lostark.game.onstove.com&sz=128"
  ],
  [
    "dnf",
    "https://www.google.com/s2/favicons?domain_url=https://df.nexon.com&sz=128"
  ],
  [
    "fc-online",
    "https://www.google.com/s2/favicons?domain_url=https://fconline.nexon.com&sz=128"
  ],
  [
    "aion",
    "https://www.google.com/s2/favicons?domain_url=https://aion.plaync.com&sz=128"
  ],
  [
    "bdo",
    "https://www.google.com/s2/favicons?domain_url=https://naeu.playblackdesert.com&sz=128"
  ],
  [
    "wow",
    "https://www.google.com/s2/favicons?domain_url=https://worldofwarcraft.blizzard.com&sz=128"
  ],
  [
    "odin",
    "https://www.google.com/s2/favicons?domain_url=https://odin.game.daum.net/odin&sz=128"
  ],
  [
    "genshin",
    "https://www.google.com/s2/favicons?domain_url=https://genshin.hoyoverse.com&sz=128"
  ],
  [
    "arknights",
    "https://www.google.com/s2/favicons?domain_url=https://arknights.global&sz=128"
  ],
  [
    "valorant",
    "https://www.google.com/s2/favicons?domain_url=https://playvalorant.com&sz=128"
  ],
  [
    "overwatch",
    "https://www.google.com/s2/favicons?domain_url=https://overwatch.blizzard.com&sz=128"
  ],
  [
    "diablo4",
    "https://www.google.com/s2/favicons?domain_url=https://diablo4.blizzard.com&sz=128"
  ]
];

await fs.mkdir("./public/icons/games", { recursive: true });

for (const [slug, url] of icons) {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`FAIL ${slug}: ${res.status}`);
    continue;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(`./public/icons/games/${slug}.png`, buffer);
  console.log(`OK ${slug}.png`);
}
