# Test Suite for Django Online Voting System

This is a **drop-in pytest suite** covering critical flows for an online/blockchain-based voting system:
authentication, election listing, voting, double-vote prevention, tallying, auditability, and security checks.

## Quick Start

1) Install dev deps (run in your project venv):
```bash
pip install -U pytest pytest-django model-bakery djangorestframework
```
(If you don't use DRF endpoints, the tests still run but will use Django's `Client`.)

2) Copy the whole `tests/` folder into your **Django project root** (where `manage.py` lives).
   If you already have a `tests/` folder, merge as needed.

3) Update **`tests/config.py`** once to match your real endpoints and model paths.
   The defaults are sensible placeholders.

4) Run:
```bash
pytest -q
```

## What’s Included

- `tests/config.py` → one-stop config for endpoint names/URLs, model dotted paths, feature flags.
- `tests/conftest.py` → Django + pytest fixtures, users, elections, candidates, auth tokens.
- `tests/factories.py` → model_bakery factories for elections, candidates, voters, votes, blocks.
- `tests/test_auth.py` → signup/login/JWT/session flows.
- `tests/test_election.py` → list/active window/eligibility.
- `tests/test_voting.py` → cast vote, double vote prevention, tally changes, permissions.
- `tests/test_blockchain.py` → block append, nonce uniqueness, audit chain endpoint/util.
- `tests/test_verifiability.py` → voter can verify their vote exists (without deanonymization).
- `tests/test_security.py` → OTP randomness (if exposed as util), token payload PII checks, DB constraints.
- `pytest.ini` → minimal pytest-django settings (DJANGO_SETTINGS_MODULE).
- `requirements-dev.txt` → optional dev dependencies list.

### Adapting to Your Codebase

Open **`tests/config.py`**, change only the upper “CONFIG” section:
- Point `MODELS` to your actual dotted paths.
- Toggle `USE_DRF` if you’re using DRF APIClient (default **True**).
- Set URL names/paths to your routes (either Django `reverse` names or raw paths).

The tests are defensive: if an endpoint/model is missing, they **xfail** gracefully with a helpful message rather than hard-fail.
This lets you enable pieces incrementally as your deadline approaches.

---
