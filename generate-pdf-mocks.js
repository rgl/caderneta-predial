const { chromium } = require('playwright');
const he = require('he');
const fs = require('fs/promises');

async function generatePdfMocks() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const urbanoPdf = await generatePdfMock(page, "Urbano Mock");
    const rusticoPdf = await generatePdfMock(page, "Rústico Mock");
    await fs.writeFile("tests/pdf-mocks.ts", `
export const urbanoPdf = Buffer.from('${urbanoPdf.toString('base64')}', 'base64');
export const rusticoPdf = Buffer.from('${rusticoPdf.toString('base64')}', 'base64');
`);
  } finally {
    await browser.close();
  }
}

async function generatePdfMock(page, text) {
  await page.setContent(`
<!DOCTYPE html>
<html>
  <body>
    <h1>${he.encode(text)}</h1>
  </body>
</html>
`);
  return await page.pdf({ format: 'A4' });
}

generatePdfMocks();
