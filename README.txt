# Controle de Apostilas

Aplicativo desktop (Electron) com backend Express + SQLite para controle de cursos, acompanhamento de alunos, progresso semanal e auditoria de alterações.

---

## Recursos principais

- Cadastro de cursos com carga horária total
- Cadastro de acompanhamentos por aluno/curso
- Cálculo automático de progresso (90% e 100%) com bloqueio de domingos, feriados e férias
- Calendário de bloqueios (feriados e períodos de férias)
- Agenda semanal de turmas com drag and drop e clique para mover aluno entre dias/horários
- Página dedicada de Turmas com coluna de sábado e fila de alunos sem turma
- Listagem consolidada de alunos importados (status, faltas, última presença, curso atual e aula atual)
- Controle de apostilas por aluno com baixa automática no estoque a partir da aula 5
- Resumo de estoque e alerta de compra quando houver apostilas pendentes de baixa
- Painel de avisos automáticos para fim de horas, fim de apostila, presença/faltas e agenda pendente
- Geração de mensagens prontas com nome do aluno, data e horário da próxima aula
- Importação consolidada de planilhas Excel/CSV/TSV com merge por nome e apoio a campos extras
- Histórico de auditoria com responsável por alteração
- Exportação Excel (.xlsx) com múltiplas abas

---

## Arquitetura

```
controle-estoque/
├── frontend/       # Telas HTML, estilos e lógica de UI (apostila-app.js)
├── backend/        # API Express, regras de negócio e scripts de importação
├── electron/       # Bootstrap da aplicação desktop (main.js)
├── data/           # Banco SQLite local e arquivos de importação
└── assets/         # Logos e imagens usadas pelo app
```

---

## Páginas disponíveis

| Arquivo                    | Descrição                            |
|----------------------------|--------------------------------------|
| `frontend/index.html`      | Painel inicial                       |
| `frontend/users.html`      | Listagem de alunos importados        |
| `frontend/add.html`        | Cadastro de cursos                   |
| `frontend/withdraw.html`   | Cadastro de acompanhamento           |
| `frontend/estoque.html`    | Visão de progresso                   |
| `frontend/historico.html`  | Calendário e histórico de auditoria  |
| `frontend/turmas.html`     | Agenda semanal de turmas             |
| `frontend/export.html`     | Exportação para Excel                |

---

## Como executar (desenvolvimento)

1. Abra o terminal na pasta do projeto.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o app:
   ```bash
   npm start
   ```

---

## Importação de alunos

```bash
npm run import-students -- C:\Users\Alunos\Downloads\arquivo.xls
```

O importador:
- Padroniza o nome de exibição
- Faz merge por nome normalizado
- Aplica fallback por nome flexível para reduzir duplicidades de digitação
- Aceita arquivos `.xls`, `.xlsx`, `.csv` e `.tsv`
- Captura campos como curso atual, aula atual, dias/horários, presença, faltas e reposições

---

## Gerar executável (Windows)

O projeto usa o **electron-packager** para gerar o executável standalone.

### Pré-requisitos

- Node.js instalado
- Ícone no formato `.ico` em `assets/Logo/logo-prepara.ico`  
  *(se só tiver `.png`, converta em [convertico.com](https://convertico.com))*
- Banco de dados `data/database.sqlite` presente na pasta antes do build

### Gerar o `.exe`

```bash
npm run package-win
```

O executável será gerado em:

```
dist/ControleEstoque-win32-x64/ControleEstoque.exe
```

### Script configurado no `package.json`

```json
"package-win": "electron-packager . ControleEstoque --platform=win32 --arch=x64 --icon=assets/Logo/logo-prepara.ico --out=dist --overwrite"
```

### Observações importantes

- O banco SQLite é copiado junto com o build. Não sobrescreva o banco do servidor com o local sem antes fazer backup.
- O backend Express é iniciado pelo `electron/main.js` na abertura do app. Verifique se o `main.js` está iniciando o `backend/server.js` antes de abrir a janela.
- Se o IP do servidor mudar, atualize a constante `API_BASE_URL` em `frontend/apostila-app.js` e `frontend/app.js`.

---

## Publicar no servidor da escola (192.168.10.66)

1. Copie a pasta do projeto para o servidor:
   ```
   C:\Users\professor\Desktop\ControleEstoque
   ```

2. Abra o CMD dentro da pasta e instale as dependências:
   ```bash
   npm install
   ```

3. Teste o servidor manualmente:
   ```bash
   npm run server
   ```

4. Confirme que a API responde no navegador:
   ```
   http://localhost:3000/api/inventory
   ```
   *(deve retornar um JSON)*

5. Para manter o servidor ativo mesmo após fechar o CMD, use o **PM2**:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name ControleApostilasServer
   pm2 save
   ```

6. Comandos úteis do PM2:
   ```bash
   pm2 list                              # verificar se está rodando
   pm2 stop ControleApostilasServer      # parar o servidor
   pm2 restart ControleApostilasServer   # reiniciar após mudanças
   ```

7. Teste de outros PCs na rede:
   ```
   http://192.168.10.66:3000/api/inventory
   ```
   *(se responder JSON, os clientes já conseguem se comunicar com o backend)*

---

## Exportação

A tela de exportação gera `controle-apostilas.xlsx` com as abas:

- Cursos
- Controle
- Progresso
- Feriados
- Férias
- Auditoria

---

## Turmas e agenda semanal

- A agenda trabalha de Segunda a Sábado.
- Os horários de sábado já são exibidos na grade de turmas.
- Ao mover um aluno, o sistema solicita o horário e grava o dia/horário no banco.
- O painel de alunos exibe curso atual, aula atual e avisos automáticos para apoiar a rotina.

---

## Segurança de dados

- Os arquivos em `data/import/` são sensíveis e **não devem ir para o Git**.
- O banco `data/database.sqlite` também pode conter dados sensíveis.
- O `.gitignore` do projeto já bloqueia esses caminhos.