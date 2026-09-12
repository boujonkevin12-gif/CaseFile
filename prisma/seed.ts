import "dotenv/config";
import { PrismaClient, Difficulty, ClueType, ClueImportance, DialogueOptionKind } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Sembrando CASEFILE...");

  // Limpieza (orden por dependencias)
  await prisma.investigationClue.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.dialogueOption.deleteMany();
  await prisma.dialogue.deleteMany();
  await prisma.caseLocationAction.deleteMany();
  await prisma.caseLocation.deleteMany();
  await prisma.clue.deleteMany();
  await prisma.suspect.deleteMany();
  await prisma.userCaseUnlock.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.case.deleteMany();

  // ---------------------------------------------------------------------
  // LOGROS
  // ---------------------------------------------------------------------
  await prisma.achievement.createMany({
    data: [
      { key: "primer_caso", title: "Primer caso", description: "Resolviste tu primera investigación.", icon: "FileCheck" },
      { key: "primer_caso_perfecto", title: "Ojo clínico", description: "Resolviste un caso encontrando todas las pistas.", icon: "Sparkles" },
      { key: "cinco_casos", title: "Veterano", description: "Resolviste 5 casos.", icon: "BadgeCheck" },
      { key: "diez_pistas", title: "Sabueso", description: "Encontraste 10 pistas en total.", icon: "Search" },
      { key: "detective_experto", title: "Detective experto", description: "Alcanzaste el nivel 5.", icon: "Trophy" },
    ],
  });

  // ---------------------------------------------------------------------
  // CASO 001 - EL ULTIMO TREN
  // ---------------------------------------------------------------------
  const kase = await prisma.case.create({
    data: {
      code: "CASO-001",
      slug: "el-ultimo-tren",
      title: "El último tren",
      intro:
        "Anoche, a las 23:47, un hombre fue encontrado inconsciente en el último vagón del tren que llega a Estación Central. Nadie llamó a una ambulancia hasta minutos después de que el tren se detuviera. Cuando la policía revisó sus pertenencias, faltaba su teléfono. Nadie en el vagón admite haber visto nada. Tenés el expediente. Tenés cuatro sospechosos. Tenés hasta que se enfríe la pista.",
      victimName: "Gabriel Molina",
      victimAge: 42,
      victimJob: "Empresario",
      place: "Estación Central",
      timeOfCrime: "23:47",
      difficulty: Difficulty.FACIL,
      order: 1,
      requiredLevel: 1,
      motive:
        "Martín Vega arrastraba deudas de juego que ya no podía cubrir. Como guardia de seguridad conocía los horarios muertos de las cámaras y sabía que Gabriel viajaba solo en el último vagón con un teléfono de alta gama. Usó su llave maestra para cortar el registro de cámaras seis minutos, golpeó a Gabriel para llevarse el teléfono y lo empeñó al día siguiente con un nombre falso.",
      resolutionText:
        "El corte de cámaras coincidía exactamente con la hora del ataque, y solo alguien con llave maestra podía provocarlo. Las fotos de Diego lo ubicaban junto al vagón minutos antes, contradiciendo su coartada. El recibo de la casa de empeño, con un teléfono del mismo modelo empeñado al día siguiente, cerró el caso: Martín Vega necesitaba el dinero y usó su puesto para conseguirlo.",
      xpReward: 500,
      coinReward: 250,
    },
  });

  const [laura, martin, diego, sofia] = await Promise.all([
    prisma.suspect.create({
      data: {
        caseId: kase.id,
        name: "Laura Méndez",
        age: 31,
        job: "Abogada",
        relationship: "Expareja de la víctima",
        bio: "Terminó su relación con Gabriel hace ocho meses, en medio de una disputa por una propiedad que compraron juntos. Viajaba en un vagón cercano esa noche.",
        avatarColor: "#8b3a3a",
        isGuilty: false,
        order: 1,
      },
    }),
    prisma.suspect.create({
      data: {
        caseId: kase.id,
        name: "Martín Vega",
        age: 38,
        job: "Guardia de seguridad",
        relationship: "Sin relación previa conocida",
        bio: "Trabaja en Estación Central desde hace seis años. Dice que pasó toda la noche en la oficina de control, salvo una ronda breve por el andén.",
        avatarColor: "#3a4a5a",
        isGuilty: true,
        order: 2,
      },
    }),
    prisma.suspect.create({
      data: {
        caseId: kase.id,
        name: "Diego Torres",
        age: 27,
        job: "Fotógrafo",
        relationship: "Sin relación previa conocida",
        bio: "Estaba en el andén haciendo tomas nocturnas para un proyecto personal sobre la estación vacía. Asegura que no subió al último vagón.",
        avatarColor: "#5a4a2a",
        isGuilty: false,
        order: 3,
      },
    }),
    prisma.suspect.create({
      data: {
        caseId: kase.id,
        name: "Sofía Ríos",
        age: 35,
        job: "Periodista",
        relationship: "Investigaba a la víctima",
        bio: "Preparaba una nota sobre presuntos sobornos en la empresa de Gabriel y había pedido reunirse con él esa misma noche.",
        avatarColor: "#4a3a5a",
        isGuilty: false,
        order: 4,
      },
    }),
  ]);

  // -------------------------------------------------------------------
  // PISTAS
  // -------------------------------------------------------------------
  const clueData: Array<{
    key: string;
    title: string;
    description: string;
    icon: string;
    type: ClueType;
    importance: ClueImportance;
    isRedHerring: boolean;
    locationKey: string;
    implicatesSuspectId?: string;
  }> = [
    {
      key: "mancha_sangre",
      title: "Mancha de sangre",
      description:
        "Una mancha pequeña en el apoyabrazos del último asiento del vagón. Coincide con el punto donde encontraron a Gabriel. Confirma que el ataque ocurrió ahí mismo, pero no dice quién lo hizo.",
      icon: "Droplet",
      type: ClueType.FISICA,
      importance: ClueImportance.BAJA,
      isRedHerring: false,
      locationKey: "vagon",
    },
    {
      key: "huella_bota",
      title: "Huella de bota reglamentaria",
      description:
        "Una huella parcial de bota junto a la ventana, con un dibujo de suela poco común: el mismo que usa el calzado reglamentario del personal de seguridad de la estación.",
      icon: "Footprints",
      type: ClueType.FISICA,
      importance: ClueImportance.MEDIA,
      isRedHerring: false,
      locationKey: "vagon",
      implicatesSuspectId: martin.id,
    },
    {
      key: "boleto_laura",
      title: "Boleto de tren de Laura",
      description:
        "Un boleto a nombre de Laura Méndez, para un horario anterior, encontrado entre los asientos. Podría parecer sospechoso, pero el horario impreso es de dos trenes antes: no coincide con el ataque.",
      icon: "Ticket",
      type: ClueType.DOCUMENTO,
      importance: ClueImportance.BAJA,
      isRedHerring: true,
      locationKey: "vagon",
    },
    {
      key: "sim_descartada",
      title: "Tarjeta SIM descartada",
      description:
        "Una tarjeta SIM partida en dos, tirada cerca de los objetos perdidos. Coincide con el número de línea de Gabriel: alguien quiso deshacerse de cualquier forma de rastrear el teléfono.",
      icon: "Smartphone",
      type: ClueType.FISICA,
      importance: ClueImportance.MEDIA,
      isRedHerring: false,
      locationKey: "estacion",
    },
    {
      key: "nota_sofia",
      title: "Nota escrita",
      description:
        "Una nota en el bolsillo del abrigo de Gabriel: \"S. Ríos - 23:30 - andén, sobre los contratos\". Confirma que la reunión con la periodista estaba planeada de antemano y no fue un encuentro casual.",
      icon: "FileText",
      type: ClueType.DOCUMENTO,
      importance: ClueImportance.BAJA,
      isRedHerring: false,
      locationKey: "estacion",
    },
    {
      key: "llave_faltante",
      title: "Llave maestra faltante",
      description:
        "El registro de la oficina de guardia muestra que la llave maestra de la sala de control estuvo fuera de su lugar entre las 23:40 y las 23:52 de esa noche, justo durante la ventana del ataque.",
      icon: "KeyRound",
      type: ClueType.DOCUMENTO,
      importance: ClueImportance.ALTA,
      isRedHerring: false,
      locationKey: "oficina-guardia",
      implicatesSuspectId: martin.id,
    },
    {
      key: "corte_camaras",
      title: "Corte de cámaras de seis minutos",
      description:
        "El registro digital muestra un corte de seis minutos en las cámaras del último vagón, entre las 23:41 y las 23:47. Solo alguien con acceso a la sala de control pudo provocarlo.",
      icon: "Video",
      type: ClueType.DIGITAL,
      importance: ClueImportance.ALTA,
      isRedHerring: false,
      locationKey: "oficina-guardia",
      implicatesSuspectId: martin.id,
    },
    {
      key: "recibo_empeño",
      title: "Recibo de casa de empeño",
      description:
        "Un recibo arrugado en el fondo de un casillero de personal: un teléfono del mismo modelo que el de Gabriel, empeñado al mediodía siguiente bajo un nombre que no coincide con ningún empleado registrado.",
      icon: "Receipt",
      type: ClueType.DOCUMENTO,
      importance: ClueImportance.CLAVE,
      isRedHerring: false,
      locationKey: "oficina-guardia",
      implicatesSuspectId: martin.id,
    },
    {
      key: "fotos_diego",
      title: "Fotos de Diego Torres",
      description:
        "En las fotos nocturnas de Diego aparece, en segundo plano, un guardia parado junto a la puerta del último vagón a las 23:44, tres minutos antes de que el tren llegara a destino. Martín declaró que no se movió de la oficina en toda la noche.",
      icon: "Camera",
      type: ClueType.DIGITAL,
      importance: ClueImportance.CLAVE,
      isRedHerring: false,
      locationKey: "anden",
      implicatesSuspectId: martin.id,
    },
  ];

  const clues: Record<string, { id: string }> = {};
  for (const c of clueData) {
    const created = await prisma.clue.create({
      data: {
        caseId: kase.id,
        title: c.title,
        description: c.description,
        icon: c.icon,
        type: c.type,
        importance: c.importance,
        isRedHerring: c.isRedHerring,
        locationKey: c.locationKey,
        implicatesSuspectId: c.implicatesSuspectId,
      },
    });
    clues[c.key] = created;
  }

  // -------------------------------------------------------------------
  // UBICACIONES Y ACCIONES
  // -------------------------------------------------------------------
  await prisma.caseLocation.create({
    data: {
      caseId: kase.id,
      key: "estacion",
      name: "Estación Central",
      description:
        "El vestíbulo principal todavía tiene cinta policial cerca del andén 3. Un puesto de objetos perdidos y un par de testigos ocasionales son lo único que queda de la noche anterior.",
      order: 1,
      actions: {
        create: [
          {
            label: "Hablar con testigos",
            resultText:
              "Un vendedor del kiosco recuerda a una mujer con una agenda de cuero preguntando por el horario del último tren, poco antes de las 23:30. No vio nada del ataque en sí.",
            order: 1,
          },
          {
            label: "Revisar objetos perdidos",
            resultText:
              "Entre los objetos sin reclamar encontrás algo que no debería estar ahí.",
            clueId: clues.sim_descartada.id,
            order: 2,
          },
          {
            label: "Revisar el abrigo de la víctima",
            resultText:
              "Los paramédicos guardaron sus pertenencias en una bolsa etiquetada. En un bolsillo interior hay un papel doblado.",
            clueId: clues.nota_sofia.id,
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.caseLocation.create({
    data: {
      caseId: kase.id,
      key: "vagon",
      name: "Último vagón",
      description:
        "El vagón donde encontraron a Gabriel todavía conserva algunas pertenencias de los pasajeros de esa noche. Los asientos de tela oscura no muestran mucho a simple vista.",
      order: 2,
      actions: {
        create: [
          {
            label: "Buscar debajo del asiento",
            resultText:
              "Debajo del último asiento, agachándote con la linterna, encontrás una mancha oscura ya seca.",
            clueId: clues.mancha_sangre.id,
            order: 1,
          },
          {
            label: "Examinar la ventana",
            resultText:
              "El vidrio tiene una marca de apoyo reciente. En el piso, justo debajo, hay una huella parcial.",
            clueId: clues.huella_bota.id,
            order: 2,
          },
          {
            label: "Revisar pertenencias olvidadas",
            resultText:
              "Entre los asientos hay un boleto de tren caído, arrugado como si llevara ahí un tiempo.",
            clueId: clues.boleto_laura.id,
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.caseLocation.create({
    data: {
      caseId: kase.id,
      key: "anden",
      name: "Andén 3",
      description:
        "El andén donde se detuvo el tren esa noche. Todavía hay marcas de tiza en el piso señalando dónde estaba parado el personal de emergencias.",
      order: 3,
      actions: {
        create: [
          {
            label: "Hablar con Diego Torres",
            resultText:
              "Diego te muestra su cámara sin dudarlo: \"Estuve fotografiando la estación toda la noche, capaz salió algo útil.\" Revisás el rollo digital con él.",
            clueId: clues.fotos_diego.id,
            order: 1,
          },
          {
            label: "Revisar el piso del andén",
            resultText:
              "Solo colillas de cigarrillo y un boleto usado. Nada que aporte al caso.",
            order: 2,
          },
          {
            label: "Consultar los horarios de esa noche",
            resultText:
              "El último tren llegó con cuatro minutos de retraso, a las 23:47. Coincide con la hora en la que se dio aviso del ataque.",
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.caseLocation.create({
    data: {
      caseId: kase.id,
      key: "oficina-guardia",
      name: "Oficina del guardia",
      description:
        "Una oficina pequeña con monitores de seguridad y un casillero de personal. Martín pasa gran parte de sus turnos acá, según su propio testimonio.",
      order: 4,
      actions: {
        create: [
          {
            label: "Revisar el registro de cámaras",
            resultText:
              "El registro muestra un corte extraño en las cámaras del último vagón, justo durante la hora del ataque.",
            clueId: clues.corte_camaras.id,
            order: 1,
          },
          {
            label: "Buscar la llave maestra",
            resultText:
              "El libro de préstamos de llaves tiene una entrada sin firma de devolución esa noche.",
            clueId: clues.llave_faltante.id,
            order: 2,
          },
          {
            label: "Registrar el casillero de personal",
            resultText:
              "Detrás de un montón de formularios viejos, algo cae al piso.",
            clueId: clues.recibo_empeño.id,
            order: 3,
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------------
  // INTERROGATORIOS
  // -------------------------------------------------------------------
  await prisma.dialogue.create({
    data: {
      suspectId: laura.id,
      question: "¿Dónde estaba usted a las 23:47?",
      order: 1,
      options: {
        create: [
          {
            kind: DialogueOptionKind.PREGUNTAR,
            label: "Preguntar por su relación con Gabriel",
            responseText:
              "\"Terminamos hace ocho meses. No fue lindo, todavía estamos discutiendo qué hacer con un departamento que compramos juntos. Pero de ahí a esto hay un salto enorme.\"",
            order: 1,
          },
          {
            kind: DialogueOptionKind.MOSTRAR_EVIDENCIA,
            label: "Mostrar el boleto de tren encontrado",
            requiresClueId: clues.boleto_laura.id,
            responseText:
              "\"Ese boleto es mío, sí, pero es de dos trenes antes. Viajé temprano para evitar cruzármelo. Deben haberlo revisado mal, fíjense el horario impreso.\" Tiene razón: el horario no coincide con el ataque.",
            order: 2,
          },
          {
            kind: DialogueOptionKind.CONTINUAR,
            label: "Terminar el interrogatorio",
            responseText: "Laura se cruza de brazos, esperando que termines.",
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.dialogue.create({
    data: {
      suspectId: martin.id,
      question: "¿Dónde estaba usted a las 23:47?",
      order: 1,
      options: {
        create: [
          {
            kind: DialogueOptionKind.PREGUNTAR,
            label: "Preguntar por su turno esa noche",
            responseText:
              "\"Toda la noche en la oficina de control, salvo una ronda corta por el andén. No me moví de ahí más que eso.\"",
            order: 1,
          },
          {
            kind: DialogueOptionKind.MOSTRAR_EVIDENCIA,
            label: "Mostrar el corte de cámaras",
            requiresClueId: clues.corte_camaras.id,
            responseText:
              "\"Eso... pasa a veces, el sistema es viejo, se cuelga.\" No suena convencido de su propia excusa.",
            order: 2,
          },
          {
            kind: DialogueOptionKind.ACUSAR_CONTRADICCION,
            label: "Confrontar con las fotos de Diego",
            requiresClueId: clues.fotos_diego.id,
            responseText:
              "Se queda en silencio un largo rato. \"Está bien. Necesitaba el dinero. Pensé que nadie se iba a dar cuenta de que faltaban seis minutos de cámara.\"",
            order: 3,
          },
          {
            kind: DialogueOptionKind.CONTINUAR,
            label: "Terminar el interrogatorio",
            responseText: "Martín evita mirarte a los ojos.",
            order: 4,
          },
        ],
      },
    },
  });

  await prisma.dialogue.create({
    data: {
      suspectId: diego.id,
      question: "¿Qué hacía en el andén esa noche?",
      order: 1,
      options: {
        create: [
          {
            kind: DialogueOptionKind.PREGUNTAR,
            label: "Preguntar por su presencia en la estación",
            responseText:
              "\"Fotografío estaciones vacías de noche, es un proyecto personal. Tengo permiso de la empresa ferroviaria, si necesitan verlo.\"",
            order: 1,
          },
          {
            kind: DialogueOptionKind.PREGUNTAR,
            label: "Preguntar si subió al último vagón",
            responseText:
              "\"No, me quedé en el andén todo el tiempo. Vi el tren llegar, nada más. Después fue un caos de gente y luces.\"",
            order: 2,
          },
          {
            kind: DialogueOptionKind.CONTINUAR,
            label: "Terminar el interrogatorio",
            responseText: "Diego sigue revisando sus fotos, tranquilo.",
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.dialogue.create({
    data: {
      suspectId: sofia.id,
      question: "¿Para qué quería reunirse con Gabriel?",
      order: 1,
      options: {
        create: [
          {
            kind: DialogueOptionKind.PREGUNTAR,
            label: "Preguntar por la nota encontrada",
            responseText:
              "\"Estoy preparando una nota sobre contratos irregulares en su empresa. Le pedí una entrevista para esa noche, en el andén, antes de publicar nada.\"",
            order: 1,
          },
          {
            kind: DialogueOptionKind.MOSTRAR_EVIDENCIA,
            label: "Mostrar la nota escrita",
            requiresClueId: clues.nota_sofia.id,
            responseText:
              "\"Esa nota la escribió él, no yo. Llegué al andén y ya se estaba armando el revuelo por lo que había pasado en el vagón. Nunca llegamos a hablar.\"",
            order: 2,
          },
          {
            kind: DialogueOptionKind.CONTINUAR,
            label: "Terminar el interrogatorio",
            responseText: "Sofía cierra su libreta, esperando la próxima pregunta.",
            order: 3,
          },
        ],
      },
    },
  });

  console.log("Listo. Caso #001 'El último tren' sembrado con éxito.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
