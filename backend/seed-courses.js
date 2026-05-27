const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const DB_PATH = path.join(__dirname, "..", "data", "database.sqlite");

const COURSES = [
  { name: "Desenvolvimento Web HTML", totalHours: 8 },
  { name: "Desenvolvimento Web CSS 3", totalHours: 8 },
  { name: "Desenvolvimento Web Javascript", totalHours: 10 },
  { name: "Desenvolvimento Web WordPress", totalHours: 14 },
  { name: "Assistente Escrita Fiscal e Contabilidade", totalHours: 16 },
  { name: "Criando Aplicativo com Angular 12", totalHours: 12 },
  { name: "Criando Aplicativo com Ionic", totalHours: 17 },
  { name: "Criando Aplicativo com Cordova", totalHours: 11 },
  { name: "Desenvolvimento de Games 2D", totalHours: 24 },
  { name: "Desenvolvimento de Games 3D Módulo I", totalHours: 24 },
  { name: "Desenvolvimento de Games 3D Módulo II", totalHours: 16 },
  { name: "Recepcionista de Serviços de Saúde", totalHours: 16 },
  { name: "Cuidador de Idosos", totalHours: 16 },
  { name: "Adobe XD", totalHours: 10 },
  { name: "Adobe Indesign", totalHours: 16 },
  { name: "Atendente de Farmácia I", totalHours: 16 },
  { name: "Auxiliar Médico", totalHours: 16 },
  { name: "Introdução à Informática", totalHours: 16 },
  { name: "Secretariado", totalHours: 16 },
  { name: "Segurança do Trabalho", totalHours: 16 },
  { name: "Vendas", totalHours: 16 },
  { name: "Atendimento ao Cliente", totalHours: 16 },
  { name: "Matemática Financeira", totalHours: 16 },
  { name: "Word 2021", totalHours: 16 },
  { name: "Assistente de Administração Financeira", totalHours: 16 },
  { name: "Assistente de Departamento Pessoal", totalHours: 16 },
  { name: "Liderança", totalHours: 16 },
  { name: "Gestão de Pessoas", totalHours: 16 },
  { name: "Assistente de Recursos Humanos", totalHours: 16 },
  { name: "Assistente de Propaganda e Marketing", totalHours: 16 },
  { name: "Assistente Administrativo e Rotinas Administrativas I", totalHours: 16 },
  { name: "Operador de Caixa", totalHours: 16 },
  { name: "Atendente de Farmácia II", totalHours: 16 },
  { name: "Custos", totalHours: 16 },
  { name: "Crédito e Cobrança", totalHours: 16 },
  { name: "Segurança na Era Digital", totalHours: 16 },
  { name: "Robótica Módulo V (Arduíno com IOT) Parte II", totalHours: 40 },
  { name: "Robótica Módulo V (Arduíno com IOT) Parte III", totalHours: 40 },
  { name: "Marketing Digital I", totalHours: 16 },
  { name: "Marketing Digital II", totalHours: 16 },
  { name: "Operador de Telemarketing", totalHours: 16 },
  { name: "Compras e Estoque", totalHours: 16 },
  { name: "Assistente de Logística", totalHours: 16 },
  { name: "Google e Redes Sociais", totalHours: 16 },
  { name: "Windows 11", totalHours: 16 },
  { name: "Excel 2021", totalHours: 16 },
  { name: "PowerPoint 2021", totalHours: 16 },
  { name: "Internet e Outlook 2021", totalHours: 16 },
  { name: "Excel 2021 Avançado Módulo I", totalHours: 16 },
  { name: "Excel 2021 Avançado Módulo II", totalHours: 16 },
  { name: "Auxiliar Odontológico - Saúde Bucal", totalHours: 16 },
  { name: "CorelDraw Módulo I", totalHours: 24 },
  { name: "Programação C# Módulo II", totalHours: 16 },
  { name: "CorelDraw Módulo II", totalHours: 16 },
  { name: "Manutenção de Notebooks", totalHours: 16 },
  { name: "Manutenção de Dispositivos Móveis", totalHours: 16 },
  { name: "Power BI", totalHours: 16 },
  { name: "Assistente Administrativo e Rotinas Administrativas II", totalHours: 16 },
  { name: "Adobe Photoshop Creative Cloud - Módulo I", totalHours: 16 },
  { name: "Adobe Photoshop Creative Cloud - Módulo II", totalHours: 16 },
  { name: "Adobe Photoshop Creative Cloud - Módulo III", totalHours: 16 },
  { name: "Adobe Illustrator Creative Cloud", totalHours: 16 },
  { name: "Adobe After Effects Creative Cloud", totalHours: 16 },
  { name: "Adobe Premiere Creative Cloud", totalHours: 16 },
  { name: "Teoria e Metodologias de Gestão de Projetos", totalHours: 16 },
  { name: "Ferramentas para Gestão de Projetos", totalHours: 16 },
  { name: "Fundamentos de Gestão de Projetos", totalHours: 16 },
  { name: "Marketing Pessoal", totalHours: 16 },
  { name: "Educação Financeira", totalHours: 16 },
  { name: "Produtividade e Gestão do Tempo", totalHours: 16 },
  { name: "Negociação, Objeções e Influência", totalHours: 16 },
  { name: "Inovação e Criatividade", totalHours: 16 },
  { name: "Comunicação e Oratória", totalHours: 16 },
  { name: "Inteligência Emocional", totalHours: 16 },
  { name: "Programação C# Módulo I", totalHours: 16 },
  { name: "Programação C# Módulo III", totalHours: 16 },
  { name: "Programação C# Módulo IV", totalHours: 16 },
  { name: "Redes - Cabeamento e Infraestrutura", totalHours: 13 },
  { name: "Redes - Tecnologia Wireless", totalHours: 8 },
  { name: "Redes - Lógica e Estruturação", totalHours: 12 },
  { name: "Montagem e Manutenção de Hardware", totalHours: 16 },
  { name: "Inteligência Artificial 1", totalHours: 16 },
  { name: "Inteligência Artificial 2", totalHours: 16 },
  { name: "Da computação à IA: Evolução Tecnológica", totalHours: 16 },
  { name: "Domine o Windows com a força da IA", totalHours: 16 },
  { name: "Documentos Inteligentes com IA", totalHours: 16 },
  { name: "Excel com IA: Análise de Dados Inteligente", totalHours: 16 },
  { name: "Transforme suas Apresentações com IA", totalHours: 16 },
  { name: "IA para Navegação e Comunicação Eficiente", totalHours: 16 },
  { name: "Canva", totalHours: 16 },
  { name: "Python Personalizado Prepara", totalHours: 16 },
  { name: "Figma", totalHours: 16 },
  { name: "Análise de Dados", totalHours: 16 },
  { name: "Adobe Premiere", totalHours: 16 },
  { name: "Adobe After Effects", totalHours: 16 },
  { name: "Adobe Illustrator", totalHours: 16 },
  { name: "Banco de Dados SQL", totalHours: 16 },
  { name: "Empreendedorismo", totalHours: 16 },
  { name: "Lógica de Programação", totalHours: 12 },
  { name: "Preparatório ENEM", totalHours: 96 },
  { name: "Robótica Módulo V (Arduíno com IOT) Parte I", totalHours: 42 },
  { name: "Robótica Módulo IV (Competição Mio) - Parte I", totalHours: 24 },
  { name: "Robótica Módulo IV (Competição Mio) - Parte II", totalHours: 24 },
  { name: "Robótica Módulo I (Mecânica e Eletrônica)", totalHours: 32 },
  { name: "Robótica Módulo II (Lógica de Programação)", totalHours: 32 },
  { name: "Robótica Módulo III (Automação)", totalHours: 36 }
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function main() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS course_catalog (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      total_hours REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  let inserted = 0;
  let updated = 0;

  for (const course of COURSES) {
    const existing = await db.get(
      "SELECT id FROM course_catalog WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))",
      course.name
    );

    if (existing) {
      await db.run(
        "UPDATE course_catalog SET total_hours = ? WHERE id = ?",
        course.totalHours,
        existing.id
      );
      updated += 1;
      continue;
    }

    await db.run(
      "INSERT INTO course_catalog (id, name, total_hours, created_at) VALUES (?, ?, ?, ?)",
      createId("curso"),
      course.name,
      course.totalHours,
      new Date().toISOString()
    );
    inserted += 1;
  }

  const total = await db.get("SELECT COUNT(*) AS count FROM course_catalog");
  await db.close();

  console.log(`Cursos inseridos: ${inserted}`);
  console.log(`Cursos atualizados: ${updated}`);
  console.log(`Total no catálogo: ${total.count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
