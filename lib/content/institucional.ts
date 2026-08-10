/**
 * Contenido institucional de RRHH Working.
 *
 * FUENTE ÚNICA: "Portafolio RRHH. WORKING" (Canva, 3/8/2026), 11 páginas.
 * Todo lo de este archivo sale del portafolio. Si un dato no está ahí, no está
 * acá: no hay horarios de atención, direcciones, años de fundación, cantidad de
 * clientes ni nombres de empresas, porque el portafolio no los menciona.
 *
 * Centralizado para que las páginas públicas no dupliquen textos y para que
 * actualizar el portafolio sea un solo cambio.
 */

import type { IconName } from "@/components/ui/Icon";

export const BRAND = {
  name: "RRHH Working",
  tagline: "Soluciones innovadoras para la gestión de talentos",
  location: "San Salvador de Jujuy, Argentina",
} as const;

/**
 * Datos de contacto. Punto único de cambio: los usan la página de contacto, el
 * pie, la metadata y el aviso de privacidad.
 *
 * `phone` es lo que se muestra; `phoneHref` es lo que se marca. Van separados a
 * propósito: el formato legible (espacios, guiones) rompe el enlace `tel:` en
 * algunos teléfonos, y el formato internacional (+54...) se lee mal en pantalla.
 * Al cambiar el número hay que actualizar los dos.
 */
export const CONTACT = {
  email: "rrhhworking17@gmail.com",
  phone: "388 329 5992",
  phoneHref: "tel:+543883295992",
} as const;

// ---------------------------------------------------------------------------
// Quiénes somos
// ---------------------------------------------------------------------------

export const ABOUT_PARAGRAPHS = [
  "En RRHH Working somos una consultora de Recursos Humanos ubicada en San Salvador de Jujuy, especializada en brindar soluciones estratégicas para empresas y acompañar a las personas en su desarrollo profesional.",
  "Nuestro equipo está integrado por licenciadas en Recursos Humanos con experiencia en reclutamiento, selección de personal, gestión del talento y capacitación, comprometidas con ofrecer un servicio cercano, transparente y adaptado a las necesidades de cada cliente.",
  "Comenzamos acompañando a personas en su búsqueda laboral mediante la optimización de currículums y perfiles profesionales. Con el tiempo ampliamos nuestros servicios para convertirnos en un aliado estratégico de las organizaciones, ofreciendo procesos de búsqueda y selección de personal, capacitaciones, asesoramiento en Recursos Humanos y soluciones orientadas a potenciar el crecimiento de empresas y profesionales.",
  "Trabajamos con un enfoque personalizado, utilizando metodologías actualizadas y herramientas innovadoras para conectar el talento adecuado con las oportunidades correctas.",
] as const;

export const VISION =
  "Ser una consultora de Recursos Humanos referente en Argentina, reconocida por la excelencia de nuestros servicios, la innovación en la gestión del talento y el compromiso con el crecimiento de empresas y profesionales. Aspiramos a generar un impacto positivo en el mercado laboral, construyendo relaciones de confianza y contribuyendo al desarrollo sostenible de las organizaciones.";

export const MISSION =
  "Brindar soluciones estratégicas e integrales en Recursos Humanos que impulsen el crecimiento de empresas y profesionales. Nos especializamos en el reclutamiento y selección de personal, consultoría, capacitación y desarrollo del talento, ofreciendo un servicio personalizado, ético e innovador que responda a las necesidades de cada organización.";

// ---------------------------------------------------------------------------
// Valores
// ---------------------------------------------------------------------------
// El portafolio lista los seis títulos sin descripción. Las descripciones son
// una síntesis del enfoque que el propio portafolio declara en "Quiénes somos"
// y en "Misión": no agregan compromisos que la empresa no haya enunciado.

export type Value = {
  title: string;
  description: string;
  icon: IconName;
};

export const VALUES: readonly Value[] = [
  {
    title: "Orientación a la persona",
    description: "Acompañamos a cada candidato en su desarrollo profesional, no solo en la búsqueda puntual.",
    icon: "person",
  },
  {
    title: "Compromiso",
    description: "Nos involucramos con el crecimiento de cada empresa y de cada profesional con los que trabajamos.",
    icon: "handshake",
  },
  {
    title: "Trabajo en equipo",
    description: "Un equipo de licenciadas en Recursos Humanos que aporta miradas complementarias a cada proceso.",
    icon: "team",
  },
  {
    title: "Confidencialidad",
    description: "La información de empresas y candidatos se trata con reserva en todas las etapas del proceso.",
    icon: "lock",
  },
  {
    title: "Ética y transparencia",
    description: "Procesos claros, con criterios explícitos y devoluciones honestas para ambas partes.",
    icon: "shield",
  },
  {
    title: "Innovación",
    description: "Metodologías actualizadas y herramientas innovadoras para conectar talento con oportunidades.",
    icon: "spark",
  },
];

// ---------------------------------------------------------------------------
// Servicios
// ---------------------------------------------------------------------------
// El portafolio agrupa la confección de CV, la carta de presentación y la
// optimización de perfiles bajo "Armado de Curriculum Vitae". Se presentan como
// tarjetas separadas porque son entregables distintos, pero sin agregar alcance
// que el portafolio no mencione.

export type Service = {
  title: string;
  description: string;
  icon: IconName;
  audience: "Empresas" | "Profesionales";
};

export const SERVICES: readonly Service[] = [
  {
    title: "Reclutamiento y selección de personal",
    description:
      "Un servicio de selección caracterizado por su seguridad y meticulosidad. El objetivo es garantizar la atracción del talento más adecuado para los puestos requeridos por nuestros clientes.",
    icon: "search",
    audience: "Empresas",
  },
  {
    title: "Difusión de ofertas laborales",
    description: "Difusión gratuita y voluntaria de oportunidades laborales disponibles en Argentina.",
    icon: "megaphone",
    audience: "Empresas",
  },
  {
    title: "Armado de Curriculum Vitae",
    description: "Confección y modificación de CV para presentar tu perfil de forma clara y competitiva.",
    icon: "document",
    audience: "Profesionales",
  },
  {
    title: "Carta de presentación",
    description: "Redacción de la carta que acompaña tu CV y ordena tu propuesta de valor frente a cada búsqueda.",
    icon: "mail",
    audience: "Profesionales",
  },
  {
    title: "Optimización de LinkedIn",
    description: "Revisión y mejora de tu perfil de LinkedIn para aumentar tu visibilidad ante reclutadores.",
    icon: "link",
    audience: "Profesionales",
  },
  {
    title: "Optimización de perfiles laborales",
    description: "Ajuste de tus perfiles en portales de empleo como CompuTrabajo para que reflejen tu experiencia real.",
    icon: "chart",
    audience: "Profesionales",
  },
];

// ---------------------------------------------------------------------------
// Proceso de búsqueda y selección
// ---------------------------------------------------------------------------
// Orden y contenido tal como los presenta el portafolio, en sus dos bloques:
// "Búsqueda y selección de personal" y "Proceso de selección".

export type ProcessStep = {
  title: string;
  description: string;
  stage: "Búsqueda" | "Selección";
};

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    title: "Encuentro con el cliente",
    description: "Una reunión inicial para detallar los requerimientos en relación con la búsqueda.",
    stage: "Búsqueda",
  },
  {
    title: "Definición del perfil del puesto",
    description:
      "Relevamiento del perfil: comprender las tareas y responsabilidades, y las habilidades, competencias, formación académica y experiencias necesarias para el puesto.",
    stage: "Búsqueda",
  },
  {
    title: "Entendimiento del cliente",
    description:
      "Conocer la cultura y los valores de la empresa para garantizar una buena adecuación cultural del candidato, y comprender las expectativas específicas para el puesto.",
    stage: "Búsqueda",
  },
  {
    title: "Selección de canales de reclutamiento",
    description:
      "Difusión en plataformas de empleo como LinkedIn y CompuTrabajo, y en redes sociales como Facebook e Instagram.",
    stage: "Búsqueda",
  },
  {
    title: "Creación de flyers y videos promocionales",
    description:
      "Piezas que resaltan la búsqueda, captan la atención de potenciales postulantes y difunden la oferta de forma más atractiva.",
    stage: "Búsqueda",
  },
  {
    title: "Filtro de candidatos",
    description: "Revisión y preselección de los CV recibidos.",
    stage: "Selección",
  },
  {
    title: "Entrevista telefónica",
    description: "Primer contacto para validar disponibilidad, expectativas y datos clave del perfil.",
    stage: "Selección",
  },
  {
    title: "Entrevista estructurada",
    description: "Entrevista en profundidad con guion definido, para evaluar a todos los candidatos con el mismo criterio.",
    stage: "Selección",
  },
  {
    title: "Verificación de referencias laborales",
    description: "Confirmación de la trayectoria declarada con empleadores anteriores.",
    stage: "Selección",
  },
  {
    title: "Presentación de candidatos al cliente",
    description:
      "Presentamos una selección de candidatos rigurosamente evaluada que cumple con las especificaciones del puesto.",
    stage: "Selección",
  },
  {
    title: "Informe final",
    description:
      "Confección y envío de informes con información detallada de cada candidato seleccionado: fortalezas, debilidades y los requisitos que se alinean con el puesto.",
    stage: "Selección",
  },
];

// ---------------------------------------------------------------------------
// Equipo
// ---------------------------------------------------------------------------
// Los cargos son exactamente los que declara el portafolio. Tania Cari no tiene
// un cargo enunciado, así que se usa su título profesional.

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  /**
   * Ruta de la foto en /public/equipo/. Es OPCIONAL a propósito: mientras
   * falte alguna, esa integrante muestra sus iniciales y la grilla no se rompe.
   *
   * Las fotos están recortadas en cuadrado (640x640) y con el rostro al mismo
   * tamaño dentro del encuadre, para que la fila se vea pareja. Si se agrega
   * una nueva, conviene respetar ese criterio.
   */
  photo?: string;
};

export const TEAM: readonly TeamMember[] = [
  {
    name: "Carolina Lobo",
    role: "Fundadora",
    photo: "/equipo/carolina-lobo.jpg",
    bio: "Licenciada en Recursos Humanos por la Universidad Católica de Salta. Cuenta con experiencia en el reclutamiento y selección de perfiles junior y senior, tanto en empresas como en instituciones educativas, además de formación especializada en selección de perfiles IT. Lidera los procesos de búsqueda y selección de talento.",
  },
  {
    name: "Mariana Garcia",
    role: "Fundadora",
    photo: "/equipo/mariana-garcia.jpg",
    bio: "Licenciada en Recursos Humanos por la Universidad Católica de Salta. Actualmente se desempeña como responsable del área de Recursos Humanos en una empresa líder del norte argentino. Participa en los procesos de selección y en el desarrollo de metodologías innovadoras para la atracción y retención del talento.",
  },
  {
    name: "Tania Cari",
    role: "Licenciada en Recursos Humanos",
    photo: "/equipo/tania-cari.jpg",
    bio: "Licenciada en Recursos Humanos por la Universidad Católica de Salta y diplomada en Derecho Laboral. Se especializa en la optimización de perfiles laborales y en el reclutamiento y selección por sector y función, contribuyendo a maximizar las oportunidades de incorporación de nuevos talentos. Además, lidera su propio emprendimiento personal.",
  },
];
