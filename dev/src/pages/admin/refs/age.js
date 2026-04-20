// Compute state of an entry based on its `age` vs campaign.currentAge.
//
// diff = entry.age - currentAge
//   diff <= -1  → "undiscovered"  (future/hidden)
//   diff ==  0  → "known"         (current age)
//   diff ==  1  → "known"         (recent past — still well-known)
//   diff ==  2  → "forgotten"     (one generation back)
//   diff >=  3  → "lost"          (fully lost to history)

export const AGE_STATES = {
  undiscovered: { label: "Undiscovered", color: "#606060", hint: "Belongs to a future age — hidden from players." },
  known:        { label: "Known",        color: "#6ec07a", hint: "Current or recent — common knowledge." },
  forgotten:    { label: "Forgotten",    color: "#c08040", hint: "One age removed — known only to scholars." },
  lost:         { label: "Lost",         color: "#8060a0", hint: "Many ages gone — mythic, partial at best." },
  unknown:      { label: "Undated",      color: "#555",    hint: "No age set." },
};

export function computeAgeState(entryAge, campaignAge) {
  if (entryAge == null || campaignAge == null) return "unknown";
  const diff = Number(entryAge) - Number(campaignAge);
  if (diff <= -1) return "undiscovered";
  if (diff <= 1)  return "known";
  if (diff === 2) return "forgotten";
  return "lost";
}

// Returns { state, diff, meta }
export function ageInfo(entryAge, campaignAge) {
  const state = computeAgeState(entryAge, campaignAge);
  return {
    state,
    diff: entryAge == null ? null : Number(entryAge) - Number(campaignAge || 0),
    meta: AGE_STATES[state],
  };
}
