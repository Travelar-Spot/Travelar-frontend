Aqui está o **README completo, padronizado, claro e profissional**, seguindo o estilo que você utilizou na documentação da API de Autenticação e mantendo coerência com todo o ecossistema **Travelar**:

---

# **Travelar Frontend**

## 1. **Visão Geral**

O **Travelar Frontend** é a interface oficial do ecossistema Travelar, responsável por entregar uma experiência moderna, fluida e responsiva para hóspedes e proprietários.
Ele se integra diretamente com os microsserviços **Auth API** e **Backend Core**, oferecendo funcionalidades como:

* Busca e visualização de imóveis
* Login, registro e gerenciamento de sessão
* Realização de reservas autenticadas
* Navegação rápida e dinâmica entre páginas

A arquitetura foi projetada para ser **escalável, modular e orientada a testes**, utilizando TypeScript e Cypress para testes end-to-end (E2E).

[Link da documentação do projeto Travelar](https://travelar-spot.github.io/Travelar-docs/)

---

## 2. **Tecnologias Utilizadas**

| Tecnologia        | Função / Uso                                          |
| ----------------- | ----------------------------------------------------- |
| **React**         | Construção de UI com componentes reutilizáveis        |
| **TypeScript**    | Tipagem estática e aumento na confiabilidade          |
| **Cypress**       | Testes E2E automatizados                              |
| **Axios / Fetch** | Comunicação HTTP com as APIs                          |
| **Node.js**       | Execução de ferramentas de build                      |
| **Vite**          | Bundler para desenvolvimento rápido e build otimizado |

---

## 3. **Estrutura do Projeto**

A estrutura é organizada para garantir clareza e escalabilidade:

```
travelar-frontend/
├── cypress/                 # Ambiente de Testes E2E
│   ├── e2e/                 # Arquivos de testes (specs)
│   ├── support/             # Configurações, hooks e comandos customizados
│   └── tsconfig.json        # Configuração TS exclusiva para testes
├── src/                     # Código Fonte
│   ├── components/          # Componentes reutilizáveis (UI)
│   ├── pages/               # Páginas da aplicação (Home, Login, etc.)
│   ├── services/            # Comunicação com APIs externas
│   ├── context/             # Estado global (Auth, User, etc.)
│   └── styles/              # Estilos globais e específicos
├── cypress.config.ts        # Configurações gerais do Cypress
├── package.json             # Dependências e scripts
└── tsconfig.json            # Configuração principal do TypeScript
```

---

## 4. **Configuração de Testes (Cypress)**

O projeto contém uma configuração especializada para garantir suporte total ao Cypress com TypeScript:

### Destaques da configuração:

* **Target:** `ES5` → garante compatibilidade com ambiente de testes
* **Module:** `commonjs`
* **Types:** inclui `cypress` e `node` para autocomplete
* **noEmit:** `true` → TS não gera arquivos de saída
* **esModuleInterop:** facilita importações de libs
* **skipLibCheck:** melhora performance na execução

Essa estrutura assegura testes rápidos, confiáveis e integrados ao fluxo de desenvolvimento.

---

## 5. **Integração e Fluxos do Sistema**

O frontend coordena os seguintes fluxos principais:

### **Autenticação**

* Envio de credenciais para a Auth API
* Armazenamento seguro do JWT
* Inclusão automática do token em requisições autenticadas

### **Listagem de Imóveis**

* Consumo da Backend API para exibição de cards de imóveis
* Filtros e ordenações (dependendo das funcionalidades implementadas)

### **Reservas**

* Formulário com validação
* Envio de dados autenticados
* Retorno do status da reserva

---

## 6. **Scripts Disponíveis**

Scripts definidos no `package.json`:

| Script                    | Descrição                              |
| ------------------------- | -------------------------------------- |
| `npm run dev`             | Inicia o servidor de desenvolvimento   |
| `npm run build`           | Gera o build otimizado                 |
| `npm run preview`         | Visualiza o build de produção          |
| `npm run cypress:open`    | Abre o Cypress no modo interativo      |
| `npm run cypress:run`     | Executa os testes E2E em modo headless |
| `npm run lint`            | Analisa o código                       |
| `npm run lint:eslint`     | Roda o ESLint                          |
| `npm run lint:eslint:fix` | Corrige automaticamente problemas      |
| `npm run format`          | Formata com Prettier                   |

---

## 7. **Instalação e Execução**

### 7.1. **Pré-requisitos**

* Node.js **18+**
* NPM
* Git
* Backend **em execução**
* Auth API **em execução**

---

### 7.2. **Instalação**

#### 7.2.1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/Travelar-frontend.git
cd Travelar-frontend
```

#### 7.2.2. Instalar dependências

```bash
npm install
```

---

### 7.3. **Configuração**

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3333
```

> Ajuste conforme a porta real da API.

---

### 7.4. **Executando a Aplicação**

#### 7.4.1. Modo Desenvolvimento

```bash
npm run dev
```

Acesse: **[http://localhost:5173](http://localhost:5173)**

---

#### 7.4.2. Build de Produção

```bash
npm run build
```

#### 7.4.3. Visualizar Build

```bash
npm run preview
```

---

## 7.5. **Testes (Cypress)**

#### 7.5.1. Modo Interativo

```bash
npm run test:e2e:open
```

#### 7.5.2. Modo Headless

```bash
npm run test:e2e
```

---

## 7.6. **Qualidade de Código**

```bash
npm run lint
npm run lint:eslint
npm run lint:eslint:fix
npm run format
```

---
