/**
 * Seeds an organisation with a skill set that exercises every badge the docs
 * describe, so the screenshots in latest/ai-tooling/ can show them.
 *
 * Target state on the Skills page:
 *
 *   2 skills you own      -> Optional, one switched to Mandatory
 *   2 marketplace installs -> Installed
 *   1 fork                 -> Forked
 *
 * Runs against a Chrome you have already logged into, over the DevTools
 * Protocol, and issues the API calls from inside that page so the session
 * cookies travel with them. No credentials are read or stored here.
 *
 * This writes to whichever organisation you pass. Point it at a demo org, not a
 * customer's: the skills it creates are visible to everyone in that org, and the
 * screenshots end up on a public docs site.
 *
 * Usage (see capture-skills-screenshots.mjs for the Chrome setup):
 *
 *   node scripts/seed-skills-for-screenshots.mjs --org=<organisation-id>
 *   node scripts/seed-skills-for-screenshots.mjs --org=<id> --dry-run
 *
 * Flags:
 *   --org=<id>      Required. Organisation to seed.
 *   --base=<url>    App origin. Default https://platform-staging.versori.com
 *   --cdp=<url>     DevTools endpoint. Default http://localhost:9222
 *   --dry-run       Print what would be created, change nothing.
 */

import { chromium } from 'playwright-core';

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => process.argv.includes(`--${name}`);

const ORG = arg('org', '');
const BASE = arg('base', 'https://platform-staging.versori.com').replace(/\/$/, '');
const CDP = arg('cdp', 'http://localhost:9222');
const DRY = has('dry-run');
const API = `${BASE}/api/sparkboard/v1alpha1`;

if (!ORG) {
  console.error('--org=<organisation-id> is required.');
  process.exit(1);
}

/**
 * Plausible content, not lorem ipsum: these names and summaries appear in a
 * public screenshot, so they should read like something a team would really
 * write. Descriptions are specific because that is what the docs tell authors
 * to do, and the image should not contradict the prose.
 */
const OWNED = [
  {
    name: 'integration-naming-conventions',
    summary: "This team's naming rules for workflows, connections and environment variables.",
    category: 'Standards',
    mandatory: true,
    markdown: `---
name: integration-naming-conventions
description: Naming rules for workflows, connections and variables. Apply when creating or renaming any of them.
---

# Naming conventions

- Workflows are \`<system>-<object>-<direction>\`, for example \`netsuite-invoice-inbound\`.
- Connections carry the environment: \`netsuite-sandbox\`, \`netsuite-production\`.
- Environment variables are SCREAMING_SNAKE_CASE and prefixed by system.
- Never put a customer name in a workflow name; use the project for that.
`,
  },
  {
    name: 'error-handling-standards',
    summary: 'How to retry, when to fail loudly, and what to put in an issue.',
    category: 'Standards',
    mandatory: false,
    markdown: `---
name: error-handling-standards
description: Retry and error-reporting rules. Apply when writing a task that calls an external API.
---

# Error handling

- Retry idempotent reads three times with exponential backoff.
- Never retry a write without an idempotency key.
- Raise an issue with the payload id, not the whole payload.
- A 4xx from a partner API is a data problem: fail the run and report it.
`,
  },
];

async function main() {
  let browser;
  try {
    browser = await chromium.connectOverCDP(CDP);
  } catch (cause) {
    throw new Error(
      `Could not attach to Chrome at ${CDP}. Start it with --remote-debugging-port=9222.`,
      { cause }
    );
  }

  const context = browser.contexts()[0];
  if (!context) throw new Error('Chrome exposed no browser context.');
  const page = await context.newPage();

  // Load the app origin first so the API calls below are same-origin and carry
  // the session cookies.
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });

  const call = async (method, path, body) => {
    const result = await page.evaluate(
      async ({ url, method, body }) => {
        const res = await fetch(url, {
          method,
          credentials: 'include',
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const text = await res.text();
        return { ok: res.ok, status: res.status, text };
      },
      { url: `${API}${path}`, method, body }
    );
    if (!result.ok) {
      throw new Error(`${method} ${path} -> ${result.status} ${result.text.slice(0, 300)}`);
    }
    return result.text ? JSON.parse(result.text) : null;
  };

  // Every row from the org-scoped listing carries `orgId` (null for a
  // marketplace skill) and `installed`, so this one call is both discriminators.
  const mine = (await call('GET', `/marketplace/o/${encodeURIComponent(ORG)}/skills`)).skills ?? [];
  const have = new Set(mine.map((s) => s.name));
  const installedIds = new Set(mine.filter((s) => s.installed).map((s) => s.id));
  console.log(`Organisation ${ORG} already has ${have.size} skill(s).`);

  // The unscoped catalogue never reports install state (there is no org to
  // enrich against), so cross-reference against the org listing above.
  const catalogue = (await call('GET', '/marketplace/skills')).skills ?? [];
  console.log(`Catalogue offers ${catalogue.length} skill(s).`);

  const plan = [];
  for (const skill of OWNED) {
    if (have.has(skill.name)) continue;
    plan.push({ what: `create own skill "${skill.name}"${skill.mandatory ? ' (mandatory)' : ''}`, skill });
  }

  const notInstalled = catalogue.filter((s) => !installedIds.has(s.id) && !have.has(s.name));
  const toInstall = notInstalled.slice(0, 2);
  const toFork = notInstalled[2] ?? notInstalled[0];
  for (const s of toInstall) plan.push({ what: `install "${s.name}" from the catalogue`, install: s });
  if (toFork) plan.push({ what: `fork "${toFork.name}"`, fork: toFork });

  if (!plan.length) {
    console.log('\nNothing to do: the organisation already has the shape the screenshots need.');
  }
  for (const step of plan) console.log(`  ${DRY ? 'would' : 'will'} ${step.what}`);

  if (DRY) {
    console.log('\nDry run, nothing changed.');
    await page.close();
    await browser.close().catch(() => {});
    return;
  }

  for (const step of plan) {
    if (step.skill) {
      const created = await call('POST', `/marketplace/o/${encodeURIComponent(ORG)}/skills`, {
        name: step.skill.name,
        summary: step.skill.summary,
        markdown: step.skill.markdown,
        category: step.skill.category,
        mandatory: step.skill.mandatory,
      });
      console.log(`  created ${created.name}`);
    } else if (step.install) {
      await call('POST', `/marketplace/o/${encodeURIComponent(ORG)}/skills/${encodeURIComponent(step.install.id)}/install`);
      console.log(`  installed ${step.install.name}`);
    } else if (step.fork) {
      // A fork is a create that points back at the catalogue skill.
      const forked = await call('POST', `/marketplace/o/${encodeURIComponent(ORG)}/skills`, {
        name: `${step.fork.name} (fork)`,
        summary: step.fork.summary,
        category: step.fork.category,
        forkFromSkillId: step.fork.id,
        productImageUrl: step.fork.productImageUrl,
      });
      console.log(`  forked ${forked.name}`);
    }
  }

  const after = (await call('GET', `/marketplace/o/${encodeURIComponent(ORG)}/skills`)).skills ?? [];
  console.log(`\nOrganisation now has ${after.length} skill(s). Clear any search or filter before capturing:`);
  console.log('the count badge shows the full total while the grid shows only matches.');

  await page.close();
  await browser.close().catch(() => {});
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  if (error.cause) console.error(error.cause.message);
  process.exit(1);
});
