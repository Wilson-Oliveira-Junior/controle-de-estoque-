Controle de Apostilas
=====================

Aplicativo desktop (Electron) com backend Express + SQLite para controle de cursos, acompanhamento de alunos, progresso semanal e auditoria de alterações.

Recursos principais
-------------------
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
- Importação consolidada de planilhas Excel/CSV/TSV com merge por nome e apoio a campos extras da planilha
- Histórico de auditoria com responsável por alteração
- Exportação Excel (.xlsx) com múltiplas abas

Arquitetura atual
-----------------
- frontend/: telas HTML, estilo e lógica de UI (apostila-app.js)
- backend/: API, regras de negócio e scripts de importação/normalização
- electron/: bootstrap da aplicação desktop
- data/: banco SQLite local e arquivos de importação locais
- assets/: logos e demais imagens usadas pelo app

Páginas disponíveis
-------------------
- frontend/index.html: painel inicial
- frontend/users.html: listagem de alunos importados
- frontend/add.html: cadastro de cursos
- frontend/withdraw.html: cadastro de acompanhamento
- frontend/estoque.html: visão de progresso
- frontend/historico.html: calendário e histórico de auditoria
- frontend/turmas.html: agenda semanal de turmas
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

  npm.cmd run import-students -- C:\Users\Alunos\Downloads\arquivo.xls

- O importador atual:
  - Padroniza nome de exibição
  - Faz merge por nome normalizado
  - Faz fallback por nome flexível para reduzir duplicidades de digitação
  - Aceita arquivos .xls, .xlsx, .csv e .tsv
  - Captura também campos como curso atual, aula atual, dias/horários de agendamento, presença, faltas e reposições

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

Turmas e agenda semanal
-----------------------
- A agenda semanal trabalha com Segunda a Sábado.
- Os horários de sábado já são exibidos na grade de turmas.
- Ao mover um aluno, o sistema pede o horário e grava o dia/horário no banco.
- O painel de alunos mostra o curso atual, a aula atual e avisos automáticos para apoiar a rotina.

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
