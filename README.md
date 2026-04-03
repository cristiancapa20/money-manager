# Costos

Aplicacion movil de finanzas personales construida con Expo y React Native. Permite gestionar ingresos, gastos, cuentas bancarias y prestamos desde una interfaz moderna con soporte para tema claro/oscuro.

> **Este proyecto es el cliente movil de [FinlyCR](https://github.com/cristiancapa20/finance-tracker.git)**, una app web en Next.js.
> Ambos comparten la **misma base de datos Turso**. Las tablas y migraciones se gestionan
> exclusivamente desde la web app con Prisma — la app movil solo lee y escribe datos,
> nunca crea ni modifica tablas.

## Tech Stack

- **Framework:** Expo (~54.0.30) + React Native (0.81.5) + React (19.1.0)
- **Navegacion:** Expo Router (file-based routing) + React Navigation (bottom tabs)
- **Base de datos:** Turso/LibSQL (SQLite serverless)
- **Estado global:** React Context (auth, app data, theme)
- **UI:** Expo Vector Icons (Ionicons), React Native Gifted Charts, Expo Linear Gradient
- **Auth:** bcryptjs + AsyncStorage para persistencia de sesion
- **Lenguaje:** TypeScript (~5.9.2)

## Funcionalidades

- **Home:** Carrusel de tarjetas/cuentas con balance y lista de transacciones
- **Transacciones:** Registro de ingresos y gastos por categoria y cuenta
- **Prestamos:** Gestion de dinero prestado y deudas, con seguimiento de pagos
- **Estadisticas:** Calendario de actividad y graficos de balance (ingresos vs gastos)
- **Perfil:** Foto de perfil, nombre y configuracion de tema
- **Tema:** Soporte dark/light mode con deteccion automatica

## Estructura del proyecto

```
costos/
├── app/
│   ├── (tabs)/              # Pantallas con navegacion por tabs
│   │   ├── index.tsx        # Home (cuentas + transacciones)
│   │   ├── add-transaction  # Boton flotante central
│   │   ├── loans.tsx        # Prestamos y deudas
│   │   ├── stats.tsx        # Estadisticas y graficos
│   │   └── settings.tsx     # Configuracion
│   ├── (auth)/              # Login
│   └── profile.tsx          # Perfil de usuario
├── components/              # Componentes reutilizables
├── contexts/                # Providers de estado global
├── database/                # Conexion y queries a Turso
├── types/                   # Interfaces TypeScript
├── constants/               # Tema y colores
├── utils/                   # Categorias predefinidas
└── assets/                  # Imagenes y splash screens
```

## Modelo de datos

| Tabla          | Descripcion                                      |
| -------------- | ------------------------------------------------ |
| `User`         | Usuarios con email, password hash y avatar       |
| `Account`      | Cuentas (checking, savings, cash, credit)        |
| `Transaction`  | Ingresos/gastos con monto en centavos            |
| `Category`     | Categorias del sistema y personalizadas          |
| `Loan`         | Prestamos (LENT) y deudas (OWED)                 |
| `LoanPayment`  | Pagos parciales asociados a un prestamo          |

> Los montos se almacenan en centavos (÷100 para mostrar en pesos).

## Categorias predefinidas

Alimentacion, Transporte, Entretenimiento, Salud, Educacion, Servicios, Compras, Salario, Freelance, Inversiones, Otros.

## Configuracion

### Variables de entorno

Crear un archivo `.env` en la raiz:

```env
EXPO_PUBLIC_TURSO_DATABASE_URL=libsql://tu-database.turso.io
EXPO_PUBLIC_TURSO_AUTH_TOKEN=tu-token
```

### Instalacion

```bash
npm install
```

### Ejecutar (produccion)

```bash
npm start          # Inicia Expo dev server

# O directamente:
npm run ios        # Simulador iOS
npm run android    # Emulador Android
npm run web        # Navegador web
```

### Entorno de desarrollo local

Para trabajar sin tocar la base de datos de produccion, usa una BDD local con Turso CLI:

```bash
# 1. Instala Turso CLI (si no lo tienes)
curl -sSfL https://get.tur.so/install.sh | bash

# 2. Inicia el servidor local (en una terminal aparte)
turso dev

# 3. Pobla la BDD con tablas y datos de prueba
npx tsx scripts/seed-dev.ts

# 4. Inicia la app con el entorno de desarrollo
cp .env.development .env
npm start
```

**Usuario de prueba:** `test@test.com` / `test1234`

> Para volver a produccion, restaura el `.env` original con las credenciales de Turso cloud.
> La BDD local es efimera — se pierde al cerrar `turso dev`. Si quieres persistirla usa `turso dev --db-file local.db`.

### Otros comandos

```bash
npm run lint             # Ejecutar ESLint
npm run reset-project    # Reiniciar proyecto base
```

## Requisitos

- Node.js
- Expo CLI
- Turso CLI (para desarrollo local)
- iOS Simulator / Android Emulator / Expo Go en dispositivo fisico
- Base de datos en Turso con las tablas configuradas (produccion) o `turso dev` (desarrollo)

## Arquitectura y convenciones de codigo

### Acceso a datos

La app accede **directamente a Turso** via `@libsql/client/http` (archivo `database/turso.ts`). No usa la API REST de la web app. Todo el acceso a datos pasa por `database/database.ts`, que es la unica capa que ejecuta SQL.

Flujo: **Componente → Context (`useApp()` / `useAuth()`) → `database/database.ts` → Turso**

Nunca se debe ejecutar SQL directamente desde un componente o context. Toda query nueva va en `database/database.ts` y se expone a traves del context correspondiente en `contexts/`.

### Conversion de montos

Turso almacena montos como **INTEGER en centavos**. La conversion se hace exclusivamente en `database/database.ts`:
- Al leer: `amount / 100`
- Al guardar: `Math.round(amount * 100)`

Los componentes y contexts siempre trabajan con **pesos (decimales)**, nunca con centavos.

### Nomenclatura de archivos

- Archivos: **kebab-case** (`add-transaction-modal.tsx`, `balance-card.tsx`)
- Componentes: **PascalCase** en el export (`BalanceCard`, `TransactionList`)
- Tipos: archivos en `types/` con nombre del modelo (`transaction.ts`, `card.ts`, `loan.ts`)
- Hooks: prefijo `use-` (`use-color-scheme.ts`, `use-theme-color.ts`)

### Componentes base

Usar `themed-text.tsx` y `themed-view.tsx` como base para textos y contenedores. Estos aplican automaticamente los colores del tema activo.

### Iconos

Se usan **Ionicons** de `@expo/vector-icons` en toda la app. Las categorias usan iconos con sufijo `-outline` (ej: `restaurant-outline`, `car-outline`). Ver `utils/categories.ts` para el mapeo completo.

### Colores y tema

Los tokens de diseno estan en `constants/theme.ts`. Paleta principal: indigo como primario, green-600 para ingresos, red-600 para gastos. Siempre usar `Colors.light` / `Colors.dark` en vez de colores hardcodeados. Acceder al tema activo via `useTheme()` de `contexts/theme-context.tsx`.

### Estado global (Contexts)

| Context | Hook | Responsabilidad |
|---|---|---|
| `AuthProvider` | `useAuth()` | Login, logout, updateProfile, usuario actual |
| `AppProvider` | `useApp()` | Transacciones, cuentas (cards), categorias, prestamos, pagos |
| `ThemeProvider` | `useTheme()` | Dark/light mode |

`AppProvider` depende de `AuthProvider` (usa `useAuth()` internamente para obtener el `userId`).

### Tipos de cuenta

La app usa el alias "Card" internamente para referirse a cuentas (`Account` en Turso). Los tipos son: `checking`, `savings`, `cash`, `credit` (definidos en `types/card.ts`).

### IDs generados

Los IDs se generan en el cliente con formato: `prefijo_timestamp_random` (ej: `tx_1711929600000_a3k2m`, `acc_1711929600000_b7x9p`). Esto esta en `database/database.ts`.

## Reglas importantes

1. **No crear ni modificar tablas** — las migraciones se manejan desde la web app con Prisma
2. **No usar la API REST de la web** — la app se conecta directo a Turso
3. **Toda query SQL nueva** va en `database/database.ts`, nunca en componentes ni contexts
4. **Montos siempre en pesos** en componentes; la conversion centavos↔pesos es responsabilidad exclusiva de `database/database.ts`
5. **Usar los componentes themed** (`themed-text`, `themed-view`) para mantener consistencia visual
6. **Usar Ionicons** con sufijo `-outline` para nuevos iconos
7. **Nuevas pantallas** van en `app/(tabs)/` si necesitan tab, o en `app/` si son modales/standalone
8. **Nuevas funcionalidades de datos** requieren: tipo en `types/`, query en `database/database.ts`, metodo en el context de `contexts/app-context.tsx`
