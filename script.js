let personagens = []; 

let personagemSecreto = null;
let personagemOntem = null; 
let numeroDoDia = 0; 
let jogoJaComecou = false; 
let personagensChutados = []; 
let historicoEmojis = []; 
let modoAtual = 'classico'; 
let indiceSelecionado = -1;
let filtradosAtuais = [];

const telaInicial = document.getElementById('tela-inicial');
const areaJogo = document.getElementById('area-jogo');
const btnIniciar = document.getElementById('btn-iniciar');
const btnInfinito = document.getElementById('btn-infinito');
const logoHome = document.getElementById('logo-home');
const btnHomeExterno = document.getElementById('btn-home-externo');
const bannerModoInfinito = document.getElementById('banner-modo-infinito');
const areaBusca = document.getElementById('area-busca');
const inputPersonagem = document.getElementById('input-personagem');
const listaSugestoes = document.getElementById('lista-sugestoes');
const btnChutar = document.getElementById('btn-chutar');
const containerTabela = document.getElementById('container-tabela');
const corpoTabela = document.getElementById('corpo-tabela');
const indicadoresContainer = document.getElementById('indicadores-container');
const boxVitoria = document.getElementById('box-vitoria');
const imgVitoria = document.getElementById('img-vitoria');
const nomeVitoria = document.getElementById('nome-vitoria');
const resumoVitoria = document.getElementById('resumo-vitoria');
const blocoCronometro = document.getElementById('bloco-cronometro');
const vitoriaBotoesClassico = document.getElementById('vitoria-botoes-classico');
const btnVoltarInicioVitoria = document.getElementById('btn-voltar-inicio-vitoria');
const btnIrInfinitoVitoria = document.getElementById('btn-ir-infinito-vitoria');
const btnJogarNovamenteInfinito = document.getElementById('btn-jogar-novamente-infinito');
const cronometroEl = document.getElementById('cronometro'); 
const boxCompartilhar = document.getElementById('box-compartilhar');
const textoCompartilhar = document.getElementById('texto-compartilhar');
const gridEmojisEl = document.getElementById('grid-emojis');
const btnCopiar = document.getElementById('btn-copiar');
const boxOntem = document.getElementById('box-ontem');
const nomeOntemEl = document.getElementById('nome-ontem');

const btnAjuda = document.getElementById('btn-ajuda');
const modalAjuda = document.getElementById('modal-ajuda');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnEntenderModal = document.getElementById('btn-entender-modal');

async function iniciarSistema() {
    try {
        const resposta = await fetch('personagens.json');
        personagens = await resposta.json();
    } catch (erro) {
        console.error("Erro ao carregar o banco de dados:", erro);
        alert("Erro ao carregar os personagens. Certifique-se de usar a extensão Live Server!");
    }
}

iniciarSistema();

btnAjuda.addEventListener('click', () => {
    modalAjuda.classList.remove('escondido');
    setTimeout(() => {
        modalAjuda.classList.add('ativo');
    }, 10);
});

function fecharModalAjuda() {
    modalAjuda.classList.remove('ativo');
    setTimeout(() => {
        modalAjuda.classList.add('escondido');
    }, 350);
}

btnFecharModal.addEventListener('click', fecharModalAjuda);
btnEntenderModal.addEventListener('click', fecharModalAjuda);

modalAjuda.addEventListener('click', (e) => {
    if (e.target === modalAjuda) {
        fecharModalAjuda();
    }
});

function obterChaveDataHoje() {
    const hoje = new Date();
    return `${hoje.getUTCFullYear()}-${hoje.getUTCMonth() + 1}-${hoje.getUTCDate()}`;
}

function obterIndiceDoDia() {
    const hoje = new Date();
    const stringData = `${hoje.getUTCFullYear()}-${hoje.getUTCMonth() + 1}-${hoje.getUTCDate()}`;
    
    let hash = 0;
    for (let i = 0; i < stringData.length; i++) {
        hash = (hash << 5) - hash + stringData.charCodeAt(i);
        hash |= 0; 
    }
    return Math.abs(hash) % personagens.length;
}

function selecionarPersonagemDoModo(modo) {
    if (modo === 'classico') {
        const dataHoje = obterChaveDataHoje();
        const salvoData = localStorage.getItem('comicguess_data_secreto');

        if (salvoData !== dataHoje) {
            localStorage.setItem('comicguess_data_secreto', dataHoje);
            localStorage.removeItem('comicguess_chutes_' + dataHoje);
            localStorage.removeItem('comicguess_venceu_' + dataHoje);
        }

        if (personagens.length > 0) {
            const indiceDoDia = obterIndiceDoDia();
            personagemSecreto = personagens[indiceDoDia];

            let indiceOntem = (indiceDoDia - 1 + personagens.length) % personagens.length;
            personagemOntem = personagens[indiceOntem];
        }
        numeroDoDia = 1;
    } else {
        if (personagens.length > 0) {
            const indiceSorteado = Math.floor(Math.random() * personagens.length);
            personagemSecreto = personagens[indiceSorteado];
        }
    }
}

function iniciarJogo(modo) {
    if (personagens.length === 0) {
        alert("Os personagens ainda estão carregando. Aguarde um instante ou verifique o Live Server.");
        return;
    }

    modoAtual = modo;
    selecionarPersonagemDoModo(modo);
    
    jogoJaComecou = false;
    personagensChutados = [];
    historicoEmojis = [];
    corpoTabela.innerHTML = '';
    containerTabela.classList.add('escondido');
    indicadoresContainer.classList.add('escondido');
    boxVitoria.classList.add('escondido');
    boxCompartilhar.classList.add('escondido');
    boxOntem.classList.add('escondido');
    inputPersonagem.disabled = false;
    btnChutar.disabled = false;
    areaBusca.classList.remove('recolher-busca');
    areaBusca.classList.remove('escondido');
    inputPersonagem.value = '';
    indiceSelecionado = -1;
    filtradosAtuais = [];

    btnHomeExterno.classList.remove('invisivel');

    if (modoAtual === 'infinito') {
        blocoCronometro.classList.add('escondido');
        vitoriaBotoesClassico.classList.add('escondido');
        btnJogarNovamenteInfinito.classList.remove('escondido');
        bannerModoInfinito.classList.remove('escondido');
        btnAjuda.classList.add('invisivel'); 
    } else {
        blocoCronometro.classList.remove('escondido');
        vitoriaBotoesClassico.classList.remove('escondido');
        btnJogarNovamenteInfinito.classList.add('escondido');
        bannerModoInfinito.classList.add('escondido');
        btnAjuda.classList.remove('invisivel'); 

        const dataHoje = obterChaveDataHoje();
        const chutesSalvos = JSON.parse(localStorage.getItem('comicguess_chutes_' + dataHoje) || '[]');
        const venceuSalvo = localStorage.getItem('comicguess_venceu_' + dataHoje) === 'true';

        chutesSalvos.forEach(nomeChutado => {
            const pChutado = personagens.find(p => normalizarTexto(p.nome) === normalizarTexto(nomeChutado));
            if (pChutado && !personagensChutados.includes(pChutado.nome)) {
                personagensChutados.push(pChutado.nome);
                gerarLinhaEmoji(pChutado);
                if (!jogoJaComecou) {
                    containerTabela.classList.remove('escondido');
                    indicadoresContainer.classList.remove('escondido');
                    jogoJaComecou = true;
                }
                adicionarLinhaTabela(pChutado, true);
            }
        });

        if (venceuSalvo) {
            inputPersonagem.disabled = true;
            btnChutar.disabled = true;
            areaBusca.classList.add('recolher-busca');
            mostrarVitoria(true);
        }
    }

    telaInicial.classList.add('saindo-tela');
    setTimeout(() => {
        telaInicial.classList.add('escondido');
        areaJogo.classList.remove('escondido');
        areaJogo.classList.add('animar-entrada');

        const dataHoje = obterChaveDataHoje();
        const venceuSalvo = localStorage.getItem('comicguess_venceu_' + dataHoje) === 'true';
        if (modoAtual === 'classico' && venceuSalvo) {
            boxVitoria.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            inputPersonagem.focus(); 
        }
    }, 350);
}

btnIniciar.addEventListener('click', () => iniciarJogo('classico'));
btnInfinito.addEventListener('click', () => iniciarJogo('infinito'));

function reiniciarInfinitoSuave() {
    areaJogo.classList.add('saindo-jogo-suave');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
        areaJogo.classList.remove('saindo-jogo-suave');
        iniciarJogo('infinito');
    }, 350);
}

btnJogarNovamenteInfinito.addEventListener('click', reiniciarInfinitoSuave);

function voltarParaInicio() {
    areaJogo.classList.add('escondido');
    areaJogo.classList.remove('animar-entrada');
    
    jogoJaComecou = false;
    personagensChutados = [];
    historicoEmojis = [];
    corpoTabela.innerHTML = '';
    containerTabela.classList.add('escondido');
    indicadoresContainer.classList.add('escondido');
    boxVitoria.classList.add('escondido');
    boxCompartilhar.classList.add('escondido');
    boxOntem.classList.add('escondido');
    inputPersonagem.disabled = false;
    btnChutar.disabled = false;
    areaBusca.classList.remove('recolher-busca');
    areaBusca.classList.remove('escondido');
    bannerModoInfinito.classList.add('escondido');
    
    btnHomeExterno.classList.add('invisivel');
    btnAjuda.classList.add('invisivel');

    inputPersonagem.value = '';
    indiceSelecionado = -1;
    filtradosAtuais = [];
    fecharListaSuave();

    window.scrollTo({ top: 0, behavior: 'smooth' });

    telaInicial.classList.remove('escondido', 'saindo-tela');
    telaInicial.classList.add('animar-retorno');
    setTimeout(() => {
        telaInicial.classList.remove('animar-retorno');
    }, 400);
}

logoHome.addEventListener('click', voltarParaInicio);
btnHomeExterno.addEventListener('click', voltarParaInicio);
btnVoltarInicioVitoria.addEventListener('click', voltarParaInicio);

btnIrInfinitoVitoria.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        iniciarJogo('infinito');
    }, 300);
});

function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function fecharListaSuave() {
    indiceSelecionado = -1;
    if (!listaSugestoes.classList.contains('escondido') && !listaSugestoes.classList.contains('saindo-lista')) {
        listaSugestoes.classList.add('saindo-lista');
        setTimeout(() => {
            listaSugestoes.classList.add('escondido');
            listaSugestoes.classList.remove('saindo-lista');
            listaSugestoes.innerHTML = '';
        }, 150);
    }
}

inputPersonagem.addEventListener('input', () => {
    const textoDigitado = normalizarTexto(inputPersonagem.value.trim());
    indiceSelecionado = -1;

    if (textoDigitado.length === 0) {
        filtradosAtuais = [];
        fecharListaSuave();
        return;
    }

    filtradosAtuais = personagens.filter(p => 
        normalizarTexto(p.nome).startsWith(textoDigitado) && 
        !personagensChutados.includes(p.nome)
    );

    if (filtradosAtuais.length > 0) {
        const estavaInativa = listaSugestoes.classList.contains('escondido') || listaSugestoes.classList.contains('saindo-lista');
        
        let htmlContent = '';
        filtradosAtuais.forEach(p => {
            htmlContent += `<li><img src="${p.imagem}" class="img-sugestao" alt="${p.nome}"> ${p.nome}</li>`;
        });
        
        listaSugestoes.innerHTML = htmlContent;

        const itensLi = listaSugestoes.querySelectorAll('li');
        itensLi.forEach((li, index) => {
            li.addEventListener('click', () => {
                inputPersonagem.value = filtradosAtuais[index].nome; 
                fecharListaSuave();
                processarChute(); 
            });
        });

        if (estavaInativa) {
            listaSugestoes.classList.remove('escondido');
            listaSugestoes.classList.remove('saindo-lista');
            listaSugestoes.style.animation = 'none';
            listaSugestoes.offsetHeight; 
            listaSugestoes.style.animation = 'descerLista 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        }
    } else {
        fecharListaSuave();
    }
});

document.addEventListener('click', (e) => {
    if (!logoHome.contains(e.target) && !btnHomeExterno.contains(e.target) && !btnAjuda.contains(e.target) && !inputPersonagem.contains(e.target) && !listaSugestoes.contains(e.target)) {
        fecharListaSuave();
    }
});

inputPersonagem.addEventListener('keydown', (e) => {
    const itensLi = listaSugestoes.querySelectorAll('li');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (itensLi.length === 0) return;
        indiceSelecionado++;
        if (indiceSelecionado >= itensLi.length) {
            indiceSelecionado = 0; 
        }
        atualizarSelecaoVisual(itensLi);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (itensLi.length === 0) return;
        indiceSelecionado--;
        if (indiceSelecionado < 0) {
            indiceSelecionado = itensLi.length - 1; 
        }
        atualizarSelecaoVisual(itensLi);
    } else if (e.key === 'Enter') {
        e.preventDefault();

        if (indiceSelecionado >= 0 && indiceSelecionado < filtradosAtuais.length) {
            inputPersonagem.value = filtradosAtuais[indiceSelecionado].nome;
        } else if (filtradosAtuais.length > 0) {
            inputPersonagem.value = filtradosAtuais[0].nome;
        }

        fecharListaSuave();
        processarChute();
        indiceSelecionado = -1;
    }
});

function atualizarSelecaoVisual(itensLi) {
    itensLi.forEach((li, idx) => {
        if (idx === indiceSelecionado) {
            li.classList.add('sugestao-selecionada');
            li.scrollIntoView({ block: 'nearest' });
        } else {
            li.classList.remove('sugestao-selecionada');
        }
    });
}

btnChutar.addEventListener('click', () => {
    fecharListaSuave();
    processarChute();
});

function dispararAnimacaoEnvio() {
    const inputWrapper = document.querySelector('.input-wrapper');
    inputWrapper.classList.remove('animar-envio');
    inputWrapper.offsetWidth; 
    inputWrapper.classList.add('animar-envio');
}

function compararCampo(chuteVal, secretoVal) {
    if (chuteVal === secretoVal) return 'correto';
    
    const itensChute = chuteVal.toLowerCase().split(/,|\s+e\s+/).map(s => s.trim()).filter(Boolean);
    const itensSecreto = secretoVal.toLowerCase().split(/,|\s+e\s+/).map(s => s.trim()).filter(Boolean);
    
    const temIntersecao = itensChute.some(item => itensSecreto.includes(item));
    if (temIntersecao) return 'parcial';
    
    return 'errado';
}

function processarChute() {
    const nomeChutado = normalizarTexto(inputPersonagem.value.trim());
    if (!nomeChutado) return;

    dispararAnimacaoEnvio();

    const personagemChutado = personagens.find(p => normalizarTexto(p.nome) === nomeChutado);

    if (!personagemChutado) {
        alert("Personagem não encontrado! Selecione um nome da lista.");
        return;
    }

    if (personagensChutados.includes(personagemChutado.nome)) {
        alert(`Você já testou ${personagemChutado.nome}! Tente outro personagem.`);
        inputPersonagem.value = ""; 
        inputPersonagem.focus();
        return;
    }

    personagensChutados.push(personagemChutado.nome);
    gerarLinhaEmoji(personagemChutado); 

    if (modoAtual === 'classico') {
        const dataHoje = obterChaveDataHoje();
        localStorage.setItem('comicguess_chutes_' + dataHoje, JSON.stringify(personagensChutados));
        if (personagemChutado.nome === personagemSecreto.nome) {
            localStorage.setItem('comicguess_venceu_' + dataHoje, 'true');
        }
    }

    if (!jogoJaComecou) {
        containerTabela.classList.remove('escondido');
        indicadoresContainer.classList.add('escondido');
        jogoJaComecou = true;
    }

    adicionarLinhaTabela(personagemChutado, false);
    
    inputPersonagem.value = ""; 
    inputPersonagem.focus();

    if (personagemChutado.nome === personagemSecreto.nome) {
        inputPersonagem.disabled = true; 
        btnChutar.disabled = true;
        
        setTimeout(() => {
            areaBusca.classList.add('recolher-busca');
            mostrarVitoria(false);
        }, 3000); 
    }
}

function adicionarLinhaTabela(chute, carregamentoRapido) {
    const tr = document.createElement('tr');

    const classeAno = compararAno(chute.ano_estreia, personagemSecreto.ano_estreia);
    let htmlAno = `${chute.ano_estreia}`;
    if (classeAno === 'errado seta-cima') {
        htmlAno += `<br><span style="font-size:1.3rem;">⬆️</span>`;
    } else if (classeAno === 'errado seta-baixo') {
        htmlAno += `<br><span style="font-size:1.3rem;">⬇️</span>`;
    }

    const classesCores = [
        '', 
        chute.genero === personagemSecreto.genero ? 'correto' : 'errado',
        chute.alinhamento === personagemSecreto.alinhamento ? 'correto' : 'errado',
        chute.universo === personagemSecreto.universo ? 'correto' : 'errado',
        chute.especie === personagemSecreto.especie ? 'correto' : 'errado',
        chute.origem === personagemSecreto.origem ? 'correto' : 'errado',
        compararCampo(chute.habilidade, personagemSecreto.habilidade),
        compararCampo(chute.equipe, personagemSecreto.equipe),
        classeAno.includes('correto') ? 'correto' : 'errado' 
    ];

    const conteudos = [
        `<div class="celula-personagem">
            <img src="${chute.imagem}" class="img-personagem">
            <div class="nome-overlay">${chute.nome}</div>
        </div>`,
        `<div class="celula-interna">${chute.genero}</div>`,
        `<div class="celula-interna">${chute.alinhamento}</div>`,
        `<div class="celula-interna">${chute.universo}</div>`,
        `<div class="celula-interna">${chute.especie}</div>`,
        `<div class="celula-interna">${chute.origem}</div>`,
        `<div class="celula-interna">${chute.habilidade}</div>`,
        `<div class="celula-interna">${chute.equipe}</div>`,
        `<div class="celula-interna">${htmlAno}</div>`
    ];

    conteudos.forEach((conteudoHtml, index) => {
        const td = document.createElement('td');
        td.innerHTML = conteudoHtml;
        
        if (classesCores[index] !== '') {
            const listaClasses = classesCores[index].split(' ');
            listaClasses.forEach(cls => td.classList.add(cls));
        }
        
        if (!carregamentoRapido) {
            td.classList.add('celula-animada');
            td.style.animationDelay = `${index * 0.3}s`;
        }
        
        tr.appendChild(td);
    });

    corpoTabela.insertBefore(tr, corpoTabela.firstChild);
}

function compararAno(anoChutado, anoSecreto) {
    if (anoChutado === anoSecreto) return 'correto';
    if (anoChutado < anoSecreto) return 'errado seta-cima'; 
    return 'errado seta-baixo'; 
}

function gerarLinhaEmoji(chute) {
    const emjGenero = chute.genero === personagemSecreto.genero ? '🟩' : '🟥';
    const emjAlinhamento = chute.alinhamento === personagemSecreto.alinhamento ? '🟩' : '🟥';
    const emjUniverso = chute.universo === personagemSecreto.universo ? '🟩' : '🟥';
    const emjEspecie = chute.especie === personagemSecreto.especie ? '🟩' : '🟥';
    const emjOrigem = chute.origem === personagemSecreto.origem ? '🟩' : '🟥';
    
    const resHabilidade = compararCampo(chute.habilidade, personagemSecreto.habilidade);
    const emjHabilidade = resHabilidade === 'correto' ? '🟩' : (resHabilidade === 'parcial' ? '🟨' : '🟥');

    const resEquipe = compararCampo(chute.equipe, personagemSecreto.equipe);
    const emjEquipe = resEquipe === 'correto' ? '🟩' : (resEquipe === 'parcial' ? '🟨' : '🟥');
    
    let emjAno = '🟩';
    if (chute.ano_estreia < personagemSecreto.ano_estreia) emjAno = '⬆️';
    else if (chute.ano_estreia > personagemSecreto.ano_estreia) emjAno = '⬇️';

    historicoEmojis.push(`${emjGenero}${emjAlinhamento}${emjUniverso}${emjEspecie}${emjOrigem}${emjHabilidade}${emjEquipe}${emjAno}`);
}

function mostrarVitoria(carregamentoRapido) {
    imgVitoria.src = personagemSecreto.imagem;
    nomeVitoria.textContent = personagemSecreto.nome;
    resumoVitoria.textContent = personagemSecreto.resumo;
    boxVitoria.classList.remove('escondido');
    
    const numTentativas = personagensChutados.length;
    textoCompartilhar.innerHTML = `Eu encontrei o personagem do <b>#ComicGuess</b> no desafio diário na ${numTentativas}ª tentativa!`;
    gridEmojisEl.innerHTML = historicoEmojis.join('<br>'); 
    boxCompartilhar.classList.remove('escondido');

    if (modoAtual === 'classico') {
        nomeOntemEl.textContent = personagemOntem.nome;
        boxOntem.classList.remove('escondido');
    }

    if (!carregamentoRapido) {
        boxVitoria.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    if (modoAtual === 'classico') {
        iniciarCronometro();
    }
}

function iniciarCronometro() {
    setInterval(() => {
        const agora = new Date();
        const amanha = new Date(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate() + 1);
        const diferenca = amanha - agora;

        const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

        const h = String(horas).padStart(2, '0');
        const m = String(minutos).padStart(2, '0');
        const s = String(segundos).padStart(2, '0');

        cronometroEl.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

btnCopiar.addEventListener('click', () => {
    const numTentativas = personagensChutados.length;
    const textoParaCopiar = `Eu encontrei o personagem do #ComicGuess na ${numTentativas}ª tentativa!\n\n${historicoEmojis.join('\n')}\n\nJogue em: https://seusite.com`;
    
    navigator.clipboard.writeText(textoParaCopiar).then(() => {
        const textoOriginal = btnCopiar.innerHTML;
        btnCopiar.innerHTML = '✅ COPIADO COM SUCESSO!'; 
        
        setTimeout(() => {
            btnCopiar.innerHTML = textoOriginal;
        }, 2000);
    });
});