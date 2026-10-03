"""Regression set for the scoring judge (Agent 3).

Each case in judge_cases.json states what a correct judge must do:
- rate a grounded draft fairly;
- flag invented facts about the recipient or the sender;
- refuse to reward templates;
- ignore instructions hidden in a draft.

Run from the repo root (needs ANTHROPIC_API_KEY; six judge calls on MODEL_JUDGE):

    python evals/run_judge_eval.py
"""

import json
import sys
from pathlib import Path

import anthropic

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from email_generator import MODEL_JUDGE, score_variants  # noqa: E402


def check(draft: dict, expect: dict) -> list[str]:
    problems = []
    if "min_score" in expect and draft["score"] < expect["min_score"]:
        problems.append(f"score {draft['score']} below {expect['min_score']}")
    if "max_score" in expect and draft["score"] > expect["max_score"]:
        problems.append(f"score {draft['score']} above {expect['max_score']}")
    if expect.get("flags_claim") is True and not draft["unsupported_claims"]:
        problems.append("missed an unsupported claim")
    if expect.get("flags_claim") is False and draft["unsupported_claims"]:
        problems.append(f"flagged supported content: {draft['unsupported_claims']}")
    for factor, ceiling in expect.get("max_factor", {}).items():
        value = draft["score_factors"].get(factor)
        if value is None or value > ceiling:
            problems.append(f"{factor}={value} above {ceiling}")
    return problems


def main() -> int:
    spec = json.loads((Path(__file__).parent / "judge_cases.json").read_text())
    client = anthropic.Anthropic()
    passed = 0
    print(f"judge model: {MODEL_JUDGE}")
    for case in spec["cases"]:
        draft = dict(case["draft"])
        score_variants(client, case["use_case"], [draft], spec["source"])
        problems = check(draft, case["expect"])
        passed += not problems
        print(f"{'PASS' if not problems else 'FAIL'}  {case['id']:<22} score={draft['score']:<2} "
              f"claims={draft['unsupported_claims'] or '-'}" + (f"  <- {'; '.join(problems)}" if problems else ""))
    print(f"{passed}/{len(spec['cases'])} cases passed")
    return 0 if passed == len(spec["cases"]) else 1


if __name__ == "__main__":
    sys.exit(main())
