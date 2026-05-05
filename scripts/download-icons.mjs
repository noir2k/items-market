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
  ],

  // ── 2026-05-05 확장 (28개로 확장) ──

  // PC MMORPG 클래식
  [
    "lineage1",
    "https://www.google.com/s2/favicons?domain_url=https://lineage.plaync.com&sz=128"
  ],
  [
    "lineage-classic",
    "https://www.google.com/s2/favicons?domain_url=https://lineage.plaync.com&sz=128"
  ],
  [
    "lineage2",
    "https://www.google.com/s2/favicons?domain_url=https://lineage2.plaync.com&sz=128"
  ],

  // 모바일 RPG — 최신 오픈월드 / 가챠
  [
    "wuwa",
    "https://www.google.com/s2/favicons?domain_url=https://wutheringwaves.kurogames.com&sz=128"
  ],
  [
    "endfield",
    "https://www.google.com/s2/favicons?domain_url=https://endfield.gryphline.com&sz=128"
  ],
  [
    "hsr",
    "https://www.google.com/s2/favicons?domain_url=https://hsr.hoyoverse.com&sz=128"
  ],
  [
    "nikke",
    "https://www.google.com/s2/favicons?domain_url=https://nikke-kr.com&sz=128"
  ],

  // 액션 RPG — POE 시리즈 + 디아블로 구작
  [
    "poe",
    "https://www.google.com/s2/favicons?domain_url=https://www.pathofexile.com&sz=128"
  ],
  [
    "poe2",
    "https://www.google.com/s2/favicons?domain_url=https://www.pathofexile.com&sz=128"
  ],
  [
    "diablo2",
    "https://www.google.com/s2/favicons?domain_url=https://diablo2.blizzard.com&sz=128"
  ],
  [
    "diablo3",
    "https://www.google.com/s2/favicons?domain_url=https://diablo3.blizzard.com&sz=128"
  ],

  // MOBA
  [
    "lol",
    "https://www.google.com/s2/favicons?domain_url=https://www.leagueoflegends.com&sz=128"
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
