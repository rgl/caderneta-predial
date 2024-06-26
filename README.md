# Sobre

[![Playwright Tests](https://github.com/rgl/caderneta-predial/actions/workflows/playwright.yml/badge.svg)](https://github.com/rgl/caderneta-predial/actions/workflows/playwright.yml)

Esta aplicação descarrega todas as tuas cadernetas prediais disponíveis no [Portal das Finanças](https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/consultar-patrimonio-predial).

# Uso (Ubuntu 22.04)

Instala o [node](https://nodejs.org).

Instala as dependencias:

```bash
npm ci
npx playwright install --with-deps chromium
```

Configura as tuas credenciais de acesso ao Portal das Finanças:

```bash
cat >.env <<'EOF'
CADERNETA_PREDIAL_NIF   = 'o teu NIF'
CADERNETA_PREDIAL_SENHA = 'a tua senha'
EOF
```

Executa a aplicação:

```bash
npm run test
```

Verifica que as cadernetas prediais foram descarregadas para a directoria `data`:

```bash
find data
```

Abre o documento HTML:

```bash
for f in data/*.html; do xdg-open "$f"; done
```

# NIF de teste

Para testar a página de autenticação, podes usar um dos seguintes NIF (que
provavelmente não estão atribuídos) de teste:

* `100000010`
* `100000029`
* `100000037`

**NB** Não uses o `100000002`, pois já é usado internamente pelos testes
unitários.
