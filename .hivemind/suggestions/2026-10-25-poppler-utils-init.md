**Date:** 2026-10-25
**Project:** machine environment
**Role:** external (pdf-reader plugin build)
**Scope:** harness init
**What happened:** Built the pdf-reader pi extension
(`~/.pi/agent/extensions/pdf-reader/`), which shells out to
poppler-utils (`pdftotext`, `pdfinfo`) to give agents a `pdf_read`
tool. Security review of the engine (2026-10-25) chose Debian's
poppler: freedesktop-maintained, OSS-Fuzzed, prompt Debian security
fixes (trixie carries security uploads). It is installed on this
machine now, but nothing guarantees it on a fresh BeeHarness
bootstrap.
**Suggestion:** BeeHarness init (or the machine-setup routine it will
grow) should ensure `poppler-utils` is present — an idempotent
`dpkg -s poppler-utils || apt-get install -y poppler-utils` check in
whatever the init's "machine prerequisites" step becomes. The plugin
already degrades gracefully (asks the human, offers to install), but
init-time provisioning keeps every harnessed session PDF-capable
without an interruption, and keeps the package under Debian security
maintenance visibility.
