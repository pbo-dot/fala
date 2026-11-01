import Anthropic from '@anthropic-ai/sdk'
import type { Phrase } from './data/phrases'
import { getData, update } from './store'

// Claude bruges kun til "Sig det for mig" og "Om mig", med ejerens egen nøgle.

const MODEL = 'claude-sonnet-5-5'
// Pris pr. million tokens i dollar (Sonnet 5.5) og en omtrentlig kurs.
const USD_IN = 2
const USD_OUT = 10
const DKK_PER_USD = 6.9

export class NoKeyError extends Error {}

function client(): Anthropic {
  const key = getData().settings.apiKey.trim()
  if (!key) throw new NoKeyError('Ingen nøgle')
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 1 })
}

const SYSTEM = `Du hjælper en dansker, der ikke er god til sprog, med at klare sig på ferie i Portugal.
Svar ALTID på europæisk portugisisk som det tales i Portugal (pt-PT), aldrig brasiliansk.
Brug portugisiske ord og former: "casa de banho" (ikke "banheiro"), "pequeno-almoço", "autocarro", "comboio", "telemóvel", "sumo", "ementa", "estou a fazer" (ikke "estou fazendo"), "você" undgås – brug høflig 3. person uden pronomen ("Pode ajudar-me?") og enklitiske pronominer ("chamo-me").
Hold sætningerne korte, enkle og naturlige, sådan som en portugiser faktisk ville sige dem.

Udtale skrives til danskere:
- Del i stavelser med bindestreg, trykstavelsen med STORE bogstaver: "pur fa-VOR", "o-bri-GA-du".
- Tryksvagt e skrives "ë" (næsten stumt): "dë", "TAR-dë". Tryksvagt o skrives "u": "u PAI-sjë".
- s/z sidst i ord eller før konsonant: "sj" (eller "zj" før stemt konsonant): "DOISJ", "sjTA".
- s mellem vokaler: "z". j og ge/gi: "zj". ch: "sj". lh: "lj". nh: "nj".
- Nasaler med tilde: ã, õ, ĩ, ũ, ẽ; "ão" = "ãu", "em" sidst = "ãi": "PÃU", "tãi".
- Åbent é/è: "æ" eller "Æ": "ka-FÆ". rr og r først i ordet: "R".
Noten er kort og på dansk. Skriv kun en note, når Portugal og Brasilien siger det forskelligt, eller når der er en vigtig lille ting (fx at en kvinde siger "obrigada"). Ellers tom streng.`

type Usage = { input_tokens: number; output_tokens: number }

function addCost(u: Usage | undefined): number {
  if (!u) return 0
  const kr = ((u.input_tokens * USD_IN + u.output_tokens * USD_OUT) / 1_000_000) * DKK_PER_USD
  update((d) => ({ ...d, spentKr: d.spentKr + kr }))
  return kr
}

async function ask<T>(prompt: string, schema: object, maxTokens: number): Promise<{ value: T; kr: number }> {
  const c = client()
  const params = {
    model: MODEL,
    max_tokens: maxTokens,
    system: SYSTEM,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content: prompt }],
  }
  // fallbacks: "default" er nyere end SDK'ens typer, så kaldet sendes uden typetjek.
  const res = (await c.beta.messages.create(params as never)) as unknown as {
    stop_reason: string
    content: { type: string; text?: string }[]
    usage?: Usage
  }
  const kr = addCost(res.usage)
  if (res.stop_reason === 'refusal') throw new Error('Claude ville ikke svare på det. Prøv at skrive det anderledes.')
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('')
  return { value: JSON.parse(text) as T, kr }
}

export type Translation = { portugisisk: string; udtale: string; dansk: string; note: string }

const TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    portugisisk: { type: 'string' },
    udtale: { type: 'string' },
    dansk: { type: 'string' },
    note: { type: 'string' },
  },
  required: ['portugisisk', 'udtale', 'dansk', 'note'],
  additionalProperties: false,
}

export async function translate(danish: string) {
  return ask<Translation>(
    `Sig dette på portugisisk fra Portugal, som jeg kan sige det eller vise det til en portugiser.
"dansk" er en kort, naturlig dansk gengivelse af det portugisiske.

Det jeg vil sige: ${danish}`,
    TRANSLATION_SCHEMA,
    1500,
  )
}

const ABOUT_SCHEMA = {
  type: 'object',
  properties: {
    linjer: {
      type: 'array',
      items: TRANSLATION_SCHEMA,
    },
  },
  required: ['linjer'],
  additionalProperties: false,
}

export async function makeAbout(info: {
  name: string
  age: string
  work: string
  retired: boolean
  home: string
  woman: boolean
}): Promise<{ value: Phrase[]; kr: number }> {
  const facts = [
    `Navn: ${info.name || '(ikke oplyst)'}`,
    `Køn: ${info.woman ? 'kvinde' : 'mand'}`,
    `Alder: ${info.age || '(ikke oplyst)'}`,
    info.retired ? 'Er pensioneret' : `Arbejde: ${info.work || '(ikke oplyst)'}`,
    `Hjemby i Danmark: ${info.home || '(ikke oplyst)'}`,
  ].join('\n')
  const { value, kr } = await ask<{ linjer: Translation[] }>(
    `Lav en kort præsentation af mig, som jeg kan sige til portugisere. Én sætning pr. linje, i denne rækkefølge:
1. "Olá, chamo-me …"
2. "Sou dinamarquês/dinamarquesa."
3. "Tenho … anos." (skriv tallet med bogstaver, så det kan læses op)
4. "Trabalho como …" (eller "Sou …") – eller "Estou reformado/reformada." hvis jeg er pensioneret
5. "Sou de …" (hjembyen; tilføj fx ", na Dinamarca" hvis byen er ukendt for portugisere)
6. "Estou de férias."
7. "É a minha primeira vez em Portugal." eller noget lignende kort og venligt
Spring linjer over, hvis oplysningen mangler. Bøj efter køn. Skriv navnets udtale, som en portugiser ville sige det.

Mine oplysninger:
${facts}`,
    ABOUT_SCHEMA,
    3000,
  )
  const lines = value.linjer.map((l, i) => ({
    id: `me-${i}`,
    pt: l.portugisisk,
    say: l.udtale,
    da: l.dansk,
    note: l.note || undefined,
  }))
  return { value: lines, kr }
}

export function errorText(e: unknown): string {
  if (e instanceof NoKeyError) return 'Indsæt din Claude-nøgle under Indstillinger først.'
  if (e instanceof Anthropic.AuthenticationError) return 'Nøglen virker ikke. Tjek den under Indstillinger.'
  if (e instanceof Anthropic.RateLimitError) return 'Claude har travlt. Prøv igen om lidt.'
  if (e instanceof Anthropic.APIConnectionError) return 'Ingen forbindelse. Det kræver net.'
  if (e instanceof Anthropic.APIError) return `Claude svarede med en fejl (${e.status ?? '?'}). Prøv igen.`
  if (e instanceof Error) return e.message
  return 'Noget gik galt. Prøv igen.'
}
