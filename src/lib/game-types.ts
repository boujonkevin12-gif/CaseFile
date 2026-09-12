export type ClientSuspect = {
  id: string;
  name: string;
  age: number;
  job: string;
  relationship: string;
  bio: string;
  avatarColor: string;
};

export type ClientLocationAction = {
  id: string;
  label: string;
  order: number;
};

export type ClientLocation = {
  id: string;
  key: string;
  name: string;
  description: string;
  actions: ClientLocationAction[];
};

export type ClientClue = {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  importance: string;
  implicatesSuspectId: string | null;
  locationKey: string | null;
};

export type ClientDialogueOption = {
  id: string;
  kind: "PREGUNTAR" | "MOSTRAR_EVIDENCIA" | "ACUSAR_CONTRADICCION" | "CONTINUAR";
  label: string;
  requiresClueId: string | null;
};

export type ClientDialogueQuestion = {
  id: string;
  question: string;
  options: ClientDialogueOption[];
};

export type ClientSuspectDialogue = {
  suspectId: string;
  questions: ClientDialogueQuestion[];
};

export type CaseInfo = {
  code: string;
  title: string;
  intro: string;
  victimName: string;
  victimAge: number;
  victimJob: string;
  place: string;
  timeOfCrime: string;
  totalClues: number;
};

export const HINT_COST = 120;
