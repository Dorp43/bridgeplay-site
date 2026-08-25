import LegalLayout from '../components/layout/LegalLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useI18n } from '../i18n/useI18n';

/* Public face of THIRD_PARTY_NOTICES.md in the app repo, which until now only
   shipped inside the disk image — i.e. was unreadable until after you had
   downloaded the thing whose licences you wanted to check first.

   This page is a SUMMARY. The authoritative document is the copy served at
   /third-party-notices.md (public/third-party-notices.md), which is the app
   repo's file verbatim. When the runtime changes, re-copy that file — see
   I18N.md's sibling note in CLAUDE.md. Nothing here may state a licence the
   full document does not. */
export default function Notices() {
    const { t } = useI18n();

    useDocumentMeta({
        title: t.meta.notices.title,
        description: 'The open-source components BridgePlay bundles, the licences they are used under, and where to get their source — Wine under the LGPL, FreeType under the FTL, and the runtime libraries shipped alongside them.',
        canonicalPath: '/notices',
    });

    return (
        <LegalLayout title="Third-Party Notices" lastUpdated="August 26, 2026" eyebrow={t.legal.openSourceEyebrow}>
            <p>BridgePlay is proprietary software that bundles an open-source Windows compatibility runtime. This page lists the third-party components that ship in the product and the terms they are included under. It is a summary: the authoritative document is the <a href="/third-party-notices.md">full third-party notices</a>, and the complete text of every licence named here is distributed with the app under <code>Contents/Resources/ThirdPartyNotices/licenses/</code>.</p>
            <p>Nothing described here is aspirational — the component list is read out of the assembled app bundle, not from a plan.</p>

            <h2>Wine</h2>
            <p><strong>Licence: LGPL-2.1-or-later.</strong> BridgePlay bundles <a href="https://www.winehq.org/" target="_blank" rel="noopener noreferrer">Wine</a> 11.0, built from upstream source and left unmodified. It ships as separate dynamic libraries under <code>Contents/Resources/Runtime/</code>, loaded at runtime rather than statically linked into BridgePlay's own binary, and you may replace them with a compatible build — the relinking right the LGPL reserves for you in section 6.</p>
            <p><strong>Source.</strong> The exact revision shipped is pinned by URL and SHA-256 in the app's build manifest. Corresponding source for that version is available from winehq.org, and from us on request through the <a href="/#contact">contact form</a>.</p>

            <h2>FreeType</h2>
            <p><strong>Licence: the FreeType License (FTL).</strong> FreeType 2.13.3 is built from pinned source as a shared library and loaded at runtime by Wine's <code>win32u</code>; it is not statically linked into the app binary. FreeType is offered under FTL or GPL-2.0-or-later, and this build elects the FTL.</p>
            <p>Credit required by the FTL: <strong>Portions of this software are copyright &copy; 2024 The FreeType Project (www.freetype.org). All rights reserved.</strong> This software is based in part on the work of the FreeType Team; the FreeType Project is copyright &copy; 1996&ndash;2024 David Turner, Robert Wilhelm and Werner Lemberg.</p>

            <h2>Runtime Libraries Bundled With Wine</h2>
            <p>The compatibility runtime carries its own dependencies: 26 further open-source projects, each shipped as a separate, unmodified dynamic library under <code>Contents/Resources/Runtime/lib/</code> and none statically linked into BridgePlay's binary. They fall under permissive, LGPL and mixed terms, and each one's full licence text ships with the app.</p>
            <p>Several of these projects carry a compound umbrella licence where a GPL term covers command-line tools this product does not ship, while the library — the only part bundled — is permissive or LGPL. The full notices document states the licence of each shipped library rather than the umbrella project licence, and lists every project by name and version.</p>

            <h2>Compatibility Shims</h2>
            <p><strong>rosettax87</strong> — an x87 floating-point compatibility helper for running 32-bit x86 Windows code under Rosetta 2. It statically links Berkeley SoftFloat Release 3e, whose BSD-style notice is reproduced in full in the notices document.</p>
            <p><strong>winerosetta2</strong> — a Windows-side shim for per-game DLL injection and x87-instruction emulation, used under the <strong>MIT License</strong>. Its exception-handler emulation is derived from <a href="https://github.com/blinkysc/winerosetta2" target="_blank" rel="noopener noreferrer">winerosetta2 by blinkysc</a>, itself based on WineRosetta by Lifeisawful. BridgePlay's own changes are layered on top and the upstream MIT notice is preserved, as that licence requires.</p>
            <p><code>mrwindowctl.exe</code> and <code>iphlpapi.dll</code> are built by BridgePlay from its own sources and carry no third-party notice.</p>

            <h2>Trademarks and Affiliation</h2>
            <p>BridgePlay is an independent product. It is <strong>not affiliated with, sponsored by, or endorsed by</strong> Microsoft Corporation, Apple Inc., Valve Corporation, the Wine project, or any game publisher or anti-cheat vendor named on this site.</p>
            <p>Windows, DirectX and Direct3D are trademarks of Microsoft Corporation. Apple, Mac, macOS, Apple Silicon, Metal and Rosetta are trademarks of Apple Inc. Steam and Steam Deck are trademarks of Valve Corporation. Easy Anti-Cheat is a trademark of Epic Games, Inc. BattlEye is a trademark of BattlEye Innovations. nProtect GameGuard is a trademark of INCA Internet. Themida is a trademark of Oreans Technologies. All other trademarks are the property of their respective owners, and are used here only to describe compatibility.</p>
            <p>BridgePlay does not include, distribute, or provide access to any game, and contains no Microsoft code.</p>
        </LegalLayout>
    );
}
