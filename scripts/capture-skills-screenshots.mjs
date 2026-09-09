/**
 * Captures the Skills documentation screenshots from a running Versori app.
 *
 * These images illustrate latest/ai-tooling/{skills,marketplace,manage-skills}.mdx.
 * The Skills UI has already changed shape twice while these pages were being
 * written, so this exists to make a re-shoot a re-run rather than seven manual
 * captures. Keep it working.
 *
 * It drives a Chrome you have already logged into, over the DevTools Protocol,
 * so no credentials are handled here and no session is written to disk.
 *
 * Setup (once per session):
 *
 *   1. Start a dedicated Chrome with remote debugging on a throwaway profile.
 *      A separate profile keeps your normal browsing out of scope and avoids
 *      having to quit your main Chrome, which would otherwise be required for
 *      --remote-debugging-port to take effect:
 *
 *        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *          --remote-debugging-port=9222 \
 *          --user-data-dir=/tmp/versori-shots-profile \
 *          https://platform-staging.versori.com
 *
 *   2. Log in in that window, and open the Skills page once to confirm access.
 *      The route requires a Versori-domain account.
 *
 *   3. Run:
 *
 *        cd /tmp/versori-shots && npm install playwright-core
 *        node <path-to-this-file> --base=https://platform-staging.versori.com
 *
 * Flags:
 *   --base=<url>    App origin. Default https://platform-staging.versori.com
 *   --cdp=<url>     DevTools endpoint. Default http://localhost:9222
 *   --out=<dir>     Output directory. Default <repo>/images/ai-tooling
 *   --only=<a,b>    Capture only these shot ids.
 *   --width=<px>    Viewport width. Default 1440.
 */

import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const BASE = arg('base', 'https://platform-staging.versori.com').replace(/\/$/, '');
const CDP = arg('cdp', 'http://localhost:9222');
const OUT = resolve(arg('out', resolve(HERE, '..', 'images', 'ai-tooling')));
const WIDTH = Number(arg('width', '1440'));
const ONLY = arg('only', '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * One entry per TODO screenshot comment in the .mdx pages. `id` matches the
 * target filename, so a reader can trace an image back to the shot that made it.
 *
 * `prepare` leaves the page in the state to be captured and returns the element
 * to clip to, or null for the whole viewport. Clipping to an element keeps the
 * images tight and consistent; a full-page shot of a mostly-empty grid reads
 * badly in docs.
 */
const SHOTS = [
  {
    id: 'skills-page',
    page: 'manage-skills.mdx',
    note: 'The Skills page: count badge, header buttons, toolbar, and the card grid.',
    async prepare(page) {
      await gotoSkills(page);
      return page.locator('h1:has-text("Skills")').locator('xpath=ancestor::*[3]');
    },
  },
  {
    id: 'upload-skill-dialog',
    page: 'manage-skills.mdx',
    note: 'The Upload skill dialog, showing the drop zone and the detail fields.',
    async prepare(page) {
      await gotoSkills(page);
      await page.getByRole('button', { name: 'Upload skill' }).first().click();
      await page.getByText('Upload skill', { exact: true }).waitFor();
      return page.locator('[role="dialog"]').first();
    },
  },
  {
    id: 'marketplace-browse',
    page: 'marketplace.mdx',
    note: 'The Browse marketplace dialog with search and category filters.',
    async prepare(page) {
      await gotoSkills(page);
      await page.getByRole('button', { name: 'Browse marketplace' }).first().click();
      await page.getByPlaceholder('Search marketplace').waitFor();
      await settle(page);
      return page.locator('[role="dialog"]').first();
    },
  },
  {
    id: 'marketplace-skill-add',
    page: 'marketplace.mdx',
    note: 'A catalogue skill open for review, with the Add button.',
    async prepare(page) {
      await gotoSkills(page);
      await page.getByRole('button', { name: 'Browse marketplace' }).first().click();
      await page.getByPlaceholder('Search marketplace').waitFor();
      await settle(page);
      // Open the first catalogue card. Cards are buttons wrapping a heading.
      await page.locator('[role="dialog"] h3, [role="dialog"] h4').first().click();
      await page.getByRole('button', { name: /^Add(ed)?$/ }).first().waitFor();
      return page.locator('[role="dialog"]').first();
    },
  },
  {
    id: 'skill-detail',
    page: 'skills.mdx',
    note: 'A skill open showing SKILL.md beside its resource files.',
    async prepare(page) {
      await gotoSkills(page);
      await page.locator('h3, h4').first().click();
      await page.getByText('SKILL.md').first().waitFor();
      await settle(page);
      return page.locator('[role="dialog"]').first();
    },
  },
  {
    id: 'skill-remove-confirm',
    page: 'manage-skills.mdx',
    note: 'The removal confirmation, showing the Delete / Uninstall distinction.',
    async prepare(page) {
      await gotoSkills(page);
      // Prefer Uninstall: the marketplace-vs-owned distinction is the point.
      const uninstall = page.getByRole('button', { name: 'Uninstall' }).first();
      const target = (await uninstall.count()) ? uninstall : page.getByRole('button', { name: 'Delete' }).first();
      await target.click();
      await page.getByRole('button', { name: /^(Uninstall|Delete)$/ }).last().waitFor();
      return page.locator('[role="alertdialog"], [role="dialog"]').first();
    },
  },
  // Deliberately not automated: install-skill-card. The card only appears when
  // the agent genuinely proposes a skill mid-conversation, which needs a real
  // chat rather than a scripted click. Capture that one by hand.
];

async function gotoSkills(page) {
  // Internal route is still /resources; every user-visible label says Skills.
  await page.goto(`${BASE}/resources`, { waitUntil: 'domcontentloaded' });
  const heading = page.locator('h1:has-text("Skills")');
  await heading.waitFor({ timeout: 20000 }).catch(() => {
    throw new Error(
      `Skills page did not load at ${BASE}/resources.\n` +
        'Check that the Chrome at --cdp is logged in with a Versori-domain account: ' +
        'the route redirects to / otherwise.'
    );
  });
  await settle(page);
}

/** Let images, fonts and query fetches finish so captures are deterministic. */
async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(400);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  let browser;
  try {
    browser = await chromium.connectOverCDP(CDP);
  } catch (cause) {
    throw new Error(
      `Could not attach to Chrome at ${CDP}.\n` +
        'Start it with --remote-debugging-port=9222 (see the header of this file).',
      { cause }
    );
  }

  const context = browser.contexts()[0];
  if (!context) throw new Error('Chrome exposed no browser context.');

  const page = await context.newPage();
  await page.setViewportSize({ width: WIDTH, height: 900 });

  const wanted = ONLY.length ? SHOTS.filter((s) => ONLY.includes(s.id)) : SHOTS;
  const done = [];
  const failed = [];

  for (const shot of wanted) {
    const file = resolve(OUT, `${shot.id}.png`);
    try {
      const clip = await shot.prepare(page);
      await (clip ?? page).screenshot({ path: file, scale: 'css' });
      done.push(shot);
      console.log(`  captured  ${shot.id}.png  (${shot.page})`);
    } catch (error) {
      failed.push({ shot, error });
      console.error(`  FAILED    ${shot.id}: ${error.message.split('\n')[0]}`);
    }
  }

  await page.close();
  // Leave the browser open: it is the user's, and they may still be logged in.
  await browser.close().catch(() => {});

  console.log(`\n${done.length}/${wanted.length} captured into ${OUT}`);
  if (failed.length) {
    console.log('\nRe-run individual shots with --only=<id> after checking the page state.');
    process.exitCode = 1;
  }
  console.log('\nStill to capture by hand: install-skill-card.png (needs the agent to propose a skill in chat).');
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  if (error.cause) console.error(error.cause.message);
  process.exit(1);
});
