# runner

# pre

- [Install Turso](https://github.com/tursodatabase/turso-cli)
- [Install Bun](https://bun.sh/docs/installation)

`

```bash
turso auth signup
turso db create runner-db
echo "TURSO_CONNECTION_URL=$(turso db show runner-db --url)" > .env
echo "TURSO_AUTH_TOKEN=$(turso db tokens create runner-db)" >> .env
```
