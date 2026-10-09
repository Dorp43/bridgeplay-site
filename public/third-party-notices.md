# Third-Party Notices

BridgePlay is proprietary software. It bundles an open-source Windows
compatibility runtime (Wine and its supporting libraries) and a small set of
compatibility shims. This document lists the third-party components that ship in
the product and the terms under which they are included. The full text of every
license named here is distributed with the app under
`Contents/Resources/Legal/licenses/<component>/`.

Every component listed below is present in the shipped bundle. Nothing described
here is aspirational: the runtime libraries are read out of the assembled bundle,
not from a plan.

## Wine

- Project: [Wine](https://www.winehq.org/)
- Role: the Windows compatibility layer. BridgePlay's proprietary Swift binary
  loads it dynamically; it is not statically linked into the app binary.
- Version: `11.0`
- License: `LGPL-2.1-or-later`
- Source provenance: pinned by URL and SHA-256 in
  [RuntimeSources.lock.json](RuntimeSources.lock.json).
- **This is a modified version of Wine** (LGPL-2.1 §2(a) notice). The
  modifications are, in full:
  1. The source patches declared under `patches` in
     [RuntimeSources.lock.json](RuntimeSources.lock.json).
  2. The modules under `overlayModules` in the same file, built from that
     patched source. The SHA-256 of each file as shipped is recorded under
     `overlayModules` in the runtime's `runtime-manifest.json`
     (`BridgePlay.app/Contents/Resources/Runtime/`), written by
     `scripts/assemble-runtime.sh`.
  3. Product naming — strings in PE resources, the loader's embedded
     `Info.plist`, icons, and file and directory names — rewritten by
     `scripts/debrand-runtime.py`. This changes no instruction and no program
     logic. `VS_VERSION_INFO` `LegalCopyright` and `CompanyName` are left
     intact, as is this notice.
- How the LGPL is satisfied: the runtime ships as separate dynamic libraries
  under `Contents/Resources/Runtime/`, which the user may replace with a
  compatible build (LGPL §6 relinking); nothing in it is statically linked into
  BridgePlay's own binary. The full LGPL-2.1 text ships at
  `licenses/compat-runtime/COPYING.LIB`.
- Corresponding source (LGPL §4): `BridgePlay-runtime-src-<version>.tar.xz`,
  attached to the same release as the application. It carries the pinned
  upstream identity, every patch, the de-branding script and the assembly
  scripts, with instructions to reproduce the shipped tree. Upstream winehq.org
  is **not** a substitute: it does not have these modifications.

## FreeType

- Project: [FreeType](https://www.freetype.org/)
- Role: TrueType font rasterizer. Built from pinned source as a shared library
  and loaded at runtime by Wine's `win32u`; not statically linked into the app
  binary.
- Version: `2.13.3` (soname 6), built from source pinned by version and SHA-256
  in `scripts/build-freetype-x86_64.sh`.
- License: FreeType License (FTL). FreeType is offered under `FTL OR
  GPL-2.0-or-later`; this build elects the FTL, so the GPLv2 option is not
  exercised and imposes nothing. The full FTL text ships at
  `licenses/freetype/FTL.TXT`.
- Required credit (FTL Legal Terms §3): **Portions of this software are copyright
  (C) 2024 The FreeType Project (www.freetype.org). All rights reserved.** This
  software is based in part on the work of the FreeType Team; the FreeType
  Project is copyright (C) 1996-2024 David Turner, Robert Wilhelm, and Werner
  Lemberg.

---

## Runtime engines bundled under `Contents/Resources/Runtime/share`

Wine's build produces `fonts`, `nls`, `winmd` and its setup INF — shipped as
`core.inf`, `wine.inf` upstream — which are its own data,
covered by the Wine notice above. The other two entries in that directory are
not Wine's code at all. They are separately-licensed upstream projects that the
Wine project repackages, they account for roughly 438 MB of the shipped bundle,
and until the licence gate was widened to walk `share/` (it had only ever walked
`lib/`) they shipped with no attribution whatsoever. They are not removable:
Windows programs that embed a browser control — a game's patcher, in-client news
panes — render HTML through the engine, and `mscoree` is backed by the .NET
replacement; dropping either breaks titles.

### Gecko (`share/wine/gecko`)

- Project: [Wine Gecko](https://gitlab.winehq.org/wine/wine-gecko) — the Wine
  project's build of Mozilla Gecko, the engine behind Firefox.
- Bundled builds: `wine-gecko-2.47.4-x86` and `wine-gecko-2.47.4-x86_64`.
- Role: backs the runtime's `mshtml`, so Windows programs that embed a browser
  control render inside the game rather than failing to start.
- License: `MPL-2.0`, which also covers the NSS/NSPR libraries shipped inside the
  build (`nss3.dll`, `softokn3.dll`, `freebl3.dll`, `nssckbi.dll`, `mozglue.dll`).
  Full text: `licenses/gecko/LICENSE`.
- How the MPL is satisfied: the build ships unmodified, as separate files the
  user may replace, and BridgePlay's own source is not a "Larger Work" covered by
  §3.3. Corresponding source for the exact version shipped is available from the
  project above and on request.

### Mono (`share/wine/mono`)

- Project: [Wine Mono](https://gitlab.winehq.org/wine/wine-mono) — the Wine
  project's build of Mono, the open-source .NET implementation.
- Bundled build: `wine-mono-10.4.1`.
- Role: backs the runtime's `mscoree`, so a .NET program (several game launchers
  and patchers are .NET) runs without Microsoft's redistributable installed.
- License: `MIT` for the runtime and the class libraries that ship here. Two
  texts are carried because the payload is a mix: Mono's own
  (`licenses/mono/LICENSE`) and the .NET Foundation's, which covers the
  `System.*` assemblies (`licenses/mono/LICENSE.NET`).
- The payload ships unmodified as separate files the user may replace.
  Corresponding source for the exact version shipped is available from the
  project above and on request.

---

## Runtime libraries bundled with Wine

The compatibility runtime is assembled from a prebuilt Wine archive that carries
its own dependencies: **94 dylibs**, **43 distinct libraries**, resolving to the
**26 projects** below. Every one of them ships to every user under
`Contents/Resources/Runtime/lib/`. Each is bundled as a separate dynamic library
— unmodified and not statically linked into BridgePlay's own binary.

This table is generated by `scripts/collect-runtime-licenses.py <runtime>/lib
--markdown`. License identifiers come from the Homebrew formula metadata for the
packages the archive was built from. Versions are read out of the shipped
binaries where they embed one; where they do not, the soname is given, because
that is the only version fact the binary records.

| Project | Version | License (as shipped) | Homepage |
| --- | --- | --- | --- |
| brotli | soname `1/1.1.0` | `MIT` | [link](https://github.com/google/brotli) |
| bzip2 | soname `1/1.0/1.0.8` | `bzip2-1.0.6` | [link](https://sourceware.org/bzip2/) |
| freetype | `2.13.3` (soname 6) | `FTL` | [link](https://www.freetype.org/) |
| gettext (libintl only) | soname `8` | `LGPL-2.1-or-later` | [link](https://www.gnu.org/software/gettext/) |
| gmp | `6.3.0` | `LGPL-3.0-or-later` (elected) | [link](https://gmplib.org/) |
| gnutls | `3.8.7` | `LGPL-2.1-or-later` | [link](https://gnutls.org/) |
| icu4c | `76.1` | `Unicode-3.0` | [link](https://icu.unicode.org/home) |
| libffi | soname `8` | `MIT` | [link](https://sourceware.org/libffi/) |
| libiconv (libiconv/libcharset only) | soname `1/2` | `LGPL-2.1-or-later` | [link](https://www.gnu.org/software/libiconv/) |
| libidn2 | `2.3.7` | `LGPL-3.0-or-later` (elected) + Unicode-DFS-2016 / Unicode-TOU / FSFAP (data tables) | [link](https://www.gnu.org/software/libidn/#libidn2) |
| libinotify-kqueue | soname `0` | `MIT` | [link](https://github.com/libinotify-kqueue/libinotify-kqueue) |
| libpcap | `1.10.5` | `BSD-3-Clause` | [link](https://www.tcpdump.org/) |
| libpng | soname `16` | `libpng-2.0` | [link](https://www.libpng.org/pub/png/libpng.html) |
| libtasn1 | `4.20.0` | `LGPL-2.1-or-later` | [link](https://www.gnu.org/software/libtasn1/) |
| libunistring | soname `5` | `LGPL-3.0-or-later` (elected) | [link](https://www.gnu.org/software/libunistring/) |
| libxml2 | soname `2` | `MIT` | [link](http://xmlsoft.org/) |
| libxslt (libxslt/libexslt) | soname `0/1` | `MIT` (X11) | [link](http://xmlsoft.org/XSLT/) |
| lz4 | soname `1/1.10.0` | `BSD-2-Clause` (library) | [link](https://lz4.github.io/lz4/) |
| macports-legacy-support | — | `BSD-3-Clause` | [link](https://github.com/macports/macports-legacy-support) |
| molten-vk | `1.4.1` | `Apache-2.0` | [link](https://github.com/KhronosGroup/MoltenVK) |
| nettle (libnettle/libhogweed) | `3.10` (soname 6/6.9/8/8.9) | `LGPL-3.0-or-later` (elected) | [link](https://www.lysator.liu.se/~nisse/nettle/) |
| p11-kit | soname `0` | `BSD-3-Clause` | [link](https://p11-glue.github.io/p11-glue/p11-kit.html) |
| sdl2 | soname `0.0` | `Zlib` | [link](https://github.com/libsdl-org/sdl2-compat) |
| xz (liblzma only) | soname `5` | `0BSD` | [link](https://tukaani.org/xz/) |
| zlib | soname `1/1.3.1` | `Zlib` | [link](https://zlib.net/) |
| zstd | `1.5.6` | `BSD-3-Clause` (elected) | [link](https://facebook.github.io/zstd/) |

### What actually ships, and why the license column is what it is

Several of these projects carry a compound umbrella license where a GPL term
covers command-line **tools** that this product does not ship, while the
**library** — the only thing bundled — is permissive or LGPL. The identifiers
above are the license of the shipped dylib, not the umbrella project license.

**Permissive / attribution-only (no copyleft, no source obligation):**
brotli (MIT), bzip2 (BSD-style), libffi (MIT), libinotify-kqueue (MIT),
libpcap (BSD-3), libpng (libpng-2.0), libxml2 (MIT), libxslt (MIT/X11),
lz4 (BSD-2, library), macports-legacy-support (BSD-3), molten-vk (Apache-2.0),
p11-kit (BSD-3), sdl2 (Zlib), zlib (Zlib), zstd (BSD-3, elected from its
BSD-OR-GPLv2 core). Obligation: reproduce the copyright and license text, which
is done by shipping each project's verbatim license under `licenses/<project>/`.
Apache-2.0 (MoltenVK) requires carrying the upstream `NOTICE` file only if the
licensor provides one; MoltenVK ships no `NOTICE` file upstream, so none is
carried and none is required (Apache-2.0 §4(d)).

- **xz / liblzma** — only `liblzma` ships, and it is `0BSD`
  (public-domain-equivalent). The `GPL-2.0-or-later` half of the xz umbrella
  covers the `xz`/`xzdec`/`lzmainfo` tools, which are not shipped. There is no
  copyleft and, strictly, no attribution obligation on the shipped artifact; the
  0BSD text is shipped for completeness.
- **zstd** — the core is `BSD-3-Clause OR GPL-2.0-only`; this build takes
  BSD-3-Clause. The remaining components of its expression are BSD-2/MIT. No
  copyleft applies.
- **FreeType** — FTL (elected), a permissive-with-credit license. See the credit
  line in the FreeType section above; that credit is a hard requirement of the
  FTL and must remain in this document.
- **icu4c** — `Unicode-3.0` (permissive with a Unicode attribution clause). The
  Unicode license text ships at `licenses/icu4c/LICENSE`.
- **libidn2** — the library is dual `GPL-2.0-or-later OR LGPL-3.0-or-later`; this
  build elects LGPL-3.0-or-later. The `idn2` CLI (GPL-3.0-or-later) is not
  shipped. The bundled IDNA data tables additionally carry Unicode-DFS-2016,
  Unicode-TOU, and FSFAP notices, whose texts ship at
  `licenses/libidn2/COPYING.unicode`.

**LGPL — obligations, but no GPL and no obligation to open BridgePlay's source.**
Each of the following ships as a separate, unmodified dynamic library that the
user can replace in `Contents/Resources/Runtime/lib/`; that dynamic-linking
boundary satisfies the LGPL's relinking requirement. Corresponding source for
the exact version shipped is available from each project's homepage above and on
request. The GPL-licensed command-line tools that some of these projects publish
are **not** shipped.

- **gettext (libintl)** — `LGPL-2.1-or-later`. Only `libintl.8.dylib` ships; the
  gettext tools (`msgfmt`, `xgettext`, …) and `libgettextpo`, which are
  GPL-3.0-or-later, are not shipped. Ship the LGPL-2.1 text
  (`licenses/gettext/COPYING.LIB`) — **not** the project's top-level `COPYING`,
  which is GPLv3 and covers the unshipped tools.
- **gnutls** — `LGPL-2.1-or-later`. Both shipped dylibs (`libgnutls`, the
  `libgnutlsxx` C++ wrapper) are the library. The GPL-3.0-only tools
  (`certtool`, `gnutls-cli`, `gnutls-serv`, …) are not shipped. Ship
  `licenses/gnutls/COPYING.LESSERv2` (LGPL-2.1).
- **libiconv (libiconv/libcharset)** — `LGPL-2.1-or-later`. The standalone
  `iconv(1)` program (GPL-3.0-or-later) is not shipped.
- **libtasn1** — `LGPL-2.1-or-later`. The `asn1Parser`/`asn1Coding`/
  `asn1Decoding` tools (GPLv3) are not shipped.
- **gmp** — dual `LGPL-3.0-or-later OR GPL-2.0-or-later`; this build elects
  LGPL-3.0-or-later. Ships `libgmp` and the `libgmpxx` C++ wrapper.
- **nettle (libnettle/libhogweed)** — dual `GPL-2.0-or-later OR
  LGPL-3.0-or-later`; this build elects LGPL-3.0-or-later.
- **libunistring** — dual `GPL-2.0-or-later OR LGPL-3.0-or-later`; this build
  elects LGPL-3.0-or-later.

Because gmp, nettle, libunistring, and libidn2 are used under **LGPL-3.0**, and
LGPLv3 is written as a set of additional permissions on top of GPLv3, both the
LGPLv3 text and the GPLv3 text it references ship for each
(`licenses/<project>/COPYING.LESSERv3` and `licenses/<project>/COPYING`). The
GPLv3 anti-lock-down term binds only locked-down "User Products"; a
general-purpose Mac on which the user can replace the dylib is not one, so no
additional obligation arises.

---

## Compatibility shims bundled in `Contents/Resources/CompatibilityFixes`

`mrwindowctl.exe`, `iphlpapi.dll`, `libmtl_noexec.dylib` (BUG-45: drops the execute bit on
host memory Metal adopts as a GPU buffer; built from `AppAssets/CompatibilityFixes/mtl_noexec.m`)
`bpsteamhelper_userenv.dll` (a `userenv.dll` proxy for Steam's web helper, built from
`AppAssets/CompatibilityFixes/steamwebhelper_cmdline.c`; it forwards every export to the
runtime's own builtin, copied beside it as `userenv_real.dll`)
`libbpdocktile.dylib` (a Wine process presents like its program on Windows: a
Dock tile only while it has a window, named and iconed as the program it hosts; also
translucent windows, letterboxed emulated modes and a window's first frame; built from
`AppAssets/CompatibilityFixes/dock_tile.m`, `window_alpha.m`, `letterbox_fit.m` and
`first_present.m`) with `libbpsteamdock.dylib`, a link to it under the name an earlier
build used (BUG-93),
`libbploopback.dylib` (BUG-95: the whole 127.0.0.0/8 range is loopback, as on Windows;
built from `AppAssets/CompatibilityFixes/loopback_range.c`)
and `dwmapi_shim_x64.dll` / `dwmapi_shim_x86.dll` (BUG-106: DWM composition answers for
translucent windows, forwarding everything else to the runtime's own `dwmapi.dll`; built
from `AppAssets/CompatibilityFixes/dwmapi_shim.c`)
are built by BridgePlay from sources in this
repository and carry no third-party notice.

### Steam client (downloaded from Valve at install time, not bundled)

BridgePlay does not ship any part of the Steam client. "Install Steam for Windows…"
downloads Valve's own `SteamSetup.exe` from Valve's CDN when the user asks for it, checks
that its Authenticode signer is Valve Corp., and runs it inside the user's environment; the
client then updates itself from Valve. Use of the client is governed by Valve's Steam
Subscriber Agreement between the user and Valve; BridgePlay is a launcher and takes no
part in the sign-in (see `docs/investigations/2026-09-16-steam-terms-third-party-launcher.md`).

### DXVK (Direct3D 9, 10 and 11 on Vulkan) — zlib

`Contents/Resources/CompatibilityFixes/dxvk/` holds `d3d9.dll`,
`d3d10core.dll`, `d3d11.dll` and `dxgi.dll` in 32- and 64-bit form, all built
from one source tree: the macOS fork of DXVK
(<https://github.com/Gcenx/DXVK-macOS>, itself a fork of
<https://github.com/doitsujin/dxvk>) at tag `v1.10.3-20230507`, with Direct3D 9
enabled (the fork's own releases leave `d3d9.dll` out).

All four libraries are **modified**, as the zlib licence permits. Every change
is recorded in full in `AppAssets/RuntimePatches/dxvk-1.10.3-*.patch` and
registered, in the order it is applied, under `bundledDxvkPatches` in
`RuntimeSources.lock.json`:

- `honour-shaderCullDistance` — the shader compiler honours the device's
  `shaderCullDistance` feature. Metal has no cull distance, the Vulkan driver
  reports the feature as unsupported, and emitting it anyway produced Metal
  source the compiler rejected, so every shader declaring it failed and its
  draw calls vanished.
- `inprocess-shared-resources` — Direct3D 11 textures and fences shared between
  the devices of one process (BUG-99).
- `dwm-composition-alpha` — a swap chain whose window asked for DWM per-pixel
  composition presents with alpha (BUG-106).
- `system-vulkan-driver` — Vulkan is loaded from the system's driver before any
  `vulkan-1.dll` (BUG-116).
- `d3d9-mingw13-header` — a build fix: a backport of upstream DXVK commit
  `62b99d7b` by Philip Rebohle.
- `d3d9-moltenvk-pr20` — pull request #20 to the macOS fork, "Fix D3D9 on
  MoltenVK", by **MiloszP** (<https://github.com/Gcenx/DXVK-macOS/pull/20>),
  used as published: Direct3D 9 no longer requires geometry shaders and cull
  distance, which Metal lacks, and gives each variant of a sampler its own
  binding (`d3d9.deAliasedSamplers`), since Metal cannot express aliased ones.
- `d3d9-closest-mode` — BridgePlay's own: a full-screen Direct3D 9 display mode
  the display does not list is set as the closest listed one, as Wine's own
  Direct3D does, instead of failing (BUG-130).
- `no-recreate-on-suboptimal` — BridgePlay's own: Direct3D 9 and 11 keep their
  swap chain when a present reports it as suboptimal (a scaled surface) instead
  of rebuilding it before every frame (BUG-120, BUG-130).
- `d3d9-processvertices-vertex-stage` — BridgePlay's own: on a device without
  geometry shaders, which Metal lacks, Direct3D 9's `ProcessVertices` runs in
  the vertex stage instead of in a geometry shader the Vulkan driver drops
  (BUG-130). A call without a vertex declaration takes the destination
  buffer's layout, as Direct3D 9 allows, by upstream DXVK's check (commit
  `b2ad25755a` by Adam Jereczek, co-authored by Aneta Roztkowska
  <aneta.roztkowska@intel.com>), and the call no longer leaks a reference to
  the declaration. Its change to DXVK's shared core (a vertex shader can turn
  rasterization off) is in `d3d11.dll` and `dxgi.dll` too.

They are copied into every game environment (Wine prefix) and selected there
for every program, the way Windows provides Direct3D to every program: the
runtime's own Direct3D 11 cannot create a Shader Model 5 device on macOS, and
its Direct3D 9 on Vulkan loses draws DXVK's does not (BUG-78, BUG-98, BUG-130).
BridgePlay does not link against them; they are loaded by the programs inside
the prefix.

DXVK is licensed under the **zlib license** (Copyright (c) 2017-2021 Philip
Rebohle, Copyright (c) 2019-2021 Joshua Ashton; see the `LICENSE` file of
either repository above). The pull request above is a contribution to the
zlib-licensed fork and carries no other terms. Source for the exact build
shipped here is the fork's tag plus the patch files listed above, built by
`scripts/build-dxvk.sh` with the compiler versions it checks for. The runtime's
own Direct3D libraries are never replaced (BUG-13); only the game's prefix
receives copies.

### unar (The Unarchiver command-line tool) — LGPL-2.1-or-later

`Contents/Resources/Tools/unar` is The Unarchiver's command-line extractor,
shipped **unmodified** and used to open the ZIP and RAR archives games are
distributed in, including password-protected ones (macOS itself cannot read
RAR, and its `ditto` cannot accept a password). BridgePlay invokes it as a
separate process and does not link against it.

It is licensed under the **GNU Lesser General Public License, version 2.1 or
later**. Source code for this program is available from its upstream project at
<https://theunarchiver.com/command-line> and
<https://github.com/MacPaw/XADMaster>. Because the tool ships unmodified as a
standalone executable, it can be replaced by a user-built copy of the same
program at `Contents/Resources/Tools/unar`.

### msxml3 (Microsoft XML Core Services 3.0)

`msxml3.dll` and `msxml3r.dll` are Microsoft's freely redistributable MSXML 3.0
parser and its resource library, extracted unmodified from Microsoft's
`msxml3.msi` redistributable package. They are installed into a game's Wine
prefix only when the user enables that game's "Native XML Services" option, as
a compatibility substitute for Wine's builtin msxml3 (which crashes some games
while they save settings through the MSXML DOM). The files are Microsoft
proprietary software distributed under the redistribution terms of the MSXML
redistributable package; they are not open source and no source is available
or provided.

### Microsoft .NET Framework 4.8 and 4 (downloaded by each user's copy, not bundled)

BridgePlay gives every Wine environment the .NET Framework, as a Windows PC has
it. In the background, when the app starts, it downloads Microsoft's freely
redistributable .NET Framework 4.8 offline installer
(`ndp48-x86-x64-allos-enu.exe`, from
<https://download.visualstudio.microsoft.com/download/pr/7afca223-55d2-470a-8edc-6a1739ae3252/abd170b4b0ec15ad0222a809b761a036/ndp48-x86-x64-allos-enu.exe>)
and the .NET Framework 4 full redistributable (`dotNetFx40_Full_x86_x64.exe`,
from
<https://download.microsoft.com/download/9/5/A/95A9616B-7A37-4AF6-BC36-D6EA96C8DAAE/dotNetFx40_Full_x86_x64.exe>)
directly from Microsoft's servers, verifies each against the SHA-256 pinned in
`RuntimeSources.lock.json`, and installs from them into each environment's
Wine prefix at its next setup with nothing of it running. The 4 package is
used only as the source of `mscoree.dll` / `mscorees.dll` (its
`Windows6.1-KB958488-v6001-x64.msu` payload), which are Windows components the
4.8 package does not carry; both packages are downloaded and used. The
framework replaces wine-mono, whose JIT rejects the obfuscated IL some
launchers ship and whose WPF draws only some windows; it does not touch any
game's own protection or licence checks.

Each package comes with Microsoft's own terms, its English `1033/eula.rtf`,
reproduced verbatim (converted to plain text) in this folder:

- **Microsoft .NET Framework 4.8** (the installer) -- "Microsoft Software
  Supplemental License Terms: .NET Framework and Associated Language Packs for
  Microsoft Windows Operating System": `licenses/microsoft-dotnet-framework/NET-Framework-4.8-Supplemental-Terms.txt`
  (`eula.rtf` SHA-256 `4399b24e…c31855d`,
  `LicenseRef-Microsoft-NET-Framework-4.8-Supplemental-Terms`). Its data
  processing terms are at <http://go.microsoft.com/fwlink/?LinkId=867296>.
- **Microsoft .NET Framework 4 redistributable** -- "Microsoft Software
  Supplemental License Terms: Microsoft .NET Framework 4 for Microsoft Windows
  Operating System, Microsoft .NET Framework 4 Client Profile for Microsoft
  Windows Operating System and Associated Language Packs", which include
  Microsoft's .NET Framework benchmark-testing terms:
  `licenses/microsoft-dotnet-framework/NET-Framework-4-Supplemental-Terms.txt`
  (`eula.rtf` SHA-256 `da3d6a6a…232ea3b4`,
  `LicenseRef-Microsoft-NET-Framework-4-Supplemental-Terms`). The
  benchmark-testing conditions are at
  <http://go.microsoft.com/fwlink/?LinkID=66406>.

Both grant use of the supplement to those licensed to use Microsoft Windows.
The packages are Microsoft proprietary software used under the terms above;
they are not open source, no source is available or provided, and nothing from
them is bundled in or distributed with the app. Each user's copy is fetched
from Microsoft's servers on that user's machine.

### rosettax87

An x87 floating-point compatibility helper for running 32-bit x86 Windows code
under Rosetta. **It statically links Berkeley SoftFloat Release 3e.** Because
SoftFloat is compiled into the shipped binary (it has no file of its own),
BSD-3-Clause clause 2 requires reproducing its notice in the documentation that
accompanies the distribution, which is done here.

#### Berkeley SoftFloat Release 3e — BSD-3-Clause

```
Copyright 2011, 2012, 2013, 2014, 2015, 2016, 2017 The Regents of the
University of California.  All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
    this list of conditions, and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions, and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

 3. Neither the name of the University nor the names of its contributors may
    be used to endorse or promote products derived from this software without
    specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS "AS IS", AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE, ARE
DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

### winerosetta2

`bpcompat.dll` / `bpcompat.exe` — a Windows-side shim for per-game DLL
injection and x87-instruction emulation. It ships under a BridgePlay filename
because it sits in the player's own game folder, but it is the same code and the
attribution below is unchanged: the upstream project is named in full, as the
licence requires, and only the filename differs. Its ARPL/FCOMP exception-handler
emulation is **derived from [winerosetta2 by blinkysc](https://github.com/blinkysc/winerosetta2)**,
itself based on **WineRosetta by Lifeisawful**, and is used here under the **MIT
License**. BridgePlay's changes (a pure-C mingw port and the in-process helpers
described in `winerosetta2.cpp`) are layered on top; the MIT notice below is
preserved as that license requires. Full text: `licenses/winerosetta2/LICENSE.md`.

```
MIT License

Copyright (c) 2025 blinkysc
Copyright (c) 2024 Lifeisawful (Original WineRosetta Implementation)
Copyright (c) 2026 Dor Shemesh / BridgePlay (modifications)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction … (full text in licenses/winerosetta2/LICENSE.md)
```
