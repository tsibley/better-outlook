SHELL := bash -euo pipefail -c

build:
	npx web-ext build

sign:
	WEB_EXT_API_KEY="$$(pass addons.mozilla.org/jwt-issuer)" \
	WEB_EXT_API_SECRET="$$(pass addons.mozilla.org/jwt-secret)" \
		npx web-ext sign --channel=unlisted
