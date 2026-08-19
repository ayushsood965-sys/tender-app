const express = require("express");
const router = express.Router();
const Term = require("../models/Term");
const Annexure = require("../models/Annexure");

// Local rule-based intelligent recommender fallback
function localSmartRecommend({ tenderName, documentType, tenderCategory, estimatedCost, allTerms, allAnnexures }) {
    const nameLower = (tenderName || "").toLowerCase();
    const isGoods = tenderCategory === "goods" || nameLower.includes("supply") || nameLower.includes("purchase") || nameLower.includes("equipment");
    const isTechEquipment = nameLower.includes("xrd") || nameLower.includes("lab") || nameLower.includes("spectrometer") || nameLower.includes("microscope") || nameLower.includes("server") || nameLower.includes("hardware") || nameLower.includes("machine");
    const isPrinting = nameLower.includes("print") || nameLower.includes("slm") || nameLower.includes("book") || nameLower.includes("answer");
    const isSportsOrHostel = nameLower.includes("sport") || nameLower.includes("hostel") || nameLower.includes("furniture") || nameLower.includes("table") || nameLower.includes("gym");
    const isHighValue = (Number(estimatedCost) || 0) >= 500000;

    const recommendedTermIds = new Set();
    const recommendedAnnexureIds = new Set();
    const reasons = [];

    // Always mandatory core clauses
    allTerms.forEach(t => {
        if (t.mandatory) {
            recommendedTermIds.add(t.id);
        }
    });

    // Standard integrity & legal declarations
    allTerms.filter(t => [102, 302, 408, 1303, 1901].includes(t.id)).forEach(t => recommendedTermIds.add(t.id));
    allAnnexures.filter(a => [2, 10, 14, 7].includes(a.id)).forEach(a => recommendedAnnexureIds.add(a.id));
    reasons.push("Included statutory Bid Form, Code of Integrity, Non-Blacklisting affidavit, and Land Border Certificate.");

    if (documentType === "Limited Tender Document") {
        recommendedAnnexureIds.add(1); // Annexure-A Financial Bid
        reasons.push("Added Annexure-A Financial Bid Submission Form & Schedule Table required for Limited Tender.");
    }

    if (isTechEquipment || (isGoods && isHighValue)) {
        // OEM Authorization, Spares Guarantee, Technical Specs Compliance
        allTerms.filter(t => [401, 402, 306, 701, 801].includes(t.id)).forEach(t => recommendedTermIds.add(t.id));
        allAnnexures.filter(a => [3, 5, 11].includes(a.id)).forEach(a => recommendedAnnexureIds.add(a.id));
        reasons.push("Equipment procurement detected: Added Manufacturer Authorization Form (MAF), 10-Year Spares Guarantee, and Technical Specs Compliance Matrix.");
    }

    if (isPrinting) {
        allTerms.filter(t => [1101, 701, 601, 202].includes(t.id)).forEach(t => recommendedTermIds.add(t.id));
        allAnnexures.filter(a => [13, 15].includes(a.id)).forEach(a => recommendedAnnexureIds.add(a.id));
        reasons.push("Printing/Publication detected: Added Eligibility Fact Sheet and MSE EMD Exemption format.");
    }

    if (nameLower.includes("buyback") || nameLower.includes("replacement")) {
        allAnnexures.filter(a => a.id === 12).forEach(a => recommendedAnnexureIds.add(a.id));
        reasons.push("Buyback scope detected: Added Buyback & Disposal Undertaking.");
    }

    if (documentType === "GeM ATC Document") {
        // GeM Profile
        allAnnexures.filter(a => [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(a.id)).forEach(a => recommendedAnnexureIds.add(a.id));
        reasons.push("GeM Portal ATC Profile: Matched standard 11 GeM Additional Terms and Proformas.");
    } else if (documentType === "e-tender Document") {
        allAnnexures.filter(a => [4, 13, 14, 15].includes(a.id)).forEach(a => recommendedAnnexureIds.add(a.id));
    }

    // Ensure any term with linked annexure adds its annexure
    allTerms.forEach(t => {
        if (recommendedTermIds.has(t.id) && t.hasAnnexure && t.annexureId) {
            recommendedAnnexureIds.add(t.annexureId);
        }
    });

    return {
        recommendedTermIds: Array.from(recommendedTermIds),
        recommendedAnnexureIds: Array.from(recommendedAnnexureIds),
        rationale: reasons.join(" "),
        confidence: "High",
        source: "Intelligent Rule Engine"
    };
}

// Helper to reliably extract JSON from conversational LLM responses
function extractJsonFromText(text) {
    if (!text || typeof text !== "string") return null;
    try {
        return JSON.parse(text.trim());
    } catch (e) {}

    // 1. Try markdown code block with JSON object
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {}
    }

    // 2. Search for object containing 'recommendedTermIds' or 'recommendedAnnexureIds'
    const keyMatch = text.search(/"(?:recommendedTermIds|recommendedAnnexureIds|recommended_term_ids)"/);
    if (keyMatch !== -1) {
        const startBrace = text.lastIndexOf('{', keyMatch);
        const lastBrace = text.lastIndexOf('}');
        if (startBrace !== -1 && lastBrace > startBrace) {
            try {
                return JSON.parse(text.substring(startBrace, lastBrace + 1));
            } catch (e) {}
        }
    }

    // 3. Fallback: scan for outermost balanced {...} starting before last }
    const lastBrace = text.lastIndexOf('}');
    if (lastBrace !== -1) {
        let depth = 0;
        let startBrace = -1;
        for (let i = lastBrace; i >= 0; i--) {
            if (text[i] === '}') depth++;
            else if (text[i] === '{') {
                depth--;
                if (depth === 0) {
                    startBrace = i;
                    break;
                }
            }
        }
        if (startBrace !== -1) {
            try {
                return JSON.parse(text.substring(startBrace, lastBrace + 1));
            } catch (e) {}
        }
    }

    return null;
}

// FIFO Sequential Request Queue: guarantees only 1 request queries OpenRouter at any given time
let aiRequestQueue = Promise.resolve();

function enqueueAiTask(taskFn) {
    const runTask = () => taskFn();
    const nextInQueue = aiRequestQueue.then(runTask, runTask);
    aiRequestQueue = nextInQueue.catch(() => {});
    return nextInQueue;
}

// POST /api/ai/recommend
router.post("/recommend", async (req, res) => {
    const { tenderName, documentType, tenderCategory, estimatedCost, departmentName } = req.body;
    let allTerms = [];
    let allAnnexures = [];

    try {
        allTerms = await Term.find().sort({ id: 1 });
        allAnnexures = await Annexure.find().sort({ id: 1 });

        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3.5-lightning:free";

        const termsSummary = (allTerms || []).slice(0, 40).map(t => `ID ${t.id}: ${t.title} (Cat: ${t.categoryName || t.categoryId})`).join("\n");
        const annexuresSummary = (allAnnexures || []).map(a => `ID ${a.id}: ${a.title} (${a.category})`).join("\n");

        const prompt = `Tender Title: "${tenderName || "Procurement"}"
Document Type: "${documentType || "Limited Tender Document"}"
Category: "${tenderCategory || "goods"}"
Value: ${estimatedCost || "0"}
Department: "${departmentName || "General"}"

Select appropriate Terms and Annexures. Output raw JSON ONLY:
{
  "recommendedTermIds": [number, ...],
  "recommendedAnnexureIds": [number, ...],
  "rationale": "High-value analytical equipment requires OEM authorization and performance guarantees.",
  "confidence": "High"
}`;

        const result = await enqueueAiTask(async () => {
            try {
                console.log(`🤖 [OpenRouter AI] Querying ${model} for: "${tenderName}"...`);
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    signal: AbortSignal.timeout(60000),
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://tender-app.hpuniv.ac.in",
                        "X-Title": "University Tender App"
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: "system", content: "You are a JSON API for Himachal Pradesh University. Output valid JSON only." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.1,
                        max_tokens: 3000,
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.warn(`OpenRouter API error (${response.status}):`, errText);
                    return localSmartRecommend({ tenderName, documentType, tenderCategory, estimatedCost, allTerms, allAnnexures });
                }

                const aiData = await response.json();
                const rawContent = aiData.choices?.[0]?.message?.content;
                const parsed = extractJsonFromText(rawContent);

                if (!parsed) {
                    console.warn(`Could not parse JSON from Nemotron output:`, rawContent?.substring(0, 150));
                    return localSmartRecommend({ tenderName, documentType, tenderCategory, estimatedCost, allTerms, allAnnexures });
                }

                // Sanitize IDs
                const validTermIds = new Set(allTerms.map(t => t.id));
                const validAnnexIds = new Set(allAnnexures.map(a => a.id));

                let recTermIds = (parsed.recommendedTermIds || parsed.recommended_term_ids || []).filter(id => validTermIds.has(Number(id)));
                let recAnnexIds = (parsed.recommendedAnnexureIds || parsed.recommended_annexure_ids || []).filter(id => validAnnexIds.has(Number(id)));

                // Always enforce core mandatory terms
                allTerms.filter(t => t.mandatory).forEach(t => {
                    if (!recTermIds.includes(t.id)) recTermIds.push(t.id);
                });

                // Ensure linked annexures
                allTerms.filter(t => recTermIds.includes(t.id) && t.hasAnnexure && t.annexureId).forEach(t => {
                    if (!recAnnexIds.includes(t.annexureId)) recAnnexIds.push(t.annexureId);
                });

                if (documentType === "Limited Tender Document" && !recAnnexIds.includes(1)) {
                    recAnnexIds.push(1);
                }

                console.log(`✅ [OpenRouter AI Success: ${model}] ${recTermIds.length} terms & ${recAnnexIds.length} annexures recommended.`);

                return {
                    recommendedTermIds: recTermIds,
                    recommendedAnnexureIds: recAnnexIds,
                    rationale: parsed.rationale || "AI analyzed the scope of work and mapped standard university compliance clauses.",
                    confidence: parsed.confidence || "High",
                    source: `OpenRouter AI (${model})`
                };
            } catch (apiErr) {
                console.warn(`OpenRouter request error:`, apiErr.message);
                return localSmartRecommend({ tenderName, documentType, tenderCategory, estimatedCost, allTerms, allAnnexures });
            }
        });

        return res.json(result);
    } catch (err) {
        console.error("AI recommendation route error:", err);
        const fallback = localSmartRecommend({ tenderName, documentType, tenderCategory, estimatedCost, allTerms: allTerms || [], allAnnexures: allAnnexures || [] });
        return res.json(fallback);
    }
});

module.exports = router;
