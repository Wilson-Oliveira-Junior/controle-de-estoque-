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

Servidor local recomendado
--------------------------
Para que vários computadores compartilhem os mesmos dados, use o servidor como backend central.

1. Acesse o servidor Windows onde o projeto ficará instalado.
2. Copie o projeto da pasta de rede para uma pasta local no servidor:
   ```powershell
   New-Item -ItemType Directory -Force C:\ControleEstoque
   robocopy \\192.168.10.66\pedagogico C:\ControleEstoque /MIR
   ```
3. Entre nessa pasta local do servidor:
   ```powershell
   Set-Location C:\ControleEstoque
   ```
4. Instale as dependências no servidor:
   ```powershell
   npm.cmd install
   ```
5. Inicie o backend do servidor:
   ```powershell
   npm.cmd run server
   ```
6. O serviço ficará disponível em:
   ```text
   http://192.168.10.66:3000
   ```

O que deve existir na pasta para o app rodar
-------------------------------------------
A pasta do projeto deve conter estes arquivos principais antes de usar:
- `index.html`, `add.html`, `withdraw.html`, `estoque.html`, `historico.html`, `export.html`
- `app.js`, `main.js`, `server.js`
- `style.css`
- `package.json` e `package-lock.json`
- `node_modules/` (após `npm.cmd install`) ou a versão empacotada em `dist/`

A intenção deste aplicativo é copiar a pasta e usar rapidamente. Para uma instalação mais simples:
- gere o executável com `npm.cmd run package-win`
- copie a pasta `dist\ControleEstoque-win32-x64`
- abra `ControleEstoque.exe` no outro PC

Observação importante:
- Não instale dependências diretamente na pasta de rede UNC.
- O Node deve rodar em uma pasta local do servidor, como `C:\ControleEstoque`.

Conectar os clientes ao servidor
--------------------------------
Nos clientes que vão usar o aplicativo, mantenha o mesmo projeto ou a versão empacotada.
O `app.js` já está configurado para usar a API do servidor em:

```text
http://192.168.10.66:3000/api
```

Se o servidor mudar de IP, atualize a constante `API_BASE_URL` em `app.js`.

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
- `server.js`: servidor local Express e SQLite para centralizar dados
- `app.js`: lógica do aplicativo, comunicação com o servidor e exportação
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
- Os dados podem ser salvos em um servidor local via API.
- O app está configurado para usar o servidor em `http://192.168.10.66:3000/api`.
- Para reempacotar, mantenha `electron` e `electron-packager` instalados.
- Se desejar, posso também fornecer instruções para transformar este projeto em um instalador Windows.
