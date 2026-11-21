import { test, expect } from '@playwright/test';

/**
 * Suíte de Testes E2E - Fluxo de Cadastro de Produto (CapFlow)
 * Rastreamento BDD / Gherkin para o Projeto 03 de Testes de Software
 */
test.describe('Funcionalidade: Cadastro de Produto no Inventário CapFlow', () => {
  // Estado mockado da API para garantir determinismo e isolamento na camada E2E de Frontend
  let mockItens = [
    {
      id: 1,
      nome: 'Boné Trucker Clássico',
      quantidade_atual: 25,
      unidade_medida: 'UN',
      estoque_minimo: 10,
      setor: 1,
      setor_nome: 'Almoxarifado de Bonés',
    },
  ];

  const mockSetores = [
    { id: 1, nome: 'Almoxarifado de Bonés', responsaveis: [] },
    { id: 2, nome: 'Acabamento e Costura', responsaveis: [] },
  ];

  test.beforeEach(async ({ page }) => {
    // Intercepta chamadas de API para permitir autenticação e persistência em memória durante o teste E2E
    await page.route('**/api/token/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-e2e-jwt-token-capflow' }),
      });
    });

    await page.route('**/api/me/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'gestor.capflow',
          empresa: 'CapFlow Indústria',
          cargo: 'GERENTE',
        }),
      });
    });

    await page.route('**/api/setores/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSetores),
      });
    });

    await page.route('**/api/subsetores/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/funcionarios/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/movimentacoes/', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 999, status: 'registrado' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.route('**/api/itens/', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockItens),
        });
      } else if (route.request().method() === 'POST') {
        const novoItem = {
          id: mockItens.length + 1,
          nome: 'Boné Snapback Aba Reta Premium',
          quantidade_atual: 50,
          unidade_medida: 'UN',
          estoque_minimo: 10,
          setor: 1,
          setor_nome: 'Almoxarifado de Bonés',
        };
        mockItens.push(novoItem);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(novoItem),
        });
      }
    });

    // Aceita diálogos nativos (window.alert) automaticamente
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // 1. Acessa a aplicação e realiza o login caso esteja na tela de autenticação
    await page.goto('/');
    await expect(page.getByText('Entrar no console')).toBeVisible();

    await page.getByPlaceholder('Usuário').fill('gestor.capflow');
    await page.getByPlaceholder('Senha').fill('senhaSegura123');
    await page.getByText('Acessar Dashboard').click();

    // 2. Navega para a aba "Inventário" e abre o modal de Cadastro de Produto
    await expect(page.getByText('Inventário').first()).toBeVisible();
    await page.getByText('Inventário').first().click();

    await expect(page.getByText('+ Novo Produto')).toBeVisible();
    await page.getByText('+ Novo Produto').click();

    await expect(page.getByText('Cadastrar Novo Produto')).toBeVisible();
  });

  /**
   * Cenário 1 (Caminho Feliz):
   * Dado que estou na tela de Cadastro de Produto,
   * Quando preencho todos os campos obrigatórios com dados válidos (nome do modelo de boné, quantidade inicial positiva, unidade, estoque mínimo e setor) e clico em salvar,
   * Então o produto deve ser cadastrado com sucesso e exibido na listagem.
   */
  test('Cenário 1 (Caminho Feliz): Deve cadastrar um novo produto com dados válidos e exibi-lo na listagem', async ({ page }) => {
    // Preenche o Nome do Produto / Modelo de Boné
    await page.getByPlaceholder('Ex: estopa cinza').fill('Boné Snapback Aba Reta Premium');

    // Preenche a Quantidade Real inicial positiva
    await page.getByPlaceholder('0').fill('50');

    // Preenche a Unidade
    await page.getByPlaceholder('UN').fill('UN');

    // Preenche o Estoque Mínimo de Segurança
    await page.getByPlaceholder('Ex: 5').fill('10');

    // Seleciona o Setor/Categoria de Destino
    await page.getByText('Selecione um setor...').click();
    await page.getByText('Almoxarifado de Bonés').last().click();

    // Submete o formulário clicando em Salvar no Estoque
    await page.getByText('Salvar no Estoque').click();

    // Verifica que o modal fechou e que o novo produto aparece na listagem do inventário
    await expect(page.getByText('Boné Snapback Aba Reta Premium')).toBeVisible();
  });

  /**
   * Cenário 2 (Validação de Regra / Erro):
   * Dado que estou na tela de Cadastro de Produto,
   * Quando tento submeter o formulário com campos obrigatórios vazios,
   * Então o sistema deve impedir o cadastro e exibir mensagens claras de validação.
   */
  test('Cenário 2 (Validação de Regra / Erro): Deve impedir o cadastro com campos obrigatórios vazios e exibir mensagens de erro', async ({ page }) => {
    // Limpa o valor padrão da unidade e tenta salvar com todos os campos obrigatórios em branco
    await page.getByText('Salvar no Estoque').click();

    // Verifica que o modal permanece aberto e exibe as mensagens de validação de cada campo obrigatório
    await expect(page.getByText('O nome do produto é obrigatório')).toBeVisible();
    await expect(page.getByText('Defina a quantidade inicial')).toBeVisible();
    await expect(page.getByText('Defina o estoque mínimo de segurança')).toBeVisible();
    await expect(page.getByText('Selecione o setor ou sub-setor de destino')).toBeVisible();

    // Garante que o modal não foi fechado indevidamente
    await expect(page.getByText('Cadastrar Novo Produto')).toBeVisible();
  });

  /**
   * Cenário 3 (Validação de Regra de Negócio / Quantidade Negativa):
   * Dado que estou na tela de Cadastro de Produto,
   * Quando preencho uma quantidade negativa (ex.: -15) ou estoque mínimo negativo (ex.: -5) e tento salvar,
   * Então o sistema deve bloquear o envio e exibir mensagens claras de prevenção de erro.
   */
  test('Cenário 3 (Prevenção de Erro): Deve bloquear o cadastro com quantidade ou estoque mínimo negativos', async ({ page }) => {
    await page.getByLabel('Nome do Produto').fill('Boné Teste Quantidade Negativa');
    await page.getByLabel('Quantidade Real').fill('-15');
    await page.getByLabel('Estoque Mínimo de Segurança').fill('-5');

    await page.getByRole('button', { name: 'Salvar no Estoque' }).click();

    await expect(
      page.getByText('A quantidade inicial deve ser um número igual ou maior que zero')
    ).toBeVisible();
    await expect(
      page.getByText('O estoque mínimo deve ser um número igual ou maior que zero')
    ).toBeVisible();
    await expect(page.getByText('Cadastrar Novo Produto')).toBeVisible();
  });
});
