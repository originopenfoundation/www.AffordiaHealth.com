# Affordia Health: správa o implementácii

Stav: **prototyp, nie je pripravený na produkciu**. Úpravy sú uložené v samostatnej pracovnej vetve; neboli nasadené na verejný web ani do vetvy GitHub Pages. Pôvodné súbory `A` a `CNAME` neboli menené.

## Výsledky

| Stav | Oblasť | Výsledok |
| --- | --- | --- |
| PASS - lokálne | Zostavenie | `npm run build` úspešne vytvoril statický export cez Next.js. |
| PASS - lokálne | Existujúci obsah | Automatická kontrola overila 160 adries, štyri jazyky, 96 jazykových verzií 24 dokumentov a interné odkazy v exporte. |
| PASS - lokálne | Mobil a prehliadač | Otestovaných 7 šírok od 320 po 1280 px, 4 druhy stránok v 4 jazykoch, mobilné menu, 5 vzorových zákazníckych ciest, validácia, pridanie a odstránenie kontaktu, výber preferovaného kontaktu a zachovanie údajov pri výpadku siete. |
| PASS - lokálne | Backend | Skúšky s lokálnou SQLite overili šifrovanie, ukladanie, referenciu, viac kontaktov, opakované odoslanie, opätovné použitie tokenu, honeypot, limit požiadaviek, odmietnutie nadmerných dát a test chyby oznámenia. |
| CONDITIONAL | Oznámenie Gmail | Pripravené použitie Gmail API. Pri lokálnych testoch boli Google OAuth a Gmail simulované; skutočné odoslanie nebolo vykonané. Pri zlyhaní oznámenia sa zobrazí skutočný stav a referencia. |
| CONDITIONAL | SEO | JSON-LD, canonical, hreflang a sitemap boli overené v lokálnom exporte. Externý validátor, skutočná indexácia a návštevnosť neboli overené. |
| CONDITIONAL | Preklady a prístupnosť | Nové prvky sú dostupné v EN, DE, ES a zh-CN. Odborná jazyková korektúra a úplný audit WCAG 2.2 AA vrátane čítačky obrazovky neboli vykonané. |
| BLOCKED | Cloudflare a skutočné doručovanie | Cloudflare účet nie je v tomto prostredí prihlásený; nie sú overené Worker, D1, bezpečné routovanie ani OAuth oprávnenie Gmailu. |
| BLOCKED | Ochrana údajov a prevádzka | Treba určiť prevádzkovateľa, dobu uchovávania, prístup oprávnených osôb, správu šifrovacích kľúčov, zálohovanie, monitorovanie a postup pri zlyhaní oznámenia. Pred ostrým spustením je nutné právne a bezpečnostné posúdenie vrátane GDPR a švajčiarskeho FADP. |

## Čo je pripravené

Formulár podporuje meno, krajinu, 12 kategórií, ľubovoľný počet kontaktných spôsobov v rámci limitu veľkosti požiadavky, práve jeden preferovaný kontakt, dve textové polia a potvrdenie prečítania zásad ochrany údajov. Upozorňuje, aby návštevník neposielal diagnózy ani zdravotnú dokumentáciu. Pri nedostupnom serveri nepredstiera úspech a zachováva údaje vo formulári.

Bol pripravený prototyp Cloudflare Worker API s D1, ktorý ukladá údaje zašifrovane, používa krátkodobé tokeny, kontrolu opakovaného odoslania, ochranu proti automatizovaným požiadavkám a e-mailové oznámenie obsahujúce iba referenciu. Existuje chránené technické rozhranie na čítanie a zmazanie žiadosti, zatiaľ však chýba dokončené používateľské administrátorské rozhranie a správa individuálnych prístupov.

## Čo je potrebné pred nasadením

1. Prihlásiť oprávneného správcu do Cloudflare a bezpečne pripraviť oddelené testovacie prostredie Worker/D1. Nenastavovať ostré DNS ani trasovanie bez osobitného súhlasu.
2. Autorizovať určený Gmail/Google Workspace účet pre Gmail API; prístupové údaje zadávať iba do bezpečného úložiska služby, nie do chatu alebo repozitára.
3. Určiť právneho prevádzkovateľa, retenčné lehoty, oprávnených pracovníkov a dokončiť súkromie, administráciu, monitorovanie a opakované doručovanie chybných oznámení.
4. V testovacom prostredí preveriť skutočnú D1 databázu, Gmail doručovanie, ochranu proti zneužitiu, čítačku obrazovky a preklady. Následne získať výslovný súhlas s produkčným nasadením.

Technické nastavenie, testovacie príkazy, podrobné obmedzenia a postup nasadenia a návratu sú uvedené v [README.md](README.md).
