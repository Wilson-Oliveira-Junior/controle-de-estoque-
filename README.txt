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
2. Copie o projeto para uma pasta local no servidor (ex: C:\Users\professor\Desktop\ControleEstoque).
3. Instale as dependências no servidor:
   ```cmd
   npm install
   ```
4. Instale o PM2 para rodar o servidor em background (sem deixar CMD aberto):
   ```cmd
   npm install -g pm2
   ```
5. Inicie o servidor com PM2:
   ```cmd
   pm2 start server.js --name ControleEstoque
   pm2 save
   ```
6. Configure o início automático com o Windows (executar como Administrador):
   ```cmd
   schtasks /create /tn "ControleEstoque Server" /tr "pm2 resurrect" /sc onstart /ru SYSTEM /f
   ```
7. Libere a porta 3000 no firewall do servidor (executar como Administrador):
   ```cmd
   netsh advfirewall firewall add rule name="ControleEstoque API" dir=in action=allow protocol=TCP localport=3000 profile=any
   ```
8. O serviço ficará disponível em:
   ```
   http://192.168.10.66:3000
   ```

Comandos úteis do PM2
---------------------
```cmd
pm2 status                     # ver se o servidor está rodando
pm2 restart ControleEstoque    # reiniciar
pm2 stop ControleEstoque       # parar
pm2 logs ControleEstoque       # ver erros/logs
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
- O servidor usa PM2 para ficar ativo em background e reiniciar automaticamente com o Windows.
- Os dados são persistidos em `database.sqlite` na pasta do servidor.
- O app está configurado para usar o servidor em `http://192.168.10.66:3000/api`.
- Se o servidor mudar de IP, atualize `API_BASE_URL` em `app.js` e reempacote.
- Para reempacotar, mantenha `electron` e `electron-packager` instalados.
- O ícone do app usa `Logo/logo-prepara.ico` gerado a partir do logo da Prepara.
