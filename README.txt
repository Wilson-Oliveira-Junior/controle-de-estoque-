Controle de Estoque Escolar
===========================

Este projeto é um sistema de controle de materiais escolares que roda em Electron.
Ele permite cadastrar materiais, registrar retiradas feitas por alunos, exibir o estoque atual e manter um histórico auditável com identificação do responsável.

Recursos principais
-------------------
- Cadastro de materiais por módulo
- Retirada de materiais com nome do aluno, data e responsável obrigatórios
- Histórico de movimentações com ação (entrada/saída), responsável, aluno, material e módulo
- Exportação para arquivo Excel `.xlsx` com planilhas separadas de Estoque e Histórico
- Empacotamento para Windows via Electron Packager

Como executar
--------------
1. Abra um terminal em `C:\Users\Alunos\Desktop\Controle de estoque`
2. Instale dependências:
   ```powershell
   npm install
   ```
3. Inicie o aplicativo em modo de desenvolvimento:
   ```powershell
   npm start
   ```

Gerar executável Windows
------------------------
Execute na pasta do projeto:
```powershell
npm.cmd run package-win
```

Isso gera o aplicativo em:
`dist\ControleEstoque-win32-x64\ControleEstoque.exe`

Páginas do aplicativo
---------------------
- `index.html`: dashboard com resumo de materiais, quantidade total e movimentações
- `add.html`: cadastro de material e registro de entrada
- `withdraw.html`: registro de retirada de material por aluno
- `estoque.html`: lista de materiais e quantidades em estoque
- `historico.html`: histórico de movimentações
- `export.html`: exportação para Excel `.xlsx`

Arquivos importantes
-------------------
- `app.js`: lógica do aplicativo, armazenamento local e exportação
- `main.js`: configuração da janela Electron
- `package.json`: scripts e dependências do projeto
- `style.css`: estilo visual das páginas

Exportação para Excel
---------------------
A página `export.html` permite gerar um único arquivo `controle-estoque.xlsx` com:
- Planilha `Estoque`: dados atuais do estoque
- Planilha `Histórico`: registro de entradas e saídas

Observações
-----------
- Os dados são salvos no `localStorage` do navegador Electron.
- Para reempacotar, mantenha `electron` e `electron-packager` instalados.
- Se desejar, posso também fornecer instruções para transformar este projeto em um instalador Windows.
