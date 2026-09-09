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
 *          http://localhost:5173
 *
 *   2. Log in in that window, and open the Skills page once to confirm access.
 *      The route requires an account whose email is @versori.com or
 *      @versori.io: `isAllowedEmailDomain` allows nothing else, and both the
 *      route and the nav entry are gated on it.
 *
 *   3. Install playwright-core somewhere (it needs no browser download of its
 *      own, since it attaches to the Chrome above), then run this file from
 *      anywhere. It searches /tmp/versori-shots and versori-ai/node_modules,
 *      or honours PLAYWRIGHT_CORE=/abs/path/to/playwright-core/index.js:
 *
 *        mkdir -p /tmp/versori-shots && cd /tmp/versori-shots
 *        npm install playwright-core
 *        node ~/dev/user-docs/scripts/capture-skills-screenshots.mjs
 *
 * Flags:
 *   --base=<url>    App origin. Default http://localhost:5173 (Vite dev server)
 *   --cdp=<url>     DevTools endpoint. Default http://localhost:9222
 *   --out=<dir>     Output directory. Default <repo>/images/ai-tooling
 *   --only=<a,b>    Capture only these shot ids.
 *   --width=<px>    Viewport width. Default 1440.
 */

import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * playwright-core is deliberately not a dependency of this repo: user-docs has
 * no package.json, and adding one for a screenshot script is not worth it. So
 * resolve it from wherever it happens to be installed. A bare `import` would
 * only search upwards from this file and miss a sibling install entirely.
 */
async function loadChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_CORE, // explicit override wins
    'playwright-core', // if it ever is a local dependency
    '/tmp/versori-shots/node_modules/playwright-core/index.js',
    resolve(HERE, '..', '..', 'versori-ai', 'node_modules', 'playwright-core', 'index.js'),
  ].filter(Boolean);

  for (const spec of candidates) {
    try {
      const mod = await import(spec);
      return (mod.chromium ?? mod.default?.chromium);
    } catch {
      // Try the next location.
    }
  }
  throw new Error(
    'Could not load playwright-core. Install it somewhere and point at it:\n' +
      '  mkdir -p /tmp/versori-shots && cd /tmp/versori-shots && npm install playwright-core\n' +
      'or set PLAYWRIGHT_CORE=/abs/path/to/playwright-core/index.js'
  );
}

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const BASE = arg('base', 'http://localhost:5173').replace(/\/$/, '');
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
      // Whole viewport, so the left-hand nav is in frame: the prose tells the
      // reader to find Skills there, and a cropped content pane would not show
      // it. Height is fitted to the content to avoid a band of empty page.
      await fitViewportToContent(page);
      return null;
    },
  },
  {
    id: 'upload-skill-dialog',
    page: 'manage-skills.mdx',
    note: 'The Upload skill dialog: the drop zone and the fields read from SKILL.md.',
    async prepare(page) {
      await gotoSkills(page);
      await clickButtonByText(page, 'Upload skill');
      await page.locator(DIALOG).waitFor();

      // An empty dialog shows only placeholders, which does not illustrate
      // "the fields are read from your SKILL.md". Feed it a real bundle. The
      // file inputs are hidden, which setInputFiles handles.
      const bundle = sampleBundleFile();
      if (bundle) {
        await page.locator(`${DIALOG} input[type="file"]:not([multiple])`).first().setInputFiles(bundle);
        // The name field is filled from frontmatter once the bundle parses.
        await page
          .locator(`${DIALOG} #upload-skill-name`)
          .filter({ has: page.locator(':not([value=""])') })
          .first()
          .waitFor({ timeout: 5000 })
          .catch(() => {});
      }
      await settle(page);
      return page.locator(DIALOG);
    },
  },
  {
    id: 'marketplace-browse',
    page: 'marketplace.mdx',
    note: 'The Browse marketplace dialog with search and category filters.',
    async prepare(page) {
      await gotoSkills(page);
      await clickButtonByText(page, 'Browse marketplace');
      await page.getByPlaceholder('Search marketplace').waitFor();
      await settle(page);
      return page.locator(DIALOG);
    },
  },
  {
    id: 'marketplace-skill-add',
    page: 'marketplace.mdx',
    note: 'A catalogue skill open for review, with the Add button.',
    async prepare(page) {
      await gotoSkills(page);
      await clickButtonByText(page, 'Browse marketplace');
      await page.getByPlaceholder('Search marketplace').waitFor();
      await settle(page);
      // Open the first catalogue card. Cards are role=button, so clicking the
      // card itself is the intended way in.
      await page.locator(`${DIALOG} [role="button"]`).first().click();
      await page.locator(`${DIALOG} button`).filter({ hasText: /^Add(ed)?$/ }).first().waitFor();
      await settle(page);
      return page.locator(DIALOG).last();
    },
  },
  {
    id: 'skill-detail',
    page: 'skills.mdx',
    note: 'A skill open showing SKILL.md beside its resource files.',
    async prepare(page) {
      await gotoSkills(page);
      // Prefer a skill with resource files: the point of the shot is the bundle
      // shape, which a single-file skill cannot show.
      await page.locator('[role="button"]').filter({ hasText: 'avalara' }).first().click();
      await page.locator(DIALOG).waitFor();
      await settle(page);
      return page.locator(DIALOG);
    },
  },
  {
    id: 'skill-remove-confirm',
    page: 'manage-skills.mdx',
    note: 'The removal confirmation, showing the Delete / Uninstall distinction.',
    async prepare(page) {
      await gotoSkills(page);
      // Prefer Uninstall: the marketplace-versus-owned distinction is the point.
      await clickButtonByText(page, 'Uninstall').catch(() => clickButtonByText(page, 'Delete'));
      await page.locator(ALERT).waitFor();
      await settle(page);
      return page.locator(ALERT);
    },
  },
  // Deliberately not automated: install-skill-card. The card only appears when
  // the agent genuinely proposes a skill mid-conversation, which needs a real
  // chat rather than a scripted click. Capture that one by hand.
];

/**
 * The app loads a third-party consent banner that renders as [role="dialog"].
 * It is non-deterministic, has no place in documentation, and will otherwise be
 * mistaken for the app's own dialog. Block it at the network layer.
 */
async function blockConsentBanner(page) {
  await page.route(/cookie-script\.com/, (route) => route.abort());
}

/** The app's dialogs, never the consent banner. */
const DIALOG = '.rt-DialogContent';
/** The confirmation prompt, which is a Radix AlertDialog rather than a Dialog. */
const ALERT = '.rt-AlertDialogContent';

/**
 * Click a card action by dispatching on the element itself.
 *
 * A card is `role="button"` and opens the skill when clicked. The action strip
 * stops propagation correctly, but a synthesised pointer click at the button's
 * centre still lands on the card and opens the detail dialog instead. Clicking
 * the node directly is unambiguous.
 */
async function clickButtonByText(page, text) {
  const clicked = await page.evaluate((label) => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === label);
    if (!btn) return false;
    btn.click();
    return true;
  }, text);
  if (!clicked) throw new Error(`No button labelled "${text}" on the page.`);
}

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

/**
 * Size the viewport to the document so a full-viewport shot has no dead space
 * below the content, without resorting to fullPage (which would also capture
 * anything scrolled out of the fixed layout).
 */
async function fitViewportToContent(page, max = 1400) {
  const height = await page.evaluate(() => {
    const d = document.documentElement;
    return Math.ceil(Math.max(d.scrollHeight, document.body.scrollHeight));
  });
  await page.setViewportSize({ width: WIDTH, height: Math.min(Math.max(height, 600), max) });
  await settle(page);
}

/**
 * Files for the upload-dialog shot. Optional: without them the dialog is still
 * captured, just empty. Override with --sample=<dir>.
 */
function sampleBundleFile() {
  // Off by default. Driving the hidden file input with setInputFiles gets the
  // bundle rejected with "A SKILL.md file is required", including for a lone
  // SKILL.md that readSkillBundleFiles should accept via its loneMarkdown
  // branch. The app is fine through the real picker, so this is the harness,
  // not a product bug: most likely the synthesised File lacks metadata the
  // dialog's own file path supplies. A red validation error makes a worse
  // screenshot than an empty form, so the dialog is captured empty, which
  // still shows every field the page describes.
  //
  // Pass --sample=/path/to/SKILL.md to have another go at it.
  const bundle = arg('sample', '');
  if (!bundle) return null;
  if (!existsSync(bundle)) {
    console.log('  note: no sample bundle at', bundle, '- capturing the dialog empty.');
    return null;
  }
  return bundle;
}

/** Let images, fonts and query fetches finish so captures are deterministic. */
async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(400);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const chromium = await loadChromium();

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
  await blockConsentBanner(page);
  await page.setViewportSize({ width: WIDTH, height: 900 });

  const wanted = ONLY.length ? SHOTS.filter((s) => ONLY.includes(s.id)) : SHOTS;
  const done = [];
  const failed = [];

  for (const shot of wanted) {
    const file = resolve(OUT, `${shot.id}.png`);
    try {
      // Each shot starts from the same viewport: skills-page resizes it to fit.
      await page.setViewportSize({ width: WIDTH, height: 900 });
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
