/**
 * Playwright QA for Africa map drill-down.
 * Run: bun scripts/map-playwright-qa.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const BASE = "http://127.0.0.1:5173";
const OUT = join(import.meta.dirname, "..", "qa-screenshots");
const WAIT = { timeout: 25000 };

async function scrollMapIntoView(page) {
  await page.evaluate(() => {
    const el = document.querySelector(".africa-map-host");
    if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
    window.scrollBy(0, 1);
  });
  await page.waitForTimeout(400);
}

async function snap(page, name) {
  const path = join(OUT, `${name}.png`);
  try {
    await scrollMapIntoView(page);
    await page.evaluate(() => {
      window.__paAfricaMap?.map?.stop?.();
      document.getAnimations().forEach((a) => {
        try {
          a.finish();
        } catch {
          a.cancel();
        }
      });
    });
    await page.waitForTimeout(300);
    const clip = await page.evaluate(() => {
      const el = document.querySelector(".africa-map-host");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    const opts = { path, animations: "disabled", timeout: 5000, caret: "hide" };
    if (clip?.width > 0 && clip.y >= 0) {
      await page.screenshot({ ...opts, clip });
    } else {
      await page.screenshot(opts);
    }
    console.log(`  screenshot: ${path}`);
  } catch (err) {
    console.log(`  screenshot skipped (${name}): ${err.message?.split("\n")[0]}`);
  }
  return path;
}

async function waitMapReady(page) {
  await page.waitForSelector(".africa-map-host", WAIT);
  await scrollMapIntoView(page);
  await page.waitForSelector(".africa-map-host .maplibregl-canvas", WAIT);
  await page.waitForFunction(() => window.__paAfricaMap?.map?.loaded?.(), null, WAIT);
  await page.waitForTimeout(1200);
}

async function report(page, label) {
  const data = await page.evaluate(() => {
    const map = window.__paAfricaMap;
    if (!map) return { error: "no __paAfricaMap" };
    const m = map.map;
    const badge = document.querySelector("[data-level-badge]");
    const layers = m
      ? ["pa-catchments-fill", "pa-catchments-line"].map((id) => ({
          id,
          exists: !!m.getLayer(id),
        }))
      : [];
    return {
      selectedLevel: map.selected?.level,
      selectedSlug: map.selected?.slug,
      catchmentTagCount: document.querySelectorAll(".tk-catchment-tag").length,
      communityTagCount: document.querySelectorAll(".tk-community-tag").length,
      levelBadge: badge?.textContent?.trim(),
      panelTitle: document.querySelector(".tk-panel__title")?.textContent?.trim(),
      posterCity: document.querySelector(".tk-poster-city")?.textContent?.trim(),
      posterCommunityMode: document.querySelector(".tk-poster-overlay.is-community") != null,
      zoom: m?.getZoom(),
      center: m?.getCenter()?.toArray(),
      layers,
      catchmentFeatures: map._catchmentFeatures?.length ?? 0,
    };
  });
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function tagMetrics(page, selector, bodyClass) {
  return page.evaluate(
    ({ selector, bodyClass }) => {
      return [...document.querySelectorAll(selector)].map((el) => {
        const body = el.querySelector(bodyClass);
        const bodyRect = body?.getBoundingClientRect();
        return {
          name: el.querySelector(`${bodyClass} [class*="__name"]`)?.textContent?.trim(),
          opacity: getComputedStyle(el).opacity,
          bodyWidth: bodyRect?.width ?? 0,
          bodyHeight: bodyRect?.height ?? 0,
        };
      });
    },
    { selector, bodyClass }
  );
}

async function clickKenyaOnMap(page) {
  const clickPoint = await page.evaluate(() => {
    const m = window.__paAfricaMap;
    const map = m?.map;
    if (!map) return { ok: false, reason: "no map" };

    const kenya = m.drill?.byCountry?.kenya;
    const centerLng =
      kenya?.catchments?.reduce((s, c) => s + (c.lng ?? 0), 0) / (kenya?.catchments?.length || 1);
    const centerLat =
      kenya?.catchments?.reduce((s, c) => s + (c.lat ?? 0), 0) / (kenya?.catchments?.length || 1);

    const pt = map.project([centerLng, centerLat]);
    const feats = map.queryRenderedFeatures(pt, { layers: ["pa-countries-fill"] });
    if (!feats?.length) {
      return { ok: false, reason: "no feature at kenya center", pt, centerLng, centerLat };
    }
    return {
      ok: true,
      slug: feats[0].properties?.slug,
      x: pt.x,
      y: pt.y,
      centerLng,
      centerLat,
    };
  });

  if (!clickPoint.ok) return clickPoint;

  const canvas = page.locator(".africa-map-host .maplibregl-canvas");
  const box = await canvas.boundingBox();
  if (!box) return { ok: false, reason: "no canvas box" };

  const mapDims = await page.evaluate(() => {
    const m = window.__paAfricaMap;
    const el = m?.map?.getContainer();
    return { width: el?.clientWidth ?? 0, overzoom: m?.overzoomScale ?? 1 };
  });
  const scaleToScreen = box.width / (mapDims.width || box.width);

  const x = box.x + clickPoint.x * scaleToScreen;
  const y = box.y + clickPoint.y * scaleToScreen;
  await page.mouse.click(x, y);
  await page.waitForTimeout(3500);

  const after = await page.evaluate(() => ({
    level: window.__paAfricaMap?.selected?.level,
    slug: window.__paAfricaMap?.selected?.slug,
    tags: document.querySelectorAll(".tk-catchment-tag").length,
  }));

  return { ok: after.level === "country", slug: after.slug, tags: after.tags, click: clickPoint };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  const issues = [];
  let country = null;
  let afterClick = null;

  try {
    console.log("Navigate to home africa map...");
    await page.goto(`${BASE}/#/home-africa-map`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitMapReady(page);
    await snap(page, "01-global");
    const global = await report(page, "GLOBAL");

    if (!global.selectedLevel) issues.push("GLOBAL: map instance missing selected state");
    if (global.levelBadge !== "Global view") issues.push(`GLOBAL: badge is "${global.levelBadge}" not Global view`);

    console.log("\nSelecting Kenya programmatically...");
    await page.evaluate(() => {
      const map = window.__paAfricaMap;
      const kenya = map.drill?.byCountry?.kenya;
      if (kenya) map.selectCountry("kenya", kenya);
    });
    await page.waitForTimeout(3500);
    await snap(page, "02-kenya-country");
    country = await report(page, "COUNTRY");

    if (country.selectedLevel !== "country") issues.push(`COUNTRY: level is ${country.selectedLevel}`);
    if (country.levelBadge !== "Country view") issues.push(`COUNTRY: badge is "${country.levelBadge}"`);
    if (country.catchmentTagCount < 3)
      issues.push(`COUNTRY: only ${country.catchmentTagCount} catchment tags visible (expected 5 for Kenya)`);
    if (!country.layers?.find((l) => l.id === "pa-catchments-fill")?.exists)
      issues.push("COUNTRY: pa-catchments-fill layer missing");
    if (country.catchmentFeatures < 3)
      issues.push(`COUNTRY: only ${country.catchmentFeatures} catchment geo features`);

    const catchmentTagVis = await tagMetrics(page, ".tk-catchment-tag", ".tk-catchment-tag__body");
    console.log("Catchment tag visibility:", JSON.stringify(catchmentTagVis, null, 2));
    const tinyCatchmentTags = catchmentTagVis.filter(
      (t) => parseFloat(t.opacity) < 0.5 || t.bodyWidth < 40 || t.bodyHeight < 14
    );
    if (tinyCatchmentTags.length)
      issues.push(`COUNTRY: ${tinyCatchmentTags.length} catchment tags too small or faint`);

    const firstTag = page.locator(".tk-catchment-tag").first();
    if (await firstTag.count()) {
      const tagName = await firstTag.locator(".tk-catchment-tag__name").textContent();
      console.log(`\nClicking catchment tag: ${tagName}`);
      await page.evaluate((id) => {
        document.querySelector(`.tk-catchment-tag[data-catchment-id="${id}"]`)?.click();
      }, await firstTag.getAttribute("data-catchment-id"));
      await page.waitForTimeout(2500);
      await snap(page, "03-catchment");
      const catchment = await report(page, "CATCHMENT");

      if (catchment.selectedLevel !== "catchment") issues.push(`CATCHMENT: level is ${catchment.selectedLevel}`);
      if (catchment.levelBadge !== "Catchment view")
        issues.push(`CATCHMENT: badge is "${catchment.levelBadge}"`);
      if (catchment.communityTagCount < 1)
        issues.push(`CATCHMENT: no community tags (got ${catchment.communityTagCount})`);

      const communityTagVis = await tagMetrics(page, ".tk-community-tag", ".tk-community-tag__body");
      console.log("Community tag visibility:", JSON.stringify(communityTagVis, null, 2));
      const tinyCommunityTags = communityTagVis.filter((t) => t.bodyWidth < 30 || t.bodyHeight < 12);
      if (tinyCommunityTags.length)
        issues.push(`CATCHMENT: ${tinyCommunityTags.length} community tags too small`);

      const commTag = page.locator(".tk-community-tag").first();
      if (await commTag.count()) {
        const commName = await commTag.locator(".tk-community-tag__name").textContent();
        console.log(`\nClicking community tag: ${commName}`);
        await page.evaluate((id) => {
          document.querySelector(`.tk-community-tag[data-community-id="${id}"]`)?.click();
        }, await commTag.getAttribute("data-community-id"));
        await page.waitForTimeout(2000);
        await snap(page, "04-community");
        const community = await report(page, "COMMUNITY");
        if (community.selectedLevel !== "community") issues.push(`COMMUNITY: level is ${community.selectedLevel}`);
        if (community.levelBadge !== "Community view")
          issues.push(`COMMUNITY: badge is "${community.levelBadge}"`);
        if (!community.posterCommunityMode)
          issues.push("COMMUNITY: poster overlay not in community compact mode");
      } else {
        issues.push("CATCHMENT: no community tag to click");
      }
    } else {
      issues.push("COUNTRY: no catchment tag found to click");
    }

    console.log("\nReset and test map click on Kenya polygon...");
    await page.evaluate(() => window.__paAfricaMap.clearSelection());
    await page.waitForFunction(
      () => window.__paAfricaMap?.selected?.level === "africa",
      null,
      WAIT
    );
    await page.waitForTimeout(2000);
    await scrollMapIntoView(page);

    const mapClick = await clickKenyaOnMap(page);
    console.log("Map click result:", mapClick);
    await snap(page, "05-kenya-click");
    afterClick = await report(page, "AFTER MAP CLICK");

    if (afterClick.selectedLevel !== "country")
      issues.push(`MAP CLICK: did not select country (${afterClick.selectedLevel})`);
    if (afterClick.catchmentTagCount < 3)
      issues.push(`MAP CLICK: catchment tags ${afterClick.catchmentTagCount}`);

    await writeFile(
      join(OUT, "issues.json"),
      JSON.stringify({ issues, catchmentTagVis, global, country, afterClick, mapClick }, null, 2)
    );
  } catch (err) {
    console.error("QA failed:", err);
    issues.push(`FATAL: ${err.message}`);
    await snap(page, "error");
  }

  await browser.close();

  console.log("\n========================================");
  console.log("ISSUES FOUND:", issues.length);
  issues.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));
  console.log("========================================\n");

  process.exit(issues.length ? 1 : 0);
}

main();
