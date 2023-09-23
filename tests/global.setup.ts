import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../playwright.config';
import { PATRIMONIO_PREDIAL_URL } from './urls';
import { setupLoginMock } from './mocks';

setup('login', async ({ page }) => {
  // If this is the test NIF. Mock the service.
  if (process.env.CADERNETA_PREDIAL_NIF == '100000002') {
    await setupLoginMock(page);
  }

  // Get the credentials from the environment.
  const nif = process.env.CADERNETA_PREDIAL_NIF;
  if (!nif) {
    throw "you must set the CADERNETA_PREDIAL_NIF environment variable in the .env file";
  }
  if (!isValidNIF(nif)) {
    throw "nif is invalid";
  }
  const senha = process.env.CADERNETA_PREDIAL_SENHA;
  if (!senha) {
    throw "you must set the CADERNETA_PREDIAL_SENHA environment variable in the .env file";
  }
  if (senha.trim() != senha || senha.length < 8) {
    throw "senha is invalid";
  }

  // Do the login dance.
  await page.goto(PATRIMONIO_PREDIAL_URL);
  await page.getByText('NIF').click();
  await page.getByPlaceholder('Nº de Contribuinte').fill(nif);
  await page.getByPlaceholder('Senha de acesso').fill(senha);
  await page.getByRole('button', { name: 'Autenticar' }).click();

  // Ensure we ended up at the expected page.
  // NB If this fails, probably, your senha (password) is incorrect. And you
  //    should double-check it before trying again. You only have about 3
  //    attempts before locking the account.
  await page.getByRole('heading', { name: 'PATRIMÓNIO PREDIAL / CADERNETAS' }).click();
  await page.getByText('Nº Contribuinte').click();
  await page.getByText(nif, { exact: true }).click();

  // Save the page state (e.g. credential cookies).
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});

// NB 100000002 is a test NIF that should not be assigned to anyone.
// see https://pt.wikipedia.org/wiki/N%C3%BAmero_de_identifica%C3%A7%C3%A3o_fiscal
function isValidNIF(nif: string): boolean {
  const validationSets = {
      one: ["1", "2", "3", "5", "6", "8"],
      two: ["45", "70", "71", "72", "74", "75", "77", "79", "90", "91", "98", "99"]
  };

  if (nif.length !== 9) {
      return false;
  }

  if (!validationSets.one.includes(nif.substring(0, 1)) && !validationSets.two.includes(nif.substring(0, 2))) {
      return false;
  }

  let total = Number(nif[0]) * 9 + Number(nif[1]) * 8 + Number(nif[2]) * 7 + Number(nif[3]) * 6 + Number(nif[4]) * 5 + Number(nif[5]) * 4 + Number(nif[6]) * 3 + Number(nif[7]) * 2;
  let modulo11 = (Number(total) % 11);

  const checkDigit = modulo11 < 2 ? 0 : 11 - modulo11;

  return checkDigit === Number(nif[8]);
}
