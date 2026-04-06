# 🌍 Roblox Remove Regional Pricing

A simple browser console script that automatically disables **regional pricing** on all gamepasses across all of your Roblox games.

---

## ✨ Features

- ✅ Automatically finds all games on your account
- ✅ Checks each gamepass before updating only updates ones that actually have regional pricing enabled
- ✅ Works no matter how many games or passes you have
- ✅ No installs, no extensions, no API keys just paste it and run it
- ✅ Clean console output with a summary at the end

---

## 🚀 Usage

1. Go to **[create.roblox.com](https://create.roblox.com)** and make sure you're logged in
2. Open **DevTools** (`F12`) and click the **Console** tab
3. Paste the contents of [`Disable.js`](https://github.com/viswagfx/DisableRegionalPricing/blob/main/Disable.js) and press **Enter**

That's it. The script will handle everything automatically.

---

## ⚠️ Important Notes

- **Must be run on `create.roblox.com`** or `roblox.com`** - the script uses your browser session cookies for authentication, which are only available on that domain
- This only affects games **owned by your account** — group games are not included
- Running the script multiple times is safe — it skips passes that are already off

---

## 🔧 How It Works

| Step | API Used |
|------|----------|
| Get your user ID | `users.roblox.com/v1/users/authenticated` |
| Fetch all your games | `games.roblox.com/v2/users/{userId}/games` |
| Fetch gamepasses per game | `apis.roblox.com/game-passes/v1/universes/{universeId}/game-passes` |
| Check if regional pricing is on | `apis.roblox.com/game-passes/v1/universes/{universeId}/game-passes/{passId}/creator` |
| Disable regional pricing | `PATCH apis.roblox.com/game-passes/v1/universes/{universeId}/game-passes/{passId}` |

---

## 📄 License

MIT — do whatever you want with it.
