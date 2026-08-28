/* ============================================================
   English — the master dictionary and the fallback.

   `Dictionary` is derived from this object (see ../types.ts), so every other
   locale file is structurally checked against it: add a key here and `tsc -b`
   fails until all six translations have it. That failure is the feature. Never
   silence it by widening the type or by adding `?` — see I18N.md.

   Values that take a runtime argument are functions, so a translator can move
   the placeholder to wherever their grammar puts it instead of being stuck
   with English word order.
   ============================================================ */

const en = {
    common: {
        backToBridgePlay: '← Back to BridgePlay',
        backToHome: '← Back to home',
        skipToContent: 'Skip to content',
        loading: 'Loading',
        scrollToTop: 'Scroll to top',
        latest: 'Latest',
        also: 'Also',
        unavailable: 'Unavailable',
        copy: 'Copy',
        copyAria: (label: string) => `Copy ${label}`,
    },

    language: {
        /* Names the control for screen readers; the visible trigger is the
           two-letter code plus a globe, which needs no translation. */
        label: 'Language',
        choose: 'Choose a language',
        current: (name: string) => `Current language: ${name}`,
        alsoAvailable: 'Also available in',
        dismissSuggestion: 'Dismiss',
    },

    nav: {
        features: 'Features',
        howItWorks: 'How It Works',
        pricing: 'Pricing',
        faq: 'FAQ',
        changelog: 'Changelog',
        login: 'Login',
        download: 'Download',
        requirements: 'Requirements',
        /* Shown as the CTA title when we know the visitor is not on a Mac. */
        unsupportedCtaTitle: 'BridgePlay is a macOS app — see what it needs to run',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
    },

    footer: {
        tagline: 'Play the Windows games you already own on your Mac. Built for Apple Silicon.',
        product: 'Product',
        legal: 'Legal',
        support: 'Support',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        refund: 'Refund Policy',
        notices: 'Third-Party Notices',
        account: 'Account',
        limitations: 'Known limitations',
        contact: 'Contact',
        copyright: '© 2026 BridgePlay. All rights reserved.',
        madeFor: 'Made for Mac gamers everywhere',
        disclaimerBody: 'BridgePlay is an independent product, not affiliated with or endorsed by Microsoft, Apple, Valve, the Wine project, or any game publisher. Windows and DirectX are trademarks of Microsoft Corporation; Apple, Mac, macOS and Rosetta are trademarks of Apple Inc. All other trademarks are the property of their respective owners.',
        disclaimerLink: 'Third-party notices',
    },

    hero: {
        titleLine1: 'Windows Games.',
        titleLine2: 'Your Mac.',
        lede: 'BridgePlay runs the Windows games you already own on your Mac. It sets each one up for you — no dual boot, no virtual machine, nothing to configure.',
        platformNoteStrong: 'BridgePlay is a macOS app for Apple Silicon Macs.',
        platformNoteRest: 'There is no Windows, Linux, iOS or Android build. Open this page on an M-series Mac and the download is here.',
        whatItNeeds: 'What it needs to run',
        downloadNow: 'Download Now',
        learnMore: 'Learn More',
        fineLink: 'Requirements, and what to do if macOS blocks it',
        ctaNote: 'Free to download · No card to try it',
        statTrialValue: '7 Days',
        statTrialLabel: 'Free Trial',
        statSiliconValue: 'Apple Silicon',
        statSiliconLabel: 'M1 and Later',
        statUpdatesValue: 'Auto',
        statUpdatesLabel: 'Updates',
        caption: 'Native on Apple Silicon · Automatic per-game setup · macOS 14+',
        screenshotAlt: 'The BridgePlay library on macOS: five installed games in a grid, with the detail panel for Aetherium Online open and ready to launch',
    },

    features: {
        label: 'Features',
        title: 'Everything You Need to Game on Mac',
        description: 'The runtime has to be set up differently for almost every game. BridgePlay is the part that does that for you — you get a library and a Launch button.',
        items: {
            oneClick: {
                title: 'One-Click Launch',
                desc: 'Add a game once, then start it from your library with a single click. No Terminal, no config files to edit by hand.',
            },
            setup: {
                title: 'Set Up For You',
                desc: 'Point BridgePlay at a game folder and it finds the .exe — the Windows program file — and picks settings that suit that game.',
            },
            updates: {
                title: 'Automatic Updates',
                desc: 'BridgePlay checks for a newer version of itself each time it starts and offers to install it — no manual download, nothing to drag. Your games are never touched.',
            },
            library: {
                title: 'Game Library',
                desc: 'Keep your collection in one place with your own categories, and settings saved separately for each game.',
            },
            silicon: {
                title: 'Built for Apple Silicon',
                desc: 'The launcher itself is a native app for M-series Macs. The games stay Windows Intel builds, so they run through Apple’s Rosetta 2 translator.',
            },
            multi: {
                title: 'Several Games at Once',
                desc: 'Run more than one game at a time. Switch between them with hotkeys, mute or solo each game’s audio, and stay in control of every window.',
            },
        },
    },

    whatsNew: {
        label: "What's New",
        title: 'Better With Every Release',
        description: 'Every release gets written up. These are the most recent ones, straight from the changelog.',
        more: (count: number) => `+${count} more`,
        viewAll: 'View full changelog',
    },

    howItWorks: {
        label: 'Getting Started',
        title: 'Up and Running in Minutes',
        description: 'Four steps from downloading BridgePlay to launching a game you already own.',
        steps: {
            download: {
                title: 'Download',
                desc: 'Download BridgePlay for free and drag it to your Applications folder.',
            },
            signUp: {
                title: 'Sign Up in the App',
                desc: 'Open BridgePlay and create your account on first launch — that is where your 7-day trial is claimed. No credit card required.',
            },
            addGames: {
                title: 'Add Your Games',
                desc: 'Point BridgePlay at a folder that already has a Windows game in it.',
            },
            play: {
                title: 'Play',
                desc: 'Press Launch. BridgePlay starts the game with its own settings, then stays out of your way.',
            },
        },
    },

    compatibility: {
        label: 'Compatibility',
        title: "What Runs, and What Doesn't",
        /* THE canonical gloss of "Wine" on this site. Other surfaces name Wine
           without explaining it and link here — keep it that way. */
        description: 'BridgePlay carries its own copy of Wine — the open-source project that lets Windows programs run without Windows — at version 11.0, built from upstream source and left unmodified. Games that use DirectX 8 through 11 work. DirectX 12 does not, and neither do games guarded by kernel-level anti-cheat.',
        items: {
            directx: {
                title: 'DirectX 8, 9, 10 & 11',
                desc: 'DirectX is how Windows games draw. Wine’s own wined3d converts it to OpenGL, which macOS draws with Metal.',
            },
            stockWine: {
                title: 'Stock Wine 11.0, From Source',
                desc: 'No Proton fork, no DXVK (the pieces Valve ships on Steam Deck), nothing closed-source — the same Wine anyone can build.',
            },
            protected: {
                title: 'Copy-Protected Clients Handled',
                desc: 'Some game clients ship inside Themida, a copy-protection wrapper that crashes under Rosetta 2. BridgePlay turns on an x87 (legacy floating-point) emulator for those.',
            },
            display: {
                title: 'Per-Game Display Control',
                desc: 'Windowed, fullscreen, or a virtual display — the game gets its own screen inside a window. Resolution can be overridden.',
            },
            settings: {
                title: 'Per-Game Settings',
                desc: 'Whatever you change is remembered for that one game, not applied across your library.',
            },
        },
        fit: {
            goodLabel: 'Runs well',
            goodItems: ['Games from the 2000s and 2010s', 'Online worlds and MMO clients', 'Indie and 2D games', 'Anything that ran on an older Windows PC'],
            badLabel: 'Don’t expect it to run',
            badItems: ['Big-name releases from the last few years', 'Competitive shooters with anti-cheat', 'Anything built only for DirectX 12'],
            note: 'Not sure which yours is? That is exactly what the free 7-day trial is for.',
        },
        visualLabel: 'Supported Technologies',
        specs: {
            /* Entry text is mostly product names and version numbers. Translate
               the group labels and the few prose entries; leave the rest. */
            graphics: {
                label: 'Graphics',
                entries: ['DirectDraw & DirectX 8', 'DirectX 9', 'DirectX 10', 'DirectX 11', 'wined3d → OpenGL → Metal'],
            },
            display: {
                label: 'Display',
                entries: ['Windowed & Fullscreen', 'Virtual Display', 'Resolution Overrides'],
            },
            runtime: {
                label: 'Runtime',
                entries: ['Wine 11.0 (source-built)', 'WoW64 (32-bit games, 64-bit Wine)', 'Intel games via Rosetta 2', 'Automatic per-game setup'],
            },
        },
        limitLink: 'What doesn’t work',
    },

    /* One catalogue for all three surfaces that sell plans — the marketing
       Pricing section, /plans and the in-app /app-checkout. Before this existed
       the same words were written out three times and had already drifted. The
       non-translatable half (price ids, amounts, ordering) is in lib/plans.ts. */
    plans: {
        monthly: {
            name: 'Monthly',
            save: 'Auto-renews monthly',
            cta: 'Subscribe',
            features: [
                'Every feature — no gated settings',
                'Automatic app updates',
                'Billed $6.99 every month',
                'Cancel anytime; access runs to the end of the month you paid for',
            ],
        },
        yearly: {
            name: 'Yearly',
            save: 'Save 52% vs monthly',
            cta: 'Subscribe',
            features: [
                'Every feature — no gated settings',
                'Automatic app updates',
                'Billed $39.99 every 12 months',
                'Cancel anytime; access runs to the end of the year you paid for',
            ],
        },
        lifetime: {
            name: 'Lifetime',
            save: 'Pay once — no renewals',
            cta: 'Buy',
            features: [
                'Every feature — no gated settings',
                'All future updates included',
                'One payment of $59.99',
                'No recurring charges, nothing to cancel',
            ],
        },
    },

    pricing: {
        label: 'Pricing',
        title: 'Simple, Honest Pricing',
        description: 'Every plan unlocks the same app — they differ only in how you pay. The free 7-day trial is separate: it starts inside the app on first launch, with no card and nothing to cancel.',
        mostPopular: 'Most Popular',
        availableAtLaunch: 'Available at Launch',
        availableAtLaunchTitle: 'Available at launch',
        /* Legal disclosure — renewal cadence and the money-back window. Keep
           every term when translating. */
        footerSignedIn: 'These open Paddle checkout and charge the full amount today · 7-day money-back guarantee · monthly and yearly plans renew automatically until you cancel',
        footerSignedOut: 'These take you to sign-in first, then to Paddle checkout for the full amount · 7-day money-back guarantee · monthly and yearly plans renew automatically until you cancel',
        footerPaused: 'Plans open for purchase at launch',
    },

    faq: {
        label: 'FAQ',
        title: 'Frequently Asked Questions',
        description: 'What BridgePlay is, which Macs it needs, what it cannot run, and how the trial and billing work.',
        items: {
            whatIs: {
                q: 'What is BridgePlay?',
                a: 'BridgePlay is a macOS app that runs Windows games on your Mac. It bundles Wine 11.0 — stock, unmodified and built from source — and sets it up for each of your games so you do not have to.',
            },
            whichMacs: {
                q: 'Which Macs are supported?',
                a: 'BridgePlay requires an Apple Silicon Mac (M1 or later) running macOS 14 (Sonoma) or newer, with Rosetta 2 installed. Intel Macs are not supported.',
            },
            multiplayer: {
                q: 'Does multiplayer work? What about anti-cheat?',
                a: 'Online play works; kernel-level anti-cheat does not. Easy Anti-Cheat, BattlEye, VAC and nProtect GameGuard each need a Windows kernel driver, and there is none here to load into. The private-server clients BridgePlay is built and tested against protect themselves differently, which is why they do run. Full reasoning on the limitations page.',
            },
            directx12: {
                q: 'Is DirectX 12 supported?',
                a: 'No. BridgePlay covers DirectDraw and DirectX 8, 9, 10 and 11; a DirectX 12 game will not launch at all. The compatibility section above lists what the graphics path does cover.',
            },
            performance: {
                q: 'Will my games run well?',
                a: 'Performance varies by game. Many games run very well, especially older titles and indie games. More demanding titles may require lower graphics settings. Use the 7-day free trial to test your specific games before you pay for anything.',
            },
            gameBroken: {
                q: "What if my game doesn't work?",
                a: 'Test it during the free trial first — that is what the trial is for, and it needs no card. If you have already paid, there is a 7-day money-back guarantee on every plan, Lifetime included. Contact us and we will fix it or refund you.',
            },
            ownGames: {
                q: 'Do I need to own the games?',
                a: 'Yes. BridgePlay is a launcher, not a game store. You need your own game files. Point BridgePlay to your existing game installations, and it handles the rest.',
            },
            legal: {
                q: 'Is this legal?',
                a: 'Yes. Wine is an open-source (LGPL) reimplementation of the Windows API and contains no Microsoft code, and BridgePlay ships no games. You supply your own legally obtained game files and play them on hardware you own.',
            },
            trial: {
                q: 'How does the free trial work?',
                a: 'Create your account inside the app on first launch — that is where the trial is claimed. You get 7 days of full access, no credit card. It is one trial per Mac: BridgePlay stores a one-way hash of your hardware ID, so reinstalling or making a new account resumes the original countdown rather than granting a fresh week.',
            },
            howManyMacs: {
                q: 'How many Macs can I use my licence on?',
                a: 'Your licence belongs to your account, not to one machine. Sign in on any Mac you personally own and it unlocks there — no activation limit, nothing to deactivate when you replace a Mac. Only the free trial is per-machine.',
            },
            /* Legal disclosure: price, renewal cadence, how to cancel, what
               happens to access. Shorten the wording if you like; do not drop a
               term when translating. */
            cancel: {
                q: 'How do I cancel?',
                a: 'Monthly ($6.99) and yearly ($39.99) plans renew automatically until you cancel. Cancel from the contact form below or the subscription link in your Paddle receipt. You keep access to the end of the period you already paid for and are not charged again. Lifetime is a single payment with nothing to cancel.',
            },
            offline: {
                q: 'Does BridgePlay work offline?',
                a: 'Mostly. BridgePlay keeps a signed local copy of your last licence check, so it works for up to 24 hours offline before it needs one online check. Games run entirely on your Mac; online games still need their own connection.',
            },
            stopPaying: {
                q: 'What happens to my games if I stop paying?',
                a: 'Nothing. The game files are yours, in your own folders, and BridgePlay never deletes or locks them. What stops is launching through BridgePlay, which needs an active subscription, a running trial or a Lifetime licence. Resubscribe and your library and per-game settings are exactly as you left them.',
            },
            rosetta: {
                q: 'Do I need Rosetta 2, and how long will it last?',
                a: 'Yes — BridgePlay will not launch a game without it, and the download page has the one command that installs it. Being straight about the platform: macOS 27 is the last release with full Rosetta 2, and macOS 28 narrows it to certain older, unmaintained games. We will not promise a migration path we have not shipped.',
            },
            refund: {
                q: 'Can I get a refund?',
                a: 'Yes. We offer a 7-day money-back guarantee on all plans. Use the contact form below and include your Paddle order ID or the email you paid with. See the refund policy for the full details.',
            },
            safe: {
                q: 'Is BridgePlay safe?',
                a: 'The app collects no telemetry and does not track what you play — only your email for sign-in and a one-way hash of your hardware ID for trial eligibility. Your games, saves and settings stay on your Mac. The website is separate: cookieless Vercel Analytics and a short list of named events, with no identifier attached. The privacy policy names every processor and every event.',
            },
        },
    },

    cta: {
        titleStart: 'Ready to',
        titleAccent: 'Play?',
        body: 'Get BridgePlay and launch your Windows library on your Mac today. The 7-day trial is free and starts in the app.',
        getForMac: 'Get BridgePlay for Mac',
        seePricing: 'See Pricing',
        note: 'Free 7-day trial, no card · Built for macOS 14+ · Apple Silicon',
    },

    contact: {
        label: 'Contact',
        title: 'Get in Touch',
        description: "Have a question, feedback, or need help? Send us a message and we'll get back to you.",
        name: 'Name',
        namePlaceholder: 'Your name',
        email: 'Email',
        emailPlaceholder: 'you@example.com',
        message: 'Message',
        messagePlaceholder: 'How can we help?',
        send: 'Send Message',
        sending: 'Sending...',
        sent: 'Sent!',
        successToast: "Message sent! We'll get back to you soon.",
        errorToast: 'Something went wrong. Please try again.',
    },

    downloadPage: {
        eyebrow: 'Download',
        title: 'BridgePlay for macOS',
        lede: 'One disk image. Drag BridgePlay into Applications, launch it, and point it at Windows game files you already have.',
        unsupportedNote: 'BridgePlay is a macOS app for Apple Silicon Macs. There is no Windows, Linux, iOS or Android build, so there is nothing here to install on this device — open this page again on an M-series Mac running macOS 14 or newer.',
        downloadAnyway: 'Download the disk image anyway',
        downloadForMac: 'Download for macOS',
        factSilicon: 'Apple Silicon',
        factOs: 'macOS 14 or newer',
        factTrial: '7-day free trial',
        fileCardTitle: 'The file you are getting',
        fileCardNote: 'Both values are computed at build time from the exact disk image this page serves.',
        size: 'Size',
        sha256: 'SHA-256',
        detailsMissing: 'The size and checksum could not be loaded, so there is nothing to compare your copy against this visit. The download link still serves the current disk image; reloading usually brings the values back.',
        verifyFineBefore: 'To check a download landed intact, run',
        verifyFineAfter: 'and compare it with the SHA-256 above.',
        bandLabel: 'Before you install',
        bandTitle: 'What your Mac needs',
        bandDescription: 'Hard requirements, the one command Rosetta 2 needs, and what to do about the first-launch warning. If your Mac misses a requirement, BridgePlay will not run — better to find out here than after the download.',
        requirementsTitle: 'Requirements',
        reqSiliconTerm: 'An Apple Silicon Mac',
        reqSiliconBefore: 'M1 or later — every Mac Apple has shipped since late 2020 has one. The Apple menu → About This Mac names your chip and your macOS version in one place. Intel Macs are not supported —',
        reqSiliconLink: 'the detail is on the limitations page',
        reqOsTerm: 'macOS 14 (Sonoma) or newer',
        reqOsDesc: 'The app declares macOS 14.0 as its minimum system version; older macOS releases will refuse to open it.',
        reqRosettaTerm: 'Rosetta 2',
        /* THE canonical explanation of Rosetta 2 on this site. */
        reqRosettaDesc: 'Rosetta 2 is Apple’s own translation layer: it lets software built for Intel processors run on an Apple Silicon Mac. The Windows runtime BridgePlay drives is Intel (x86_64) code, so Rosetta 2 is the piece that actually executes it. Without it the launcher reports “Rosetta required” and will not start a game.',
        reqDiskTerm: 'Free disk space',
        reqDiskBefore: 'BridgePlay keeps its runtime under',
        reqDiskAfter: 'and gives every game its own Windows prefix in there, on top of the game files themselves. Leave headroom on the volume.',
        reqGamesTerm: 'Your own game files',
        reqGamesDesc: 'BridgePlay is a launcher, not a game store. Bring the Windows installer or client folder you already have.',
        rosettaCardTitle: 'Install Rosetta 2',
        rosettaCardNote: 'Run this once in Terminal (Command-Space, type Terminal, Return), then launch BridgePlay. It is Apple’s own installer command, so macOS may ask you to confirm. Rosetta 2 is free and installs once per Mac.',
        rosettaCardFine: 'If Rosetta 2 is already on this Mac, running the command again does no harm.',
        gatekeeperTitle: 'If macOS says the app cannot be opened',
        gatekeeperWhatLabel: 'What is happening.',
        gatekeeperWhatBody: 'The app is signed with an Apple Developer ID certificate — proof it came from us and has not been modified since — but this release is not notarized, meaning it has not been through Apple’s automated malware scan. Gatekeeper finds no notarization ticket, treats the build as unverified, and asks for your explicit approval on first launch. Nothing about the app changes when you give it.',
        gatekeeperNotNotarized: 'not notarized',
        gatekeeperStep1: 'Open the disk image and drag BridgePlay into your Applications folder.',
        gatekeeperStep2: 'In Applications, Control-click (right-click) BridgePlay and choose Open, then confirm Open in the dialog that appears. Double-clicking is what triggers the refusal; this path asks instead.',
        gatekeeperStep3: 'If there is no Open option, try to launch it once so macOS records the block, then open System Settings → Privacy & Security, scroll to the Security section, and choose Open Anyway.',
        signatureNote: 'You do not have to take the signature on trust. This prints it, and the authority line should name a Developer ID Application certificate.',
        signatureFineBefore: 'If that line is missing, or names something other than us, do not open the app —',
        signatureFineLink: 'tell us',
        signatureFineAfter: 'instead.',
        outroBefore: 'Before you spend the trial on it, read what BridgePlay',
        outroLimitations: 'still cannot do',
        outroMiddle: '. Anything the',
        outroFaq: 'FAQ',
        outroDoesNotAnswer: 'does not answer goes to the',
        outroContact: 'contact form',
        copyLabelRosetta: 'the Rosetta 2 install command',
        copyLabelChecksum: 'the SHA-256 checksum',
        copyLabelSignature: 'the signature check command',
        copiedToast: 'Copied to clipboard',
        copyFailedToast: 'Copy failed — select the text and copy it manually',
        sizeFormat: (mb: string, bytes: string) => `${mb} MB (${bytes} bytes)`,
    },

    limitations: {
        eyebrow: 'Known limitations',
        title: 'What BridgePlay can’t do (yet)',
        lede: 'No compatibility layer on macOS runs everything. These four gaps are structural — the current state of the shipping runtime, not bugs waiting on a patch. Where there is a counter-position it is stated; where there is no fix, we say so.',
        anticheatTitle: 'Kernel-level anti-cheat does not work',
        anticheatP1Before: 'Anti-cheat of this kind works by installing a driver into the Windows',
        anticheatKernel: 'kernel',
        anticheatP1After: '— the most privileged layer of an operating system, sitting underneath every ordinary app — so that it can watch the whole machine for cheating tools.',
        anticheatP2: 'BridgePlay runs your game entirely in user space, as a normal unprivileged app. It installs no kernel extension, no system extension and no driver of any kind, so anti-cheat that expects to load a Windows kernel driver has nothing to load into.',
        anticheatChipsLabel: 'Assume these do not run',
        anticheatP3: 'On screen this looks like a game that refuses to start, quits by itself within seconds, or reaches the menus and fails the moment it tries to put you in a match. Assume these titles do not run, and test yours during the trial before paying us anything. No setting changes it, and nothing we could ship would — a launcher cannot hand a Windows driver a macOS kernel.',
        anticheatCounter: 'The counter-position: the multiplayer BridgePlay is built around is private-server clients, and those do run. They are the titles the launcher tunes per game, from network handling for clients whose resolver fails to the x87 emulator injected into packed clients that fault under Rosetta 2. If your multiplayer is a private server, this limitation costs you nothing.',
        dx12Title: 'DirectX 12 and bleeding-edge AAA are out of reach',
        dx12Blunt: 'The honest gap is exactly one tier — bleeding-edge DirectX 12 AAA — and this runtime does not reach it.',
        dx12P1: 'The graphics path covers DirectX 8 through 11, and covers DirectX 12 not at all — there is no DXVK and no VKD3D layered on top to change that. Older titles, indie games and the 2D/3D clients our players actually run are the sweet spot; a current AAA release with a D3D12-only renderer will not start, and no amount of per-game settings will change it.',
        dx12P2: 'Demanding DirectX 11 titles are a different question — they may run, at lower settings, or run badly. That is what the trial is for.',
        intelTitle: 'Intel Macs are not supported, at all',
        intelP1: 'Not “slower” — not supported. The app ships as a single arm64 binary, so there is no Intel build to install in the first place.',
        intelP2: 'The reason is the whole design: the Windows runtime BridgePlay drives is x86_64 — Intel code — and Rosetta 2 is what executes it. Rosetta 2 exists only on Apple Silicon, so an Intel Mac has neither the app nor the translation layer underneath it, and there is nothing to fall back to. The floor is an M1 or later on macOS 14 or newer, and that floor is not moving.',
        rosettaTitle: 'Rosetta 2 is on a clock',
        rosettaP1: 'Apple has stated that macOS 27 (fall 2026) is the last release with full Rosetta 2, and that macOS 28 (fall 2027) keeps it only for “certain older, unmaintained games that rely on Intel-based frameworks.” Apple’s timeline is therefore ours: the shelf life of the runtime as it stands today is set by macOS releases, not by anything we control.',
        rosettaP2Before: 'We are tracking it closely, and we are deliberately not promising you a migration path we have not shipped. What we will do is say what changed, when it changes: every release is written up in the',
        rosettaP2Link: 'changelog',
        outroNote: 'This page is not a compatibility list — we do not publish one yet, because a list we cannot keep honest is worse than none. Test your own games during the trial.',
        outroDownload: 'Download BridgePlay',
        outroFaq: 'Read the FAQ',
        outroContact: 'Ask us directly',
    },

    changelogPage: {
        eyebrow: 'Releases',
        title: 'Changelog',
        lede: 'What’s new in BridgePlay — every update, documented, newest first.',
        releaseCount: (n: number) => `${n} ${n === 1 ? 'release' : 'releases'}`,
        currentVersion: (v: string) => `current version v${v}`,
        errorTitle: 'Release notes could not be loaded',
        errorBody: 'The list lives in a file this page fetches, and that request failed — which is a problem with this page, not with your copy of BridgePlay. Reloading usually fixes it. The app itself always shows the version it is running in its own window.',
        emptyTitle: 'No releases listed yet',
        emptyBody: 'Nothing has been published to this page so far. It fills in from the release notes as versions ship.',
        alsoDownload: 'Download BridgePlay',
        alsoLimitations: 'Known limitations',
        alsoFaq: 'FAQ',
    },

    notFound: {
        title: 'Page Not Found',
        bodyBefore: 'Nothing lives at',
        bodyAfter: '. The link was probably mistyped, or the page moved — nothing is wrong with your copy of BridgePlay.',
        backHome: 'Back to Home',
        downloadApp: 'Download BridgePlay',
        linksIntro: 'Looking for something specific? Try the',
        linkDownload: 'download page',
        linkLimitations: 'known limitations',
        linkChangelog: 'changelog',
        linkFaq: 'FAQ',
        linkPricing: 'pricing',
        linkAccountBefore: 'or',
        linkAccount: 'your account',
    },

    account: {
        resetTitle: 'Reset Password',
        resetSubtitle: "Enter your email and we'll send you a link to reset your password.",
        resetSent: 'Reset link sent! Check your inbox and spam folder.',
        sendResetLink: 'Send Reset Link',
        sendingResetLink: 'Sending...',
        backToSignIn: 'Back to Sign In',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        createAccount: 'Create Account',
        signInSubtitle: 'Sign in to view your account details.',
        signUpSubtitle: 'Sign up to start your 7-day free trial.',
        email: 'Email',
        emailPlaceholder: 'you@example.com',
        password: 'Password',
        passwordPlaceholder: 'Your password',
        forgotPassword: 'Forgot password?',
        signingIn: 'Signing in...',
        creatingAccount: 'Creating account...',
        or: 'or',
        continueWithGoogle: 'Continue with Google',
        haveAccount: 'Already have an account? ',
        noAccount: "Don't have an account? ",
        eyebrow: 'Account',
        memberSince: (date: string) => `Member since ${date}`,
        signOut: 'Sign out',
        licenseCard: 'License',
        rowTrial: 'Trial',
        rowPlan: 'Plan',
        rowRenews: 'Renews',
        rowExpires: 'Expires',
        rowLength: 'Length',
        quickActions: 'Quick Actions',
        choosePlan: 'Choose a Plan',
        changePlan: 'Change Plan',
        cancelSubscription: 'Cancel Subscription',
        cancelPrompt: (until: string) => `Cancel your subscription? You keep access until ${until}.`,
        cancelPromptFallback: 'the end of the period you paid for',
        yesCancel: 'Yes, cancel it',
        keepSubscription: 'Keep my subscription',
        cancelling: 'Cancelling…',
        downloadApp: 'Download BridgePlay',
        footnoteBefore: 'Installing on a new Mac?',
        footnoteLink: 'Requirements, checksum and first-launch steps',
        statusLicensed: 'Licensed',
        statusNewAccount: 'New Account',
        statusTrialExpired: 'Trial Expired',
        statusNoTrial: 'No Trial',
        statusPending: 'Pending',
        statusErrorLoading: 'Error loading',
        daysLeft: (n: number) => `${n} day${n === 1 ? '' : 's'} left`,
        daysRemaining: (left: number, total: number) => `${left} of ${total} days remaining`,
        trialLength: (days: number, endDate: string) => `${days}-day trial · ends ${endDate}`,
        planMonthly: 'Monthly plan',
        planYearly: 'Yearly plan',
        planLifetime: 'Lifetime license',
        planActive: 'Active subscription',
        planFreeTrial: 'Free trial',
        planNone: 'No active plan',
        trialNotStarted: 'Not started — sign in from the app to activate it',
        trialNotStartedNew: 'Not started — sign in from the app to activate it. New Macs get 7 days free.',
        trialExpired: 'Expired',
        toastAccountCreated: 'Account created! Welcome to BridgePlay.',
        toastSignedIn: 'Signed in successfully!',
        toastSignedInGoogle: 'Signed in with Google!',
        toastSignedOut: 'Signed out.',
        toastCancelled: 'Subscription cancelled. Access continues until the end of the period you paid for.',
        toastCancelUnavailable: 'Cancellation is not available right now. Email support and we will cancel it for you.',
        toastCancelFailed: 'Could not cancel the subscription. Please try again.',
        toastNetwork: 'Could not reach the server. Check your connection and try again.',
    },

    plansPage: {
        backToAccount: '← Back to account',
        title: 'Choose Your Plan',
        sub: 'Every plan unlocks the same app — they differ only in how you pay.',
        currentMarked: ' Your current plan is marked below.',
        currentBadge: 'Current plan',
        currentPlanCta: 'Current Plan',
        includedInLifetime: 'Included in Lifetime',
        includedTitle: 'Included in your lifetime license',
        signInToBuy: 'Sign in to buy',
        footnoteBefore: 'Secure checkout by Paddle · 7-day money-back guarantee · Subscriptions can be cancelled any time from your',
        footnoteLink: 'account',
        footnoteAfter: '.',
    },

    authAction: {
        checking: 'Checking your link…',
        setNewPassword: 'Set a new password',
        forEmail: 'for',
        newPassword: 'New password',
        newPasswordPlaceholder: 'At least 6 characters',
        confirmPassword: 'Confirm password',
        confirmPasswordPlaceholder: 'Repeat the password',
        updatePassword: 'Update Password',
        updating: 'Updating…',
        goToSignIn: 'Go to Sign In',
        doneHint: 'Using the Mac app? Open BridgePlay and sign in there with your new password.',
        invalidTitle: 'Link not valid',
        requestNewLink: 'Request a New Link',
        invalidHintBefore: 'On the sign-in page, enter your email and click',
        invalidHintForgot: 'Forgot password?',
        invalidHintAfter: 'to get a fresh link. Links are single-use and expire after a short time.',
        passwordTooShort: 'Password must be at least 6 characters.',
        passwordsDoNotMatch: 'Passwords do not match.',
        doneUpdatedTitle: 'Password updated',
        doneUpdatedBody: 'Your new password is active. Sign in with it in the BridgePlay app — or below to check your account.',
        doneVerifiedTitle: 'Email verified',
        doneVerifiedBody: 'Your email address has been verified. You can close this page.',
        doneRevertedTitle: 'Email change reverted',
        doneRevertedBody: 'Your account email has been restored. If you did not request the change, reset your password now.',
        errExpired: 'This link has expired. Request a new one and use it within an hour.',
        errInvalid: 'This link is invalid or has already been used.',
        errDisabled: 'This account has been disabled.',
        errNotFound: 'This account no longer exists.',
        errIncomplete: 'This link is incomplete. Open the most recent email and use its button, or request a new link.',
        errUnrecognized: 'This link is not recognized. Request a new one from the sign-in page.',
    },

    appCheckout: {
        documentTitle: 'Upgrade BridgePlay',
        title: 'Choose your plan',
        subtitle: (who: string) => `Every plan unlocks the full app. Signed in as ${who}.`,
        yourAccount: 'your account',
        loading: 'Loading…',
        preparing: 'Preparing your checkout…',
        doneTitle: 'Purchase complete',
        doneBody: 'Your BridgePlay license is active. You can close this window and start playing.',
        footnote: 'Secure checkout by Paddle · 7-day money-back guarantee',
        testPlanName: 'Daily',
        testPlanNote: 'Internal test — Paddle confirms the amount',
        testPlanAccount: (price: string) => `${price}/day · internal test`,
    },

    legal: {
        eyebrow: 'Legal',
        openSourceEyebrow: 'Open source',
        onThisPage: 'On this page',
        lastUpdated: (date: string) => `Last updated ${date}`,
        sectionCount: (n: number) => `${n} ${n === 1 ? 'section' : 'sections'}`,
        readingTime: (minutes: number) => `about ${minutes} min to read`,
        sectionFallback: (n: number) => `Section ${n}`,
        /* The three policy documents and the notices page are the binding legal
           texts and are deliberately published in English only — a translated
           contract that disagrees with the original is worse than none. This
           banner says so on those routes. */
        englishOnlyNotice: 'This document is legally binding and is published in English only. Translations of the rest of the site are provided for convenience.',
    },

    authErrors: {
        invalidEmail: 'Please enter a valid email address.',
        userDisabled: 'This account has been disabled.',
        userNotFound: 'No account found with this email.',
        wrongPassword: 'Incorrect password. Try again.',
        invalidCredential: 'Invalid email or password.',
        emailInUse: 'An account with this email already exists.',
        weakPassword: 'Password must be at least 6 characters.',
        tooManyRequests: 'Too many attempts. Please try again later.',
        networkFailed: 'Network error. Check your connection.',
        generic: 'Something went wrong. Please try again.',
    },

    meta: {
        home: {
            title: 'BridgePlay — Play Windows Games on Your Mac',
            description: 'Run the Windows games you already own on an Apple Silicon Mac. BridgePlay is a native macOS launcher that sets up each game for you — no dual boot, no virtual machine. Free 7-day trial.',
        },
        download: {
            title: 'Download BridgePlay for macOS — Apple Silicon',
            description: 'Download BridgePlay for Apple Silicon Macs — M1 or later, macOS 14+. Includes the exact size and SHA-256 of the file served, the one Rosetta 2 command, and what to do if macOS blocks the first launch.',
        },
        limitations: {
            title: 'Known Limitations — BridgePlay',
            description: 'What BridgePlay cannot do today: kernel-level anti-cheat, DirectX 12 and bleeding-edge AAA, Intel Macs, and the Rosetta 2 timeline — stated plainly, before you buy.',
        },
        changelog: {
            title: 'Changelog — BridgePlay',
            description: 'Every BridgePlay release, documented — version-by-version notes for the macOS launcher that runs Windows games on Apple Silicon.',
        },
        account: {
            title: 'Account — BridgePlay',
            description: 'Sign in to your BridgePlay account to check your license status and manage your plan.',
        },
        plans: {
            title: 'Plans — BridgePlay',
            description: 'Choose the BridgePlay plan that fits: monthly, yearly, or a one-time lifetime purchase.',
        },
        authAction: {
            title: 'Reset Password — BridgePlay',
            description: 'Set a new password for your BridgePlay account.',
        },
        notFound: {
            title: 'Page Not Found — BridgePlay',
            description: "This page doesn't exist or has been moved. Head back to BridgePlay to play your Windows games on macOS.",
        },
        checkout: { title: 'Upgrade — BridgePlay' },
        privacy: { title: 'Privacy Policy — BridgePlay' },
        terms: { title: 'Terms of Service — BridgePlay' },
        refund: { title: 'Refund Policy — BridgePlay' },
        notices: { title: 'Third-Party Notices — BridgePlay' },
    },
};

/* Deliberately NOT `as const`: the derived Dictionary type must describe the
   SHAPE (string, string[], (x: string) => string), not English's exact literal
   values — otherwise no translation could ever satisfy it. */
export default en;
