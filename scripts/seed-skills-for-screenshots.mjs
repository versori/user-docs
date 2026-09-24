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
 * Talks to the switchboard API directly. Locally that needs no auth, so no
 * browser and no credentials are involved.
 *
 * This writes to whichever organisation you pass. Check where your local
 * switchboard's database actually lives before running it: if CockroachDB is
 * reached over an SSH tunnel rather than a local container, "local" seeding
 * writes to shared infrastructure that other people can see.
 *
 * Usage:
 *
 *   node scripts/seed-skills-for-screenshots.mjs --org=<organisation-id> --dry-run
 *   node scripts/seed-skills-for-screenshots.mjs --org=<organisation-id>
 *
 * Flags:
 *   --org=<id>      Required. Organisation to seed.
 *   --api=<url>     Switchboard base. Default http://localhost:8000.
 *                   Deployed environments mount it under
 *                   <origin>/api/sparkboard/v1alpha1 instead.
 *   --dry-run       Print what would be created, change nothing.
 */

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => process.argv.includes(`--${name}`);

const ORG = arg('org', '');
const API = arg('api', 'http://localhost:8000').replace(/\/$/, '');
const DRY = has('dry-run');

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
  const call = async (method, path, body) => {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
    }
    return text ? JSON.parse(text) : null;
  };

  // Every row from the org-scoped listing carries `orgId` (null for a
  // marketplace skill) and `installed`, so this one call is both discriminators.
  const mine = (await call('GET', `/marketplace/o/${encodeURIComponent(ORG)}/skills`)).skills ?? [];
  const have = new Set(mine.map((s) => s.name));
  const installedIds = new Set(mine.filter((s) => s.installed).map((s) => s.id));
  console.log(`Organisation ${ORG} already has ${mine.length} skill(s).`);

  // The unscoped catalogue never reports install state (there is no org to
  // enrich against), so cross-reference against the org listing above.
  const catalogue = (await call('GET', '/marketplace/skills')).skills ?? [];
  console.log(`Catalogue offers ${catalogue.length} skill(s).`);

  const plan = [];
  for (const skill of OWNED) {
    if (have.has(skill.name)) continue;
    plan.push({ what: `create own skill "${skill.name}"${skill.mandatory ? ' (mandatory)' : ''}`, skill });
  }

  // One install and one fork are enough to show the Installed and Forked
  // badges. A small catalogue (local ones often hold a single skill) can supply
  // both from the same entry: the fork lands as a separate org-owned row.
  const toInstall = catalogue.find((s) => !installedIds.has(s.id));
  if (toInstall) plan.push({ what: `install "${toInstall.name}" from the catalogue`, install: toInstall });

  // Forking does not require the skill to be uninstalled, so pick from the
  // whole catalogue and only skip an entry whose fork already exists.
  const toFork = catalogue.find((s) => !have.has(`${s.name} (fork)`));
  if (toFork) plan.push({ what: `fork "${toFork.name}"`, fork: toFork });

  if (!plan.length) {
    console.log('\nNothing to do: the organisation already has the shape the screenshots need.');
  }
  for (const step of plan) console.log(`  ${DRY ? 'would' : 'will'} ${step.what}`);

  if (DRY) {
    console.log('\nDry run, nothing changed.');
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
  console.log(`\nOrganisation now has ${after.length} skill(s):`);
  for (const s of after) {
    const kind = s.orgId ? (s.forkedFromSkillId ? 'Forked' : 'Own') : 'Installed';
    // List rows carry the install flag as `installMandatory`; the bare
    // `mandatory` field is absent here, and reading it reports everything as
    // Optional. The frontend does the same mapping in marketplaceApi.ts.
    const mandatory = s.installMandatory === true;
    console.log(`  ${mandatory ? 'Mandatory' : 'Optional '}  ${kind.padEnd(9)}  ${s.name}`);
  }
  console.log('\nClear any search or filter before capturing: the count badge shows the');
  console.log('full total while the grid shows only matches.');
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  if (error.cause) console.error(error.cause.message);
  process.exit(1);
});
