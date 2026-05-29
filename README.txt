Controle de Apostilas
=====================

Aplicativo desktop (Electron) com backend Express + SQLite para controle de cursos, acompanhamento de alunos, progresso semanal e auditoria de alterações.

Recursos principais
-------------------
- Cadastro de cursos com carga horária total
- Cadastro de acompanhamentos por aluno/curso
- Cálculo automático de progresso (90% e 100%) com bloqueio de domingos, feriados e férias
- Calendário de bloqueios (feriados e períodos de férias)
- Listagem consolidada de alunos importados (status, faltas, última presença)
- Histórico de auditoria com responsável por alteração
- Exportação Excel (.xlsx) com múltiplas abas

Arquitetura atual
-----------------
- frontend/: telas HTML, estilo e lógica de UI (apostila-app.js)
- backend/: API, regras de negócio e scripts de importação/normalização
- electron/: bootstrap da aplicação desktop
- data/: banco SQLite local e arquivos de importação locais

Páginas disponíveis
-------------------
- frontend/index.html: painel inicial
- frontend/users.html: listagem de alunos importados
- frontend/add.html: cadastro de cursos
- frontend/withdraw.html: cadastro de acompanhamento
- frontend/estoque.html: visão de progresso
- frontend/historico.html: calendário e histórico de auditoria
- frontend/export.html: exportação para Excel

Como executar (desenvolvimento)
-------------------------------
1. Abra terminal na pasta do projeto.
2. Instale dependências:

   npm.cmd install

3. Inicie o app:

   npm.cmd start

Importação e consolidação de alunos
-----------------------------------
- Script de importação:

  npm.cmd run import-students -- data/import/arquivo-status.tsv

- O importador atual:
  - Padroniza nome de exibição
  - Faz merge por nome normalizado
  - Faz fallback por nome flexível para reduzir duplicidades de digitação

Segurança de dados sensíveis
----------------------------
- Os arquivos de importação em data/import/ são sensíveis e não devem ir para o Git.
- O banco local data/database.sqlite também pode conter dados sensíveis.
- O .gitignore deste projeto já foi atualizado para bloquear esses caminhos.

Exportação
----------
A tela de exportação gera controle-apostilas.xlsx com abas de:
- Cursos
- Controle
- Progresso
- Feriados
- Férias
- Auditoria

Observações operacionais
------------------------
- Em ambiente de rede/escola, prefira um backend centralizado.
- Se mudar o endereço do servidor, ajuste API_BASE_URL_CANDIDATES em frontend/apostila-app.js.
- Reinicie o app após mudanças de estrutura de páginas.

Lembrete de pendências (não esquecer)
-------------------------------------
- Completar cadastro de contato dos alunos ainda sem telefone e/ou responsável no banco.
- Revisar divergências de horas e projeções usando o arquivo de validação em data/import/validacao-horas-anexo.tsv.
- Reexecutar validação de contatos quando houver novo arquivo: node backend/update-contacts-from-doc.js.
