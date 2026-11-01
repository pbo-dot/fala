# CLAUDE.md

Projektkontekst og regler for Claude Code.

## Formål

Fala er en lille app (PWA) til eget brug, der lærer ejeren lidt **portugisisk fra Portugal** (ikke brasiliansk) til ferien. Ejeren er "absolut ikke god til at lære sprog": ingen grammatik, ingen lange gloselister, kun det man får brug for. Fem minutter om dagen, og en parlør, der virker på ferien.

Udkast: `docs/forslag-fala.png` og `docs/forslag-fala-mork.png` (kilde: `docs/forslag-fala.html`, bruger Kiks stil i `docs/kik-stil.css`). Første udgave er bygget efter udkastet (november 2026).

## Funktioner (fra udkastet)

1. **I dag (5 minutter):** én sætning ad gangen: Hør, Langsomt, Sig det (talegenkendelse pt-PT siger, om den forstod dig), så "Kunne den" / "Igen". Gentagelse styres af FSRS (`ts-fsrs`, MIT). Fremskridt som prikker, og nedtælling til ferien ("12 dage til Lissabon"), hvis der er sat en dato.
2. **Parlør:** situationer som fliser: Om mig, Hverdagsord, Høflighed, Café, Restaurant, Butik, Find vej, Hjælp!. Hver linje: portugisisk, udtale skrevet til danskere (fx "uma BII-ka, pur fa-VOR"), dansk, og en Hør-knap. Indbygget og virker uden net.
3. **Om mig:** ejeren skriver sine oplysninger (navn, alder, arbejde, hjemby), og Fala laver præsentationen: "Olá, chamo-me …", "Sou dinamarquês", "Tenho … anos", "Trabalho como …" / "Estou reformado", "Estou de férias", "Sou de …". Oversættes én gang med Claude og gemmes.
4. **Hverdagsord:** ca. 40 almindelige ord med artikel: mad og drikke (o leite, os ovos, a cerveja, o vinho tinto/branco, o pão, o café/a bica, a água, o queijo, a manteiga, o peixe, a carne, a fruta …), tal 1–20, dage, tider, i butikken.
5. **Sig det for mig:** skriv eller sig noget på dansk → Claude giver det på portugisisk fra Portugal med udtale, Hør og "Vis stort" (til at vise tjeneren), og en kort note, når Portugal og Brasilien siger det forskelligt ("casa de banho", ikke "banheiro"). "+ Læg i min parlør" gemmer sætningen og tager den med i øvningen.

## Opbygning (som Kik og Dagbog)

- React + TypeScript + Vite, `vite-plugin-pwa`, GitHub Pages via GitHub Actions. Ingen server; alt gemmes på telefonen (IndexedDB/localStorage).
- Indholdet (sætninger, ord, udtale) ligger som data i appen og skal være korrekt **europæisk portugisisk**. Tjek udtalen omhyggeligt (fx endelser "-s" udtales "sj", tryk på store bogstaver).
- Oplæsning: `speechSynthesis` med en `pt-PT`-stemme (vælg en stemme, hvis lang starter med `pt-PT`; ikke `pt-BR`). "Langsomt" = lavere `rate`.
- Udtaletjek: `SpeechRecognition` med `lang = 'pt-PT'`, sammenlign det hørte med sætningen løst (små bogstaver, uden tegn). Kræver net i Chrome. Vær venlig: "Næsten! Du sagde …".
- Claude (ejerens egen nøgle, som i Kik) kun til "Sig det for mig" og "Om mig". Standardmodel `claude-sonnet-5-5`, `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`), struktureret svar (portugisisk, udtale, dansk, note). Forbrug som skøn i kroner.

## Sådan er koden delt op

- `src/data/phrases.ts`: alt indbygget indhold (Høflighed, Café, Restaurant, Butik, Find vej, Hjælp!, Hverdagsord), med udtale og noter om Portugal/Brasilien. Udtaleregler står øverst i filen.
- `src/srs.ts`: dagens øvelse med FSRS. Først kort, der skal gentages, så nye i rækkefølgen Høflighed → Om mig → Min parlør → Café → … → Hverdagsord. "Igen" sætter kortet tilbage i køen.
- `src/speech.ts`: oplæsning (pt-PT-stemme) og udtaletjek (løs sammenligning; "Godt sagt" ≥ 80 %, "Næsten" ≥ 50 %).
- `src/claude.ts` (hentes først ved brug via `src/ai.ts`): "Sig det" og "Om mig". Officiel SDK i browseren, struktureret JSON-svar, `effort: low`, forbrug i kroner (Sonnet 5.5: 2 $/10 $ pr. mio. tokens, kurs 6,9).
- `src/store.ts`: alt gemmes i localStorage (`fala-v1`): indstillinger, Om mig, Min parlør, FSRS-kort, forbrug.
- Skærme i `src/screens/`: I dag, Parlør, Om mig, Sig det, Indstillinger (knap øverst i I dag: feriedato, sted, antal om dagen, nøgle, tema) og Det har jeg lært (`#/laert`, kalender-knap øverst i I dag).
- **Det har jeg lært:** hver gang man trykker "Kunne den", gemmes sætningen under dagens dato i `log` (én gang pr. dag). Når dagens øvelse er klaret, vises listen "Det lærte du i dag". Skærmen `Learned.tsx` viser dag for dag med dag-knapper (Alle, I dag, I går, …) og søgning på dansk/portugisisk/udtale. Forslag: `docs/forslag-laert.png`.

## Byg og udgivelse

- `npm run build` og `npm run lint` før commit. Browsertest med `npx vite preview` og Playwright (falsk Claude-API via `page.route('https://api.anthropic.com/**')`), lys og mørk tilstand.
- Læg ændringer på `main`. GitHub Actions udgiver til GitHub Pages (Settings → Pages → Source: GitHub Actions; det skal ejeren slå til).

## Om ejeren

- Tester alt på sin Pixel (Chrome). Har også appene Kik (pbo-dot/kik), Dagbog (pbo-dot/dagbog) og Lukker. Fala må ikke ændre dem.
- Kan lide små trin, en anbefaling og et billede først. Claude foreslår, ejeren godkender.

## Arbejdsform med ejeren

- Skriv på dansk, kort og i almindeligt sprog. Ejeren er ikke programmør.
- Nye funktioner drøftes og godkendes (gerne med et billede først), før de bygges. Fejlrettelser må laves med det samme.
- **Nye, ukendte funktioner:** undersøg kendte løsninger, sammenlign kort 2–3 fremgangsmåder, vælg den mest gennemprøvede med åben licens, og hold appen let.
- **Forslag undervejs:** kom løbende med korte forslag med en anbefaling og en rækkefølge; bygges først efter ejerens ja.
- Ejerens design- og arbejdsregler er fælles for alle ejerens apps; Dagbogs CLAUDE.md (pbo-dot/dagbog) er forbilledet.
- Sig til med link, når en ændring er ude, og vær ærlig om, hvad der kun kan testes på telefonen (tale, oplæsning, mikrofon).

## Design (top-design anno 2026)

- Material 3 Expressive i ånden, samme stil som Kik (se `docs/kik-stil.css`), egen farve gerne azulejo-blå.
- Stor, letlæselig skrift og stærk kontrast; lys og mørk tilstand skal begge se godt ud.
- Store trykflader (mindst 44–48 px), runde knapper: fyldt, tonal og tekst.
- Kort uden kanter, store runde hjørner, god luft, ensartede streg-ikoner. Ingen emojis som ikoner.
- Korte tekster. Bløde overgange, og respektér "reducer bevægelse".
- Vis altid et visuelt forslag i lys og mørk tilstand, før nye skærme eller større ændringer bygges.

## Færdig-tjekliste (før ejeren får besked)

- [ ] `npm run build` og `npm run lint` uden fejl.
- [ ] Browsertest kørt, og skærmbillederne set (lys og mørk).
- [ ] CLAUDE.md opdateret, hvis noget nyt er bygget.
- [ ] Skubbet til `main`, og GitHub Pages-byggeriet er grønt.
- [ ] Ejeren har fået linket og en ærlig besked om, hvad der kun kan testes på telefonen.
