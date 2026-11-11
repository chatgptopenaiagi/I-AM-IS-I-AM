import { stableResearchJSON } from "./research-interface.js";

// Bound bytes while reading, before allocating or parsing an untrusted response.
export async function readBoundedJSON(response, limit = 500000) {
  if (Number(response.headers.get("content-length")) > limit) {
    await response.body?.cancel();
    throw new Error("Gateway response too large");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty gateway response");
  let bytes = 0,
    content = "";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) throw new Error("Gateway response too large");
      content += decoder.decode(value, { stream: true });
    }
    content += decoder.decode();
    return JSON.parse(content);
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
}

export function checkExplanation(answer, model, claim) {
  if (
    answer?.schema_version !== "1.0" ||
    answer.status !== "AVAILABLE" ||
    answer.provider_status !== "AI_RESPONSE" ||
    answer.verification !== "UNVERIFIED_AI_OUTPUT" ||
    answer.claim_id !== claim ||
    answer.source_revision !== model.source_revision ||
    answer.computation_executed !== false ||
    typeof answer.answer !== "string" ||
    !answer.answer.trim() ||
    answer.answer.length > 100000 ||
    !Array.isArray(answer.source_ids) ||
    answer.source_ids.some(
      (id) =>
        !model.objects.find((o) => o.id === claim)?.source_ids.includes(id),
    ) ||
    !Array.isArray(answer.basis) ||
    answer.basis.some((x) => typeof x !== "string")
  ) {
    throw new Error("Invalid explanation or mismatched research context");
  }
  return answer;
}

export function checkWolfram(answer, model, reference) {
  if (
    answer?.schema_version !== "1.0" ||
    answer.source_revision !== model.source_revision ||
    stableResearchJSON(answer.input) !== stableResearchJSON(reference.input) ||
    !["COMPUTED", "UNAVAILABLE", "FAILED"].includes(answer.status)
  ) {
    throw new Error("Mismatched Wolfram experiment response");
  }
  if (answer.status !== "COMPUTED") {
    if (answer.engine !== null)
      throw new Error("Unexecuted result claimed an engine");
    return answer;
  }
  if (
    answer.engine !== "wolfram" ||
    typeof answer.runtime?.version !== "string" ||
    typeof answer.runtime?.system !== "string" ||
    answer.validation?.empirical_support !== false
  ) {
    throw new Error("Missing Wolfram execution evidence");
  }
  let agrees = true;
  function compare(actual, expected) {
    if (typeof expected === "number") {
      if (typeof actual !== "number" || !Number.isFinite(actual))
        throw new Error("Invalid numerical result");
      agrees &&=
        Math.abs(actual - expected) <=
        1e-10 * Math.max(Math.abs(actual), Math.abs(expected));
    } else if (expected !== null && typeof expected === "object") {
      if (
        !actual ||
        typeof actual !== "object" ||
        Array.isArray(actual) !== Array.isArray(expected) ||
        Object.keys(actual).sort().join("\0") !==
          Object.keys(expected).sort().join("\0")
      )
        throw new Error("Invalid Wolfram output structure");
      for (const key of Object.keys(expected))
        compare(actual[key], expected[key]);
    } else {
      if (typeof actual !== typeof expected)
        throw new Error("Invalid result type");
      agrees &&= actual === expected;
    }
  }
  compare(answer.output, reference.output);
  if (
    answer.validation.comparison?.pass !== agrees ||
    answer.validation.independent_engine !==
      (agrees ? "AGREES_WITH_JAVASCRIPT" : "DISAGREES_WITH_JAVASCRIPT")
  ) {
    throw new Error("Wolfram comparison label contradicts its outputs");
  }
  return answer;
}
