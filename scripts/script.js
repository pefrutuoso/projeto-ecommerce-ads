// =========================================================
// 1. CONSTANTES E ELEMENTOS
// =========================================================

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


// =========================================================
// 2. FUNÇÕES AUXILIARES
// =========================================================

function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function exibirNotificacao(texto, ehErro = false) {
    notificacao.textContent = texto;

    notificacao.classList.add("notificacao-visivel");

    if (ehErro) {
        notificacao.classList.add("notificacao-erro");
    } else {
        notificacao.classList.remove("notificacao-erro");
    }

    setTimeout(function () {
        notificacao.classList.remove("notificacao-visivel");
    }, 2500);
}


function exibirStatus(texto, ehErro = false) {
    mensagemStatus.textContent = texto;
    mensagemStatus.classList.toggle("status-erro", ehErro);
}


// =========================================================
// 3. LOCALSTORAGE
// =========================================================

function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinhoItens));
}


function recuperarCarrinho() {
    const carrinhoSalvo = localStorage.getItem("carrinho");

    return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
}


function salvarTema() {
    const temaAtual = body.classList.contains("dark-mode")
        ? "escuro"
        : "claro";

    localStorage.setItem("tema", temaAtual);
}


function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem("tema");

    if (temaSalvo === "escuro") {
        body.classList.add("dark-mode");
        btnTema.textContent = "☀️ Modo Claro";
    }
}


// =========================================================
// 4. TEMA CLARO E ESCURO
// =========================================================

btnTema.addEventListener("click", function () {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        btnTema.textContent = "☀️ Modo Claro";
    } else {
        btnTema.textContent = "🌙 Modo Escuro";
    }

    salvarTema();
});


// =========================================================
// 5. FAKE STORE API
// =========================================================

async function carregarProdutos() {
    try {
        const resposta = await fetch(URL_API);

        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status}`);
        }

        produtosCarregados = await resposta.json();

        gridProdutos.innerHTML = "";
        mensagemStatus.style.display = "none";

        produtosCarregados.forEach(function (produto) {
            gridProdutos.appendChild(criarCardProduto(produto));
        });

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);

        exibirStatus(
            "Não foi possível carregar os produtos. Verifique sua conexão.",
            true
        );
    }
}


function criarCardProduto(produto) {
    const artigo = document.createElement("article");
    artigo.className = "produto";
    artigo.dataset.id = produto.id;

    const imagem = document.createElement("img");
    imagem.src = produto.image;
    imagem.alt = produto.title;
    imagem.loading = "lazy";

    const info = document.createElement("div");
    info.className = "produto-info";

    const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

    const descricao = document.createElement("p");
    descricao.textContent = produto.description;

    const preco = document.createElement("span");
    preco.className = "preco";
    preco.textContent = formatarPreco(produto.price);

    const botaoComprar = document.createElement("button");
    botaoComprar.className = "btn-comprar";
    botaoComprar.textContent = "Adicionar ao carrinho";
    botaoComprar.setAttribute("aria-label", `Comprar ${produto.title}`);

    botaoComprar.addEventListener("click", function () {
        adicionarAoCarrinho(produto);
    });

    info.append(titulo, descricao, preco, botaoComprar);
    artigo.append(imagem, info);

    return artigo;
}


// =========================================================
// 6. BUSCA
// =========================================================

campoBusca.addEventListener("input", function () {
    const textoBuscado = campoBusca.value.trim().toLowerCase();

    let produtosVisiveis = 0;

    const produtos = document.querySelectorAll(".produto");

    produtos.forEach(function (produto) {
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
    } else {
        mensagemStatus.style.display = "none";
    }
});


// =========================================================
// 7. CARRINHO
// =========================================================

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


function removerDoCarrinho(id) {
    carrinhoItens = carrinhoItens.filter(function (item) {
        return item.id !== id;
    });

    salvarCarrinho();
    atualizarCarrinho();

    exibirNotificacao("Produto removido do carrinho.");
}


function calcularQuantidadeTotal() {
    return carrinhoItens.reduce(function (total, item) {
        return total + item.quantidade;
    }, 0);
}


function calcularValorTotal() {
    return carrinhoItens.reduce(function (total, item) {
        return total + item.preco * item.quantidade;
    }, 0);
}


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
    botaoRemover.setAttribute("aria-label", "Remover produto");

    botaoDiminuir.addEventListener("click", function () {
        alterarQuantidade(item.id, -1);
    });

    botaoAumentar.addEventListener("click", function () {
        alterarQuantidade(item.id, 1);
    });

    botaoRemover.addEventListener("click", function () {
        removerDoCarrinho(item.id);
    });

    controles.append(
        botaoDiminuir,
        quantidade,
        botaoAumentar,
        botaoRemover
    );

    li.append(imagem, info, controles);

    return li;
}


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


function alternarCarrinho() {
    const estaAberto = carrinho.classList.contains("carrinho-aberto");

    carrinho.classList.toggle("carrinho-aberto");
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


// =========================================================
// 8. INICIALIZAÇÃO
// =========================================================

carrinhoItens = recuperarCarrinho();
aplicarTemaSalvo();
atualizarCarrinho();
carregarProdutos();