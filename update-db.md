# Instrucciones para actualizar la base de datos

1. Detén el servidor backend (Ctrl+C en la terminal donde está corriendo)

2. Ejecuta estos comandos en orden:

```bash
# Regenerar el cliente de Prisma
npx prisma generate

# Aplicar la migración a la base de datos
npx prisma migrate deploy
```

3. Reinicia el servidor backend

