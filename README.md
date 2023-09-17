# Sobre

Esta aplicação descarrega todas as tuas cadernetas prediais disponíveis no [Portal das Finanças](https://imoveis.portaldasfinancas.gov.pt/matrizesinter/web/consultar-patrimonio-predial).

# Uso (Ubuntu 22.04)

Instala o [node](https://nodejs.org).

Instala as dependencias:

```bash
npm ci
npx playwright install
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
