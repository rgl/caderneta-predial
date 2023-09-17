import { test, expect, Page } from '@playwright/test';
import { mkdir, writeFile, stat } from 'fs/promises';
import path from 'path';

// The data files files will be saved in this directory.
const DATA_DIRECTORY_PATH = path.join(__dirname, '../data');

// This is the scraped data type.
// This will be saved in the <nif>.json file.
type Data = {
  nif: string;
  name: string;
  predios: Predio[];
};

type Predio = {
  predioId: number;
  alternateId: string;
  tipo: TipoPredio;
  [key: string]: any;
}

type TipoPredio = "U" | "R";

// Download all the cadernetas.
test('cadernetas', async ({ page }) => {
  // Arm the API call response interception.
  const apiResponsePromise = page.waitForResponse('https://imoveis.portaldasfinancas.gov.pt/matrizesinter/api/patrimonio');

  // Go to the patrimonio predial page.
  await page.goto('https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/consultar-patrimonio-predial');
  await page.getByText('Nº Prédios').click();
  await page.getByText('Valor Património').click();

  // Scrape the data.
  const scrapedAppElement = page.locator('patrimonio-predial-app');
  const scrapedNif = await scrapedAppElement.getAttribute('nif-sessao');
  const scrapedNameElement = page.locator('.user-pic img');
  const scrapedName = await scrapedNameElement.getAttribute('alt');

  // Validate the NIF.
  if (!scrapedNif || !/^\d{9}$/.test(scrapedNif)) {
    throw Error("nif does not match the ^\d{9}$ regular expression");
  }

  // Validate the user name.
  if (!scrapedName || !/[a-zA-Z]+/.test(scrapedName)) {
    throw Error("user name could not be found");
  }

  // Normalize the data.
  const nif = scrapedNif;
  const name = scrapedName.trim();

  // Scrape the data from the API response.
  const response = await apiResponsePromise;
  const predios = await response.json() as Predio[];

  // Download all the cadernetas.
  for (const predio of predios) {
    if (typeof predio.predioId !== "number") {
      throw "predioId is not a number";
    }
    const predioId = predio.predioId;
    const alternateId = predio.alternateId.replace(/[^a-zA-Z0-9]+/g, "-");
    const pdfPath = path.join(DATA_DIRECTORY_PATH, `${nif}-${alternateId}.pdf`);
    if (await shouldDownload(pdfPath)) {
      let pdfUrl: string;
      switch (predio.tipo) {
        case "U":
          pdfUrl = `https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/caderneta/${predioId}`;
          break;
        case "R":
          pdfUrl = `https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/caderneta-rustica/${predioId}`;
          break;
        default:
          throw `predio ${alternateId} has unknown tipo ${predio.tipo}`;
      }
      console.log(`Downloading ${alternateId} from ${pdfUrl}...`);
      const pdf = await downloadPdf(page, pdfUrl);
      await savePdf(pdfPath, pdf);
    } else {
      console.log(`Skipping downloading ${alternateId} as ${pdfPath} is still valid.`);
    }
  }

  // Save the data to a file.
  await saveData({
    nif: nif,
    name: name,
    predios: predios,
  });
});

// Test whether the file should be downloaded to the cache.
async function shouldDownload(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    const timeDifference = Date.now() - stats.birthtime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    return hoursDifference > 8;
  } catch (err) {
    // If the file does not exist, consider it eligible for download.
    if (err.code === 'ENOENT') {
      return true;
    }
    // Otherwise, rethrow the error.
    throw err;
  }
}

// Download a PDF.
async function downloadPdf(page: Page, pdfUrl: string): Promise<Buffer> {
  const encodedPdf: string = await page.evaluate(async (pdfUrl) => {
    const response = await fetch(pdfUrl);
    if (response.status != 200) {
      throw Error(`failed to fetch the pdf. response status was ${response.status}:${response.statusText}`);
    }
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.toLowerCase().includes('pdf')) {
      throw Error(`the fetched file is not a pdf. its content type is ${contentType}`);
    }
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        var result = reader.result as string;
        if (!result) {
          reject('Failed to load PDF.');
          return;
        }
        const encodedPdf = result.split(',', 2)[1];
        resolve(encodedPdf);
      };
      reader.onerror = () => {
        reject('Error reading the PDF.');
      };
      reader.readAsDataURL(blob);
    });
  }, pdfUrl);
  return Buffer.from(encodedPdf, 'base64');
}

// Save the pdf to the specified file path.
async function savePdf(toPath: string, pdf: Buffer) {
  const directoryPath = path.dirname(toPath);
  await mkdir(directoryPath, { recursive: true });
  await writeFile(toPath, pdf);
}

// Save the data to the <nif>.json file.
async function saveData(data: Data) {
  const dataPath = path.join(DATA_DIRECTORY_PATH, `${data.nif}.json`);
  await mkdir(DATA_DIRECTORY_PATH, { recursive: true });
  await writeFile(dataPath, JSON.stringify(data, null, 2));
}