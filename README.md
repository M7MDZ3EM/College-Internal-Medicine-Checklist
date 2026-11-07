# 📋 Study Checklist

A free study tracker for medical students. Track **Internal Medicine**, **Pediatrics** and **Boards & Beyond** in one place, plan your days, and keep your streak going. It works on your phone like an app, and your progress follows you to any device.

**Open it:** ( contact me )

## What it does

- **Three lists:** IM lectures and seminars (95 topics), Pediatrics (75 topics, with doctor and year tags) and Boards & Beyond videos (with watch time).
- **Spaced reviews:** tick a topic, pick the day you studied it, and R1 and R2 reviews are scheduled for you. Rate topics as confident, shaky or weak, and weaker ones come back sooner.
- **Planner:** a calendar with Today's plan, due reviews, move and reschedule, and Auto-plan up to your exam date.
- **Daily pace:** see how many topics a day you need to finish before the exam, for any mix of lists.
- **Streak, rest days and heatmap:** build a daily streak, freeze up to 4 days a month, and see everything you finished on a heatmap.
- **Undo and bulk select:** undo mistakes with one tap, and select many topics at once to mark done, plan, pause or rate them.
- **Peds doctor filters:** tap one or more doctors, or a year plan (5th·6th year or 6th year only), to filter the list.
- **Search:** typos and abbreviations like MI or COPD work.
- **Calendar export:** add your plans to Apple, Google or Microsoft Calendar.
- **Plan with AI:** export your topics, let an AI build a plan, and import it back.
- **Offline:** after a first online visit, the app opens without internet. Changes sync when you're back online.
- **Backup:** export and import your data any time.
- **Light and dark mode.**

## Add it to your phone

- **iPhone:** open the link in Safari, tap Share, then **Add to Home Screen**.
- **Android:** open the link in Chrome, tap the menu, then **Install app** or **Add to Home screen**.

## Accounts and privacy

Create an account with your email and a password. Your progress is saved to your own account, and each person only sees their own data. Nothing personal is added to the AI export file.

## For whoever edits it

Everything is plain HTML, CSS and JavaScript. There is nothing to build: upload the files to GitHub Pages and it runs. Sign-in and saving use Firebase (free tier).

| File | What it is |
| --- | --- |
| `index.html` | The page and the list of scripts, with version numbers |
| `styles.css` | All the look |
| `firebase.js` | The Firebase connection |
| `data-im.js`, `data-pd.js`, `data-bb.js` | The topic lists |
| `state.js` | Sign-in, saving and loading, doctor names |
| `core.js` | Backup, shared helpers, daily pace |
| `list-views.js` | The IM, Peds and B&B screens |
| `planner.js` | Calendar, planner, Overview, AI export and import |
| `ui.js` | Theme, menus, search, date picker |
| `tools.js` | Undo, bulk select, calendar export, Overview rings |
| `nav.js` | Bottom bar, swiping, side menu, rest days |
| `settings-tips.js` | Settings screen and tips |
| `init.js` | Start-up, password reset, offline registration |
| `sw.js` | Offline support |

**Rules that keep people's data safe**

1. **Never reorder or delete topics** in the `data-*.js` files. Progress is saved by position, so changing the order would shift everyone's ticks. Add new topics at the end of a list.
2. **Keep the script order in `index.html`.** Data files first, then the code files.
3. **After changing a file, bump its number in `index.html`** (for example `ui.js?v=2`) so phones fetch the new copy.
4. Keep what is saved in Firebase compatible with older data, because everyone uses the same code.

## Offline mode

`sw.js` always asks the internet first, so you always get the newest version. It uses its saved copy only when you are offline. It never touches your data or sign-in. The very first sign-in on a device needs a connection.

---

Made by a student, for students. Not medical advice.
