/**
 * remove-regional-pricing.js
 *
 * Disables regional pricing on all Roblox gamepasses across all of your games.
 *
 * USAGE:
 *   1. Go to https://create.roblox.com and log in
 *   2. Open DevTools (F12) → Console tab
 *   3. Paste this entire script and press Enter
 *
 * NOTE: Only affects games owned by the currently logged-in account.
 */

(async () => {
  const DELAY_MS = 400; // delay between requests to avoid rate limiting
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── Step 1: Get CSRF token ───────────────────────────────────────────────
  const csrfRes = await fetch("https://auth.roblox.com/v2/logout", {
    method: "POST",
    credentials: "include",
  });
  const csrf = csrfRes.headers.get("x-csrf-token");
  if (!csrf) {
    console.error("❌ Could not get CSRF token. Make sure you are logged in on create.roblox.com.");
    return;
  }
  console.log("✅ Authenticated");

  // ── Step 2: Get current user ID ──────────────────────────────────────────
  const me = await fetch("https://users.roblox.com/v1/users/authenticated", {
    credentials: "include",
  }).then((r) => r.json());
  const userId = me.id;
  console.log(`✅ Logged in as: ${me.name} (${userId})`);

  // ── Step 3: Fetch all games owned by the user ────────────────────────────
  let games = [], cursor = "";
  do {
    const res = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?sortOrder=Asc&limit=50${cursor ? `&cursor=${cursor}` : ""}`,
      { credentials: "include" }
    );
    const data = await res.json();
    games.push(...(data.data ?? []));
    cursor = data.nextPageCursor ?? "";
  } while (cursor);
  console.log(`\n🎮 Found ${games.length} game(s)\n`);

  // ── Step 4: Process each game ────────────────────────────────────────────
  let totalUpdated = 0, totalFailed = 0, totalSkipped = 0;

  for (const game of games) {
    const { id: universeId, name: gameName } = game;
    console.log(`📦 ${gameName}`);

    // Fetch all gamepasses for this universe
    let gamePasses = [], gpCursor = "";
    try {
      do {
        const res = await fetch(
          `https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes?passView=Full&pageSize=100${gpCursor ? `&pageToken=${gpCursor}` : ""}`,
          { credentials: "include" }
        );
        if (!res.ok) break;
        const data = await res.json();
        gamePasses.push(...(data.gamePasses ?? []));
        gpCursor = data.nextPageToken ?? "";
      } while (gpCursor);
    } catch (err) {
      console.warn(`  ⚠️ Error fetching passes: ${err.message}`);
      continue;
    }

    if (!gamePasses.length) {
      console.log("  ⏭️  No gamepasses\n");
      totalSkipped++;
      continue;
    }

    // Disable regional pricing on each gamepass
    for (const pass of gamePasses) {
      const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
      const res = await fetch(
        `https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes/${pass.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
            "X-CSRF-TOKEN": csrf,
          },
          body: [
            `--${boundary}`,
            `Content-Disposition: form-data; name="isRegionalPricingEnabled"`,
            ``,
            `false`,
            `--${boundary}--`,
          ].join("\r\n"),
        }
      );

      if (res.ok) {
        console.log(`  ✅ ${pass.name}`);
        totalUpdated++;
      } else {
        console.warn(`  ❌ ${pass.name} (${res.status})`);
        totalFailed++;
      }

      await sleep(DELAY_MS);
    }
    console.log("");
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("─".repeat(40));
  console.log(`✅ Updated:  ${totalUpdated} gamepass(es)`);
  console.log(`❌ Failed:   ${totalFailed} gamepass(es)`);
  console.log(`⏭️  Skipped:  ${totalSkipped} game(s) with no passes`);
  console.log("─".repeat(40));
})();
