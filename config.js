/* Configuración pública del sitio y del asistente. */
window.VGL_CONFIG = {
  whatsapp: "584127753289",
  phoneDisplay: "0412-775-3289",
  phones: [
    {display: "0412-775-3289", e164: "+584127753289", wa: "584127753289"},
    {display: "0414-600-0222", e164: "+584146000222", wa: "584146000222"}
  ],
  email: "ventas@vanguardlubricantsgroup.com",
  emailInstitucional: "presidencia@vanguardlubricantsgroup.com",
  chatbot: {
    kbUrl: "/kb.json",
    /* MODO IA: APAGADO. No se hacen llamadas de IA mientras sea false. */
    aiMode: false,
    aiMaxPerSession: 5
  }
};
