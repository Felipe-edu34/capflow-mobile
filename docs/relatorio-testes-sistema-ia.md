# Relatório Técnico — Projeto 03: Testes de Sistema (E2E), Testes Instrumentais com IA e Auditoria de Acessibilidade/Usabilidade

**Projeto:** CapFlow — Plataforma de Comando de Inventário (`capflow-mobile` / Expo Web)  
**Branch:** `docs/#1-testes-sistema-ia`  
**Fluxo Alvo Auditado:** Autenticação de Gestor e **Cadastro de Produto no Inventário**  
**URL Local de Execução:** `http://localhost:8081/`

---

## 1. Pesquisa Comparativa de Frameworks E2E (Selenium vs. Cypress vs. Playwright)

Para fundamentar a escolha tecnológica da suíte de Testes de Sistema (End-to-End / E2E) do frontend do **CapFlow**, foi realizado um estudo comparativo entre os três principais frameworks de mercado: **Selenium WebDriver**, **Cypress** e **Playwright**.

| Critério Técnico | Selenium WebDriver | Cypress | Playwright |
| :--- | :--- | :--- | :--- |
| **Arquitetura de Comunicação** | Baseado no protocolo HTTP **W3C WebDriver** (comunicação via driver intermediário entre o script e o navegador). | Executa dentro do mesmo loop de execução do navegador (*in-browser*), com um servidor Node.js auxiliar via WebSockets. | Comunicação direta e bidirecional via **WebSocket (Chrome DevTools Protocol - CDP)** sem camada HTTP intermediária. |
| **Velocidade e Estabilidade (Auto-wait)** | Mais lento devido ao overhead de requisições HTTP por comando; exige configuração manual de `Explicit Waits` (`WebDriverWait`), sendo mais suscetível a *flaky tests*. | Rápido para interações de DOM local, possui *auto-waiting* nativo, mas sofre limitações em múltiplas abas/origens. | **Altíssima velocidade e determinismo**. Possui *auto-wait* nativo inteligente (verifica visibilidade, estabilidade da animação e recebimento de eventos antes de clicar). |
| **Suporte Multi-Browser e Mobile Viewport** | Suporta Chrome, Firefox, Edge e Safari via drivers específicos, mas a emulação mobile é limitada. | Foco principal em Chromium e Firefox; suporte experimental ao WebKit (Safari). | Suporte nativo completo a **Chromium, WebKit (Safari) e Firefox**, além de **emulação fiel de viewports mobile** (essencial para projetos React Native Web/Expo). |
| **Interceptação de Rede e Monitoramento** | Limitado (introduzido parcialmente no Selenium 4 via BiDi). | Bom suporte via `cy.intercept()`, mas restrito ao escopo da aba ativa. | **Nativo e completo** via `page.route()`, `page.on('request')`, `page.on('response')` e captura de eventos de Console/Dialogs em nível de contexto de navegador. |
| **Integração com Agentes de IA (MCP / Subagents)** | Baixa integração nativa com agentes modernos. | Suporte moderado, difícil execução instrumental fora do runner próprio. | **Padrão ouro para IA Instrumental** (base do `@playwright/mcp` e de agentes de navegação que inspecionam a árvore de acessibilidade AOM/CDP em tempo real). |

### Decisão Técnica para o CapFlow: Por que escolhemos o Playwright?
O **CapFlow** é construído sobre **React Native / Expo SDK 54** com compilação para Web via `react-native-web`. Essa stack gera uma árvore DOM altamente dinâmica composta por `<div>` aninhadas, modais assíncronos e chamadas REST (`multipart/form-data` para upload de imagem de produto e `application/json` para movimentações). O **Playwright** foi escolhido por:
1. **Seletores semânticos resilientes (`getByLabel`, `getByRole`, `getByPlaceholder`, `getByText`)** que funcionam perfeitamente com as propriedades de acessibilidade do React Native Web;
2. **Interceptação de rede (`page.route`) e controle de diálogos nativos (`page.on('dialog')`)**, fundamentais porque o fluxo de cadastro do CapFlow dispara `window.alert()` nativo e encadeia requisições `POST /api/itens/` e `POST /api/movimentacoes/`;
3. **Sinergia com Testes Instrumentais por IA**, compartilhando a mesma engine de inspeção de DOM e árvore de acessibilidade utilizada por agentes autônomos.

---

## 2. Pesquisa: Testes Instrumentais com IA, Acessibilidade (WCAG 2.2) e Usabilidade (Nielsen)

### 2.1. Geração Estática de Código de Teste vs. Teste Instrumental com IA
- **Geração Estática de Testes por IA:** O modelo de linguagem (LLM) analisa apenas o código-fonte estático (ex.: lendo `ProductFormModal.js`) e escreve um arquivo `.spec.ts` supondo como a tela será renderizada. Embora útil, frequentemente falha ao lidar com comportamentos reais de runtime (como o modo como o `react-native-web` transpila `<TouchableOpacity>` para `<div tabindex="0">`, estados de loading, CORS ou alertas nativos).
- **Teste Instrumental com IA (Execução ao Vivo):** O agente de IA controla uma instância real do navegador em execução (`http://localhost:8081/`), interage com os elementos renderizados, lê a árvore DOM e a árvore de acessibilidade (*Accessibility Tree*) após cada ação, monitora o console JavaScript (`console.error`/`console.warn`) e valida os pacotes HTTP na aba *Network*. O agente **sente e observa o sistema vivo**, adaptando-se e diagnosticando falhas que só existem em tempo de execução.

### 2.2. Claude Code + Playwright MCP vs. Google Antigravity + Browser Subagent
- **Claude Code + Playwright MCP (Model Context Protocol):** Utiliza um servidor MCP (`@playwright/mcp`) que expõe ferramentas padronizadas (`browser_navigate`, `browser_click`, `browser_type`, `browser_snapshot`) para o agente de terminal. O diferencial é o uso de *accessibility snapshots* estruturados em vez de apenas pixels, permitindo ao LLM navegar com precisão cirúrgica pelos nós semânticos da página.
- **Google Antigravity + Browser Subagent / Execução Instrumental:** No ambiente **Google Antigravity**, o agente principal orquestra ferramentas de execução, terminal e inspeção de navegador ao vivo no mesmo fluxo de trabalho do repositório. Ele consegue subir o servidor (`npx expo start --web`), conectar-se à porta `8081`, extrair simultaneamente métricas de DOM, propriedades ARIA, logs de console e status HTTP da API, aplicar correções diretamente no código-fonte (`replace_file_content`) e revalidar o sistema em ciclo fechado (*closed-loop verification*).

### 2.3. Heurísticas de Usabilidade de Nielsen e Diretrizes WCAG 2.2 Aplicadas a Formulários
- **Heurísticas de Jakob Nielsen em Formulários (Cadastro de Produto):**
  - *#1 Visibilidade do Status do Sistema:* O usuário deve saber claramente se o cadastro está sendo enviado (`Salvando...`) e receber confirmação clara ao concluir.
  - *#5 Prevenção de Erros:* O sistema deve impedir entradas impossíveis no domínio de estoque (como **quantidades iniciais negativas** ou estoques mínimos negativos) antes mesmo de enviar a requisição à API.
  - *#9 Ajudar os Usuários a Reconhecer, Diagnosticar e Recuperar-se de Erros:* Mensagens de erro devem aparecer próximas ao campo inválido, em linguagem natural e indicando exatamente como corrigir.
- **Diretrizes WCAG 2.2 (Web Content Accessibility Guidelines):**
  - *Critério 1.3.1 (Info and Relationships) & 3.3.2 (Labels or Instructions - Nível A):* Todo `<input>` deve possuir um rótulo programaticamente associado (`aria-label`, `aria-labelledby` ou `<label for="...">`).
  - *Critério 4.1.2 (Name, Role, Value - Nível A):* Todo componente interativo customizado (como botões de fechar modal `×` ou seletores dropdown construídos com `<div>`) deve expor seu papel semântico (`role="button"` ou `<button>`), nome acessível (`aria-label`) e estado (`aria-expanded`).
  - *Critério 1.4.3 (Contrast Minimum - Nível AA):* Textos e placeholders informativos devem apresentar contraste adequado para leitura sem esforço visual.

---

## 3. Prática 1: Configuração do Playwright e Suíte de Testes E2E (Passo 4)

### 3.1. Configuração do Ambiente
O Playwright foi instalado no projeto `capflow-mobile` (`npm install -D @playwright/test`) e configurado no arquivo `playwright.config.js` apontando `baseURL` para `http://localhost:8081` em modo headless:

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 3.2. Cenários BDD / Gherkin Implementados em `tests/e2e/cadastro-produto.spec.ts`

1. **Cenário 1 (Caminho Feliz):**
   - **Dado** que realizo login como gestor e estou na tela de Cadastro de Produto (`+ Novo Produto`),
   - **Quando** preencho todos os campos obrigatórios com dados válidos (`Boné Snapback Aba Reta Premium`, quantidade `50`, unidade `UN`, estoque mínimo `10` e setor `Almoxarifado de Bonés`) e clico em `Salvar no Estoque`,
   - **Então** o produto é cadastrado com sucesso (`HTTP 201`) e exibido imediatamente na listagem de inventário.
2. **Cenário 2 (Validação de Regra / Campos Obrigatórios Vazios):**
   - **Dado** que estou na tela de Cadastro de Produto,
   - **Quando** tento submeter o formulário clicando em `Salvar no Estoque` com os campos obrigatórios vazios,
   - **Então** o sistema impede o cadastro, mantém o modal aberto e exibe as mensagens `"O nome do produto é obrigatório"`, `"Defina a quantidade inicial"`, `"Defina o estoque mínimo de segurança"` e `"Selecione o setor ou sub-setor de destino"`.
3. **Cenário 3 (Prevenção de Erro / Bloqueio de Quantidades Negativas — Adicionado após Auditoria):**
   - **Dado** que estou na tela de Cadastro de Produto,
   - **Quando** preencho o nome do produto, mas insiro uma quantidade negativa (`-15`) e estoque mínimo negativo (`-5`) e clico em `Salvar no Estoque`,
   - **Então** o sistema impede o envio e exibe as mensagens de validação `"A quantidade inicial deve ser um número igual ou maior que zero"` e `"O estoque mínimo deve ser um número igual ou maior que zero"`.

### 3.3. Saída Completa da Execução Headless no Terminal

```text
$ npx playwright test

Running 3 tests using 1 worker

  ✓  1 [chromium] › tests/e2e/cadastro-produto.spec.ts:135:3 › Funcionalidade: Cadastro de Produto no Inventário CapFlow › Cenário 1 (Caminho Feliz): Deve cadastrar um novo produto com dados válidos e exibi-lo na listagem (2.0s)
  ✓  2 [chromium] › tests/e2e/cadastro-produto.spec.ts:165:3 › Funcionalidade: Cadastro de Produto no Inventário CapFlow › Cenário 2 (Validação de Regra / Erro): Deve impedir o cadastro com campos obrigatórios vazios e exibir mensagens de erro (1.1s)
  ✓  3 [chromium] › tests/e2e/cadastro-produto.spec.ts:194:3 › Funcionalidade: Cadastro de Produto no Inventário CapFlow › Cenário 3 (Prevenção de Erro): Deve bloquear o cadastro com quantidade ou estoque mínimo negativos (1.5s)

  3 passed (5.6s)
```

---

## 4. Prática 2: Teste Instrumental ao Vivo com o Agente (Passo 5)

### 4.1. Prompt Utilizado para o Teste Instrumental
> *"Abra `http://localhost:8081/` ao vivo, realize o login de gestor, navegue até a aba Inventário e abra o modal de Cadastro de Produto (`+ Novo Produto`). Inspecione o DOM e a árvore de acessibilidade dos inputs e botões, teste submeter um cadastro inválido (campos vazios e quantidade negativa `-15`) e depois um cadastro válido (`Boné Dad Hat Algodão`), monitorando erros de console e respostas HTTP na aba Network. Gere um diagnóstico técnico detalhado com veredito final."*

### 4.2. Passo a Passo Executado e Evidências Coletadas (Network & Console)

1. **Navegação e Autenticação:**
   - O agente acessou `http://localhost:8081/`, localizou os campos `Usuário` e `Senha`, preencheu as credenciais de gestor e acionou `Acessar Dashboard`.
   - **Evidência de Rede (Autenticação e Carregamento Inicial):**
     - `POST http://127.0.0.1:8000/api/token/` ➔ **`Status 200 OK`**
     - `GET http://127.0.0.1:8000/api/me/` ➔ **`Status 200 OK`**
     - `GET http://localhost:8000/api/itens/` ➔ **`Status 200 OK`**
     - `GET http://localhost:8000/api/setores/` ➔ **`Status 200 OK`**
     - `GET http://localhost:8000/api/subsetores/` ➔ **`Status 200 OK`**
     - `GET http://localhost:8000/api/movimentacoes/` ➔ **`Status 200 OK`**
2. **Abertura do Modal e Teste de Submissão Inválida:**
   - Ao clicar em `Inventário` ➔ `+ Novo Produto`, o modal `Cadastrar Novo Produto` foi aberto.
   - Ao clicar em `Salvar no Estoque` sem preencher os campos, nenhuma requisição `POST` foi disparada na rede (economia de tráfego e bloqueio client-side eficaz), e os 4 textos de erro foram injetados no DOM.
   - Ao testar a quantidade negativa (`-15`) **antes da correção**, constatou-se que o validador original (`!form.quantidade?.toString().trim()`) aceitava números negativos como válidos porque a string `"-15"` não é vazia.
3. **Teste de Submissão Válida:**
   - Preenchido `Boné Dad Hat Algodão`, quantidade `30`, unidade `UN`, mínimo `5` e setor `Almoxarifado de Bonés`.
   - **Evidência de Rede (Persistência e Atualização):**
     - `POST http://localhost:8000/api/itens/` ➔ **`Status 201 Created`**
     - `POST http://localhost:8000/api/movimentacoes/` ➔ **`Status 201 Created`** (cria automaticamente a movimentação de `ENTRADA` inicial)
     - `GET http://localhost:8000/api/itens/` ➔ **`Status 200 OK`** (recarrega a lista exibindo o novo boné)
4. **Monitoramento do Console JavaScript:**
   - **Erros (`console.error`):** `0` erros durante toda a execução.
   - **Avisos (`console.warn`):** Capturados 2 avisos de depreciação de estilo do `react-native-web`:
     - `"shadow*" style props are deprecated. Use "boxShadow".`
     - `props.pointerEvents is deprecated. Use style.pointerEvents`

### 4.3. Análise Crítica: Script E2E Tradicional vs. IA Instrumental ao Vivo

| Dimensão | Script E2E Automatizado (`cadastro-produto.spec.ts`) | Teste Instrumental com IA ao Vivo |
| :--- | :--- | :--- |
| **Determinismo e Regressão (CI/CD)** | **Superior:** Executa os 3 cenários em ~5 segundos de forma 100% repetível a cada commit. | Mais lento e exploratório; ideal para diagnóstico e descoberta, não para rodar milhares de vezes em pipeline. |
| **Descoberta de Bugs de Regra de Negócio e UX** | Só valida o que o desenvolvedor lembrou de programar nas asserções (`expect`). | **Superior:** Ao explorar o formulário com valores de borda (`-15`) e inspecionar o DOM real, descobriu que o `TextInput` com `keyboardType="numeric"` no React Native Web permite digitar sinal negativo `-` e que faltava validação `Number(qtd) < 0`. |
| **Inspeção Semântica (WCAG / DOM Real)** | Não enxerga a falta de `role="button"` se o teste usar seletores de texto (`getByText`). | **Superior:** Inspecionou os nós HTML gerados pelo `react-native-web` e revelou que todos os `<TouchableOpacity>` eram `<div>` genéricas sem `role="button"` e que os `<input>` não tinham `aria-label`. |

**Conclusão da Análise:** As duas abordagens são **complementares**. A IA Instrumental atua como um engenheiro de QA exploratório que descobre falhas ocultas de acessibilidade, rede e regras de negócio no navegador real, enquanto o script Playwright E2E cristaliza essas descobertas em testes de regressão permanentes.

---

## 5. Prática 3: Auditoria de Acessibilidade (WCAG 2.2) e Usabilidade (Nielsen) + Comparativo Antes × Depois (Passo 6)

### 5.1. Problemas Identificados na Auditoria Inicial

1. **[WCAG 2.2 — Critério 1.3.1 Info and Relationships & 3.3.2 Labels or Instructions (Nível A)]:**
   - **Onde:** `src/components/manager/ProductFormModal.js` (Linhas 80–137).
   - **Diagnóstico:** Os 4 campos `<TextInput>` (`Nome do Produto`, `Quantidade Real`, `Unidade`, `Estoque Mínimo de Segurança`) eram renderizados no DOM como `<input type="text">` com `aria-label: null` e `aria-labelledby: null`. Como o React Native Web renderiza `<Text>` como `<div>` (e não `<label>`), leitores de tela (NVDA/VoiceOver) não conseguiam associar o título do campo ao input.
2. **[WCAG 2.2 — Critério 4.1.2 Name, Role, Value (Nível A)]:**
   - **Onde:** `src/components/manager/ProductFormModal.js` (Linhas 73–75, 141–150, 291–311).
   - **Diagnóstico:** Os botões construídos com `<TouchableOpacity>` (fechar modal `×`, seletor dropdown de setor, caixa de upload de imagem e botão `Salvar no Estoque`) não possuíam `accessibilityRole="button"` nem `accessibilityLabel`. No DOM Web, eram renderizados como `<div tabindex="0">` sem `role="button"`, sendo o botão `×` anunciado apenas como símbolo `"vezes"` sem contexto de fechar o modal.
3. **[Usabilidade — Heurística #5 de Nielsen (Prevenção de Erros)]:**
   - **Onde:** `src/components/manager/ProductFormModal.js` (Linhas 23–36).
   - **Diagnóstico:** A função `validarEEnviar()` verificava apenas se os campos `quantidade` e `minimo` não estavam em branco (`!form.quantidade?.toString().trim()`). Valores negativos (ex.: `-15`) ou caracteres não numéricos passavam pela validação do frontend.

---

### 5.2. Comparativo ANTES × DEPOIS das Correções Aplicadas em `src/components/manager/ProductFormModal.js`

#### Correção 1: Prevenção de Erros em Quantidades Negativas/Inválidas (Heurística #5 de Nielsen)

**🔴 ANTES (`src/components/manager/ProductFormModal.js`, linhas 23–30):**
```javascript
  const validarEEnviar = () => {
    const novosErros = {};

    if (!form.nome?.trim()) novosErros.nome = 'O nome do produto é obrigatório';
    if (!form.quantidade?.toString().trim()) novosErros.quantidade = 'Defina a quantidade inicial';
    if (!form.minimo?.toString().trim()) novosErros.minimo = 'Defina o estoque mínimo de segurança';
    if (!form.setorId) novosErros.setorId = 'Selecione o setor ou sub-setor de destino';
```

**🟢 DEPOIS (`src/components/manager/ProductFormModal.js`, linhas 23–47):**
```javascript
  const validarEEnviar = () => {
    const novosErros = {};

    if (!form.nome?.trim()) {
      novosErros.nome = 'O nome do produto é obrigatório';
    }

    const qtdStr = form.quantidade?.toString().trim();
    if (!qtdStr) {
      novosErros.quantidade = 'Defina a quantidade inicial';
    } else if (isNaN(Number(qtdStr)) || Number(qtdStr) < 0) {
      novosErros.quantidade = 'A quantidade inicial deve ser um número igual ou maior que zero';
    }

    const minStr = form.minimo?.toString().trim();
    if (!minStr) {
      novosErros.minimo = 'Defina o estoque mínimo de segurança';
    } else if (isNaN(Number(minStr)) || Number(minStr) < 0) {
      novosErros.minimo = 'O estoque mínimo deve ser um número igual ou maior que zero';
    }

    if (!form.setorId) {
      novosErros.setorId = 'Selecione o setor ou sub-setor de destino';
    }
```

---

#### Correção 2: Semântica ARIA, Associação de Rótulos e Papéis de Botão (WCAG 2.2 — 1.3.1, 1.4.3 e 4.1.2)

**🔴 ANTES (`src/components/manager/ProductFormModal.js`, linhas 69–91 e 140–150):**
```jsx
        <View style={modernStyles.modalContainer}>
          
          <View style={modernStyles.modalHeader}>
            <Text style={modernStyles.modalTitle}>Cadastrar Novo Produto</Text>
            <TouchableOpacity style={modernStyles.modalCloseBtn} onPress={onClose} disabled={salvando}>
              <Text style={modernStyles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modernStyles.modalBody} showsVerticalScrollIndicator={false}>
            
            <Text style={modernStyles.formLabel}>Nome do Produto</Text>
            <TextInput
              style={[ modernStyles.formInput, focusedField === 'nome' && modernStyles.formInputFocus, erros.nome && modernStyles.formInputError ]}
              placeholder="Ex: estopa cinza"
              placeholderTextColor="#94A3B8"
              value={form.nome}
              onChangeText={(val) => handleInputChange('nome', val)}
              onFocus={() => setFocusedField('nome')}
              onBlur={() => setFocusedField(null)}
              editable={!salvando}
            />
            {erros.nome && <Text style={modernStyles.formError}>{erros.nome}</Text>}
```

**🟢 DEPOIS (`src/components/manager/ProductFormModal.js`, linhas 68–103 e 154–172):**
```jsx
        <View style={modernStyles.modalContainer} accessibilityRole="dialog" accessibilityLabel="Cadastrar Novo Produto">
          
          <View style={modernStyles.modalHeader}>
            <Text style={modernStyles.modalTitle}>Cadastrar Novo Produto</Text>
            <TouchableOpacity
              style={modernStyles.modalCloseBtn}
              onPress={onClose}
              disabled={salvando}
              accessibilityRole="button"
              accessibilityLabel="Fechar modal de cadastro de produto"
            >
              <Text style={modernStyles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modernStyles.modalBody} showsVerticalScrollIndicator={false}>
            
            <Text style={modernStyles.formLabel} nativeID="label-nome-produto">Nome do Produto</Text>
            <TextInput
              style={[ modernStyles.formInput, focusedField === 'nome' && modernStyles.formInputFocus, erros.nome && modernStyles.formInputError ]}
              placeholder="Ex: estopa cinza"
              placeholderTextColor="#64748B"
              value={form.nome}
              onChangeText={(val) => handleInputChange('nome', val)}
              onFocus={() => setFocusedField('nome')}
              onBlur={() => setFocusedField(null)}
              editable={!salvando}
              accessibilityLabel="Nome do Produto"
              accessibilityLabelledBy="label-nome-produto"
            />
            {erros.nome && <Text style={modernStyles.formError} accessibilityLiveRegion="polite">{erros.nome}</Text>}
```

*(O mesmo padrão `nativeID` + `accessibilityLabel` + `accessibilityLabelledBy` foi aplicado aos campos **Quantidade Real**, **Unidade de Medida** e **Estoque Mínimo de Segurança**, enquanto os botões de **Setor de Destino**, **Upload de Imagem** e **Salvar no Estoque** receberam `accessibilityRole="button"` e `accessibilityLabel` — o que fez o React Native Web passar a renderizar tags nativas `<button role="button" aria-label="...">` no DOM).*

---

### 5.3. Evidência da Revalidação Instrumental (DOM Antes × Depois)

Ao reexecutar a inspeção instrumental ao vivo no navegador após as correções, a árvore de acessibilidade do DOM confirmou a transformação completa dos elementos:

| Elemento no Modal | DOM Renderizado ANTES | DOM Renderizado DEPOIS |
| :--- | :--- | :--- |
| **Input Nome do Produto** | `<input placeholder="Ex: estopa cinza">` (`aria-label: null`) | `<input aria-label="Nome do Produto" aria-labelledby="label-nome-produto">` |
| **Input Quantidade Real** | `<input placeholder="0">` (`aria-label: null`) | `<input aria-label="Quantidade Real" aria-labelledby="label-quantidade-produto">` |
| **Input Estoque Mínimo** | `<input placeholder="Ex: 5">` (`aria-label: null`) | `<input aria-label="Estoque Mínimo de Segurança" aria-labelledby="label-minimo-produto">` |
| **Botão Fechar (`×`)** | `<div tabindex="0">×</div>` (`role: null`, `aria-label: null`) | `<button role="button" aria-label="Fechar modal de cadastro de produto">×</button>` |
| **Seletor de Setor** | `<div tabindex="0">Selecione um setor...▼</div>` (`role: null`) | `<button role="button" aria-expanded="false" aria-label="Selecionar Setor de Destino...">` |
| **Botão Salvar** | `<div tabindex="0">Salvar no Estoque</div>` (`role: null`) | `<button role="button" aria-label="Salvar no Estoque">Salvar no Estoque</button>` |
| **Submissão com `-15`** | Aceitava o valor negativo e enviava `POST /api/itens/` | **Bloqueado no cliente** com alerta `aria-live="polite"`: *"A quantidade inicial deve ser um número igual ou maior que zero"* |
