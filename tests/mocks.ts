import { Page } from '@playwright/test';
import { urbanoPdf, rusticoPdf } from './pdf-mocks';

export async function setupLoginMock(page: Page) {
  await page.route('https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/consultar-patrimonio-predial', async (route) => {
    const html = `
<!DOCTYPE html>
<html>
  <body>
    <article>
      <h1>Login Page</h1>
      <p><span>NIF</span></p>
      <form name="loginForm" id="loginForm" action="" method="POST" style="" autocomplete="off" novalidate="novalidate">
        <div id="input-username-nif-group">
          <label for="username">Nº de Contribuinte</label>
          <input type="text" name="username" id="username" title="Insira um N° de Contribuinte válido" placeholder="Nº de Contribuinte" pattern="[0-9/]{9,14}" required="" autofocus="autofocus" aria-required="true">
        </div>
        <div id="input-password-nif-group">
          <label for="password">Senha de acesso</label>
          <input type="password" name="password" spellcheck="false" title="Campo Obrigatório" id="password-nif" required="" placeholder="Senha de acesso" autofocus="autofocus" aria-required="true">
        </div>
        <button type="submit" value="Entrar">Autenticar</button>
      </form>
    </article>
    <article>
      <h1>Patrimonio Predial Page</h1>
      <h2>PATRIMÓNIO PREDIAL / CADERNETAS</h2>
      <div><span>Nº Contribuinte</span><span>100000002</span></div>
    </article>
  </body>
</html>
`;
    await route.fulfill({
      body: html,
      contentType: "text/html;charset=utf-8"
    });
  });
}

export async function setupCadernetasMock(page: Page) {
  await page.route('https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/consultar-patrimonio-predial', async (route) => {
    const html = `
<!DOCTYPE html>
<html>
  <body>
    <article>
      <h1>Patrimonio Predial Page</h1>
      <div class="user-pic"><img alt="Manuel Joaquim"></div>
      <h2>PATRIMÓNIO PREDIAL / CADERNETAS</h2>
      <div><span>Nº Contribuinte</span><span>100000002</span></div>
      <div><span>Nº Prédios</span></div>
      <div><span>Valor Património</span></div>
      <patrimonio-predial-app nif-sessao="100000002">
      </patrimonio-predial-app>
    </article>
    <script>
      async function loadData() {
        const response = await fetch('https://imoveis.portaldasfinancas.gov.pt/matrizesinter/api/patrimonio');
        console.log("Data API response", response); 
      }
      loadData();
    </script>
  </body>
</html>
`;
    await route.fulfill({
      body: html,
      contentType: "text/html;charset=utf-8"
    });
  });
  await page.route('https://imoveis.portaldasfinancas.gov.pt/matrizesinter/api/patrimonio', async (route) => {
    const predios = [
      {
        "predioId": 1,
        "distrito": "11",
        "concelho": "22",
        "freguesia": "33",
        "tipo": "U",
        "artigo": "4444",
        "arvCol": " ",
        "fraccao": " ",
        "seccao": " ",
        "valorInicial": 1,
        "valor": 1,
        "anoInscricaoMatriz": 1901,
        "matriz": true,
        "matrizRustica": false,
        "cadernetaVigente": true,
        "dataCaderneta": "2023-09-19",
        "alternateId": "112233-U-4444",
        "tipoDesc": "Urbano",
        "quotaParte": " 1/1",
        "nomeFreguesia": "LISBOA E ARREDORES"
      },
      {
        "predioId": 2,
        "distrito": "21",
        "concelho": "32",
        "freguesia": "43",
        "tipo": "R",
        "artigo": "5555",
        "arvCol": " ",
        "fraccao": " ",
        "seccao": " ",
        "valorInicial": 1,
        "valor": 1,
        "anoInscricaoMatriz": 1901,
        "matriz": true,
        "matrizRustica": false,
        "cadernetaVigente": true,
        "dataCaderneta": "2023-09-19",
        "alternateId": "214243-R-5555",
        "tipoDesc": "Rústico",
        "quotaParte": " 1/1",
        "nomeFreguesia": "ABRANTES E ARREDORES"
      }
    ];
    await route.fulfill({ json: predios });
  });
  await page.route('https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/caderneta/*', async (route) => {
    await route.fulfill({
      body: urbanoPdf,
      contentType: "application/pdf"
    });
  });
  await page.route('https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/caderneta-rustica/*', async (route) => {
    await route.fulfill({
      body: rusticoPdf,
      contentType: "application/pdf"
    });
  });
}
