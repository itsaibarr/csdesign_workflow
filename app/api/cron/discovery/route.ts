import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ToolCategory, ToolUsageStatus, PricingModel } from '@prisma/client';
import { chromium } from 'playwright';

// Force dynamic to ensure we always fetch fresh data
export const dynamic = 'force-dynamic';

// Mapping keywords to our ToolCategory enum
function detectCategory(text: string): ToolCategory {
    const lower = text.toLowerCase();
    if (lower.includes('code') || lower.includes('dev') || lower.includes('programming')) return 'IDE';
    if (lower.includes('design') || lower.includes('image') || lower.includes('video') || lower.includes('art')) return 'DESIGN';
    if (lower.includes('write') || lower.includes('text') || lower.includes('blog') || lower.includes('copy')) return 'PRODUCTIVITY'; // Mapping writing to Productivity for now
    if (lower.includes('productivity') || lower.includes('task') || lower.includes('manage')) return 'PRODUCTIVITY';
    if (lower.includes('research') || lower.includes('analysis') || lower.includes('data')) return 'RESEARCH';
    if (lower.includes('automation') || lower.includes('workflow')) return 'AUTOMATION';
    if (lower.includes('security')) return 'SECURITY';
    return 'OTHER';
}

// Pricing detection
function detectPricing(text: string): PricingModel {
    const lower = text.toLowerCase();
    if (lower.includes('open source') || lower.includes('free forever')) return 'FREE';
    if (lower.includes('trial') || lower.includes('try for free')) return 'TRIAL';
    if (lower.includes('freemium')) return 'FREEMIUM';
    if (lower.includes('paid') || lower.includes('pricing')) return 'PAID';
    return 'TRIAL'; // Data-safe default for new tools to encourage verification
}

// Student suitability check (Basic keyword filtering)
function isSuitableForStudents(text: string): boolean {
    const lower = text.toLowerCase();
    const prohibited = ['adult', 'nsfw', 'gambling', 'betting', 'enterprise only', 'b2b sales'];
    const recommended = ['student', 'study', 'learn', 'education', 'helper', 'tutor', 'productivity', 'free'];

    if (prohibited.some(p => lower.includes(p))) return false;
    // If it's effectively neutral, we lean towards "maybe suitable" unless it's strictly business
    return true;
}

// Check for guides/docs in the tool's page (simulated via scraping the tool's PH page or landing)
async function checkForGuides(page: any): Promise<boolean> {
    try {
        // Look for common documentation links
        const hasDocs = await page.getByRole('link', { name: /docs|documentation|guide|tutorial|blog/i }).count();
        return hasDocs > 0;
    } catch {
        return false;
    }
}

export async function GET() {
    let browser = null;
    try {
        console.log('[Discovery] Starting daily AI tool fetch...');

        // Launch Playwright (Use chromium)
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        // 1. Source: Product Hunt - Topic: Artificial Intelligence
        // We target the "New" or "Trending" section
        await page.goto('https://www.producthunt.com/topics/artificial-intelligence', { waitUntil: 'domcontentloaded' });

        // Scrape the first 5 visible tools
        // Default PH selectors (subject to change, so we use robust querying)
        // Looking for items in the feed.
        const productItems = await page.locator('[data-test^="post-item"]').all();
        const scrapedTools: any[] = [];

        // Limit to top 3 to avoid timeouts and blocks
        const limit = 3;
        for (let i = 0; i < Math.min(productItems.length, limit); i++) {
            // Re-query items to avoid stale handles if page navigates (though we use new tabs ideally)
            // Better: Open link in new page
            const item = productItems[i];

            let name = 'Unknown';
            let phUrl = '';

            try {
                name = await item.locator('h3').first().innerText();
                const link = await item.locator('a[href*="/posts/"]').first();
                const relativeUrl = await link.getAttribute('href');
                phUrl = `https://www.producthunt.com${relativeUrl}`;
            } catch (e) {
                console.log('Skipping item, extraction failed');
                continue;
            }

            console.log(`[Discovery] Analyzing ${name}...`);

            // Open PH Detail Page
            const toolPage = await browser.newPage();
            try {
                await toolPage.goto(phUrl, { waitUntil: 'domcontentloaded' });

                // Get Real URL (Visit Website button)
                // PH Selector for "Visit": [data-test="visit-button"] or similar
                // It usually redirects. We can pick it from the href.
                const visitButton = toolPage.getByTestId('visit-button').first().or(toolPage.locator('a:has-text("Visit")').first());

                // If we can't find the link, we can't verify 'guides' on the site.
                let realUrl = '';
                if (await visitButton.count() > 0) {
                    // Often a redirect link. We can capture the navigation or just use the href if obvious.
                    // Let's try to grab href.
                    realUrl = await visitButton.getAttribute('href') || '';
                }

                // If realUrl is empty or likely a redirect, we might verify by navigating
                // For now, let's assume we have a URL to check.

                // Analyze Description on PH for categorization
                const phDesc = await toolPage.locator('[class*="styles_tagline"]').first().innerText().catch(() => '');
                const phAbout = await toolPage.locator('[class*="styles_description"]').first().innerText().catch(() => '');
                const fullText = phDesc + " " + phAbout;

                const category = detectCategory(fullText + " " + name);
                if (!isSuitableForStudents(fullText + " " + name)) {
                    console.log(`Skipping ${name} - Unsuitable`);
                    await toolPage.close();
                    continue;
                }

                // Check Pricing (Preliminary from PH text)
                let pricing = detectPricing(fullText);

                // Check Guides & Deep Verification (Visit the Real Site)
                let hasGuides = false;
                let finalUrl = realUrl;

                if (realUrl) {
                    try {
                        console.log(`Visiting real site: ${realUrl}`);
                        await toolPage.goto(realUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
                        finalUrl = toolPage.url(); // Get resolved URL

                        // Check for guides/docs links
                        hasGuides = await checkForGuides(toolPage);

                        // Refine Pricing check on real site
                        const bodyText = await toolPage.locator('body').innerText();
                        if (detectPricing(bodyText) !== 'TRIAL') {
                            pricing = detectPricing(bodyText);
                        }

                        // User Requirement: "Check Checks... free trial"
                        // detectPricing handles checking for "Free" "Trial".

                    } catch (err) {
                        console.log(`Failed to visit real site ${realUrl}, using PH info only.`);
                    }
                }

                scrapedTools.push({
                    name,
                    shortDescription: phDesc || 'AI Tool',
                    url: finalUrl || phUrl,
                    category,
                    pricing,
                    problemSolved: `Solves: ${phDesc}`,
                    usageStatus: ToolUsageStatus.AI_DISCOVERED,
                    source: 'Product Hunt (AI)',
                    relevance: ['school', 'productivity'], // Inferred
                    hasGuides // We can use this to badge it e.g. "documented"
                });

            } catch (e) {
                console.log(`Error processing ${name}:`, e);
            } finally {
                await toolPage.close();
            }
        }

        // 2. Upsert to Database
        const results = [];
        for (const tool of scrapedTools) {
            const result = await prisma.tool.upsert({
                where: { name: tool.name }, // naive dedupe by name
                update: {}, // Don't overwrite existing
                create: {
                    name: tool.name,
                    shortDescription: tool.shortDescription,
                    url: tool.url,
                    category: tool.category,
                    usageStatus: tool.usageStatus,
                    pricing: tool.pricing,
                    problemSolved: tool.problemSolved,
                    source: tool.source,
                    relevance: tool.relevance,
                    badges: ['New', 'AI', ...(tool.hasGuides ? ['Documented'] : [])],
                    usageContexts: ['General'],
                },
            });
            results.push(result);
        }

        await browser.close();

        return NextResponse.json({
            success: true,
            count: results.length,
            tools: results
        });

    } catch (error) {
        console.error('[Discovery] Error:', error);
        if (browser) await browser.close();
        return NextResponse.json({ success: false, error: 'Failed to discover tools' }, { status: 500 });
    }
}
