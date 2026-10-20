// 1. Alternar Tema (Modo Claro / Modo Escuro)
const btnTema = document.getElementById('btn-tema');

btnTema.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        btnTema.textContent = '☀️ Modo Claro';
    } else {
        btnTema.textContent = '🌙 Modo Escuro';
    }
});

// 2. Carrinho de Compras
const botoesComprar = document.querySelectorAll('.btn-comprar');
const contadorCarrinho = document.getElementById('contador-carrinho');

let quantidadeItens = 0;

botoesComprar.forEach(function(botao) {
    botao.addEventListener('click', function(evento) {
        quantidadeItens++;
        contadorCarrinho.textContent = quantidadeItens;
        
        const produtoPai = evento.target.parentElement;
        const nomeProduto = produtoPai.querySelector('h3').textContent;
        
        alert(`Sucesso! O item "${nomeProduto}" foi adicionado ao seu carrinho.`);
    });
});

// 3. Filtro de Busca em Tempo Real
const campoBusca = document.getElementById('campo-busca');
const todosProdutos = document.querySelectorAll('.produto');

// O evento 'input' é disparado toda vez que o usuário digita ou apaga algo
campoBusca.addEventListener('input', function() {
    
    // Converte o que foi digitado para letras minúsculas (facilita a comparação)
    const textoBuscado = campoBusca.value.toLowerCase();

    // Passa por cada produto da tela
    todosProdutos.forEach(function(produto) {
        // Pega o nome do produto (dentro da tag h3) e converte para minúsculo
        const nomeProduto = produto.querySelector('h3').textContent.toLowerCase();
        
        // Verifica se o nome do produto inclui o texto digitado na busca
        if (nomeProduto.includes(textoBuscado)) {
            // Se incluir, mostra o produto garantindo que o layout flex continue
            produto.style.display = 'flex'; 
        } else {
            // Se não incluir, oculta o produto
            produto.style.display = 'none'; 
        }
    });
});