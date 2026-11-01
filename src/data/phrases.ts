// Indhold: europæisk portugisisk (Portugal), udtale skrevet til danskere.
// Udtale: STORE bogstaver = tryk. ë = svagt, næsten stumt e. sj = som i "sjov".
// zj = stemt sj (som j i fransk "journal"). ã, õ, ĩ, ũ = gennem næsen.
// Ordet "o" (artiklen) udtales "u", og tryksvagt o udtales også "u".

export type Phrase = {
  id: string
  pt: string
  say: string
  da: string
  note?: string
}

export type Group = { title: string; items: Phrase[] }

export type Category = {
  id: string
  name: string
  unit: string
  groups: Group[]
}

const p = (id: string, pt: string, say: string, da: string, note?: string): Phrase => ({ id, pt, say, da, note })

export const CATEGORIES: Category[] = [
  {
    id: 'hoeflighed',
    name: 'Høflighed',
    unit: 'sætninger',
    groups: [
      {
        title: 'Hilsner',
        items: [
          p('h-ola', 'Olá.', 'o-LA', 'Hej.'),
          p('h-bomdia', 'Bom dia.', 'bõ DI-a', 'Godmorgen. (indtil frokost)'),
          p('h-boatarde', 'Boa tarde.', 'BO-a TAR-dë', 'Goddag. (om eftermiddagen)'),
          p('h-boanoite', 'Boa noite.', 'BO-a NOI-të', 'Godaften. Godnat.'),
          p('h-adeus', 'Adeus.', 'a-DEUSJ', 'Farvel.'),
          p('h-ate-logo', 'Até logo.', 'a-TÆ LO-gu', 'Vi ses.'),
        ],
      },
      {
        title: 'Tak og undskyld',
        items: [
          p('h-obrigado', 'Obrigado.', 'o-bri-GA-du', 'Tak. (siger en mand)', 'En kvinde siger "obrigada".'),
          p('h-obrigada', 'Obrigada.', 'o-bri-GA-da', 'Tak. (siger en kvinde)'),
          p('h-porfavor', 'Por favor.', 'pur fa-VOR', 'Tak. Vær så venlig.'),
          p('h-denada', 'De nada.', 'dë NA-da', 'Selv tak.'),
          p('h-desculpe', 'Desculpe.', 'dësj-KUL-pë', 'Undskyld.'),
          p('h-licenca', 'Com licença.', 'kõ li-SÆN-sa', 'Undskyld, må jeg komme forbi?'),
        ],
      },
      {
        title: 'Når du ikke forstår',
        items: [
          p('h-sim', 'Sim.', 'sĩ', 'Ja.'),
          p('h-nao', 'Não.', 'nãu', 'Nej.'),
          p('h-naopercebo', 'Não percebo.', 'nãu për-SE-bu', 'Jeg forstår ikke.', 'I Portugal siger man "percebo". "Entendo" er mere brasiliansk.'),
          p('h-repetir', 'Pode repetir, por favor?', 'PO-dë Rë-pë-TIR, pur fa-VOR', 'Kan du sige det igen?'),
          p('h-devagar', 'Mais devagar, por favor.', 'majsj dë-va-GAR, pur fa-VOR', 'Lidt langsommere, tak.'),
          p('h-ingles', 'Fala inglês?', 'FA-la ĩ-GLESJ', 'Taler du engelsk?'),
        ],
      },
    ],
  },
  {
    id: 'cafe',
    name: 'Café',
    unit: 'sætninger',
    groups: [
      {
        title: 'Bestil',
        items: [
          p('c-bica', 'Uma bica, por favor.', 'U-ma BI-ka, pur fa-VOR', 'En espresso, tak.', '"Bica" siges i Lissabon. "Um café" forstås overalt.'),
          p('c-cafe', 'Um café, por favor.', 'ũ ka-FÆ, pur fa-VOR', 'En espresso, tak.'),
          p('c-galao', 'Um galão, por favor.', 'ũ ga-LÃU, pur fa-VOR', 'En kaffe med meget mælk (i glas), tak.'),
          p('c-nata', 'Um pastel de nata.', 'ũ pasj-TÆL dë NA-ta', 'En portugisisk cremetærte.'),
          p('c-torrada', 'Uma torrada.', 'U-ma tu-RA-da', 'Ristet brød med smør.'),
          p('c-agua', 'Uma água, por favor.', 'U-ma A-gwa, pur fa-VOR', 'En flaske vand, tak.'),
          p('c-gas', 'Com gás ou sem gás?', 'kõ GASJ o sãi GASJ', 'Med eller uden brus?'),
          p('c-maisum', 'Mais um, por favor.', 'maj-ZŨ, pur fa-VOR', 'En til, tak.'),
        ],
      },
      {
        title: 'Betal',
        items: [
          p('c-conta', 'A conta, por favor.', 'a KÕ-ta, pur fa-VOR', 'Regningen, tak.'),
          p('c-quanto', 'Quanto é?', 'KWAN-tu Æ', 'Hvad bliver det?'),
          p('c-cartao', 'Posso pagar com cartão?', 'PO-su pa-GAR kõ kar-TÃU', 'Kan jeg betale med kort?'),
          p('c-aquitem', 'Aqui tem.', 'a-KI tãi', 'Værsgo. (når du giver noget)'),
        ],
      },
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    unit: 'sætninger',
    groups: [
      {
        title: 'Bord og menu',
        items: [
          p('r-mesa', 'Uma mesa para dois, por favor.', 'U-ma ME-za PA-ra DOISJ, pur fa-VOR', 'Et bord til to, tak.'),
          p('r-livre', 'Tem uma mesa livre?', 'tãi U-ma ME-za LI-vrë', 'Har I et ledigt bord?'),
          p('r-ementa', 'A ementa, por favor.', 'a i-MEN-ta, pur fa-VOR', 'Menukortet, tak.', 'I Portugal hedder menukortet "ementa". "Cardápio" er brasiliansk.'),
          p('r-recomenda', 'O que recomenda?', 'u kë Rë-ku-MEN-da', 'Hvad kan du anbefale?'),
        ],
      },
      {
        title: 'Bestil',
        items: [
          p('r-peixe', 'Queria o peixe.', 'kë-RI-a u PAI-sjë', 'Jeg vil gerne have fisken.'),
          p('r-carne', 'Queria a carne.', 'kë-RI-a a KAR-në', 'Jeg vil gerne have kødet.'),
          p('r-tinto', 'Um copo de vinho tinto.', 'ũ KO-pu dë VI-nju TIN-tu', 'Et glas rødvin.'),
          p('r-imperial', 'Uma imperial, por favor.', 'U-ma ĩ-pë-RJAL, pur fa-VOR', 'En lille fadøl, tak.', 'I Lissabon "uma imperial", i Porto "um fino".'),
          p('r-pao', 'Mais pão, por favor.', 'majsj PÃU, pur fa-VOR', 'Mere brød, tak.'),
          p('r-vegetariano', 'Sou vegetariano.', 'so vë-zjë-ta-RJA-nu', 'Jeg er vegetar. (mand)', 'En kvinde siger "vegetariana".'),
          p('r-alergia', 'Tenho alergia a frutos secos.', 'TÆ-nju a-lër-ZJI-a a FRU-tusj SE-kusj', 'Jeg er allergisk over for nødder.'),
        ],
      },
      {
        title: 'Til sidst',
        items: [
          p('r-bom', 'Está muito bom!', 'sjTA MŨI-tu bõ', 'Det smager rigtig godt!'),
          p('r-conta', 'Pode trazer a conta?', 'PO-dë tra-ZER a KÕ-ta', 'Må vi få regningen?'),
          p('r-servico', 'O serviço está incluído?', 'u sër-VI-su sjTA ĩ-klu-I-du', 'Er drikkepenge med i prisen?'),
        ],
      },
    ],
  },
  {
    id: 'butik',
    name: 'Butik',
    unit: 'sætninger',
    groups: [
      {
        title: 'I butikken',
        items: [
          p('b-quanto', 'Quanto custa?', 'KWAN-tu KUSJ-ta', 'Hvad koster det?'),
          p('b-ver', 'Só estou a ver, obrigado.', 'so sjTO a VER, o-bri-GA-du', 'Jeg kigger bare, tak.', 'I Portugal "estou a ver". "Estou vendo" er brasiliansk.'),
          p('b-experimentar', 'Posso experimentar?', 'PO-su sjpë-ri-mẽ-TAR', 'Må jeg prøve den?'),
          p('b-tamanho', 'Tem noutro tamanho?', 'tãi NO-tru ta-MA-nju', 'Har I den i en anden størrelse?'),
          p('b-caro', 'É muito caro.', 'Æ MŨI-tu KA-ru', 'Det er for dyrt.'),
          p('b-levo', 'Levo este.', 'LÆ-vu ESJ-të', 'Jeg tager den her.'),
          p('b-saco', 'Um saco, por favor.', 'ũ SA-ku, pur fa-VOR', 'En pose, tak.'),
          p('b-meioquilo', 'Meio quilo, por favor.', 'MAI-u KI-lu, pur fa-VOR', 'Et halvt kilo, tak.'),
          p('b-soisso', 'Só isso, obrigado.', 'so I-su, o-bri-GA-du', 'Det var det hele, tak.'),
          p('b-multibanco', 'Onde há um multibanco?', 'ON-dë A ũ mul-ti-BAN-ku', 'Hvor er der en hæveautomat?'),
        ],
      },
    ],
  },
  {
    id: 'vej',
    name: 'Find vej',
    unit: 'sætninger',
    groups: [
      {
        title: 'Spørg om vej',
        items: [
          p('v-wc', 'Onde é a casa de banho?', 'ON-dë Æ a KA-za dë BA-nju', 'Hvor er toilettet?', 'I Portugal hedder det "casa de banho". "Banheiro" er brasiliansk.'),
          p('v-estacao', 'Onde fica a estação?', 'ON-dë FI-ka a sjta-SÃU', 'Hvor ligger stationen?'),
          p('v-longe', 'É longe?', 'Æ LÕ-zjë', 'Er det langt væk?'),
          p('v-mapa', 'Pode mostrar no mapa?', 'PO-dë musj-TRAR nu MA-pa', 'Kan du vise det på kortet?'),
        ],
      },
      {
        title: 'Svaret',
        items: [
          p('v-esquerda', 'À esquerda.', 'a sjKER-da', 'Til venstre.'),
          p('v-direita', 'À direita.', 'a di-RAI-ta', 'Til højre.'),
          p('v-frente', 'Sempre em frente.', 'SẼ-prë ãi FRẼ-të', 'Lige ud.'),
          p('v-perto', 'É perto.', 'Æ PÆR-tu', 'Det er tæt på.'),
        ],
      },
      {
        title: 'Billet og taxa',
        items: [
          p('v-bilhete', 'Um bilhete para Sintra, por favor.', 'ũ bi-LJE-të PA-ra SĨ-tra, pur fa-VOR', 'En billet til Sintra, tak.'),
          p('v-aeroporto', 'Para o aeroporto, por favor.', 'PA-ra u a-æ-ru-POR-tu, pur fa-VOR', 'Til lufthavnen, tak.'),
        ],
      },
    ],
  },
  {
    id: 'hjaelp',
    name: 'Hjælp!',
    unit: 'sætninger',
    groups: [
      {
        title: 'Hjælp',
        items: [
          p('x-socorro', 'Socorro!', 'su-KO-Ru', 'Hjælp!'),
          p('x-ajuda', 'Preciso de ajuda.', 'prë-SI-zu dë a-ZJU-da', 'Jeg har brug for hjælp.'),
          p('x-medico', 'Preciso de um médico.', 'prë-SI-zu dũ MÆ-di-ku', 'Jeg har brug for en læge.'),
          p('x-ambulancia', 'Chame uma ambulância!', 'SJA-më U-ma ã-bu-LÃ-sja', 'Ring efter en ambulance!'),
          p('x-farmacia', 'Onde é a farmácia?', 'ON-dë Æ a far-MA-sja', 'Hvor er apoteket?'),
          p('x-malestar', 'Não me sinto bem.', 'nãu më SĨ-tu bãi', 'Jeg har det ikke godt.'),
          p('x-carteira', 'Perdi a minha carteira.', 'për-DI a MI-nja kar-TAI-ra', 'Jeg har mistet min pung.'),
          p('x-policia', 'Chame a polícia!', 'SJA-më a pu-LI-sja', 'Ring efter politiet!'),
        ],
      },
    ],
  },
  {
    id: 'ord',
    name: 'Hverdagsord',
    unit: 'ord',
    groups: [
      {
        title: 'Mad og drikke',
        items: [
          p('o-leite', 'o leite', 'u LAI-të', 'mælk'),
          p('o-ovos', 'os ovos', 'usj O-vusj', 'æg'),
          p('o-pao', 'o pão', 'u PÃU', 'brød'),
          p('o-manteiga', 'a manteiga', 'a mã-TAI-ga', 'smør'),
          p('o-queijo', 'o queijo', 'u KAI-zju', 'ost'),
          p('o-cafe', 'o café', 'u ka-FÆ', 'kaffe'),
          p('o-bica', 'a bica', 'a BI-ka', 'espresso (i Lissabon)'),
          p('o-agua', 'a água', 'a A-gwa', 'vand'),
          p('o-sumo', 'o sumo de laranja', 'u SU-mu dë la-RÃ-zja', 'appelsinjuice', 'I Portugal "sumo". "Suco" er brasiliansk.'),
          p('o-cerveja', 'a cerveja', 'a sër-VÆ-zja', 'øl'),
          p('o-tinto', 'o vinho tinto', 'u VI-nju TIN-tu', 'rødvin'),
          p('o-branco', 'o vinho branco', 'u VI-nju BRAN-ku', 'hvidvin'),
          p('o-peixe', 'o peixe', 'u PAI-sjë', 'fisk'),
          p('o-carne', 'a carne', 'a KAR-në', 'kød'),
          p('o-frango', 'o frango', 'u FRAN-gu', 'kylling'),
          p('o-arroz', 'o arroz', 'u a-ROSJ', 'ris'),
          p('o-batatas', 'as batatas', 'asj ba-TA-tasj', 'kartofler'),
          p('o-salada', 'a salada', 'a sa-LA-da', 'salat'),
          p('o-sopa', 'a sopa', 'a SO-pa', 'suppe'),
          p('o-fruta', 'a fruta', 'a FRU-ta', 'frugt'),
          p('o-acucar', 'o açúcar', 'u a-SU-kar', 'sukker'),
          p('o-sal', 'o sal', 'u SAL', 'salt'),
        ],
      },
      {
        title: 'Tal 1–20',
        items: [
          p('t-1', 'um', 'ũ', '1', 'Om en kvinde eller et hunkønsord: "uma" (U-ma).'),
          p('t-2', 'dois', 'DOISJ', '2', 'Hunkøn: "duas" (DU-asj).'),
          p('t-3', 'três', 'TRESJ', '3'),
          p('t-4', 'quatro', 'KWA-tru', '4'),
          p('t-5', 'cinco', 'SĨ-ku', '5'),
          p('t-6', 'seis', 'SAISJ', '6'),
          p('t-7', 'sete', 'SÆ-të', '7'),
          p('t-8', 'oito', 'OI-tu', '8'),
          p('t-9', 'nove', 'NO-vë', '9'),
          p('t-10', 'dez', 'DÆSJ', '10'),
          p('t-11', 'onze', 'ÕN-zë', '11'),
          p('t-12', 'doze', 'DO-zë', '12'),
          p('t-13', 'treze', 'TRE-zë', '13'),
          p('t-14', 'catorze', 'ka-TOR-zë', '14'),
          p('t-15', 'quinze', 'KĨ-zë', '15'),
          p('t-16', 'dezasseis', 'dë-za-SAISJ', '16', 'I Portugal "dezasseis". "Dezesseis" er brasiliansk.'),
          p('t-17', 'dezassete', 'dë-za-SÆ-të', '17'),
          p('t-18', 'dezoito', 'dë-ZOI-tu', '18'),
          p('t-19', 'dezanove', 'dë-za-NO-vë', '19'),
          p('t-20', 'vinte', 'VĨ-të', '20'),
        ],
      },
      {
        title: 'Dage',
        items: [
          p('d-seg', 'segunda-feira', 'së-GUN-da FAI-ra', 'mandag'),
          p('d-ter', 'terça-feira', 'TER-sa FAI-ra', 'tirsdag'),
          p('d-qua', 'quarta-feira', 'KWAR-ta FAI-ra', 'onsdag'),
          p('d-qui', 'quinta-feira', 'KĨ-ta FAI-ra', 'torsdag'),
          p('d-sex', 'sexta-feira', 'SAISJ-ta FAI-ra', 'fredag'),
          p('d-sab', 'sábado', 'SA-ba-du', 'lørdag'),
          p('d-dom', 'domingo', 'du-MĨ-gu', 'søndag'),
          p('d-hoje', 'hoje', 'O-zjë', 'i dag'),
          p('d-amanha', 'amanhã', 'a-ma-NJÃ', 'i morgen'),
          p('d-ontem', 'ontem', 'ÕN-tãi', 'i går'),
        ],
      },
      {
        title: 'Tider',
        items: [
          p('k-manha', 'de manhã', 'dë ma-NJÃ', 'om morgenen'),
          p('k-tarde', 'à tarde', 'a TAR-dë', 'om eftermiddagen'),
          p('k-noite', 'à noite', 'a NOI-të', 'om aftenen'),
          p('k-agora', 'agora', 'a-GO-ra', 'nu'),
          p('k-horas', 'Que horas são?', 'kë O-rasj SÃU', 'Hvad er klokken?'),
        ],
      },
      {
        title: 'Skilte og butik',
        items: [
          p('s-aberto', 'aberto', 'a-BÆR-tu', 'åben'),
          p('s-fechado', 'fechado', 'fë-SJA-du', 'lukket'),
          p('s-entrada', 'a entrada', 'a ẽ-TRA-da', 'indgang'),
          p('s-saida', 'a saída', 'a sa-I-da', 'udgang'),
          p('s-barato', 'barato', 'ba-RA-tu', 'billig'),
          p('s-caro', 'caro', 'KA-ru', 'dyr'),
        ],
      },
    ],
  },
]

export function allItems(cat: Category): Phrase[] {
  return cat.groups.flatMap((g) => g.items)
}

/** Rækkefølgen nye kort kommer i, i "I dag". Sætninger før ord. */
export const PRACTICE_ORDER = ['hoeflighed', 'cafe', 'restaurant', 'vej', 'butik', 'hjaelp', 'ord']

export const BUILTIN: Map<string, Phrase & { cat: string }> = new Map(
  CATEGORIES.flatMap((c) => allItems(c).map((ph) => [ph.id, { ...ph, cat: c.name }] as const)),
)
