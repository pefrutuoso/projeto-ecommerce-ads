/* =========================================================
   1. ELEMENTS AND CONSTANTS
   ========================================================= */

const URL_API = "https://fakestoreapi.com/products";

const gridProdutos = document.getElementById("grid-produtos");
const mensagemStatus = document.getElementById("mensagem-status");
const campoBusca = document.getElementById("campo-busca");

const btnTema = document.getElementById("btn-tema");
const body = document.body;

const btnCarrinho = document.getElementById("btn-carrinho");
const btnFecharCarrinho = document.getElementById("btn-fechar-carrinho");
const carrinho = document.getElementById("carrinho");
const listaCarrinho = document.getElementById("lista-carrinho");
const carrinhoVazio = document.getElementById("carrinho-vazio");
const contadorCarrinho = document.getElementById("contador-carrinho");
const valorTotal = document.getElementById("valor-total");
const btnFinalizar = document.getElementById("btn-finalizar");

const notificacao = document.getElementById("notificacao");

let produtosCarregados = [];
let carrinhoItens = [];


/* =========================================================
   2. HELPER FUNCTIONS
   ========================================================= */

/**
 * Formata um número para moeda brasileira.
 * @param {number} valor - Valor a ser formatado.
 * @returns {string} Valor no formato R$ 0,00.
 */
function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


/**
 * Exibe uma notificação visual temporária.
 * Substitui o uso de alert().
 * @param {string} texto - Mensagem exibida.
 * @param {boolean} ehErro - Define se a notificação é de erro.
 */
function exibirNotificacao(texto, ehErro = false) {
    notificacao.textContent = texto;

    notificacao.classList.add("notificacao--visivel");

    if (ehErro) {
        notificacao.classList.add("notificacao--erro");
    } else {
        notificacao.classList.remove("notificacao--erro");
    }

    setTimeout(function () {
        notificacao.classList.remove("notificacao--visivel");
    }, 2500);
}


/**
 * Exibe uma mensagem de status abaixo do título.
 * @param {string} texto - Mensagem exibida.
 * @param {boolean} ehErro - Define se é mensagem de erro.
 */
function exibirStatus(texto, ehErro = false) {
    mensagemStatus.textContent = texto;
    mensagemStatus.classList.toggle("mensagem-status--erro", ehErro);
}


/* =========================================================
   3. LOCALSTORAGE
   ========================================================= */

/**
 * Recupera o carrinho salvo no navegador.
 * @returns {Array} Lista de itens do carrinho.
 */
function recuperarCarrinhoSalvo() {
    const carrinhoSalvo = localStorage.getItem("carrinho");

    return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
}


/**
 * Salva o carrinho atual no navegador.
 */
function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinhoItens));
}


/**
 * Salva o tema escolhido pelo usuário.
 */
function salvarTema() {
    const temaAtual = body.classList.contains("dark-mode")
        ? "escuro"
        : "claro";

    localStorage.setItem("tema", temaAtual);
}


/**
 * Aplica o tema salvo ao carregar a página.
 */
function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem("tema");

    if (temaSalvo === "escuro") {
        body.classList.add("dark-mode");
        btnTema.textContent = "☀️ Modo Claro";
    }
}


/* =========================================================
   4. DARK MODE
   ========================================================= */

btnTema.addEventListener("click", function () {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        btnTema.textContent = "☀️ Modo Claro";
    } else {
        btnTema.textContent = "🌙 Modo Escuro";
    }

    salvarTema();
});


/* =========================================================
   5. FAKE STORE API
   ========================================================= */

/**
 * Busca os produtos na Fake Store API e renderiza na página.
 */
async function carregarProdutos() {
    try {
        const resposta = await fetch(URL_API);

        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status}`);
        }

        produtosCarregados = await resposta.json();

        gridProdutos.innerHTML = "";

        produtosCarregados.forEach(function (produto) {
            gridProdutos.appendChild(criarCardProduto(produto));
        });

        exibirStatus(`${produtosCarregados.length} produtos carregados.`);

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);

        exibirStatus(
            "Não foi possível carregar os produtos. Verifique sua conexão.",
            true
        );
    }
}


/**
 * Cria o card visual de um produto.
 * @param {Object} produto - Produto retornado pela API.
 * @returns {HTMLElement} Elemento article do produto.
 */
function criarCardProduto(produto) {
    const artigo = document.createElement("article");
    artigo.className = "produto";

    const imagem = document.createElement("img");
    imagem.src = produto.image;
    imagem.alt = produto.title;
    imagem.loading = "lazy";

    const info = document.createElement("div");
    info.className = "produto-info";

    const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

    const categoria = document.createElement("p");
    categoria.textContent = produto.category;

    const preco = document.createElement("span");
    preco.className = "preco";
    preco.textContent = formatarPreco(produto.price);

    const botaoComprar = document.createElement("button");
    botaoComprar.className = "btn-comprar";
    botaoComprar.textContent = "Adicionar ao carrinho";
    botaoComprar.setAttribute("aria-label", `Adicionar ${produto.title} ao carrinho`);

    botaoComprar.addEventListener("click", function () {
        adicionarAoCarrinho(produto);
    });

    info.append(titulo, categoria, preco, botaoComprar);
    artigo.append(imagem, info);

    return artigo;
}


/* =========================================================
   6. SEARCH FILTER
   ========================================================= */

campoBusca.addEventListener("input", function () {
    const textoBuscado = campoBusca.value.trim().toLowerCase();

    let produtosVisiveis = 0;

    document.querySelectorAll(".produto").forEach(function (produto) {
        const nomeProduto = produto
            .querySelector("h3")
            .textContent
            .toLowerCase();

        const corresponde = nomeProduto.includes(textoBuscado);

        produto.style.display = corresponde ? "flex" : "none";

        if (corresponde) {
            produtosVisiveis++;
        }
    });

    if (produtosVisiveis === 0) {
        exibirStatus("Nenhum produto encontrado para a busca.");
    } else if (textoBuscado === "") {
        exibirStatus(`${produtosCarregados.length} produtos carregados.`);
    } else {
        exibirStatus(`${produtosVisiveis} produto(s) encontrado(s).`);
    }
});


/* =========================================================
   7. SHOPPING CART
   ========================================================= */

/**
 * Adiciona um produto ao carrinho ou aumenta sua quantidade.
 * @param {Object} produto - Produto selecionado.
 */
function adicionarAoCarrinho(produto) {
    const itemExistente = carrinhoItens.find(function (item) {
        return item.id === produto.id;
    });

    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinhoItens.push({
            id: produto.id,
            titulo: produto.title,
            preco: produto.price,
            imagem: produto.image,
            quantidade: 1
        });
    }

    salvarCarrinho();
    atualizarCarrinho();

    exibirNotificacao("Produto adicionado ao carrinho!");
}


/**
 * Altera a quantidade de um item do carrinho.
 * @param {number} id - ID do produto.
 * @param {number} delta - 1 para aumentar ou -1 para diminuir.
 */
function alterarQuantidade(id, delta) {
    const item = carrinhoItens.find(function (item) {
        return item.id === id;
    });

    if (!item) return;

    item.quantidade += delta;

    if (item.quantidade <= 0) {
        removerDoCarrinho(id);
        return;
    }

    salvarCarrinho();
    atualizarCarrinho();
}


/**
 * Remove um item do carrinho.
 * @param {number} id - ID do produto.
 */
function removerDoCarrinho(id) {
    carrinhoItens = carrinhoItens.filter(function (item) {
        return item.id !== id;
    });

    salvarCarrinho();
    atualizarCarrinho();

    exibirNotificacao("Produto removido do carrinho.");
}


/**
 * Calcula o valor total do carrinho.
 * @returns {number} Valor total.
 */
function calcularValorTotal() {
    return carrinhoItens.reduce(function (total, item) {
        return total + item.preco * item.quantidade;
    }, 0);
}


/**
 * Calcula a quantidade total de produtos no carrinho.
 * @returns {number} Quantidade total.
 */
function calcularQuantidadeTotal() {
    return carrinhoItens.reduce(function (total, item) {
        return total + item.quantidade;
    }, 0);
}


/**
 * Cria o item visual do carrinho.
 * @param {Object} item - Item do carrinho.
 * @returns {HTMLElement} Elemento li do carrinho.
 */
function criarItemCarrinho(item) {
    const li = document.createElement("li");
    li.className = "item-carrinho";

    const imagem = document.createElement("img");
    imagem.src = item.imagem;
    imagem.alt = item.titulo;

    const info = document.createElement("div");
    info.className = "item-carrinho-info";

    const nome = document.createElement("p");
    nome.className = "item-carrinho-nome";
    nome.textContent = item.titulo;

    const preco = document.createElement("p");
    preco.className = "item-carrinho-preco";
    preco.textContent = `${formatarPreco(item.preco)} x ${item.quantidade}`;

    info.append(nome, preco);

    const controles = document.createElement("div");
    controles.className = "item-carrinho-controles";

    const botaoDiminuir = document.createElement("button");
    botaoDiminuir.textContent = "-";
    botaoDiminuir.setAttribute("aria-label", "Diminuir quantidade");

    const quantidade = document.createElement("span");
    quantidade.textContent = item.quantidade;

    const botaoAumentar = document.createElement("button");
    botaoAumentar.textContent = "+";
    botaoAumentar.setAttribute("aria-label", "Aumentar quantidade");

    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "🗑";
    botaoRemover.setAttribute("aria-label", "Remover produto do carrinho");

    botaoDiminuir.addEventListener("click", function () {
        alterarQuantidade(item.id, -1);
    });

    botaoAumentar.addEventListener("click", function () {
        alterarQuantidade(item.id, 1);
    });

    botaoRemover.addEventListener("click", function () {
        removerDoCarrinho(item.id);
    });

    controles.append(botaoDiminuir, quantidade, botaoAumentar, botaoRemover);
    li.append(imagem, info, controles);

    return li;
}


/**
 * Atualiza a interface do carrinho, contador e valor total.
 */
function atualizarCarrinho() {
    listaCarrinho.innerHTML = "";

    carrinhoItens.forEach(function (item) {
        listaCarrinho.appendChild(criarItemCarrinho(item));
    });

    const quantidadeTotal = calcularQuantidadeTotal();

    contadorCarrinho.textContent = quantidadeTotal;
    valorTotal.textContent = formatarPreco(calcularValorTotal());

    carrinhoVazio.hidden = quantidadeTotal > 0;
}


/**
 * Abre ou fecha o carrinho lateral.
 */
function alternarCarrinho() {
    const estaAberto = carrinho.classList.contains("carrinho--aberto");

    carrinho.classList.toggle("carrinho--aberto");
    carrinho.setAttribute("aria-hidden", estaAberto);
}


btnCarrinho.addEventListener("click", alternarCarrinho);
btnFecharCarrinho.addEventListener("click", alternarCarrinho);


btnFinalizar.addEventListener("click", function () {
    if (carrinhoItens.length === 0) {
        exibirNotificacao("Adicione produtos antes de finalizar.", true);
        return;
    }

    exibirNotificacao("Compra finalizada com sucesso!");

    carrinhoItens = [];
    salvarCarrinho();
    atualizarCarrinho();
    alternarCarrinho();
});


/* =========================================================
   8. INITIALIZATION
   ========================================================= */

aplicarTemaSalvo();
carrinhoItens = recuperarCarrinhoSalvo();
atualizarCarrinho();
carregarProdutos();