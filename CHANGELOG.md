# Changelog

## [0.3.0](https://github.com/grapitydev/hub/compare/v0.2.0...v0.3.0) (2026-06-06)


### Features

* add classification filter and version badges to spec list ([9a8b1d8](https://github.com/grapitydev/hub/commit/9a8b1d8e444980c99e1bd61ad1da59c464a07cc5))
* add JSON syntax highlighting and fix status code colors ([3b0d716](https://github.com/grapitydev/hub/commit/3b0d716871a17a1768f21dd4caf119c2bfefbb97))
* add YAML syntax highlighting to CodeBlock ([f00a517](https://github.com/grapitydev/hub/commit/f00a517a9596920dbfedad767c649ffa3a3f9602))
* display deprecation indicators at endpoint, parameter, and property levels ([fa2228b](https://github.com/grapitydev/hub/commit/fa2228bd4a79e65e49c41dcda0e99dc7b45c3aa9))
* map spec type tags to brand colors (openapi=green, asyncapi=rose) ([21895d1](https://github.com/grapitydev/hub/commit/21895d12d947a35c68e88146aba8975f6886361e))
* monochromatic bash rendering in code blocks ([85ada5c](https://github.com/grapitydev/hub/commit/85ada5cfb82970cd2b279ef1eb69d4b725e56dfa))
* move spec type tags to purple to avoid color collision with version badges ([74d5f54](https://github.com/grapitydev/hub/commit/74d5f54156376dacff0730d33e6234eef44f264f))
* redesign endpoint display with flat layout and side-by-side examples ([26983dd](https://github.com/grapitydev/hub/commit/26983ddad7cd54e9213189888291084554fda9d2))
* redesign Hub UI with Changelog, VersionBadge pills, scroll-spy fix, and OverviewFooter ([27701e3](https://github.com/grapitydev/hub/commit/27701e34791d18d2c43e7b7a4192f44b7f0581b6))
* replace hand-rolled JSON tokenizer with Shiki syntax highlighting ([2a2c4f5](https://github.com/grapitydev/hub/commit/2a2c4f56c8aacbfccd678209d702f386dfd8d73b))
* support light/dark theme switching for Shiki syntax highlighting ([47be74a](https://github.com/grapitydev/hub/commit/47be74a3e70bb3977f336fafbd01d403bb3994f7))


### Bug Fixes

* **deps:** update dependency @grapity/core to ^0.3.0 ([ca5cbc5](https://github.com/grapitydev/hub/commit/ca5cbc594a999a765869ffbc903ecc4fedd4f125))
* **deps:** update dependency @grapity/core to ^0.3.0 ([5086059](https://github.com/grapitydev/hub/commit/50860598c97a82ebe1cfc0cbdd35ca33641b1dc3))
* **hub:** skip compat report fetch for initial versions and prevent stale data race during navigation ([4e5b82b](https://github.com/grapitydev/hub/commit/4e5b82be10c8319a27ebbfee07fd5a9864efd56d))
* remove max-w-prose from endpoint descriptions ([2b3ecd4](https://github.com/grapitydev/hub/commit/2b3ecd4a197e484319a5671457d80da812b76b79))
* render endpoint descriptions in EndpointCard ([d04bba5](https://github.com/grapitydev/hub/commit/d04bba5b9844f6649362ecfff43c80bbdde1cf28))

## [0.2.0](https://github.com/grapitydev/hub/compare/v0.1.3...v0.2.0) (2026-05-25)


### Features

* add documentation links ([253e6e0](https://github.com/grapitydev/hub/commit/253e6e03b152b75cb5a3832950de25867c13e438))

## [0.1.3](https://github.com/grapitydev/hub/compare/v0.1.2...v0.1.3) (2026-05-25)


### Bug Fixes

* lowercase grapity branding across hub ([330e173](https://github.com/grapitydev/hub/commit/330e17368b15e25dd30950157e1dfd1232744594))
* remove server startup console.log to avoid CLI output overlap ([13d1adb](https://github.com/grapitydev/hub/commit/13d1adb0d1ae3edeffde1003352412c4d2c158e7))

## [0.1.2](https://github.com/grapitydev/hub/compare/v0.1.1...v0.1.2) (2026-05-24)


### Bug Fixes

* add missing type definitions for CI build ([5eca3ad](https://github.com/grapitydev/hub/commit/5eca3ade985c307433bcd2e653b26e773d08038b))

## [0.1.1](https://github.com/grapitydev/hub/compare/v0.1.0...v0.1.1) (2026-05-24)


### Bug Fixes

* update README with CLI serve integration ([5573bce](https://github.com/grapitydev/hub/commit/5573bce648cf3e8a7baa1be6cd8fa51bf9ed7a8e))
