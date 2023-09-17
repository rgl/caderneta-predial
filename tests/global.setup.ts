import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../playwright.config';

setup('login', async ({ page }) => {
  // Do the login dance.
  if (!process.env.CADERNETA_PREDIAL_NIF) {
    throw "you must set the CADERNETA_PREDIAL_NIF environment variable in the .env file";
  }
  if (!process.env.CADERNETA_PREDIAL_SENHA) {
    throw "you must set the CADERNETA_PREDIAL_SENHA environment variable in the .env file";
  }
  await page.goto('https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/consultar-patrimonio-predial');
  await page.getByText('NIF').click();
  await page.getByPlaceholder('Nº de Contribuinte').fill(process.env.CADERNETA_PREDIAL_NIF);
  await page.getByPlaceholder('Senha de acesso').fill(process.env.CADERNETA_PREDIAL_SENHA);
  await page.getByRole('button', { name: 'Autenticar' }).click();

  // Ensure we ended up at the expected page.
  // NB If this fails, probably, your senha (password) is incorrect. And you
  //    should double-check it before trying again. You only have about 3
  //    attempts before locking the account.
  await page.getByRole('heading', { name: 'PATRIMÓNIO PREDIAL / CADERNETAS' }).click();
  await page.getByText('Nº Contribuinte').click();
  await page.getByText(process.env.CADERNETA_PREDIAL_NIF, { exact: true }).click();

  // Save the page state (e.g. credential cookies).
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
