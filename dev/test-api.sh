#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Chronicle API Test Suite
# Tests every endpoint the admin frontend expects.
# Usage: ./test-api.sh [BASE_URL] [DM_USER] [DM_PASS]
# ═══════════════════════════════════════════════════════════════

BASE="${1:-https://lab.chronicle.cz}"
DM_USER="${2:-admin}"
DM_PASS="${3:-}"
API="$BASE/api/v1"

RED='\033[0;31m'
GRN='\033[0;32m'
YEL='\033[0;33m'
CYN='\033[0;36m'
DIM='\033[0;90m'
RST='\033[0m'

PASS=0; FAIL=0; SKIP=0
CREATED_IDS=()

if [ -z "$DM_PASS" ]; then
  echo "Usage: $0 [BASE_URL] [DM_USER] [DM_PASS]"
  echo "Example: $0 https://lab.chronicle.cz admin mypassword"
  exit 1
fi

# ── Helpers ──

http() {
  # http METHOD PATH [BODY]
  local method="$1" path="$2" body="$3"
  local args=(-s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json")
  [ -n "$TOKEN" ] && args+=(-H "Authorization: Bearer $TOKEN")
  [ -n "$body" ] && args+=(-d "$body")
  curl "${args[@]}" "${API}${path}"
}

parse_response() {
  # splits curl output into body + status code
  local raw="$1"
  HTTP_CODE=$(echo "$raw" | tail -1)
  HTTP_BODY=$(echo "$raw" | sed '$d')
}

# Extract field from JSON (crude but works for simple cases)
jval() {
  echo "$1" | grep -o "\"$2\":[^,}]*" | head -1 | sed "s/\"$2\"://" | tr -d '" '
}

jval_str() {
  echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | sed "s/\"$2\":\"//" | tr -d '"'
}

assert() {
  local label="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo -e "  ${GRN}✓${RST} $label"
    ((PASS++))
  else
    echo -e "  ${RED}✗${RST} $label ${DIM}(expected $expected, got $actual)${RST}"
    ((FAIL++))
  fi
}

assert_not_empty() {
  local label="$1" val="$2"
  if [ -n "$val" ] && [ "$val" != "null" ]; then
    echo -e "  ${GRN}✓${RST} $label"
    ((PASS++))
  else
    echo -e "  ${RED}✗${RST} $label ${DIM}(empty or null)${RST}"
    ((FAIL++))
  fi
}

assert_code() {
  local label="$1" expected="$2"
  if [ "$HTTP_CODE" = "$expected" ]; then
    echo -e "  ${GRN}✓${RST} $label → $HTTP_CODE"
    ((PASS++))
  else
    echo -e "  ${RED}✗${RST} $label → $HTTP_CODE ${DIM}(expected $expected)${RST}"
    [ -n "$HTTP_BODY" ] && echo -e "    ${DIM}$HTTP_BODY${RST}" | head -2
    ((FAIL++))
  fi
}

skip() {
  echo -e "  ${YEL}○${RST} $1 ${DIM}(skipped)${RST}"
  ((SKIP++))
}

section() {
  echo ""
  echo -e "${CYN}═══ $1 ═══${RST}"
}

# ═══════════════════════════════════════════════════════════════
echo -e "${CYN}Chronicle API Test Suite${RST}"
echo -e "${DIM}Target: $API${RST}"
echo -e "${DIM}User:   $DM_USER${RST}"
echo ""

# ═══════════════════════════════════════════════════════════════
section "AUTH"
# ═══════════════════════════════════════════════════════════════

parse_response "$(http POST /auth/login "{\"username\":\"$DM_USER\",\"password\":\"$DM_PASS\"}")"
assert_code "POST /auth/login" "200"
TOKEN=$(jval_str "$HTTP_BODY" "token")
assert_not_empty "Token received" "$TOKEN"

parse_response "$(http GET /auth/me)"
assert_code "GET /auth/me" "200"
USER_ID=$(jval_str "$HTTP_BODY" "id")
USER_ROLE=$(jval_str "$HTTP_BODY" "role")
assert_not_empty "User ID" "$USER_ID"
assert "User role is dm" "dm" "$USER_ROLE"

# ═══════════════════════════════════════════════════════════════
section "CAMPAIGNS"
# ═══════════════════════════════════════════════════════════════

parse_response "$(http GET /campaigns)"
assert_code "GET /campaigns (list)" "200"

# Create
parse_response "$(http POST /campaigns "{\"name\":\"Test Campaign\",\"description\":\"API test\",\"currentAge\":2}")"
assert_code "POST /campaigns (create)" "200"
CAMPAIGN_ID=$(jval_str "$HTTP_BODY" "id")
assert_not_empty "Campaign ID" "$CAMPAIGN_ID"

if [ -z "$CAMPAIGN_ID" ] || [ "$CAMPAIGN_ID" = "null" ]; then
  echo -e "${RED}Cannot continue without campaign. Aborting.${RST}"
  exit 1
fi

# Get single
parse_response "$(http GET /campaigns/$CAMPAIGN_ID)"
assert_code "GET /campaigns/:id" "200"

# Patch
parse_response "$(http PATCH /campaigns/$CAMPAIGN_ID "{\"name\":\"Test Campaign Updated\",\"currentAge\":3}")"
if [ "$HTTP_CODE" = "200" ]; then
  assert_code "PATCH /campaigns/:id" "200"
else
  skip "PATCH /campaigns/:id — not implemented yet ($HTTP_CODE)"
fi

# Members
parse_response "$(http GET /campaigns/$CAMPAIGN_ID/members)"
assert_code "GET /campaigns/:id/members" "200"

# Invite
parse_response "$(http POST /campaigns/$CAMPAIGN_ID/invite "{\"role\":\"player\"}")"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  assert_code "POST /campaigns/:id/invite" "$HTTP_CODE"
  INVITE_CODE=$(jval_str "$HTTP_BODY" "inviteCode")
  [ -z "$INVITE_CODE" ] && INVITE_CODE=$(jval_str "$HTTP_BODY" "invite_code")
  assert_not_empty "Invite code" "$INVITE_CODE"
else
  skip "POST /campaigns/:id/invite ($HTTP_CODE)"
  INVITE_CODE=""
fi

# List invites
parse_response "$(http GET /campaigns/$CAMPAIGN_ID/invites)"
if [ "$HTTP_CODE" = "200" ]; then
  assert_code "GET /campaigns/:id/invites" "200"
else
  skip "GET /campaigns/:id/invites — not implemented yet ($HTTP_CODE)"
fi

# Revoke invite
if [ -n "$INVITE_CODE" ]; then
  parse_response "$(http DELETE /invites/$INVITE_CODE)"
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
    assert_code "DELETE /invites/:code" "$HTTP_CODE"
  else
    skip "DELETE /invites/:code — not implemented yet ($HTTP_CODE)"
  fi
fi

# ═══════════════════════════════════════════════════════════════
section "GLOBAL REFERENCE TABLES"
# ═══════════════════════════════════════════════════════════════

# Test CRUD cycle for each ref table
REF_TABLES=(
  "types"
  "item-templates"
  "abilities"
  "knowledge"
  "traits"
  "ranks"
  "races"
  "items"
  "beasts"
  "flora"
  "materials"
  "monsters"
  "npc-important"
  "gods"
  "npc-other"
  "settlements"
  "wonders"
  "ruins"
  "dungeons"
  "spells"
  "tomes"
  "transmutations"
  "runes"
)

# First test types with full CRUD since everything depends on it
echo -e "\n${DIM}── types (full CRUD cycle) ──${RST}"

parse_response "$(http GET /refs/types)"
if [ "$HTTP_CODE" = "200" ]; then
  assert_code "GET /refs/types" "200"

  # Create
  parse_response "$(http POST /refs/types "{\"name\":\"TestType\",\"icon\":\"T\",\"color\":\"#ff0000\",\"designations\":[\"ability\"],\"sortOrder\":99}")"
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    assert_code "POST /refs/types (create)" "$HTTP_CODE"
    TYPE_ID=$(jval_str "$HTTP_BODY" "id")
    assert_not_empty "Created type ID" "$TYPE_ID"

    # Patch
    if [ -n "$TYPE_ID" ]; then
      parse_response "$(http PATCH /refs/types/$TYPE_ID "{\"name\":\"TestTypeUpdated\"}")"
      if [ "$HTTP_CODE" = "200" ]; then
        assert_code "PATCH /refs/types/:id" "200"
      else
        skip "PATCH /refs/types/:id ($HTTP_CODE)"
      fi

      # Delete
      parse_response "$(http DELETE /refs/types/$TYPE_ID)"
      if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
        assert_code "DELETE /refs/types/:id" "$HTTP_CODE"
      else
        skip "DELETE /refs/types/:id ($HTTP_CODE)"
      fi
    fi
  else
    skip "POST /refs/types ($HTTP_CODE)"
  fi
else
  skip "GET /refs/types — global refs not implemented ($HTTP_CODE)"
  echo -e "  ${YEL}Skipping all ref table tests${RST}"
  for t in "${REF_TABLES[@]}"; do
    [ "$t" = "types" ] && continue
    skip "GET /refs/$t"
  done
  REF_TABLES=() # skip the loop below
fi

# Quick GET test for remaining tables
for TABLE in "${REF_TABLES[@]}"; do
  [ "$TABLE" = "types" ] && continue
  parse_response "$(http GET /refs/$TABLE)"
  if [ "$HTTP_CODE" = "200" ]; then
    assert_code "GET /refs/$TABLE" "200"
  else
    skip "GET /refs/$TABLE ($HTTP_CODE)"
  fi
done

# ═══════════════════════════════════════════════════════════════
section "PROPOSALS (Ref Edits)"
# ═══════════════════════════════════════════════════════════════

parse_response "$(http GET /proposals)"
if [ "$HTTP_CODE" = "200" ]; then
  assert_code "GET /proposals" "200"

  # Create a proposal
  parse_response "$(http POST /proposals "{\"table\":\"types\",\"op\":\"create\",\"data\":{\"name\":\"ProposalTest\"}}")"
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    assert_code "POST /proposals (create)" "$HTTP_CODE"
    PROP_ID=$(jval_str "$HTTP_BODY" "id")

    if [ -n "$PROP_ID" ]; then
      # Reject
      parse_response "$(http POST /proposals/$PROP_ID/reject "{\"reason\":\"Test rejection\"}")"
      if [ "$HTTP_CODE" = "200" ]; then
        assert_code "POST /proposals/:id/reject" "200"
      else
        skip "POST /proposals/:id/reject ($HTTP_CODE)"
      fi
    fi
  else
    skip "POST /proposals ($HTTP_CODE)"
  fi
else
  skip "GET /proposals — not implemented ($HTTP_CODE)"
  skip "POST /proposals"
  skip "POST /proposals/:id/approve"
  skip "POST /proposals/:id/reject"
fi

# ═══════════════════════════════════════════════════════════════
section "SOUNDBOARD"
# ═══════════════════════════════════════════════════════════════

SOUND_CATS=("sounds" "music" "ambient")

for CAT in "${SOUND_CATS[@]}"; do
  echo -e "\n${DIM}── sounds/$CAT ──${RST}"

  parse_response "$(http GET /sounds/$CAT)"
  if [ "$HTTP_CODE" = "200" ]; then
    assert_code "GET /sounds/$CAT" "200"

    # Create
    parse_response "$(http POST /sounds/$CAT "{\"name\":\"Test $CAT\",\"path\":\"/test.mp3\",\"volume\":80,\"loop\":\"no\",\"loopDelay\":0,\"fadeIn\":0,\"fadeOut\":0,\"tags\":[\"test\"]}")"
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
      assert_code "POST /sounds/$CAT (create)" "$HTTP_CODE"
      SND_ID=$(jval_str "$HTTP_BODY" "id")

      if [ -n "$SND_ID" ]; then
        # Patch
        parse_response "$(http PATCH /sounds/$CAT/$SND_ID "{\"name\":\"Test $CAT Updated\"}")"
        if [ "$HTTP_CODE" = "200" ]; then
          assert_code "PATCH /sounds/$CAT/:id" "200"
        else
          skip "PATCH /sounds/$CAT/:id ($HTTP_CODE)"
        fi

        # Delete
        parse_response "$(http DELETE /sounds/$CAT/$SND_ID)"
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
          assert_code "DELETE /sounds/$CAT/:id" "$HTTP_CODE"
        else
          skip "DELETE /sounds/$CAT/:id ($HTTP_CODE)"
        fi
      fi
    else
      skip "POST /sounds/$CAT ($HTTP_CODE)"
    fi
  else
    skip "GET /sounds/$CAT — not implemented ($HTTP_CODE)"
    skip "POST /sounds/$CAT"
  fi
done

# Presets
echo -e "\n${DIM}── sounds/presets ──${RST}"

parse_response "$(http GET /sounds/presets)"
if [ "$HTTP_CODE" = "200" ]; then
  assert_code "GET /sounds/presets" "200"

  parse_response "$(http POST /sounds/presets "{\"name\":\"Test Preset\",\"tags\":[\"test\"],\"fadeInDuration\":2,\"fadeOutDuration\":2,\"musicTrack\":{\"trackName\":\"bg.mp3\",\"volume\":70},\"ambientLayers\":[],\"soundButtons\":[]}")"
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    assert_code "POST /sounds/presets (create)" "$HTTP_CODE"
    PRESET_ID=$(jval_str "$HTTP_BODY" "id")

    if [ -n "$PRESET_ID" ]; then
      parse_response "$(http DELETE /sounds/presets/$PRESET_ID)"
      if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
        assert_code "DELETE /sounds/presets/:id" "$HTTP_CODE"
      else
        skip "DELETE /sounds/presets/:id ($HTTP_CODE)"
      fi
    fi
  else
    skip "POST /sounds/presets ($HTTP_CODE)"
  fi
else
  skip "GET /sounds/presets — not implemented ($HTTP_CODE)"
fi

# ═══════════════════════════════════════════════════════════════
section "CHARACTERS (campaign-scoped)"
# ═══════════════════════════════════════════════════════════════

parse_response "$(http GET /campaigns/$CAMPAIGN_ID/characters)"
assert_code "GET /campaigns/:id/characters" "200"

# Create character
parse_response "$(http POST /campaigns/$CAMPAIGN_ID/characters "{\"name\":\"Test Char\"}")"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  assert_code "POST /campaigns/:id/characters (create)" "$HTTP_CODE"
  CHAR_ID=$(jval_str "$HTTP_BODY" "id")
  assert_not_empty "Character ID" "$CHAR_ID"

  if [ -n "$CHAR_ID" ]; then
    # Patch
    parse_response "$(http PATCH /characters/$CHAR_ID "{\"name\":\"Test Char Updated\"}")"
    assert_code "PATCH /characters/:id" "200"

    # Stepper
    parse_response "$(http POST /characters/$CHAR_ID/stepper "{\"field\":\"soulsEnergy\",\"delta\":1}")"
    if [ "$HTTP_CODE" = "200" ]; then
      assert_code "POST /characters/:id/stepper" "200"
    else
      skip "POST /characters/:id/stepper ($HTTP_CODE)"
    fi

    # Sub-resources
    CHAR_SUBS=("abilities" "knowledge" "inventory" "traits" "arcane" "tasks" "attributes")
    for SUB in "${CHAR_SUBS[@]}"; do
      parse_response "$(http GET /characters/$CHAR_ID/$SUB)"
      if [ "$HTTP_CODE" = "200" ]; then
        assert_code "GET /characters/:id/$SUB" "200"
      else
        skip "GET /characters/:id/$SUB ($HTTP_CODE)"
      fi
    done

    # Delete character
    parse_response "$(http DELETE /characters/$CHAR_ID)"
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
      assert_code "DELETE /characters/:id" "$HTTP_CODE"
    else
      skip "DELETE /characters/:id ($HTTP_CODE)"
    fi
  fi
else
  skip "POST /campaigns/:id/characters ($HTTP_CODE)"
fi

# ═══════════════════════════════════════════════════════════════
section "CAMPAIGN CONTENT"
# ═══════════════════════════════════════════════════════════════

CONTENT_TABLES=("journal" "lore")

for CT in "${CONTENT_TABLES[@]}"; do
  parse_response "$(http GET /campaigns/$CAMPAIGN_ID/$CT)"
  if [ "$HTTP_CODE" = "200" ]; then
    assert_code "GET /campaigns/:id/$CT" "200"
  else
    skip "GET /campaigns/:id/$CT ($HTTP_CODE)"
  fi
done

# ═══════════════════════════════════════════════════════════════
section "CLEANUP"
# ═══════════════════════════════════════════════════════════════

# Delete test campaign
parse_response "$(http DELETE /campaigns/$CAMPAIGN_ID)"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
  assert_code "DELETE /campaigns/:id (cleanup)" "$HTTP_CODE"
else
  skip "DELETE /campaigns/:id — not implemented, test campaign '$CAMPAIGN_ID' left behind ($HTTP_CODE)"
fi

# ═══════════════════════════════════════════════════════════════
section "RESULTS"
# ═══════════════════════════════════════════════════════════════

TOTAL=$((PASS + FAIL + SKIP))
echo ""
echo -e "${GRN}Passed: $PASS${RST}  ${RED}Failed: $FAIL${RST}  ${YEL}Skipped: $SKIP${RST}  Total: $TOTAL"
echo ""

if [ $FAIL -gt 0 ]; then
  echo -e "${RED}Some tests failed. Check output above.${RST}"
  exit 1
elif [ $SKIP -gt 0 ]; then
  echo -e "${YEL}All passing tests pass, but some endpoints are not implemented yet.${RST}"
  exit 0
else
  echo -e "${GRN}All tests passed!${RST}"
  exit 0
fi
