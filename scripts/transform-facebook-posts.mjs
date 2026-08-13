import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const PAGE_URL = "https://www.facebook.com/Yoshi.Japanese.Tutor";
const MAX_POSTS = 10;

function safeUrl(value, { facebookOnly = false } = {}) {
    if (typeof value !== "string" || value.length > 4096) return null;

    try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();

        if (url.protocol !== "https:") return null;
        if (facebookOnly && hostname !== "facebook.com" && !hostname.endsWith(".facebook.com")) return null;

        return url.href;
    } catch {
        return null;
    }
}

function safePermalink(value, pageId) {
    const permalink = safeUrl(value, { facebookOnly: true });
    if (!permalink) return null;

    const url = new URL(permalink);
    url.pathname = url.pathname
        .split("/")
        .map((segment) => segment === pageId ? "Yoshi.Japanese.Tutor" : segment)
        .join("/");

    for (const [key, queryValue] of [...url.searchParams]) {
        if (queryValue.includes(pageId)) url.searchParams.delete(key);
    }
    if (url.hash.includes(pageId)) url.hash = "";

    return url.href.includes(pageId) ? null : url.href;
}

export function normalizePost(post) {
    if (!post || typeof post !== "object" || typeof post.id !== "string") return null;

    const pageId = post.id.split("_")[0];
    if (!/^\d+$/.test(pageId)) return null;

    const permalink = safePermalink(post.permalink_url, pageId);
    const createdAt = new Date(post.created_time);

    if (!permalink || Number.isNaN(createdAt.getTime())) return null;

    return {
        uid: createHash("sha256").update(post.id).digest("hex").slice(0, 16),
        type: new URL(permalink).pathname.includes("/reel/") ? "reel" : "post",
        message: typeof post.message === "string" && post.message.trim() ? post.message.trim() : null,
        created_at: createdAt.toISOString(),
        permalink_url: permalink,
        image_url: typeof post.full_picture === "string" && post.full_picture.includes(pageId)
            ? null
            : safeUrl(post.full_picture)
    };
}

export function buildFeed(response, existing = null, generatedAt = new Date().toISOString()) {
    if (!Array.isArray(response?.data)) {
        const apiMessage = response?.error?.message;
        throw new Error(apiMessage ? `Meta Graph API error: ${apiMessage}` : "Meta response did not contain a data array");
    }

    const posts = response.data
        .map(normalizePost)
        .filter(Boolean)
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, MAX_POSTS);

    const unchanged = existing
        && existing.schema_version === 1
        && JSON.stringify(existing.posts) === JSON.stringify(posts);

    return {
        schema_version: 1,
        source: {
            platform: "facebook",
            page_url: PAGE_URL
        },
        generated_at: unchanged ? existing.generated_at : generatedAt,
        posts
    };
}

async function main() {
    const [inputPath, outputPath] = globalThis.process.argv.slice(2);

    if (!inputPath || !outputPath) {
        throw new Error("Usage: node scripts/transform-facebook-posts.mjs <input> <output>");
    }

    const response = JSON.parse(await readFile(inputPath, "utf8"));
    let existing = null;

    try {
        existing = JSON.parse(await readFile(outputPath, "utf8"));
    } catch {
        // A missing or malformed existing file is replaced with a valid document.
    }

    const output = buildFeed(response, existing);
    await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

const invokedScript = globalThis.process?.argv?.[1];
if (invokedScript && import.meta.url === pathToFileURL(invokedScript).href) {
    await main();
}
