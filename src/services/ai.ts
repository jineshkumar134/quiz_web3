import { QuizConfig, QuizQuestion, Flashcard, FlashNote, QuizSession, ChatMessage } from '../types';

// Predefined high-fidelity knowledge base for popular subjects
const POPULAR_SUBJECT_DATA: Record<string, {
  summary: string;
  keyPoints: string[];
  keyTerms: { term: string; meaning: string }[];
  questions: {
    question: string;
    type: 'mcq' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
}> = {
  biology: {
    summary: "Biology is the scientific study of life and living organisms. It explores their physical structure, chemical processes, molecular interactions, physiological mechanisms, development, and evolution. At its core, biology recognizes the cell as the basic unit of life, genes as the basic unit of heredity, and evolution as the engine that pushes the creation and extinction of species.",
    keyPoints: [
      "Cell theory states that all living things are composed of cells, cells are the basic unit of life, and all cells come from pre-existing cells.",
      "DNA (Deoxyribonucleic Acid) is the double-helix molecule carrying genetic instructions for growth, development, and reproduction.",
      "Photosynthesis is the process by which green plants convert light energy into chemical energy (glucose) using carbon dioxide and water.",
      "Mitosis is cellular division resulting in two genetically identical daughter cells, while meiosis produces gametes with half the genetic material.",
      "Evolution by natural selection is the primary mechanism driving adaptation and biodiversity in ecosystems."
    ],
    keyTerms: [
      { term: "Mitosis", meaning: "A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus." },
      { term: "Homeostasis", meaning: "The state of steady internal, physical, and chemical conditions maintained by living systems." },
      { term: "Ecosystem", meaning: "A biological community of interacting organisms and their physical environment." },
      { term: "Enzyme", meaning: "A protein molecule that acts as a biological catalyst, speeding up chemical reactions without being consumed." },
      { term: "Genotype", meaning: "The genetic constitution of an individual organism, contrasting with its visible phenotype." }
    ],
    questions: [
      {
        question: "Which organelle is known as the power house of the cell because it generates most of the ATP?",
        type: "mcq",
        options: ["Nucleus", "Mitochondria", "Chloroplast", "Golgi Apparatus"],
        correctAnswer: "Mitochondria",
        explanation: "Mitochondria are the sites of cellular respiration, where organic nutrients are oxidized to produce ATP (adenosine triphosphate), the cell's primary energy currency.",
        difficulty: "easy"
      },
      {
        question: "What chemical substance do plants absorb from the air during the process of photosynthesis?",
        type: "mcq",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Carbon Monoxide"],
        correctAnswer: "Carbon Dioxide",
        explanation: "Plants absorb Carbon Dioxide (CO2) from the atmosphere through microscopic pores called stomata, using it to construct glucose molecules.",
        difficulty: "easy"
      },
      {
        question: "DNA replication takes place in which phase of the cell cycle?",
        type: "mcq",
        options: ["G1 Phase", "G2 Phase", "M Phase (Mitosis)", "S Phase (Synthesis)"],
        correctAnswer: "S Phase (Synthesis)",
        explanation: "The S phase (Synthesis phase) of the cell cycle is responsible for the duplication of DNA so that each new cell receives a complete copy of the genome.",
        difficulty: "medium"
      },
      {
        question: "True or False: Meiosis produces four genetically identical diploid daughter cells.",
        type: "true-false",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "Meiosis produces four genetically *diverse* *haploid* daughter cells (gametes), which have half the chromosome number of the original cell.",
        difficulty: "medium"
      },
      {
        question: "What is the main function of the ribose sugar in RNA compared to deoxyribose in DNA?",
        type: "mcq",
        options: [
          "It carries an extra hydroxyl (-OH) group, making RNA more reactive and less stable than DNA",
          "It allows RNA to form a perfect double helix",
          "It prevents enzymes from digesting RNA",
          "It contains one less oxygen atom, making it more stable"
        ],
        correctAnswer: "It carries an extra hydroxyl (-OH) group, making RNA more reactive and less stable than DNA",
        explanation: "Ribose has a hydroxyl group (-OH) at the 2' carbon position, whereas deoxyribose has only a hydrogen (-H). This extra oxygen makes RNA chemically more reactive and flexible, fitting its role as a transient messenger, while DNA remains a stable repository.",
        difficulty: "hard"
      },
      {
        question: "What is the name of the light-sensitive pigment in plants responsible for starting photosynthesis?",
        type: "short-answer",
        correctAnswer: "chlorophyll",
        explanation: "Chlorophyll is the green pigment located in chloroplasts that absorbs light energy (primarily blue and red wavelengths) to drive the synthesis of organic compounds.",
        difficulty: "easy"
      },
      {
        question: "Which evolutionary mechanism is characterized by random changes in allele frequencies within a small population over time?",
        type: "mcq",
        options: ["Natural Selection", "Gene Flow", "Genetic Drift", "Non-random Mating"],
        correctAnswer: "Genetic Drift",
        explanation: "Genetic Drift is the change in the frequency of an existing gene variant (allele) in a population due to random sampling and chance events, most pronounced in small populations.",
        difficulty: "hard"
      }
    ]
  },
  history: {
    summary: "History is the systematic study and documentation of past human events. By analyzing primary sources, archival records, and archaeological evidence, historians reconstruct narratives of previous civilizations. Studying history helps humans understand cultural evolutions, the origins of modern societal systems, and the patterns of international conflict and cooperation.",
    keyPoints: [
      "World War I (1914-1918) was triggered by the assassination of Archduke Franz Ferdinand, leading to the collapse of multiple empires.",
      "The Treaty of Versailles imposed heavy reparations on Germany, contributing to economic instability and the rise of Nazism in the 1930s.",
      "World War II (1939-1945) was the deadliest conflict in human history, culminating in the establishment of the United Nations.",
      "The Cold War (1947-1991) was a period of geopolitical tension between the United States and the Soviet Union, characterized by proxy wars.",
      "The Industrial Revolution started in Great Britain in the 18th century, fundamentally shifting agrarian economies to industrial ones."
    ],
    keyTerms: [
      { term: "Imperialism", meaning: "A policy of extending a country's power and influence through diplomacy or military force." },
      { term: "Appeasement", meaning: "A diplomatic policy of making political or material concessions to an aggressive power in order to avoid conflict." },
      { term: "Renaissance", meaning: "A fervent period of European cultural, artistic, political, and scientific rebirth from the 14th to the 17th century." },
      { term: "Feudalism", meaning: "The dominant social system in medieval Europe, in which nobility held lands from the Crown in exchange for military service." },
      { term: "Cold War", meaning: "A state of political hostility between countries characterized by threats, propaganda, and other measures short of open warfare." }
    ],
    questions: [
      {
        question: "Which event is widely considered the immediate trigger that ignited World War I in Europe?",
        type: "mcq",
        options: [
          "The invasion of Poland by Germany",
          "The sinking of the Lusitania",
          "The assassination of Archduke Franz Ferdinand",
          "The signing of the Treaty of Versailles"
        ],
        correctAnswer: "The assassination of Archduke Franz Ferdinand",
        explanation: "Archduke Franz Ferdinand of Austria was assassinated in Sarajevo on June 28, 1914, by Gavrilo Princip, setting off a diplomatic crisis and activating alliances that led to WWI.",
        difficulty: "easy"
      },
      {
        question: "True or False: The United States joined the League of Nations immediately after World War I.",
        type: "true-false",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "Despite President Woodrow Wilson heavily advocating for the League of Nations, the US Senate rejected the Treaty of Versailles, and the US never joined the League.",
        difficulty: "medium"
      },
      {
        question: "In which year did the Berlin Wall fall, symbolizing the impending collapse of the Iron Curtain and the end of the Cold War?",
        type: "mcq",
        options: ["1985", "1989", "1991", "1993"],
        correctAnswer: "1989",
        explanation: "The Berlin Wall was opened and began to be dismantled on November 9, 1989, representing the reunification of Germany and the collapse of communist regimes in Eastern Europe.",
        difficulty: "easy"
      },
      {
        question: "Which document, signed by King John of England in 1215, established the principle that everyone, including the king, is subject to the law?",
        type: "short-answer",
        correctAnswer: "magna carta",
        explanation: "The Magna Carta ('Great Charter') established the rule of law, limiting the absolute power of the monarchy and protecting individual barons' rights.",
        difficulty: "medium"
      },
      {
        question: "What was the primary purpose of the Marshall Plan enacted by the United States in 1948?",
        type: "mcq",
        options: [
          "To rebuild war-torn Europe and contain the spread of Soviet communism",
          "To establish military bases in East Asia",
          "To punish Germany with harsh financial penalties",
          "To colonize parts of Northern Africa"
        ],
        correctAnswer: "To rebuild war-torn Europe and contain the spread of Soviet communism",
        explanation: "The Marshall Plan (European Recovery Program) supplied over $13 billion in economic aid to rebuild Western European economies, successfully promoting stability and halting communist influence.",
        difficulty: "medium"
      },
      {
        question: "During World War II, what was the codename for the secret United States research and development project that created the first nuclear weapons?",
        type: "short-answer",
        correctAnswer: "manhattan project",
        explanation: "The Manhattan Project was led by the United States with support from the UK and Canada, culminating in the creation of the atomic bombs dropped on Hiroshima and Nagasaki.",
        difficulty: "medium"
      },
      {
        question: "Which peace conference in 1945 saw Roosevelt, Churchill, and Stalin split post-war Germany into four occupation zones?",
        type: "mcq",
        options: ["Potsdam Conference", "Yalta Conference", "Tehran Conference", "Paris Peace Conference"],
        correctAnswer: "Yalta Conference",
        explanation: "The Yalta Conference in February 1945 shaped the post-war European peace, establishing zones of occupation, planning the UN, and securing Soviet participation against Japan.",
        difficulty: "hard"
      }
    ]
  },
  physics: {
    summary: "Physics is the fundamental science that studies matter, its motion and behavior through space and time, and the related entities of energy and force. It covers classical mechanics, thermodynamics, electromagnetism, relativity, and quantum mechanics. Understanding physics is vital to grasping how the universe works, from subatomic particles to massive galaxies.",
    keyPoints: [
      "Newton's Laws of Motion describe the relationship between a body and the forces acting upon it, laying the foundations of classical mechanics.",
      "The Law of Conservation of Energy states that energy cannot be created or destroyed, only transformed from one form to another.",
      "Einstein's Theory of Special Relativity demonstrates that space and time are linked, and mass can be converted into energy (E=mc²).",
      "Quantum Mechanics governs the probabilistic behavior of atoms and subatomic particles, departing from classical determinism.",
      "Electromagnetism is the unified force between electric charges and magnetic fields, traveling as light waves at a constant speed in a vacuum."
    ],
    keyTerms: [
      { term: "Entropy", meaning: "A measure of the thermal energy of a system per unit temperature that is unavailable for doing useful work, or a measure of system disorder." },
      { term: "Quantum", meaning: "The minimum amount of any physical entity involved in an interaction; a discrete packet of energy." },
      { term: "Relativity", meaning: "The geometric theory of gravitation published by Albert Einstein, describing gravity as the warping of spacetime by mass and energy." },
      { term: "Inertia", meaning: "The tendency of an object to resist changes in its state of motion." },
      { term: "Superposition", meaning: "A principle in quantum mechanics where a physical system exists in multiple states simultaneously until it is measured." }
    ],
    questions: [
      {
        question: "Which of Newton's laws states that for every action, there is an equal and opposite reaction?",
        type: "mcq",
        options: ["First Law", "Second Law", "Third Law", "Fourth Law"],
        correctAnswer: "Third Law",
        explanation: "Newton's Third Law of Motion declares that forces always occur in matched pairs. If Object A exerts a force on Object B, Object B exerts an equal but opposite force on Object A.",
        difficulty: "easy"
      },
      {
        question: "What is the speed of light in a vacuum, represented by the letter 'c'?",
        type: "mcq",
        options: [
          "Approx. 300,000 meters per second",
          "Approx. 3,000,000 meters per second",
          "Approx. 300,000,000 meters per second",
          "Approx. 30,000,000 meters per second"
        ],
        correctAnswer: "Approx. 300,000,000 meters per second",
        explanation: "The speed of light in vacuum is exactly 299,792,458 meters per second, which is commonly rounded to 3 x 10^8 m/s (300 million m/s).",
        difficulty: "easy"
      },
      {
        question: "True or False: A thermodynamic system can transfer heat from a colder body to a hotter body without doing external work.",
        type: "true-false",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "According to the Second Law of Thermodynamics (Clausius statement), heat cannot spontaneously flow from a cooler body to a warmer body; it requires external work (like in a refrigerator).",
        difficulty: "medium"
      },
      {
        question: "What subatomic particle has a negative charge and orbits the atomic nucleus?",
        type: "short-answer",
        correctAnswer: "electron",
        explanation: "Electrons are negatively charged particles that reside in orbitals surrounding the positively charged nucleus of protons and neutrons.",
        difficulty: "easy"
      },
      {
        question: "Which quantum phenomenon describes particles becoming interconnected such that the state of one instantly influences the other, regardless of distance?",
        type: "mcq",
        options: ["Quantum Superposition", "Quantum Tunneling", "Quantum Entanglement", "Quantum Decoherence"],
        correctAnswer: "Quantum Entanglement",
        explanation: "Quantum Entanglement is a physical phenomenon that occurs when pairs or groups of particles generate or interact in ways such that the quantum state of each particle cannot be described independently of the state of the others.",
        difficulty: "medium"
      },
      {
        question: "What is the term for the minimum energy required to remove an electron from the surface of a metal in the photoelectric effect?",
        type: "short-answer",
        correctAnswer: "work function",
        explanation: "The work function is the minimum thermodynamic energy needed to remove an electron from a solid (usually metal) to a point in the vacuum immediately outside the solid surface.",
        difficulty: "hard"
      },
      {
        question: "According to Einstein's General Theory of Relativity, what is gravity?",
        type: "mcq",
        options: [
          "An instantaneous pulling force exerted by dense objects",
          "The exchange of magnetic particles between masses",
          "The curvature of spacetime caused by the distribution of mass and energy",
          "A friction-like force arising from air pressure"
        ],
        correctAnswer: "The curvature of spacetime caused by the distribution of mass and energy",
        explanation: "General Relativity posits that massive objects do not pull on other objects directly. Instead, they warp the geometry of space and time around them, and other objects move along the straightest lines (geodesics) through that warped spacetime.",
        difficulty: "hard"
      }
    ]
  },
  chemistry: {
    summary: "Chemistry is the scientific study of the properties, composition, and behavior of matter. It explores atoms, elements, molecules, compounds, chemical reactions, and chemical bonds. Often called the 'central science' because it bridges physics with biology and geology, chemistry lets us understand everything from cooking food and medicine to planetary geology and environmental science.",
    keyPoints: [
      "The Periodic Table organizes elements by atomic number (number of protons) and chemical properties.",
      "Chemical bonds form when atoms share electrons (covalent bonds) or transfer electrons (ionic bonds).",
      "The pH scale measures acidity or basicity, ranging from 0 (extremely acidic) to 14 (extremely alkaline), with 7 being neutral.",
      "Conservation of Mass dictates that chemical equations must be balanced; atoms are neither created nor destroyed in a reaction.",
      "Organic chemistry is the dedicated study of carbon-based compounds, which form the foundation of all known life."
    ],
    keyTerms: [
      { term: "Covalent Bond", meaning: "A chemical bond formed when two atoms share one or more pairs of electrons." },
      { term: "Catalyst", meaning: "A substance that increases the rate of a chemical reaction without itself undergoing any permanent chemical change." },
      { term: "Isotopes", meaning: "Atoms of the same element that have the same number of protons but different numbers of neutrons." },
      { term: "Molecule", meaning: "A group of atoms bonded together, representing the smallest fundamental unit of a chemical compound." },
      { term: "Exothermic", meaning: "A reaction or process that releases energy in the form of heat to its surroundings." }
    ],
    questions: [
      {
        question: "What is the chemical symbol for gold?",
        type: "mcq",
        options: ["Ag", "Au", "Fe", "Pb"],
        correctAnswer: "Au",
        explanation: "The chemical symbol for gold is Au, derived from the Latin word 'aurum', which translates to 'shining dawn'.",
        difficulty: "easy"
      },
      {
        question: "What is the pH of pure, neutral water at room temperature?",
        type: "mcq",
        options: ["1", "5", "7", "14"],
        correctAnswer: "7",
        explanation: "Neutral water has an equal concentration of hydrogen (H+) and hydroxide (OH-) ions, representing a neutral pH of 7.",
        difficulty: "easy"
      },
      {
        question: "True or False: An oxidation reaction involves the gain of electrons by an atom or ion.",
        type: "true-false",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "Oxidation is the *loss* of electrons (remember OIL RIG: Oxidation Is Loss, Reduction Is Gain). Reduction is the gain of electrons.",
        difficulty: "medium"
      },
      {
        question: "Which element is the most abundant in the Earth's atmosphere by volume?",
        type: "mcq",
        options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"],
        correctAnswer: "Nitrogen",
        explanation: "Nitrogen gas (N2) makes up approximately 78.08% of the Earth's atmosphere, while Oxygen makes up about 20.95%.",
        difficulty: "easy"
      },
      {
        question: "What is the name of the chemical bond characterized by the electrostatic attraction between oppositely charged ions?",
        type: "short-answer",
        correctAnswer: "ionic bond",
        explanation: "An ionic bond is formed through the complete transfer of valence electrons from a metal to a non-metal, creating positive and negative ions that attract each other.",
        difficulty: "medium"
      },
      {
        question: "Which gas law states that the volume of a gas is directly proportional to its absolute temperature, assuming pressure and amount of gas remain constant?",
        type: "mcq",
        options: ["Boyle's Law", "Charles's Law", "Avogadro's Law", "Dalton's Law"],
        correctAnswer: "Charles's Law",
        explanation: "Charles's Law states V1/T1 = V2/T2. Volume and temperature increase proportionally if pressure is held constant.",
        difficulty: "medium"
      },
      {
        question: "In a water molecule, what causes the bond angle to compress to approximately 104.5 degrees, rather than the ideal tetrahedral angle of 109.5 degrees?",
        type: "mcq",
        options: [
          "The gravitational attraction between hydrogen atoms",
          "The repulsion between the two lone pairs of electrons on the oxygen atom",
          "The high electronegativity of the hydrogen nucleus",
          "The presence of double bonds in the water molecule"
        ],
        correctAnswer: "The repulsion between the two lone pairs of electrons on the oxygen atom",
        explanation: "According to VSEPR theory, lone pairs of electrons exert greater repulsive forces than bonding pairs. Oxygen has two lone pairs that squeeze the two hydrogen-oxygen single bonds together, narrowing the angle from 109.5 to 104.5 degrees.",
        difficulty: "hard"
      }
    ]
  }
};

// Generates rich templates dynamically for ANY subject not found in the popular data bank
function generateDynamicQuizData(subject: string): typeof POPULAR_SUBJECT_DATA['biology'] {
  const cleanSubject = subject.trim();
  const formattedName = cleanSubject.charAt(0).toUpperCase() + cleanSubject.slice(1);
  
  return {
    summary: `${formattedName} represents a key academic discipline focused on expanding our knowledge of this specialized topic. By studying ${cleanSubject}, scholars and students analyze core concepts, systematic interactions, and historical developments. It plays an indispensable role in modern science, culture, and education, helping us solve real-world problems and formulate structured theories based on empirical research and analytical frameworks.`,
    keyPoints: [
      `Understanding the foundational principles of ${formattedName} is critical for interpreting modern research and developments.`,
      `Key hypotheses in ${cleanSubject} help structure academic inquiries and guide practical applications in industry and research.`,
      `Pioneers of ${cleanSubject} developed rigorous theories that challenged traditional systems and revolutionized how we approach this field.`,
      `Modern applications of ${cleanSubject} leverage high-technology methods, numerical computing, or advanced qualitative models.`,
      `Ongoing challenges and unresolved questions in ${cleanSubject} stimulate continuous innovation, interdisciplinary collaborations, and public discourse.`
    ],
    keyTerms: [
      { term: `${formattedName} Core Paradigm`, meaning: `The overarching framework and set of practices that define scientific or scholarly inquiry in the study of ${cleanSubject}.` },
      { term: `Empirical Synthesis`, meaning: `The integration of observational data and theoretical frameworks to draw coherent conclusions about ${cleanSubject} events.` },
      { term: `Systemic Interaction`, meaning: `The complex dynamics and feedback loops that exist between separate components in the ${cleanSubject} network.` },
      { term: `Conceptual Framework`, meaning: `A structured network of connected ideas, terms, and assertions that guides research and clarifies problems in ${cleanSubject}.` },
      { term: `Axiomatic Principle`, meaning: `A self-evident statement or proposition that serves as a starting point for developing theories in ${cleanSubject}.` }
    ],
    questions: [
      {
        question: `What is the primary objective when researchers analyze the core parameters of ${formattedName}?`,
        type: "mcq",
        options: [
          `To establish verified relationships and structural frameworks`,
          `To dismiss historical records in favor of unsupported claims`,
          `To isolate variables so they never interact with each other`,
          `To prove that external environments have zero effect on the subject`
        ],
        correctAnswer: `To establish verified relationships and structural frameworks`,
        explanation: `Studying ${formattedName} seeks to discover verifiable connections, laws, or descriptive models that help us predict outcomes and explain complex observations.`,
        difficulty: "easy"
      },
      {
        question: `True or False: In the study of ${cleanSubject}, the initial conditions and context play an essential role in determining outcomes.`,
        type: "true-false",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: `Almost all models in ${formattedName} demonstrate that contextual variables, initial parameters, and boundary conditions dramatically affect how a system behaves.`,
        difficulty: "easy"
      },
      {
        question: `Which of the following best describes a major modern challenge in the advanced development of ${cleanSubject}?`,
        type: "mcq",
        options: [
          `Successfully scaling experimental observations into a universal, unified theory`,
          `Forgetting all prior research and starting from scratch every decade`,
          `The complete lack of interest from academic institutions`,
          `Ensuring that no computers are used during data gathering`
        ],
        correctAnswer: `Successfully scaling experimental observations into a universal, unified theory`,
        explanation: `Bridging micro-level behaviors or specific local experiments into macro-level, generalizable laws remains a central challenge across many fields of ${formattedName}.`,
        difficulty: "medium"
      },
      {
        question: `What is the basic term for a structured explanation of an aspect of the natural or social world that can be repeatedly tested in ${cleanSubject}?`,
        type: "short-answer",
        correctAnswer: "theory",
        explanation: `A scientific theory is a structured, well-substantiated explanation of facts in the real world that has been repeatedly confirmed through observation and experimentation.`,
        difficulty: "medium"
      },
      {
        question: `How does the concept of 'Empirical Synthesis' contribute to modern breakthroughs in ${formattedName}?`,
        type: "mcq",
        options: [
          `It integrates diverse experiments and theories to resolve conflicting data and create unified models`,
          `It restricts research strictly to a single library or textbook`,
          `It relies solely on opinion rather than observed events`,
          `It is a historical term that has no active application today`
        ],
        correctAnswer: `It integrates diverse experiments and theories to resolve conflicting data and create unified models`,
        explanation: `Empirical synthesis merges multiple lines of evidence and disparate research studies into a single, cohesive, and far more robust explanation than any single trial could offer.`,
        difficulty: "hard"
      },
      {
        question: `In the context of research, what is the term used for a testable statement about the relationship between two or more variables in ${cleanSubject}?`,
        type: "short-answer",
        correctAnswer: "hypothesis",
        explanation: `A hypothesis is a precise, testable proposed explanation or prediction that serves as the starting point for further investigation.`,
        difficulty: "medium"
      },
      {
        question: `Which methodologies are most frequently associated with rigorous qualitative analysis in ${formattedName}?`,
        type: "mcq",
        options: [
          `Systematic observation, case studies, and content analysis`,
          `Random guessing and uncalibrated opinion polls`,
          `Ignoring source materials and inventing custom definitions`,
          `Applying mathematical formulas to non-numerical values exclusively`
        ],
        correctAnswer: `Systematic observation, case studies, and content analysis`,
        explanation: `Rigorous qualitative inquiry relies on highly systematic observational logging, deep case study reviews, and structured text or content coding.`,
        difficulty: "hard"
      }
    ]
  };
}

// Helper to filter questions by requested config parameters (difficulty, type) and shuffle them
function filterAndSelectQuestions(
  allQuestions: typeof POPULAR_SUBJECT_DATA['biology']['questions'],
  config: QuizConfig
): QuizQuestion[] {
  const { difficulty, questionCount, questionType } = config;
  
  // Filter by difficulty if possible (fallback to all if not enough questions match)
  let filtered = allQuestions.filter(q => q.difficulty === difficulty || difficulty === 'medium');
  if (filtered.length < 3) {
    filtered = allQuestions; // fallback
  }
  
  // Filter by question type if specified
  if (questionType !== 'mixed') {
    const typeMap = {
      'mcq': 'mcq',
      'true-false': 'true-false',
      'short-answer': 'short-answer'
    };
    const targetType = typeMap[questionType];
    const typeFiltered = filtered.filter(q => q.type === targetType);
    if (typeFiltered.length >= 3) {
      filtered = typeFiltered;
    }
  }
  
  // Shuffle and select required count
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
  
  // If we still don't have enough questions, duplicate with new IDs or add generic questions
  while (selected.length < questionCount) {
    const randomBase = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    selected.push({
      ...randomBase,
      question: `${randomBase.question} (Review variant)`
    });
  }
  
  return selected.map((q, idx) => ({
    id: `q_${idx + 1}`,
    question: q.question,
    type: q.type,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    subject: config.subject,
    difficulty: q.difficulty
  }));
}

// Real Google Gemini API request
async function generateQuizWithGemini(config: QuizConfig, apiKey: string): Promise<QuizSession> {
  const { subject, difficulty, questionCount, questionType } = config;
  
  const systemPrompt = `You are an expert educator. Generate quiz questions, flashcards, and a comprehensive summary about a given subject. You must reply in STRICT JSON format. Your response must contain exactly three keys:
  1. "questions": An array of objects matching the QuizQuestion type.
  2. "flashcards": An array of objects matching the Flashcard type.
  3. "flashNote": An object matching the FlashNote type.
  
  No markdown wraps, no \`\`\`json, no leading/trailing conversational text. Just the raw JSON.
  
  TypeScript interfaces:
  interface QuizQuestion {
    id: string;
    question: string;
    type: 'mcq' | 'true-false' | 'short-answer';
    options?: string[]; // 4 options for mcq, 2 options (True, False) for true-false, omit/undefined for short-answer
    correctAnswer: string; // exact matching option for mcq/true-false, simple word/phrase for short-answer
    explanation: string;
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }
  
  interface Flashcard {
    id: string;
    term: string;
    definition: string;
    subject: string;
    mastered: boolean;
  }
  
  interface FlashNote {
    subject: string;
    summary: string; // 3-5 sentences high-level overview
    keyPoints: string[]; // 4-6 bullet points
    keyTerms: Array<{ term: string, meaning: string }>; // 5 core terms
  }`;

  const userPrompt = `Generate a quiz about "${subject}".
  Config details:
  - Difficulty: ${difficulty}
  - Number of questions: ${questionCount}
  - Question type: ${questionType}
  
  Provide ${questionCount} questions. Make sure all questions are highly educational.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            { text: systemPrompt }
          ]
        },
        contents: [
          {
            role: 'user',
            parts: [
              { text: userPrompt }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Simple JSON extractor
    let jsonString = rawText.trim();
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }
    
    const parsed = JSON.parse(jsonString);
    
    // Map and format into complete session
    const questions: QuizQuestion[] = parsed.questions.map((q: any, idx: number) => ({
      ...q,
      id: q.id || `q_${idx + 1}`,
      subject,
      difficulty
    }));

    const flashcards: Flashcard[] = parsed.flashcards.map((c: any, idx: number) => ({
      ...c,
      id: c.id || `c_${idx + 1}`,
      subject,
      mastered: false
    }));

    const flashNote: FlashNote = {
      subject,
      summary: parsed.flashNote?.summary || `A summary of ${subject}`,
      keyPoints: parsed.flashNote?.keyPoints || [],
      keyTerms: parsed.flashNote?.keyTerms || []
    };

    return {
      id: `sess_${Math.random().toString(36).slice(2, 11)}`,
      userId: '', // will be populated by store
      subject,
      difficulty,
      questions,
      answers: [],
      score: 0,
      totalQuestions: questions.length,
      completedAt: '',
      createdAt: new Date().toISOString(),
      flashcards,
      flashNote
    };
  } catch (e) {
    console.error("Gemini API direct call failed, falling back to Simulator:", e);
    throw e; // Propagate to allow fallback triggering or error notice
  }
}

// Simulator Generator
export async function generateQuiz(config: QuizConfig, apiKey?: string, useGemini = false): Promise<QuizSession> {
  // Simulate latency
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (useGemini && apiKey) {
    try {
      return await generateQuizWithGemini(config, apiKey);
    } catch (e) {
      console.warn("Live Gemini generation failed. Using high-fidelity simulator fallback.");
    }
  }

  // Realistic Simulator
  const normSubject = config.subject.toLowerCase().trim();
  let rawData = POPULAR_SUBJECT_DATA[normSubject];
  
  // Find fuzzy match in popular data
  if (!rawData) {
    const matchedKey = Object.keys(POPULAR_SUBJECT_DATA).find(key => 
      normSubject.includes(key) || key.includes(normSubject)
    );
    if (matchedKey) {
      rawData = POPULAR_SUBJECT_DATA[matchedKey];
    }
  }

  // Generate dynamic data if no matches exist
  if (!rawData) {
    rawData = generateDynamicQuizData(config.subject);
  }

  // Assemble session
  const questions = filterAndSelectQuestions(rawData.questions, config);
  const flashcards: Flashcard[] = rawData.keyTerms.map((termItem, idx) => ({
    id: `card_${idx + 1}`,
    term: termItem.term,
    definition: termItem.meaning,
    subject: config.subject,
    mastered: false
  }));

  const flashNote: FlashNote = {
    subject: config.subject,
    summary: rawData.summary,
    keyPoints: rawData.keyPoints,
    keyTerms: rawData.keyTerms
  };

  return {
    id: `sess_${Math.random().toString(36).slice(2, 11)}`,
    userId: '', // will be set by store
    subject: config.subject,
    difficulty: config.difficulty,
    questions,
    answers: [],
    score: 0,
    totalQuestions: questions.length,
    completedAt: '',
    createdAt: new Date().toISOString(),
    flashcards,
    flashNote
  };
}

// AI Chatbot messaging service
export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  context: { subject?: string; currentQuestion?: string },
  apiKey?: string,
  useGemini = false
): Promise<{ reply: string; updatedHistory: ChatMessage[] }> {
  const systemPrompt = `You are a friendly, encouraging, and intelligent AI study assistant named "QuizAI Coach" (powered by Google Gemini). 
  You help explain academic concepts, give clever hints, and make learning fun. 
  Current subject context: ${context.subject || "General knowledge"}.
  ${context.currentQuestion ? `If the student is asking about this current quiz question, explain the concept behind it, give hints, or clarify their mistake, but DO NOT give away the correct answer directly unless they explicitly ask for it: "${context.currentQuestion}"` : ""}
  Keep answers concise (2-4 sentences) to match a floating chat widget, unless the student asks for a detailed explanation.
  Always maintain an encouraging, empathetic tone suitable for a student.`;

  if (useGemini && apiKey) {
    try {
      // Formulate the Gemini contents list mapping role user/model
      const apiHistory = history.slice(-8).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              { text: systemPrompt }
            ]
          },
          contents: [
            ...apiHistory,
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that request.";
        const newMsg: ChatMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
        const replyMsg: ChatMessage = { role: 'assistant', content: reply, timestamp: new Date().toISOString() };
        return {
          reply,
          updatedHistory: [...history, newMsg, replyMsg]
        };
      }
    } catch (e) {
      console.error("Gemini Chat API failed, falling back to Simulator:", e);
    }
  }

  // High-quality simulator responses based on question and subject context
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let reply = "";
  const userText = message.toLowerCase();

  if (userText.includes("hint") || userText.includes("clue")) {
    if (context.currentQuestion) {
      reply = `Here's a hint for this question: Think about the core mechanism involved. Focus on the underlying definition we talked about in the key points. Try to eliminate options that contradict the main process!`;
    } else {
      reply = `Sure! When studying ${context.subject || 'this topic'}, focus on the fundamental parts first. Ask yourself: what are the input materials and what are the outputs?`;
    }
  } else if (userText.includes("explain") || userText.includes("why") || userText.includes("what is")) {
    if (context.currentQuestion) {
      reply = `Let's break this question down! The question asks about "${context.currentQuestion.substring(0, 80)}...". The core concept here is that every system operates under conservation rules or distinct structures (like mitochondria for power, or the Treaty of Versailles for post-war conditions). That's why the correct option fits perfectly while the others are either irrelevant or happen at a different stage!`;
    } else if (context.subject) {
      reply = `Great question! The study of "${context.subject}" is centered around key structures and relationships. For example, in this topic, we study how elements interact, change forms, or evolve under external forces. Understanding the basic terminology (like the ones on your flashcards!) is the best shortcut to mastering it.`;
    } else {
      reply = `I'd love to explain! When dealing with academic topics, it helps to break them down into inputs, processes, and outputs. What specific part of this concept is giving you trouble? I can provide a simplified analogy!`;
    }
  } else if (userText.includes("hello") || userText.includes("hi ") || userText.includes("hey")) {
    reply = `Hello! I'm your QuizAI study coach. 📚 I have full context of our active subject ${context.subject ? `(${context.subject})` : ""} and can help explain tricky questions, give you learning hints, or quiz you on terms. What shall we study?`;
  } else {
    reply = `That's a fascinating point! In ${context.subject || 'our study session'}, this connects directly to our main learning outcomes. A great way to solidify this is to review your study flashcards or ask me to test you on key terms! Let me know if you need a hint on the current question.`;
  }

  const newMsg: ChatMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
  const replyMsg: ChatMessage = { role: 'assistant', content: reply, timestamp: new Date().toISOString() };

  return {
    reply,
    updatedHistory: [...history, newMsg, replyMsg]
  };
}
